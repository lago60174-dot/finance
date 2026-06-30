"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Plus, Menu } from "lucide-react";

const MORE_PATHS = ["/more", "/recurring", "/subscriptions", "/debts", "/goals", "/advice"];

const LEFT_ITEMS = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/transactions", label: "Historique", icon: History },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/login")) return null;

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const moreActive = MORE_PATHS.some((p) => pathname.startsWith(p));

  function NavLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof Home; active: boolean }) {
    return (
      <Link
        href={href}
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] ${
          active ? "text-moss" : "text-ink/40"
        }`}
      >
        <Icon size={20} strokeWidth={active ? 2.4 : 2} />
        {label}
      </Link>
    );
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-line"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="relative max-w-md mx-auto flex items-center h-16 px-2">
        {LEFT_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} active={isActive(item.href)} />
        ))}

        {/* Espace réservé au centre pour le bouton flottant */}
        <div className="flex-1" />

        <NavLink href="/more" label="Plus" icon={Menu} active={moreActive} />

        <Link
          href="/transactions/new"
          aria-label="Ajouter une transaction"
          className="absolute left-1/2 -translate-x-1/2 -top-5 bg-moss text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
        >
          <Plus size={24} />
        </Link>
      </div>
    </nav>
  );
}
