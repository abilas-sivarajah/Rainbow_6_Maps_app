# R6 Codex – Technische Dokumentation

R6 Codex ist eine hochperformante, moderne Web-Applikation zur Visualisierung und Durchsuchung von Spieldaten aus **Tom Clancy's Rainbow Six Siege**. Sie bietet detaillierte Operator-Steckbriefe, eine umfassende Waffendatenbank mit Schadenskurven, einen Operator-Vergleich und einen interaktiven, kartenbasierten Map-Viewer mit automatischer Raumortung und mobiler Gestensteuerung.

---

## 🗺️ Systemarchitektur & Tech-Stack

Die Anwendung ist als moderne Single-Page-Application (SPA) mit statischer Generierung (SSG) aufgebaut:

* **Framework:** Next.js (App Router) mit React und TypeScript.
* **Styling:** Tailwind CSS mit einem konsistenten Dark-Mode, Glassmorphismus-Effekten (`backdrop-blur`) und flüssigen CSS-Transitionen.
* **Datenhaltung:** Lokale statische JSON-Dateien (`r6.ts`) zur Vermeidung von Datenbanklatenzen und für Offline-Fähigkeit.
* **Bilder & Optimierung:** Next.js Image-Optimierung mit AVIF/WebP Formaten.
* **PWA:** Service Worker (`sw.js`) und Web-Manifest für native Installation und Offline-Cashing.

---

## ⚡ Kernfunktionen

### 1. Interaktiver Map-Viewer
Der Map-Viewer stellt hochauflösende Pläne für alle **18 Maps** bereit und bietet folgende Interaktionsmöglichkeiten:

* **Navigations-Modus (Desktop & Mobile):**
  * **Maus:** Zoom per Mausrad, Verschieben per Drag-and-Drop, Zoom-Reset per Doppelklick.
  * **Gesten (Pinch-to-Zoom & Pan):** Native Zwei-Finger-Erkennung auf Smartphones und Tablets über HTML5 Pointer Events. Der Zoom-Ankerpunkt wird durch Abzug des Container-Offsets (`BoundingClientRect`) exakt an den Fingern fixiert.
* **Raumliste (Sidebar):**
  * Zeigt alle Räume der ausgewählten Etage sortiert an.
  * Filtert die Räume in Echtzeit per Suchfeld.
  * **Zentrierungs-Fokus:** Ein Klick auf einen Raumnamen berechnet die genaue Zielposition, zoomt flüssig dorthin und löst einen optischen Ortungs-Ping (R6-Locator-Kreis) aus.
* **Etagen-Namen (i18n):**
  * Lokalisierte Etagenbezeichnungen (z. B. *Keller*, *Erdgeschoss*, *Dach*) statt standardisierter Nummern.
  * Etage `-1` wurde bei allen Maps entfernt oder in Keller umbenannt, um ein einheitliches Einstiegs-Erlebnis ab Erdgeschoss (Etage 0) zu garantieren.

### 2. Operator-Browser & Vergleichs-Modus (`/operators` & `/compare`)
* **Übersicht:** Such- und filterbare Liste aller 70+ Operator nach Rolle (Angreifer/Verteidiger).
* **Steckbriefe:** Detaillierte Statistiken (Geschwindigkeit, Rüstung, Gesundheit), Beschreibungen der Spezialfähigkeit und Direktlinks zu den jeweiligen Primär- und Sekundärwaffen.
* **Vergleichs-Engine:** Ermöglicht den direkten Side-by-Side-Vergleich zweier Operator hinsichtlich Waffenauswahl, Gadgets und Attributen.

### 3. Waffendatenbank (`/weapons`)
* **Statistiken:** Listet alle 118 Waffen mit Feuerrate, Magazingröße, Mobilität, Kaliber und Schaden auf.
* **Schadensverlaufskurve:** Ein dynamisches Diagramm visualisiert den Schadensabfall (Damage Drop-off) über die Distanz (in Metern).
* **Owner-Verknüpfung:** Listet alle Operator auf, die die ausgewählte Waffe in ihrem Loadout führen.
* **URL-Synchronisierung:** Der Zustand der Detailansicht wird im Query-Parameter `?name=...` gehalten und ist damit direkt teilbar.

### 4. Globale Suche & Favoriten (`/search` & `/favorites`)
* **Suche:** Durchsucht die gesamte Spieldatenbank (Operators, Maps, Waffen) gleichzeitig in Echtzeit (URL-synchron über `?q=`).
* **Favoriten:** Ermöglicht das Liken von Maps und Operator. Die Favoriten werden lokal über den `localStorage` persistiert (SSR-sicher via `useSyncExternalStore`).

### 5. Live Spieler-Stats / R6 Tracker (`/stats`)
Ein integrierter Spieler-Tracker, der echte Profildaten über die **Ubisoft-API** abruft:
* **Ablauf:** Die Seite `/stats` sucht per Nutzername + Plattform (`uplay` / `psn` / `xbl`) über die serverseitige Route `/api/player` (Node-Runtime) – Zugangsdaten bleiben serverseitig.
* **Ubisoft-Client (`src/lib/ubi.ts`):** Zweistufiger Login (Basic-Auth → Session-Ticket → 2. Login → „neues" Ticket) gegen die aktuellen Endpunkte; Browser-User-Agent + `datadome`-Cookie umgehen den DataDome-Anti-Bot-Schutz.
* **Demo-Modus:** Mit `R6_DEMO=1` liefert die API realistische Mock-Daten (`src/lib/demo.ts`) – ohne Konto oder Netzwerk.
* **Env (Live):** `UBI_EMAIL`, `UBI_PASSWORD`, `R6_DATADOME` (optional: `R6_UBI_APPID`, `R6_USER_AGENT`, `R6_LOGIN_COOLDOWN_MS`).

### 6. PWA – Installierbar & Offline
* **Manifest & Icons:** `src/app/manifest.ts` + App-Icons (192/512/maskable) → installierbar auf Desktop/Mobile.
* **Service Worker (`public/sw.js`):** network-first für Seiten (immer aktuell), cache-first für unveränderliche Assets (Offline-Fähigkeit).
* **OpenGraph-Bild:** `src/app/opengraph-image.png` für Link-Vorschauen.

---

## 🌐 Lokalisierung (i18n) & Übersetzungs-Pipeline

R6 Codex ist vollständig dreisprachig aufgebaut: **Deutsch (DE)**, **Englisch (EN)** und **Französisch (FR)**.

### Clientseitige Übersetzung
* **LanguageContext:** Verwaltet die ausgewählte Sprache und lädt automatisch die passende Sprachdatei. Speichert die Auswahl im `localStorage`.
* **i18n-Wörterbuch (`src/data/i18n.ts`):** Verwaltet statische UI-Übersetzungen wie "Schaden", "Magazingröße" und Etagenbezeichnungen.
* **Responsive Navbar:** Auf Mobilgeräten wird die Navigation in ein Dropdown-Menü ausgelagert, das auch den Sprachumschalter platzsparend integriert.

### Automatisierte Übersetzungs-Pipeline (`scripts/translate-db.mjs`)
Da die Rohdaten der Operators und Waffen auf Englisch vorliegen, wurde eine Pipeline entwickelt, die diese per API übersetzt:
* Liest die englische Quelldatei `R6_bundle/R6_complete.json`.
* Übersetzt Beschreibungen, Gadgets und Waffenwerte automatisch ins Deutsche und Französische.
* Schützt vor API-Fehlern durch automatische Retries und ein exponentielles Backoff-System.
* Generiert die lokalisierten Versionen `R6_complete_de.json` und `R6_complete_fr.json`.

---

## 📐 SVG-Transformations-Parser (Das Koordinaten-Problem)

Um die Räume auf den Kartengrafiken (SVGs) präzise orten zu können, mussten die Raumkoordinaten extrahiert werden. 

### Der Matrix-Akkumulations-Algorithmus
In den SVG-Dateien sind Raumtexte oft in Gruppen verschachtelt, die eigene Transformationen besitzen (z. B. `transform="matrix(a b c d e f)"`). Ein einfaches Auslesen der lokalen Text-Koordinaten führte zu starken Abweichungen.

Der entwickelte Parser löst dieses Problem über eine Stack-basierte Baumtraversierung:
1. **Akkumulation:** Beim Betreten einer Gruppe `<g>` wird deren Transformationsmatrix mit der des Eltern-Elements multipliziert:
   $$\begin{pmatrix} a1 & c1 & e1 \\ b1 & d1 & f1 \\ 0 & 0 & 1 \end{pmatrix} \cdot \begin{pmatrix} a2 & c2 & e2 \\ b2 & d2 & f2 \\ 0 & 0 & 1 \end{pmatrix} = \begin{pmatrix} a_{neu} & c_{neu} & e_{neu} \\ b_{neu} & d_{neu} & f_{neu} \\ 0 & 0 & 1 \end{pmatrix}$$
2. **Koordinatenberechnung:** Gefundene Raumkoordinaten $(x, y)$ werden mit der kumulierten Matrix transformiert:
   $$x_{global} = a \cdot x + c \cdot y + e$$
   $$y_{global} = b \cdot x + d \cdot y + f$$
3. **Prozentuale Skalierung:** Die globalen Koordinaten werden anhand der SVG-`viewBox` in relative Prozentwerte umgewandelt und in `rooms.json` gespeichert.

---

## ⚙️ Entwickler-Skripte

Folgende Skripte unterstützen die Entwicklung und Pflege der App:

* **Übersetzen der Spieldaten:**
  ```bash
  node scripts/translate-db.mjs
  ```
* **Etagen-Bilder aus SVGs rendern (Playwright & Sharp):**
  Rendert die Vektorgrafiken als optimierte WebP-Bilder für schnelle Ladezeiten.
  ```bash
  node scripts/render-new-maps.mjs
  ```
* **Build & Validierung:**
  Führt Linter und TypeScript-Prüfung aus und kompiliert die Anwendung in statische HTML-Seiten:
  ```bash
  npm run lint
  npm run build
  ```
