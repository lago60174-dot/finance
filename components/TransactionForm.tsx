"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type TransactionType,
  type Account,
  type Transaction,
} from "@/types/database";

export default function TransactionForm({
  existing,
}: {
  existing?: Transaction;
}) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!existing;

  const [type, setType] = useState<TransactionType>(existing?.type ?? "expense");
  const [account, setAccount] = useState<Account>(existing?.account ?? "personal");
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");
  const [category, setCategory] = useState<string>(
    existing?.category ?? EXPENSE_CATEGORIES[0]
  );
  const [date, setDate] = useState(
    existing?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [note, setNote] = useState(existing?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function switchType(next: TransactionType) {
    setType(next);
    setCategory(next === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setError("Montant invalide.");
      return;
    }

    setLoading(true);

    let error;
    if (isEdit) {
      ({ error } = await supabase
        .from("transactions")
        .update({
          type,
          amount: value,
          category,
          account,
          note: note || null,
          date,
        })
        .eq("id", existing!.id));
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      ({ error } = await supabase.from("transactions").insert({
        user_id: user!.id,
        type,
        amount: value,
        category,
        account,
        note: note || null,
        date,
      }));
    }

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(isEdit ? "/transactions" : "/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="inline-flex border border-line rounded-md overflow-hidden text-sm">
        <button
          type="button"
          onClick={() => switchType("expense")}
          className={`px-4 py-2 ${type === "expense" ? "bg-expense text-white" : "bg-white text-ink/70"}`}
        >
          Dépense
        </button>
        <button
          type="button"
          onClick={() => switchType("income")}
          className={`px-4 py-2 ${type === "income" ? "bg-income text-white" : "bg-white text-ink/70"}`}
        >
          Revenu
        </button>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">
          Montant (FCFA)
        </label>
        <input
          type="number"
          inputMode="numeric"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-line rounded-md px-3 py-2 bg-white text-lg tabular focus:outline-none focus:ring-2 focus:ring-moss"
          placeholder="0"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">
          Catégorie
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-line rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-moss"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">
          Compte
        </label>
        <div className="inline-flex border border-line rounded-md overflow-hidden text-sm">
          {(["personal", "business"] as Account[]).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAccount(a)}
              className={`px-4 py-2 ${account === a ? "bg-moss text-white" : "bg-white text-ink/70"}`}
            >
              {a === "personal" ? "Personnel" : "Habynex"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">
          Date
        </label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-line rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-moss"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">
          Note (optionnel)
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border border-line rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-moss"
          placeholder="Ex: taxi vers le bureau"
        />
      </div>

      {error && <p className="text-sm text-expense">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-moss text-white rounded-md py-2.5 font-medium disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Enregistrer"}
      </button>
    </form>
  );
}
