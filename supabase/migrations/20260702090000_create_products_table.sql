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
  constraint products_stock_integer_check check (
    current_stock = trunc(current_stock)
  ),
  constraint products_minimum_stock_check check (minimum_stock >= 0),
  constraint products_minimum_stock_integer_check check (
    minimum_stock = trunc(minimum_stock)
  ),
  constraint products_average_cost_check check (
    average_cost is null
    or average_cost >= 0
  ),
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
