"use client";

import { useEffect, useState } from "react";

export default function NetworkStatusBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-clay text-white text-xs text-center py-1.5">
      Pas de connexion — certaines actions sont indisponibles.
    </div>
  );
}
