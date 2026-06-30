import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import ProgressBar from "@/components/ProgressBar";
import GoalContributionForm from "@/components/goals/GoalContributionForm";
import { goalProgress, requiredMonthlyContribution } from "@/lib/goals";
import type { SavingsGoal, GoalContribution } from "@/types/database";

function fcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";
}

export default async function GoalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: goalData } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!goalData) notFound();
  const goal = goalData as SavingsGoal;

  const { data: contribData } = await supabase
    .from("goal_contributions")
    .select("*")
    .eq("goal_id", goal.id)
    .order("date", { ascending: false });
  const contributions = (contribData ?? []) as GoalContribution[];

  const { saved, percent } = goalProgress(goal, contributions);
  const monthlyRequired = requiredMonthlyContribution(goal, saved);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 pb-28">
      <Link href="/goals" className="text-sm text-ink/50">
        ← Retour
      </Link>

      <div className="mt-2 mb-5">
        <h1 className="font-display text-2xl">{goal.name}</h1>
        <p className="text-xs text-ink/40">
          {goal.account === "personal" ? "Personnel" : "Habynex"}
          {goal.target_date
            ? ` · cible le ${format(parseISO(goal.target_date), "d MMMM yyyy", { locale: fr })}`
            : ""}
        </p>
      </div>

      <div className="border border-line rounded-lg bg-white p-4 mb-5">
        <ProgressBar percent={percent} colorClass={goal.status === "completed" ? "bg-income" : "bg-moss"} />
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-ink/60">
            {fcfa(saved)} sur {fcfa(goal.target_amount)}
          </span>
          <span className="tabular font-medium">{percent.toFixed(0)} %</span>
        </div>
      </div>

      {goal.status === "completed" && (
        <div className="border border-income/20 bg-income/5 rounded-lg p-4 mb-5 text-sm text-income">
          Objectif atteint. 🎯
        </div>
      )}

      {goal.status === "active" && monthlyRequired !== null && (
        <div className="border border-line rounded-lg p-4 bg-white mb-5 text-sm">
          <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">
            Rythme à tenir
          </p>
          {monthlyRequired > 0 ? (
            <p>
              Pour atteindre ton objectif à temps, vise environ{" "}
              <span className="font-medium tabular">{fcfa(monthlyRequired)}</span> par
              mois.
            </p>
          ) : (
            <p>Tu as déjà atteint le montant cible — il ne reste qu'à le confirmer.</p>
          )}
        </div>
      )}

      {goal.status === "active" && (
        <div className="mb-6">
          <GoalContributionForm goal={goal} currentSaved={saved} />
        </div>
      )}

      {contributions.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/40 mb-2">
            Historique des contributions
          </p>
          <div className="bg-white border border-line rounded-lg px-4">
            {contributions.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between py-3 border-b border-line last:border-0"
              >
                <div>
                  <p className="text-sm">
                    {format(parseISO(c.date), "d MMMM yyyy", { locale: fr })}
                  </p>
                  {c.note && <p className="text-xs text-ink/50">{c.note}</p>}
                </div>
                <span className="tabular text-sm font-medium text-income">
                  +{fcfa(c.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
