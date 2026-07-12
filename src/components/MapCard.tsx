import Link from "next/link";
import Image from "next/image";
import type { GameMap } from "@/data/types";
import { Tag } from "./ui";

export function MapCard({ map }: { map: GameMap }) {
  const accent = map.accent ?? "var(--color-accent)";
  // Offizielles Vorschaubild bevorzugen, sonst erste Etage als Fallback.
  const thumb = map.thumbnail ?? map.floors[0]?.image;

  return (
    <Link
      href={`/maps/${map.id}`}
      className="group overflow-hidden rounded-xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:border-accent/60"
    >
      <div className="relative aspect-video overflow-hidden bg-[#0e1118]">
        {thumb ? (
          <Image
            src={thumb}
            alt={`${map.name} – Vorschau`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 35%, #0e1118), #0e1118)`,
            }}
          />
        )}
        {/* Farbakzent + Abdunklung unten für Lesbarkeit des Badges */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background: `linear-gradient(180deg, transparent 55%, #0a0c10 100%)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1"
          style={{ background: accent }}
        />
        <span className="absolute bottom-2 left-2 rounded-md bg-bg/70 px-2 py-1 text-xs font-medium text-text backdrop-blur">
          {map.floors.length} Etagen
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold">{map.name}</h3>
        {map.location && (
          <p className="mb-3 text-sm text-muted">{map.location}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {map.playlists?.map((p) => (
            <Tag key={p}>{p}</Tag>
          ))}
        </div>
      </div>
    </Link>
  );
}
