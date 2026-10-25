import React from 'react';
import { GameMode, PlayerColor, Language } from '../types/ludo';
import { TRANSLATIONS, COLOR_CONFIG } from '../utils/ludoConstants';
import { sounds } from '../utils/soundEffects';
import { Users, Bot, Globe, Volume2, VolumeX, BookOpen, Sparkles, Shield, UserCheck } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

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
  lang: Language;
  setLang: (lang: Language) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onStartOffline: () => void;
  onOpenOnlineModal: () => void;
  onOpenRules: () => void;
  onOpenIntro?: () => void;
}

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
  lang,
  setLang,
  soundEnabled,
  setSoundEnabled,
  onStartOffline,
  onOpenOnlineModal,
  onOpenRules,
  onOpenIntro,
}) => {
  const t = TRANSLATIONS[lang];

  const handleStart = () => {
    sounds.playClick();
    if (mode === 'online') {
      onOpenOnlineModal();
    } else {
      onStartOffline();
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setSoundEnabled(next);
    if (next) sounds.playClick();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 md:p-8 bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Background Ambient Lighting & Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-red-600/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      {/* Header bar: Language, Sound, Rules */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-between py-2">
        {/* Brand Lockup with Game Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-md overflow-hidden flex items-center justify-center">
            <img
              src="/assets/aistudio/1792946521939_99423c66.png"
              alt="Ps Ludo Master Logo"
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('public/')) {
                  target.src = '/public/assets/aistudio/1792946521939_99423c66.png';
                }
              }}
            />
          </div>
          <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
            PS LUDO MASTER
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* PWA Mobile Install Button */}
          <PWAInstallButton lang={lang} variant="button" />

          {/* Language Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              setLang(lang === 'bn' ? 'en' : 'bn');
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800 transition-all shadow-sm"
          >
            {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label="Sound Toggle"
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-sm"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Rules Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenRules();
            }}
            aria-label="Rules"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900/90 border border-slate-800 text-amber-300 hover:bg-slate-800 transition-all shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.rules}</span>
          </button>

          {/* Re-play Intro Button */}
          {onOpenIntro && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenIntro();
              }}
              aria-label="Watch Intro"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-400/50 text-amber-300 hover:text-white hover:border-amber-300 hover:bg-amber-500/30 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{t.watchIntro}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Centerpiece & Mode Selection */}
      <div className="relative z-10 w-full max-w-xl mx-auto my-auto flex flex-col items-center text-center py-4 sm:py-6">
        {/* Game Logo Emblem */}
        <div
          onClick={() => {
            if (onOpenIntro) {
              sounds.playClick();
              onOpenIntro();
            }
          }}
          className="relative mb-4 group cursor-pointer"
          title={t.watchIntro}
        >
          {/* Radiant pulsating aura */}
          <div className="absolute -inset-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-red-500 rounded-full blur-xl opacity-60 group-hover:opacity-95 transition duration-500 animate-pulse" />
          
          {/* Gold framed circle */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1 bg-gradient-to-tr from-amber-300 via-amber-500 to-yellow-600 shadow-[0_0_35px_rgba(245,158,11,0.55)]">
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
            <span>{t.watchIntro}</span>
          </div>
        </div>

        {/* Title Lockup */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight text-white mb-2">
          {t.gameTitle}
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-md mb-6">
          {t.tagline}
        </p>

        {/* Mode Selector Tabs */}
        <div className="w-full grid grid-cols-3 gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl mb-6 shadow-lg">
          <button
            onClick={() => {
              sounds.playClick();
              setMode('offline_pass_play');
            }}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-200 ${
              mode === 'offline_pass_play'
                ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs font-semibold whitespace-nowrap">{t.passAndPlay}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setMode('offline_bot');
            }}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-200 ${
              mode === 'offline_bot'
                ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-5 h-5" />
            <span className="text-xs font-semibold whitespace-nowrap">{t.vsComputer}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setMode('online');
              onOpenOnlineModal();
            }}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-200 ${
              mode === 'online'
                ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-5 h-5" />
            <span className="text-xs font-semibold whitespace-nowrap">{t.playOnline}</span>
          </button>
        </div>

        {/* Configuration Card */}
        <div className="w-full bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl mb-6 text-left space-y-4">
          {/* Player Name Input */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {t.enterYourName}
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.slice(0, 16))}
              placeholder="Player 1"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
            />
          </div>

          {/* Player Count Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {t.playersCount}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    const newCount = count as 2 | 3 | 4;
                    setPlayerCount(newCount);
                    if (newCount !== 4) {
                      setIsTeamMode(false);
                    }
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    playerCount === count
                      ? 'bg-slate-800 border-amber-400 text-amber-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {count === 2 ? t.twoPlayers : count === 3 ? t.threePlayers : t.fourPlayers}
                </button>
              ))}
            </div>
          </div>

          {/* 4-Player 2v2 Diagonal Team Mode Toggle */}
          {playerCount === 4 && (
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">{t.matchType}</span>
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
                    setIsTeamMode(false);
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    !isTeamMode
                      ? 'bg-slate-800 border-amber-400 text-amber-300 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.standardMode}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setIsTeamMode(true);
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center relative overflow-hidden ${
                    isTeamMode
                      ? 'bg-gradient-to-r from-rose-950/80 via-slate-900 to-sky-950/80 border-amber-400 text-amber-300 ring-2 ring-amber-400/40 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{t.teamMode}</span>
                </button>
              </div>

              {/* Visual Diagonal Team Pairings Preview */}
              {isTeamMode && (
                <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-2 text-left animate-fade-in">
                  <div className="text-[11px] text-slate-400 leading-tight">
                    {t.teamModeDesc}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Team 1: Red + Yellow */}
                    <div className="p-2 rounded-xl bg-gradient-to-br from-red-950/40 via-slate-900/80 to-amber-950/40 border border-red-500/30">
                      <div className="font-bold text-[11px] text-amber-300 mb-1 flex items-center gap-1">
                        <span>🛡️</span>
                        <span>{t.team1Name}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
                          <span>লাল</span>
                        </span>
                        <span className="text-slate-500 font-bold">✕</span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
                          <span>হলুদ</span>
                        </span>
                      </div>
                    </div>

                    {/* Team 2: Blue + Green */}
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-950/40 via-slate-900/80 to-emerald-950/40 border border-blue-500/30">
                      <div className="font-bold text-[11px] text-sky-300 mb-1 flex items-center gap-1">
                        <span>🛡️</span>
                        <span>{t.team2Name}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
                          <span>নীল</span>
                        </span>
                        <span className="text-slate-500 font-bold">✕</span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                          <span>সবুজ</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-amber-300/90 bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20 leading-relaxed">
                    ✨ {t.teamNoCaptureRule}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
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
                      setMyColor(c);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? `bg-slate-800 border-white text-white ring-2 ${cfg.ring} shadow-md`
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${cfg.bg}`} />
                    <span>{lang === 'bn' ? cfg.nameBn : cfg.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* PWA Mobile App Download & Install Banner */}
        <PWAInstallButton lang={lang} variant="banner" />

        {/* Primary Start CTA Button */}
        <button
          onClick={handleStart}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-display font-extrabold text-base tracking-wide shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-slate-950" />
          <span>
            {mode === 'online' ? t.createRoom + ' / ' + t.joinRoom : t.startGame}
          </span>
        </button>
      </div>

      {/* Footer hint */}
      <div className="relative z-10 w-full max-w-4xl mx-auto py-2 text-center text-xs text-slate-500">
        <span>© 2026 Ps Ludo Master · {lang === 'bn' ? 'অফলাইন ও অনলাইন মাল্টিপ্লেয়ার' : 'Offline & Realtime Online Multiplayer'}</span>
      </div>
    </div>
  );
};
