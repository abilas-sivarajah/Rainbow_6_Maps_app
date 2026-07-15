import { NextResponse } from 'next/server';

import { TRACKER_ENABLED } from '@/lib/features';
import { getLeaderboard, hasR6DataKey, type LeaderboardEntry } from '@/lib/r6data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Die Bestenliste ändert sich nicht sekündlich — 5 Minuten Edge-Cache schonen
// das R6Data-Kontingent, wenn mehrere Besucher die Seite öffnen.
const CACHE_HEADER = 's-maxage=300, stale-while-revalidate=600';

function demoLeaderboard(page: number): LeaderboardEntry[] {
  const names = [
    'Shaiiko.BDS', 'CTZN.G2', 'Solotov.W7M', 'Paluh.LOS', 'Benja.FAZE',
    'Doki.SQ', 'Kanto.M80', 'Nesk.W7M', 'Cryn.DZ', 'Jume.W7M',
    'Alem4o.BLEED', 'Volpz.FURIA', 'Spiff.SSG', 'Hyper.M80', 'Yoggah.NIP',
    'Kheyze.NIP', 'Jv92.W7M', 'HerdsZ.LOS', 'Lenda.NIP', 'Pino.G2',
  ];
  return names.map((id, i) => ({
    id,
    position: (page - 1) * names.length + i + 1,
    rankPoints: 5200 - (page - 1) * 400 - i * 18,
    kd: Math.round((2.1 - i * 0.04) * 100) / 100,
    matchesPlayed: 140 + ((i * 13) % 90),
  }));
}

export async function GET(request: Request) {
  if (!TRACKER_ENABLED) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const platform = searchParams.get('platform') === 'console' ? 'console' : 'pc';

  if (process.env.R6_DEMO === '1') {
    return NextResponse.json(demoLeaderboard(page), {
      headers: { 'Cache-Control': CACHE_HEADER },
    });
  }

  if (!hasR6DataKey()) {
    return NextResponse.json(
      { error: 'Leaderboard benötigt einen R6Data-API-Key.' },
      { status: 503 },
    );
  }

  try {
    const entries = await getLeaderboard(page, platform);
    return NextResponse.json(entries, {
      headers: { 'Cache-Control': CACHE_HEADER },
    });
  } catch (err) {
    console.error('[r6-tracker] leaderboard failed:', err);
    return NextResponse.json(
      { error: 'Bestenliste konnte nicht geladen werden.' },
      { status: 502 },
    );
  }
}
