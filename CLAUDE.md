# CLAUDE.md — Projektstatus & Entwicklung

Dieses Dokument gibt zukünftigen KIs/Entwicklern eine schnelle Übersicht über den aktuellen Fortschritt, die Befehle und die Architektur des Repositories.

---

## 🛠️ Befehle (Commands)

* **Entwicklungsserver starten:** `npm run dev`
* **Produktions-Build erstellen:** `npm run build`
* **Datenbank übersetzen (DE/FR):** `node scripts/translate-db.mjs`
* **Neue Maps rendern:** `node scripts/render-new-maps.mjs`
* **Vorschaubilder kopieren:** `node scripts/copy-thumbnails.mjs`

---

## 📈 Aktueller Fortschritt (Features)

1. **Interaktiver Map-Viewer:**
   * 18 Maps registriert. Anzeige von Etage für Etage mit Zoom- und Drag-Funktionalität.
   * **Etage -1** wurde für alle Maps entfernt (z.B. bei *Kanal* und *Casino*), um Konsistenz zu wahren.
   * AVIF-Vorschaubilder wurden für alle Maps eingerichtet.

2. **Interaktive Waffenliste (`/weapons`):**
   * Vollwertiger Detail-Browser für alle 118 Waffen, sortiert nach Typ (Sturmgewehre, SMGs etc.).
   * Detailansicht zeigt Schaden, Feuerrate, Mobilität, Magazin, Kaliber, Schadensabfall und alle Operator, die die Waffe nutzen.
   * **URL-Query-Synchronisierung:** Die Ansicht synchronisiert sich mit der URL (z.B. `/weapons?name=L85A2`), wodurch Direktlinks teilbar sind und die Browser-Historie (Vor-/Zurück-Buttons) unterstützt wird.

3. **Loadout-Verlinkung:**
   * Im Profil eines Operators (`/operators/[id]`) sind alle Waffen (Primär- und Sekundärwaffen) im Loadout anklickbare Links, die direkt zur Detailansicht dieser Waffe auf der Waffenseite führen.

4. **Mehrsprachigkeit (DE, EN, FR):**
   * **UI-Lokalisierung:** Statische Texte werden über `src/data/i18n.ts` übersetzt.
   * **Datenbank-Lokalisierung:** Die Spieldatenbank (`R6_complete.json`) wird per Skript in die Zielsprachen übersetzt und unter `R6_bundle/R6_complete_[de|en|fr].json` abgelegt.
   * **Globaler State:** Verwaltet über `LanguageContext.tsx`. Die Spracheinstellung wird im `localStorage` persistiert und unterstützt automatische Erkennung der Browsersprache.
   * Ein Sprachumschalter (`DE | EN | FR`) befindet sich in der Kopfzeile (`SiteHeader.tsx`).

---

## 🏗️ Architektur & Daten

* **Datenbankpfad:** `R6_bundle/R6_complete.json` (Original) sowie die lokalisierten Versionen `R6_complete_de.json`, `R6_complete_en.json` und `R6_complete_fr.json`.
* **Typendefinitionen:** `src/data/types.ts`
* **Lokalisierter Datenzugriff:** Erfolgt in React-Komponenten über den Hook `useLanguage()` (liefert `operators`, `weapons` und `gadgets` passend zur eingestellten Sprache).
* **Routen:**
  * Startseite: `/` (Client-Component)
  * Operators: `/operators` (Übersicht) und `/operators/[id]` (Statisch generierte Detailseite via `generateStaticParams`)
  * Waffen: `/weapons` (Client-Component)
  * Maps: `/maps` (Übersicht) und `/maps/[id]` (Statisch generierte Detailseite)
