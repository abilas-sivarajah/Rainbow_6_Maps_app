'use client';

import { useState, type CSSProperties } from 'react';
import RpChart from '@/components/RpChart';
import { togglePlayerSaved, useIsPlayerSaved } from '@/lib/playerFavorites';
import { rankBadge } from '@/lib/rankBadge';
import type { BoardStats, PlayerData, RecentMatch, OperatorBrief, SeasonRank, PlayerMatchStat } from '@/lib/types';

/**
 * Rang-Icon mit Fallback: R6Data hostet zwar echte Tier-Bilder, die im Browser
 * aber oft nicht laden (Hotlink-Schutz/404). Schlägt das Laden fehl, springt
 * onError auf die selbst-generierte, hostunabhängige SVG-Badge zurück, damit
 * nie ein kaputtes Bild-Icon erscheint.
 */
function RankIcon({
  name,
  src,
  className,
  style,
}: {
  name: string;
  src?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const fallback = rankBadge(name);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      style={style}
      src={src || fallback}
      alt={name}
      onError={(e) => {
        const img = e.currentTarget;
        if (img.src !== fallback) img.src = fallback;
      }}
    />
  );
}

function getKdClass(kd: number): string {
  if (kd >= 1.2) return 'kd-high';
  if (kd >= 1.0) return 'kd-good';
  if (kd >= 0.8) return 'kd-warning';
  return 'kd-low';
}

/** Stern im Profilkopf: Spieler in die Merkliste des Trackers aufnehmen. */
function SavePlayerButton({ username, platform }: { username: string; platform: PlayerData['platform'] }) {
  const saved = useIsPlayerSaved({ username, platform });
  return (
    <button
      className="badge"
      onClick={() => togglePlayerSaved({ username, platform })}
      title={saved ? 'Aus der Merkliste entfernen' : 'Spieler merken — erscheint dann unter dem Suchfeld'}
      style={{
        cursor: 'pointer',
        color: saved ? 'var(--accent-2)' : undefined,
        borderColor: saved ? 'var(--accent-2)' : undefined,
        background: 'none',
        font: 'inherit',
      }}
    >
      {saved ? '★ Gespeichert' : '☆ Merken'}
    </button>
  );
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
        <RankIcon className="rank-icon" name={board.current.name} src={board.current.icon} />
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
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      title={onClick ? 'Klicke für Match-Scorecard' : undefined}
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
        <RankIcon name={match.rank} src={match.rankImage} />
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
          <div title="Gesamtdauer aller Matches, in denen dieser Operator gespielt wurde (R6Data-Zählweise)">Matchzeit: <span className="op-stat-val">{op.playtime}h</span></div>
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
          <RankIcon name={history.rank.name} src={history.rank.icon} />
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
                  <RankIcon
                    name={p.rank}
                    src={p.rankImage}
                    style={{ width: '22px', height: '22px', verticalAlign: 'middle' }}
                  />
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

function MatchDetailsModal({ match, onClose }: { match: RecentMatch; onClose: () => void }) {
  if (!match.details) return null;
  const d = match.details;
  const isWin = match.result === 'win';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
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

export default function PlayerProfile({
  data,
  onRefresh,
  autoUpdating = false,
}: {
  data: PlayerData;
  onRefresh?: () => void;
  autoUpdating?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'operators' | 'matches' | 'history'>('overview');
  const [opSortBy, setOpSortBy] = useState<'kills' | 'playtime' | 'kd' | 'winrate'>('kills');
  const [selectedMatch, setSelectedMatch] = useState<RecentMatch | null>(null);
  const [expandedSeasons, setExpandedSeasons] = useState<Record<number, boolean>>({});

  const toggleSeason = (seasonId: number) => {
    setExpandedSeasons((prev) => ({
      ...prev,
      [seasonId]: !prev[seasonId],
    }));
  };

  // Nur Matches mit echten Details (Demo-Modus) sind klickbar — R6Data liefert
  // keine Match-Rosters, und erfundene "simulierte Lobbys" zeigen wir nicht an.
  const handleMatchClick = (m: RecentMatch) =>
    m.details ? () => setSelectedMatch(m) : undefined;

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

  // Zeitpunkt des neuesten Datenpunkts (RP-Verlauf bzw. Matches). R6Data
  // aktualisiert Profile nur verzögert — der Stand macht das transparent,
  // statt wie fehlende Matches auszusehen.
  const newestIso =
    data.rankHistory?.[data.rankHistory.length - 1]?.date ??
    data.recentMatches?.[0]?.date;
  const dataAsOf = (() => {
    if (!newestIso) return null;
    const d = new Date(newestIso);
    return Number.isNaN(d.getTime())
      ? null
      : d.toLocaleString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
  })();

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
            <SavePlayerButton username={data.username} platform={data.platform} />
            {data.currentRegion ? (
              <span className="badge">{data.currentRegion}</span>
            ) : null}
            {data.banned ? (
              <span
                className="badge badge-ban"
                title={
                  data.banAlerts?.length
                    ? data.banAlerts
                        .map((b) => {
                          const d = new Date(b.date);
                          const when = Number.isNaN(d.getTime())
                            ? b.date
                            : d.toLocaleDateString('de-DE');
                          return `${b.reason || 'Unbekannter Grund'} (${when}${b.reversed ? ', aufgehoben' : ''})`;
                        })
                        .join(' · ')
                    : undefined
                }
              >
                GESPERRT
                {data.banAlerts?.[0]?.reason ? ` · ${data.banAlerts[0].reason}` : ''}
              </span>
            ) : null}
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
          {dataAsOf ? (
            <div
              style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}
              title="Die Daten stammen von R6Data und werden dort erst beim Aufruf des Profils auf r6data.com aufgefrischt — die neuesten Matches können daher etwas später erscheinen."
            >
              Datenstand: {dataAsOf} Uhr
              {autoUpdating ? (
                <span
                  title="R6Data holt gerade die neuesten Daten von Ubisoft — die Seite prüft automatisch nach und aktualisiert sich von selbst (bis zu ~70 s)."
                  style={{ color: 'var(--accent-2)' }}
                >
                  {' '}
                  · ⏳ aktualisiere…
                </span>
              ) : null}
              {onRefresh ? (
                <>
                  {' · '}
                  <button
                    onClick={onRefresh}
                    title="Profil neu von R6Data abrufen — die erste Abfrage stößt dort oft erst die Aktualisierung an, ein erneutes Laden holt dann die frischen Matches."
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-2)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      font: 'inherit',
                      padding: 0,
                    }}
                  >
                    🔄 Neu laden
                  </button>
                </>
              ) : null}
              {' · '}
              <a
                href={`https://r6data.com/stats?username=${encodeURIComponent(data.username)}&platform=${encodeURIComponent(data.platform)}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--accent-2)', textDecoration: 'underline' }}
                title="Öffnet dein Profil auf r6data.com — das stößt dort die Aktualisierung an. Danach hier 'Neu laden' klicken."
              >
                r6data.com aktualisieren ↗
              </a>
            </div>
          ) : null}
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

          {/* General Stats (Summe der Ranked-Operator-Stats von R6Data).
              Bewusst KEINE Spielzeit-Kachel: R6Data schreibt jedem Operator die
              komplette Matchdauer gut — eine Summe über alle Operator zählt
              jedes Match mehrfach und ist massiv zu hoch. */}
          {data.general ? (
            <div className="section">
              <p className="section-title">Ranked-Karriere-Stats</p>
              <div className="grid cols-3">
                <Tile value={<span className={getKdClass(data.general.kd)}>{data.general.kd}</span>} label="K/D-Verhältnis" />
                <Tile value={data.general.winRate} label="Runden-Winrate" />
                <Tile value={data.general.matches.toLocaleString()} label="Runden gespielt" />
                <Tile value={data.general.kills.toLocaleString()} label="Kills" />
                <Tile value={data.general.headshotPercent} label="Headshots %" />
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
                    <MatchRow key={`${m.date}-${i}`} match={m} onClick={handleMatchClick(m)} />
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
                <option value="playtime">Matchzeit</option>
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
                <MatchRow key={`${m.date}-${i}`} match={m} onClick={handleMatchClick(m)} />
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
        <MatchDetailsModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      ) : null}
    </div>
  );
}
