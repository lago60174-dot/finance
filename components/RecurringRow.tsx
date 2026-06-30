"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { RecurringTransaction } from "@/types/database";

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";
}

export default function RecurringRow({ rule }: { rule: RecurringTransaction }) {
  const router = useRouter();
  const supabase = createClient();

  async function toggleActive() {
    await supabase
      .from("recurring_transactions")
      .update({ active: !rule.active })
      .eq("id", rule.id);
    router.refresh();
  }

  async function remove() {
    await supabase.from("recurring_transactions").delete().eq("id", rule.id);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-line last:border-0">
      <div>
        <p className="text-sm font-medium">
          {rule.is_subscription ? `📱 ${rule.service_name}` : rule.category}
          {rule.note ? ` — ${rule.note}` : ""}
        </p>
        <p className="text-xs text-ink/50">
          Le {rule.day_of_month} de chaque mois ·{" "}
          {rule.account === "personal" ? "Personnel" : "Habynex"}
          {rule.is_subscription ? ` · ${rule.category}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`tabular text-sm font-medium ${
            rule.type === "income" ? "text-income" : "text-expense"
          }`}
        >
          {rule.type === "income" ? "+" : "−"}
          {formatFcfa(rule.amount)}
        </span>
        <button
          onClick={toggleActive}
          className={`text-xs px-2 py-1 rounded-md border ${
            rule.active
              ? "border-moss text-moss"
              : "border-line text-ink/40"
          }`}
        >
          {rule.active ? "Active" : "En pause"}
        </button>
        <button onClick={remove} className="text-xs text-ink/30 hover:text-expense">
          ✕
        </button>
      </div>
    </div>
  );
}
