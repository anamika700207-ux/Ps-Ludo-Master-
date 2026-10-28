import React, { useState } from 'react';
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Disc,
  ChevronDown,
  ChevronUp,
  Settings,
  Plus,
} from 'lucide-react';
import { useCustomMusic } from '../context/CustomMusicContext';
import { formatDuration } from '../utils/customMusicDb';
import { Language } from '../types/ludo';
import { triggerHaptic } from '../utils/haptics';
import { sounds } from '../utils/soundEffects';

interface InGameMusicWidgetProps {
  lang: Language;
  onOpenSettings: () => void;
  fullWidth?: boolean;
  className?: string;
}

export const InGameMusicWidget: React.FC<InGameMusicWidgetProps> = ({
  lang,
  onOpenSettings,
  fullWidth = false,
  className = '',
}) => {
  const {
    tracks,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    setVolume,
    toggleMute,
  } = useCustomMusic();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const isBn = lang === 'bn';

  // If no tracks exist and not expanded, we provide a quick music button
  if (tracks.length === 0) {
    return (
      <div className={`relative z-30 ${fullWidth ? 'flex-1 min-w-0' : ''} ${className}`}>
        <button
          onClick={() => {
            triggerHaptic('light');
            sounds.playClick();
            onOpenSettings();
          }}
          title={isBn ? 'গান যোগ করুন' : 'Add Custom Music'}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-purple-500/40 text-purple-300 hover:text-white hover:bg-purple-900/60 transition shadow text-xs font-semibold backdrop-blur-md active:scale-95 ${
            fullWidth ? 'w-full justify-center' : ''
          }`}
        >
          <Music className="w-3.5 h-3.5 text-pink-400" />
          <span>{isBn ? 'গান শুনুন / যোগ করুন' : 'Music Player / Add Songs'}</span>
          <Plus className="w-3 h-3 text-pink-300" />
        </button>
      </div>
    );
  }

  return (
    <div className={`relative z-30 ${fullWidth ? 'flex-1 min-w-0' : ''} ${className}`}>
      {/* Compact Mini Pill Widget */}
      <div
        className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-slate-950/90 border border-pink-500/40 text-white shadow-lg backdrop-blur-md transition-all ${
          fullWidth ? 'w-full justify-between' : ''
        }`}
      >
        {/* Animated Disc / Equalizer Indicator */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setIsExpanded((prev) => !prev);
          }}
          className={`flex items-center gap-1.5 group cursor-pointer focus:outline-none ${
            fullWidth ? 'flex-1 min-w-0 pr-1.5' : ''
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
              isPlaying
                ? 'bg-gradient-to-tr from-pink-500 to-indigo-500 animate-spin'
                : 'bg-purple-900/80'
            }`}
            style={{ animationDuration: '3s' }}
          >
            <Disc className="w-3.5 h-3.5 text-white" />
          </div>

          {isPlaying && (
            <span className="hidden sm:flex items-end gap-0.5 h-2.5 shrink-0">
              <span className="w-0.5 h-full bg-pink-400 rounded-full animate-bounce" />
              <span
                className="w-0.5 h-2/3 bg-pink-400 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-0.5 h-4/5 bg-pink-400 rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </span>
          )}

          {/* Current track title */}
          <span
            className={`text-[11px] font-semibold text-pink-200 truncate ${
              fullWidth ? 'flex-1 min-w-0 text-left' : 'max-w-[90px] sm:max-w-[130px]'
            }`}
          >
            {currentTrack?.name || (isBn ? 'গান শুনুন' : 'Music')}
          </span>
        </button>

        {/* Mini Play / Pause */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            sounds.playClick();
            togglePlay();
          }}
          title={isPlaying ? (isBn ? 'পজ' : 'Pause') : isBn ? 'প্লে' : 'Play'}
          className="w-6 h-6 rounded-full bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center transition active:scale-90 shadow-sm shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-3 h-3 fill-current" />
          ) : (
            <Play className="w-3 h-3 fill-current ml-0.5" />
          )}
        </button>

        {/* Mini Next Track */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('selection');
            sounds.playClick();
            playNext();
          }}
          title={isBn ? 'পরের গান' : 'Next Track'}
          className="p-1 text-purple-300 hover:text-white transition active:scale-95 shrink-0"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        {/* Expand / Minimize Toggle */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setIsExpanded((prev) => !prev);
          }}
          title={isExpanded ? 'Minimize' : 'Expand'}
          className="p-1 text-purple-400 hover:text-white transition shrink-0"
        >
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Floating Mini Player Dropdown */}
      {isExpanded && (
        <div
          className={`absolute top-full mt-2 w-72 sm:w-80 p-3.5 rounded-2xl bg-[#1b1432]/95 border border-purple-700/50 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 text-white z-50 ${
            fullWidth ? 'left-1/2 -translate-x-1/2' : 'right-0'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-purple-900/50">
            <div className="flex items-center gap-1.5">
              <Music className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-bold text-pink-300 uppercase tracking-wider">
                {isBn ? 'কাস্টম মিউজিক প্লেয়ার' : 'Custom Music Player'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsExpanded(false);
                onOpenSettings();
              }}
              className="text-[11px] text-purple-300 hover:text-white flex items-center gap-1 transition px-2 py-0.5 rounded bg-purple-900/40 hover:bg-purple-900/70"
            >
              <Settings className="w-3 h-3" />
              <span>{isBn ? 'প্লেলিস্ট' : 'Playlist'}</span>
            </button>
          </div>

          {/* Track Name */}
          <div className="py-2.5">
            <div className="text-xs font-bold text-white truncate">
              {currentTrack?.name || (isBn ? 'কোনো গান সিলেক্ট করা নেই' : 'No track selected')}
            </div>
            <div className="text-[10px] text-purple-300/70 font-mono mt-0.5 flex justify-between">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration || currentTrack?.duration || 0)}</span>
            </div>

            {/* Seek Bar */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              aria-label="Seek time"
              className="w-full h-1.5 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-pink-500 mt-1"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 py-1">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                sounds.playClick();
                playPrev();
              }}
              title={isBn ? 'আগের গান' : 'Previous'}
              className="p-2 rounded-full text-purple-300 hover:text-white hover:bg-purple-900/40 transition active:scale-95"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                sounds.playClick();
                togglePlay();
              }}
              title={isPlaying ? 'Pause' : 'Play'}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 transition active:scale-90"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                sounds.playClick();
                playNext();
              }}
              title={isBn ? 'পরের গান' : 'Next'}
              className="p-2 rounded-full text-purple-300 hover:text-white hover:bg-purple-900/40 transition active:scale-95"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 pt-2 border-t border-purple-900/40 mt-1">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                toggleMute();
              }}
              className="text-purple-300 hover:text-white transition"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-pink-400" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Volume"
              className="w-full h-1 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <span className="text-[10px] text-purple-300/70 font-mono w-7 text-right">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
