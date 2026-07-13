"use client";

import { useState, useMemo, useEffect } from "react";
import type { Weapon, Operator } from "@/data/types";
import { useLanguage } from "@/context/LanguageContext";
import { AssetImage } from "@/components/AssetImage";
import { StatBar, Tag } from "@/components/ui";
import { OperatorCard } from "@/components/OperatorCard";
import { asset } from "@/data/r6";

export function WeaponsBrowser() {
  const { weapons, operators, t } = useLanguage();
  
  const [selectedWeaponName, setSelectedWeaponName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);

  // Sync selected weapon with URL 'name' query parameter
  useEffect(() => {
    const checkUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const name = params.get("name");
      if (name) {
        const w = weapons.find(
          (wp) => wp.name.toLowerCase() === name.toLowerCase()
        );
        if (w) {
          setSelectedWeaponName(w.name);
          return;
        }
      }
      setSelectedWeaponName(null);
    };

    checkUrl();
    window.addEventListener("popstate", checkUrl);
    return () => window.removeEventListener("popstate", checkUrl);
  }, [weapons]);

  const handleSelectWeapon = (w: Weapon) => {
    setSelectedWeaponName(w.name);
    window.history.pushState(null, "", `?name=${encodeURIComponent(w.name)}`);
  };

  const handleBack = () => {
    setSelectedWeaponName(null);
    window.history.pushState(null, "", window.location.pathname);
  };

  const selectedWeapon = useMemo(() => {
    if (!selectedWeaponName) return null;
    return weapons.find(w => w.name.toLowerCase() === selectedWeaponName.toLowerCase()) || null;
  }, [selectedWeaponName, weapons]);

  // Extract all available weapon types for the filter tabs
  const weaponTypes = useMemo(() => {
    const types = new Set<string>();
    weapons.forEach((w) => {
      if (w.type) types.add(w.type);
    });
    return Array.from(types).sort();
  }, [weapons]);

  // Filter weapons based on search query and active type filter
  const filteredWeapons = useMemo(() => {
    return weapons.filter((w) => {
      const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (w.type && w.type.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = !activeType || w.type === activeType;

      return matchesSearch && matchesType;
    });
  }, [weapons, searchQuery, activeType]);

  // Group filtered weapons by type
  const weaponsByType = useMemo(() => {
    const grouped: Record<string, Weapon[]> = {};
    filteredWeapons.forEach((w) => {
      const type = w.type ?? "Sonstige";
      (grouped[type] ??= []).push(w);
    });
    return grouped;
  }, [filteredWeapons]);

  // Sort type headers alphabetically
  const groupedTypes = useMemo(() => {
    return Object.keys(weaponsByType).sort();
  }, [weaponsByType]);

  // Find operators that use the currently selected weapon
  const weaponOperators = useMemo(() => {
    if (!selectedWeapon) return [];
    return operators.filter((op) =>
      selectedWeapon.usedBy?.some(
        (name) => name.toLowerCase() === op.name.toLowerCase()
      )
    );
  }, [selectedWeapon, operators]);

  // Format weapon slot name to German
  const formatSlot = (slot?: string) => {
    if (!slot) return null;
    if (slot === "primary") return t("wp.slot.primary");
    if (slot === "secondary") return t("wp.slot.secondary");
    return slot.charAt(0).toUpperCase() + slot.slice(1);
  };

  if (selectedWeapon) {
    const w = selectedWeapon;
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="group mb-6 flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text transition-all hover:border-accent hover:bg-surface-2"
        >
          <svg
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          {t("ui.back")}
        </button>

        {/* Detail Card Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Left Column: Image & Basic Metadata */}
          <div className="flex flex-col gap-4 md:col-span-5">
            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-border bg-[#0e1118] p-6 shadow-inner">
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent" />
              <AssetImage
                src={asset(w.image)}
                alt={w.name}
                className="max-h-36 max-w-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Quick Metadata Box */}
            <div className="rounded-xl border border-border bg-surface p-5">
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted">
                {t("wp.details")}
              </h4>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted">{t("wp.category")}</span>
                  <span className="font-semibold text-text">{w.type ?? "Sonstige"}</span>
                </div>
                {w.slot && (
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted">{t("wp.slot")}</span>
                    <span className="font-semibold text-text">{formatSlot(w.slot)}</span>
                  </div>
                )}
                {w.magazine != null && (
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted">{t("wp.magazine")}</span>
                    <span className="font-semibold text-text">{w.magazine}</span>
                  </div>
                )}
                {w.fireModes && (
                  <div className="flex justify-between pb-1">
                    <span className="text-muted">{t("wp.fireModes")}</span>
                    <span className="font-semibold text-text">{w.fireModes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Title, Stats & Description */}
          <div className="flex flex-col gap-6 md:col-span-7">
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-accent">
                  {w.type ?? "Waffe"}
                </span>
                <h2 className="text-3xl font-black tracking-tight">{w.name}</h2>
              </div>

              {w.description && (
                <p className="mb-6 text-sm leading-relaxed text-muted">
                  {w.description}
                </p>
              )}

              {/* Stats Section */}
              <div className="border-t border-border/50 pt-6">
                <h3 className="mb-5 text-lg font-bold">{t("wp.performance")}</h3>

                {w.damage == null && w.rpm == null ? (
                  <p className="text-sm text-muted">{t("wp.noPerformance")}</p>
                ) : (
                  <div className="flex flex-col gap-5">
                    {/* Performance Sliders */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {typeof w.damage === "number" && (
                        <StatBar label={t("wp.damage")} value={w.damage} max={80} />
                      )}
                      {typeof w.rpm === "number" && (
                        <StatBar
                          label={t("wp.rpm")}
                          value={w.rpm}
                          max={1300}
                          suffix="RPM"
                        />
                      )}
                      {typeof w.mobility === "number" && (
                        <StatBar label={t("wp.mobility")} value={w.mobility} max={100} />
                      )}
                    </div>

                    {/* Secondary Stats */}
                    {(w.damageDetail || w.ammoType || w.maxAmmo) && (
                      <div className="mt-2 grid grid-cols-1 gap-3 rounded-lg bg-surface-2 p-4 text-sm sm:grid-cols-2">
                        {w.ammoType && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted">{t("wp.caliber")}</span>
                            <span className="font-semibold text-text">{w.ammoType}</span>
                          </div>
                        )}
                        {w.maxAmmo && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted">{t("wp.maxAmmo")}</span>
                            <span className="font-semibold text-text">{w.maxAmmo}</span>
                          </div>
                        )}
                        {w.damageDetail && (
                          <div className="sm:col-span-2 flex flex-col gap-0.5 border-t border-border/50 pt-2 mt-1">
                            <span className="text-xs text-muted">{t("wp.damageDropoff")}</span>
                            <span className="font-semibold text-text">{w.damageDetail}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Operators Section */}
        <div className="mt-8">
          <h3 className="mb-4 text-xl font-bold">
            {t("wp.usedBy")}{" "}
            <span className="text-sm font-normal text-muted">
              {t("wp.usedByCount", { count: weaponOperators.length })}
            </span>
          </h3>
          {weaponOperators.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {weaponOperators.map((op) => (
                <OperatorCard key={op.slug} operator={op} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted">
              {t("wp.noOperators")}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- OVERVIEW / LIST VIEW ---
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 text-3xl font-black">{t("wp.title")}</h1>
          <p className="text-muted">
            {t("wp.subtitle", { count: weapons.length })}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder={t("wp.search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2 pl-10 text-sm text-text placeholder-muted transition-all focus:border-accent focus:outline-none"
          />
          <svg
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Type Filter Buttons */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-border/50 pb-4">
        <button
          onClick={() => setActiveType(null)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-all ${
            !activeType
              ? "bg-accent text-bg"
              : "bg-surface border border-border hover:border-accent/40"
          }`}
        >
          {t("ui.all")}
        </button>
        {weaponTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-all ${
              activeType === type
                ? "bg-accent text-bg"
                : "bg-surface border border-border hover:border-accent/40"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Weapons Grid grouped by type */}
      {groupedTypes.length > 0 ? (
        <div className="flex flex-col gap-10">
          {groupedTypes.map((type) => (
            <section key={type}>
              <h2 className="mb-4 text-lg font-bold">
                {type}{" "}
                <span className="text-sm font-normal text-muted">
                  ({weaponsByType[type].length})
                </span>
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {weaponsByType[type].map((w) => (
                  <div
                    key={w.name}
                    onClick={() => handleSelectWeapon(w)}
                    className="group cursor-pointer rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface-2"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AssetImage
                          src={asset(w.image)}
                          alt={w.name}
                          className="h-8 w-14 shrink-0 object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
                        />
                        <span className="font-semibold text-text group-hover:text-accent transition-colors">
                          {w.name}
                        </span>
                      </div>
                      {w.magazine != null && <Tag>Mag {w.magazine}</Tag>}
                    </div>

                    {w.damage == null && w.rpm == null ? (
                      <p className="text-sm text-muted">{t("ui.noStats")}</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {typeof w.damage === "number" && (
                          <StatBar label={t("wp.damage")} value={w.damage} max={80} />
                        )}
                        {typeof w.rpm === "number" && (
                          <StatBar
                            label={t("wp.rpm")}
                            value={w.rpm}
                            max={1300}
                            suffix="RPM"
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-12 text-center text-muted">
          {t("wp.notFound")}
        </div>
      )}
    </div>
  );
}
export default WeaponsBrowser;
