import { Language, CareerStats, MatchRecord } from '../types/ludo';
import { TRANSLATIONS, COLOR_CONFIG } from '../utils/ludoConstants';
import { sounds } from '../utils/soundEffects';
import { BarChart3, Trophy, X, Flame, Swords, Calendar, RotateCcw, Award } from 'lucide-react';

interface CareerStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  stats: CareerStats;
  onResetStats?: () => void;
}

export const CareerStatsModal: React.FC<CareerStatsModalProps> = ({
  isOpen,
  onClose,
  lang,
  stats,
  onResetStats,
}) => {
  if (!isOpen) return null;

  const isBn = lang === 'bn';
  const total = stats.totalMatches || 0;
  const wins = stats.wins || 0;
  const losses = stats.losses || 0;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const captures = stats.totalCaptures || 0;

  const historyList: MatchRecord[] = (
    stats.matchHistory && Array.isArray(stats.matchHistory) && stats.matchHistory.length > 0
      ? stats.matchHistory
      : stats.lastMatch
      ? [stats.lastMatch]
      : []
  ).slice(0, 15);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] p-5 sm:p-6 overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* Glow ambient background */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header: Profile & Career Stats */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-800 mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <img
                src="/assets/aistudio/1792946521939_99423c66.png"
                alt="Avatar"
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('public/')) {
                    target.src = '/public/assets/aistudio/1792946521939_99423c66.png';
                  }
                }}
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-[9px] font-black text-slate-950 border border-amber-300 shadow">
                1
              </span>
            </div>
            <div>
              <h2 className="text-lg font-display font-black text-white flex items-center gap-1.5">
                <span>{isBn ? 'প্রোফাইল ও পরিসংখ্যান' : 'Profile & Career Stats'}</span>
              </h2>
              <p className="text-xs text-amber-300/80">
                {isBn ? 'ডিভাইসে সংরক্ষিত সকল ম্যাচের হিসাব' : 'Saved locally on your device'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Stats Grid Cards */}
        <div className="relative z-10 grid grid-cols-2 gap-2.5 mb-3 shrink-0">
          {/* Total Matches */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isBn ? 'মোট ম্যাচ' : 'Total Matches'}
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">{total}</span>
              <span className="text-xs text-slate-500">🎮</span>
            </div>
          </div>

          {/* Wins & Rate */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
              <span>{isBn ? 'মোট জয়' : 'Total Wins'}</span>
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-400">{wins}</span>
              <span className="text-xs font-bold text-emerald-300/80">{winRate}% {isBn ? 'হার' : 'rate'}</span>
            </div>
          </div>

          {/* Losses */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-rose-500/30 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
              {isBn ? 'মোট পরাজয়' : 'Total Losses'}
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-rose-400">{losses}</span>
              <span className="text-xs text-slate-500">❌</span>
            </div>
          </div>

          {/* Knocked Out / Captured Tokens */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span>{isBn ? 'কাটা গুটি' : 'Captures'}</span>
              <Flame className="w-3.5 h-3.5 text-amber-400" />
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-400">{captures}</span>
              <span className="text-xs text-slate-500">⚔️</span>
            </div>
          </div>
        </div>

        {/* Latest Match Results (Last 15 Matches) */}
        <div className="relative z-10 p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 mb-4 flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800/80 shrink-0">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{isBn ? 'সর্বশেষ ১৫টি ম্যাচের ফলাফল' : 'Latest Match Results'}</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              {historyList.length}/15 {isBn ? 'ম্যাচ' : 'matches'}
            </span>
          </div>

          {historyList.length > 0 ? (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {historyList.map((m, idx) => (
                <div
                  key={m.id || idx}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition"
                >
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">
                        #{idx + 1}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold">
                          {isBn ? 'সর্বশেষ' : 'Latest'}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium">
                        {m.isTeamMode
                          ? (m.winningTeamName || (isBn ? 'টিম মোড' : 'Team Mode'))
                          : m.mode === 'offline_bot'
                          ? (isBn ? 'বনাম বট' : 'Vs Bot')
                          : m.mode === 'online'
                          ? (isBn ? 'অনলাইন' : 'Online')
                          : (isBn ? 'পাস অ্যান্ড প্লে' : 'Pass & Play')}
                      </span>
                    </span>

                    {m.date && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{m.date}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs mb-1.5 pt-1 border-t border-slate-800/50">
                    <span className="text-slate-400 font-medium">{isBn ? 'বিজয়ী:' : 'Winner:'}</span>
                    <span className="font-extrabold text-white flex items-center gap-1.5">
                      <span
                        className={`w-3 h-3 rounded-full shadow-sm ${
                          COLOR_CONFIG[m.winnerColor]?.bg || 'bg-amber-400'
                        }`}
                      />
                      <span>{m.winnerName}</span>
                      {m.isUserWinner ? (
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                          {isBn ? 'জয় 👑' : 'Win 👑'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-rose-400 bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-500/30">
                          {isBn ? 'হার' : 'Loss'}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-semibold pt-1 border-t border-slate-800/50">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[10px]">{isBn ? 'মোট চাল:' : 'Total Moves:'}</span>
                      <span className="text-white font-bold">{m.totalMoves}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[10px]">{isBn ? 'কাটা গুটি:' : 'Captures:'}</span>
                      <span className="text-amber-400 font-bold">{m.totalCaptures}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic text-center py-4">
              {isBn
                ? 'এখনও কোনো ম্যাচ সম্পন্ন হয়নি। একটি ম্যাচ খেলুন!'
                : 'No finished match recorded yet. Play a game!'}
            </p>
          )}
        </div>

        {/* Modal Actions */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          {onResetStats && total > 0 && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    isBn
                      ? 'আপনি কি নিশ্চিত যে সকল রেকর্ড মুছে ফেলতে চান?'
                      : 'Are you sure you want to reset all stats?'
                  )
                ) {
                  sounds.playClick();
                  onResetStats();
                }
              }}
              className="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/50 rounded-xl border border-rose-800/40 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isBn ? 'রিসেট' : 'Reset'}</span>
            </button>
          )}

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-display font-bold text-xs shadow-md transition text-center cursor-pointer"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
