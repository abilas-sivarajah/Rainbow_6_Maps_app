import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "R6 Codex – Operator & Maps",
  description:
    "Datenbank für Rainbow Six: Operator, Fähigkeiten, Stats, Waffen und interaktive Maps Etage für Etage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full">
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border py-6 text-center text-sm text-muted">
          R6 Codex · inoffizielle Fan-Datenbank · Rainbow Six ist eine Marke von
          Ubisoft
        </footer>
      </body>
    </html>
  );
}
