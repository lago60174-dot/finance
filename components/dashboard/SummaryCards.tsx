function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";
}

export default function SummaryCards({
  income,
  expenses,
  balance,
  savingsRate,
}: {
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number | null;
}) {
  const cards = [
    { label: "Argent disponible", value: formatFcfa(balance), tone: "ink" },
    { label: "Revenus du mois", value: formatFcfa(income), tone: "income" },
    { label: "Dépenses du mois", value: formatFcfa(expenses), tone: "expense" },
    {
      label: "Épargne du mois",
      value: savingsRate === null ? "—" : `${savingsRate.toFixed(0)} %`,
      tone: "ink",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="border border-line rounded-lg p-4 bg-white">
          <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">
            {c.label}
          </p>
          <p
            className={`tabular text-lg font-medium ${
              c.tone === "income"
                ? "text-income"
                : c.tone === "expense"
                ? "text-expense"
                : "text-ink"
            }`}
          >
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}
