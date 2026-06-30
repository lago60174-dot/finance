import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RecurringRow from "@/components/RecurringRow";
import type { RecurringTransaction } from "@/types/database";

export default async function RecurringPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("user_id", user!.id)
    .eq("is_subscription", false)
    .order("day_of_month", { ascending: true });

  const rules = (data ?? []) as RecurringTransaction[];

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 pb-28">
      <Link href="/more" className="text-sm text-ink/50">
        ← Retour
      </Link>
      <div className="flex items-center justify-between mt-2 mb-1">
        <h1 className="font-display text-2xl">Transactions récurrentes</h1>
        <Link
          href="/recurring/new"
          className="bg-moss text-white text-sm px-3 py-1.5 rounded-md font-medium"
        >
          + Créer
        </Link>
      </div>
      <Link href="/subscriptions" className="text-xs text-moss underline">
        Voir les abonnements →
      </Link>

      {rules.length === 0 && (
        <p className="text-sm text-ink/50 mt-5">
          Aucune règle récurrente. Ajoute ton loyer ou ton salaire pour qu'ils
          s'enregistrent automatiquement chaque mois.
        </p>
      )}

      {rules.length > 0 && (
        <div className="bg-white border border-line rounded-lg px-4 mt-5">
          {rules.map((r) => (
            <RecurringRow key={r.id} rule={r} />
          ))}
        </div>
      )}
    </main>
  );
}
