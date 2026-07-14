'use client';

// RP-over-time line chart for the current ranked season, in the wiki's own
// dark theme (accent-2 line on the card surface). Pure SVG + HTML overlays —
// no chart library. Axis labels and the tooltip are HTML elements positioned
// by percentage so the stretched (preserveAspectRatio="none") SVG never
// distorts text; strokes use vector-effect="non-scaling-stroke".

import { useMemo, useRef, useState } from 'react';
import type { RankHistoryPoint } from '@/lib/types';

const LINE = '#ff7a1a'; // the wiki's accent orange, validated ≥3:1 on the card surface

// Ranked 2.0 tier boundaries (every 500 RP from 1000). Used for the subtle
// dashed guide lines so RP values map to ranks at a glance.
const TIERS: Array<[number, string]> = [
  [1000, 'Copper'],
  [1500, 'Bronze'],
  [2000, 'Silver'],
  [2500, 'Gold'],
  [3000, 'Platinum'],
  [3500, 'Emerald'],
  [4000, 'Diamond'],
  [4500, 'Champions'],
];

interface Scaled extends RankHistoryPoint {
  t: number;
  x: number; // percent 0-100 inside the plot area
  y: number; // percent 0-100 inside the plot area
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
}

export default function RpChart({ points }: { points: RankHistoryPoint[] }) {
  const plotRef = useRef<HTMLDivElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const model = useMemo(() => {
    const valid = points
      .map((p) => ({ ...p, t: Date.parse(p.date) }))
      .filter((p) => !Number.isNaN(p.t) && p.rp > 0)
      .sort((a, b) => a.t - b.t);
    if (valid.length < 2) return null;

    const tMin = valid[0].t;
    const tMax = valid[valid.length - 1].t;
    const tSpan = Math.max(1, tMax - tMin);

    const rpValues = valid.map((p) => p.rp);
    // Pad the RP domain a little, then round to 50s for clean tick values.
    const rawMin = Math.min(...rpValues);
    const rawMax = Math.max(...rpValues);
    const pad = Math.max(25, Math.round((rawMax - rawMin) * 0.1));
    const yMin = Math.floor((rawMin - pad) / 50) * 50;
    const yMax = Math.ceil((rawMax + pad) / 50) * 50;
    const ySpan = Math.max(1, yMax - yMin);

    const scaled: Scaled[] = valid.map((p) => ({
      ...p,
      x: ((p.t - tMin) / tSpan) * 100,
      y: 100 - ((p.rp - yMin) / ySpan) * 100,
    }));

    // ~4 horizontal ticks on clean steps.
    const stepOptions = [50, 100, 200, 250, 500, 1000];
    const step =
      stepOptions.find((s) => ySpan / s <= 5) ?? stepOptions[stepOptions.length - 1];
    const yTicks: number[] = [];
    for (let v = Math.ceil(yMin / step) * step; v <= yMax; v += step) yTicks.push(v);

    // ~4 date ticks, evenly spread over the points.
    const tickCount = Math.min(4, scaled.length);
    const xTicks = Array.from({ length: tickCount }, (_, i) => {
      const idx = Math.round((i * (scaled.length - 1)) / Math.max(1, tickCount - 1));
      return scaled[idx];
    });

    const tierLines = TIERS.filter(([rp]) => rp > yMin && rp < yMax).map(
      ([rp, name]) => ({ name, rp, y: 100 - ((rp - yMin) / ySpan) * 100 }),
    );

    const linePath = scaled
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(' ');
    const areaPath = `${linePath} L${scaled[scaled.length - 1].x.toFixed(2)},100 L${scaled[0].x.toFixed(2)},100 Z`;

    return { scaled, yMin, yMax, yTicks, xTicks, tierLines, linePath, areaPath };
  }, [points]);

  if (!model) return null;
  const { scaled, yMin, yMax } = model;

  const onMove = (e: React.MouseEvent) => {
    const rect = plotRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    // Nearest point by x position (points are not evenly spaced in time).
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < scaled.length; i++) {
      const d = Math.abs(scaled[i].x - frac * 100);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    setHoverIdx(best);
  };

  const hover = hoverIdx != null ? scaled[hoverIdx] : null;
  const hoverPrev = hoverIdx != null && hoverIdx > 0 ? scaled[hoverIdx - 1] : null;
  const hoverDelta = hover && hoverPrev ? hover.rp - hoverPrev.rp : null;
  const last = scaled[scaled.length - 1];

  const yPct = (rp: number) => 100 - ((rp - yMin) / Math.max(1, yMax - yMin)) * 100;

  return (
    <div className="card" style={{ padding: '18px 18px 8px' }}>
      <div
        role="img"
        aria-label={`RP-Verlauf der aktuellen Season: von ${scaled[0].rp} auf ${last.rp} RP über ${scaled.length} Datenpunkte`}
        style={{ position: 'relative', height: 250 }}
      >
        {/* Plot area (leaves room for axis labels) */}
        <div
          ref={plotRef}
          onMouseMove={onMove}
          onMouseLeave={() => setHoverIdx(null)}
          style={{ position: 'absolute', top: 6, right: 10, bottom: 26, left: 48 }}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="rp-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={LINE} stopOpacity="0.22" />
                <stop offset="1" stopColor={LINE} stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* recessive horizontal grid */}
            {model.yTicks.map((v) => (
              <line
                key={`grid-${v}`}
                x1="0"
                x2="100"
                y1={yPct(v)}
                y2={yPct(v)}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {/* rank tier boundaries */}
            {model.tierLines.map((t) => (
              <line
                key={`tier-${t.rp}`}
                x1="0"
                x2="100"
                y1={t.y}
                y2={t.y}
                stroke="rgba(148,163,184,0.35)"
                strokeWidth="1"
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path d={model.areaPath} fill="url(#rp-fill)" />
            <path
              d={model.linePath}
              fill="none"
              stroke={LINE}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            {/* crosshair */}
            {hover ? (
              <line
                x1={hover.x}
                x2={hover.x}
                y1="0"
                y2="100"
                stroke="rgba(148,163,184,0.4)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
          </svg>

          {/* tier labels (HTML so they don't stretch) */}
          {model.tierLines.map((t) => (
            <span
              key={`tierlabel-${t.rp}`}
              style={{
                position: 'absolute',
                right: 2,
                top: `${t.y}%`,
                transform: 'translateY(-100%)',
                fontSize: '0.62rem',
                color: 'var(--text-muted)',
                opacity: 0.8,
                pointerEvents: 'none',
              }}
            >
              {t.name} ab {t.rp.toLocaleString('de-DE')}
            </span>
          ))}

          {/* end-point marker + direct label with current RP */}
          <div
            style={{
              position: 'absolute',
              left: `${last.x}%`,
              top: `${last.y}%`,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: LINE,
              border: '2px solid var(--bg-elevated)',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: `${Math.min(last.x, 88)}%`,
              top: `${last.y}%`,
              transform: `translate(${last.x > 85 ? '-100%' : '8px'}, -130%)`,
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--text)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {last.rp.toLocaleString('de-DE')} RP
          </span>

          {/* hover marker */}
          {hover ? (
            <div
              style={{
                position: 'absolute',
                left: `${hover.x}%`,
                top: `${hover.y}%`,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: LINE,
                border: '2px solid var(--bg-elevated)',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
              }}
            />
          ) : null}

          {/* tooltip */}
          {hover ? (
            <div
              style={{
                position: 'absolute',
                left: `${hover.x}%`,
                top: `${hover.y}%`,
                transform: `translate(${hover.x > 62 ? 'calc(-100% - 12px)' : '12px'}, -50%)`,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 10px',
                pointerEvents: 'none',
                zIndex: 5,
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {formatDateTime(hover.date)}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 4,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                {hover.rankImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={hover.rankImage} alt={hover.rank} style={{ width: 20, height: 20 }} />
                ) : null}
                <span>{hover.rp.toLocaleString('de-DE')} RP</span>
                {hoverDelta != null && hoverDelta !== 0 ? (
                  <span
                    style={{
                      color: hoverDelta > 0 ? 'var(--win)' : 'var(--loss)',
                      fontSize: '0.75rem',
                    }}
                  >
                    {hoverDelta > 0 ? '+' : ''}
                    {hoverDelta}
                  </span>
                ) : null}
              </div>
              {hover.rank ? (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {hover.rank}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Y axis labels */}
        {model.yTicks.map((v) => (
          <span
            key={`ylabel-${v}`}
            style={{
              position: 'absolute',
              left: 0,
              width: 40,
              top: `calc(6px + ${yPct(v)} * (100% - 32px) / 100)`,
              transform: 'translateY(-50%)',
              textAlign: 'right',
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          >
            {v.toLocaleString('de-DE')}
          </span>
        ))}

        {/* X axis labels */}
        {model.xTicks.map((p, i) => (
          <span
            key={`xlabel-${i}`}
            style={{
              position: 'absolute',
              bottom: 0,
              left: `calc(48px + ${p.x} * (100% - 58px) / 100)`,
              transform: 'translateX(-50%)',
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          >
            {formatDate(p.date)}
          </span>
        ))}
      </div>
    </div>
  );
}
