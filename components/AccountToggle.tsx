"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Account } from "@/types/database";

export default function AccountToggle({ current }: { current: Account }) {
  const router = useRouter();
  const params = useSearchParams();

  function setAccount(account: Account) {
    const next = new URLSearchParams(params.toString());
    next.set("account", account);
    router.push(`/?${next.toString()}`);
  }

  return (
    <div className="inline-flex border border-line rounded-md overflow-hidden text-sm">
      {(["personal", "business"] as Account[]).map((a) => (
        <button
          key={a}
          onClick={() => setAccount(a)}
          className={`px-3 py-1.5 ${
            current === a ? "bg-moss text-white" : "bg-white text-ink/70"
          }`}
        >
          {a === "personal" ? "Personnel" : "Habynex"}
        </button>
      ))}
    </div>
  );
}
