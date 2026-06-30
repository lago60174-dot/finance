-- ============================================================
-- Migration 004 — Abonnements (extension des récurrentes)
-- À exécuter après 003_debts.sql
-- ============================================================

alter table public.recurring_transactions
  add column if not exists is_subscription boolean not null default false,
  add column if not exists service_name text;

-- Un abonnement est une transaction récurrente de type 'expense' avec
-- is_subscription = true. service_name porte le nom du service
-- (Netflix, Canva Pro, etc.) ; category reste utilisée pour les stats.
