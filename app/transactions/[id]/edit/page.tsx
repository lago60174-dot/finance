import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TransactionForm from "@/components/TransactionForm";
import type { Transaction } from "@/types/database";

export default async function EditTransactionPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!data) notFound();

  return (
    <main className="max-w-md mx-auto px-4 py-8 pb-28">
      <Link href="/transactions" className="text-sm text-ink/50">
        ← Retour
      </Link>
      <h1 className="font-display text-2xl mt-2 mb-6">Modifier la transaction</h1>
      <TransactionForm existing={data as Transaction} />
    </main>
  );
}
