import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { LanguageProvider } from "@/context/LanguageContext";
import { PwaRegister } from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "R6 Codex – Operator & Maps",
  description:
    "Datenbank für Rainbow Six: Operator, Fähigkeiten, Stats, Waffen und interaktive Maps Etage für Etage.",
  applicationName: "R6 Codex",
  appleWebApp: { capable: true, title: "R6 Codex", statusBarStyle: "black-translucent" },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0c10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full">
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <PwaRegister />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border py-6 text-center text-sm text-muted">
            R6 Codex · inoffizielle Fan-Datenbank · Rainbow Six ist eine Marke von
            Ubisoft
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
