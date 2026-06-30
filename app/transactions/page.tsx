import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import AccountToggle from "@/components/AccountToggle";
import TransactionFilters from "@/components/TransactionFilters";
import TransactionRow from "@/components/TransactionRow";
import ExportButtons from "@/components/ExportButtons";
import type { Account, Transaction } from "@/types/database";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: {
    account?: string;
    type?: string;
    category?: string;
    from?: string;
    to?: string;
  };
}) {
  const account: Account = searchParams.account === "business" ? "business" : "personal";

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user!.id)
    .eq("account", account);

  if (searchParams.type === "expense" || searchParams.type === "income") {
    query = query.eq("type", searchParams.type);
  }
  if (searchParams.category) {
    query = query.eq("category", searchParams.category);
  }
  if (searchParams.from) {
    query = query.gte("date", searchParams.from);
  }
  if (searchParams.to) {
    query = query.lte("date", searchParams.to);
  }

  const { data } = await query
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  const transactions = (data ?? []) as Transaction[];

  const groups = new Map<string, Transaction[]>();
  transactions.forEach((t) => {
    const list = groups.get(t.date) ?? [];
    list.push(t);
    groups.set(t.date, list);
  });

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 pb-28">
      <Link href="/" className="text-sm text-ink/50">
        ← Retour
      </Link>
      <div className="flex items-center justify-between mt-2 mb-5">
        <h1 className="font-display text-2xl">Historique</h1>
        <ExportButtons transactions={transactions} account={account} />
      </div>

      <div className="mb-3">
        <AccountToggle current={account} />
      </div>

      <TransactionFilters />

      {transactions.length === 0 && (
        <p className="text-sm text-ink/50">Aucune transaction pour ces critères.</p>
      )}

      {Array.from(groups.entries()).map(([date, txs]) => (
        <div key={date} className="mb-4">
          <p className="text-xs uppercase tracking-wide text-ink/40 mb-1">
            {format(parseISO(date), "EEEE d MMMM", { locale: fr })}
          </p>
          <div className="bg-white border border-line rounded-lg px-4">
            {txs.map((t) => (
              <TransactionRow key={t.id} tx={t} />
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
