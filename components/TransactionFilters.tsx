"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/types/database";

const ALL_CATEGORIES = Array.from(
  new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])
);

export default function TransactionFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const type = params.get("type") ?? "all";
  const category = params.get("category") ?? "all";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "all") {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    router.push(`/transactions?${next.toString()}`);
  }

  function reset() {
    const next = new URLSearchParams(params.toString());
    ["type", "category", "from", "to"].forEach((k) => next.delete(k));
    router.push(`/transactions?${next.toString()}`);
  }

  const hasFilters = type !== "all" || category !== "all" || from || to;

  return (
    <div className="border border-line rounded-lg bg-white p-3 mb-5 flex flex-wrap gap-2 items-end text-sm">
      <div>
        <label className="block text-xs text-ink/50 mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => update("type", e.target.value)}
          className="border border-line rounded-md px-2 py-1.5 bg-white"
        >
          <option value="all">Tous</option>
          <option value="expense">Dépenses</option>
          <option value="income">Revenus</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-ink/50 mb-1">Catégorie</label>
        <select
          value={category}
          onChange={(e) => update("category", e.target.value)}
          className="border border-line rounded-md px-2 py-1.5 bg-white"
        >
          <option value="all">Toutes</option>
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-ink/50 mb-1">Du</label>
        <input
          type="date"
          value={from}
          onChange={(e) => update("from", e.target.value)}
          className="border border-line rounded-md px-2 py-1.5 bg-white"
        />
      </div>

      <div>
        <label className="block text-xs text-ink/50 mb-1">Au</label>
        <input
          type="date"
          value={to}
          onChange={(e) => update("to", e.target.value)}
          className="border border-line rounded-md px-2 py-1.5 bg-white"
        />
      </div>

      {hasFilters && (
        <button onClick={reset} className="text-xs text-ink/40 underline pb-2">
          Réinitialiser
        </button>
      )}
    </div>
  );
}
