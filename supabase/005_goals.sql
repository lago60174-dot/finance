-- ============================================================
-- Migration 005 — Objectifs d'épargne / planification d'achat
-- À exécuter après 004_subscriptions.sql
-- ============================================================

create table if not exists public.savings_goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  account       text not null default 'personal' check (account in ('personal', 'business')),
  name          text not null,
  target_amount numeric(12,2) not null check (target_amount > 0),
  target_date   date,
  status        text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  note          text,
  created_at    timestamptz not null default now()
);

create table if not exists public.goal_contributions (
  id         uuid primary key default gen_random_uuid(),
  goal_id    uuid not null references public.savings_goals(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  amount     numeric(12,2) not null check (amount > 0),
  date       date not null default current_date,
  note       text,
  created_at timestamptz not null default now()
);

create index if not exists goal_contributions_goal_idx on public.goal_contributions (goal_id, date);

alter table public.savings_goals enable row level security;
alter table public.goal_contributions enable row level security;

create policy "select_own_goals" on public.savings_goals for select using (auth.uid() = user_id);
create policy "insert_own_goals" on public.savings_goals for insert with check (auth.uid() = user_id);
create policy "update_own_goals" on public.savings_goals for update using (auth.uid() = user_id);
create policy "delete_own_goals" on public.savings_goals for delete using (auth.uid() = user_id);

create policy "select_own_goal_contributions" on public.goal_contributions for select using (auth.uid() = user_id);
create policy "insert_own_goal_contributions" on public.goal_contributions for insert with check (auth.uid() = user_id);
create policy "delete_own_goal_contributions" on public.goal_contributions for delete using (auth.uid() = user_id);
