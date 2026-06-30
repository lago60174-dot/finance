-- ============================================================
-- Migration 002 — Transactions récurrentes
-- À exécuter dans Supabase > SQL Editor (après schema.sql)
-- ============================================================

create table if not exists public.recurring_transactions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  type           text not null check (type in ('expense', 'income')),
  amount         numeric(12,2) not null check (amount > 0),
  category       text not null,
  account        text not null default 'personal' check (account in ('personal', 'business')),
  note           text,
  day_of_month   int not null check (day_of_month between 1 and 28),
  active         boolean not null default true,
  last_generated date,
  created_at     timestamptz not null default now()
);

alter table public.recurring_transactions enable row level security;

create policy "select_own_recurring"
  on public.recurring_transactions for select
  using (auth.uid() = user_id);

create policy "insert_own_recurring"
  on public.recurring_transactions for insert
  with check (auth.uid() = user_id);

create policy "update_own_recurring"
  on public.recurring_transactions for update
  using (auth.uid() = user_id);

create policy "delete_own_recurring"
  on public.recurring_transactions for delete
  using (auth.uid() = user_id);

-- Note : day_of_month est limité à 28 pour éviter les soucis avec
-- les mois plus courts (février). Pour un loyer "fin du mois", utilise 28.
