"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "@/types/database";

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";
}

export default function TransactionRow({ tx }: { tx: Transaction }) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await supabase.from("transactions").delete().eq("id", tx.id);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-line last:border-0">
      <div>
        <p className="text-sm font-medium">{tx.category}</p>
        {tx.note && <p className="text-xs text-ink/50">{tx.note}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`tabular text-sm font-medium ${
            tx.type === "income" ? "text-income" : "text-expense"
          }`}
        >
          {tx.type === "income" ? "+" : "−"}
          {formatFcfa(tx.amount)}
        </span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-ink/30 hover:text-expense"
          aria-label="Supprimer"
        >
          ✕
        </button>
        <Link
          href={`/transactions/${tx.id}/edit`}
          className="text-xs text-ink/30 hover:text-moss"
          aria-label="Modifier"
        >
          ✎
        </Link>
      </div>
    </div>
  );
}
