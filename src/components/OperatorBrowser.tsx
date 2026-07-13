"use client";

import { useMemo, useState } from "react";
import type { Side } from "@/data/types";
import { OperatorCard } from "./OperatorCard";
import { useLanguage } from "@/context/LanguageContext";

type SideFilter = "all" | Side;

export function OperatorBrowser() {
  const { operators, t } = useLanguage();
  const [query, setQuery] = useState("");
  const [side, setSide] = useState<SideFilter>("all");
  const [role, setRole] = useState<string>("all");

  // Dynamically extract all available roles based on current localized operators
  const roles = useMemo(() => {
    const set = new Set<string>();
    operators.forEach((o) => {
      o.roles.forEach((r) => set.add(r));
    });
    return Array.from(set).sort();
  }, [operators]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return operators.filter((op) => {
      if (side !== "all" && op.side !== side) return false;
      if (role !== "all" && !op.roles.includes(role)) return false;
      if (!q) return true;
      return (
        op.name.toLowerCase().includes(q) ||
        (op.realName?.toLowerCase().includes(q) ?? false) ||
        (op.faction?.toLowerCase().includes(q) ?? false) ||
        op.loadout.some((l) => l.name.toLowerCase().includes(q))
      );
    });
  }, [operators, query, side, role]);

  const sideOptions: { value: SideFilter; labelKey: "ui.all" | "home.attackers" | "home.defenders" }[] = [
    { value: "all", labelKey: "ui.all" },
    { value: "attacker", labelKey: "home.attackers" },
    { value: "defender", labelKey: "home.defenders" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 md:flex-row md:items-center md:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("ops.search.placeholder")}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent md:max-w-xs"
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-border bg-bg p-1">
            {sideOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSide(opt.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  side === opt.value
                    ? "bg-accent text-bg"
                    : "text-muted hover:text-text"
                }`}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="all">{t("ops.allRoles")}</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted">
        {t("ops.count", { filtered: filtered.length, total: operators.length })}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted">
          {t("ops.notFound")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((op) => (
            <OperatorCard key={op.slug} operator={op} />
          ))}
        </div>
      )}
    </div>
  );
}
