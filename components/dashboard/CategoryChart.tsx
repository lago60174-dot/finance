"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#B3432D", "#C9622B", "#1F4D3D", "#2F7A55", "#5B4636", "#8A8678", "#3A3F47"];

export default function CategoryChart({
  data,
}: {
  data: { category: string; total: number }[];
}) {
  if (data.length === 0) {
    return (
      <div className="border border-line rounded-lg p-6 bg-white text-sm text-ink/50">
        Pas encore de dépense ce mois-ci.
      </div>
    );
  }

  return (
    <div className="border border-line rounded-lg p-4 bg-white">
      <p className="text-xs uppercase tracking-wide text-ink/50 mb-2">
        Répartition des dépenses
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="category"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat("fr-FR").format(value) + " FCFA"
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
