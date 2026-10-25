import React from 'react';
import { Player, PlayerColor } from '../types/ludo';
import { COLOR_CONFIG, getTeamIdForColor, TEAM_CONFIG } from '../utils/ludoConstants';
import { Bot, User, Trophy, WifiOff, Shield } from 'lucide-react';

interface PlayerHUDProps {
  player: Player;
  isActive: boolean;
  diceValue: number | null;
  isRolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
  lang: 'bn' | 'en';
  isLocalUser: boolean;
  isTeamMode?: boolean;
}

export const PlayerHUD: React.FC<PlayerHUDProps> = ({
  player,
  isActive,
  lang,
  isTeamMode = false,
}) => {
  const colorCfg = COLOR_CONFIG[player.color];
  const finishedCount = player.tokens.filter((t) => t.step === 56).length;

  return (
    <div
      className={`relative px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl transition-all duration-300 border ${
        isActive
          ? `bg-slate-900/90 ${colorCfg.border} shadow-lg ring-2 ${colorCfg.ring} scale-102`
          : 'bg-slate-900/50 border-slate-800/80 opacity-80'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {/* Avatar / Color Icon */}
        <div
          className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${colorCfg.accentGrad} flex items-center justify-center text-white shadow-md border border-white/20`}
        >
          {player.isBot ? (
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          ) : (
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          )}

          {/* Rank Badge if won */}
          {player.rank && (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black shadow">
              {player.rank}
            </span>
          )}
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-semibold truncate text-slate-100">
              {player.name}
            </span>
            {isTeamMode && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {player.color === 'red' || player.color === 'yellow' ? 'টিম ১' : 'টিম ২'}
              </span>
            )}
            {!player.isConnected && (
              <span title="Disconnected">
                <WifiOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-slate-400">
              {lang === 'bn' ? colorCfg.nameBn : colorCfg.name}
            </span>
            <span className="text-slate-600">·</span>
            {/* Tokens Home Progress */}
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span className="text-[11px] font-num font-bold text-amber-300">
                {finishedCount}/4
              </span>
            </div>
          </div>
        </div>

        {/* Turn Active Status */}
        {isActive && (
          <div className="shrink-0 flex items-center">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorCfg.bg} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colorCfg.bg}`}></span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
