import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { startOfMonth, subMonths, format } from "date-fns";
import AccountToggle from "@/components/AccountToggle";
import AdviceCard from "@/components/AdviceCard";
import { generateTips } from "@/lib/advisor";
import type { Account, Transaction, Debt, RecurringTransaction } from "@/types/database";

export default async function AdvicePage({
  searchParams,
}: {
  searchParams: { account?: string };
}) {
  const account: Account = searchParams.account === "business" ? "business" : "personal";

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: txData } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user!.id)
    .eq("account", account);
  const allTransactions = (txData ?? []) as Transaction[];

  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const prevMonthStart = format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd");

  const monthTransactions = allTransactions.filter((t) => t.date >= monthStart);
  const prevMonthTransactions = allTransactions.filter(
    (t) => t.date >= prevMonthStart && t.date < monthStart
  );

  const income = allTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expenses = allTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expenses;

  const { data: debtsData } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", user!.id)
    .eq("account", account);
  const debts = (debtsData ?? []) as Debt[];

  const { data: subsData } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("user_id", user!.id)
    .eq("account", account)
    .eq("is_subscription", true)
    .eq("active", true);
  const subscriptions = (subsData ?? []) as RecurringTransaction[];

  const tips = generateTips({
    monthTransactions,
    prevMonthTransactions,
    allTransactions,
    balance,
    debts,
    subscriptions,
  });

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 pb-28">
      <Link href="/more" className="text-sm text-ink/50">
        ← Retour
      </Link>
      <h1 className="font-display text-2xl mt-2 mb-1">Conseils</h1>
      <p className="text-xs text-ink/40 mb-5">
        Calculés à partir de tes données, sans IA — recalculés à chaque visite.
      </p>

      <div className="mb-5">
        <AccountToggle current={account} />
      </div>

      {tips.length === 0 && (
        <p className="text-sm text-ink/50">
          Rien de particulier à signaler pour l'instant. Continue à enregistrer
          tes transactions pour des conseils plus précis.
        </p>
      )}

      {tips.map((tip) => (
        <AdviceCard key={tip.id} tip={tip} />
      ))}
    </main>
  );
}
