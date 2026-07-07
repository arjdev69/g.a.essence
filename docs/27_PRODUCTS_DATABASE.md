# G.A Essencia

Schema Supabase/PostgreSQL para a secao de Produtos.

Produto: G.A Essencia
Objetivo: definir tabelas, constraints, indices, RLS e RPC atomica para produtos e movimentacoes de estoque.

# 27 - Products Database

## 1. Decisoes

- Produtos pertencem ao usuario autenticado.
- Produto + tamanho representa uma variacao de estoque.
- Nome e tamanho devem ser normalizados para evitar duplicidade logica.
- `current_stock` e mantido em `products` para leitura rapida.
- `stock_movements` e a fonte de auditoria.
- Produto nasce com `current_stock = 0`; estoque inicial entra por movimento `purchase`.
- `average_cost = null` representa custo pendente.
- Movimento e atualizacao de saldo devem ocorrer na mesma transacao.
- Toda movimentacao deve ser criada por RPC, nao por duas chamadas separadas do cliente.
- O MVP aceita uma unica forma de pagamento por venda.
- Pagamento dividido fica fora do MVP.
- Imagem usa apenas `image_url`; bucket/storage fica para task propria se upload for implementado.

## 2. Tabela products

```sql
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  size text not null,
  image_url text,
  internal_code text,
  category text,
  unit text not null default 'un',
  current_stock numeric(12, 3) not null default 0,
  minimum_stock numeric(12, 3) not null default 0,
  average_cost numeric(12, 2),
  sale_price numeric(12, 2),
  sale_price_open boolean not null default true,
  notes text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_stock_check check (current_stock >= 0),
  constraint products_stock_integer_check check (current_stock = trunc(current_stock)),
  constraint products_minimum_stock_check check (minimum_stock >= 0),
  constraint products_minimum_stock_integer_check check (minimum_stock = trunc(minimum_stock)),
  constraint products_average_cost_check check (average_cost is null or average_cost >= 0),
  constraint products_sale_price_state_check check (
    (
      sale_price_open = true
      and sale_price is null
    )
    or (
      sale_price_open = false
      and sale_price is not null
      and sale_price > 0
    )
  ),
  constraint products_status_check check (status in ('active', 'inactive'))
);
```

## 3. Tabela stock_movements

```sql
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id),
  type text not null,
  quantity numeric(12, 3) not null,
  stock_delta numeric(12, 3) not null,
  unit_cost numeric(12, 2),
  unit_sale_price numeric(12, 2),
  revenue_value numeric(12, 2) not null default 0,
  cost_value numeric(12, 2) not null default 0,
  gross_profit_value numeric(12, 2) not null default 0,
  payment_method text,
  receipt_status text,
  amount_received numeric(12, 2) not null default 0,
  notes text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stock_movements_type_check check (
    type in ('purchase', 'sale', 'internal_use', 'loss', 'adjustment')
  ),
  constraint stock_movements_quantity_check check (quantity > 0),
  constraint stock_movements_quantity_integer_check check (quantity = trunc(quantity)),
  constraint stock_movements_delta_check check (stock_delta <> 0),
  constraint stock_movements_delta_integer_check check (stock_delta = trunc(stock_delta)),
  constraint stock_movements_unit_cost_check check (unit_cost is null or unit_cost >= 0),
  constraint stock_movements_unit_sale_price_check check (
    unit_sale_price is null or unit_sale_price > 0
  ),
  constraint stock_movements_values_check check (
    revenue_value >= 0 and cost_value >= 0 and amount_received >= 0
  ),
  constraint stock_movements_payment_method_check check (
    payment_method is null or payment_method in ('pix', 'card', 'cash')
  ),
  constraint stock_movements_receipt_status_check check (
    receipt_status is null or receipt_status in ('received', 'pending', 'partial')
  ),
  constraint stock_movements_sale_payment_check check (
    (
      type = 'sale'
      and payment_method is not null
      and receipt_status is not null
      and unit_sale_price is not null
    )
    or (
      type <> 'sale'
      and payment_method is null
      and receipt_status is null
      and unit_sale_price is null
      and revenue_value = 0
      and amount_received = 0
    )
  ),
  constraint stock_movements_receipt_value_check check (
    (
      receipt_status = 'received'
      and amount_received = revenue_value
    )
    or (
      receipt_status = 'pending'
      and amount_received = 0
    )
    or (
      receipt_status = 'partial'
      and amount_received > 0
      and amount_received < revenue_value
    )
    or receipt_status is null
  )
);
```

## 4. Indices

```sql
create index if not exists idx_products_user_id on public.products(user_id);
create index if not exists idx_products_name on public.products(name);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_category on public.products(category);
create unique index if not exists idx_products_user_name_size_normalized_unique
on public.products (
  user_id,
  lower(regexp_replace(trim(name), '\s+', ' ', 'g')),
  lower(regexp_replace(trim(size), '\s+', '', 'g'))
);

create index if not exists idx_stock_movements_user_id on public.stock_movements(user_id);
create index if not exists idx_stock_movements_product_id on public.stock_movements(product_id);
create index if not exists idx_stock_movements_type on public.stock_movements(type);
create index if not exists idx_stock_movements_occurred_at on public.stock_movements(occurred_at);
create index if not exists idx_stock_movements_created_at on public.stock_movements(created_at);
```

## 5. updated_at

Reusar `public.set_updated_at()` ja existente no projeto.

```sql
drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists set_stock_movements_updated_at on public.stock_movements;
create trigger set_stock_movements_updated_at
before update on public.stock_movements
for each row
execute function public.set_updated_at();
```

## 6. RLS

```sql
alter table public.products enable row level security;
alter table public.stock_movements enable row level security;
```

Policies para `products`:

```sql
create policy "select own products"
on public.products for select
using (auth.uid() = user_id);

create policy "insert own products"
on public.products for insert
with check (auth.uid() = user_id);

create policy "update own products"
on public.products for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

Policies para `stock_movements`:

```sql
create policy "select own stock movements"
on public.stock_movements for select
using (auth.uid() = user_id);
```

Insercao de movimento deve ocorrer pela RPC `create_stock_movement`.
A UI nao deve oferecer delete fisico para `products` ou `stock_movements`.

## 7. RPC create_stock_movement

Contrato:

```sql
create or replace function public.create_stock_movement(
  input_product_id uuid,
  input_type text,
  input_quantity numeric,
  input_adjustment_delta numeric default null,
  input_unit_cost numeric default null,
  input_unit_sale_price numeric default null,
  input_payment_method text default null,
  input_receipt_status text default null,
  input_amount_received numeric default 0,
  input_occurred_at timestamptz default null,
  input_notes text default null
)
returns public.stock_movements
language plpgsql
security definer
set search_path = public
as $$
declare
  product_row public.products%rowtype;
  movement_row public.stock_movements%rowtype;
  current_user_id uuid := auth.uid();
  movement_quantity numeric;
  movement_delta numeric;
  movement_unit_cost numeric;
  movement_revenue numeric := 0;
  movement_cost numeric := 0;
  movement_profit numeric := 0;
  next_stock numeric;
  next_average_cost numeric;
begin
  if current_user_id is null then
    raise exception 'Usuario autenticado nao encontrado.';
  end if;

  if input_quantity <= 0 or input_quantity <> trunc(input_quantity) then
    raise exception 'A quantidade deve ser um inteiro maior que zero.';
  end if;

  select *
    into product_row
    from public.products
   where id = input_product_id
     and user_id = current_user_id
   for update;

  if not found then
    raise exception 'Produto nao encontrado.';
  end if;

  if product_row.status <> 'active' then
    raise exception 'Produto inativo nao pode receber movimentacao.';
  end if;

  movement_quantity := input_quantity;

  if input_type = 'purchase' then
    movement_delta := input_quantity;
  elsif input_type in ('sale', 'internal_use', 'loss') then
    movement_delta := -input_quantity;
  elsif input_type = 'adjustment' then
    if (
      input_adjustment_delta is null
      or input_adjustment_delta = 0
      or input_adjustment_delta <> trunc(input_adjustment_delta)
    ) then
      raise exception 'Ajuste precisa de stock_delta inteiro diferente de zero.';
    end if;

    movement_delta := input_adjustment_delta;
    movement_quantity := abs(input_adjustment_delta);
  else
    raise exception 'Tipo de movimentacao invalido.';
  end if;

  next_stock := product_row.current_stock + movement_delta;

  if next_stock < 0 then
    raise exception 'Estoque insuficiente para a movimentacao.';
  end if;

  movement_unit_cost := null;
  next_average_cost := product_row.average_cost;

  if input_type = 'purchase' and input_unit_cost is not null then
    movement_unit_cost := input_unit_cost;

    if product_row.average_cost is null then
      next_average_cost := input_unit_cost;
    else
      next_average_cost :=
        round(
          (
            (product_row.current_stock * product_row.average_cost)
            + (input_quantity * input_unit_cost)
          )
          / nullif(product_row.current_stock + input_quantity, 0),
          2
        );
    end if;
  end if;

  if input_type = 'sale' then
    if input_unit_sale_price is null or input_unit_sale_price <= 0 then
      raise exception 'Venda exige preco unitario maior que zero.';
    end if;

    if product_row.average_cost is null then
      raise exception 'Venda exige custo medio definido.';
    end if;

    if input_payment_method is null or input_receipt_status is null then
      raise exception 'Venda exige forma de pagamento e status de recebimento.';
    end if;

    movement_unit_cost := product_row.average_cost;
    movement_revenue := round(input_quantity * input_unit_sale_price, 2);
    movement_cost := round(input_quantity * movement_unit_cost, 2);
    movement_profit := movement_revenue - movement_cost;
  end if;

  insert into public.stock_movements (
    user_id,
    product_id,
    type,
    quantity,
    stock_delta,
    unit_cost,
    unit_sale_price,
    revenue_value,
    cost_value,
    gross_profit_value,
    payment_method,
    receipt_status,
    amount_received,
    occurred_at,
    notes
  )
  values (
    current_user_id,
    input_product_id,
    input_type,
    movement_quantity,
    movement_delta,
    movement_unit_cost,
    case when input_type = 'sale' then input_unit_sale_price else null end,
    movement_revenue,
    movement_cost,
    movement_profit,
    case when input_type = 'sale' then input_payment_method else null end,
    case when input_type = 'sale' then input_receipt_status else null end,
    case when input_type = 'sale' then input_amount_received else 0 end,
    coalesce(input_occurred_at, now()),
    input_notes
  )
  returning * into movement_row;

  update public.products
     set current_stock = next_stock,
         average_cost = next_average_cost
   where id = input_product_id
     and user_id = current_user_id;

  return movement_row;
end;
$$;
```

Permissao:

```sql
revoke execute on function public.create_stock_movement(
  uuid,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  text,
  numeric,
  timestamptz,
  text
) from public, anon;

grant execute on function public.create_stock_movement(
  uuid,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  text,
  numeric,
  timestamptz,
  text
) to authenticated;
```

## 8. Criterios de aceite do banco

- RLS limita produtos e movimentos ao usuario autenticado.
- Produto inativo nao recebe movimento.
- Venda com estoque insuficiente falha.
- Venda sem pagamento falha.
- Movimento e saldo sao gravados no mesmo commit.
- Ajuste grava `quantity` positivo e `stock_delta` assinado.
- Quantidade e ajuste fracionados falham no MVP.
- Venda sem custo medio definido falha.
- Resumos por periodo usam `occurred_at`.
- Historico permanece mesmo apos inativar produto.
