// Baut die normalisierten PlayerData für die UI. Einzige Live-Datenquelle ist
// R6Data (./r6data) — der frühere Ubisoft-Direktclient wurde entfernt, weil
// Ubisoft Logins von Rechenzentrums-IPs (Vercel etc.) blockt.

import { getPlayerDataViaR6Data, hasR6DataKey } from './r6data';
import type { PlayerData, Platform } from './types';

/** Fetch and normalise everything we show for one player. */
export async function getPlayerData(
  platform: Platform,
  username: string,
): Promise<PlayerData | null> {
  if (!hasR6DataKey()) {
    throw new Error(
      'R6DATA_API_KEY fehlt: Ohne Key kann der Tracker keine Livedaten laden ' +
        '(Key von r6data.com, oder R6_DEMO=1 für den Demo-Modus).',
    );
  }
  return getPlayerDataViaR6Data(platform, username);
}
