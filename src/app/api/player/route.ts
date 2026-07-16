import { NextResponse } from 'next/server';

import { getDemoPlayer } from '@/lib/demo';
import { getPlayerData } from '@/lib/r6';
import { getR6DataRawDebug, hasR6DataKey, r6dataProbe } from '@/lib/r6data';
import { TRACKER_ENABLED } from '@/lib/features';
import type { Platform } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_PLATFORMS: Platform[] = ['uplay', 'psn', 'xbl'];

export async function GET(request: Request) {
  // Tracker temporarily offline — don't even attempt a lookup.
  if (!TRACKER_ENABLED) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username')?.trim();
  const platform = (searchParams.get('platform') ?? 'uplay') as Platform;

  if (!username) {
    return NextResponse.json(
      { error: 'Bitte einen Nutzernamen angeben.' },
      { status: 400 },
    );
  }

  if (!VALID_PLATFORMS.includes(platform)) {
    return NextResponse.json(
      { error: `Ungültige Plattform: ${platform}` },
      { status: 400 },
    );
  }

  // Demo mode: serve mock data without Ubisoft credentials / network.
  if (process.env.R6_DEMO === '1') {
    return NextResponse.json(getDemoPlayer(platform, username));
  }

  // Debug: raw, unmapped R6Data responses (to inspect what the API offers,
  // e.g. past-season history). Only active when an R6Data key is configured.
  if (searchParams.get('raw') === '1' && hasR6DataKey()) {
    // With probeType, forward arbitrary extra params to R6Data (to discover
    // undocumented filters like past-season selectors).
    const probeType = searchParams.get('probeType');
    if (probeType) {
      const params: Record<string, string> = {
        type: probeType,
        nameOnPlatform: username,
        platformType: platform,
      };
      for (const [key, value] of searchParams.entries()) {
        if (['username', 'platform', 'raw', 'probeType'].includes(key)) continue;
        if (value) params[key] = value;
      }
      return NextResponse.json(await r6dataProbe(params));
    }
    return NextResponse.json(await getR6DataRawDebug(platform, username));
  }

  try {
    const data = await getPlayerData(platform, username);
    if (!data) {
      return NextResponse.json(
        { error: `Kein Spieler "${username}" auf dieser Plattform gefunden.` },
        { status: 404 },
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unbekannter Fehler beim Abruf.';
    console.error('[r6-tracker] player lookup failed:', err);
    // Surface credential/config errors clearly, but don't leak internals otherwise.
    const isConfig =
      message.includes('R6DATA_API_KEY') || message.includes('invalid API key');
    return NextResponse.json(
      {
        error: isConfig
          ? message
          : 'Daten konnten nicht abgerufen werden. Eventuell ist die R6Data-API gerade nicht erreichbar.',
      },
      { status: isConfig ? 500 : 502 },
    );
  }
}
