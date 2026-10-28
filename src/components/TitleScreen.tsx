import React, { useState } from 'react';
import { GameMode, PlayerColor, Language } from '../types/ludo';
import { TRANSLATIONS, COLOR_CONFIG } from '../utils/ludoConstants';
import { sounds } from '../utils/soundEffects';
import {
  Users,
  Bot,
  Globe,
  BookOpen,
  Sparkles,
  Shield,
  BarChart3,
  Play,
  Settings,
  X,
  ArrowLeft,
  Crown,
  Coins,
  Check,
  Smartphone,
  Trophy,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { InGameMusicWidget } from './InGameMusicWidget';
import { triggerHaptic } from '../utils/haptics';
import { useCustomMusic } from '../context/CustomMusicContext';

interface TitleScreenProps {
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  playerCount: 2 | 3 | 4;
  setPlayerCount: (count: 2 | 3 | 4) => void;
  isTeamMode: boolean;
  setIsTeamMode: (isTeam: boolean) => void;
  myColor: PlayerColor;
  setMyColor: (color: PlayerColor) => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  playerNames: Record<number, string>;
  setPlayerNames: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  lang: Language;
  setLang?: (lang: Language) => void;
  soundEnabled?: boolean;
  setSoundEnabled?: (enabled: boolean) => void;
  bgmEnabled?: boolean;
  onToggleBgm?: () => void;
  onStartOffline: () => void;
  onOpenOnlineModal: () => void;
  onOpenRules: () => void;
  onOpenIntro?: () => void;
  hasSavedGame?: boolean;
  onResumeGame?: () => void;
  onDiscardSavedGame?: () => void;
  onOpenStats?: () => void;
  onOpenSettings?: () => void;
}

type SetupModalMode = 'offline_pass_play' | 'offline_bot' | 'team_up' | null;

export const TitleScreen: React.FC<TitleScreenProps> = ({
  mode,
  setMode,
  playerCount,
  setPlayerCount,
  isTeamMode,
  setIsTeamMode,
  myColor,
  setMyColor,
  playerName,
  setPlayerName,
  playerNames,
  setPlayerNames,
  lang,
  onStartOffline,
  onOpenOnlineModal,
  onOpenRules,
  onOpenIntro,
  hasSavedGame = false,
  onResumeGame,
  onDiscardSavedGame,
  onOpenStats,
  onOpenSettings,
}) => {
  const t = TRANSLATIONS[lang];
  const isBn = lang === 'bn';
  const { isPlaying } = useCustomMusic();

  // Modal setup state: opens whenever user clicks Pass & Play, Vs Computer, or Team Up
  const [setupModalMode, setSetupModalMode] = useState<SetupModalMode>(null);

  // Handle opening setup modal for offline modes
  const handleOpenSetup = (selectedMode: 'offline_pass_play' | 'offline_bot' | 'team_up') => {
    sounds.playClick();
    triggerHaptic('medium');
    if (selectedMode === 'team_up') {
      setMode('offline_pass_play');
      setPlayerCount(4);
      setIsTeamMode(true);
    } else {
      setMode(selectedMode);
      if (selectedMode === 'offline_pass_play' && isTeamMode && playerCount !== 4) {
        setIsTeamMode(false);
      }
    }
    setSetupModalMode(selectedMode);
  };

  // Handle starting game from inside the Setup Modal
  const handleStartGame = () => {
    sounds.playClick();
    triggerHaptic('heavy');
    setSetupModalMode(null);
    onStartOffline();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-3 sm:p-5 md:p-8 bg-gradient-to-b from-slate-950 via-[#0d1224] to-slate-950 text-slate-100 overflow-y-auto">
      {/* Background Ambient Lighting & Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-red-600/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-blue-600/25 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* TOP HEADER: Player Profile Bar + Coin/Gem Balance + Controls (Matching Ludo King Layout) */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-between gap-2 py-2">
        {/* Left: Player Profile Pill (Click to open Career Stats & Match History) */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            triggerHaptic('light');
            if (onOpenStats) onOpenStats();
          }}
          title={isBn ? 'প্রোফাইল ও খেলোয়াড়ের পরিসংখ্যান' : 'Player Profile & Career Stats'}
          className="flex items-center gap-2 p-1 pr-3 rounded-full bg-slate-900/90 border border-slate-700/80 hover:border-amber-400/80 hover:bg-slate-800/90 shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer text-left group"
        >
          {/* Avatar with level badge */}
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 p-0.5 shadow-md flex items-center justify-center group-hover:ring-2 group-hover:ring-amber-300 transition-all">
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

          {/* Name & Coin Badge */}
          <div className="flex flex-col text-left leading-tight">
            <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors truncate max-w-[90px] sm:max-w-[120px]">
              {playerName || 'Player 1'}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-300">
              <span className="text-amber-400">🪙</span>
              <span>3,150</span>
            </div>
          </div>
        </button>

        {/* Center/Right: Gems, Music & Action Controls */}
        <div className="flex flex-col items-end gap-1.5 shrink-0 z-20">
          {/* Top row: Gems + PWA + Music Widget */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Gems Counter Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 font-black text-xs shadow-md">
              <span>💎</span>
              <span>50</span>
            </div>

            {/* PWA Mobile Install Button */}
            <PWAInstallButton lang={lang} variant="button" />

            {/* Custom Music Widget in Title Screen */}
            <InGameMusicWidget
              lang={lang}
              onOpenSettings={onOpenSettings || (() => {})}
            />
          </div>

          {/* Bottom row directly under music player: Settings and Rules */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            {/* Settings Button */}
            {onOpenSettings && (
              <button
                onClick={() => {
                  sounds.playClick();
                  triggerHaptic('light');
                  onOpenSettings();
                }}
                aria-label="Settings"
                title={isBn ? 'সেটিংস' : 'Settings'}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-950/90 to-indigo-950/90 border border-purple-500/50 text-purple-200 hover:text-white hover:border-purple-300 hover:bg-purple-900/60 transition shadow-md active:scale-95 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-purple-300 animate-[spin_8s_linear_infinite]" />
                <span>{isBn ? 'সেটিংস' : 'Settings'}</span>
              </button>
            )}

            {/* Rules Button */}
            <button
              onClick={() => {
                sounds.playClick();
                onOpenRules();
              }}
              aria-label="Rules"
              title={isBn ? 'খেলার নিয়মাবলী' : 'Game Rules'}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900/90 border border-slate-800 text-amber-300 hover:bg-slate-800 transition shadow-sm active:scale-95 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.rules}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CENTERPIECE: Crown & PS LUDO MASTER Graphic */}
      <div className="relative z-10 w-full max-w-xl mx-auto my-auto flex flex-col items-center text-center py-2 sm:py-4">
        {/* Emblem */}
        <div
          onClick={() => {
            if (onOpenIntro) {
              sounds.playClick();
              onOpenIntro();
            }
          }}
          className="relative mb-3 group cursor-pointer"
          title={isBn ? 'ইন্ট্রো দেখুন' : 'Watch Intro'}
        >
          {/* Radiant pulsating aura */}
          <div className="absolute -inset-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-red-500 rounded-full blur-xl opacity-60 group-hover:opacity-95 transition duration-500 animate-pulse" />

          {/* Golden Crown on top of Emblem */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center filter drop-shadow-[0_4px_10px_rgba(245,158,11,0.8)] animate-bounce" style={{ animationDuration: '3s' }}>
            <Crown className="w-10 h-10 text-amber-300 fill-amber-400" />
          </div>

          {/* Gold framed circle */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1 bg-gradient-to-tr from-amber-300 via-amber-500 to-yellow-600 shadow-[0_0_35px_rgba(245,158,11,0.55)]">
            <img
              src="/assets/aistudio/1792946521939_99423c66.png"
              alt="Ps Ludo Master Game Logo"
              className="w-full h-full rounded-full object-contain group-hover:scale-105 transition-transform duration-300 shadow-inner"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('public/')) {
                  target.src = '/public/assets/aistudio/1792946521939_99423c66.png';
                }
              }}
            />
          </div>

          {/* Interactive replay tag */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-950/90 border border-amber-400 text-[10px] sm:text-xs font-bold text-amber-300 shadow-md whitespace-nowrap flex items-center gap-1 group-hover:border-amber-300 group-hover:text-white transition">
            <span>📺</span>
            <span>{isBn ? 'ইন্ট্রো' : 'Intro'}</span>
          </div>
        </div>

        {/* Title Lockup */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight text-white mb-1 drop-shadow-[0_2px_12px_rgba(245,158,11,0.4)]">
          PS LUDO MASTER
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-4 font-medium">
          {isBn ? 'আপনার পছন্দের মোডটি বেছে নিন এবং খেলা শুরু করুন' : 'Choose your favorite game mode to start playing'}
        </p>

        {/* Resume Saved Match Banner (If match in progress) */}
        {hasSavedGame && onResumeGame && (
          <div className="w-full p-3 mb-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-emerald-950/80 border-2 border-emerald-400/70 shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center justify-between gap-2 text-left animate-pulse">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                <Play className="w-4 h-4 fill-slate-950" />
              </div>
              <div>
                <div className="text-xs font-black text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                  <span>{isBn ? 'পূর্বের ম্যাচ সংরক্ষিত আছে' : 'Saved Match Available'}</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  {isBn ? 'আগের স্থান থেকেই চালিয়ে যান' : 'Continue your paused match'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  sounds.playClick();
                  onResumeGame();
                }}
                className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-display font-black text-xs shadow-md active:scale-95 transition cursor-pointer flex items-center gap-1"
              >
                <span>{isBn ? 'চালিয়ে যান' : 'Resume'}</span>
                <span>▶</span>
              </button>

              {onDiscardSavedGame && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        isBn
                          ? 'পূর্বের সেভ করা ম্যাচটি মুছে নতুন ম্যাচ শুরু করতে চান?'
                          : 'Discard saved match and start fresh?'
                      )
                    ) {
                      sounds.playClick();
                      onDiscardSavedGame();
                    }
                  }}
                  className="w-7 h-7 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 flex items-center justify-center text-xs transition"
                  title={isBn ? 'বাতিল করুন' : 'Discard'}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* PRIMARY GAME MODES SELECTION (MATCHING LUDO KING SCREENSHOT) */}
        <div className="w-full space-y-3 mb-4">
          {/* 1. PASS N PLAY BUTTON (Golden 3D Gaming Card) */}
          <button
            onClick={() => handleOpenSetup('offline_pass_play')}
            className="w-full relative group overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 border-2 border-yellow-300 shadow-[0_8px_20px_rgba(245,158,11,0.35)] hover:shadow-[0_12px_28px_rgba(245,158,11,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-slate-950 text-left flex items-center justify-between cursor-pointer"
          >
            {/* Glossy top shine */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-2xl" />

            <div className="relative z-10 flex items-center gap-3.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-950/15 border border-amber-900/20 flex items-center justify-center shadow-inner group-hover:rotate-3 transition-transform">
                <Users className="w-7 h-7 text-slate-950 drop-shadow-sm" />
              </div>
              <div>
                <div className="font-display font-black text-lg sm:text-xl tracking-wide uppercase drop-shadow-sm flex items-center gap-2">
                  <span>{isBn ? 'পাস অ্যান্ড প্লে' : 'PASS N PLAY'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-950/20 text-slate-950 border border-slate-950/15">
                    LOCAL
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-amber-950/80">
                  {isBn ? 'একই ফোনে ২-৪ জন মুখোমুখি খেলুন' : 'Pass & Play with friends on 1 device'}
                </div>
              </div>
            </div>

            <div className="relative z-10 w-9 h-9 rounded-full bg-slate-950/15 flex items-center justify-center font-black text-slate-950 text-sm group-hover:translate-x-1 transition-transform">
              ▶
            </div>
          </button>

          {/* 2. VS COMPUTER (BOT) BUTTON (Vibrant Blue 3D Gaming Card) */}
          <button
            onClick={() => handleOpenSetup('offline_bot')}
            className="w-full relative group overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-600 border-2 border-cyan-300 shadow-[0_8px_20px_rgba(59,130,246,0.35)] hover:shadow-[0_12px_28px_rgba(59,130,246,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-white text-left flex items-center justify-between cursor-pointer"
          >
            {/* Glossy top shine */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-2xl" />

            <div className="relative z-10 flex items-center gap-3.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-black/20 border border-white/20 flex items-center justify-center shadow-inner group-hover:-rotate-3 transition-transform">
                <Bot className="w-7 h-7 text-cyan-200 drop-shadow-sm" />
              </div>
              <div>
                <div className="font-display font-black text-lg sm:text-xl tracking-wide uppercase drop-shadow-sm flex items-center gap-2">
                  <span>{isBn ? 'বনাম কম্পিউটার (বট)' : 'VS COMPUTER'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-400 text-slate-950">
                    AI BOT
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-cyan-100">
                  {isBn ? 'বুদ্ধিমান বটের সাথে একাকী অনুশীলন' : 'Challenge smart AI bots solo'}
                </div>
              </div>
            </div>

            <div className="relative z-10 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-black text-white text-sm group-hover:translate-x-1 transition-transform">
              ▶
            </div>
          </button>

          {/* 3. ONLINE MULTIPLAYER BUTTON (Emerald Green 3D Gaming Card) */}
          <button
            onClick={() => {
              sounds.playClick();
              triggerHaptic('medium');
              setMode('online');
              onOpenOnlineModal();
            }}
            className="w-full relative group overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 border-2 border-emerald-300 shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_12px_28px_rgba(16,185,129,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-white text-left flex items-center justify-between cursor-pointer"
          >
            {/* Glossy top shine */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-2xl" />

            <div className="relative z-10 flex items-center gap-3.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-black/20 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <Globe className="w-7 h-7 text-emerald-200 drop-shadow-sm" />
              </div>
              <div>
                <div className="font-display font-black text-lg sm:text-xl tracking-wide uppercase drop-shadow-sm flex items-center gap-2">
                  <span>{isBn ? 'অনলাইন মাল্টিপ্লেয়ার' : 'ONLINE MULTIPLAYER'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-300 text-slate-950">
                    LIVE
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-emerald-100">
                  {isBn ? 'রুম বানিয়ে বন্ধুদের সাথে সরাসরি লাইভ খেলুন' : 'Create room & play live with friends'}
                </div>
              </div>
            </div>

            <div className="relative z-10 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-black text-white text-sm group-hover:translate-x-1 transition-transform">
              ▶
            </div>
          </button>

          {/* 4. TEAM UP (2v2) SPECIAL MODE BUTTON (Purple/Ruby Card) */}
          <button
            onClick={() => handleOpenSetup('team_up')}
            className="w-full relative group overflow-hidden rounded-2xl p-3.5 sm:p-4 bg-gradient-to-r from-purple-900/90 via-slate-900/90 to-rose-950/90 border border-purple-500/40 hover:border-purple-400 shadow-lg hover:shadow-purple-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 text-left flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <div className="font-display font-bold text-sm sm:text-base text-purple-200 flex items-center gap-2">
                  <span>{isBn ? 'টিম আপ (২ বনাম ২ পার্টনারশিপ)' : '2v2 TEAM UP (PARTNERSHIP)'}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-rose-500/30 text-rose-300 border border-rose-500/40">
                    🔴+🟡 VS 🔵+🟢
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {isBn ? 'পার্টনারের সাথে টিম বানিয়ে খেলুন' : 'Play cooperatively with your teammate'}
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-300">⚙️ সেটআপ</span>
          </button>
        </div>

        {/* PWA Mobile App Download & Install Banner */}
        <PWAInstallButton lang={lang} variant="banner" />
      </div>

      {/* FOOTER */}
      <div className="relative z-10 w-full max-w-4xl mx-auto py-1 text-center text-xs text-slate-500">
        <span>PS Ludo Master · {isBn ? 'লুডু কিং স্টাইল প্রিমিয়াম অভিজ্ঞতা' : 'Premium Board Game Experience'}</span>
      </div>

      {/* =========================================================================
          MODE SETUP MODAL (পরে যেটা সিলেক্ট করবে সেটাতে ফিচার শো করবে এবং খেলা শুরু করবে)
          ========================================================================= */}
      {setupModalMode !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#1e153b] border-2 border-purple-500/40 shadow-[0_0_50px_rgba(147,118,247,0.3)] p-5 sm:p-6 text-left max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-400/50 flex items-center justify-center shadow-md">
                  {setupModalMode === 'offline_pass_play' ? (
                    <Users className="w-5 h-5 text-amber-300" />
                  ) : setupModalMode === 'offline_bot' ? (
                    <Bot className="w-5 h-5 text-cyan-300" />
                  ) : (
                    <Shield className="w-5 h-5 text-rose-300" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-display font-extrabold text-white">
                    {setupModalMode === 'offline_pass_play'
                      ? isBn
                        ? 'পাস অ্যান্ড প্লে সেটআপ'
                        : 'Pass & Play Setup'
                      : setupModalMode === 'offline_bot'
                      ? isBn
                        ? 'বনাম কম্পিউটার (বট) সেটআপ'
                        : 'Vs Computer (Bot) Setup'
                      : isBn
                      ? '২ বনাম ২ টিম আপ সেটআপ'
                      : '2v2 Team Up Setup'}
                  </h2>
                  <p className="text-xs text-purple-200/70">
                    {isBn
                      ? 'পছন্দমতো অপশনগুলো নির্ধারণ করে খেলা শুরু করুন'
                      : 'Configure match settings and start playing'}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setSetupModalMode(null);
                }}
                className="w-9 h-9 rounded-full bg-purple-900/40 hover:bg-purple-800/80 border border-purple-400/30 text-purple-200 hover:text-white flex items-center justify-center transition active:scale-95"
                title={isBn ? 'ফিরে যান' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Settings */}
            <div className="space-y-4">
              {/* 1. Player Count Selector */}
              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1.5">
                  {t.playersCount}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 4].map((count) => {
                    const isSelected = playerCount === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          triggerHaptic('light');
                          const newCount = count as 2 | 3 | 4;
                          setPlayerCount(newCount);
                          if (newCount !== 4) {
                            setIsTeamMode(false);
                          }
                        }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 border-amber-300 text-slate-950 shadow-lg scale-102 ring-2 ring-amber-300/40'
                            : 'bg-purple-950/40 border-purple-500/30 text-purple-200 hover:text-white hover:bg-purple-900/40'
                        }`}
                      >
                        <span className="text-sm">
                          {count === 2 ? '👥 ২ জন' : count === 3 ? '👥 ৩ জন' : '👥 ৪ জন'}
                        </span>
                        <span className="text-[10px] opacity-80">
                          {count === 2 ? t.twoPlayers : count === 3 ? t.threePlayers : t.fourPlayers}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Custom Player Names (Dynamically shows inputs for 2, 3, or 4 players) */}
              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1.5">
                  {isBn
                    ? `খেলোয়াড়দের নাম নির্ধারণ করুন (${playerCount} জন):`
                    : `Enter Players Name (${playerCount} Players):`}
                </label>
                <div className="space-y-2">
                  {Array.from({ length: playerCount }, (_, idx) => idx + 1).map((num) => {
                    const colorForNum: PlayerColor =
                      playerCount === 2
                        ? num === 1
                          ? 'blue'
                          : 'green'
                        : playerCount === 3
                        ? num === 1
                          ? 'blue'
                          : num === 2
                          ? 'red'
                          : 'green'
                        : num === 1
                        ? 'blue'
                        : num === 2
                        ? 'red'
                        : num === 3
                        ? 'green'
                        : 'yellow';

                    const colorData = COLOR_CONFIG[colorForNum];
                    const isBotPlayer = setupModalMode === 'offline_bot' && num > 1;

                    return (
                      <div
                        key={num}
                        className="flex items-center gap-2 bg-purple-950/50 p-2 sm:p-2.5 rounded-xl border border-purple-400/25"
                      >
                        <div className="flex items-center gap-1.5 w-24 sm:w-28 shrink-0 text-xs font-bold text-purple-200">
                          <span
                            className={`w-3.5 h-3.5 rounded-full ${colorData.bg} ring-2 ring-white/30 shadow-sm shrink-0`}
                          />
                          <span className="truncate">
                            {isBn ? `খেলোয়াড় ${num}` : `Player ${num}`}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={
                            playerNames[num] !== undefined
                              ? playerNames[num]
                              : num === 1
                              ? playerName || 'Player 1'
                              : isBotPlayer
                              ? `Bot (${colorData.name})`
                              : `Player ${num}`
                          }
                          onChange={(e) => {
                            const val = e.target.value.slice(0, 16);
                            setPlayerNames((prev) => ({ ...prev, [num]: val }));
                            if (num === 1) {
                              setPlayerName(val);
                            }
                          }}
                          placeholder={
                            isBotPlayer ? `Bot (${colorData.name})` : `Player ${num}`
                          }
                          className="flex-1 px-3 py-2 rounded-lg bg-purple-900/60 border border-purple-400/30 text-white placeholder-purple-300/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. 2v2 Team Mode Toggle (Shown when 4 players selected) */}
              {playerCount === 4 && (
                <div className="p-3.5 rounded-2xl bg-purple-950/50 border border-purple-400/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">{t.matchType}</span>
                    </div>
                    {isTeamMode && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-300">
                        2v2 Team ON
                      </span>
                    )}
                  </div>

                  {/* 2-Option Selector */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        triggerHaptic('light');
                        setIsTeamMode(false);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                        !isTeamMode
                          ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-md font-black'
                          : 'bg-purple-900/30 border-purple-500/30 text-purple-300 hover:text-white'
                      }`}
                    >
                      {t.standardMode}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        triggerHaptic('light');
                        setIsTeamMode(true);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                        isTeamMode
                          ? 'bg-gradient-to-r from-rose-500 to-purple-600 border-rose-300 text-white shadow-lg ring-2 ring-rose-400/40 font-black'
                          : 'bg-purple-900/30 border-purple-500/30 text-purple-300 hover:text-white'
                      }`}
                    >
                      {t.teamMode}
                    </button>
                  </div>

                  {/* Visual Team Pairings */}
                  {isTeamMode && (
                    <div className="mt-2 pt-2 border-t border-purple-500/20 space-y-2">
                      <div className="text-[11px] text-purple-200/80 leading-tight">
                        {t.teamModeDesc}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {/* Team 1 */}
                        <div className="p-2 rounded-xl bg-red-950/40 border border-red-500/40">
                          <div className="font-bold text-[11px] text-amber-300 mb-1 flex items-center gap-1">
                            <span>🛡️</span>
                            <span>{t.team1Name}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                              <span>লাল</span>
                            </span>
                            <span className="text-slate-400 font-bold">+</span>
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                              <span>হলুদ</span>
                            </span>
                          </div>
                        </div>

                        {/* Team 2 */}
                        <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-500/40">
                          <div className="font-bold text-[11px] text-sky-300 mb-1 flex items-center gap-1">
                            <span>🛡️</span>
                            <span>{t.team2Name}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                              <span>নীল</span>
                            </span>
                            <span className="text-slate-400 font-bold">+</span>
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                              <span>সবুজ</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Select Token Color */}
              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1.5">
                  {t.selectYourColor}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((c) => {
                    const cfg = COLOR_CONFIG[c];
                    const isSelected = myColor === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          triggerHaptic('light');
                          setMyColor(c);
                        }}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${
                          isSelected
                            ? `bg-purple-900 border-white text-white ring-2 ${cfg.ring} shadow-lg scale-105`
                            : 'bg-purple-950/40 border-purple-500/30 text-purple-300 hover:text-white'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${cfg.bg} shadow`} />
                        <span>{isBn ? cfg.nameBn : cfg.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Big Action Start Button */}
              <div className="pt-2">
                <button
                  onClick={handleStartGame}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-display font-black text-base tracking-wide shadow-[0_8px_25px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-slate-950" />
                  <span>{isBn ? 'খেলা শুরু করুন ▶' : 'START GAME ▶'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
