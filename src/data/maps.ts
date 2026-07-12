import type { GameMap } from "./types";

// Map-Startbestand mit Platzhalter-Grafiken (SVG unter /public/maps/<id>/).
//
// EIGENE MAPS EINFÜGEN:
//   1. Bilder pro Etage nach /public/maps/<mapId>/ legen (PNG/JPG/SVG/WebP).
//   2. Hier einen neuen Eintrag ergänzen und die `image`-Pfade anpassen.
//   3. Optional Räume (`rooms`) mit prozentualen Koordinaten definieren –
//      x/y/width/height in % relativ zur Etagengrafik.
export const maps: GameMap[] = [
  {
    id: "oregon",
    name: "Oregon",
    releaseYear: 2015,
    playlists: ["Ranked", "Standard", "Quick Match"],
    thumbnail: "/maps/oregon/thumb.svg",
    location: "Oregon, USA",
    description:
      "Weitläufige Ranch mit ikonischem Turm. Klassiker im kompetitiven Pool.",
    floors: [
      {
        id: "basement",
        name: "Untergeschoss",
        order: 0,
        image: "/maps/oregon/basement.svg",
        rooms: [
          {
            id: "laundry",
            name: "Waschküche",
            shape: "rect",
            x: 12,
            y: 20,
            width: 26,
            height: 24,
            objective: true,
            description: "Häufiger Bomben-Spot, verbunden mit dem Blue Stairs.",
          },
          {
            id: "supply",
            name: "Lager / Blue Stairs",
            shape: "rect",
            x: 55,
            y: 22,
            width: 30,
            height: 30,
            description: "Verbindet Keller mit dem Erdgeschoss.",
          },
        ],
      },
      {
        id: "ground",
        name: "Erdgeschoss",
        order: 1,
        image: "/maps/oregon/ground.svg",
        rooms: [
          {
            id: "kitchen",
            name: "Küche",
            shape: "rect",
            x: 10,
            y: 55,
            width: 28,
            height: 28,
            objective: true,
            description: "Bomben-Site zusammen mit dem Dining.",
          },
          {
            id: "dining",
            name: "Esszimmer",
            shape: "rect",
            x: 40,
            y: 55,
            width: 24,
            height: 28,
            objective: true,
          },
          {
            id: "meeting",
            name: "Meeting Hall",
            shape: "rect",
            x: 66,
            y: 20,
            width: 26,
            height: 30,
          },
        ],
      },
      {
        id: "second",
        name: "1. Obergeschoss",
        order: 2,
        image: "/maps/oregon/second.svg",
        rooms: [
          {
            id: "master",
            name: "Master Bedroom",
            shape: "rect",
            x: 12,
            y: 18,
            width: 30,
            height: 26,
            objective: true,
          },
          {
            id: "dorms",
            name: "Kids Dorms",
            shape: "rect",
            x: 55,
            y: 55,
            width: 30,
            height: 26,
            objective: true,
          },
          {
            id: "tower-access",
            name: "Turm-Zugang",
            shape: "circle",
            x: 50,
            y: 30,
            radius: 6,
            description: "Treppe zum ikonischen Oregon-Turm.",
          },
        ],
      },
    ],
  },
  {
    id: "bank",
    name: "Bank",
    releaseYear: 2016,
    playlists: ["Ranked", "Standard", "Quick Match"],
    thumbnail: "/maps/bank/thumb.svg",
    location: "Los Angeles, USA",
    description:
      "Großes Bankgebäude mit Tresorraum im Keller. Beliebt für vertikales Spiel.",
    floors: [
      {
        id: "basement",
        name: "Untergeschoss",
        order: 0,
        image: "/maps/bank/basement.svg",
        rooms: [
          {
            id: "vault",
            name: "Tresorraum",
            shape: "rect",
            x: 20,
            y: 25,
            width: 30,
            height: 30,
            objective: true,
            description: "Stark gepanzerter Bomben-Spot.",
          },
          {
            id: "cctv",
            name: "CCTV / Lockers",
            shape: "rect",
            x: 58,
            y: 30,
            width: 26,
            height: 26,
            objective: true,
          },
        ],
      },
      {
        id: "ground",
        name: "Erdgeschoss",
        order: 1,
        image: "/maps/bank/ground.svg",
        rooms: [
          {
            id: "open-area",
            name: "Open Area / Tellers",
            shape: "rect",
            x: 30,
            y: 40,
            width: 40,
            height: 30,
            objective: true,
          },
          {
            id: "office",
            name: "Front Office",
            shape: "rect",
            x: 12,
            y: 20,
            width: 22,
            height: 22,
          },
        ],
      },
      {
        id: "top",
        name: "1. Obergeschoss",
        order: 2,
        image: "/maps/bank/top.svg",
        rooms: [
          {
            id: "ceo",
            name: "CEO Office",
            shape: "rect",
            x: 55,
            y: 20,
            width: 30,
            height: 26,
            objective: true,
          },
          {
            id: "executive",
            name: "Executive Hall",
            shape: "rect",
            x: 15,
            y: 55,
            width: 34,
            height: 24,
            objective: true,
          },
        ],
      },
    ],
  },
];

export const mapById = new Map(maps.map((m) => [m.id, m]));

export function getMap(id: string): GameMap | undefined {
  return mapById.get(id);
}
