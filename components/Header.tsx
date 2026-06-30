"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between mb-6">
      <Link href="/" className="font-display text-2xl flex items-center gap-2">
        <img src="/icons/icon-192.png" alt="" width={28} height={28} className="rounded-md" />
        Caisse
      </Link>
      <button
        onClick={logout}
        aria-label="Déconnexion"
        className="text-ink/40 p-2 -mr-2"
      >
        <LogOut size={20} />
      </button>
    </header>
  );
}
