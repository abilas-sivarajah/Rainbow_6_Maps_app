import Link from "next/link";
import type { GameMap } from "@/data/types";
import { Tag } from "./ui";

export function MapCard({ map }: { map: GameMap }) {
  const accent = map.accent ?? "var(--color-accent)";
  return (
    <Link
      href={`/maps/${map.id}`}
      className="group overflow-hidden rounded-xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:border-accent/60"
    >
      <div
        className="relative flex aspect-video items-end overflow-hidden p-4"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 35%, #0e1118), #0e1118)`,
        }}
      >
        <div
          className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full opacity-40 blur-2xl"
          style={{ background: accent }}
        />
        <span className="rounded-md bg-bg/60 px-2 py-1 text-xs font-medium text-text">
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
