"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type TransactionType,
  type Account,
} from "@/types/database";

export default function RecurringForm() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();

  const forcedSubscription = params.get("subscription") === "1";

  const [type, setType] = useState<TransactionType>("expense");
  const [account, setAccount] = useState<Account>("personal");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [dayOfMonth, setDayOfMonth] = useState("5");
  const [note, setNote] = useState("");
  const [isSubscription, setIsSubscription] = useState(forcedSubscription);
  const [serviceName, setServiceName] = useState("");
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
    const day = parseInt(dayOfMonth, 10);
    if (!value || value <= 0) {
      setError("Montant invalide.");
      return;
    }
    if (!day || day < 1 || day > 28) {
      setError("Le jour doit être entre 1 et 28.");
      return;
    }
    if (isSubscription && !serviceName.trim()) {
      setError("Donne un nom au service abonné (ex: Netflix).");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("recurring_transactions").insert({
      user_id: user!.id,
      type,
      amount: value,
      category,
      account,
      note: note || null,
      day_of_month: day,
      active: true,
      is_subscription: isSubscription,
      service_name: isSubscription ? serviceName.trim() : null,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(isSubscription ? "/subscriptions" : "/recurring");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!forcedSubscription && (
        <label className="flex items-center gap-2 text-sm border border-line rounded-md px-3 py-2 bg-white">
          <input
            type="checkbox"
            checked={isSubscription}
            onChange={(e) => setIsSubscription(e.target.checked)}
          />
          C'est un abonnement (Netflix, Canva, hébergement...)
        </label>
      )}

      {isSubscription && (
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">
            Nom du service
          </label>
          <input
            type="text"
            required
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            className="w-full border border-line rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-moss"
            placeholder="Ex: Netflix, Canva Pro, Vercel..."
          />
        </div>
      )}

      {!isSubscription && (
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
      )}

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
          Jour du mois (1-28)
        </label>
        <input
          type="number"
          min={1}
          max={28}
          required
          value={dayOfMonth}
          onChange={(e) => setDayOfMonth(e.target.value)}
          className="w-full border border-line rounded-md px-3 py-2 bg-white tabular focus:outline-none focus:ring-2 focus:ring-moss"
        />
        <p className="text-xs text-ink/40 mt-1">
          {isSubscription
            ? "Jour de renouvellement / prélèvement de l'abonnement."
            : "La transaction sera créée automatiquement chaque mois à partir de ce jour."}
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
          placeholder={isSubscription ? "Ex: plan Famille" : "Ex: Loyer appartement"}
        />
      </div>

      {error && <p className="text-sm text-expense">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-moss text-white rounded-md py-2.5 font-medium disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : isSubscription ? "Ajouter l'abonnement" : "Créer la règle récurrente"}
      </button>
    </form>
  );
}
