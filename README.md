# R6 Codex – Rainbow Six Daten- & Map-App

Eine Web-App (Next.js + React + TypeScript + Tailwind), in der man Rainbow-Six-Daten
durchstöbern kann: **Operator** mit Fähigkeiten, Stats und Loadouts, eine
**Waffen**-Übersicht und **Maps** mit einem interaktiven Etagen-Viewer (Zoom,
Pan, anklickbare Bereiche).

> Inoffizielle Fan-Datenbank. Rainbow Six ist eine Marke von Ubisoft.

## Entwicklung

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Production-Build
npm run start    # Production-Server
npm run lint
```

## Projektstruktur

```
src/
  app/                     # Routen (App Router)
    page.tsx               # Startseite
    operators/             # Übersicht + [id]-Detailseite
    maps/                  # Übersicht + [id]-Etagen-Viewer
    weapons/               # Waffenliste
  components/              # UI-Komponenten (u.a. MapFloorViewer, OperatorBrowser)
  data/
    types.ts               # zentrale Typen
    r6.ts                  # Operator/Waffen/Gadgets aus R6_bundle/R6_complete.json
    maps.ts                # Map-Metadaten + Etagen aus dem Manifest
R6_bundle/
  R6_complete.json         # Datenquelle: Operator, Waffen, Gadgets, Fähigkeiten
public/
  img/operators|loadout/   # Operator-Portraits/-Icons und Loadout-Icons
  maps-img/<mapId>/        # gerenderte Etagen-Bilder (WebP)
  maps-img/manifest.json   # Etagen je Map (Name, Bildpfad, Maße)
```

Operator, Waffen und Gadgets kommen aus **`R6_bundle/R6_complete.json`** (siehe
`src/data/r6.ts`). Die Maps werden als **einzelne, optimierte Etagen-Bilder**
(WebP) im Viewer angezeigt – mit Zoom (Mausrad), Pan (Ziehen) und Etagen-Umschalter.

## Operator & Waffen ergänzen

Alles läuft über `R6_bundle/R6_complete.json`:

- **Operator**: Objekt im `operators`-Array (Felder in `src/data/types.ts`).
  Health folgt Speed/Armor (3/1 = 100 HP, 2/2 = 110 HP, 1/3 = 125 HP).
- **Waffe/Gadget**: Objekt im `weapons`- bzw. `gadgets`-Array; im Loadout per
  Name referenziert.
- **Bilder**: unter `public/img/operators/…` bzw. `public/img/loadout/…` ablegen
  (Pfade wie im JSON, nur unter `public/`). Ohne Bild greift ein Initialen-Avatar.

## Maps / Etagen ergänzen

Jede Map besteht aus einem Ordner `public/maps-img/<mapId>/` mit je einem WebP
pro Etage plus einem Eintrag im `public/maps-img/manifest.json`:

```json
"clubhouse": [
  { "id": "floor-1", "name": "Untergeschoss", "image": "/maps-img/clubhouse/floor-1.webp", "w": 2600, "h": 1462 },
  { "id": "floor-2", "name": "Erdgeschoss",   "image": "/maps-img/clubhouse/floor-2.webp", "w": 2600, "h": 1462 }
]
```

Dazu die Map-Metadaten (Name, Ort, Playlists, Akzentfarbe) in `src/data/maps.ts`
im Array `META` ergänzen. Empfehlung: alle Etagen einer Map mit gleichen Maßen,
damit Zoom/Ausschnitt beim Etagenwechsel exakt übereinander liegen.

Die aktuellen Etagen-Bilder wurden aus den ursprünglichen SVG-Viewern gerendert
(`scripts/rasterize-maps.mjs`, benötigt `playwright-core` + `sharp`).

Alle Felder sind in `src/data/types.ts` dokumentiert.
