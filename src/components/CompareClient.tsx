"use client";

import { useState } from "react";
import Link from "next/link";
import type { Operator } from "@/data/types";
import { useLanguage } from "@/context/LanguageContext";
import { uniqueAbilityName, asset } from "@/data/r6";
import { AssetImage } from "./AssetImage";
import { OperatorAvatar, SideBadge, StatPips } from "./ui";

function OperatorPicker({
  operators,
  value,
  onChange,
  placeholder,
}: {
  operators: Operator[];
  value: string;
  onChange: (slug: string) => void;
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
    >
      <option value="">{placeholder}</option>
      {operators.map((o) => (
        <option key={o.slug} value={o.slug}>
          {o.name}
        </option>
      ))}
    </select>
  );
}

function StatRow({
  label,
  a,
  b,
  higherIsBetter = true,
}: {
  label: string;
  a: number;
  b: number;
  higherIsBetter?: boolean;
}) {
  const aWins = higherIsBetter ? a > b : a < b;
  const bWins = higherIsBetter ? b > a : b < a;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border py-2 text-sm">
      <div className={`text-right font-semibold tabular-nums ${aWins ? "text-accent" : ""}`}>{a}</div>
      <div className="text-center text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className={`font-semibold tabular-nums ${bWins ? "text-accent" : ""}`}>{b}</div>
    </div>
  );
}

function OpHeader({ op }: { op: Operator }) {
  const accent =
    op.side === "attacker" ? "var(--color-attacker)" : "var(--color-defender)";
  return (
    <Link href={`/operators/${op.slug}`} className="group flex flex-col items-center gap-2 text-center">
      <AssetImage
        src={asset(op.image ?? op.icon)}
        alt={op.name}
        className="h-24 w-24 rounded-lg bg-surface-2 object-cover object-top"
        fallback={<OperatorAvatar name={op.name} accent={accent} size={96} />}
      />
      <div className="text-xl font-black group-hover:text-accent">{op.name}</div>
      <SideBadge side={op.side} />
      <div className="text-xs text-muted">{op.faction}</div>
    </Link>
  );
}

export function CompareClient() {
  const { operators, t } = useLanguage();

  const init = (key: string, fallbackIdx: number) => {
    if (typeof window === "undefined") return operators[fallbackIdx]?.slug ?? "";
    const s = new URLSearchParams(window.location.search).get(key);
    return operators.some((o) => o.slug === s) ? s! : operators[fallbackIdx]?.slug ?? "";
  };

  const [aSlug, setASlug] = useState(() => init("a", 0));
  const [bSlug, setBSlug] = useState(() => init("b", 1));

  const sync = (a: string, b: string) => {
    const url = new URL(window.location.href);
    if (a) url.searchParams.set("a", a); else url.searchParams.delete("a");
    if (b) url.searchParams.set("b", b); else url.searchParams.delete("b");
    window.history.replaceState(null, "", url.toString());
  };

  const a = operators.find((o) => o.slug === aSlug);
  const b = operators.find((o) => o.slug === bSlug);

  const primaries = (op?: Operator) =>
    op?.loadout.filter((l) => l.slot === "primary").map((l) => l.name) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-black">{t("compare.title")}</h1>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <OperatorPicker
          operators={operators}
          value={aSlug}
          placeholder={t("compare.select")}
          onChange={(v) => { setASlug(v); sync(v, bSlug); }}
        />
        <OperatorPicker
          operators={operators}
          value={bSlug}
          placeholder={t("compare.select")}
          onChange={(v) => { setBSlug(v); sync(aSlug, v); }}
        />
      </div>

      {a && b && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-start gap-4">
            <OpHeader op={a} />
            <div className="self-center text-sm font-black text-muted">VS</div>
            <OpHeader op={b} />
          </div>

          <StatRow label={t("ops.sort.speed")} a={a.speed} b={b.speed} />
          <StatRow label="Armor" a={a.armor} b={b.armor} />
          <StatRow label={t("compare.health")} a={a.health} b={b.health} />
          <StatRow label={t("ops.sort.difficulty")} a={a.difficulty} b={b.difficulty} higherIsBetter={false} />

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                {t("compare.ability")}
              </div>
              <div className="font-medium">{uniqueAbilityName(a) ?? "—"}</div>
              <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">
                {t("loadout.primary")}
              </div>
              <div className="text-muted">{primaries(a).join(", ") || "—"}</div>
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                {t("compare.ability")}
              </div>
              <div className="font-medium">{uniqueAbilityName(b) ?? "—"}</div>
              <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">
                {t("loadout.primary")}
              </div>
              <div className="text-muted">{primaries(b).join(", ") || "—"}</div>
            </div>
          </div>

          {/* Visuelle Stat-Balken je Operator */}
          <div className="mt-6 grid grid-cols-2 gap-6">
            {[a, b].map((op, i) => (
              <div key={i} className="flex flex-col gap-2">
                <StatPips
                  label={t("ops.sort.speed")}
                  value={op.speed}
                  color={op.side === "attacker" ? "var(--color-attacker)" : "var(--color-defender)"}
                />
                <StatPips
                  label={t("ops.sort.difficulty")}
                  value={op.difficulty}
                  color={op.side === "attacker" ? "var(--color-attacker)" : "var(--color-defender)"}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
