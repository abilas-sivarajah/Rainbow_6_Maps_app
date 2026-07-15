// Simple in-code feature switches. Flip a flag and redeploy — no env vars
// needed for these, since they're meant to be quick, reversible toggles.

// R6-Spieler-Stats-Tracker (/stats + /api/player). Auf `false` setzen, um
// Nav-Link, Seite und API wieder zu deaktivieren (z.B. bei erneuten
// Sicherheits-/Rate-Limit-Problemen mit dem direkten Ubisoft-Login).
export const TRACKER_ENABLED = true;

// R6-Match-Replay-Analyse (/replays). Parst .rec-Dateien komplett lokal im
// Browser (WebAssembly, kein Upload). Auf `false` setzen, um Nav-Link und
// Seite auszublenden.
export const REPLAYS_ENABLED = true;
