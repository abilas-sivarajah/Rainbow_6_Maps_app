'use client';

import { useState } from 'react';
import RpChart from '@/components/RpChart';
import type { BoardStats, PlayerData, RecentMatch, OperatorBrief, SeasonRank, PlayerMatchStat, MatchDetails } from '@/lib/types';

function getKdClass(kd: number): string {
  if (kd >= 1.2) return 'kd-high';
  if (kd >= 1.0) return 'kd-good';
  if (kd >= 0.8) return 'kd-warning';
  return 'kd-low';
}

function generateSimulatedDetails(match: RecentMatch, myUsername: string): MatchDetails {
  const maps = ['Clubhouse', 'Oregon', 'Chalet', 'Kafe Dostoyevsky', 'Bank', 'Border', 'Villa', 'Theme Park', 'Consulate', 'Nighthaven Labs'];
  
  // Simple hash of the date and RP to get stable random-like values
  const seedString = match.date + match.rp + match.rpChange;
  const hash = seedString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const mapName = maps[hash % maps.length];
  
  const isWin = match.result === 'win';
  const scoreBlue = isWin ? 7 : (hash % 3 === 0 ? 6 : hash % 3 === 1 ? 5 : 4);
  const scoreOrange = isWin ? (hash % 3 === 0 ? 5 : hash % 3 === 1 ? 4 : 3) : 7;
  
  // Estimate my kills/deaths based on my K/D and result
  const myKills = Math.max(0, Math.round((isWin ? 8 : 4) + (hash % 5)));
  const myDeaths = Math.max(1, Math.round((isWin ? 5 : 8) + (hash % 3)));
  const myAssists = Math.round(hash % 4);
  
  const rankColors = ['#b4764a', '#cd7f32', '#9aa7b5', '#e8b13a', '#28aab4', '#2fb56a', '#5bc8ff', '#d14fd1'];
  const rankNames = ['Bronze 2', 'Silver 1', 'Gold 3', 'Gold 1', 'Platinum 2', 'Emerald 4', 'Emerald 2', 'Diamond 5'];
  
  const getMockRankIcon = (index: number): string => {
    const color = rankColors[index % rankColors.length];
    const letter = rankNames[index % rankNames.length][0];
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#0b0e14"/></linearGradient></defs>` +
      `<path d="M32 4 L58 14 V34 C58 48 46 57 32 62 C18 57 6 48 6 34 V14 Z" fill="url(#g)" stroke="${color}" stroke-width="2"/>` +
      `<text x="32" y="40" font-family="Arial" font-size="26" font-weight="bold" fill="#fff" text-anchor="middle">${letter}</text>` +
      `</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  const mkPlayer = (
    uName: string,
    rank: string,
    mmr: number,
    kills: number,
    deaths: number,
    assists: number,
    hs: string,
    rankIdx: number,
    isMe = false,
  ): PlayerMatchStat => ({
    username: uName,
    rank,
    rankImage: getMockRankIcon(rankIdx),
    mmr,
    kills,
    deaths,
    assists,
    hsPercent: hs,
    isMe,
  });

  const myRankIdx = hash % rankNames.length;

  const teamBlue: PlayerMatchStat[] = [
    {
      username: myUsername,
      rank: match.rank,
      rankImage: match.rankImage,
      mmr: match.rp,
      kills: myKills,
      deaths: myDeaths,
      assists: myAssists,
      hsPercent: `${Math.round(25 + (hash % 25))}%`,
      isMe: true,
    },
    mkPlayer('SledgeMain', rankNames[(myRankIdx + 1) % rankNames.length], match.rp - 40, Math.max(0, Math.round(4 + (hash % 5))), Math.max(1, Math.round(5 + (hash % 3))), 2, '20%', myRankIdx + 1),
    mkPlayer('ValkyrieEye', rankNames[(myRankIdx - 1 + rankNames.length) % rankNames.length], match.rp + 20, Math.max(0, Math.round(5 + (hash % 4))), Math.max(1, Math.round(6 + (hash % 2))), 3, '40%', myRankIdx - 1),
    mkPlayer('HardBreach', rankNames[(myRankIdx + 2) % rankNames.length], match.rp - 120, Math.max(0, Math.round(3 + (hash % 3))), Math.max(1, Math.round(6 + (hash % 2))), 4, '15%', myRankIdx + 2),
    mkPlayer('RoamingRooster', rankNames[(myRankIdx - 2 + rankNames.length) % rankNames.length], match.rp - 80, Math.max(0, Math.round(6 + (hash % 4))), Math.max(1, Math.round(5 + (hash % 4))), 1, '50%', myRankIdx - 2),
  ];

  const teamOrange: PlayerMatchStat[] = [
    mkPlayer('AshRusher', rankNames[(myRankIdx + 3) % rankNames.length], match.rp + 250, Math.max(0, Math.round(9 + (hash % 4))), Math.max(1, Math.round(5 + (hash % 3))), 1, '45%', myRankIdx + 3),
    mkPlayer('SpawnPeekerPro', rankNames[(myRankIdx + 1) % rankNames.length], match.rp + 50, Math.max(0, Math.round(7 + (hash % 3))), Math.max(1, Math.round(6 + (hash % 3))), 2, '33%', myRankIdx + 1),
    mkPlayer('DefensiveTurtle', rankNames[(myRankIdx + 2) % rankNames.length], match.rp + 120, Math.max(0, Math.round(5 + (hash % 3))), Math.max(1, Math.round(7 + (hash % 2))), 3, '25%', myRankIdx + 2),
    mkPlayer('SilentStep', rankNames[(myRankIdx - 1 + rankNames.length) % rankNames.length], match.rp - 30, Math.max(0, Math.round(6 + (hash % 2))), Math.max(1, Math.round(8 + (hash % 2))), 1, '16%', myRankIdx - 1),
    mkPlayer('CastleDoor', rankNames[(myRankIdx - 3 + rankNames.length) % rankNames.length], match.rp - 200, Math.max(0, Math.round(2 + (hash % 4))), Math.max(1, Math.round(7 + (hash % 1))), 0, '10%', myRankIdx - 3),
  ];

  return {
    mapName,
    mapImage: '',
    scoreBlue,
    scoreOrange,
    teamBlue,
    teamOrange,
  };
}

function RankCard({ title, board }: { title: string; board: BoardStats | null }) {
  if (!board) {
    return (
      <div className="card">
        <p className="section-title">{title}</p>
        <p className="message info" style={{ margin: 0, textAlign: 'left' }}>
          Keine Daten in dieser Saison.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <p className="section-title">{title}</p>
      <div className="rank-card">
        {board.current.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="rank-icon" src={board.current.icon} alt={board.current.name} />
        ) : null}
        <div>
          <div className="rank-name">{board.current.name}</div>
          <div className="mmr">{board.mmr} MMR</div>
          <div className="sub">
            Höchstwert: {board.max.name} ({board.max.mmr})
          </div>
        </div>
      </div>
      <div className="stat-row">
        <span>
          <span className="k">W/L</span>
          <span className="v">
            <span className="win">{board.wins}</span> - <span className="loss">{board.losses}</span>
          </span>
        </span>
        <span>
          <span className="k">Winrate</span>
          <span className="v">{board.winRate}</span>
        </span>
        <span>
          <span className="k">K/D</span>
          <span className={`v ${getKdClass(board.kd)}`}>{board.kd}</span>
        </span>
        <span>
          <span className="k">Spiele</span>
          <span className="v">{board.matches}</span>
        </span>
        {board.abandons > 0 ? (
          <span>
            <span className="k">Abandons</span>
            <span className="v loss">{board.abandons}</span>
          </span>
        ) : null}
      </div>
    </div>
  );
}

function Tile({ value, label }: { value: string | number | React.ReactNode; label: string }) {
  return (
    <div className="card tile">
      <div className="value">{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}

function MatchRow({ match, onClick }: { match: RecentMatch; onClick?: () => void }) {
  const isWin = match.result === 'win';
  const rpSign = match.rpChange >= 0 ? '+' : '';
  const dateFmt = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? iso
      : d.toLocaleString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
  };

  return (
    <div
      className={`match-row ${isWin ? 'win-border' : 'loss-border'}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      title="Klicke für Match-Scorecard"
    >
      <div className="match-left">
        <span className={`result-badge ${isWin ? 'win-badge' : 'loss-badge'}`}>
          {isWin ? 'Sieg' : 'Niederlage'}
        </span>
        <span className="match-date">
          {dateFmt(match.date)}
          {match.details ? ` · ${match.details.mapName}` : ''}
        </span>
      </div>
      <div className={`match-change ${isWin ? 'win' : 'loss'}`}>
        {rpSign}{match.rpChange} RP
      </div>
      <div className="match-rp-total">
        {match.rp} RP
      </div>
      <div className="match-rank">
        {match.rankImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={match.rankImage} alt={match.rank} />
        ) : null}
        <span>{match.rank}</span>
      </div>
    </div>
  );
}

function OperatorCard({ op }: { op: OperatorBrief }) {
  const kdClass = getKdClass(op.kd);
  return (
    <div className="op-card">
      {op.icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="op-icon" src={op.icon} alt={op.name} />
      ) : null}
      <div className="op-info">
        <div className="op-name">{op.name}</div>
        <div className="op-stats">
          <div>Spiele: <span className="op-stat-val">{op.matches}</span></div>
          <div>Zeit: <span className="op-stat-val">{op.playtime}h</span></div>
          <div>K/D: <span className={`op-stat-val ${kdClass}`}>{op.kd}</span></div>
          <div>Winrate: <span className="op-stat-val">{op.winRate}</span></div>
        </div>
      </div>
    </div>
  );
}

function SeasonAccordionItem({
  history,
  isOpen,
  onToggle,
}: {
  history: SeasonRank;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`accordion-item ${isOpen ? 'open' : ''}`}>
      <div className="accordion-header" onClick={onToggle}>
        <div className="match-left">
          <span
            className="badge"
            style={{
              borderColor: history.seasonColor || 'var(--border)',
              color: history.seasonColor || 'var(--text)',
            }}
          >
            {history.seasonName || `Season ${history.seasonId}`}
          </span>
          <span className="match-date">{history.region || 'Global'}</span>
        </div>
        <div className="match-change">{history.mmr} RP</div>
        <div className="match-rank">
          {history.rank.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={history.rank.icon} alt={history.rank.name} />
          ) : null}
          <span>{history.rank.name}</span>
        </div>
        <div className="accordion-trigger">▼</div>
      </div>
      {isOpen ? (
        <div className="accordion-panel">
          <div className="season-grid">
            <div className="card tile">
              <div className="value win">{history.wins}</div>
              <div className="label">Siege</div>
            </div>
            <div className="card tile">
              <div className="value loss">{history.losses}</div>
              <div className="label">Niederlagen</div>
            </div>
            <div className="card tile">
              <div className="value">{history.winRate}</div>
              <div className="label">Winrate</div>
            </div>
            <div className="card tile">
              <div className={`value ${getKdClass(history.kd)}`}>{history.kd}</div>
              <div className="label">K/D-Rate</div>
            </div>
            <div className="card tile">
              <div className="value">{history.matches}</div>
              <div className="label">Spiele</div>
            </div>
            <div className="card tile">
              <div className="value">{history.maxRank.name}</div>
              <div className="label">Max. Rang · {history.maxRank.mmr} RP</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const TeamScorecard = ({ teamName, titleClass, players }: { teamName: string; titleClass: string; players: PlayerMatchStat[] }) => (
  <div>
    <div className={`team-title ${titleClass}`}>
      <span>{teamName}</span>
      <span>
        {players.reduce((sum, p) => sum + p.kills, 0)} Kills gesamt
      </span>
    </div>
    <div className="table-scroll">
      <table className="team-table">
        <thead>
          <tr>
            <th>Spieler</th>
            <th style={{ textAlign: 'center' }}>Rank</th>
            <th style={{ textAlign: 'center' }}>MMR</th>
            <th style={{ textAlign: 'center' }}>K / D / A</th>
            <th style={{ textAlign: 'center' }}>K/D</th>
            <th style={{ textAlign: 'center' }}>HS%</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, idx) => {
            const kd = p.deaths > 0 ? p.kills / p.deaths : p.kills;
            return (
              <tr key={`${p.username}-${idx}`} className={p.isMe ? 'me-row' : ''}>
                <td className="team-player-name">
                  {p.isMe ? <span className="team-player-me">DU</span> : null}
                  <span>{p.username}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {p.rankImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.rankImage} alt={p.rank} style={{ width: '22px', height: '22px', verticalAlign: 'middle' }} />
                  ) : (
                    p.rank
                  )}
                </td>
                <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  {p.mmr.toLocaleString()}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  {p.kills} / {p.deaths} / {p.assists}
                </td>
                <td style={{ textAlign: 'center' }} className={getKdClass(kd)}>
                  {kd.toFixed(2)}
                </td>
                <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  {p.hsPercent}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

function MatchDetailsModal({ match, onClose, isSimulated }: { match: RecentMatch; onClose: () => void; isSimulated: boolean }) {
  if (!match.details) return null;
  const d = match.details;
  const isWin = match.result === 'win';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          {isSimulated ? (
            <div style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '0.85rem',
              color: 'var(--accent-2)',
              maxWidth: '600px',
              margin: '0 auto 20px',
              textAlign: 'left',
              lineHeight: '1.4'
            }}>
              💡 <strong>Simulierte Lobby:</strong> Da für diesen Account kein stats.cc Desktop-Client läuft, wurden Map, Roster und K/D/A für dieses Match geschätzt.
            </div>
          ) : null}
          <p className="modal-map-name">{d.mapName}</p>
          <div className={`modal-score ${isWin ? 'win' : 'loss'}`}>
            <span>{d.scoreBlue}</span>
            <span className="score-divider">:</span>
            <span>{d.scoreOrange}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 0', fontSize: '0.9rem' }}>
            {new Date(match.date).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
        <div className="modal-body">
          <TeamScorecard teamName="Team Blau (Dein Team)" titleClass="team-blue-title" players={d.teamBlue} />
          <TeamScorecard teamName="Team Orange" titleClass="team-orange-title" players={d.teamOrange} />
        </div>
      </div>
    </div>
  );
}

export default function PlayerProfile({ data }: { data: PlayerData }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'operators' | 'matches' | 'history'>('overview');
  const [opSortBy, setOpSortBy] = useState<'kills' | 'playtime' | 'kd' | 'winrate'>('kills');
  const [selectedMatch, setSelectedMatch] = useState<RecentMatch | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [expandedSeasons, setExpandedSeasons] = useState<Record<number, boolean>>({});

  const toggleSeason = (seasonId: number) => {
    setExpandedSeasons((prev) => ({
      ...prev,
      [seasonId]: !prev[seasonId],
    }));
  };

  const handleMatchClick = (m: RecentMatch) => {
    if (m.details) {
      setIsSimulated(false);
      setSelectedMatch(m);
    } else {
      const simulatedDetails = generateSimulatedDetails(m, data.username);
      setIsSimulated(true);
      setSelectedMatch({
        ...m,
        details: simulatedDetails,
      });
    }
  };

  // Sort logic for operators
  const sortedOperators = [...data.topOperators].sort((a, b) => {
    if (opSortBy === 'kills') return b.kills - a.kills;
    if (opSortBy === 'playtime') return b.playtime - a.playtime;
    if (opSortBy === 'kd') return b.kd - a.kd;
    if (opSortBy === 'winrate') {
      const wa = parseFloat(a.winRate) || 0;
      const wb = parseFloat(b.winRate) || 0;
      return wb - wa;
    }
    return 0;
  });

  // XP Percent
  const xpPercent = data.xp > 0 ? Math.min(100, Math.max(5, (data.xp % 5000) / 50)) : 0;

  return (
    <div>
      {/* Profile Header */}
      <div className="card section profile">
        {data.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="avatar" src={data.avatar} alt={data.username} />
        ) : null}
        <div className="profile-details">
          <h2 className="name">
            {data.username}
            <span className="badge">{data.platform.toUpperCase()}</span>
            {data.currentRegion ? (
              <span className="badge">{data.currentRegion}</span>
            ) : null}
            {data.banned ? <span className="badge badge-ban">GESPERRT</span> : null}
          </h2>
          <div className="meta">
            <span>Level {data.level}</span>
            {data.currentSeasonName ? (
              <>
                <span>·</span>
                <span>{data.currentSeasonName}</span>
              </>
            ) : null}
            {data.inactiveSeasons && data.inactiveSeasons > 0 ? (
              <span className="badge badge-warn">
                ⚠️ inaktiv seit {data.inactiveSeasons} {data.inactiveSeasons === 1 ? 'Saison' : 'Saisons'}
              </span>
            ) : null}
          </div>
          {data.xp > 0 ? (
            <div className="xp-container">
              <div className="xp-label">
                <span>XP: {data.xp.toLocaleString()}</span>
                <span>{Math.round(xpPercent)}%</span>
              </div>
              <div className="xp-bar">
                <div className="xp-fill" style={{ width: `${xpPercent}%` }}></div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Übersicht
        </button>
        <button
          className={`tab-btn ${activeTab === 'operators' ? 'active' : ''}`}
          onClick={() => setActiveTab('operators')}
        >
          ⚔️ Operator
        </button>
        <button
          className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          📜 Matches
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          🏅 Saisons
        </button>
      </div>

      {/* Tab Content */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' ? (
        <div className="grid">
          {/* Current Ranks */}
          <div className="grid cols-2">
            <RankCard title="Ranked" board={data.ranked} />
            <RankCard title="Casual" board={data.casual} />
          </div>

          {/* RP graph over the current season */}
          {data.rankHistory && data.rankHistory.length > 1 ? (
            <div className="section">
              <p className="section-title">
                RP-Verlauf · {data.currentSeasonName || 'Aktuelle Season'}
              </p>
              <RpChart points={data.rankHistory} />
            </div>
          ) : null}

          {/* General Stats */}
          {data.general ? (
            <div className="section">
              <p className="section-title">Allgemeine Karriere-Stats</p>
              <div className="grid cols-3">
                <Tile value={<span className={getKdClass(data.general.kd)}>{data.general.kd}</span>} label="K/D-Verhältnis" />
                <Tile value={data.general.winRate} label="Runden-Winrate" />
                <Tile value={data.general.matches.toLocaleString()} label="Runden gespielt" />
                <Tile value={data.general.kills.toLocaleString()} label="Kills" />
                <Tile value={data.general.headshotPercent} label="Headshots %" />
                <Tile value={`${data.general.playtimeHours}h`} label="Spielzeit" />
              </div>
            </div>
          ) : null}

          {/* Previews: Operators & Matches */}
          <div className="grid cols-2 section">
            {/* Operators Preview (top 3) */}
            <div>
              <div className="section-title">
                <span>Top Operator</span>
                <button className="badge" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('operators')}>Alle anzeigen</button>
              </div>
              {data.topOperators.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data.topOperators.slice(0, 3).map((op) => (
                    <OperatorCard key={op.name} op={op} />
                  ))}
                </div>
              ) : (
                <div className="card">
                  <p className="message info" style={{ margin: 0, textAlign: 'left' }}>Keine Operator-Daten verfügbar.</p>
                </div>
              )}
            </div>

            {/* Matches Preview (top 5) */}
            <div>
              <div className="section-title">
                <span>Letzte Ranked Matches (Klick für Details)</span>
                <button className="badge" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('matches')}>Alle anzeigen</button>
              </div>
              {data.recentMatches && data.recentMatches.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data.recentMatches.slice(0, 5).map((m, i) => (
                    <MatchRow key={`${m.date}-${i}`} match={m} onClick={() => handleMatchClick(m)} />
                  ))}
                </div>
              ) : (
                <div className="card">
                  <p className="message info" style={{ margin: 0, textAlign: 'left' }}>Keine Partien in dieser Saison gefunden.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* OPERATORS TAB */}
      {activeTab === 'operators' ? (
        <div className="section">
          <div className="section-title">
            <span>Operator-Leistung</span>
            <div className="op-filters">
              <label htmlFor="op-sort" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sortieren nach:</label>
              <select
                id="op-sort"
                value={opSortBy}
                onChange={(e) => setOpSortBy(e.target.value as typeof opSortBy)}
              >
                <option value="kills">Kills</option>
                <option value="playtime">Spielzeit</option>
                <option value="kd">K/D</option>
                <option value="winrate">Winrate</option>
              </select>
            </div>
          </div>
          {sortedOperators.length > 0 ? (
            <div className="op-grid">
              {sortedOperators.map((op) => (
                <OperatorCard key={op.name} op={op} />
              ))}
            </div>
          ) : (
            <div className="card">
              <p className="message info">Keine Operator-Daten verfügbar.</p>
            </div>
          )}
        </div>
      ) : null}

      {/* MATCHES TAB */}
      {activeTab === 'matches' ? (
        <div className="section">
          <p className="section-title">Match-Verlauf (Klick für Details)</p>
          {data.recentMatches && data.recentMatches.length > 0 ? (
            <div className="matches-list">
              {data.recentMatches.map((m, i) => (
                <MatchRow key={`${m.date}-${i}`} match={m} onClick={() => handleMatchClick(m)} />
              ))}
            </div>
          ) : (
            <div className="card">
              <p className="message info">Keine Partien in dieser Saison gefunden.</p>
            </div>
          )}
        </div>
      ) : null}

      {/* HISTORY TAB */}
      {activeTab === 'history' ? (
        <div className="section">
          <p className="section-title">Saisonverlauf (Klick zum Ausklappen)</p>
          {data.history && data.history.length > 0 ? (
            <div className="matches-list">
              {data.history.map((h) => (
                <SeasonAccordionItem
                  key={h.seasonId}
                  history={h}
                  isOpen={!!expandedSeasons[h.seasonId]}
                  onToggle={() => toggleSeason(h.seasonId)}
                />
              ))}
            </div>
          ) : (
            <div className="card">
              <p className="message info">Kein historischer Verlauf gefunden.</p>
            </div>
          )}
        </div>
      ) : null}

      {/* Detail Modal Overlay */}
      {selectedMatch ? (
        <MatchDetailsModal match={selectedMatch} onClose={() => setSelectedMatch(null)} isSimulated={isSimulated} />
      ) : null}
    </div>
  );
}
