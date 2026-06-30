"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Debt } from "@/types/database";

export default function DebtPaymentForm({ debt }: { debt: Debt }) {
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
    if (value > debt.current_balance) {
      setError(`Le solde restant n'est que de ${debt.current_balance.toLocaleString("fr-FR")} FCFA.`);
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error: paymentError } = await supabase.from("debt_payments").insert({
      debt_id: debt.id,
      user_id: user!.id,
      amount: value,
      date,
      note: note || null,
    });

    if (paymentError) {
      setLoading(false);
      setError(paymentError.message);
      return;
    }

    const newBalance = debt.current_balance - value;
    const { error: updateError } = await supabase
      .from("debts")
      .update({
        current_balance: newBalance,
        status: newBalance <= 0 ? "paid" : "active",
      })
      .eq("id", debt.id);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.refresh();
    setAmount("");
    setNote("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border border-line rounded-lg bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-ink/50">Ajouter un remboursement</p>

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
        {loading ? "..." : "Enregistrer le remboursement"}
      </button>
    </form>
  );
}
