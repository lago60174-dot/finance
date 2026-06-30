"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Account } from "@/types/database";

export default function GoalForm() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [account, setAccount] = useState<Account>("personal");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const value = parseFloat(targetAmount);
    if (!name.trim()) {
      setError("Donne un nom à cet objectif.");
      return;
    }
    if (!value || value <= 0) {
      setError("Montant cible invalide.");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("savings_goals").insert({
      user_id: user!.id,
      account,
      name: name.trim(),
      target_amount: value,
      target_date: targetDate || null,
      note: note || null,
      status: "active",
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/goals");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">
          Nom de l'objectif
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-line rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-moss"
          placeholder="Ex: Ordinateur portable, Fonds d'urgence..."
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">
          Montant cible (FCFA)
        </label>
        <input
          type="number"
          inputMode="numeric"
          required
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
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
          Date cible (optionnel)
        </label>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="w-full border border-line rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-moss"
        />
        <p className="text-xs text-ink/40 mt-1">
          Si tu en donnes une, je calcule combien épargner par mois pour
          l'atteindre à temps.
        </p>
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
        {loading ? "Enregistrement..." : "Créer l'objectif"}
      </button>
    </form>
  );
}
