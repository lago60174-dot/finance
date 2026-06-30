import Link from "next/link";
import ProgressBar from "@/components/ProgressBar";
import { goalProgress } from "@/lib/goals";
import type { SavingsGoal, GoalContribution } from "@/types/database";

function fcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";
}

export default function GoalCard({
  goal,
  contributions,
}: {
  goal: SavingsGoal;
  contributions: GoalContribution[];
}) {
  const { saved, percent } = goalProgress(goal, contributions);

  return (
    <Link
      href={`/goals/${goal.id}`}
      className="block border border-line rounded-lg bg-white p-4 mb-3"
    >
      <div className="flex justify-between items-baseline mb-2">
        <p className="font-medium text-sm">{goal.name}</p>
        <span className="text-xs text-ink/50">{percent.toFixed(0)}%</span>
      </div>
      <ProgressBar percent={percent} colorClass={goal.status === "completed" ? "bg-income" : "bg-moss"} />
      <div className="flex justify-between mt-2 text-xs text-ink/50">
        <span>{fcfa(saved)} épargné</span>
        <span>Objectif : {fcfa(goal.target_amount)}</span>
      </div>
    </Link>
  );
}
