"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { MapFloorViewer } from "@/components/MapFloorViewer";
import { Tag } from "@/components/ui";
import { getMap } from "@/data/maps";

export function MapDetailClient({ id }: { id: string }) {
  const { t } = useLanguage();
  const map = getMap(id);
  if (!map) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/maps"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-text transition-colors"
      >
        {t("maps.back")}
      </Link>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">{map.name}</h1>
          {map.location && <p className="text-muted">{map.location}</p>}
          {map.description && (
            <p className="mt-2 max-w-2xl text-sm text-muted">
              {map.description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tag>{t("maps.floorsBadge", { count: map.floors.length })}</Tag>
          {map.playlists?.map((p) => (
            <Tag key={p}>{p}</Tag>
          ))}
        </div>
      </div>

      <MapFloorViewer map={map} />

      <p className="mt-3 text-sm text-muted">
        {t("maps.viewerHelp")}
      </p>
    </div>
  );
}
