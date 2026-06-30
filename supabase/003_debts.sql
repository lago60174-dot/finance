-- ============================================================
-- Migration 003 — Suivi de dette
-- À exécuter dans Supabase > SQL Editor (après 002_recurring.sql)
-- ============================================================

create table if not exists public.debts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  account          text not null default 'personal' check (account in ('personal', 'business')),
  name             text not null,
  principal_amount numeric(12,2) not null check (principal_amount > 0),
  current_balance  numeric(12,2) not null check (current_balance >= 0),
  interest_rate    numeric(5,2),
  start_date       date not null default current_date,
  target_date      date,
  status           text not null default 'active' check (status in ('active', 'paid')),
  note             text,
  created_at       timestamptz not null default now()
);

create table if not exists public.debt_payments (
  id         uuid primary key default gen_random_uuid(),
  debt_id    uuid not null references public.debts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  amount     numeric(12,2) not null check (amount > 0),
  date       date not null default current_date,
  note       text,
  created_at timestamptz not null default now()
);

create index if not exists debt_payments_debt_idx on public.debt_payments (debt_id, date);

alter table public.debts enable row level security;
alter table public.debt_payments enable row level security;

create policy "select_own_debts" on public.debts for select using (auth.uid() = user_id);
create policy "insert_own_debts" on public.debts for insert with check (auth.uid() = user_id);
create policy "update_own_debts" on public.debts for update using (auth.uid() = user_id);
create policy "delete_own_debts" on public.debts for delete using (auth.uid() = user_id);

create policy "select_own_debt_payments" on public.debt_payments for select using (auth.uid() = user_id);
create policy "insert_own_debt_payments" on public.debt_payments for insert with check (auth.uid() = user_id);
create policy "delete_own_debt_payments" on public.debt_payments for delete using (auth.uid() = user_id);
