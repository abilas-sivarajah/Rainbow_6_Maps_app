// Lädt den r6-dissect-WebAssembly-Parser (in Go geschrieben, nach WASM
// kompiliert) und parst .rec-Replays KOMPLETT LOKAL im Browser — kein Upload,
// kein Server, keine Größenbeschränkung. Die Engine (~8 MB, gzip ~2-3 MB) wird
// nur auf der /replays-Seite und nur beim ersten Bedarf geladen, danach
// gecacht.

interface GoRuntime {
  run(instance: WebAssembly.Instance): void;
  importObject: WebAssembly.Imports;
}

declare global {
  interface Window {
    Go?: new () => GoRuntime;
    r6ParseReplay?: (bytes: Uint8Array) => string;
  }
}

const WASM_URL = '/wasm/r6dissect.wasm';
const EXEC_URL = '/wasm/wasm_exec.js';

let readyPromise: Promise<void> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-r6="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.dataset.r6 = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Konnte ${src} nicht laden`));
    document.head.appendChild(s);
  });
}

/** Lädt die WASM-Engine einmalig und macht window.r6ParseReplay verfügbar. */
export function ensureParserReady(): Promise<void> {
  if (readyPromise) return readyPromise;
  readyPromise = (async () => {
    await loadScript(EXEC_URL);
    if (!window.Go) throw new Error('WASM-Laufzeit (Go) nicht verfügbar');
    const go = new window.Go();
    const res = await fetch(WASM_URL);
    if (!res.ok) throw new Error(`WASM-Datei nicht gefunden (HTTP ${res.status})`);
    const bytes = await res.arrayBuffer();
    const { instance } = await WebAssembly.instantiate(bytes, go.importObject);
    // main() läuft dauerhaft (select{}) und registriert window.r6ParseReplay —
    // deshalb nicht awaiten.
    go.run(instance);
    // kurz warten, bis die exportierte Funktion gesetzt ist
    for (let i = 0; i < 50 && !window.r6ParseReplay; i++) {
      await new Promise((r) => setTimeout(r, 10));
    }
    if (!window.r6ParseReplay) throw new Error('Parser-Funktion wurde nicht registriert');
  })().catch((err) => {
    // bei Fehler erneuten Versuch erlauben
    readyPromise = null;
    throw err;
  });
  return readyPromise;
}

// --- geparste Strukturen (Schema von r6-dissect, eine Runde pro .rec) --------

export interface RawRoundPlayer {
  username: string;
  teamIndex: number;
  operator?: { name: string; id: number };
  spawn?: string;
}

export interface RawRoundTeam {
  name: string;
  score: number;
  won: boolean;
  winCondition?: string;
  role?: string;
}

export interface RawRoundStat {
  username: string;
  score: number;
  kills: number;
  died: boolean;
  assists: number;
  headshots: number;
  headshotPercentage: number;
}

export interface RawMatchFeedback {
  type: { name: string; id: number };
  username?: string;
  target?: string;
  headshot?: boolean;
  time: string;
  timeInSeconds: number;
  message?: string;
}

export interface RawRound {
  matchID?: string;
  gameVersion?: string;
  timestamp?: string;
  roundNumber?: number;
  site?: string;
  map?: { name: string; id: number };
  gamemode?: { name: string; id: number };
  matchType?: { name: string; id: number };
  teams?: RawRoundTeam[];
  players?: RawRoundPlayer[];
  stats?: RawRoundStat[];
  matchFeedback?: RawMatchFeedback[];
  error?: string;
}

/** Parst die Bytes einer einzelnen .rec-Datei (eine Runde). */
export async function parseRecFile(bytes: Uint8Array): Promise<RawRound> {
  await ensureParserReady();
  const json = window.r6ParseReplay!(bytes);
  return JSON.parse(json) as RawRound;
}

// --- Aggregation mehrerer Runden zu einem Match ------------------------------

export interface ScorecardPlayer {
  username: string;
  score: number;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  headshotPercentage: number;
  operator: string;
  spawn: string;
}

export interface ScorecardRound {
  roundNumber: number;
  site: string;
  teamBlueRole: string;
  teamOrangeRole: string;
  wonBlue: boolean;
  wonOrange: boolean;
  winCondition?: string;
  teamBlue: ScorecardPlayer[];
  teamOrange: ScorecardPlayer[];
  matchFeedback: RawMatchFeedback[];
}

export interface ScorecardMatch {
  matchId: string;
  mapName: string;
  gameMode: string;
  gameVersion?: string;
  timestamp: string;
  scoreBlue: number;
  scoreOrange: number;
  rounds: ScorecardRound[];
}

/**
 * Fasst die pro-Runde-JSONs zu einem Match zusammen — dieselbe Logik, die zuvor
 * serverseitig lief, nur mit korrigierten Feldnamen (r6-dissect liefert
 * `gamemode`/`matchID`, nicht `gameMode`/`id`).
 */
export function aggregateRounds(rounds: RawRound[]): ScorecardMatch | null {
  const valid = rounds
    .filter((r) => !r.error && r.map)
    .sort((a, b) => (a.roundNumber ?? 0) - (b.roundNumber ?? 0));
  if (valid.length === 0) return null;

  const first = valid[0];
  const last = valid[valid.length - 1];

  return {
    matchId: first.matchID ?? '',
    mapName: first.map?.name ?? 'Unbekannte Karte',
    gameMode: first.gamemode?.name ?? '',
    gameVersion: first.gameVersion,
    timestamp: first.timestamp ?? new Date().toISOString(),
    scoreBlue: last.teams?.[0]?.score ?? 0,
    scoreOrange: last.teams?.[1]?.score ?? 0,
    rounds: valid.map((round) => {
      const byName = new Map<string, RawRoundPlayer>();
      (round.players ?? []).forEach((p) => byName.set(p.username, p));

      const teamBlue: ScorecardPlayer[] = [];
      const teamOrange: ScorecardPlayer[] = [];

      (round.stats ?? []).forEach((s) => {
        const info = byName.get(s.username);
        const player: ScorecardPlayer = {
          username: s.username,
          score: s.score,
          kills: s.kills,
          deaths: s.died ? 1 : 0,
          assists: s.assists,
          headshots: s.headshots,
          headshotPercentage: s.headshotPercentage,
          operator: info?.operator?.name || 'Recruit',
          spawn: info?.spawn || '',
        };
        if (info?.teamIndex === 0) teamBlue.push(player);
        else teamOrange.push(player);
      });

      const blueWon = round.teams?.[0]?.won ?? false;
      return {
        roundNumber: round.roundNumber ?? 0,
        site: round.site || '',
        teamBlueRole: round.teams?.[0]?.role || '',
        teamOrangeRole: round.teams?.[1]?.role || '',
        wonBlue: blueWon,
        wonOrange: round.teams?.[1]?.won ?? false,
        winCondition: blueWon ? round.teams?.[0]?.winCondition : round.teams?.[1]?.winCondition,
        teamBlue,
        teamOrange,
        matchFeedback: round.matchFeedback ?? [],
      };
    }),
  };
}
