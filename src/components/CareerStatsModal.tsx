import React from 'react';
import { Language, CareerStats } from '../types/ludo';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] p-5 sm:p-7 overflow-hidden text-slate-100">
        {/* Glow ambient background */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-md">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-black text-white">
                {isBn ? 'খেলোয়াড়ের পরিসংখ্যান' : 'Player Career Stats'}
              </h2>
              <p className="text-xs text-amber-300/80">
                {isBn ? 'ফোনে সংরক্ষিত সকল ম্যাচের হিসাব' : 'Saved locally on your device'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Stats Grid Cards */}
        <div className="relative z-10 grid grid-cols-2 gap-2.5 mb-4">
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

        {/* Latest Match Record */}
        <div className="relative z-10 p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{isBn ? 'সর্বশেষ ম্যাচের ফলাফল' : 'Latest Match Result'}</span>
            </span>
            {stats.lastMatch?.date && (
              <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3" />
                <span>{stats.lastMatch.date}</span>
              </span>
            )}
          </div>

          {stats.lastMatch ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 font-medium">
                  {isBn ? 'বিজয়ী:' : 'Winner:'}
                </span>
                <span className="font-extrabold text-white flex items-center gap-1.5">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      COLOR_CONFIG[stats.lastMatch.winnerColor]?.bg || 'bg-amber-400'
                    }`}
                  />
                  <span>{stats.lastMatch.winnerName}</span>
                  {stats.lastMatch.isUserWinner ? (
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                      {isBn ? 'আপনি জিতেছেন! 👑' : 'Victory! 👑'}
                    </span>
                  ) : null}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300 font-semibold">
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
                  <span className="text-slate-400 text-[11px]">{isBn ? 'মোট চাল:' : 'Total Moves:'}</span>
                  <span className="text-white font-bold">{stats.lastMatch.totalMoves}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
                  <span className="text-slate-400 text-[11px]">{isBn ? 'কাটা গুটি:' : 'Captures:'}</span>
                  <span className="text-amber-400 font-bold">{stats.lastMatch.totalCaptures}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic text-center py-2">
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
