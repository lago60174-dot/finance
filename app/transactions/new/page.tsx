import Link from "next/link";
import TransactionForm from "@/components/TransactionForm";

export default function NewTransactionPage() {
  return (
    <main className="max-w-md mx-auto px-4 py-8 pb-28">
      <Link href="/" className="text-sm text-ink/50">
        ← Retour
      </Link>
      <h1 className="font-display text-2xl mt-2 mb-6">Ajouter une transaction</h1>
      <TransactionForm />
    </main>
  );
}
