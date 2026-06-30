import type { Transaction, Debt, DebtPayment } from "@/types/database";
import { startOfMonth, subMonths, format, differenceInCalendarDays, parseISO } from "date-fns";

export interface Badge {
  id: string;
  emoji: string;
  label: string;
  description: string;
  earned: boolean;
}

export interface GamificationSummary {
  badges: Badge[];
  streakDays: number;
  level: { name: string; index: number; total: number };
  encouragement: string | null;
}

function monthKey(d: Date) {
  return format(d, "yyyy-MM");
}

/**
 * Calcule, pour les 6 derniers mois, l'épargne (revenus - dépenses) du mois.
 * Renvoie le tableau du plus ancien au plus récent.
 */
function monthlySavings(transactions: Transaction[]) {
  const months: { key: string; savings: number; income: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    const key = monthKey(d);
    const start = format(startOfMonth(d), "yyyy-MM-dd");
    const end = i === 0 ? format(new Date(), "yyyy-MM-dd") : format(startOfMonth(subMonths(d, -1)), "yyyy-MM-dd");
    const monthTx = transactions.filter((t) => t.date >= start && t.date < end);
    const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expenses = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    months.push({ key, savings: income - expenses, income });
  }
  return months;
}

/**
 * Streak = nombre de jours consécutifs (jusqu'à aujourd'hui) où l'utilisateur
 * a enregistré au moins une transaction. Casse au premier jour manquant.
 */
function computeStreak(transactions: Transaction[]) {
  const days = new Set(transactions.map((t) => t.date));
  let streak = 0;
  let cursor = new Date();
  while (days.has(format(cursor, "yyyy-MM-dd"))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 86400000);
  }
  return streak;
}

export function computeGamification({
  transactions,
  debts,
  payments,
}: {
  transactions: Transaction[];
  debts: Debt[];
  payments: DebtPayment[];
}): GamificationSummary {
  const months = monthlySavings(transactions);
  const thisMonth = months[months.length - 1];
  const lastMonth = months[months.length - 2];

  const positiveMonthsStreak = (() => {
    let count = 0;
    for (let i = months.length - 1; i >= 0; i--) {
      if (months[i].savings > 0) count += 1;
      else break;
    }
    return count;
  })();

  const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);
  const debtsClearedCount = debts.filter((d) => d.status === "paid").length;
  const hasActivePlan = debts.some((d) => d.status === "active");

  const allTimeIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const allTimeExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const allTimeSavings = allTimeIncome - allTimeExpenses;

  const streakDays = computeStreak(transactions);

  const badges: Badge[] = [
    {
      id: "first_entry",
      emoji: "🌱",
      label: "Premier pas",
      description: "Enregistrer ta première transaction.",
      earned: transactions.length > 0,
    },
    {
      id: "week_streak",
      emoji: "🔥",
      label: "Semaine régulière",
      description: "7 jours de suite avec au moins une transaction.",
      earned: streakDays >= 7,
    },
    {
      id: "positive_month",
      emoji: "💰",
      label: "Mois positif",
      description: "Terminer un mois avec une épargne positive.",
      earned: positiveMonthsStreak >= 1,
    },
    {
      id: "three_positive_months",
      emoji: "📈",
      label: "Trois mois de suite",
      description: "Trois mois consécutifs d'épargne positive.",
      earned: positiveMonthsStreak >= 3,
    },
    {
      id: "first_debt_payment",
      emoji: "🛠️",
      label: "Premier remboursement",
      description: "Enregistrer ton premier paiement de dette.",
      earned: payments.length > 0,
    },
    {
      id: "debt_cleared",
      emoji: "🎉",
      label: "Dette effacée",
      description: "Rembourser une dette en intégralité.",
      earned: debtsClearedCount > 0,
    },
    {
      id: "saver_100k",
      emoji: "🏦",
      label: "100 000 FCFA épargnés",
      description: "Atteindre 100 000 FCFA d'épargne cumulée.",
      earned: allTimeSavings >= 100000,
    },
  ];

  const level = (() => {
    const earnedCount = badges.filter((b) => b.earned).length;
    const tiers = ["Débutant", "Discipliné", "Stratège", "Bâtisseur"];
    const index = Math.min(Math.floor(earnedCount / 2), tiers.length - 1);
    return { name: tiers[index], index, total: tiers.length };
  })();

  const encouragement = (() => {
    if (hasActivePlan && totalPaid > 0 && lastMonth && thisMonth.savings > lastMonth.savings) {
      return "Tu rembourses tes dettes et tu épargnes plus que le mois dernier — ça avance sur les deux fronts.";
    }
    if (streakDays >= 3) {
      return `${streakDays} jours de suite à suivre tes finances. Continue, c'est ça qui construit l'habitude.`;
    }
    if (lastMonth && thisMonth.savings > lastMonth.savings && lastMonth.savings !== 0) {
      const diff = thisMonth.savings - lastMonth.savings;
      return `Ton épargne progresse de ${Math.round(diff).toLocaleString("fr-FR")} FCFA par rapport au mois dernier.`;
    }
    if (debtsClearedCount > 0) {
      return "Tu as déjà effacé au moins une dette. Le reste suit le même chemin.";
    }
    return null;
  })();

  return { badges, streakDays, level, encouragement };
}
