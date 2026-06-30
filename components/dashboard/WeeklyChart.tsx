"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function WeeklyChart({
  data,
}: {
  data: { week: string; total: number }[];
}) {
  if (data.length === 0) {
    return (
      <div className="border border-line rounded-lg p-6 bg-white text-sm text-ink/50">
        Pas encore assez de données pour afficher l'évolution.
      </div>
    );
  }

  return (
    <div className="border border-line rounded-lg p-4 bg-white">
      <p className="text-xs uppercase tracking-wide text-ink/50 mb-2">
        Dépenses par semaine
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E4E2DC" />
          <XAxis dataKey="week" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat("fr-FR").format(value) + " FCFA"
            }
          />
          <Bar dataKey="total" fill="#B3432D" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
