// Simple in-code feature switches. Flip a flag and redeploy — no env vars
// needed for these, since they're meant to be quick, reversible toggles.

// R6-Spieler-Stats-Tracker (/stats + /api/player). Vorübergehend deaktiviert
// (Sicherheits-/Rate-Limit-Probleme mit dem direkten Ubisoft-Login). Auf
// `true` setzen, um Nav-Link, Seite und API wieder freizugeben.
export const TRACKER_ENABLED = false;
