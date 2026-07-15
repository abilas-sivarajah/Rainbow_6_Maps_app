'use client';

// Match-Replay-Analyse über R6Datas Replay-API: .rec-Dateien (aus dem
// MatchReplay-Ordner des Spiels) hochladen, geparst zurückbekommen und als
// Match-Zusammenfassung anzeigen. Bereits hochgeladene Matches lassen sich
// über ihre Match-ID erneut abrufen.

import { useRef, useState } from 'react';

interface ReplayMatch {
  match_id?: string;
  replay_match_id?: string;
  title?: string;
  map?: string;
  mode?: string;
  match_type?: string;
  rounds_count?: number;
  blue_score?: number;
  orange_score?: number;
}

interface ReplayResult {
  matchID?: string;
  match?: ReplayMatch;
  rounds?: unknown[];
  quota?: { plan?: string; limit?: number; used?: number; remaining?: number };
}

// Vercel-Funktionen akzeptieren nur ~4,5 MB Request-Body — größere Uploads
// scheitern serverseitig, also vorher abfangen.
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;

function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.ceil(n / 1024)} KB`;
}

function MatchCard({ result }: { result: ReplayResult }) {
  const m = result.match ?? {};
  const matchId = result.matchID ?? m.replay_match_id ?? '';
  const rounds = m.rounds_count ?? result.rounds?.length ?? 0;
  const [copied, setCopied] = useState(false);

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: '2rem' }}>🎬</span>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>
            {m.map ?? 'Unbekannte Karte'}
            {m.mode ? <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}> · {m.mode}</span> : null}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>
            {m.match_type ?? 'Match'} · {rounds} Runde{rounds === 1 ? '' : 'n'}
            {m.title ? ` · ${m.title}` : ''}
          </div>
        </div>
        {m.blue_score != null && m.orange_score != null ? (
          <div style={{ fontFamily: 'var(--font-outfit), sans-serif', fontSize: '1.8rem', fontWeight: 800 }}>
            <span style={{ color: '#38bdf8' }}>{m.blue_score}</span>
            <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>:</span>
            <span style={{ color: 'var(--accent-2)' }}>{m.orange_score}</span>
          </div>
        ) : null}
      </div>
      {matchId ? (
        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          <span>Match-ID:</span>
          <code style={{ background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 6, wordBreak: 'break-all' }}>
            {matchId}
          </code>
          <button
            className="badge"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              navigator.clipboard?.writeText(matchId).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              });
            }}
          >
            {copied ? '✓ Kopiert' : 'Kopieren'}
          </button>
          <span>— damit lässt sich das Match später wieder abrufen.</span>
        </div>
      ) : null}
      {result.quota ? (
        <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Upload-Kontingent ({result.quota.plan ?? '–'}): {result.quota.used ?? '–'} / {result.quota.limit ?? '–'} verwendet
          {result.quota.remaining != null ? ` · ${result.quota.remaining} übrig` : ''}
        </div>
      ) : null}
    </div>
  );
}

export function ReplaysPageClient() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReplayResult | null>(null);

  const [lookupId, setLookupId] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<ReplayResult | null>(null);

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  const tooBig = totalBytes > MAX_TOTAL_BYTES;

  const onFilesChosen = (list: FileList | null) => {
    setError(null);
    setResult(null);
    setFiles(list ? Array.from(list) : []);
  };

  const upload = async () => {
    if (files.length === 0 || tooBig) return;
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      for (const f of files) form.append('replayFiles', f, f.name);
      const res = await fetch('/api/replays', { method: 'POST', body: form });
      const body = (await res.json()) as ReplayResult & { error?: string };
      if (!res.ok) {
        setError(body.error ?? 'Upload fehlgeschlagen.');
        return;
      }
      setResult(body);
      setFiles([]);
      if (fileInput.current) fileInput.current.value = '';
    } catch {
      setError('Netzwerkfehler — bitte erneut versuchen.');
    } finally {
      setUploading(false);
    }
  };

  const lookup = async () => {
    const id = lookupId.trim();
    if (!id) return;
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);
    try {
      const res = await fetch(`/api/replays/${encodeURIComponent(id)}`);
      const body = (await res.json()) as ReplayResult & { error?: string };
      if (!res.ok) {
        setLookupError(body.error ?? 'Abruf fehlgeschlagen.');
        return;
      }
      setLookupResult(body);
    } catch {
      setLookupError('Netzwerkfehler — bitte erneut versuchen.');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="hero">
        <h1>
          Match <span className="accent">Replays</span>
        </h1>
        <p>
          Lade deine Rainbow-Six-Replay-Dateien (.rec) hoch und erhalte eine
          Auswertung: Karte, Modus, Runden und Ergebnis. Die Dateien findest du
          im Spielordner unter <code>MatchReplay</code>.
        </p>
      </div>

      {/* Upload */}
      <div className="section">
        <p className="section-title">Replay hochladen</p>
        <div className="card">
          <input
            ref={fileInput}
            type="file"
            accept=".rec"
            multiple
            onChange={(e) => onFilesChosen(e.target.files)}
            style={{ display: 'none' }}
            id="rec-input"
          />
          <label
            htmlFor="rec-input"
            style={{
              display: 'block',
              border: '2px dashed var(--border)',
              borderRadius: 12,
              padding: '32px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ fontSize: '1.6rem' }}>📁</div>
            <div style={{ marginTop: 6, fontWeight: 600, color: 'var(--text)' }}>
              .rec-Dateien auswählen
            </div>
            <div style={{ fontSize: '0.8rem', marginTop: 4 }}>
              Runden desselben Matches gemeinsam hochladen (max. 20 Dateien, ~4 MB gesamt)
            </div>
          </label>

          {files.length > 0 ? (
            <div style={{ marginTop: 14 }}>
              {files.map((f) => (
                <div
                  key={f.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    padding: '6px 4px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span>🎞 {f.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{formatBytes(f.size)}</span>
                </div>
              ))}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 12,
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: tooBig ? 'var(--loss)' : 'var(--text-muted)' }}>
                  Gesamt: {formatBytes(totalBytes)}
                  {tooBig ? ' — zu groß! Bitte weniger Dateien auswählen (Limit ~4 MB).' : ''}
                </span>
                <button
                  className="badge"
                  style={{
                    cursor: uploading || tooBig ? 'not-allowed' : 'pointer',
                    background: 'var(--accent-2)',
                    color: '#0f172a',
                    border: 'none',
                    padding: '8px 22px',
                    fontSize: '0.9rem',
                    opacity: uploading || tooBig ? 0.6 : 1,
                  }}
                  disabled={uploading || tooBig}
                  onClick={upload}
                >
                  {uploading ? 'Wird hochgeladen…' : 'Hochladen & analysieren'}
                </button>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="message error" style={{ marginTop: 14 }}>
              {error}
            </div>
          ) : null}
        </div>

        {result ? <MatchCard result={result} /> : null}
      </div>

      {/* Lookup */}
      <div className="section">
        <p className="section-title">Match per ID abrufen</p>
        <div className="card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Match-ID (z.B. 8f2c1b4e-…)"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            style={{
              flex: 1,
              minWidth: 220,
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '10px 14px',
              color: 'var(--text)',
              outline: 'none',
            }}
          />
          <button
            className="badge"
            style={{
              cursor: lookupLoading || !lookupId.trim() ? 'not-allowed' : 'pointer',
              padding: '8px 22px',
              fontSize: '0.9rem',
              opacity: lookupLoading || !lookupId.trim() ? 0.6 : 1,
            }}
            disabled={lookupLoading || !lookupId.trim()}
            onClick={lookup}
          >
            {lookupLoading ? 'Lädt…' : 'Abrufen'}
          </button>
        </div>
        {lookupError ? (
          <div className="message error" style={{ marginTop: 14 }}>
            {lookupError}
          </div>
        ) : null}
        {lookupResult ? <MatchCard result={lookupResult} /> : null}
      </div>
    </main>
  );
}
