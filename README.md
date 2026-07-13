# R6 Codex – Rainbow Six Daten- & Map-App

Eine Web-App (Next.js + React + TypeScript + Tailwind), in der man Rainbow-Six-Daten durchstöbern kann: **Operator** mit Fähigkeiten, Stats und Loadouts, eine **Waffen**-Übersicht und **Maps** mit einem interaktiven Etagen-Viewer (Zoom, Pan, Reset und Etagen-Umschalter).

> Inoffizielle Fan-Datenbank. Rainbow Six ist eine Marke von Ubisoft.

---

## 🚀 Features & Fortschritt

1. **Interaktiver Map-Viewer:**
   * 18 Maps mit Vorschaubildern (AVIF) registriert.
   * **Etage -1** wurde für alle Maps entfernt, um ein konsistentes Erlebnis ab Erdgeschoss (Etage 0) zu gewährleisten.
   * Zoombar (Mausrad / Doppelklick / Buttons) und verschiebbar (Drag).
2. **Interaktive Waffen-Datenbank (`/weapons`):**
   * Vollwertiger Browser für alle 118 Waffen, sortiert nach Typ (Sturmgewehre, SMGs etc.) und filterbar.
   * Zeigt detaillierte Stats: Schaden, Feuerrate, Mobilität, Magazin, Kaliber, Schadensverlauf und alle Operator, die diese Waffe nutzen.
   * **URL-Synchronisierung:** Die Detailansicht synchronisiert sich mit dem URL-Parameter `?name=...`. Links können direkt geteilt werden.
3. **Operator Loadouts:**
   * Alle Waffen in den Operator-Steckbriefen (`/operators/[id]`) sind verlinkt. Ein Klick führt direkt zur Waffen-Detailansicht.
4. **Mehrsprachigkeit (DE, EN, FR):**
   * Die Benutzeroberfläche und die Spieldatenbank (Operators, Waffen und Gadgets) unterstützen **Deutsch, Englisch und Französisch**.
   * Die Sprache kann flüssig über einen Switcher in der Navbar gewechselt werden und wird im `localStorage` persistiert.

---

## 🛠️ Entwicklung

```bash
npm install
npm run dev                  # Startet den dev-Server (http://localhost:3000)
npm run build                # Erstellt den optimierten Production-Build
npm run start                # Startet den Production-Server
node scripts/translate-db.mjs # Übersetzt die Datenbank (R6_complete.json) in DE und FR
```

---

## 📂 Projektstruktur

```
src/
  app/                     # Routen (App Router)
    page.tsx               # Startseite (Client-seitig übersetzt)
    operators/             # Übersicht + statische [id]-Detailseiten
    maps/                  # Übersicht + statische [id]-Etagen-Viewer
    weapons/               # Interaktive Waffenliste (WeaponsBrowser)
  components/              # UI-Komponenten (MapFloorViewer, OperatorBrowser, WeaponsBrowser)
  context/
    LanguageContext.tsx    # Globaler LanguageProvider & t()-Übersetzungs-Hook
  data/
    types.ts               # Zentrale TypeScript-Typdefinitionen
    i18n.ts                # Wörterbuch für statische UI-Texte (DE, EN, FR)
    r6.ts                  # Statische Ladehilfen
    maps.ts                # Map-Metadaten + Etagen aus dem Manifest
R6_bundle/
  R6_complete.json         # Datenquelle (Englisch)
  R6_complete_de.json      # Datenquelle (Deutsch, automatisch generiert)
  R6_complete_en.json      # Datenquelle (Kopie des Originals für i18n)
  R6_complete_fr.json      # Datenquelle (Französisch, automatisch generiert)
scripts/
  translate-db.mjs         # Skript zur Übersetzung der Spieldatenbank (Google Translate API)
  render-new-maps.mjs      # Render-Skript für neue Maps
  copy-thumbnails.mjs      # Kopiert Map-Thumbnails aus dem Template
public/
  img/operators|loadout/   # Operator-Portraits und Loadout-Icons
  maps-img/<mapId>/        # Gerenderte Etagen-Bilder (WebP) + thumbnail.avif
  maps-img/manifest.json   # Etagen je Map (Name, Bildpfad, Maße)
```

---

## 🌐 Datenbank-Lokalisierung (i18n)

Um die Operators, Gadgets und Waffen zu lokalisieren, nutzen wir das Skript `scripts/translate-db.mjs`. 
Sollten neue Operators oder Waffen zur englischen `R6_bundle/R6_complete.json` hinzugefügt werden, führen Sie einfach:
```bash
node scripts/translate-db.mjs
```
aus. Das Skript übersetzt alle neuen Einträge ins Deutsche und Französische und speichert die jeweiligen lokalisierten JSON-Dateien im Ordner `R6_bundle/` ab.
Die Web-App liest diese Dateien basierend auf der aktiven Sprache im `LanguageContext` aus.
