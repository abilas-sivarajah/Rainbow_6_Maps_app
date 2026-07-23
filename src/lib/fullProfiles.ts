// Parser für das "full_profiles"-Payload (Ranked-2.0-Boards). Das Format
// stammt ursprünglich vom Ubisoft-Endpoint `r6s/skill/full_profiles`; R6Data
// liefert es in seinen stats/fullStats-Antworten unverändert mit.

import type { BoardStats, RankInfo } from './types';
import { rankBadge } from './rankBadge';

// Ranked 2.0 (season 28 / Y7S4 onward). Index = rank id returned by the API.
const RANKS_V6 = [
  'Unranked',
  'Copper 5', 'Copper 4', 'Copper 3', 'Copper 2', 'Copper 1',
  'Bronze 5', 'Bronze 4', 'Bronze 3', 'Bronze 2', 'Bronze 1',
  'Silver 5', 'Silver 4', 'Silver 3', 'Silver 2', 'Silver 1',
  'Gold 5', 'Gold 4', 'Gold 3', 'Gold 2', 'Gold 1',
  'Platinum 5', 'Platinum 4', 'Platinum 3', 'Platinum 2', 'Platinum 1',
  'Emerald 5', 'Emerald 4', 'Emerald 3', 'Emerald 2', 'Emerald 1',
  'Diamond 5', 'Diamond 4', 'Diamond 3', 'Diamond 2', 'Diamond 1',
  'Champions',
];

function rankInfo(id: number, points: number): RankInfo {
  const name = RANKS_V6[id] ?? 'Unranked';
  return { id, name, mmr: points, icon: rankBadge(name) };
}

export interface RawFullProfile {
  season_id?: number;
  profile?: {
    board_id?: string;
    rank?: number;
    max_rank?: number;
    rank_points?: number;
    max_rank_points?: number;
    season_id?: number;
    top_rank_position?: number;
  };
  season_statistics?: {
    kills?: number;
    deaths?: number;
    match_outcomes?: { wins?: number; losses?: number; abandons?: number };
  };
}

/** Shared shape of the "full_profiles" payload in R6Data's stats responses. */
export interface FullProfilesData {
  platform_families_full_profiles?: Array<{
    board_ids_full_profiles?: Array<{
      board_id?: string;
      full_profiles?: RawFullProfile[];
    }>;
  }>;
}

function toBoard(fp: RawFullProfile): BoardStats {
  const p = fp.profile ?? {};
  const s = fp.season_statistics ?? {};
  const mo = s.match_outcomes ?? {};
  const wins = mo.wins ?? 0;
  const losses = mo.losses ?? 0;
  const abandons = mo.abandons ?? 0;
  const kills = s.kills ?? 0;
  const deaths = s.deaths ?? 0;
  const matches = wins + losses + abandons;
  return {
    current: rankInfo(p.rank ?? 0, p.rank_points ?? 0),
    max: rankInfo(p.max_rank ?? 0, p.max_rank_points ?? 0),
    mmr: p.rank_points ?? 0,
    wins,
    losses,
    abandons,
    matches,
    winRate: wins + losses > 0 ? `${((wins / (wins + losses)) * 100).toFixed(1)}%` : '0%',
    kills,
    deaths,
    kd: deaths > 0 ? Math.round((kills / deaths) * 100) / 100 : kills,
    lastMatch: { result: 'unknown', mmrChange: 0 },
  };
}

export interface FullProfiles {
  ranked: BoardStats | null;
  casual: BoardStats | null;
  seasonId: number;
}

/** Pure parser for a full_profiles payload. */
export function parseFullProfiles(data: FullProfilesData): FullProfiles {
  const boards =
    data.platform_families_full_profiles?.[0]?.board_ids_full_profiles ?? [];
  let ranked: BoardStats | null = null;
  let casual: BoardStats | null = null;
  let seasonId = 0;
  for (const b of boards) {
    const fp = b.full_profiles?.[0];
    if (!fp) continue;
    seasonId = fp.season_id ?? fp.profile?.season_id ?? seasonId;
    if (b.board_id === 'ranked') ranked = toBoard(fp);
    else if (b.board_id === 'casual') casual = toBoard(fp);
  }
  return { ranked, casual, seasonId };
}
