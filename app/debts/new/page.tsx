import Link from "next/link";
import DebtForm from "@/components/debts/DebtForm";

export default function NewDebtPage() {
  return (
    <main className="max-w-md mx-auto px-4 py-8 pb-28">
      <Link href="/debts" className="text-sm text-ink/50">
        ← Retour
      </Link>
      <h1 className="font-display text-2xl mt-2 mb-6">Nouvelle dette</h1>
      <DebtForm />
    </main>
  );
}
