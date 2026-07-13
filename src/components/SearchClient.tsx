"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { maps } from "@/data/maps";
import { OperatorAvatar, SideBadge, Tag } from "./ui";

export function SearchClient() {
  const { operators, weapons, t } = useLanguage();
  const [query, setQuery] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("q") ?? "";
  });

  const q = query.trim().toLowerCase();

  const setQ = (v: string) => {
    setQuery(v);
    const url = new URL(window.location.href);
    if (v) url.searchParams.set("q", v);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url.toString());
  };

  const opHits = useMemo(() => {
    if (!q) return [];
    return operators
      .filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          (o.realName?.toLowerCase().includes(q) ?? false) ||
          (o.faction?.toLowerCase().includes(q) ?? false) ||
          o.roles.some((r) => r.toLowerCase().includes(q)),
      )
      .slice(0, 12);
  }, [operators, q]);

  const wpHits = useMemo(() => {
    if (!q) return [];
    return weapons
      .filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          (w.type?.toLowerCase().includes(q) ?? false),
      )
      .slice(0, 12);
  }, [weapons, q]);

  const mapHits = useMemo(() => {
    if (!q) return [];
    return maps
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.location?.toLowerCase().includes(q) ?? false),
      )
      .slice(0, 12);
  }, [q]);

  const total = opHits.length + wpHits.length + mapHits.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-4 text-3xl font-black">{t("search.title")}</h1>
      <input
        autoFocus
        type="search"
        value={query}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("search.placeholder")}
        className="mb-8 w-full rounded-lg border border-border bg-surface px-4 py-3 text-base outline-none placeholder:text-muted focus:border-accent"
      />

      {!q ? (
        <p className="text-muted">{t("search.hint")}</p>
      ) : total === 0 ? (
        <p className="text-muted">{t("search.empty")}</p>
      ) : (
        <div className="flex flex-col gap-8">
          {opHits.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
                {t("search.operators")} ({opHits.length})
              </h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {opHits.map((o) => (
                  <Link
                    key={o.slug}
                    href={`/operators/${o.slug}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-accent/60 hover:bg-surface-2"
                  >
                    <OperatorAvatar
                      name={o.name}
                      accent={o.side === "attacker" ? "var(--color-attacker)" : "var(--color-defender)"}
                      size={40}
                    />
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{o.name}</div>
                      <div className="truncate text-xs text-muted">{o.faction}</div>
                    </div>
                    <span className="ml-auto">
                      <SideBadge side={o.side} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {wpHits.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
                {t("search.weapons")} ({wpHits.length})
              </h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {wpHits.map((w) => (
                  <Link
                    key={w.name}
                    href={`/weapons?name=${encodeURIComponent(w.name)}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-accent/60 hover:bg-surface-2"
                  >
                    <span className="font-semibold">{w.name}</span>
                    {w.type && <Tag>{w.type}</Tag>}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {mapHits.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
                {t("search.maps")} ({mapHits.length})
              </h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {mapHits.map((m) => (
                  <Link
                    key={m.id}
                    href={`/maps/${m.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-accent/60 hover:bg-surface-2"
                  >
                    <span className="font-semibold">{m.name}</span>
                    {m.location && (
                      <span className="text-xs text-muted">{m.location}</span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
