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
  components/              # UI-Komponenten (u.a. MapViewer, OperatorBrowser)
  data/
    types.ts               # zentrale Typen
    operators.ts           # Operator-Daten
    weapons.ts             # Waffen-Daten
    maps.ts                # Map-/Etagen-Daten
public/
  maps/<mapId>/            # Etagen- und Thumbnail-Grafiken
```

Die gesamte Datenbasis liegt als typisierte TS-Module in `src/data/`. Erweitern
heißt: einen Eintrag ergänzen – kein weiterer Code nötig.

## Eigene Maps hinzufügen

Der Etagen-Viewer arbeitet mit deinen eigenen Grafiken. Die mitgelieferten
SVGs unter `public/maps/` sind nur Platzhalter.

1. **Bilder ablegen:** je ein Bild pro Etage nach
   `public/maps/<mapId>/` legen (PNG, JPG, WebP oder SVG).
   Empfehlung: gleiches Seitenverhältnis für alle Etagen, damit die
   Raum-Marker exakt sitzen.
2. **Eintrag ergänzen** in `src/data/maps.ts`:

```ts
{
  id: "clubhouse",
  name: "Clubhouse",
  playlists: ["Ranked", "Standard"],
  thumbnail: "/maps/clubhouse/thumb.png",
  floors: [
    {
      id: "basement",
      name: "Untergeschoss",
      order: 0,                                 // 0 = unterste Etage
      image: "/maps/clubhouse/basement.png",
      rooms: [
        {
          id: "church",
          name: "Church",
          shape: "rect",
          x: 20, y: 30, width: 25, height: 20,  // Werte in % des Bildes
          objective: true,
          description: "Häufiger Bomben-Spot.",
        },
      ],
    },
    // weitere Etagen …
  ],
}
```

### Räume (anklickbare Bereiche)

Koordinaten sind **prozentual** (0–100) relativ zur Etagengrafik, damit die
Marker bei jeder Bildgröße korrekt sitzen.

- `shape: "rect"` → `x`, `y` (obere linke Ecke), `width`, `height`
- `shape: "circle"` → `x`, `y` (Mittelpunkt), `radius`
- `objective: true` markiert Missionsziele (orange statt blau).

Tipp zum Ermitteln der Werte: Etagenbild öffnen, gewünschte Position als
Anteil der Bildbreite/-höhe abschätzen (z.B. Mitte links = `x: 25, y: 50`).

## Operator & Waffen hinzufügen

- Neue Waffe: Eintrag in `src/data/weapons.ts` (eindeutige `id`).
- Neuer Operator: Eintrag in `src/data/operators.ts`; Waffen im `loadout`
  über ihre `id` referenzieren. Health ergibt sich aus Speed/Armor
  (3/1 = 100 HP, 2/2 = 110 HP, 1/3 = 125 HP).
- Optional ein Portrait unter `public/operators/` ablegen und via `portrait`
  referenzieren; ohne Portrait wird ein Initialen-Avatar erzeugt.

Alle Felder sind in `src/data/types.ts` dokumentiert.
