// R6Data provider (https://r6data.com) — a hosted service that fetches the
// official Rainbow Six Siege data server-side and exposes it behind a simple
// API key. This sidesteps the Ubisoft login entirely (no DataDome, no 2FA, no
// per-IP login rate limit), so it works from any network and when deployed.
//
// Get a free key at https://r6data.com and set R6DATA_API_KEY in .env.local.

import { OPERATOR_ICONS } from './operatorIcons';
import { parseFullProfiles, type FullProfilesData } from './fullProfiles';
import type {
  BoardStats,
  GeneralStats,
  OperatorBrief,
  PlayerData,
  Platform,
  RankHistoryPoint,
  RankInfo,
  RecentMatch,
  SeasonRank,
} from './types';

const BASE = 'https://api.r6data.com/api';

export function hasR6DataKey(): boolean {
  return !!(process.env.R6DATA_API_KEY ?? process.env.R6_DATA_KEY);
}

function apiKey(): string {
  const k = process.env.R6DATA_API_KEY ?? process.env.R6_DATA_KEY;
  if (!k) throw new Error('Missing R6DATA_API_KEY in .env.local');
  return k;
}

async function r6dataGet<T>(params: Record<string, string>): Promise<T> {
  return r6dataGetPath<T>('/stats', params);
}

async function r6dataGetPath<T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const url = `${BASE}${path}${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, { headers: { 'api-key': apiKey() } });
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`R6Data non-JSON response (HTTP ${res.status}): ${text.slice(0, 120)}`);
  }
  if (!res.ok) {
    if (res.status === 401) throw new Error('R6Data: invalid API key (401).');
    if (res.status === 404) return null as T;
    const msg = (data as { message?: string; error?: string })?.message ??
      (data as { error?: string })?.error ?? `HTTP ${res.status}`;
    throw new Error(`R6Data error: ${msg}`);
  }
  return data as T;
}

/** Defensively read a ban flag from R6Data's isBanned response. */
function pickBanned(res: unknown): boolean {
  if (!res || typeof res !== 'object') return false;
  const r = res as Record<string, unknown>;
  for (const k of ['isBanned', 'banned', 'is_banned']) {
    if (typeof r[k] === 'boolean') return r[k] as boolean;
  }
  // Some APIs return a list of bans.
  const bans = (r.bans ?? r.sanctions) as unknown;
  if (Array.isArray(bans)) return bans.length > 0;
  return false;
}

/** Ban reasons/dates from isBanned's banAlerts (documented shape). */
function pickBanAlerts(res: unknown): PlayerData['banAlerts'] {
  const alerts = (res as { banAlerts?: unknown })?.banAlerts;
  if (!Array.isArray(alerts)) return undefined;
  const mapped = alerts
    .filter((a): a is Record<string, unknown> => !!a && typeof a === 'object')
    .map((a) => ({
      reason: typeof a.reasonName === 'string' ? a.reasonName : '',
      date: typeof a.banDate === 'string' ? a.banDate : '',
      reversed: a.banReversed === true,
    }));
  return mapped.length > 0 ? mapped : undefined;
}

function pickAvatar(account: unknown, username: string): string {
  const a = (account ?? {}) as Record<string, unknown>;
  // R6Data returns a ready-to-use avatar URL.
  const pic = a.profilePicture as string | undefined;
  if (pic) return pic.replace('_146_146', '_256_256');
  const uid = (a.profileId as string) ?? (a.userId as string) ?? '';
  if (uid) return `https://ubisoft-avatars.akamaized.net/${uid}/default_256_256.png`;
  const letter = (username[0] ?? 'R').toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="76" height="76">` +
    `<rect width="76" height="76" rx="12" fill="#4d8bf0"/>` +
    `<text x="38" y="50" font-family="Arial" font-size="34" font-weight="bold" fill="#fff" text-anchor="middle">${letter}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** R6Data hosts rank tier images, e.g. .../bronze-5.webp. */
function rankImageUrl(name: string): string | null {
  if (!name || name === 'Unranked') return null;
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return `https://r6data.com/assets/img/r6_ranks_img/${slug}.webp`;
}

/** Swap the generated SVG rank icons for R6Data's real tier images. */
function withRealRankIcons(board: BoardStats | null): BoardStats | null {
  if (!board) return board;
  board.current.icon = rankImageUrl(board.current.name) ?? board.current.icon;
  board.max.icon = rankImageUrl(board.max.name) ?? board.max.icon;
  return board;
}

// Ranked 2.0 RP thresholds: tiers start at 1000 RP and span 500 RP each,
// divisions 100 RP each (verified against R6Data's own seasons table, e.g.
// 2562 RP -> Gold 5, 1611 -> Bronze 4, 1359 -> Copper 2). 4500+ = Champions.
const RP_TIERS = ['Copper', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond'];

function rankNameFromRp(rp: number | null | undefined): string {
  if (rp == null || rp <= 0) return 'Unranked';
  if (rp >= 4500) return 'Champions';
  const clamped = Math.max(rp, 1000);
  const tier = Math.min(Math.floor((clamped - 1000) / 500), RP_TIERS.length - 1);
  const division = 5 - Math.floor(((clamped - 1000) % 500) / 100);
  return `${RP_TIERS[tier]} ${division}`;
}

function rankInfoFromRp(rp: number | null | undefined): RankInfo {
  const name = rankNameFromRp(rp);
  return { id: 0, name, mmr: rp ?? 0, icon: rankImageUrl(name) ?? '' };
}

// One "segment" of R6Data's seasonsStats/fullStats response; the ranked
// per-season segments carry everything the seasons table shows.
interface RawSeasonSegment {
  type?: string;
  attributes?: { season?: number; gamemode?: string };
  metadata?: { name?: string; shortName?: string; color?: string };
  stats?: Record<string, { value?: number | null } | undefined>;
}

/** Map seasonsStats segments to the per-season history the UI renders. */
function parseSeasonHistory(res: unknown): SeasonRank[] {
  const segments =
    (res as { data?: { segments?: RawSeasonSegment[] } })?.data?.segments ?? [];
  const out: SeasonRank[] = [];
  for (const seg of segments) {
    if (seg.type !== 'season' || seg.attributes?.gamemode !== 'pvp_ranked') continue;
    const stat = (key: string): number => Number(seg.stats?.[key]?.value ?? 0);
    const rp = seg.stats?.rankPoints?.value ?? null;
    const maxRp = seg.stats?.maxRankPoints?.value ?? null;
    const wins = stat('matchesWon');
    const losses = stat('matchesLost');
    const matches = stat('matchesPlayed');
    const kills = stat('kills');
    const deaths = stat('deaths');
    out.push({
      seasonId: seg.attributes?.season ?? 0,
      seasonName: seg.metadata?.name ?? seg.metadata?.shortName ?? '',
      seasonColor: seg.metadata?.color,
      region: seg.metadata?.shortName ?? '',
      rank: rankInfoFromRp(rp ?? maxRp),
      maxRank: rankInfoFromRp(maxRp),
      mmr: Number(rp ?? maxRp ?? 0),
      wins,
      losses,
      abandons: Math.max(0, matches - wins - losses),
      matches,
      winRate:
        wins + losses > 0 ? `${((wins / (wins + losses)) * 100).toFixed(1)}%` : '0%',
      kd: deaths > 0 ? Math.round((kills / deaths) * 100) / 100 : kills,
    });
  }
  return out.sort((a, b) => b.seasonId - a.seasonId);
}

/** Small side-coloured operator badge (no external icon hosting needed). */
function operatorIcon(name: string, side: string): string {
  const color = side === 'Attacker' ? '#e8732a' : '#3b82f6';
  const label = name.trim().slice(0, 3);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">` +
    `<rect width="48" height="48" rx="8" fill="${color}"/>` +
    `<text x="24" y="30" font-family="Arial" font-size="15" font-weight="bold" fill="#0b0e14" text-anchor="middle">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface RawOperator {
  operator: string;
  side: string;
  kd: number;
  winPercent: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  headshots: number;
  roundsPlayed: number;
  matchesPlayed: number;
  timePlayedMs: number;
}

function normalizeOpName(name: string): string {
  return name
    .toLowerCase()
    .replace(/ø/g, 'o')
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function mapOperators(ops: RawOperator[]): OperatorBrief[] {
  return ops.slice(0, 8).map((o) => ({
    name: o.operator.trim(),
    icon: OPERATOR_ICONS[normalizeOpName(o.operator)] ?? operatorIcon(o.operator, o.side),
    kills: o.kills,
    deaths: o.deaths,
    kd: o.kd,
    winRate: `${o.winPercent}%`,
    matches: o.matchesPlayed,
    playtime: Math.round((o.timePlayedMs / 3_600_000) * 10) / 10,
  }));
}

/** Aggregate per-operator (ranked) stats into a career overview. */
function aggregateGeneral(ops: RawOperator[]): GeneralStats | null {
  if (ops.length === 0) return null;
  let kills = 0, deaths = 0, headshots = 0, wins = 0, losses = 0, rounds = 0, ms = 0;
  for (const o of ops) {
    kills += o.kills;
    deaths += o.deaths;
    headshots += o.headshots;
    wins += o.wins;
    losses += o.losses;
    rounds += o.roundsPlayed;
    ms += o.timePlayedMs;
  }
  return {
    kills,
    deaths,
    kd: deaths > 0 ? Math.round((kills / deaths) * 100) / 100 : kills,
    wins,
    losses,
    winRate: wins + losses > 0 ? `${((wins / (wins + losses)) * 100).toFixed(1)}%` : '0%',
    matches: rounds,
    headshots,
    headshotPercent: kills > 0 ? `${((headshots / kills) * 100).toFixed(1)}%` : '0%',
    playtimeHours: Math.round((ms / 3_600_000) * 10) / 10,
  };
}

interface RawHistoryPoint {
  0: string; // timestamp
  1: { value: number; metadata?: { rank?: string; color?: string; imageUrl?: string } };
}

function historyArray(seasonal: unknown): RawHistoryPoint[] {
  const data = (seasonal as { data?: { history?: { data?: RawHistoryPoint[] } } })
    ?.data?.history?.data;
  return Array.isArray(data) ? data : [];
}

/** Chronological RP timeline of the current season (for the profile chart). */
function parseRankHistory(seasonal: unknown): RankHistoryPoint[] {
  return historyArray(seasonal) // newest first
    .map((p) => ({
      date: p[0],
      rp: p[1]?.value ?? 0,
      rank: p[1]?.metadata?.rank ?? '',
      rankImage: p[1]?.metadata?.imageUrl ?? '',
      color: p[1]?.metadata?.color,
    }))
    .reverse();
}

/**
 * Derive recent ranked matches from the RP timeline: each consecutive pair of
 * points is one match — RP up = win, RP down = loss. (R6Data has no per-match
 * endpoint; this mirrors how trackers show "recent matches".)
 */
function parseRecentMatches(seasonal: unknown): RecentMatch[] {
  const data = historyArray(seasonal); // newest first
  const out: RecentMatch[] = [];
  for (let i = 0; i < data.length - 1 && out.length < 20; i++) {
    const cur = data[i];
    const prev = data[i + 1];
    const rp = cur[1]?.value ?? 0;
    const rpChange = rp - (prev[1]?.value ?? 0);
    if (rpChange === 0) continue;
    const meta = cur[1]?.metadata ?? {};
    out.push({
      date: cur[0],
      result: rpChange > 0 ? 'win' : 'loss',
      rpChange,
      rp,
      rank: meta.rank ?? '',
      rankImage: meta.imageUrl ?? '',
    });
  }
  return out;
}

// --- Leaderboard, Live-Spielerzahlen & Serverstatus --------------------------

export interface LeaderboardEntry {
  id: string;
  kd: number;
  matchesPlayed: number;
  rankPoints: number;
  position: number;
}

export async function getLeaderboard(
  page = 1,
  platform: 'pc' | 'console' = 'pc',
): Promise<LeaderboardEntry[]> {
  const data = await r6dataGet<unknown>({
    type: 'leaderboards',
    page: String(page),
    platform,
  });
  if (!Array.isArray(data)) return [];
  return data
    .filter((e): e is Record<string, unknown> => !!e && typeof e === 'object')
    .map((e) => ({
      id: typeof e.id === 'string' ? e.id : '',
      kd: Number(e.kd ?? 0),
      matchesPlayed: Number(e.matchesPlayed ?? 0),
      rankPoints: Number(e.rankPoints ?? 0),
      position: Number(e.position ?? 0),
    }))
    .filter((e) => e.id);
}

export interface GameStatus {
  playersOnline: number | null;
  monthlyActive: number | null;
  services: Array<{ name: string; status: string }>;
}

export async function getGameStatus(): Promise<GameStatus> {
  const [stats, services] = await Promise.all([
    r6dataGet<{
      ubisoft?: { onlineEstimate?: number };
      crossPlatform?: { monthlyActive?: number };
    }>({ type: 'gameStats' }).catch(() => null),
    r6dataGetPath<Array<{ name?: string; status?: string }>>('/servicestatus').catch(
      () => null,
    ),
  ]);
  return {
    playersOnline: stats?.ubisoft?.onlineEstimate ?? null,
    monthlyActive: stats?.crossPlatform?.monthlyActive ?? null,
    services: Array.isArray(services)
      ? services.map((s) => ({ name: s.name ?? '', status: s.status ?? '' }))
      : [],
  };
}

/**
 * Temporary helper: forward arbitrary params to R6Data's /stats endpoint, so
 * undocumented parameters (e.g. past-season filters) can be probed safely.
 */
export async function r6dataProbe(params: Record<string, string>): Promise<unknown> {
  try {
    return await r6dataGet<unknown>(params);
  } catch (err) {
    return { __error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Temporary helper: fetch the raw R6Data responses we don't yet map, so their
 * exact shapes can be inspected (avatar id, operators, seasonal history).
 */
export async function getR6DataRawDebug(
  platform: Platform,
  username: string,
): Promise<Record<string, unknown>> {
  const family = platform === 'uplay' ? 'pc' : 'console';
  const grab = async (params: Record<string, string>) => {
    try {
      return await r6dataGet<unknown>(params);
    } catch (err) {
      return { __error: err instanceof Error ? err.message : String(err) };
    }
  };
  const [accountInfo, operatorStats, seasonalStats, stats] = await Promise.all([
    grab({ type: 'accountInfo', nameOnPlatform: username, platformType: platform }),
    grab({ type: 'operatorStats', nameOnPlatform: username, platformType: platform, modes: 'ranked' }),
    grab({ type: 'seasonalStats', nameOnPlatform: username, platformType: platform }),
    grab({ type: 'stats', nameOnPlatform: username, platformType: platform, platform_families: family }),
  ]);
  return { accountInfo, operatorStats, seasonalStats, stats };
}

// fullStats bundles what used to take three separate calls: the current
// ranked/casual boards (platform_families_full_profiles), the per-season
// segments (seasonsStats) AND profile basics (level, avatar, handle).
interface FullStatsResponse extends FullProfilesData {
  data?: {
    platformInfo?: {
      platformUserId?: string;
      platformUserHandle?: string;
      avatarUrl?: string;
    };
    metadata?: { currentSeason?: number; clearanceLevel?: number };
    segments?: unknown[];
  };
}

export async function getPlayerDataViaR6Data(
  platform: Platform,
  username: string,
): Promise<PlayerData | null> {
  // One consolidated call instead of stats + seasonsStats + accountInfo —
  // player searches used to cost 6 R6Data requests, now 4 (API quota!).
  const full = await r6dataGet<FullStatsResponse | null>({
    type: 'fullStats',
    nameOnPlatform: username,
    platformType: platform,
  });
  // No profile structure => player not found.
  if (!full || !full.platform_families_full_profiles) return null;

  const profiles = parseFullProfiles(full);
  const ranked = withRealRankIcons(profiles.ranked);
  const casual = withRealRankIcons(profiles.casual);

  const grab = async <T>(params: Record<string, string>, label: string): Promise<T | null> => {
    try {
      return await r6dataGet<T>(params);
    } catch (err) {
      console.error(
        `[r6-tracker] R6Data ${label} failed (continuing):`,
        err instanceof Error ? err.message : err,
      );
      return null;
    }
  };

  // Fetch the remaining pieces in parallel (all best-effort).
  const [operatorsRes, seasonal, banRes] = await Promise.all([
    grab<{ operators?: RawOperator[] }>(
      { type: 'operatorStats', nameOnPlatform: username, platformType: platform, modes: 'ranked' },
      'operatorStats',
    ),
    grab<unknown>({ type: 'seasonalStats', nameOnPlatform: username, platformType: platform }, 'seasonalStats'),
    grab<unknown>({ type: 'isBanned', nameOnPlatform: username, platformType: platform }, 'isBanned'),
  ]);

  const info = full.data?.platformInfo ?? {};
  const level = Number(full.data?.metadata?.clearanceLevel ?? 0);
  const xp = 0; // not exposed by fullStats (the old accountInfo reported 0 too)
  const operators = operatorsRes?.operators ?? [];

  // Inactivity: how many seasons behind the current one is the player's data.
  // fullStats liefert die aktuelle Season gleich mit — kein Hardcoding nötig;
  // R6_CURRENT_SEASON bleibt als manueller Override.
  const currentSeason = Number(
    process.env.R6_CURRENT_SEASON ?? full.data?.metadata?.currentSeason ?? 0,
  );
  const inactiveSeasons =
    profiles.seasonId > 0 && profiles.seasonId < currentSeason
      ? currentSeason - profiles.seasonId
      : 0;

  // Make the current ranked rank authoritative: use R6Data's own rank name +
  // image from the latest seasonalStats point. This stays correct across rank
  // system changes (e.g. Ranked 3.0 / v7) without hardcoding the rank table.
  const latest = historyArray(seasonal)[0];
  const latestMeta = latest?.[1]?.metadata;
  if (ranked && latestMeta?.rank) {
    ranked.current = {
      ...ranked.current,
      name: latestMeta.rank,
      mmr: latest[1]?.value ?? ranked.current.mmr,
      icon: latestMeta.imageUrl || ranked.current.icon,
    };
  }

  return {
    id: info.platformUserId ?? username,
    username: info.platformUserHandle ?? username,
    platform,
    avatar: info.avatarUrl || pickAvatar({ profileId: info.platformUserId }, username),
    level,
    xp,
    ranked,
    casual,
    currentSeasonName: profiles.seasonId > 0 ? `Season ${profiles.seasonId}` : '',
    currentRegion: '',
    banned: pickBanned(banRes),
    banAlerts: pickBanAlerts(banRes),
    inactiveSeasons,
    history: parseSeasonHistory(full),
    rankHistory: parseRankHistory(seasonal),
    recentMatches: parseRecentMatches(seasonal),
    general: aggregateGeneral(operators),
    topOperators: mapOperators(operators),
    matches: [],
  };
}
