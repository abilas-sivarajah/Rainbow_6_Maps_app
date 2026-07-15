# CLAUDE.md — Projektstatus & Entwicklung

Dieses Dokument gibt zukünftigen KIs/Entwicklern eine schnelle Übersicht über den aktuellen Fortschritt, die Befehle und die Architektur des Repositories. **Bitte bei relevanten Änderungen aktuell halten** — es ist der „Speicherpunkt", den jede neue Session/KI zuerst liest.

**Arbeitsbranch:** `claude/rainbow-six-data-app-zq3sfw` (nicht auf einen anderen Branch pushen). Deployment: Vercel, Live-Domain `r6wikiabi-psi.vercel.app`.

---

## 🛠️ Befehle (Commands)

* **Entwicklungsserver starten:** `npm run dev`
* **Produktions-Build erstellen:** `npm run build`
* **Demo-Modus** (Tracker mit Mock-Daten, kein Netz/Key nötig): `R6_DEMO=1 npm run dev`
* **Datenbank übersetzen (DE/FR):** `node scripts/translate-db.mjs`
* **Neue Maps rendern:** `node scripts/render-new-maps.mjs`
* **Vorschaubilder kopieren:** `node scripts/copy-thumbnails.mjs`
* **Replay-WASM neu bauen** (nur nach Änderung an `wasm/main.go` oder r6-dissect-Update): siehe `wasm/README.md`

---

## 📈 Aktueller Fortschritt (Features)

1. **Interaktiver Map-Viewer:** 18 Maps, Etage für Etage mit Zoom/Drag. Bilder als `public/maps-img/<id>/floor-*.webp` + `thumbnail.avif` (Manifest: `public/maps-img/manifest.json`).

2. **Interaktive Waffenliste (`/weapons`):** Detail-Browser für 118 Waffen mit URL-Query-Sync (`/weapons?name=L85A2`).

3. **Operator-Seiten (`/operators`, `/operators/[id]`):** Filter/Suche, Loadout-Waffen sind Links zur Waffen-Detailansicht.

4. **Mehrsprachigkeit (DE, EN, FR):** UI über `src/data/i18n.ts` (Key→{de,en,fr}); Spieldaten über `R6_bundle/R6_complete_[de|en|fr].json`. State in `LanguageContext.tsx` (localStorage, Browsersprache-Erkennung). `useLanguage()` liefert `{ operators, weapons, gadgets, t, language, setLanguage }`. Umschalter in `SiteHeader.tsx`.

5. **R6 Tracker (`/stats`) — Spielerstatistiken über R6Data:**
   * Datenquelle ist **R6Data** (`src/lib/r6data.ts`), Key via Env `R6DATA_API_KEY`. R6Data umgeht den Ubisoft-Login komplett (kein DataDome/2FA/IP-Limit). Der alte direkte Ubisoft-Client (`src/lib/ubi.ts`) existiert noch als Fallback, ist aber wegen Ubisofts IP-Rate-Limits praktisch unbrauchbar (Vercel/Rechenzentrums-IPs werden geblockt — auch ein Hetzner-Proxy half nicht).
   * `src/lib/r6.ts` wählt automatisch R6Data, wenn ein Key gesetzt ist.
   * **Eine Suche = 4 R6Data-Aufrufe:** `fullStats` (Ränge + Season-Historie + Level + Avatar in einem), plus `operatorStats`, `seasonalStats`, `isBanned`. API hat ein Kontingent (Endpoint `/api/me/usage`).
   * Profil (`PlayerProfile.tsx`): aktuelle Ränge (ranked/casual), **RP-Verlaufs-Graph** der Season (`RpChart.tsx`, SVG), **Season-Historie**-Tab, Top-Operatoren, Karriere-Stats, Ban-Details (Grund/Datum aus `banAlerts`), „Datenstand"-Hinweis mit Link „Jetzt aktualisieren" (R6Data frischt Daten nur beim Aufruf auf r6data.com auf — es gibt KEINEN Refresh-API-Parameter).
   * Startansicht: **Live-Status-Leiste** (`/api/gamestatus`) + **Top-Spieler-Bestenliste** (`/api/leaderboard`, PC/Konsole, paginiert, Klick sucht Spieler). Beide 5-Min-Cache + Demo-Modus.

6. **Match-Replay-Analyse (`/replays`) — 100% lokal im Browser:**
   * `.rec`-Replays werden per **WebAssembly** geparst (r6-dissect nach WASM kompiliert). **Kein Upload, kein Server, kein Größenlimit, kein Kontingent.** WASM liegt fertig unter `public/wasm/r6dissect.wasm` (+ `wasm_exec.js`) → Vercel braucht **kein Go-Toolchain**. Go-Quellcode + Build-Anleitung: `wasm/`.
   * Loader/Aggregation: `src/lib/replayParser.ts` (`ensureParserReady`, `parseRecFile`, `aggregateRounds`). Pro `.rec` = eine Runde; Runden werden clientseitig zu einem Match aggregiert.
   * Anzeige: `src/components/ReplayScorecard.tsx` — Map-Hero, Runden-Tabs, beide Team-Roster (Operator-Icons, K/D/A, HS%, Spawn), Kill-Feed-Timeline. JSON-Download.
   * **Grenze:** r6-dissect dekodiert (noch) KEINE Bewegungs-/Positionsdaten → keine 2D-Bewegungskarte/kein Video möglich. Nur zeitliche Events (Kills, Objectives, Plants).

7. **PWA / „App installieren":** Manifest (`src/app/manifest.ts`) + Service Worker (`public/sw.js`) + `InstallAppButton.tsx` im Header (nativer Install-Prompt; iOS: Anleitung). Startseite bewirbt den Tracker.

---

## 🏗️ Architektur & Daten

* **Feature-Flags:** `src/lib/features.ts` — `TRACKER_ENABLED`, `REPLAYS_ENABLED` (blenden Nav-Links, Seiten und zugehörige API-Routen aus).
* **Spieldaten:** `R6_bundle/R6_complete[_de|_en|_fr].json`. Typen: `src/data/types.ts`. Tracker-Typen: `src/lib/types.ts`.
* **API-Routen (`src/app/api/`):** `player` (Spielersuche), `leaderboard`, `gamestatus`. (Replays haben KEINE Server-Route mehr — alles clientseitig.)
* **Konvention:** Seiten mit Client-Interaktivität = dünne Server-`page.tsx` + separate `XxxPageClient.tsx` (`'use client'`).
* **Styling:** Tailwind v4, Theme im `@theme`-Block von `src/app/globals.css` (`--color-accent` = Wiki-Orange `#ff7a1a`; auch `--color-win/-loss/-attacker/-defender`). Der Tracker nutzt zusätzlich eigene CSS-Variablen unter `:root` (dort ist `--accent-2` bewusst ebenfalls auf Orange gesetzt, damit `/stats` wie der Rest des Wikis wirkt).
* **Routen:** `/`, `/operators`(+`/[id]`), `/weapons`, `/maps`(+`/[id]`), `/compare`, `/search`, `/favorites`, `/stats`, `/replays`.

---

## 🔑 Umgebungsvariablen (Vercel)

* `R6DATA_API_KEY` — **einzige nötige Variable** für den Live-Tracker (Key von r6data.com). Doku als Referenz: die vom Nutzer gepflegte Offline-Kopie der R6Data-API.
* `R6_DEMO=1` — Mock-Modus für Tracker/Leaderboard/Status ohne Key.
* Nicht mehr nötig (aus früheren Ansätzen, können weg): `UBI_EMAIL`, `UBI_PASSWORD`, `R6_DATADOME`, `UBI_PROXY_URL`, `REDIS_URL`. `.env.example` dokumentiert Details. **Niemals echte Secrets in `.env.example` committen.**

---

## ⚠️ Offene Punkte / Hinweise an den Nutzer

* **Hetzner-Server löschen** (war Test für feste Ausgangs-IP + Replay-Upload-Proxy — beides nicht mehr nötig, ~14 €/Monat sparen).
* **Ubisoft-Passwort ändern** — war früher exponiert (Git-Historie + Terminal-Screenshot). Die App braucht die Zugangsdaten dank R6Data nicht mehr; 2FA kann wieder aktiviert werden.
* Mögliche nächste Ausbaustufe (auf Wunsch): erweiterte interaktive **Runden-Timeline** aus den vorhandenen Replay-Events (Scrubber, Opening Kill, Highlights). Eine 2D-Bewegungskarte ginge erst, wenn r6-dissect Bewegungspakete dekodiert (auf deren Roadmap).
