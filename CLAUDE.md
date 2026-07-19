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

3. **Operator-Seiten (`/operators`, `/operators/[id]`):** Filter/Suche, Loadout-Waffen sind Links zur Waffen-Detailansicht. Operator-Renders liegen als WebP unter `public/img/operators/<slug>_render.webp` (Icons weiterhin PNG — werden u.a. von `ReplayScorecard` direkt referenziert).

4. **Mehrsprachigkeit (DE, EN, FR):** UI über `src/data/i18n.ts` (Key→{de,en,fr}); Spieldaten über `R6_bundle/R6_complete_[de|en|fr].json`. State in `LanguageContext.tsx` (localStorage, Browsersprache-Erkennung). `useLanguage()` liefert `{ operators, weapons, gadgets, t, language, setLanguage }`. Umschalter in `SiteHeader.tsx`.

5. **R6 Tracker (`/stats`) — Spielerstatistiken über R6Data:**
   * Datenquelle ist **R6Data** (`src/lib/r6data.ts`), Key via Env `R6DATA_API_KEY`. R6Data umgeht den Ubisoft-Login komplett (kein DataDome/2FA/IP-Limit). Der alte direkte Ubisoft-Client (`ubi.ts`) und der Redis-Login-Cache (`kv.ts`) wurden **entfernt** (waren wegen Ubisofts IP-Blocks auf Rechenzentrums-IPs unbrauchbar); der geteilte Ranked-2.0-Parser lebt jetzt in `src/lib/fullProfiles.ts`. Ohne Key liefert `/api/player` eine klare Konfig-Fehlermeldung (500).
   * `src/lib/r6.ts` wählt automatisch R6Data, wenn ein Key gesetzt ist.
   * **Eine Suche = 4 R6Data-Aufrufe** (`fullStats`, `operatorStats`, `seasonalStats`, `isBanned`) **× 2**: 8 s nach jeder erfolgreichen Suche lädt der Client das Profil einmal **still im Hintergrund nach** und tauscht die Anzeige ohne Flackern aus. Wichtig: Die R6Data-**API liefert nur deren Cache** — die Aktualisierung aus Ubisoft wird erst durch einen Aufruf der **r6data.com-Profilseite** angestoßen (nachgewiesen per Nutzertest 19.07.2026). Der serverseitige Seiten-Ping (`triggerR6DataRefresh`) reichte NICHT (Nutzertest) — der Auslöser sitzt im Seiten-JavaScript. Deshalb lädt der Client nach jeder Suche zusätzlich die r6data.com-Profilseite in einem **unsichtbaren iframe** (12 s, sandbox); der stille Client-Refresh (10 s) holt danach die frischen Daten. Falls r6data.com Framing irgendwann per X-Frame-Options/CSP blockt, bricht nichts — dann bleibt nur deren interner Refresh-Endpoint (per DevTools auf r6data.com identifizierbar). Eine neue Suche bricht den ausstehenden Refresh ab. API hat ein Kontingent (`/api/me/usage`); wird es knapp, den Auto-Refresh in `StatsPageClient.runSearch` drosseln.
   * Profil (`PlayerProfile.tsx`): aktuelle Ränge (ranked/casual), **RP-Verlaufs-Graph** der Season (`RpChart.tsx`, SVG), **Season-Historie**-Tab, Top-Operatoren, Karriere-Stats, Ban-Details (Grund/Datum aus `banAlerts`), „Datenstand"-Hinweis mit „🔄 Neu laden"-Button (holt das Profil erneut — R6Datas erster Abruf liefert oft noch deren alten Cache) und Link zu r6data.com (dort wird die Aktualisierung angestoßen; KEIN Refresh-API-Parameter). `/api/player` sendet `Cache-Control: no-store`, Client-Fetch mit `cache: 'no-store'` — Spielerdaten kommen nie aus Browser-/CDN-Cache.
   * Startansicht: **Live-Status-Leiste** (`/api/gamestatus`) + **Top-Spieler-Bestenliste** (`/api/leaderboard`, PC/Konsole, paginiert, Klick sucht Spieler). Beide 5-Min-Cache + Demo-Modus.
   * **Spieler-Merkliste:** „☆ Merken"-Button im Profilkopf speichert Name+Plattform in localStorage (`src/lib/playerFavorites.ts`, gleiches useSyncExternalStore-Muster wie `favorites.ts`); gespeicherte Spieler erscheinen als Chips unter dem Suchfeld (Klick sucht direkt, ✕ entfernt, max. 24).

6. **Match-Replay-Analyse (`/replays`) — 100% lokal im Browser:**
   * `.rec`-Replays werden per **WebAssembly** geparst (r6-dissect nach WASM kompiliert). **Kein Upload, kein Server, kein Größenlimit, kein Kontingent.** WASM liegt fertig unter `public/wasm/r6dissect.wasm` (+ `wasm_exec.js`) → Vercel braucht **kein Go-Toolchain**. Go-Quellcode + Build-Anleitung: `wasm/`.
   * Loader/Aggregation: `src/lib/replayParser.ts` (`ensureParserReady`, `parseRecFile`, `aggregateRounds`). Pro `.rec` = eine Runde; Runden werden clientseitig zu einem Match aggregiert.
   * Anzeige: `src/components/ReplayScorecard.tsx` — Map-Hero, Runden-Tabs, beide Team-Roster (Operator-Icons, K/D/A, HS%, Spawn), Kill-Feed-Timeline. JSON-Download.
   * **Grenze:** r6-dissect dekodiert (noch) KEINE Bewegungs-/Positionsdaten → keine 2D-Bewegungskarte/kein Video möglich. Nur zeitliche Events (Kills, Objectives, Plants).

7. **PWA / „App installieren":** Manifest (`src/app/manifest.ts`) + Service Worker (`public/sw.js`) + `InstallAppButton.tsx` im Header (nativer Install-Prompt; iOS: Anleitung). Startseite bewirbt den Tracker.

8. **News-Sektion auf der Startseite (`NewsSection.tsx` + `/api/news`):** Offizielle Ubisoft-News/Patchnotes über die öffentliche nimbus-API (`src/lib/news.ts`, locale-abhängig de/en/fr, defensiv geparst da undokumentiert), **Steam-News als Fallback** (nur EN), 30-Min-Cache, Demo-Modus. Bei Fehler/leerer Antwort verschwindet die Sektion einfach. Achtung: nimbus/Steam waren aus der Claude-Sandbox nicht erreichbar (Proxy) — live auf Vercel nach Deploy prüfen.

---

## 🏗️ Architektur & Daten

* **Feature-Flags:** `src/lib/features.ts` — `TRACKER_ENABLED`, `REPLAYS_ENABLED`, `NEWS_ENABLED` (blenden Nav-Links, Seiten/Sektionen und zugehörige API-Routen aus).
* **Spieldaten:** `R6_bundle/R6_complete[_de|_en|_fr].json`. Typen: `src/data/types.ts`. Tracker-Typen: `src/lib/types.ts`. **Statischer Snapshot** (kein Scraper im Repo) — Balance-Patches müssen manuell nachgepflegt werden; aktueller Stand steht in `meta.patchLevel` (derzeit Y11S2.2, 14.07.2026: Jäger 3-Speed/100 HP, Wamai-Loadout Nitro Cell + Deployable Shield). Achtung: Basis/EN sind mit `indent=1` formatiert, DE/FR mit `indent=2`; in DE/FR sind die Gadget-Namen übersetzt → beim Skript-Patchen über `image`-Pfad matchen. R6Data bietet zwar `/api/operators` (health/speed/bio, kein Loadout), war aber beim Y11S2.2-Patch selbst nicht aktueller als der Snapshot.
* **API-Routen (`src/app/api/`):** `player` (Spielersuche), `leaderboard`, `gamestatus`, `news`. (Replays haben KEINE Server-Route mehr — alles clientseitig.)
* **Konvention:** Seiten mit Client-Interaktivität = dünne Server-`page.tsx` + separate `XxxPageClient.tsx` (`'use client'`).
* **Styling:** Tailwind v4, Theme im `@theme`-Block von `src/app/globals.css` (`--color-accent` = Wiki-Orange `#ff7a1a`; auch `--color-win/-loss/-attacker/-defender`). Der Tracker nutzt zusätzlich eigene CSS-Variablen unter `:root` (dort ist `--accent-2` bewusst ebenfalls auf Orange gesetzt, damit `/stats` wie der Rest des Wikis wirkt).
* **Routen:** `/`, `/operators`(+`/[id]`), `/weapons`, `/maps`(+`/[id]`), `/compare`, `/search`, `/favorites`, `/stats`, `/replays`.
* **npm-Override:** `package.json` erzwingt `postcss >= 8.5.10` (Next 16.2.x pinnt intern eine Version mit bekannter XSS-Advisory; Override entfernen, sobald ein Next-Update das selbst mitbringt).

---

## 🔑 Umgebungsvariablen (Vercel)

* `R6DATA_API_KEY` — **einzige nötige Variable** für den Live-Tracker (Key von r6data.com). Doku als Referenz: die vom Nutzer gepflegte Offline-Kopie der R6Data-API.
* `R6_DEMO=1` — Mock-Modus für Tracker/Leaderboard/Status ohne Key.
* `R6_CURRENT_SEASON` — optionaler Override für die "inaktiv seit X Seasons"-Anzeige; Standard kommt aus der fullStats-Antwort (`data.metadata.currentSeason`).
* Entfernt (alte Ansätze, auch in Vercel löschen falls noch gesetzt): `UBI_EMAIL`, `UBI_PASSWORD`, `R6_DATADOME`, `UBI_PROXY_URL`, `REDIS_URL`. **Niemals echte Secrets in `.env.example` committen.**

---

## ⚠️ Offene Punkte / Hinweise an den Nutzer

* **Hetzner-Server löschen** (war Test für feste Ausgangs-IP + Replay-Upload-Proxy — beides nicht mehr nötig, ~14 €/Monat sparen).
* **Ubisoft-Passwort ändern** — war früher exponiert (Git-Historie + Terminal-Screenshot). Die App braucht die Zugangsdaten dank R6Data nicht mehr; 2FA kann wieder aktiviert werden.
* Mögliche nächste Ausbaustufe (auf Wunsch): erweiterte interaktive **Runden-Timeline** aus den vorhandenen Replay-Events (Scrubber, Opening Kill, Highlights). Eine 2D-Bewegungskarte ginge erst, wenn r6-dissect Bewegungspakete dekodiert (auf deren Roadmap).
