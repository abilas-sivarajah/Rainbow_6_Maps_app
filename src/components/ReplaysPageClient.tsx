'use client';

// Match-Replay-Analyse — komplett lokal im Browser. Die .rec-Dateien werden
// per WebAssembly (r6-dissect nach WASM kompiliert) direkt hier geparst; es
// findet KEIN Upload statt (kein Server, kein Größenlimit, kein Kontingent,
// maximale Privatsphäre). Ergebnis wird über ReplayScorecard dargestellt.

import { useCallback, useRef, useState } from 'react';

import { ReplayScorecard } from '@/components/ReplayScorecard';
import { useLanguage } from '@/context/LanguageContext';
import {
  aggregateRounds,
  ensureParserReady,
  parseRecFile,
  type RawRound,
  type ScorecardMatch,
} from '@/lib/replayParser';

export function ReplaysPageClient() {
  const { t } = useLanguage();
  const fileInput = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<'idle' | 'engine' | 'parsing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [match, setMatch] = useState<ScorecardMatch | null>(null);

  const busy = status !== 'idle';

  const pickFiles = (list: FileList | null) => {
    setError(null);
    const recs = list
      ? Array.from(list).filter((f) => f.name.toLowerCase().endsWith('.rec'))
      : [];
    setFiles(recs);
  };

  const analyze = useCallback(async () => {
    if (files.length === 0) {
      setError(t('replays.error_select'));
      return;
    }
    setError(null);
    setMatch(null);
    try {
      setStatus('engine');
      await ensureParserReady();
      setStatus('parsing');
      const rounds: RawRound[] = [];
      for (const f of files) {
        const bytes = new Uint8Array(await f.arrayBuffer());
        try {
          rounds.push(await parseRecFile(bytes));
        } catch {
          // einzelne defekte Datei überspringen
        }
      }
      const aggregated = aggregateRounds(rounds);
      if (!aggregated) {
        setError(t('replays.error_parse'));
        return;
      }
      setMatch(aggregated);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('replays.error_parse'));
    } finally {
      setStatus('idle');
    }
  }, [files, t]);

  const reset = () => {
    setMatch(null);
    setFiles([]);
    setError(null);
    if (fileInput.current) fileInput.current.value = '';
  };

  const downloadJson = () => {
    if (!match) return;
    const blob = new Blob([JSON.stringify(match, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${match.mapName || 'match'}-${match.matchId || 'replay'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="mb-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          {t('replays.privacy')}
        </p>
        <h1 className="text-4xl font-black leading-tight sm:text-5xl">
          {t('replays.title')}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">{t('replays.subtitle')}</p>
      </section>

      {!match ? (
        <section>
          {/* Dropzone */}
          <input
            ref={fileInput}
            type="file"
            accept=".rec"
            multiple
            onChange={(e) => pickFiles(e.target.files)}
            className="hidden"
            id="rec-input"
          />
          <label
            htmlFor="rec-input"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              pickFiles(e.dataTransfer.files);
            }}
            className={`block cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
              dragOver ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:bg-surface-2'
            }`}
          >
            <div className="text-4xl">📁</div>
            <div className="mt-3 text-lg font-semibold">{t('replays.dropzone')}</div>
            <div className="mt-1 text-sm text-muted">{t('replays.drophint')}</div>
          </label>

          {files.length > 0 ? (
            <div className="mt-5 rounded-xl border border-border bg-surface p-4">
              <div className="mb-3 text-sm font-semibold text-muted">
                {t('replays.selected_files').replace('{count}', String(files.length))}
              </div>
              <div className="flex flex-col gap-1.5">
                {files.map((f) => (
                  <div
                    key={f.name}
                    className="flex justify-between border-b border-border pb-1.5 text-sm last:border-0"
                  >
                    <span>🎞 {f.name}</span>
                    <span className="text-muted">
                      {f.size >= 1024 * 1024
                        ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
                        : `${Math.ceil(f.size / 1024)} KB`}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={analyze}
                disabled={busy}
                className="mt-4 w-full rounded-lg bg-accent px-5 py-2.5 font-semibold text-bg transition-all hover:bg-accent-soft disabled:opacity-60"
              >
                {status === 'engine'
                  ? t('replays.loading_engine')
                  : status === 'parsing'
                    ? t('replays.analyzing')
                    : `▶ ${t('replays.button_analyze')}`}
              </button>
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-lg border border-loss/40 bg-loss/10 px-4 py-3 text-sm text-loss">
              {error}
            </div>
          ) : null}
        </section>
      ) : (
        <section>
          <div className="mb-5 flex flex-wrap gap-3">
            <button
              onClick={reset}
              className="rounded-lg border border-border px-5 py-2.5 font-semibold transition-colors hover:bg-surface"
            >
              ← {t('replays.reset')}
            </button>
            <button
              onClick={downloadJson}
              className="rounded-lg border border-border px-5 py-2.5 font-semibold transition-colors hover:bg-surface"
            >
              ⬇ {t('replays.download_json')}
            </button>
          </div>
          <ReplayScorecard data={match} />
        </section>
      )}
    </div>
  );
}
