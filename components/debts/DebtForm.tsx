"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Account } from "@/types/database";

export default function DebtForm() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [account, setAccount] = useState<Account>("personal");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const value = parseFloat(principal);
    if (!name.trim()) {
      setError("Donne un nom à cette dette.");
      return;
    }
    if (!value || value <= 0) {
      setError("Montant invalide.");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("debts").insert({
      user_id: user!.id,
      account,
      name: name.trim(),
      principal_amount: value,
      current_balance: value,
      interest_rate: interestRate ? parseFloat(interestRate) : null,
      target_date: targetDate || null,
      note: note || null,
      status: "active",
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/debts");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">
          Nom de la dette
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-line rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-moss"
          placeholder="Ex: Prêt matériel, Crédit MTN..."
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">
          Montant initial (FCFA)
        </label>
        <input
          type="number"
          inputMode="numeric"
          required
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          className="w-full border border-line rounded-md px-3 py-2 bg-white text-lg tabular focus:outline-none focus:ring-2 focus:ring-moss"
          placeholder="0"
        />
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
          Taux d'intérêt annuel % (optionnel)
        </label>
        <input
          type="number"
          step="0.1"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          className="w-full border border-line rounded-md px-3 py-2 bg-white tabular focus:outline-none focus:ring-2 focus:ring-moss"
          placeholder="Ex: 5"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">
          Date cible de remboursement (optionnel)
        </label>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
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
        />
      </div>

      {error && <p className="text-sm text-expense">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-moss text-white rounded-md py-2.5 font-medium disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : "Créer la dette"}
      </button>
    </form>
  );
}
