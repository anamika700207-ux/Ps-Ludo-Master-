import React, { useEffect, useState } from 'react';
import { Language } from '../types/ludo';
import { sounds } from '../utils/soundEffects';
import { Sparkles, Play, FastForward } from 'lucide-react';

interface SplashScreenProps {
  durationSeconds?: number;
  onComplete: () => void;
  lang: Language;
  title?: string;
  subtitle?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  durationSeconds = 3.5,
  onComplete,
  lang,
  title,
  subtitle,
}) => {
  const [progress, setProgress] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(durationSeconds));
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Attempt to play intro chime
    sounds.playIntroChime();

    const intervalMs = 50;
    const totalSteps = (durationSeconds * 1000) / intervalMs;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const currentPct = Math.min(100, Math.round((step / totalSteps) * 100));
      setProgress(currentPct);

      const remainingSec = Math.max(0, Math.ceil(durationSeconds - (step * intervalMs) / 1000));
      setSecondsLeft(remainingSec);

      if (step >= totalSteps) {
        clearInterval(timer);
        handleFinish();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [durationSeconds]);

  const handleFinish = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 400); // 400ms fade transition
  };

  const handleSkip = () => {
    sounds.playClick();
    handleFinish();
  };

  const isBn = lang === 'bn';

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 bg-slate-950 transition-opacity duration-400 select-none overflow-hidden ${
        isFadingOut ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
        
        {/* Subtle decorative grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />
      </div>

      {/* Top Header / Channel Brand Tag */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/30 backdrop-blur-md shadow-lg shadow-amber-500/5">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-xs font-bold tracking-wider text-amber-300 uppercase">
            SharifToonix Presents
          </span>
        </div>

        {/* Skip button for immediate access */}
        <button
          onClick={handleSkip}
          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-slate-700 hover:border-amber-400 transition-all text-xs font-semibold shadow-md active:scale-95"
        >
          <span>{isBn ? 'স্কিপ করুন' : 'Skip'}</span>
          <FastForward className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Centerpiece: User's SharifToonix Image with Glowing Neon Frames */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        {/* Outer Radiant Gold Neon Rings */}
        <div className="relative group">
          {/* Pulsing Aura */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 opacity-60 blur-xl animate-pulse" />
          
          {/* Rotating Ring Indicator */}
          <div className="absolute -inset-2 rounded-full border-2 border-dashed border-amber-400/50 animate-spin" style={{ animationDuration: '20s' }} />

          {/* Image Container matching user's circular artwork */}
          <div className="relative w-64 h-64 sm:w-76 sm:h-76 md:w-88 md:h-88 rounded-full p-1 bg-gradient-to-b from-amber-300 via-amber-500 to-yellow-600 shadow-[0_0_50px_rgba(245,158,11,0.55)]">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 shadow-inner flex items-center justify-center">
              <img
                src="/assets/aistudio/1792946521939_99423c66.png"
                alt="Ps Ludo Master - Game Logo"
                className="w-full h-full object-contain transition-transform duration-700 hover:scale-105"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('public/')) {
                    target.src = '/public/assets/aistudio/1792946521939_99423c66.png';
                  }
                }}
              />
            </div>

            {/* Glowing Crown / Play badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 border border-amber-300 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-xl flex items-center gap-1.5 whitespace-nowrap">
              <span>👑</span>
              <span>{title || 'Ps Ludo Master'}</span>
            </div>
          </div>
        </div>

        {/* Studio & Game Subtitle */}
        <div className="mt-8 text-center max-w-sm">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-md">
            {subtitle || (isBn ? 'গেমে প্রবেশ করা হচ্ছে...' : 'Entering Game...')}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">
            {isBn
              ? 'কিছুক্ষণের মধ্যেই খেলা শুরু হতে যাচ্ছে'
              : 'The game will begin in just a moment'}
          </p>
        </div>
      </div>

      {/* Bottom Progress Bar & Countdown */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-3">
        {/* Progress Bar Container */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-full h-3 p-0.5 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status text & Countdown Badge */}
        <div className="w-full flex items-center justify-between text-xs text-slate-400 font-medium px-1">
          <span className="flex items-center gap-1.5 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
            {isBn ? `লোড হচ্ছে (${progress}%)` : `Loading (${progress}%)`}
          </span>

          <span className="font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {isBn ? `${secondsLeft} সেকেন্ড বাকি` : `${secondsLeft}s remaining`}
          </span>
        </div>

        {/* Direct Play Button */}
        <button
          onClick={handleSkip}
          className="mt-1 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isBn ? 'সরাসরি গেমে প্রবেশ করুন' : 'Enter Game Now'}</span>
        </button>
      </div>
    </div>
  );
};
