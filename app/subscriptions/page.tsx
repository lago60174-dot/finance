import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RecurringRow from "@/components/RecurringRow";
import type { RecurringTransaction } from "@/types/database";

function fcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";
}

export default async function SubscriptionsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("user_id", user!.id)
    .eq("is_subscription", true)
    .order("amount", { ascending: false });

  const subs = (data ?? []) as RecurringTransaction[];
  const active = subs.filter((s) => s.active);
  const totalMonthly = active.reduce((s, sub) => s + Number(sub.amount), 0);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 pb-28">
      <Link href="/more" className="text-sm text-ink/50">
        ← Retour
      </Link>
      <div className="flex items-center justify-between mt-2 mb-5">
        <h1 className="font-display text-2xl">Abonnements</h1>
        <Link
          href="/recurring/new?subscription=1"
          className="bg-moss text-white text-sm px-3 py-1.5 rounded-md font-medium"
        >
          + Ajouter
        </Link>
      </div>

      {subs.length > 0 && (
        <div className="border border-line rounded-lg bg-white p-4 mb-5">
          <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">
            Coût mensuel total
          </p>
          <p className="tabular text-2xl font-medium">{fcfa(totalMonthly)}</p>
          <p className="text-xs text-ink/40 mt-1">
            {active.length} abonnement{active.length > 1 ? "s" : ""} actif
            {active.length > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {subs.length === 0 && (
        <p className="text-sm text-ink/50">
          Aucun abonnement enregistré. Ajoute Netflix, Canva, ton hébergement,
          ou tout autre service récurrent pour suivre leur coût total.
        </p>
      )}

      {subs.length > 0 && (
        <div className="bg-white border border-line rounded-lg px-4">
          {subs.map((s) => (
            <RecurringRow key={s.id} rule={s} />
          ))}
        </div>
      )}
    </main>
  );
}
