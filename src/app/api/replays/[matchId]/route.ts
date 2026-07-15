import { NextResponse } from 'next/server';

import { TRACKER_ENABLED } from '@/lib/features';
import { hasR6DataKey } from '@/lib/r6data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ matchId: string }> },
) {
  if (!TRACKER_ENABLED) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const { matchId } = await params;
  if (!matchId || matchId.length > 100) {
    return NextResponse.json({ error: 'Ungültige Match-ID.' }, { status: 400 });
  }

  if (process.env.R6_DEMO === '1') {
    return NextResponse.json({
      matchID: matchId,
      match: {
        replay_match_id: matchId,
        title: 'Demo-Match',
        map: 'Oregon',
        mode: 'Bomb',
        match_type: 'Ranked',
        rounds_count: 3,
        blue_score: 2,
        orange_score: 1,
      },
      rounds: [{}, {}, {}],
    });
  }

  if (!hasR6DataKey()) {
    return NextResponse.json(
      { error: 'Replay-Abruf benötigt einen R6Data-API-Key.' },
      { status: 503 },
    );
  }

  try {
    const key = process.env.R6DATA_API_KEY ?? process.env.R6_DATA_KEY ?? '';
    const res = await fetch(
      `https://r6data.com/api/replays/api/matches/${encodeURIComponent(matchId)}`,
      { headers: { 'api-key': key } },
    );
    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: `R6Data-Antwort unlesbar (HTTP ${res.status}).` },
        { status: 502 },
      );
    }
    if (res.status === 404) {
      return NextResponse.json({ error: 'Kein Replay mit dieser Match-ID gefunden.' }, { status: 404 });
    }
    if (!res.ok) {
      const msg =
        (data as { message?: string; error?: string })?.message ??
        (data as { error?: string })?.error ??
        `HTTP ${res.status}`;
      return NextResponse.json({ error: `Abruf fehlgeschlagen: ${msg}` }, { status: 502 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('[r6-tracker] replay fetch failed:', err);
    return NextResponse.json(
      { error: 'Replay konnte nicht abgerufen werden.' },
      { status: 502 },
    );
  }
}
