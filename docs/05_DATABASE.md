# G.A Essência

Documentação para desenvolvimento do MVP usando Spec Driven Development com apoio do Codex.

Produto: G.A Essência
Objetivo: sistema de agendamento com cálculo automático da taxa da clínica e ganho do profissional.
Stack alvo: React + TypeScript + Vite + Tailwind + Supabase.

# 05 — Database

## 1. Extensão

```sql
create extension if not exists "pgcrypto";
```

## 2. patients

```sql
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  birth_date date,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## 3. professionals

```sql
create table if not exists public.professionals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  specialty text,
  pix_key text,
  default_clinic_fee_percentage numeric(5,2) not null default 30,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professionals_percentage_check check (
    default_clinic_fee_percentage >= 0 and default_clinic_fee_percentage <= 100
  )
);
```

## 4. services

```sql
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  default_value numeric(10,2) not null default 0,
  duration_minutes integer not null default 60,
  clinic_fee_percentage numeric(5,2) not null default 30,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_value_check check (default_value >= 0),
  constraint services_duration_check check (duration_minutes > 0),
  constraint services_percentage_check check (
    clinic_fee_percentage >= 0 and clinic_fee_percentage <= 100
  )
);
```

## 5. appointments

```sql
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references public.patients(id),
  professional_id uuid not null references public.professionals(id),
  service_id uuid not null references public.services(id),
  appointment_date date not null,
  appointment_time time not null,
  description text,
  notes text,
  value numeric(10,2) not null default 0,
  clinic_fee_percentage numeric(5,2) not null default 30,
  clinic_fee_value numeric(10,2) not null default 0,
  professional_gain_value numeric(10,2) not null default 0,
  status text not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_status_check check (
    status in ('scheduled', 'completed', 'cancelled', 'no_show', 'paid')
  ),
  constraint appointments_value_check check (value >= 0),
  constraint appointments_percentage_check check (
    clinic_fee_percentage >= 0 and clinic_fee_percentage <= 100
  )
);
```

## 6. Índices

```sql
create index if not exists idx_patients_user_id on public.patients(user_id);
create index if not exists idx_professionals_user_id on public.professionals(user_id);
create index if not exists idx_services_user_id on public.services(user_id);
create index if not exists idx_appointments_user_id on public.appointments(user_id);
create index if not exists idx_appointments_date on public.appointments(appointment_date);
create index if not exists idx_appointments_status on public.appointments(status);
```

## 7. updated_at

```sql
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
```

Criar trigger para cada tabela.

## 8. RLS

```sql
alter table public.patients enable row level security;
alter table public.professionals enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
```

Policy padrão para cada tabela:

```sql
create policy "select own rows"
on public.patients for select
using (auth.uid() = user_id);

create policy "insert own rows"
on public.patients for insert
with check (auth.uid() = user_id);

create policy "update own rows"
on public.patients for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "delete own rows"
on public.patients for delete
using (auth.uid() = user_id);
```

Repetir para professionals, services e appointments trocando o nome da tabela.
