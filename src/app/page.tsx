"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { uniqueAbilityName, asset } from "@/data/r6";
import { maps } from "@/data/maps";
import { useMounted } from "@/lib/useMounted";
import { AssetImage } from "@/components/AssetImage";
import { OperatorAvatar, SideBadge, Tag } from "@/components/ui";

export default function Home() {
  const { operators, weapons, t } = useLanguage();
  const router = useRouter();
  const mounted = useMounted();

  const stats = [
    { label: t("nav.operators"), value: operators.length, href: "/operators" },
    { label: t("nav.maps"), value: maps.length, href: "/maps" },
    { label: t("nav.weapons"), value: weapons.length, href: "/weapons" },
  ];

  const attackers = operators.filter((o) => o.side === "attacker").length;
  const defenders = operators.filter((o) => o.side === "defender").length;

  // Operator des Tages: datumsabhängig, stabil pro Tag (nur clientseitig).
  const [dayNumber] = useState(() => {
    const start = Date.UTC(new Date().getUTCFullYear(), 0, 0);
    return Math.floor((Date.now() - start) / 86400000);
  });
  const featured = operators.length
    ? operators[dayNumber % operators.length]
    : undefined;
  const featAccent =
    featured?.side === "attacker"
      ? "var(--color-attacker)"
      : "var(--color-defender)";
  const featAbility = featured ? uniqueAbilityName(featured) : undefined;

  const goRandom = () => {
    if (!operators.length) return;
    const op = operators[Math.floor(Math.random() * operators.length)];
    router.push(`/operators/${op.slug}`);
  };

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
          <button
            onClick={goRandom}
            className="rounded-lg border border-border px-5 py-2.5 font-semibold transition-colors hover:bg-surface"
          >
            🎲 {t("home.random")}
          </button>
        </div>
      </section>

      {mounted && featured && (
        <section className="mb-4">
          <Link
            href={`/operators/${featured.slug}`}
            className="group flex items-center gap-5 rounded-xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface-2"
          >
            <AssetImage
              src={asset(featured.image ?? featured.icon)}
              alt={featured.name}
              className="h-20 w-20 shrink-0 rounded-lg bg-surface-2 object-cover object-top"
              fallback={<OperatorAvatar name={featured.name} accent={featAccent} size={80} />}
            />
            <div className="min-w-0 flex-1">
              <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">
                {t("home.featured")}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-2xl font-black">{featured.name}</span>
                <SideBadge side={featured.side} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                <span>{featured.faction}</span>
                {featAbility && <Tag>★ {featAbility}</Tag>}
              </div>
            </div>
            <span className="hidden shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg sm:block">
              {t("home.view")}
            </span>
          </Link>
        </section>
      )}

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
