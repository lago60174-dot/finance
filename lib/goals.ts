import type { SavingsGoal, GoalContribution } from "@/types/database";

export function goalProgress(
  goal: SavingsGoal,
  contributions: GoalContribution[]
): { saved: number; percent: number } {
  const saved = contributions.reduce((sum, c) => sum + Number(c.amount), 0);
  const percent = goal.target_amount > 0
    ? Math.min(100, (saved / goal.target_amount) * 100)
    : 0;
  return { saved, percent };
}

/**
 * Calcule le montant mensuel à épargner pour atteindre l'objectif à temps,
 * à partir d'aujourd'hui. Retourne null si pas de date cible ou si la date
 * cible est déjà dépassée.
 */
export function requiredMonthlyContribution(
  goal: SavingsGoal,
  saved: number
): number | null {
  if (!goal.target_date) return null;

  const remaining = goal.target_amount - saved;
  if (remaining <= 0) return 0;

  const now = new Date();
  const target = new Date(goal.target_date);
  const monthsLeft = Math.max(
    1,
    (target.getFullYear() - now.getFullYear()) * 12 +
      (target.getMonth() - now.getMonth())
  );

  if (target <= now) return null;

  return remaining / monthsLeft;
}
