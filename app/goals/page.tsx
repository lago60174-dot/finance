import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AccountToggle from "@/components/AccountToggle";
import GoalCard from "@/components/goals/GoalCard";
import type { Account, SavingsGoal, GoalContribution } from "@/types/database";

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: { account?: string };
}) {
  const account: Account = searchParams.account === "business" ? "business" : "personal";

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: goalsData } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("user_id", user!.id)
    .eq("account", account)
    .order("created_at", { ascending: false });

  const goals = (goalsData ?? []) as SavingsGoal[];

  const { data: contribData } = await supabase
    .from("goal_contributions")
    .select("*")
    .eq("user_id", user!.id);
  const contributions = (contribData ?? []) as GoalContribution[];

  const active = goals.filter((g) => g.status === "active");
  const completed = goals.filter((g) => g.status === "completed");

  function contributionsFor(goalId: string) {
    return contributions.filter((c) => c.goal_id === goalId);
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 pb-28">
      <Link href="/more" className="text-sm text-ink/50">
        ← Retour
      </Link>
      <div className="flex items-center justify-between mt-2 mb-5">
        <h1 className="font-display text-2xl">Objectifs & achats planifiés</h1>
        <Link
          href="/goals/new"
          className="bg-moss text-white text-sm px-3 py-1.5 rounded-md font-medium"
        >
          + Créer
        </Link>
      </div>

      <div className="mb-5">
        <AccountToggle current={account} />
      </div>

      {goals.length === 0 && (
        <p className="text-sm text-ink/50">
          Aucun objectif pour ce compte. Planifie un achat (ordinateur,
          voyage...) ou un fonds d'urgence pour suivre ta progression.
        </p>
      )}

      {active.length > 0 && (
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-ink/40 mb-2">En cours</p>
          {active.map((g) => (
            <GoalCard key={g.id} goal={g} contributions={contributionsFor(g.id)} />
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/40 mb-2">Atteints</p>
          {completed.map((g) => (
            <GoalCard key={g.id} goal={g} contributions={contributionsFor(g.id)} />
          ))}
        </div>
      )}
    </main>
  );
}
