"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { maps } from "@/data/maps";

export default function Home() {
  const { operators, weapons, t } = useLanguage();

  const stats = [
    { label: t("nav.operators"), value: operators.length, href: "/operators" },
    { label: t("nav.maps"), value: maps.length, href: "/maps" },
    { label: t("nav.weapons"), value: weapons.length, href: "/weapons" },
  ];

  const attackers = operators.filter((o) => o.side === "attacker").length;
  const defenders = operators.filter((o) => o.side === "defender").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="mb-14">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          {t("home.dbTitle")}
        </p>
        <h1 className="max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
          {t("home.title")}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          {t("home.subtitle")}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/operators"
            className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-bg transition-all hover:bg-accent-soft hover:scale-[1.01]"
          >
            {t("home.btn.operators")}
          </Link>
          <Link
            href="/maps"
            className="rounded-lg border border-border px-5 py-2.5 font-semibold transition-colors hover:bg-surface"
          >
            {t("home.btn.maps")}
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-border bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface-2"
          >
            <div className="text-4xl font-black tabular-nums">{s.value}</div>
            <div className="mt-1 text-muted">{s.label}</div>
          </Link>
        ))}
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="text-sm text-muted">{t("home.attackers")}</div>
          <div className="text-3xl font-bold text-attacker">{attackers}</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="text-sm text-muted">{t("home.defenders")}</div>
          <div className="text-3xl font-bold text-defender">{defenders}</div>
        </div>
      </section>
    </div>
  );
}
