"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { SavingsGoal } from "@/types/database";

export default function GoalContributionForm({
  goal,
  currentSaved,
}: {
  goal: SavingsGoal;
  currentSaved: number;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setError("Montant invalide.");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error: contribError } = await supabase.from("goal_contributions").insert({
      goal_id: goal.id,
      user_id: user!.id,
      amount: value,
      date,
      note: note || null,
    });

    if (contribError) {
      setLoading(false);
      setError(contribError.message);
      return;
    }

    const newSaved = currentSaved + value;
    if (newSaved >= goal.target_amount && goal.status === "active") {
      await supabase.from("savings_goals").update({ status: "completed" }).eq("id", goal.id);
    }

    setLoading(false);
    router.refresh();
    setAmount("");
    setNote("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border border-line rounded-lg bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-ink/50">Ajouter une contribution</p>

      <div className="flex gap-2">
        <input
          type="number"
          inputMode="numeric"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 border border-line rounded-md px-3 py-2 bg-white tabular focus:outline-none focus:ring-2 focus:ring-moss"
          placeholder="Montant FCFA"
        />
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-line rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-moss"
        />
      </div>

      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full border border-line rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-moss"
        placeholder="Note (optionnel)"
      />

      {error && <p className="text-sm text-expense">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-moss text-white rounded-md py-2 font-medium disabled:opacity-50"
      >
        {loading ? "..." : "Enregistrer la contribution"}
      </button>
    </form>
  );
}
