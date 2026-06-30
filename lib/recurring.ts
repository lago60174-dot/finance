import type { SupabaseClient } from "@supabase/supabase-js";
import { getDaysInMonth, format } from "date-fns";

/**
 * Pour chaque règle récurrente active, vérifie si la transaction du mois en
 * cours a déjà été générée. Si non, et que la date du jour a dépassé le
 * jour prévu (day_of_month), insère la transaction et met à jour
 * `last_generated`.
 *
 * Approche volontairement simple (V1) : pas de cron, pas de fonction
 * planifiée. La génération se déclenche au prochain chargement du
 * dashboard après la date prévue. Si l'app n'est pas ouverte pendant
 * plusieurs mois, seul le mois en cours est rattrapé (pas l'historique
 * complet des mois manqués).
 */
export async function generateDueRecurring(
  supabase: SupabaseClient,
  userId: string
) {
  const { data: rules } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true);

  if (!rules || rules.length === 0) return;

  const today = new Date();
  const currentMonthKey = format(today, "yyyy-MM");
  const daysInMonth = getDaysInMonth(today);

  for (const rule of rules) {
    const lastGeneratedMonthKey = rule.last_generated
      ? rule.last_generated.slice(0, 7)
      : null;

    if (lastGeneratedMonthKey === currentMonthKey) continue; // déjà fait ce mois-ci

    const targetDay = Math.min(rule.day_of_month, daysInMonth);
    if (today.getDate() < targetDay) continue; // pas encore le jour prévu

    const date = `${currentMonthKey}-${String(targetDay).padStart(2, "0")}`;

    await supabase.from("transactions").insert({
      user_id: userId,
      type: rule.type,
      amount: rule.amount,
      category: rule.category,
      account: rule.account,
      note: rule.note,
      date,
    });

    await supabase
      .from("recurring_transactions")
      .update({ last_generated: date })
      .eq("id", rule.id);
  }
}
