'use client';

import { useCallback, useEffect, useState } from 'react';

import PlayerProfile from '@/components/PlayerProfile';
import {
  removeSavedPlayer,
  useSavedPlayers,
  type SavedPlayer,
} from '@/lib/playerFavorites';
import type { ApiError, PlayerData, Platform } from '@/lib/types';

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'uplay', label: 'PC (Ubisoft)' },
  { value: 'psn', label: 'PlayStation' },
  { value: 'xbl', label: 'Xbox' },
];

const PLATFORM_SHORT: Record<Platform, string> = {
  uplay: 'PC',
  psn: 'PS',
  xbl: 'Xbox',
};

/** Gemerkte Spieler als Chips unter dem Suchfeld — Klick sucht direkt. */
function SavedPlayers({ onSelect }: { onSelect: (p: SavedPlayer) => void }) {
  const saved = useSavedPlayers();
  if (saved.length === 0) return null;
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 14,
      }}
    >
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        ★ Gespeichert:
      </span>
      {saved.map((p) => (
        <span
          key={`${p.platform}:${p.username}`}
          className="badge"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <button
            onClick={() => onSelect(p)}
            title={`${p.username} im Tracker suchen`}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-2)',
              font: 'inherit',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {p.username}{' '}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
              ({PLATFORM_SHORT[p.platform]})
            </span>
          </button>
          <button
            onClick={() => removeSavedPlayer(p)}
            aria-label={`${p.username} aus der Merkliste entfernen`}
            title="Entfernen"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 0,
              font: 'inherit',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </span>
      ))}
    </div>
  );
}

interface LeaderboardEntry {
  id: string;
  kd: number;
  matchesPlayed: number;
  rankPoints: number;
  position: number;
}

interface GameStatus {
  playersOnline: number | null;
  monthlyActive: number | null;
  services: Array<{ name: string; status: string }>;
}

function PlayerSkeleton() {
  return (
    <div>
      {/* Profile header skeleton */}
      <div className="card section profile">
        <div className="skeleton skeleton-avatar"></div>
        <div className="profile-details" style={{ flex: 1 }}>
          <div className="skeleton skeleton-title" style={{ width: '40%' }}></div>
          <div className="skeleton skeleton-meta" style={{ width: '25%', height: '14px', marginTop: '10px' }}></div>
          <div className="skeleton skeleton-meta" style={{ width: '50%', height: '8px', marginTop: '14px' }}></div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="profile-tabs" style={{ gap: '12px' }}>
        <div className="skeleton" style={{ width: '100px', height: '36px' }}></div>
        <div className="skeleton" style={{ width: '100px', height: '36px' }}></div>
        <div className="skeleton" style={{ width: '100px', height: '36px' }}></div>
        <div className="skeleton" style={{ width: '100px', height: '36px' }}></div>
      </div>

      {/* Ranks grid skeleton */}
      <div className="grid cols-2">
        <div className="card skeleton skeleton-card"></div>
        <div className="card skeleton skeleton-card"></div>
      </div>
    </div>
  );
}

/** Kompakte Zeile: Live-Spielerzahl + Serverstatus (aus /api/gamestatus). */
function GameStatusBar() {
  const [status, setStatus] = useState<GameStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/gamestatus')
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (!cancelled && s && !('error' in s)) setStatus(s as GameStatus);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!status) return null;

  const allOnline =
    status.services.length > 0 &&
    status.services.every((s) => /online/i.test(s.status));

  return (
    <div
      className="card"
      style={{
        marginTop: 20,
        padding: '12px 18px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px 24px',
        justifyContent: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
      }}
    >
      {status.playersOnline != null ? (
        <span>
          👥 <strong style={{ color: 'var(--text)' }}>{status.playersOnline.toLocaleString('de-DE')}</strong> gerade online
        </span>
      ) : null}
      {status.monthlyActive != null ? (
        <span>
          📆 <strong style={{ color: 'var(--text)' }}>{(status.monthlyActive / 1_000_000).toLocaleString('de-DE', { maximumFractionDigits: 1 })} Mio.</strong> aktive Spieler/Monat
        </span>
      ) : null}
      {status.services.length > 0 ? (
        <span title={status.services.map((s) => `${s.name}: ${s.status}`).join(' · ')}>
          <span style={{ color: allOnline ? 'var(--win)' : 'var(--loss)' }}>●</span>{' '}
          Server: {allOnline ? 'alle online' : status.services.filter((s) => !/online/i.test(s.status)).map((s) => `${s.name} ${s.status}`).join(', ')}
        </span>
      ) : null}
    </div>
  );
}

/** Top-Spieler-Bestenliste (aus /api/leaderboard), Klick auf Namen sucht den Spieler. */
function Leaderboard({ onSelect }: { onSelect: (name: string) => void }) {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [platform, setPlatform] = useState<'pc' | 'console'>('pc');
  const [page, setPage] = useState(1);
  // true bei Erstladung; bei Seiten-/Plattformwechsel setzen es die Handler.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/leaderboard?page=${page}&platform=${platform}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((list) => {
        if (!cancelled) setEntries(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, platform]);

  if (entries === null && !loading) return null;
  if (entries !== null && entries.length === 0 && page === 1) return null;

  return (
    <div className="section">
      <p className="section-title">
        <span>🏆 Top-Spieler ({platform === 'pc' ? 'PC' : 'Konsole'})</span>
        <span style={{ display: 'flex', gap: 8 }}>
          <button
            className="badge"
            style={{ cursor: 'pointer', opacity: platform === 'pc' ? 1 : 0.55 }}
            onClick={() => {
              setPlatform('pc');
              setPage(1);
              setLoading(true);
            }}
          >
            PC
          </button>
          <button
            className="badge"
            style={{ cursor: 'pointer', opacity: platform === 'console' ? 1 : 0.55 }}
            onClick={() => {
              setPlatform('console');
              setPage(1);
              setLoading(true);
            }}
          >
            Konsole
          </button>
        </span>
      </p>
      <div className="card" style={{ padding: '10px 18px' }}>
        <div className="table-scroll">
          <table className="team-table">
            <thead>
              <tr>
                <th style={{ width: 46 }}>#</th>
                <th>Spieler</th>
                <th style={{ textAlign: 'center' }}>RP</th>
                <th style={{ textAlign: 'center' }}>K/D</th>
                <th style={{ textAlign: 'center' }}>Matches</th>
              </tr>
            </thead>
            <tbody>
              {(entries ?? []).map((e) => (
                <tr key={`${e.position}-${e.id}`}>
                  <td style={{ color: 'var(--text-muted)' }}>{e.position}</td>
                  <td className="team-player-name">
                    <button
                      onClick={() => onSelect(e.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-2)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        font: 'inherit',
                      }}
                      title={`${e.id} im Tracker suchen`}
                    >
                      {e.id}
                    </button>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>
                    {e.rankPoints.toLocaleString('de-DE')}
                  </td>
                  <td style={{ textAlign: 'center' }}>{e.kd.toFixed(2)}</td>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    {e.matchesPlayed}
                  </td>
                </tr>
              ))}
              {loading && (entries ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>
                    Bestenliste wird geladen…
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '12px 0 6px' }}>
          <button
            className="badge"
            style={{ cursor: page > 1 ? 'pointer' : 'not-allowed', opacity: page > 1 ? 1 : 0.4 }}
            disabled={page <= 1 || loading}
            onClick={() => {
              setPage((p) => Math.max(1, p - 1));
              setLoading(true);
            }}
          >
            ← Zurück
          </button>
          <span style={{ alignSelf: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Seite {page}
          </span>
          <button
            className="badge"
            style={{ cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
            disabled={loading || (entries ?? []).length === 0}
            onClick={() => {
              setPage((p) => p + 1);
              setLoading(true);
            }}
          >
            Weiter →
          </button>
        </div>
      </div>
    </div>
  );
}

export function StatsPageClient() {
  const [username, setUsername] = useState('');
  const [platform, setPlatform] = useState<Platform>('uplay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PlayerData | null>(null);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(async (name: string, plat: Platform) => {
    if (!name) return;
    setLoading(true);
    setError(null);
    setData(null);
    setSearched(true);

    try {
      const params = new URLSearchParams({ username: name, platform: plat });
      const res = await fetch(`/api/player?${params.toString()}`);
      const body: PlayerData | ApiError = await res.json();
      if (!res.ok) {
        setError((body as ApiError).error ?? 'Abruf fehlgeschlagen.');
        return;
      }
      setData(body as PlayerData);
    } catch {
      setError('Netzwerkfehler — bitte erneut versuchen.');
    } finally {
      setLoading(false);
    }
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    void runSearch(username.trim(), platform);
  }

  // Klick in der Bestenliste: Namen übernehmen und direkt suchen. Die
  // Leaderboard-Plattform "pc" entspricht uplay; für "console" lässt sich die
  // konkrete Plattform (psn/xbl) nicht ableiten — der Nutzer wählt dann selbst.
  const searchFromLeaderboard = (name: string) => {
    setUsername(name);
    void runSearch(name, platform);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showLanding = !loading && !data;

  return (
    <main className="container">
      <div className="hero">
        <h1>
          R6 <span className="accent">Tracker</span>
        </h1>
        <p>
          Gib einen Rainbow Six Siege Nutzernamen ein, um Ränge, den
          Saison-Verlauf und Statistiken abzurufen. Im stats.cc-Stil gestaltet.
        </p>
      </div>

      <form className="search" onSubmit={handleSearch}>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Platform)}
          aria-label="Plattform"
        >
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Nutzername suchen..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={loading || !username.trim()}>
          {loading ? 'Suchen...' : 'Suchen'}
        </button>
      </form>

      <SavedPlayers
        onSelect={(p) => {
          setUsername(p.username);
          setPlatform(p.platform);
          void runSearch(p.username, p.platform);
        }}
      />

      {error ? <div className="message error">{error}</div> : null}

      {loading ? (
        <div style={{ marginTop: '28px' }}>
          <div className="message info" style={{ marginBottom: '16px' }}>Daten werden abgerufen...</div>
          <PlayerSkeleton />
        </div>
      ) : null}

      {!loading && !error && data ? <PlayerProfile data={data} /> : null}

      {!loading && !error && !data && searched ? (
        <div className="message info">Kein Spieler mit diesem Namen gefunden.</div>
      ) : null}

      {/* Startansicht: Live-Status + Bestenliste, solange kein Profil offen ist */}
      {showLanding ? (
        <>
          <GameStatusBar />
          <Leaderboard onSelect={searchFromLeaderboard} />
        </>
      ) : null}
    </main>
  );
}
