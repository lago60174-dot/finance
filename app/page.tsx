import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { generateDueRecurring } from "@/lib/recurring";
import { computeGamification } from "@/lib/gamification";
import { generateTips } from "@/lib/advisor";
import { startOfMonth, startOfWeek, subMonths, format } from "date-fns";
import { fr } from "date-fns/locale";
import { Lightbulb, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import AccountToggle from "@/components/AccountToggle";
import SummaryCards from "@/components/dashboard/SummaryCards";
import CategoryChart from "@/components/dashboard/CategoryChart";
import WeeklyChart from "@/components/dashboard/WeeklyChart";
import EncouragementBanner from "@/components/dashboard/EncouragementBanner";
import BadgesPanel from "@/components/dashboard/BadgesPanel";
import type { Account, Transaction, Debt, DebtPayment, RecurringTransaction } from "@/types/database";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { account?: string };
}) {
  const account: Account = searchParams.account === "business" ? "business" : "personal";

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  await generateDueRecurring(supabase, user!.id);

  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");

  // Toutes les transactions du compte (pour le solde all-time)
  const { data: allTx } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user!.id)
    .eq("account", account);

  const transactions = (allTx ?? []) as Transaction[];

  const monthTx = transactions.filter((t) => t.date >= monthStart);

  const income = monthTx
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = monthTx
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const allTimeIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const allTimeExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = allTimeIncome - allTimeExpenses;
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : null;

  // Répartition par catégorie (dépenses du mois)
  const categoryMap = new Map<string, number>();
  monthTx
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryMap.set(t.category, (categoryMap.get(t.category) ?? 0) + Number(t.amount));
    });
  const categoryData = Array.from(categoryMap.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  // Dépenses par semaine (mois en cours)
  const weekMap = new Map<string, number>();
  monthTx
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const weekLabel = format(startOfWeek(new Date(t.date), { weekStartsOn: 1 }), "d MMM", {
        locale: fr,
      });
      weekMap.set(weekLabel, (weekMap.get(weekLabel) ?? 0) + Number(t.amount));
    });
  const weeklyData = Array.from(weekMap.entries()).map(([week, total]) => ({
    week,
    total,
  }));

  // Dettes du compte courant + leurs paiements (pour les badges et le résumé)
  const { data: debtsData } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", user!.id)
    .eq("account", account);
  const debts = (debtsData ?? []) as Debt[];

  const { data: paymentsData } = await supabase
    .from("debt_payments")
    .select("*")
    .eq("user_id", user!.id);
  const payments = (paymentsData ?? []) as DebtPayment[];

  const activeDebts = debts.filter((d) => d.status === "active");
  const totalDebtRemaining = activeDebts.reduce((s, d) => s + d.current_balance, 0);

  const gamification = computeGamification({ transactions, debts, payments });

  // Top conseil du moment, pour le teaser sur le dashboard
  const prevMonthStart = format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd");
  const prevMonthTx = transactions.filter((t) => t.date >= prevMonthStart && t.date < monthStart);

  const { data: subsData } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("user_id", user!.id)
    .eq("account", account)
    .eq("is_subscription", true)
    .eq("active", true);
  const subscriptions = (subsData ?? []) as RecurringTransaction[];

  const tips = generateTips({
    monthTransactions: monthTx,
    prevMonthTransactions: prevMonthTx,
    allTransactions: transactions,
    balance,
    debts,
    subscriptions,
  });
  const topTip = tips[0];

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 pb-28">
      <Header />

      <div className="mb-5">
        <AccountToggle current={account} />
      </div>

      <EncouragementBanner message={gamification.encouragement} />

      <SummaryCards
        income={income}
        expenses={expenses}
        balance={balance}
        savingsRate={savingsRate}
      />

      {activeDebts.length > 0 && (
        <Link
          href="/debts"
          className="block border border-line rounded-lg p-4 bg-white mt-4"
        >
          <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">
            Dette restante ({activeDebts.length} en cours)
          </p>
          <p className="tabular text-lg font-medium text-expense">
            {new Intl.NumberFormat("fr-FR").format(Math.round(totalDebtRemaining))} FCFA
          </p>
        </Link>
      )}

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <CategoryChart data={categoryData} />
        <WeeklyChart data={weeklyData} />
      </div>

      <div className="mt-6">
        <BadgesPanel summary={gamification} />
      </div>

      {topTip && (
        <Link
          href="/advice"
          className="flex items-center gap-3 border border-line rounded-lg bg-white p-4 mt-4"
        >
          <div className="bg-clay/10 text-clay rounded-md p-2 shrink-0">
            <Lightbulb size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wide text-ink/40">Conseil</p>
            <p className="text-sm font-medium truncate">{topTip.title}</p>
          </div>
          <ChevronRight size={16} className="text-ink/30 shrink-0" />
        </Link>
      )}
    </main>
  );
}
