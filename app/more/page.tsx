import Link from "next/link";
import { Repeat, Smartphone, Landmark, Target, Lightbulb, ChevronRight } from "lucide-react";

const ITEMS = [
  {
    href: "/recurring",
    label: "Transactions récurrentes",
    desc: "Loyer, salaire, et autres montants fixes mensuels.",
    icon: Repeat,
  },
  {
    href: "/subscriptions",
    label: "Abonnements",
    desc: "Netflix, Canva, hébergement... avec coût total mensuel.",
    icon: Smartphone,
  },
  {
    href: "/debts",
    label: "Dettes",
    desc: "Plan de remboursement, % remboursé, évolution.",
    icon: Landmark,
  },
  {
    href: "/goals",
    label: "Objectifs & achats planifiés",
    desc: "Épargne ciblée pour un achat ou un fonds d'urgence.",
    icon: Target,
  },
  {
    href: "/advice",
    label: "Conseils",
    desc: "Analyse de tes habitudes, dettes et abonnements.",
    icon: Lightbulb,
  },
] as const;

export default function MorePage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8 pb-28">
      <Link href="/" className="text-sm text-ink/50">
        ← Retour
      </Link>
      <h1 className="font-display text-2xl mt-2 mb-5">Plus</h1>

      <div className="bg-white border border-line rounded-lg divide-y divide-line">
        {ITEMS.map(({ href, label, desc, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 p-4">
            <div className="bg-moss/10 text-moss rounded-md p-2">
              <Icon size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-ink/50">{desc}</p>
            </div>
            <ChevronRight size={16} className="text-ink/30" />
          </Link>
        ))}
      </div>
    </main>
  );
}
