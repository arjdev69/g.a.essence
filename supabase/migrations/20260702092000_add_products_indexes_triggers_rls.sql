create index if not exists idx_products_user_id
on public.products(user_id);

create index if not exists idx_products_name
on public.products(name);

create index if not exists idx_products_status
on public.products(status);

create index if not exists idx_products_category
on public.products(category);

create unique index if not exists idx_products_user_name_size_normalized_unique
on public.products (
  user_id,
  lower(regexp_replace(trim(name), '\s+', ' ', 'g')),
  lower(regexp_replace(trim(size), '\s+', '', 'g'))
);

create index if not exists idx_stock_movements_user_id
on public.stock_movements(user_id);

create index if not exists idx_stock_movements_product_id
on public.stock_movements(product_id);

create index if not exists idx_stock_movements_type
on public.stock_movements(type);

create index if not exists idx_stock_movements_occurred_at
on public.stock_movements(occurred_at);

create index if not exists idx_stock_movements_created_at
on public.stock_movements(created_at);

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

alter table public.products enable row level security;
alter table public.stock_movements enable row level security;

drop policy if exists "select own products" on public.products;
create policy "select own products"
on public.products for select
using (auth.uid() = user_id);

drop policy if exists "insert own products" on public.products;
create policy "insert own products"
on public.products for insert
with check (auth.uid() = user_id);

drop policy if exists "update own products" on public.products;
create policy "update own products"
on public.products for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "select own stock movements" on public.stock_movements;
create policy "select own stock movements"
on public.stock_movements for select
using (auth.uid() = user_id);
