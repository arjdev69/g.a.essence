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
