import Link from "next/link";
import Image from "next/image";
import type { GameMap } from "@/data/types";
import { Tag } from "./ui";

export function MapCard({ map }: { map: GameMap }) {
  return (
    <Link
      href={`/maps/${map.id}`}
      className="group overflow-hidden rounded-xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:border-accent/60"
    >
      <div className="relative aspect-video overflow-hidden bg-surface-2">
        <Image
          src={map.thumbnail}
          alt={map.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold">{map.name}</h3>
          <span className="text-sm text-muted">
            {map.floors.length} Etagen
          </span>
        </div>
        {map.location && (
          <p className="mb-3 text-sm text-muted">{map.location}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {map.playlists.map((p) => (
            <Tag key={p}>{p}</Tag>
          ))}
        </div>
      </div>
    </Link>
  );
}
