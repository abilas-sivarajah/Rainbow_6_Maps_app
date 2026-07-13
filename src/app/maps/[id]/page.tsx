import type { Metadata } from "next";
import { maps, getMap } from "@/data/maps";
import { MapDetailClient } from "@/components/MapDetailClient";

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

export default async function MapDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MapDetailClient id={id} />;
}
