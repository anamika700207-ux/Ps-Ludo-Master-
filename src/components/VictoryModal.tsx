import React, { useEffect } from 'react';
import { Player, PlayerColor, Language, TeamId } from '../types/ludo';
import { TRANSLATIONS, COLOR_CONFIG, TEAM_CONFIG } from '../utils/ludoConstants';
import { sounds } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { Trophy, Crown, RotateCcw, Home, Sparkles, ShieldCheck, Flame, Swords } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  winners: PlayerColor[];
  players: Player[];
  lang: Language;
  isTeamMode?: boolean;
  winningTeamId?: TeamId | null;
  totalMoves?: number;
  totalCaptures?: number;
  onRematch: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  winners,
  players,
  lang,
  isTeamMode = false,
  winningTeamId,
  totalMoves = 0,
  totalCaptures = 0,
  onRematch,
  onHome,
}) => {
  useEffect(() => {
    if (isOpen) {
      sounds.playCelebration();
      // Burst celebratory confetti
      const duration = 3.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 6,
          angle: 60,
          spread: 70,
          origin: { x: 0 },
          colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#fbbf24'],
        });
        confetti({
          particleCount: 6,
          angle: 120,
          spread: 70,
          origin: { x: 1 },
          colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#fbbf24'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];
  const isBn = lang === 'bn';
  const winnerColor = winners[0];
  const winnerPlayer = players.find((p) => p.color === winnerColor);
  const colorCfg = winnerColor ? COLOR_CONFIG[winnerColor] : COLOR_CONFIG.red;

  const winningTeam = winningTeamId ? TEAM_CONFIG[winningTeamId] : null;
  const remainingPlayers = players.filter((p) => !winners.includes(p.color));

  const winnerDisplayName = isTeamMode && winningTeam
    ? (isBn ? winningTeam.nameBn : winningTeam.nameEn)
    : (winnerPlayer?.name || (isBn ? colorCfg.nameBn : colorCfg.name));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.35)] p-5 sm:p-7 text-center overflow-hidden my-auto">
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 right-0 w-64 h-64 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* --- ROYAL ANIMATED CROWN (ক্রাউন অ্যানিমেশন) --- */}
        <div className="relative inline-flex items-center justify-center mb-3">
          {/* Pulsing Aura Behind Crown */}
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-full blur-xl opacity-75 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />

          {/* Shimmering Rotating Halo */}
          <div className="absolute -inset-2 rounded-full border-2 border-dashed border-amber-300/60 animate-spin pointer-events-none" style={{ animationDuration: '14s' }} />

          {/* Golden Trophy Box with Crown */}
          <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.5)] transform hover:scale-105 transition-transform duration-300">
            <Trophy className="w-10 h-10 text-slate-950 fill-slate-950 drop-shadow-lg" />
          </div>

          {/* Floating Animated Crown with Glow */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 transform -translate-y-1 animate-bounce" style={{ animationDuration: '1.8s' }}>
            <div className="relative">
              <Crown className="w-10 h-10 text-amber-300 fill-amber-300 drop-shadow-[0_4px_10px_rgba(251,191,36,0.9)] filter" />
              <Sparkles className="absolute -top-1 -right-2 w-4 h-4 text-white animate-spin" style={{ animationDuration: '4s' }} />
              <Sparkles className="absolute -bottom-1 -left-2 w-3.5 h-3.5 text-yellow-200 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Celebration Title Banner */}
        <div className="mb-2">
          <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-3.5 py-1 rounded-full border border-amber-400/50 inline-flex items-center gap-1.5 shadow-sm">
            <span>🎆</span>
            <span>{isBn ? 'বাজি ও করতালির সাথে বিজয়োল্লাস!' : 'Victory with Fireworks & Applause!'}</span>
            <span>👏</span>
          </span>
        </div>

        {/* Winner Announcement (বিজয়ীর নাম) */}
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {isBn ? 'চ্যাম্পিয়ন' : 'CHAMPION'}
          </span>
          <div className="flex items-center justify-center gap-2 mt-1">
            {!isTeamMode && (
              <span className={`w-4 h-4 rounded-full ${colorCfg.bg} ring-2 ring-white/60 shadow`} />
            )}
            <h2 className="text-2xl sm:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-300 drop-shadow-sm">
              {winnerDisplayName}
            </h2>
          </div>
        </div>

        {/* --- MATCH STATISTICS: মোট চাল এবং কতটি গুটি কেটেছে --- */}
        <div className="grid grid-cols-2 gap-2.5 mb-4 text-left">
          {/* মোট চাল / Total Moves */}
          <div className="p-3 rounded-2xl bg-slate-950/90 border border-amber-500/30 flex items-center gap-2.5 shadow-inner">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <span className="text-base">🎲</span>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                {isBn ? 'মোট চাল' : 'Total Moves'}
              </div>
              <div className="text-lg font-black text-white">
                {totalMoves}
              </div>
            </div>
          </div>

          {/* কতটি গুটি কেটেছে / Total Captures */}
          <div className="p-3 rounded-2xl bg-slate-950/90 border border-rose-500/30 flex items-center gap-2.5 shadow-inner">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                {isBn ? 'কাটা গুটি' : 'Captures'}
              </div>
              <div className="text-lg font-black text-rose-400">
                {totalCaptures}
              </div>
            </div>
          </div>
        </div>

        {/* Team Mode Specific Presentation */}
        {isTeamMode && winningTeam && (
          <div className="mb-4 space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 border border-amber-400/50 shadow-md">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-extrabold text-amber-300">
                {isBn ? winningTeam.nameBn : winningTeam.nameEn}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              {winningTeam.colors.map((c) => {
                const p = players.find((pl) => pl.color === c);
                const cfg = COLOR_CONFIG[c];
                return (
                  <div
                    key={c}
                    className="p-2.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center gap-2 shadow-inner"
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${cfg.bg} shrink-0 ring-2 ring-white/20`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">
                        {p?.name}
                      </div>
                      <div className="text-[10px] text-amber-400 font-semibold">
                        {p?.tokensHome || 4}/4 {isBn ? 'ঘরে' : 'Home'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Solo Mode Standings */}
        {!isTeamMode && (
          <div className="space-y-1.5 mb-4 text-left bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            {winners.map((color, idx) => {
              const p = players.find((pl) => pl.color === color);
              const cfg = COLOR_CONFIG[color];
              const rankTitle =
                idx === 0 ? t.firstPlace : idx === 1 ? t.secondPlace : t.thirdPlace;
              const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';

              return (
                <div
                  key={color}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-amber-500/30 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shadow-sm ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : 'bg-amber-700 text-white'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className={`w-3 h-3 rounded-full ${cfg.bg} ring-1 ring-white/30`} />
                    <span className="text-xs font-bold text-white truncate max-w-[130px] sm:max-w-[160px]">
                      {p?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
                    <span>{medalEmoji}</span>
                    <span>{rankTitle}</span>
                  </div>
                </div>
              );
            })}

            {remainingPlayers.map((p) => {
              const cfg = COLOR_CONFIG[p.color];
              return (
                <div
                  key={p.color}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-red-500/30 opacity-80"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-red-950/90 border border-red-500/50 text-red-400 flex items-center justify-center text-xs font-black shadow-sm">
                      ✕
                    </span>
                    <span className={`w-3 h-3 rounded-full ${cfg.bg}`} />
                    <span className="text-xs font-medium text-slate-300 truncate max-w-[130px] sm:max-w-[160px]">
                      {p.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
                    {t.defeated} ❌
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              sounds.playClick();
              onRematch();
            }}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-display font-bold text-sm shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.playAgain}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onHome();
            }}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-sm border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{t.backToMenu}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
