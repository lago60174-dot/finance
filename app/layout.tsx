import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import NetworkStatusBanner from "@/components/NetworkStatusBanner";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";

export const metadata: Metadata = {
  title: "Caisse — suivi financier",
  description: "Suivi des dépenses et revenus, personnel et Habynex.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Caisse",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1F4D3D",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="font-body min-h-screen">
        <NetworkStatusBanner />
        <RegisterServiceWorker />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
