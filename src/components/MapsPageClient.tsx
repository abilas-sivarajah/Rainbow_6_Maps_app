"use client";

import { useLanguage } from "@/context/LanguageContext";
import { maps } from "@/data/maps";
import { MapCard } from "@/components/MapCard";

export function MapsPageClient() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-black">{t("maps.title")}</h1>
      <p className="mb-8 text-muted">
        {t("maps.subtitle")}
      </p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {maps.map((map) => (
          <MapCard key={map.id} map={map} />
        ))}
      </div>
    </div>
  );
}
