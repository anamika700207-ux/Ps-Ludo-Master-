import React, { useEffect } from 'react';
import { Player, PlayerColor, Language, TeamId } from '../types/ludo';
import { TRANSLATIONS, COLOR_CONFIG, TEAM_CONFIG } from '../utils/ludoConstants';
import { sounds } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { Trophy, Crown, RotateCcw, Home, Sparkles, ShieldCheck } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  winners: PlayerColor[];
  players: Player[];
  lang: Language;
  isTeamMode?: boolean;
  winningTeamId?: TeamId | null;
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
  onRematch,
  onHome,
}) => {
  useEffect(() => {
    if (isOpen) {
      sounds.playCelebration();
      // Burst celebratory confetti
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 70,
          origin: { x: 0 },
          colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899'],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 70,
          origin: { x: 1 },
          colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899'],
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
  const winnerColor = winners[0];
  const winnerPlayer = players.find((p) => p.color === winnerColor);
  const colorCfg = winnerColor ? COLOR_CONFIG[winnerColor] : COLOR_CONFIG.red;

  const winningTeam = winningTeamId ? TEAM_CONFIG[winningTeamId] : null;
  const remainingPlayers = players.filter((p) => !winners.includes(p.color));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.3)] p-6 sm:p-8 text-center overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Golden Trophy & Crown with Celebratory Sparkles */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-2xl shadow-amber-500/30 animate-bounce">
            <Trophy className="w-10 h-10 text-slate-950 fill-slate-950 drop-shadow" />
          </div>
          <div className="absolute -top-3 -right-2">
            <Crown className="w-7 h-7 text-amber-300 fill-amber-300 drop-shadow animate-pulse" />
          </div>
        </div>

        {/* Celebration Title: Fireworks & Applause Banner */}
        <div className="mb-2">
          <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/40 inline-flex items-center gap-1.5 shadow-sm">
            <span>🎆</span>
            <span>{lang === 'bn' ? 'বাজি ও করতালির সাথে বিজয়োল্লাস!' : 'Victory with Fireworks & Applause!'}</span>
            <span>👏</span>
          </span>
        </div>

        <h2 className="text-3xl font-display font-extrabold text-white mb-2">
          {isTeamMode ? t.teamVictory : t.winner}
        </h2>

        {isTeamMode && winningTeam ? (
          /* Team Mode Victory Presentation */
          <div className="mb-6 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 border border-amber-400/50 shadow-md">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="text-base font-extrabold text-amber-300">
                {lang === 'bn' ? winningTeam.nameBn : winningTeam.nameEn}
              </span>
            </div>

            {/* Teammate Duo Cards */}
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
                        {p?.tokensHome || 4}/4 {lang === 'bn' ? 'ঘরে' : 'Home'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Solo Mode Top Winner */
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className={`w-4 h-4 rounded-full ${colorCfg.bg} ring-2 ring-white/40 shadow-sm`} />
            <span className="text-2xl font-black text-amber-400">
              {winnerPlayer?.name || (lang === 'bn' ? colorCfg.nameBn : colorCfg.name)}
            </span>
          </div>
        )}

        {/* Final Standings List (Exact ranks for winners + Defeated for remaining) */}
        {!isTeamMode && (
          <div className="space-y-2 mb-6 text-left bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            {/* Winners Ranked (1st, 2nd, 3rd) */}
            {winners.map((color, idx) => {
              const p = players.find((pl) => pl.color === color);
              const cfg = COLOR_CONFIG[color];
              const rankTitle =
                idx === 0 ? t.firstPlace : idx === 1 ? t.secondPlace : t.thirdPlace;
              const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';

              return (
                <div
                  key={color}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-amber-500/30 shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shadow-sm ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : 'bg-amber-700 text-white'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className={`w-3.5 h-3.5 rounded-full ${cfg.bg} ring-1 ring-white/30`} />
                    <span className="text-sm font-bold text-white truncate max-w-[130px] sm:max-w-[160px]">
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

            {/* Remaining Defeated Players (They cannot play alone) */}
            {remainingPlayers.map((p) => {
              const cfg = COLOR_CONFIG[p.color];
              return (
                <div
                  key={p.color}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-red-500/30 opacity-80"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-red-950/90 border border-red-500/50 text-red-400 flex items-center justify-center text-xs font-black shadow-sm">
                      ✕
                    </span>
                    <span className={`w-3.5 h-3.5 rounded-full ${cfg.bg}`} />
                    <span className="text-sm font-medium text-slate-300 truncate max-w-[130px] sm:max-w-[160px]">
                      {p.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
                    {t.defeated} ❌
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onRematch();
            }}
            className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-display font-bold text-sm shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.playAgain}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onHome();
            }}
            className="py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-sm border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{t.backToMenu}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
