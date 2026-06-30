import Link from "next/link";
import type { Debt } from "@/types/database";

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";
}

export default function DebtCard({ debt }: { debt: Debt }) {
  const paid = debt.principal_amount - debt.current_balance;
  const pct = debt.principal_amount > 0 ? (paid / debt.principal_amount) * 100 : 0;
  const isPaid = debt.status === "paid";

  return (
    <Link
      href={`/debts/${debt.id}`}
      className="block border border-line rounded-lg bg-white p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium">
          {debt.name} {isPaid && <span className="ml-1">🎉</span>}
        </p>
        <span className="text-xs text-ink/40">
          {debt.account === "personal" ? "Personnel" : "Habynex"}
        </span>
      </div>

      <div className="h-2 rounded-full bg-line overflow-hidden mb-2">
        <div
          className={`h-full rounded-full ${isPaid ? "bg-income" : "bg-moss"}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-ink/50">
        <span>
          {formatFcfa(debt.current_balance)} restant sur {formatFcfa(debt.principal_amount)}
        </span>
        <span className="tabular font-medium text-ink">{pct.toFixed(0)} %</span>
      </div>
    </Link>
  );
}
