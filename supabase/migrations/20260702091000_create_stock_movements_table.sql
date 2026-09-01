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
  constraint stock_movements_quantity_integer_check check (
    quantity = trunc(quantity)
  ),
  constraint stock_movements_delta_check check (stock_delta <> 0),
  constraint stock_movements_delta_integer_check check (
    stock_delta = trunc(stock_delta)
  ),
  constraint stock_movements_unit_cost_check check (
    unit_cost is null
    or unit_cost >= 0
  ),
  constraint stock_movements_unit_sale_price_check check (
    unit_sale_price is null
    or unit_sale_price > 0
  ),
  constraint stock_movements_values_check check (
    revenue_value >= 0
    and cost_value >= 0
    and amount_received >= 0
  ),
  constraint stock_movements_payment_method_check check (
    payment_method is null
    or payment_method in ('pix', 'card', 'cash')
  ),
  constraint stock_movements_receipt_status_check check (
    receipt_status is null
    or receipt_status in ('received', 'pending', 'partial')
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
  ),
  constraint stock_movements_adjustment_quantity_check check (
    type <> 'adjustment'
    or quantity = abs(stock_delta)
  )
);
