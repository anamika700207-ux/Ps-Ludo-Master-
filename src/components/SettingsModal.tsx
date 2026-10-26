import React from 'react';
import { ArrowLeft, Check, Moon, Sun, Sparkles, Volume2, Music, Smartphone, Layers, Eye } from 'lucide-react';
import { Language, AppTheme } from '../types/ludo';
import { TRANSLATIONS } from '../utils/ludoConstants';
import { sounds } from '../utils/soundEffects';
import { triggerHaptic } from '../utils/haptics';
import { CustomMusicSection } from './CustomMusicSection';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  bgmEnabled: boolean;
  setBgmEnabled: (enabled: boolean) => void;
  vibrationEnabled: boolean;
  setVibrationEnabled: (enabled: boolean) => void;
  bundleMove: boolean;
  setBundleMove: (enabled: boolean) => void;
  colorblindMode: boolean;
  setColorblindMode: (enabled: boolean) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  setLang,
  soundEnabled,
  setSoundEnabled,
  bgmEnabled,
  setBgmEnabled,
  vibrationEnabled,
  setVibrationEnabled,
  bundleMove,
  setBundleMove,
  colorblindMode,
  setColorblindMode,
  theme,
  setTheme,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];
  const isBn = lang === 'bn';

  const handleToggle = (
    current: boolean,
    setter: (val: boolean) => void,
    onAfterChange?: (next: boolean) => void
  ) => {
    const next = !current;
    setter(next);
    triggerHaptic('selection');
    sounds.playClick();
    if (onAfterChange) {
      onAfterChange(next);
    }
  };

  const handleSelectLanguage = (newLang: Language) => {
    if (lang === newLang) return;
    setLang(newLang);
    triggerHaptic('selection');
    sounds.playClick();
  };

  const handleSelectTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    triggerHaptic('selection');
    sounds.playClick();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200 p-0 sm:p-4 overflow-y-auto"
    >
      {/* Settings Container (Mobile Screen Layout directly matching user screenshot) */}
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] max-w-md bg-[#16112a] text-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-purple-900/30">
        
        {/* Top App Bar Header */}
        <div className="relative flex items-center justify-between px-5 py-4 border-b border-purple-950/60 bg-[#16112a] sticky top-0 z-20">
          <button
            onClick={() => {
              triggerHaptic('light');
              sounds.playClick();
              onClose();
            }}
            aria-label="Back"
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-purple-200 hover:text-white hover:bg-purple-900/30 transition active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h2
            id="settings-heading"
            className="font-extrabold text-lg sm:text-xl tracking-wider text-white uppercase text-center flex-1 font-display"
          >
            {isBn ? 'SETTINGS' : 'SETTINGS'}
          </h2>

          {/* Spacer to balance the back button */}
          <div className="w-10 h-10" />
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-6">
          
          {/* SECTION: SOUND & HAPTICS */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9b8bb4] px-1">
              SOUND & HAPTICS
            </h3>

            <div className="bg-[#241a3f] rounded-2xl p-4 sm:p-5 space-y-5 border border-purple-900/20 shadow-inner">
              {/* Sound Effects */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-950/60 text-purple-300 mt-0.5">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-semibold text-white">
                      {isBn ? 'Sound Effects' : 'Sound Effects'}
                    </div>
                    <div className="text-xs text-[#a594c2]">
                      {isBn ? 'Play sound effects (শব্দ ইফেক্ট)' : 'Play sound effects'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={soundEnabled}
                  onClick={() =>
                    handleToggle(soundEnabled, setSoundEnabled, (val) => {
                      sounds.setSoundEnabled(val);
                    })
                  }
                  className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                    soundEnabled ? 'bg-[#9476f7]' : 'bg-[#3b2d5b]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Music */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-purple-900/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-950/60 text-purple-300 mt-0.5">
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-semibold text-white">
                      {isBn ? 'Music' : 'Music'}
                    </div>
                    <div className="text-xs text-[#a594c2]">
                      {isBn ? 'Play background music (মিউজিক)' : 'Play background music'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={bgmEnabled}
                  onClick={() =>
                    handleToggle(bgmEnabled, setBgmEnabled, (val) => {
                      sounds.setBgmEnabled(val);
                    })
                  }
                  className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                    bgmEnabled ? 'bg-[#9476f7]' : 'bg-[#3b2d5b]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      bgmEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Haptic Feedback */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-purple-900/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-950/60 text-purple-300 mt-0.5">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-semibold text-white">
                      {isBn ? 'Haptic Feedback' : 'Haptic Feedback'}
                    </div>
                    <div className="text-xs text-[#a594c2]">
                      {isBn ? 'Vibrate on interactions (ভাইব্রেশন)' : 'Vibrate on interactions'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={vibrationEnabled}
                  onClick={() => handleToggle(vibrationEnabled, setVibrationEnabled)}
                  className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                    vibrationEnabled ? 'bg-[#9476f7]' : 'bg-[#3b2d5b]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      vibrationEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* SECTION: CUSTOM MUSIC (গান ও অডিও ফোল্ডার থেকে কাস্টম মিউজিক) */}
          <CustomMusicSection lang={lang} />

          {/* SECTION: LANGUAGE (বাংলা ও ইংরেজি ভাষা) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9b8bb4] px-1">
              LANGUAGE / ভাষা
            </h3>

            <div className="bg-[#241a3f] rounded-2xl p-2 border border-purple-900/20 shadow-inner grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectLanguage('bn')}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition ${
                  lang === 'bn'
                    ? 'bg-[#34265a] text-white border border-[#9476f7]/60 shadow'
                    : 'text-[#a594c2] hover:bg-purple-900/20 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🇧🇩</span>
                  <div className="text-left">
                    <div className="text-sm font-bold">বাংলা</div>
                    <div className="text-[10px] text-purple-300/70">Bengali</div>
                  </div>
                </div>
                {lang === 'bn' && <Check className="w-4 h-4 text-[#9476f7]" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectLanguage('en')}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition ${
                  lang === 'en'
                    ? 'bg-[#34265a] text-white border border-[#9476f7]/60 shadow'
                    : 'text-[#a594c2] hover:bg-purple-900/20 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🇬🇧</span>
                  <div className="text-left">
                    <div className="text-sm font-bold">English</div>
                    <div className="text-[10px] text-purple-300/70">ইংরেজি</div>
                  </div>
                </div>
                {lang === 'en' && <Check className="w-4 h-4 text-[#9476f7]" />}
              </button>
            </div>
          </div>

          {/* SECTION: GAMEPLAY */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9b8bb4] px-1">
              GAMEPLAY
            </h3>

            <div className="bg-[#241a3f] rounded-2xl p-4 sm:p-5 space-y-5 border border-purple-900/20 shadow-inner">
              {/* Bundle Move */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-950/60 text-purple-300 mt-0.5">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-semibold text-white">
                      {isBn ? 'Bundle Move' : 'Bundle Move'}
                    </div>
                    <div className="text-xs text-[#a594c2]">
                      {isBn ? 'Move multiple balls at once' : 'Move multiple balls at once'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={bundleMove}
                  onClick={() => handleToggle(bundleMove, setBundleMove)}
                  className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                    bundleMove ? 'bg-[#9476f7]' : 'bg-[#3b2d5b]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      bundleMove ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Colorblind Mode */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-purple-900/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-950/60 text-purple-300 mt-0.5">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-semibold text-white">
                      {isBn ? 'Colorblind Mode' : 'Colorblind Mode'}
                    </div>
                    <div className="text-xs text-[#a594c2]">
                      {isBn ? 'Add patterns to balls' : 'Add patterns to balls'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={colorblindMode}
                  onClick={() => handleToggle(colorblindMode, setColorblindMode)}
                  className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                    colorblindMode ? 'bg-[#9476f7]' : 'bg-[#3b2d5b]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      colorblindMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* SECTION: THEME */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9b8bb4] px-1">
              THEME
            </h3>

            <div className="bg-[#241a3f] rounded-2xl p-2 border border-purple-900/20 shadow-inner space-y-1">
              {/* Option 1: Night (Dark) */}
              <button
                type="button"
                onClick={() => handleSelectTheme('night')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition ${
                  theme === 'night'
                    ? 'bg-[#34265a] text-white border border-[#9476f7]/50 shadow'
                    : 'text-[#d5cae9] hover:bg-purple-900/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Theme swatch circle */}
                  <div className="w-7 h-7 rounded-full bg-[#18122d] border-2 border-purple-400/40 shadow-inner flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#9476f7]" />
                  </div>
                  <span className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <span>🌙</span>
                    <span>Night</span>
                    <span className="text-xs text-purple-300/60 font-normal">
                      ({isBn ? 'ডার্ক থিম' : 'Dark Theme'})
                    </span>
                  </span>
                </div>

                {theme === 'night' && <Check className="w-5 h-5 text-[#9476f7]" />}
              </button>

              {/* Option 2: Light */}
              <button
                type="button"
                onClick={() => handleSelectTheme('light')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition ${
                  theme === 'light'
                    ? 'bg-[#34265a] text-white border border-[#9476f7]/50 shadow'
                    : 'text-[#d5cae9] hover:bg-purple-900/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Theme swatch circle */}
                  <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-amber-400 shadow-inner flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  </div>
                  <span className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <span>☀️</span>
                    <span>Light</span>
                    <span className="text-xs text-purple-300/60 font-normal">
                      ({isBn ? 'লাইট থিম' : 'Day / Light'})
                    </span>
                  </span>
                </div>

                {theme === 'light' && <Check className="w-5 h-5 text-[#9476f7]" />}
              </button>

              {/* Option 3: Neon */}
              <button
                type="button"
                onClick={() => handleSelectTheme('neon')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition ${
                  theme === 'neon'
                    ? 'bg-[#34265a] text-white border border-[#9476f7]/50 shadow'
                    : 'text-[#d5cae9] hover:bg-purple-900/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Theme swatch circle */}
                  <div className="w-7 h-7 rounded-full bg-[#050714] border-2 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_6px_rgba(236,72,153,0.8)]" />
                  </div>
                  <span className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <span>🌈</span>
                    <span>Neon</span>
                    <span className="text-xs text-purple-300/60 font-normal">
                      ({isBn ? 'সাইবার নিয়ন' : 'Cyber Neon'})
                    </span>
                  </span>
                </div>

                {theme === 'neon' && <Check className="w-5 h-5 text-[#9476f7]" />}
              </button>
            </div>
          </div>

          {/* Bottom Info note */}
          <div className="text-center pt-2 pb-4 text-[11px] text-[#8675a3]">
            Ps Ludo Master v2.4 • Settings are auto-saved
          </div>
        </div>
      </div>
    </div>
  );
};
