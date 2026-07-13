'use client';

import { useState } from 'react';

import PlayerProfile from '@/components/PlayerProfile';
import type { ApiError, PlayerData, Platform } from '@/lib/types';

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'uplay', label: 'PC (Ubisoft)' },
  { value: 'psn', label: 'PlayStation' },
  { value: 'xbl', label: 'Xbox' },
];

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

export function StatsPageClient() {
  const [username, setUsername] = useState('');
  const [platform, setPlatform] = useState<Platform>('uplay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PlayerData | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const name = username.trim();
    if (!name) return;

    setLoading(true);
    setError(null);
    setData(null);
    setSearched(true);

    try {
      const params = new URLSearchParams({ username: name, platform });
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
  }

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

      {error ? <div className="message error">{error}</div> : null}

      {loading ? (
        <div style={{ marginTop: '28px' }}>
          <div className="message info" style={{ marginBottom: '16px' }}>Daten werden von Ubisoft abgerufen...</div>
          <PlayerSkeleton />
        </div>
      ) : null}

      {!loading && !error && data ? <PlayerProfile data={data} /> : null}

      {!loading && !error && !data && searched ? (
        <div className="message info">Kein Spieler mit diesem Namen gefunden.</div>
      ) : null}
    </main>
  );
}
