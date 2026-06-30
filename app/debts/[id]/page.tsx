import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import DebtPaymentForm from "@/components/debts/DebtPaymentForm";
import DebtEvolutionChart from "@/components/debts/DebtEvolutionChart";
import RepaymentPlan from "@/components/debts/RepaymentPlan";
import type { Debt, DebtPayment } from "@/types/database";

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";
}

export default async function DebtDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: debtData } = await supabase
    .from("debts")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!debtData) notFound();
  const debt = debtData as Debt;

  const { data: paymentsData } = await supabase
    .from("debt_payments")
    .select("*")
    .eq("debt_id", debt.id)
    .order("date", { ascending: false });

  const payments = (paymentsData ?? []) as DebtPayment[];

  const paid = debt.principal_amount - debt.current_balance;
  const pct = debt.principal_amount > 0 ? (paid / debt.principal_amount) * 100 : 0;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 pb-28">
      <Link href="/debts" className="text-sm text-ink/50">
        ← Retour
      </Link>

      <div className="mt-2 mb-5">
        <h1 className="font-display text-2xl">{debt.name}</h1>
        <p className="text-xs text-ink/40">
          {debt.account === "personal" ? "Personnel" : "Habynex"}
          {debt.interest_rate ? ` · ${debt.interest_rate}% / an` : ""}
        </p>
      </div>

      <div className="border border-line rounded-lg bg-white p-4 mb-5">
        <div className="h-2 rounded-full bg-line overflow-hidden mb-2">
          <div
            className={`h-full rounded-full ${debt.status === "paid" ? "bg-income" : "bg-moss"}`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink/60">
            {formatFcfa(debt.current_balance)} restant sur {formatFcfa(debt.principal_amount)}
          </span>
          <span className="tabular font-medium">{pct.toFixed(0)} %</span>
        </div>
      </div>

      <div className="mb-5">
        <RepaymentPlan debt={debt} payments={payments} />
      </div>

      <div className="mb-5">
        <DebtEvolutionChart debt={debt} payments={payments} />
      </div>

      {debt.status === "active" && (
        <div className="mb-6">
          <DebtPaymentForm debt={debt} />
        </div>
      )}

      {payments.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/40 mb-2">
            Historique des remboursements
          </p>
          <div className="bg-white border border-line rounded-lg px-4">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-3 border-b border-line last:border-0"
              >
                <div>
                  <p className="text-sm">
                    {format(parseISO(p.date), "d MMMM yyyy", { locale: fr })}
                  </p>
                  {p.note && <p className="text-xs text-ink/50">{p.note}</p>}
                </div>
                <span className="tabular text-sm font-medium text-income">
                  −{formatFcfa(p.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
