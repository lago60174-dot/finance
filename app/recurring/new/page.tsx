import Link from "next/link";
import { Suspense } from "react";
import RecurringForm from "@/components/RecurringForm";

export default function NewRecurringPage() {
  return (
    <main className="max-w-md mx-auto px-4 py-8 pb-28">
      <Link href="/more" className="text-sm text-ink/50">
        ← Retour
      </Link>
      <h1 className="font-display text-2xl mt-2 mb-6">Nouvelle règle récurrente</h1>
      <Suspense fallback={null}>
        <RecurringForm />
      </Suspense>
    </main>
  );
}
