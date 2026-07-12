import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { maps, getMap } from "@/data/maps";
import { MapViewer } from "@/components/MapViewer";
import { Tag } from "@/components/ui";

export function generateStaticParams() {
  return maps.map((m) => ({ id: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const map = getMap(id);
  if (!map) return { title: "Map nicht gefunden · R6 Codex" };
  return {
    title: `${map.name} · R6 Codex`,
    description: `${map.name} – interaktiver Etagen-Viewer mit ${map.floors.length} Etagen.`,
  };
}

export default async function MapDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const map = getMap(id);
  if (!map) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/maps"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-text"
      >
        ← Zurück zu allen Maps
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
        <div className="flex flex-wrap gap-2">
          {map.playlists.map((p) => (
            <Tag key={p}>{p}</Tag>
          ))}
        </div>
      </div>

      <MapViewer map={map} />
    </div>
  );
}
