import type { GameMap, MapFloor } from "./types";
import manifest from "../../public/maps-img/manifest.json";

// Die Etagen-Bilder werden aus den Original-Viewern gerendert (siehe
// scripts-Hinweis in der README) und im Manifest gesammelt. Hier werden sie mit
// den Map-Metadaten (Name, Ort, Playlists) zusammengeführt.
const floorsFor = (id: string): MapFloor[] =>
  ((manifest as Record<string, MapFloor[]>)[id] ?? []).map((f) => ({
    id: f.id,
    name: f.name,
    image: f.image,
    w: f.w,
    h: f.h,
  }));

interface MapMeta {
  id: string;
  name: string;
  location?: string;
  playlists?: string[];
  accent?: string;
}

const META: MapMeta[] = [
  { id: "oregon", name: "Oregon", location: "Oregon, USA", playlists: ["Ranked", "Standard"], accent: "#ff7a1a" },
  { id: "bank", name: "Bank", location: "Los Angeles, USA", playlists: ["Ranked", "Standard"], accent: "#4aa3ff" },
  { id: "villa", name: "Villa", location: "Italien", playlists: ["Ranked", "Standard"], accent: "#e0b64a" },
  { id: "club", name: "Clubhouse", location: "Deutschland", playlists: ["Ranked", "Standard"], accent: "#c0392b" },
  { id: "kafe", name: "Kafe Dostoyevsky", location: "Moskau, Russland", playlists: ["Ranked", "Standard"], accent: "#d35400" },
  { id: "border", name: "Border", location: "Naher Osten", playlists: ["Ranked", "Standard"], accent: "#16a085" },
  { id: "chalet", name: "Chalet", location: "Französische Alpen", playlists: ["Ranked", "Standard"], accent: "#8e6a4a" },
  { id: "coastline", name: "Coastline", location: "Ibiza, Spanien", playlists: ["Ranked", "Standard"], accent: "#00a8cc" },
  { id: "consulate", name: "Consulate", location: "Elfenbeinküste", playlists: ["Ranked", "Standard"], accent: "#2c7be5" },
  { id: "emerald", name: "Emerald Plains", location: "Irland", playlists: ["Ranked", "Standard"], accent: "#27ae60" },
  { id: "labs", name: "Nighthaven Labs", location: "Nighthaven", playlists: ["Ranked", "Standard"], accent: "#9b59b6" },
  { id: "lair", name: "Lair", location: "Nighthaven", playlists: ["Ranked", "Standard"], accent: "#6c5ce7" },
  { id: "skyscraper", name: "Skyscraper", location: "Nagoya, Japan", playlists: ["Ranked", "Standard"], accent: "#e84393" },
  { id: "casino", name: "Calypso Casino", location: "Las Vegas, USA", playlists: ["Custom"], accent: "#f39c12" },
  { id: "fortress", name: "Fortress", location: "Marokko", playlists: ["Standard"], accent: "#d35400" },
  { id: "kanal", name: "Kanal", location: "Hamburg, Deutschland", playlists: ["Ranked", "Standard"], accent: "#2980b9" },
  { id: "outback", name: "Outback", location: "Australien", playlists: ["Ranked", "Standard"], accent: "#e67e22" },
  { id: "themepark", name: "Theme Park", location: "Hongkong", playlists: ["Standard"], accent: "#2c3e50" },
];

export const maps: GameMap[] = META.map((m) => ({
  ...m,
  thumbnail: `/maps-img/${m.id}/thumbnail.avif`,
  floors: floorsFor(m.id),
}));

export const mapById = new Map(maps.map((m) => [m.id, m]));

export function getMap(id: string): GameMap | undefined {
  return mapById.get(id);
}
