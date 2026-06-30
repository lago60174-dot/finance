import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AccountToggle from "@/components/AccountToggle";
import DebtCard from "@/components/debts/DebtCard";
import type { Account, Debt } from "@/types/database";

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";
}

export default async function DebtsPage({
  searchParams,
}: {
  searchParams: { account?: string };
}) {
  const account: Account = searchParams.account === "business" ? "business" : "personal";

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", user!.id)
    .eq("account", account)
    .order("created_at", { ascending: false });

  const debts = (data ?? []) as Debt[];
  const active = debts.filter((d) => d.status === "active");
  const paid = debts.filter((d) => d.status === "paid");

  const totalRemaining = active.reduce((s, d) => s + d.current_balance, 0);
  const totalOriginal = debts.reduce((s, d) => s + d.principal_amount, 0);
  const totalReimbursed = totalOriginal - debts.reduce((s, d) => s + d.current_balance, 0);
  const globalPct = totalOriginal > 0 ? (totalReimbursed / totalOriginal) * 100 : 0;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 pb-28">
      <Link href="/more" className="text-sm text-ink/50">
        ← Retour
      </Link>
      <div className="flex items-center justify-between mt-2 mb-5">
        <h1 className="font-display text-2xl">Dettes</h1>
        <Link
          href="/debts/new"
          className="bg-moss text-white text-sm px-3 py-1.5 rounded-md font-medium"
        >
          + Ajouter
        </Link>
      </div>

      <div className="mb-5">
        <AccountToggle current={account} />
      </div>

      {debts.length > 0 && (
        <div className="border border-line rounded-lg bg-white p-4 mb-5">
          <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">
            Vue d'ensemble
          </p>
          <div className="h-2 rounded-full bg-line overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-moss"
              style={{ width: `${Math.min(100, globalPct)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-ink/50">
            <span>{formatFcfa(totalRemaining)} restant au total</span>
            <span className="tabular font-medium text-ink">{globalPct.toFixed(0)} % remboursé</span>
          </div>
        </div>
      )}

      {debts.length === 0 && (
        <p className="text-sm text-ink/50">
          Aucune dette enregistrée pour ce compte. Tant mieux, ou ajoute la
          tienne pour suivre son remboursement.
        </p>
      )}

      {active.length > 0 && (
        <div className="space-y-3 mb-6">
          <p className="text-xs uppercase tracking-wide text-ink/40">En cours</p>
          {active.map((d) => (
            <DebtCard key={d.id} debt={d} />
          ))}
        </div>
      )}

      {paid.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-ink/40">Remboursées</p>
          {paid.map((d) => (
            <DebtCard key={d.id} debt={d} />
          ))}
        </div>
      )}
    </main>
  );
}
