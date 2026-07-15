/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface PlayerStat {
  username: string;
  score: number;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  headshotPercentage: number;
  operator: string;
  spawn: string;
}

interface MatchFeedback {
  type: {
    name: string;
    id: number;
  };
  username?: string;
  target?: string;
  headshot?: boolean;
  time: string;
  timeInSeconds: number;
  message?: string;
}

interface RoundData {
  roundNumber: number;
  site: string;
  teamBlueRole: string;
  teamOrangeRole: string;
  wonBlue: boolean;
  wonOrange: boolean;
  winCondition?: string;
  teamBlue: PlayerStat[];
  teamOrange: PlayerStat[];
  matchFeedback: MatchFeedback[];
}

interface ReplayScorecardProps {
  data: {
    matchId: string;
    mapName: string;
    gameMode: string;
    gameVersion?: string;
    timestamp: string;
    scoreBlue: number;
    scoreOrange: number;
    rounds: RoundData[];
  };
}

function getOperatorSlug(name: string): string {
  if (!name) return "recruit";
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents (e.g. ø -> o, ä -> a)
    .replace(/[^a-z0-9]/g, ""); // remove spaces/special chars
}

export function ReplayScorecard({ data }: ReplayScorecardProps) {
  const { t, language } = useLanguage();
  const [selectedRoundIdx, setSelectedRoundIdx] = useState(0);

  const round = data.rounds[selectedRoundIdx];
  if (!round) return null;

  // Kartenname -> Bild-ID; Bilder liegen als /maps-img/<id>/thumbnail.avif.
  const mapSlug = data.mapName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const mapImage = `/maps-img/${mapSlug}/thumbnail.avif`;

  // Kill-Feed-Verb ("X eliminierte Y") passend zur aktiven Sprache.
  const killedVerb =
    language === "de" ? "eliminierte" : language === "fr" ? "a éliminé" : "eliminated";

  // Helper to format win condition
  const formatWinCondition = (cond?: string) => {
    if (!cond) return "";
    const de = language === "de";
    const fr = language === "fr";
    switch (cond) {
      case "KilledOpponents":
        return de ? "Gegner eliminiert" : fr ? "Adversaires éliminés" : "Opponents eliminated";
      case "DefusedBomb":
        return de ? "Entschärfer deaktiviert" : fr ? "Désamorceur désactivé" : "Defuser disabled";
      case "ExplodedBomb":
        return de ? "Bombe explodiert" : fr ? "Bombe explosée" : "Bomb detonated";
      case "TimeLimitReached":
        return de ? "Zeit abgelaufen" : fr ? "Temps écoulé" : "Time limit reached";
      default:
        return cond;
    }
  };

  const getEventIcon = (typeName: string) => {
    switch (typeName) {
      case "Kill":
        return "🎯";
      case "Death":
        return "💀";
      case "DefuserPlantStart":
        return "🛠️";
      case "DefuserPlantComplete":
        return "🚨";
      case "DefuserDisableStart":
        return "🔌";
      case "DefuserDisableComplete":
        return "✅";
      default:
        return "📢";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Overview Card */}
      <div 
        className="relative overflow-hidden rounded-2xl border border-border bg-cover bg-center p-6 md:p-8"
        style={{ backgroundImage: `linear-gradient(to right, rgba(10, 12, 16, 0.95) 40%, rgba(10, 12, 16, 0.4)), url(${mapImage})` }}
      >
        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-accent px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-bg">
                {data.gameMode}
              </span>
              {data.gameVersion && (
                <span className="text-xs text-muted">
                  Version: {data.gameVersion}
                </span>
              )}
            </div>
            <h2 className="mt-1 text-3xl font-black md:text-4xl">{data.mapName}</h2>
            <p className="text-sm text-muted">
              {new Date(data.timestamp).toLocaleString("de-DE", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Team Blue */}
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-attacker">Team Blau</span>
              <div className="text-4xl font-black text-attacker">{data.scoreBlue}</div>
            </div>
            
            <div className="text-2xl font-bold text-muted">:</div>

            {/* Team Orange */}
            <div className="text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-defender">Team Orange</span>
              <div className="text-4xl font-black text-defender">{data.scoreOrange}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rounds Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {data.rounds.map((r, idx) => {
          const isSelected = selectedRoundIdx === idx;
          const isBlueWinner = r.wonBlue;
          
          return (
            <button
              key={r.roundNumber}
              onClick={() => setSelectedRoundIdx(idx)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                isSelected
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-surface text-muted hover:text-text hover:bg-surface-2"
              }`}
            >
              <span>Round {r.roundNumber}</span>
              <span className={`h-2.5 w-2.5 rounded-full ${isBlueWinner ? "bg-attacker" : "bg-defender"}`} />
            </button>
          );
        })}
      </div>

      {/* Round Detail Pane */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Roster & Scoreboard (Blue & Orange) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Team Blue (Dein Team / Attacker or Defender) */}
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-surface-2/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-attacker" />
                <h3 className="font-black text-attacker uppercase tracking-wider text-sm">
                  Team Blau ({round.teamBlueRole})
                </h3>
              </div>
              {round.wonBlue && (
                <span className="rounded bg-attacker/10 border border-attacker/25 px-2 py-0.5 text-xs font-black text-attacker uppercase">
                  Winner ({formatWinCondition(round.winCondition)})
                </span>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-2/20 text-[11px] font-bold uppercase tracking-wider text-muted">
                    <th className="px-4 py-2.5">Player</th>
                    <th className="px-4 py-2.5 text-center">Score</th>
                    <th className="px-4 py-2.5 text-center">K / D / A</th>
                    <th className="px-4 py-2.5 text-center">HS %</th>
                    <th className="px-4 py-2.5">Spawn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {round.teamBlue.map((player) => {
                    const opSlug = getOperatorSlug(player.operator);
                    const opIcon = `/img/operators/${opSlug}_icon.png`;
                    
                    return (
                      <tr key={player.username} className="hover:bg-surface-2/20">
                        <td className="flex items-center gap-3 px-4 py-3">
                          <img 
                            src={opIcon} 
                            alt={player.operator} 
                            className="h-8 w-8 rounded bg-surface-2 p-0.5 object-contain"
                            onError={(e) => {
                              // Fallback if image not found
                              (e.target as HTMLImageElement).src = "/icons/operator-recruit.png";
                            }}
                          />
                          <span className="font-bold truncate max-w-[120px] md:max-w-[180px]">{player.username}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-muted">{player.score}</td>
                        <td className="px-4 py-3 text-center font-mono font-bold">
                          {player.kills} / <span className={player.deaths > 0 ? "text-loss" : ""}>{player.deaths}</span> / {player.assists}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-muted">{player.headshotPercentage.toFixed(0)}%</td>
                        <td className="px-4 py-3 text-xs text-muted truncate max-w-[100px]">{player.spawn || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Team Orange */}
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-surface-2/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-defender" />
                <h3 className="font-black text-defender uppercase tracking-wider text-sm">
                  Team Orange ({round.teamOrangeRole})
                </h3>
              </div>
              {round.wonOrange && (
                <span className="rounded bg-defender/10 border border-defender/25 px-2 py-0.5 text-xs font-black text-defender uppercase">
                  Winner ({formatWinCondition(round.winCondition)})
                </span>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-2/20 text-[11px] font-bold uppercase tracking-wider text-muted">
                    <th className="px-4 py-2.5">Player</th>
                    <th className="px-4 py-2.5 text-center">Score</th>
                    <th className="px-4 py-2.5 text-center">K / D / A</th>
                    <th className="px-4 py-2.5 text-center">HS %</th>
                    <th className="px-4 py-2.5">Spawn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {round.teamOrange.map((player) => {
                    const opSlug = getOperatorSlug(player.operator);
                    const opIcon = `/img/operators/${opSlug}_icon.png`;
                    
                    return (
                      <tr key={player.username} className="hover:bg-surface-2/20">
                        <td className="flex items-center gap-3 px-4 py-3">
                          <img 
                            src={opIcon} 
                            alt={player.operator} 
                            className="h-8 w-8 rounded bg-surface-2 p-0.5 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/icons/operator-recruit.png";
                            }}
                          />
                          <span className="font-bold truncate max-w-[120px] md:max-w-[180px]">{player.username}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-muted">{player.score}</td>
                        <td className="px-4 py-3 text-center font-mono font-bold">
                          {player.kills} / <span className={player.deaths > 0 ? "text-loss" : ""}>{player.deaths}</span> / {player.assists}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-muted">{player.headshotPercentage.toFixed(0)}%</td>
                        <td className="px-4 py-3 text-xs text-muted truncate max-w-[100px]">{player.spawn || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Timeline / Match Feedback Feed */}
        <div className="flex flex-col rounded-xl border border-border bg-surface overflow-hidden">
          <div className="border-b border-border bg-surface-2/50 px-4 py-3">
            <h3 className="font-black uppercase tracking-wider text-sm">
              {t("replays.timeline" as any)} (Spot: {round.site})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[600px] p-4">
            {round.matchFeedback && round.matchFeedback.length > 0 ? (
              <div className="relative border-l-2 border-border/60 pl-4 ml-2 flex flex-col gap-6">
                {round.matchFeedback.map((event, idx) => {
                  const isKill = event.type.name === "Kill";
                  const eventIcon = getEventIcon(event.type.name);
                  
                  return (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[25px] top-1 grid h-4 w-4 place-items-center rounded-full bg-surface border border-border text-[9px]">
                        {eventIcon}
                      </span>
                      
                      <div className="text-xs text-muted font-mono">{event.time}</div>
                      
                      <div className="mt-1 text-sm leading-relaxed">
                        {isKill ? (
                          <span>
                            <strong className="text-text">{event.username}</strong>{" "}
                            {killedVerb}{" "}
                            <strong className="text-text">{event.target}</strong>
                            {event.headshot && <span className="ml-1 text-accent" title="Headshot">🎯</span>}
                          </span>
                        ) : event.message ? (
                          <span className="text-muted italic">{event.message}</span>
                        ) : (
                          <span>
                            <strong className="text-text">{event.username}</strong>{" "}
                            <span className="text-muted">{event.type.name}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-muted">
                {t("replays.no_events" as any)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
