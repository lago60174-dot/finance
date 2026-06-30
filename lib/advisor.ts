import type { Transaction, Debt, RecurringTransaction } from "@/types/database";

function sortDebtsAvalanche(debts: Debt[]): Debt[] {
  return [...debts].sort((a, b) => (b.interest_rate ?? 0) - (a.interest_rate ?? 0));
}

function sortDebtsSnowball(debts: Debt[]): Debt[] {
  return [...debts].sort((a, b) => a.current_balance - b.current_balance);
}

export interface Tip {
  id: string;
  tone: "positive" | "warning" | "neutral";
  title: string;
  detail: string;
}

function fcfa(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";
}

const WEEKDAY_LABELS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

export function generateTips(input: {
  monthTransactions: Transaction[];
  prevMonthTransactions: Transaction[];
  allTransactions: Transaction[];
  balance: number;
  debts: Debt[];
  subscriptions: RecurringTransaction[];
}): Tip[] {
  const { monthTransactions, prevMonthTransactions, allTransactions, balance, debts, subscriptions } =
    input;

  const tips: Tip[] = [];

  const monthExpenses = monthTransactions.filter((t) => t.type === "expense");
  const monthIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = monthExpenses.reduce((s, t) => s + Number(t.amount), 0);

  // --- 1. Catégorie dominante ---------------------------------------
  const byCategory = new Map<string, number>();
  monthExpenses.forEach((t) => {
    byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + Number(t.amount));
  });
  const topCategory = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1])[0];

  if (topCategory && totalExpenses > 0) {
    const [category, amount] = topCategory;
    const pct = (amount / totalExpenses) * 100;
    if (pct >= 30) {
      const reduction20 = amount * 0.2;
      tips.push({
        id: "top-category",
        tone: pct >= 45 ? "warning" : "neutral",
        title: `${pct.toFixed(0)}% de tes dépenses passent en ${category}`,
        detail: `Réduire cette catégorie de 20% libérerait environ ${fcfa(reduction20)} ce mois-ci.`,
      });
    }
  }

  // --- 2. Projection de découvert ------------------------------------
  const last14 = allTransactions.filter((t) => {
    const d = new Date(t.date);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    return d >= cutoff && t.type === "expense";
  });
  const dailyBurn =
    last14.reduce((s, t) => s + Number(t.amount), 0) / 14;

  if (dailyBurn > 0 && balance > 0) {
    const daysLeft = Math.floor(balance / dailyBurn);
    if (daysLeft <= 20) {
      tips.push({
        id: "burn-rate",
        tone: daysLeft <= 7 ? "warning" : "neutral",
        title: `À ce rythme, ton solde tient encore ${daysLeft} jours`,
        detail: `Basé sur ta moyenne de dépenses des 14 derniers jours (${fcfa(dailyBurn)}/jour).`,
      });
    }
  } else if (balance <= 0) {
    tips.push({
      id: "negative-balance",
      tone: "warning",
      title: "Ton solde est négatif ou à zéro",
      detail: "Priorise les dépenses essentielles jusqu'à ton prochain revenu.",
    });
  }

  // --- 3. Jour de la semaine où l'on dépense le plus -----------------
  const byWeekday = new Map<number, number>();
  monthExpenses.forEach((t) => {
    const day = new Date(t.date).getDay();
    byWeekday.set(day, (byWeekday.get(day) ?? 0) + Number(t.amount));
  });
  if (byWeekday.size >= 4) {
    const sorted = Array.from(byWeekday.entries()).sort((a, b) => b[1] - a[1]);
    const [topDay, topAmount] = sorted[0];
    const avgOther =
      sorted.slice(1).reduce((s, [, v]) => s + v, 0) / Math.max(1, sorted.length - 1);
    if (avgOther > 0 && topAmount >= avgOther * 1.6) {
      tips.push({
        id: "weekday-pattern",
        tone: "neutral",
        title: `Tu dépenses surtout le ${WEEKDAY_LABELS[topDay]}`,
        detail: "Identifier ce pic peut t'aider à anticiper ou à le lisser sur la semaine.",
      });
    }
  }

  // --- 4. Comparaison mois précédent (épargne) -----------------------
  const prevExpenses = prevMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const prevIncome = prevMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);

  if (prevIncome > 0 && monthIncome > 0) {
    const prevSavings = prevIncome - prevExpenses;
    const currentSavings = monthIncome - totalExpenses;
    if (prevSavings !== 0) {
      const delta = ((currentSavings - prevSavings) / Math.abs(prevSavings)) * 100;
      if (delta >= 10) {
        tips.push({
          id: "savings-improved",
          tone: "positive",
          title: `Tu épargnes ${delta.toFixed(0)}% de plus que le mois dernier`,
          detail: "Continue sur cette dynamique — ça se voit dans les chiffres.",
        });
      } else if (delta <= -20) {
        tips.push({
          id: "savings-worsened",
          tone: "warning",
          title: "Ton épargne a reculé par rapport au mois dernier",
          detail: `Tu épargnais ${fcfa(prevSavings)}, contre ${fcfa(currentSavings)} ce mois-ci.`,
        });
      }
    }
  }

  // --- 5. Conseils de remboursement de dette --------------------------
  const activeDebts = debts.filter((d) => d.status === "active");
  if (activeDebts.length > 0) {
    const hasRates = activeDebts.some((d) => d.interest_rate && d.interest_rate > 0);
    const ordered = hasRates ? sortDebtsAvalanche(activeDebts) : sortDebtsSnowball(activeDebts);
    const priority = ordered[0];

    if (hasRates) {
      tips.push({
        id: "debt-avalanche",
        tone: "neutral",
        title: `Priorise "${priority.name}" pour minimiser le coût total`,
        detail: `C'est ta dette au taux le plus élevé (${priority.interest_rate}%). La rembourser en priorité réduit le montant total des intérêts payés.`,
      });
    } else if (activeDebts.length > 1) {
      tips.push({
        id: "debt-snowball",
        tone: "neutral",
        title: `Commence par solder "${priority.name}"`,
        detail: `C'est ton plus petit solde restant (${fcfa(priority.current_balance)}). L'éliminer vite te donne un déclic de motivation pour les suivantes.`,
      });
    }

    const totalDebt = activeDebts.reduce((s, d) => s + d.current_balance, 0);
    if (monthIncome > 0 && totalDebt / monthIncome >= 3) {
      tips.push({
        id: "debt-load-high",
        tone: "warning",
        title: "Ton endettement reste élevé par rapport à tes revenus",
        detail: `${fcfa(totalDebt)} restant à rembourser. Vise à y consacrer une part fixe et automatique de chaque revenu, même petite.`,
      });
    }
  }

  // --- 6. Abonnements ---------------------------------------------------
  if (subscriptions.length > 0) {
    const totalSub = subscriptions.reduce((s, sub) => s + Number(sub.amount), 0);
    if (monthIncome > 0) {
      const pct = (totalSub / monthIncome) * 100;
      if (pct >= 10) {
        tips.push({
          id: "subscriptions-heavy",
          tone: pct >= 20 ? "warning" : "neutral",
          title: `Tes abonnements représentent ${pct.toFixed(0)}% de tes revenus`,
          detail: `${fcfa(totalSub)}/mois pour ${subscriptions.length} abonnement(s). Vérifie lesquels sont encore vraiment utilisés.`,
        });
      }
    }
  }

  return tips;
}
