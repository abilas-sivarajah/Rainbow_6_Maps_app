import { NextResponse } from 'next/server';

import { TRACKER_ENABLED } from '@/lib/features';
import { hasR6DataKey } from '@/lib/r6data';

// Replay-Uploads laufen laut R6Data-Doku über die Host-Domain r6data.com
// (nicht api.r6data.com). Der API-Key bleibt serverseitig — der Browser lädt
// zu uns hoch, wir reichen die Dateien weiter.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UPLOAD_URL = 'https://r6data.com/api/replays/api/upload';

const DEMO_RESULT = {
  matchID: 'demo-8f2c1b4e-0000-0000-0000-000000000000',
  rounds: [{ parserEngine: 'r6data-parser' }, { parserEngine: 'r6data-parser' }],
  match: {
    match_id: 'demo-match',
    replay_match_id: 'demo-8f2c1b4e-0000-0000-0000-000000000000',
    title: 'Demo-Match',
    map: 'Clubhouse',
    mode: 'Bomb',
    match_type: 'Ranked',
    rounds_count: 2,
    blue_score: 1,
    orange_score: 1,
  },
  quota: { plan: 'free', limit: 20, used: 3, remaining: 17 },
};

export async function POST(request: Request) {
  if (!TRACKER_ENABLED) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  if (process.env.R6_DEMO === '1') {
    return NextResponse.json(DEMO_RESULT);
  }

  if (!hasR6DataKey()) {
    return NextResponse.json(
      { error: 'Replay-Upload benötigt einen R6Data-API-Key.' },
      { status: 503 },
    );
  }

  let incoming: FormData;
  try {
    incoming = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'Ungültiger Upload (multipart/form-data erwartet).' },
      { status: 400 },
    );
  }

  const files = incoming
    .getAll('replayFiles')
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return NextResponse.json(
      { error: 'Bitte mindestens eine .rec-Datei auswählen.' },
      { status: 400 },
    );
  }
  if (files.length > 20) {
    return NextResponse.json(
      { error: 'Maximal 20 Dateien pro Upload.' },
      { status: 400 },
    );
  }

  const form = new FormData();
  for (const f of files) form.append('replayFiles', f, f.name);

  try {
    const key = process.env.R6DATA_API_KEY ?? process.env.R6_DATA_KEY ?? '';
    const res = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: { 'api-key': key },
      body: form,
    });
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
    if (!res.ok) {
      const msg =
        (data as { message?: string; error?: string })?.message ??
        (data as { error?: string })?.error ??
        `HTTP ${res.status}`;
      return NextResponse.json({ error: `Upload fehlgeschlagen: ${msg}` }, { status: 502 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('[r6-tracker] replay upload failed:', err);
    return NextResponse.json(
      { error: 'Replay-Upload fehlgeschlagen (Netzwerk/Serverfehler).' },
      { status: 502 },
    );
  }
}
