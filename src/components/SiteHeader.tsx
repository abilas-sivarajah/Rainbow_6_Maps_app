"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export function SiteHeader() {
  const { language, setLanguage, t } = useLanguage();

  const nav = [
    { href: "/operators", labelKey: "nav.operators" as const },
    { href: "/maps", labelKey: "nav.maps" as const },
    { href: "/weapons", labelKey: "nav.weapons" as const },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="group flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-accent font-black text-bg">
            R6
          </span>
          <span className="text-lg font-bold tracking-tight">
            Codex
            <span className="ml-1 text-xs font-medium uppercase tracking-widest text-muted">
              Siege
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 font-medium text-muted transition-colors hover:bg-surface hover:text-text"
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>

          {/* Language Selector */}
          <div className="flex items-center gap-0.5 rounded-lg bg-surface-2 p-1 text-[10px] font-bold border border-border">
            {(["de", "en", "fr"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`rounded px-1.5 py-0.5 uppercase transition-all ${
                  language === lang
                    ? "bg-accent text-bg"
                    : "text-muted hover:text-text"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
