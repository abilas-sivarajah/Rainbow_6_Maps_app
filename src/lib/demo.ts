import type { PlayerData, Platform, PlayerMatchStat } from './types';

// Self-contained mock data so the app can be demoed without Ubisoft credentials
// or outbound network access. Enabled via R6_DEMO=1. Icons are inline SVG data
// URIs so the UI renders fully offline.

function rankIcon(color: string, letter: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#0b0e14"/></linearGradient></defs>` +
    `<path d="M32 4 L58 14 V34 C58 48 46 57 32 62 C18 57 6 48 6 34 V14 Z" fill="url(#g)" stroke="${color}" stroke-width="2"/>` +
    `<text x="32" y="40" font-family="Arial" font-size="26" font-weight="bold" fill="#fff" text-anchor="middle">${letter}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function opIcon(color: string, letter: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">` +
    `<rect width="48" height="48" rx="8" fill="${color}"/>` +
    `<text x="24" y="32" font-family="Arial" font-size="22" font-weight="bold" fill="#0b0e14" text-anchor="middle">${letter}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const PLATINUM = '#28aab4';
const EMERALD = '#2fb56a';
const DIAMOND = '#5bc8ff';
const GOLD = '#e8b13a';
const SILVER = '#b9c2cf';

export function getDemoPlayer(
  platform: Platform,
  username: string,
): PlayerData {
  const name = username && username.toLowerCase() !== 'demo' ? username : 'DemoPlayer.GG';

  const mkPlayer = (
    uName: string,
    rankName: string,
    rColor: string,
    rLetter: string,
    mmr: number,
    kills: number,
    deaths: number,
    assists: number,
    hs: string,
    isMe = false,
  ): PlayerMatchStat => ({
    username: uName,
    rank: rankName,
    rankImage: rankIcon(rColor, rLetter),
    mmr,
    kills,
    deaths,
    assists,
    hsPercent: hs,
    isMe,
  });

  const mkMatch = (
    date: string,
    result: 'win' | 'loss',
    rpChange: number,
    rp: number,
    rankName: string,
    rankColor: string,
    letter: string,
    mapName: string,
    scoreBlue: number,
    scoreOrange: number,
    myKDA: [number, number, number],
  ) => {
    const teamBlue = [
      mkPlayer(name, rankName, rankColor, letter, rp, myKDA[0], myKDA[1], myKDA[2], '44.8%', true),
      mkPlayer('SledgeHammer', 'Platinum 2', PLATINUM, 'P', 3210, 8, 5, 3, '25.0%'),
      mkPlayer('ValkEye99', 'Gold 1', GOLD, 'G', 3150, 6, 6, 4, '33.3%'),
      mkPlayer('SpawnPeeker', 'Emerald 5', EMERALD, 'E', 3820, 9, 6, 1, '55.5%'),
      mkPlayer('HardBreacher', 'Emerald 4', EMERALD, 'E', 3910, 4, 8, 5, '0.0%'),
    ];

    const teamOrange = [
      mkPlayer('AshMainGG', 'Diamond 5', DIAMOND, 'D', 4220, 11, 7, 2, '54.5%'),
      mkPlayer('NoobSlayer', 'Emerald 3', EMERALD, 'E', 3990, 7, 7, 3, '42.8%'),
      mkPlayer('DocStim', 'Emerald 2', EMERALD, 'E', 4050, 5, 7, 1, '20.0%'),
      mkPlayer('CaveiraSilent', 'Platinum 1', PLATINUM, 'P', 3710, 6, 8, 4, '16.6%'),
      mkPlayer('DroneHunter', 'Gold 3', GOLD, 'G', 2980, 2, 7, 1, '50.0%'),
    ];

    return {
      date,
      result,
      rpChange,
      rp,
      rank: rankName,
      rankImage: rankIcon(rankColor, letter),
      details: {
        mapName,
        mapImage: '',
        scoreBlue,
        scoreOrange,
        teamBlue,
        teamOrange,
      },
    };
  };

  return {
    id: 'demo-0000-0000-0000-000000000000',
    username: name,
    platform,
    avatar:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="76" height="76"><rect width="76" height="76" rx="12" fill="#4d8bf0"/><text x="38" y="50" font-family="Arial" font-size="34" font-weight="bold" fill="#fff" text-anchor="middle">${name[0]?.toUpperCase() ?? 'R'}</text></svg>`,
      ),
    level: 217,
    xp: 845_320,
    currentSeasonName: 'Demo Season (Y9S3)',
    currentRegion: 'Europe, Middle East and Africa',
    ranked: {
      current: { id: 18, name: 'Emerald 3', mmr: 3987, icon: rankIcon(EMERALD, 'E') },
      max: { id: 20, name: 'Diamond 5', mmr: 4210, icon: rankIcon(DIAMOND, 'D') },
      mmr: 3987,
      wins: 142,
      losses: 118,
      abandons: 3,
      matches: 260,
      winRate: '54.6%',
      kills: 1873,
      deaths: 1654,
      kd: 1.13,
      lastMatch: { result: 'win', mmrChange: 28 },
    },
    casual: {
      current: { id: 14, name: 'Platinum 2', mmr: 3120, icon: rankIcon(PLATINUM, 'P') },
      max: { id: 15, name: 'Platinum 1', mmr: 3240, icon: rankIcon(PLATINUM, 'P') },
      mmr: 3120,
      wins: 310,
      losses: 268,
      abandons: 12,
      matches: 578,
      winRate: '53.6%',
      kills: 4120,
      deaths: 3880,
      kd: 1.06,
      lastMatch: { result: 'loss', mmrChange: -19 },
    },
    general: {
      kills: 12450,
      deaths: 10980,
      kd: 1.13,
      wins: 980,
      losses: 870,
      winRate: '53.0%',
      matches: 1850,
      headshots: 5230,
      headshotPercent: '42.0%',
      playtimeHours: 412.5,
    },
    topOperators: [
      { name: 'Ash', icon: opIcon('#e74c3c', 'A'), kills: 2310, deaths: 1890, kd: 1.22, winRate: '55.1%', matches: 420, playtime: 96.4 },
      { name: 'Jäger', icon: opIcon('#27ae60', 'J'), kills: 1980, deaths: 1720, kd: 1.15, winRate: '54.0%', matches: 388, playtime: 84.2 },
      { name: 'Thatcher', icon: opIcon('#2980b9', 'T'), kills: 1450, deaths: 1390, kd: 1.04, winRate: '52.3%', matches: 295, playtime: 61.0 },
      { name: 'Bandit', icon: opIcon('#f1c40f', 'B'), kills: 1320, deaths: 1180, kd: 1.12, winRate: '53.8%', matches: 270, playtime: 55.7 },
      { name: 'Smoke', icon: opIcon('#8e44ad', 'S'), kills: 1190, deaths: 1100, kd: 1.08, winRate: '51.9%', matches: 240, playtime: 48.3 },
      { name: 'Sledge', icon: opIcon('#e67e22', 'Sl'), kills: 980, deaths: 970, kd: 1.01, winRate: '50.4%', matches: 205, playtime: 39.1 },
    ],
    history: [
      mkSeason(33, 'Demo Y8S1', SILVER, SILVER, 'S', 'Silver 1', 2380, 64, 58, 1.02),
      mkSeason(34, 'Demo Y8S2', GOLD, GOLD, 'G', 'Gold 2', 2980, 88, 71, 1.07),
      mkSeason(35, 'Demo Y8S3', GOLD, GOLD, 'G', 'Gold 1', 3180, 102, 80, 1.09),
      mkSeason(36, 'Demo Y8S4', PLATINUM, PLATINUM, 'P', 'Platinum 3', 3520, 120, 95, 1.11),
      mkSeason(37, 'Demo Y9S1', PLATINUM, PLATINUM, 'P', 'Platinum 1', 3780, 134, 102, 1.14),
      mkSeason(38, 'Demo Y9S2', EMERALD, EMERALD, 'E', 'Emerald 4', 3910, 138, 110, 1.12),
      mkSeason(39, 'Demo Y9S3', EMERALD, DIAMOND, 'E', 'Emerald 3', 3987, 142, 118, 1.13),
    ],
    rankHistory: [
      { date: '2026-06-18T18:00:00Z', rp: 3760, rank: 'Emerald 5', rankImage: rankIcon(EMERALD, 'E') },
      { date: '2026-06-20T19:30:00Z', rp: 3735, rank: 'Emerald 5', rankImage: rankIcon(EMERALD, 'E') },
      { date: '2026-06-22T20:00:00Z', rp: 3768, rank: 'Emerald 5', rankImage: rankIcon(EMERALD, 'E') },
      { date: '2026-06-24T21:15:00Z', rp: 3801, rank: 'Emerald 5', rankImage: rankIcon(EMERALD, 'E') },
      { date: '2026-06-26T18:40:00Z', rp: 3779, rank: 'Emerald 5', rankImage: rankIcon(EMERALD, 'E') },
      { date: '2026-06-28T22:05:00Z', rp: 3812, rank: 'Emerald 5', rankImage: rankIcon(EMERALD, 'E') },
      { date: '2026-06-30T20:20:00Z', rp: 3845, rank: 'Emerald 5', rankImage: rankIcon(EMERALD, 'E') },
      { date: '2026-07-02T19:00:00Z', rp: 3818, rank: 'Emerald 5', rankImage: rankIcon(EMERALD, 'E') },
      { date: '2026-07-04T21:45:00Z', rp: 3852, rank: 'Emerald 5', rankImage: rankIcon(EMERALD, 'E') },
      { date: '2026-07-06T20:30:00Z', rp: 3884, rank: 'Emerald 5', rankImage: rankIcon(EMERALD, 'E') },
      { date: '2026-07-08T18:55:00Z', rp: 3861, rank: 'Emerald 5', rankImage: rankIcon(EMERALD, 'E') },
      { date: '2026-07-10T22:10:00Z', rp: 3897, rank: 'Emerald 5', rankImage: rankIcon(EMERALD, 'E') },
      { date: '2026-07-12T21:10:00Z', rp: 3922, rank: 'Emerald 4', rankImage: rankIcon(EMERALD, 'E') },
      { date: '2026-07-12T22:45:00Z', rp: 3953, rank: 'Emerald 4', rankImage: rankIcon(EMERALD, 'E') },
      { date: '2026-07-13T08:30:00Z', rp: 3978, rank: 'Emerald 3', rankImage: rankIcon(EMERALD, 'E') },
      { date: '2026-07-13T10:15:00Z', rp: 3959, rank: 'Emerald 3', rankImage: rankIcon(EMERALD, 'E') },
      { date: '2026-07-13T12:00:00Z', rp: 3987, rank: 'Emerald 3', rankImage: rankIcon(EMERALD, 'E') },
    ],
    recentMatches: [
      mkMatch('2026-07-13T12:00:00Z', 'win', 28, 3987, 'Emerald 3', EMERALD, 'E', 'Clubhouse', 7, 5, [12, 6, 3]),
      mkMatch('2026-07-13T10:15:00Z', 'loss', -19, 3959, 'Emerald 3', EMERALD, 'E', 'Oregon', 4, 7, [5, 8, 2]),
      mkMatch('2026-07-13T08:30:00Z', 'win', 25, 3978, 'Emerald 3', EMERALD, 'E', 'Chalet', 7, 2, [9, 3, 4]),
      mkMatch('2026-07-12T22:45:00Z', 'win', 31, 3953, 'Emerald 4', EMERALD, 'E', 'Kafe Dostoyevsky', 8, 7, [14, 8, 1]),
      mkMatch('2026-07-12T21:10:00Z', 'loss', -24, 3922, 'Emerald 4', EMERALD, 'E', 'Bank', 5, 7, [7, 9, 3]),
    ],
    matches: [],
  };
}

function mkSeason(
  seasonId: number,
  seasonName: string,
  color: string,
  rankColor: string,
  letter: string,
  rankName: string,
  mmr: number,
  wins: number,
  losses: number,
  kd: number,
  maxColorOverride?: string,
): PlayerData['history'][number] {
  const matches = wins + losses;
  return {
    seasonId,
    seasonName,
    seasonColor: color.startsWith('#') ? color : undefined,
    region: 'EMEA',
    rank: { id: 1, name: rankName, mmr, icon: rankIcon(rankColor, letter) },
    maxRank: { id: 1, name: rankName, mmr: mmr + 120, icon: rankIcon(maxColorOverride ?? rankColor, letter) },
    mmr,
    wins,
    losses,
    abandons: 0,
    matches,
    winRate: `${((wins / matches) * 100).toFixed(1)}%`,
    kd,
  };
}
