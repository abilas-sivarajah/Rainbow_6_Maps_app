"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export function SiteHeader() {
  const { language, setLanguage, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = [
    { href: "/operators", labelKey: "nav.operators" as const },
    { href: "/maps", labelKey: "nav.maps" as const },
    { href: "/weapons", labelKey: "nav.weapons" as const },
    { href: "/compare", labelKey: "nav.compare" as const },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="group flex items-center gap-2" onClick={closeMenu}>
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
        <div className="flex items-center gap-2">
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
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

          {/* Icons: Search & Favorites */}
          <div className="flex items-center gap-0.5">
            <Link
              href="/search"
              aria-label={t("search.title")}
              title={t("search.title")}
              onClick={closeMenu}
              className="grid h-9 w-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-text"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </Link>
            <Link
              href="/favorites"
              aria-label={t("fav.title")}
              title={t("fav.title")}
              onClick={closeMenu}
              className="grid h-9 w-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-text"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </Link>
          </div>

          {/* Desktop Language Selector */}
          <div className="hidden md:flex items-center gap-0.5 rounded-lg bg-surface-2 p-1 text-[10px] font-bold border border-border">
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

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex md:hidden h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-semibold text-text transition-colors hover:bg-surface-2"
            aria-label="Menu"
          >
            <span>{t("nav.menu")}</span>
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Panel */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-bg/95 backdrop-blur-md px-4 py-3 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-1.5">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="flex items-center rounded-md px-3 py-2 text-base font-semibold text-muted transition-colors hover:bg-surface hover:text-text"
              >
                {t(item.labelKey)}
              </Link>
            ))}

            {/* Mobile Language Selector inside Dropdown */}
            <div className="mt-2 border-t border-border pt-2.5">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5 px-3">
                {language === "de" ? "Sprache" : language === "fr" ? "Langue" : "Language"}
              </span>
              <div className="flex gap-1.5 px-3">
                {(["de", "en", "fr"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      closeMenu();
                    }}
                    className={`flex-1 rounded-md py-1.5 text-center text-xs font-bold uppercase transition-all border ${
                      language === lang
                        ? "bg-accent border-accent text-bg"
                        : "border-border text-muted bg-surface hover:text-text"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
