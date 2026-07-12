import type { GameMap } from "./types";

// Jede Map verweist auf einen eigenständigen, interaktiven Etagen-Viewer unter
// /public/maps/<id>.html. Diese HTML-Dateien enthalten das komplette SVG samt
// Etagen-Umschalter und werden in der Detailseite per iframe eingebettet.
//
// NEUE MAP HINZUFÜGEN:
//   1. Viewer-HTML nach /public/maps/<id>.html legen.
//   2. Hier einen Eintrag mit id, name, viewer-Pfad und Etagenzahl ergänzen.
export const maps: GameMap[] = [
  {
    id: "oregon",
    name: "Oregon",
    viewer: "/maps/oregon.html",
    floors: 5,
    location: "Oregon, USA",
    playlists: ["Ranked", "Standard"],
    accent: "#ff7a1a",
  },
  {
    id: "bank",
    name: "Bank",
    viewer: "/maps/bank.html",
    floors: 4,
    location: "Los Angeles, USA",
    playlists: ["Ranked", "Standard"],
    accent: "#4aa3ff",
  },
  {
    id: "villa",
    name: "Villa",
    viewer: "/maps/villa.html",
    floors: 4,
    location: "Italien",
    playlists: ["Ranked", "Standard"],
    accent: "#e0b64a",
  },
  {
    id: "club",
    name: "Clubhouse",
    viewer: "/maps/club.html",
    floors: 4,
    location: "Deutschland",
    playlists: ["Ranked", "Standard"],
    accent: "#c0392b",
  },
  {
    id: "kafe",
    name: "Kafe Dostoyevsky",
    viewer: "/maps/kafe.html",
    floors: 4,
    location: "Moskau, Russland",
    playlists: ["Ranked", "Standard"],
    accent: "#d35400",
  },
  {
    id: "border",
    name: "Border",
    viewer: "/maps/border.html",
    floors: 3,
    location: "Naher Osten",
    playlists: ["Ranked", "Standard"],
    accent: "#16a085",
  },
  {
    id: "chalet",
    name: "Chalet",
    viewer: "/maps/chalet.html",
    floors: 4,
    location: "Französische Alpen",
    playlists: ["Ranked", "Standard"],
    accent: "#8e6a4a",
  },
  {
    id: "coastline",
    name: "Coastline",
    viewer: "/maps/coastline.html",
    floors: 3,
    location: "Ibiza, Spanien",
    playlists: ["Ranked", "Standard"],
    accent: "#00a8cc",
  },
  {
    id: "consulate",
    name: "Consulate",
    viewer: "/maps/consulate.html",
    floors: 4,
    location: "Elfenbeinküste",
    playlists: ["Ranked", "Standard"],
    accent: "#2c7be5",
  },
  {
    id: "emerald",
    name: "Emerald Plains",
    viewer: "/maps/emerald.html",
    floors: 3,
    location: "Irland",
    playlists: ["Ranked", "Standard"],
    accent: "#27ae60",
  },
  {
    id: "labs",
    name: "Nighthaven Labs",
    viewer: "/maps/labs.html",
    floors: 4,
    location: "Nighthaven",
    playlists: ["Ranked", "Standard"],
    accent: "#9b59b6",
  },
  {
    id: "lair",
    name: "Lair",
    viewer: "/maps/lair.html",
    floors: 4,
    location: "Nighthaven",
    playlists: ["Ranked", "Standard"],
    accent: "#6c5ce7",
  },
  {
    id: "skyscraper",
    name: "Skyscraper",
    viewer: "/maps/skyscraper.html",
    floors: 3,
    location: "Nagoya, Japan",
    playlists: ["Ranked", "Standard"],
    accent: "#e84393",
  },
];

export const mapById = new Map(maps.map((m) => [m.id, m]));

export function getMap(id: string): GameMap | undefined {
  return mapById.get(id);
}
