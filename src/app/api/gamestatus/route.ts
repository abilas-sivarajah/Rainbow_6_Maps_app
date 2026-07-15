import { NextResponse } from 'next/server';

import { TRACKER_ENABLED } from '@/lib/features';
import { getGameStatus, hasR6DataKey, type GameStatus } from '@/lib/r6data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Spielerzahlen/Serverstatus sind Momentaufnahmen — 5 Minuten Cache reichen
// und schonen das R6Data-Kontingent.
const CACHE_HEADER = 's-maxage=300, stale-while-revalidate=600';

const DEMO_STATUS: GameStatus = {
  playersOnline: 127739,
  monthlyActive: 15300000,
  services: [
    { name: 'PC', status: 'Online' },
    { name: 'PlayStation', status: 'Online' },
    { name: 'Xbox', status: 'Online' },
  ],
};

export async function GET() {
  if (!TRACKER_ENABLED) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  if (process.env.R6_DEMO === '1') {
    return NextResponse.json(DEMO_STATUS, {
      headers: { 'Cache-Control': CACHE_HEADER },
    });
  }

  if (!hasR6DataKey()) {
    return NextResponse.json(
      { error: 'Status benötigt einen R6Data-API-Key.' },
      { status: 503 },
    );
  }

  try {
    const status = await getGameStatus();
    return NextResponse.json(status, {
      headers: { 'Cache-Control': CACHE_HEADER },
    });
  } catch (err) {
    console.error('[r6-tracker] gamestatus failed:', err);
    return NextResponse.json(
      { error: 'Status konnte nicht geladen werden.' },
      { status: 502 },
    );
  }
}
