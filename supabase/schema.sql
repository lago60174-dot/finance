-- ============================================================
-- Finance Tracker — schéma de base (V1 sans IA)
-- À exécuter dans Supabase > SQL Editor > New query
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null check (type in ('expense', 'income')),
  amount      numeric(12,2) not null check (amount > 0),
  category    text not null,
  account     text not null default 'personal' check (account in ('personal', 'business')),
  note        text,
  date        date not null default current_date,
  created_at  timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date desc);

-- Row Level Security : chaque utilisateur ne voit / modifie que ses propres lignes
alter table public.transactions enable row level security;

create policy "select_own_transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "insert_own_transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "update_own_transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "delete_own_transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);
