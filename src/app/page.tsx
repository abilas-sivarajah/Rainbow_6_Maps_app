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
import NewsSection from "@/components/NewsSection";
import { NEWS_ENABLED, REPLAYS_ENABLED, TRACKER_ENABLED } from "@/lib/features";

export default function Home() {
  const { operators, weapons, t } = useLanguage();
  const router = useRouter();
  const mounted = useMounted();

  const attackers = operators.filter((o) => o.side === "attacker").length;
  const defenders = operators.filter((o) => o.side === "defender").length;

  // Banner-Zeilen im Stil des Tracker-Banners für die Hauptbereiche.
  const sections = [
    {
      href: "/operators",
      emoji: "🎯",
      kicker: t("home.sec.operators.kicker"),
      title: t("home.sec.operators.title", { count: operators.length }),
      text: t("home.sec.operators.text", { atk: attackers, def: defenders }),
    },
    {
      href: "/maps",
      emoji: "🗺️",
      kicker: t("home.sec.maps.kicker"),
      title: t("home.sec.maps.title", { count: maps.length }),
      text: t("home.sec.maps.text"),
    },
    {
      href: "/weapons",
      emoji: "🔫",
      kicker: t("home.sec.weapons.kicker"),
      title: t("home.sec.weapons.title", { count: weapons.length }),
      text: t("home.sec.weapons.text"),
    },
    ...(REPLAYS_ENABLED
      ? [
          {
            href: "/replays",
            emoji: "🎬",
            kicker: t("home.sec.replays.kicker"),
            title: t("home.sec.replays.title"),
            text: t("home.sec.replays.text"),
          },
        ]
      : []),
  ];

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
          {TRACKER_ENABLED && (
            <Link
              href="/stats"
              className="rounded-lg border border-accent/60 px-5 py-2.5 font-semibold text-accent transition-all hover:bg-accent hover:text-bg"
            >
              📈 {t("home.btn.tracker")}
            </Link>
          )}
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

      {TRACKER_ENABLED && (
        <section className="mb-4">
          <Link
            href="/stats"
            className="group flex flex-wrap items-center gap-5 rounded-xl border border-accent/30 bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-accent/70 hover:bg-surface-2"
          >
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-accent/10 text-3xl">
              📈
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">
                {t("home.tracker.kicker")}
              </div>
              <div className="text-2xl font-black">{t("home.tracker.title")}</div>
              <p className="mt-1 text-sm text-muted">{t("home.tracker.text")}</p>
            </div>
            <span className="hidden shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg sm:block">
              {t("home.tracker.btn")}
            </span>
          </Link>
        </section>
      )}

      {sections.map((s) => (
        <section key={s.href} className="mb-4">
          <Link
            href={s.href}
            className="group flex flex-wrap items-center gap-5 rounded-xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface-2"
          >
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-accent/10 text-3xl">
              {s.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">
                {s.kicker}
              </div>
              <div className="text-2xl font-black">{s.title}</div>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </div>
            <span className="hidden shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg sm:block">
              {t("home.view")}
            </span>
          </Link>
        </section>
      ))}

      {NEWS_ENABLED && <NewsSection />}
    </div>
  );
}
