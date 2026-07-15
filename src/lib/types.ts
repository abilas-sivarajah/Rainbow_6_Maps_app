// Shared, serialisable shapes returned by /api/player and consumed by the UI.
// Kept free of any r6api.js types so they can be imported by client components.

export type Platform = 'uplay' | 'psn' | 'xbl';

export interface RankInfo {
  id: number;
  name: string;
  mmr: number;
  icon: string;
}

export interface BoardStats {
  current: RankInfo;
  max: RankInfo;
  mmr: number;
  wins: number;
  losses: number;
  abandons: number;
  matches: number;
  winRate: string;
  kills: number;
  deaths: number;
  kd: number;
  lastMatch: {
    result: string;
    mmrChange: number;
  };
}

export interface SeasonRank {
  seasonId: number;
  seasonName: string;
  seasonColor?: string;
  region: string;
  rank: RankInfo;
  maxRank: RankInfo;
  mmr: number;
  wins: number;
  losses: number;
  abandons: number;
  matches: number;
  winRate: string;
  kd: number;
}

export interface OperatorBrief {
  name: string;
  icon: string;
  kills: number;
  deaths: number;
  kd: number;
  winRate: string;
  matches: number;
  playtime: number;
}

export interface GeneralStats {
  kills: number;
  deaths: number;
  kd: number;
  wins: number;
  losses: number;
  winRate: string;
  matches: number;
  headshots: number;
  headshotPercent: string;
  playtimeHours: number;
}

export interface RankHistoryPoint {
  date: string; // ISO timestamp
  rank: string;
  rankImage: string;
  color?: string;
  rp: number;
}

export interface PlayerMatchStat {
  username: string;
  rank: string;
  rankImage: string;
  mmr: number;
  kills: number;
  deaths: number;
  assists: number;
  hsPercent: string;
  isMe?: boolean;
}

export interface MatchDetails {
  mapName: string;
  mapImage: string;
  scoreBlue: number;
  scoreOrange: number;
  teamBlue: PlayerMatchStat[];
  teamOrange: PlayerMatchStat[];
}

export interface RecentMatch {
  date: string; // ISO timestamp
  result: 'win' | 'loss' | 'neutral';
  rpChange: number;
  rp: number;
  rank: string;
  rankImage: string;
  details?: MatchDetails;
}

export interface PlayerData {
  id: string;
  username: string;
  platform: Platform;
  avatar: string;
  level: number;
  xp: number;
  ranked: BoardStats | null;
  casual: BoardStats | null;
  currentSeasonName: string;
  currentRegion: string;
  banned?: boolean;
  banAlerts?: Array<{ reason: string; date: string; reversed: boolean }>;
  inactiveSeasons?: number; // how many seasons behind the current one (0 = active)
  history: SeasonRank[];
  rankHistory?: RankHistoryPoint[];
  recentMatches?: RecentMatch[];
  general: GeneralStats | null;
  topOperators: OperatorBrief[];
  // Match-by-match history is not exposed by Ubisoft's unofficial API.
  // Reserved so the UI/struct is ready when a match source is wired up later.
  matches: unknown[];
}

export interface ApiError {
  error: string;
}
