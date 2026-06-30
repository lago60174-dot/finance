import Link from "next/link";
import GoalForm from "@/components/goals/GoalForm";

export default function NewGoalPage() {
  return (
    <main className="max-w-md mx-auto px-4 py-8 pb-28">
      <Link href="/goals" className="text-sm text-ink/50">
        ← Retour
      </Link>
      <h1 className="font-display text-2xl mt-2 mb-6">Nouvel objectif</h1>
      <GoalForm />
    </main>
  );
}
