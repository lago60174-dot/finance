"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format } from "date-fns";
import type { Debt, DebtPayment } from "@/types/database";

export default function DebtEvolutionChart({
  debt,
  payments,
}: {
  debt: Debt;
  payments: DebtPayment[];
}) {
  const sorted = [...payments].sort((a, b) => a.date.localeCompare(b.date));

  let balance = debt.principal_amount;
  const points = [
    { date: format(new Date(debt.start_date), "d MMM"), balance },
  ];

  sorted.forEach((p) => {
    balance -= Number(p.amount);
    points.push({ date: format(new Date(p.date), "d MMM"), balance: Math.max(0, balance) });
  });

  if (points.length < 2) {
    return (
      <div className="border border-line rounded-lg p-6 bg-white text-sm text-ink/50">
        Ajoute un premier remboursement pour voir l'évolution du solde.
      </div>
    );
  }

  return (
    <div className="border border-line rounded-lg p-4 bg-white">
      <p className="text-xs uppercase tracking-wide text-ink/50 mb-2">
        Évolution du solde restant
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={points}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E4E2DC" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat("fr-FR").format(value) + " FCFA"
            }
          />
          <Line type="monotone" dataKey="balance" stroke="#1F4D3D" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
