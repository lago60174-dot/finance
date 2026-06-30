import { differenceInCalendarMonths, addMonths, format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Debt, DebtPayment } from "@/types/database";

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";
}

export default function RepaymentPlan({
  debt,
  payments,
}: {
  debt: Debt;
  payments: DebtPayment[];
}) {
  if (debt.status === "paid") {
    return (
      <div className="border border-line rounded-lg p-4 bg-white text-sm text-income">
        Cette dette est entièrement remboursée. 🎉
      </div>
    );
  }

  // Rythme moyen de remboursement observé (sur les paiements existants)
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);
  const monthsSinceStart = Math.max(
    1,
    differenceInCalendarMonths(new Date(), new Date(debt.start_date))
  );
  const avgMonthlyPace = totalPaid / monthsSinceStart;

  let projectionText: string | null = null;
  if (avgMonthlyPace > 0) {
    const monthsLeft = Math.ceil(debt.current_balance / avgMonthlyPace);
    const projectedDate = addMonths(new Date(), monthsLeft);
    projectionText = `À ce rythme (${formatFcfa(avgMonthlyPace)}/mois), tu termines vers ${format(
      projectedDate,
      "MMMM yyyy",
      { locale: fr }
    )}.`;
  }

  // Mensualité requise si une date cible est fixée
  let targetText: string | null = null;
  if (debt.target_date) {
    const monthsToTarget = Math.max(
      1,
      differenceInCalendarMonths(new Date(debt.target_date), new Date())
    );
    const requiredMonthly = debt.current_balance / monthsToTarget;
    targetText = `Pour finir avant le ${format(new Date(debt.target_date), "d MMMM yyyy", {
      locale: fr,
    })}, vise environ ${formatFcfa(requiredMonthly)}/mois.`;
  }

  return (
    <div className="border border-line rounded-lg p-4 bg-white space-y-1.5">
      <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">
        Plan de remboursement
      </p>
      {targetText && <p className="text-sm">{targetText}</p>}
      {projectionText && <p className="text-sm text-ink/70">{projectionText}</p>}
      {!targetText && !projectionText && (
        <p className="text-sm text-ink/50">
          Ajoute un premier remboursement, ou une date cible, pour voir une
          projection.
        </p>
      )}
    </div>
  );
}
