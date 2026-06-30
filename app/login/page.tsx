"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <img src="/icons/icon-192.png" alt="" width={48} height={48} className="rounded-xl mb-3" />
        <h1 className="font-display text-3xl mb-1">Caisse</h1>
        <p className="text-sm text-ink/60 mb-8">
          {mode === "signin" ? "Connecte-toi à ton compte." : "Crée ton compte."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </div>

          {error && <p className="text-sm text-expense">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-moss text-white rounded-md py-2 font-medium disabled:opacity-50"
          >
            {loading ? "..." : mode === "signin" ? "Se connecter" : "Créer le compte"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 text-sm text-ink/60 underline"
        >
          {mode === "signin" ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </main>
  );
}
