import React, { useRef, useState } from 'react';
import {
  Music,
  Plus,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Trash2,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  Disc,
  FileAudio,
  Sparkles,
  Info,
} from 'lucide-react';
import { useCustomMusic, RepeatMode } from '../context/CustomMusicContext';
import { formatBytes, formatDuration } from '../utils/customMusicDb';
import { Language } from '../types/ludo';
import { triggerHaptic } from '../utils/haptics';
import { sounds } from '../utils/soundEffects';

interface CustomMusicSectionProps {
  lang: Language;
}

export const CustomMusicSection: React.FC<CustomMusicSectionProps> = ({ lang }) => {
  const {
    tracks,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
    isLoading,
    playTrack,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    setVolume,
    toggleMute,
    setRepeatMode,
    toggleShuffle,
    addTracksFromFiles,
    deleteTrackById,
    clearPlaylist,
  } = useCustomMusic();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState<boolean>(false);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null);

  const isBn = lang === 'bn';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      triggerHaptic('medium');
      sounds.playClick();

      const added = await addTracksFromFiles(files);
      if (added > 0) {
        triggerHaptic('success');
        sounds.playSafeChime();
        setUploadSuccessMessage(
          isBn ? `${added}টি গান সফলভাবে যোগ করা হয়েছে!` : `${added} songs added successfully!`
        );
        setTimeout(() => setUploadSuccessMessage(null), 3500);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      // Reset input value so same files can be re-selected if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCycleRepeat = () => {
    triggerHaptic('selection');
    sounds.playClick();
    if (repeatMode === 'all') setRepeatMode('one');
    else if (repeatMode === 'one') setRepeatMode('off');
    else setRepeatMode('all');
  };

  const handleDirectDelete = async (id: string, name: string) => {
    try {
      triggerHaptic('medium');
      sounds.playCaptureSmash();
      await deleteTrackById(id);
      setConfirmDeleteId(null);
      setDeleteSuccessMessage(
        isBn ? `"${name}" গানটি সফলভাবে ডিলিট করা হয়েছে!` : `"${name}" deleted successfully!`
      );
      setTimeout(() => setDeleteSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleConfirmClearAll = async () => {
    try {
      triggerHaptic('medium');
      sounds.playCaptureSmash();
      await clearPlaylist();
      setConfirmClearAll(false);
      setDeleteSuccessMessage(isBn ? 'সকল গান সফলভাবে মুছে ফেলা হয়েছে!' : 'All songs cleared!');
      setTimeout(() => setDeleteSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Clear all error:', err);
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-pink-300">
              {isBn ? 'CUSTOM MUSIC & SONGS' : 'CUSTOM MUSIC & SONGS'}
            </h3>
            <p className="text-[11px] text-[#9b8bb4]">
              {isBn
                ? 'গ্যালারি বা অডিও ফোল্ডার থেকে নিজের গান শুনুন'
                : 'Play your own songs from device gallery or folder'}
            </p>
          </div>
        </div>

        {tracks.length > 0 && (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 font-semibold">
            {tracks.length} {isBn ? 'গান' : 'tracks'}
          </span>
        )}
      </div>

      {/* Main Container */}
      <div className="bg-[#241a3f] rounded-2xl p-4 sm:p-5 border border-purple-900/30 shadow-inner space-y-4">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Add Songs / Upload Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              sounds.playClick();
              fileInputRef.current?.click();
            }}
            disabled={isUploading}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-pink-600/25 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Disc className="w-4 h-4 animate-spin text-amber-300" />
                <span>{isBn ? 'গান যোগ করা হচ্ছে...' : 'Adding audio files...'}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-white" />
                <FileAudio className="w-4 h-4 text-pink-200" />
                <span>
                  {isBn ? 'গ্যালারি / অডিও থেকে গান যোগ করুন' : 'Add Songs from Device / Gallery'}
                </span>
              </>
            )}
          </button>

          {tracks.length > 0 && (
            confirmClearAll ? (
              <div className="flex items-center gap-1 shrink-0 animate-in fade-in duration-150">
                <button
                  type="button"
                  onClick={handleConfirmClearAll}
                  className="px-2.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition active:scale-95 shadow-md animate-pulse"
                >
                  {isBn ? 'নিশ্চিত?' : 'Confirm?'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(false)}
                  className="px-2 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:text-white"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  sounds.playClick();
                  setConfirmClearAll(true);
                }}
                title={isBn ? 'সব গান মুছুন' : 'Clear All Songs'}
                className="px-3 py-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-semibold transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">{isBn ? 'সব মুছুন' : 'Clear'}</span>
              </button>
            )
          )}
        </div>

        {/* Upload Success Alert Banner */}
        {uploadSuccessMessage && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs animate-in fade-in slide-in-from-top-1">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-spin" />
            <span className="font-semibold">{uploadSuccessMessage}</span>
          </div>
        )}

        {/* Delete Success Alert Banner */}
        {deleteSuccessMessage && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs animate-in fade-in slide-in-from-top-1">
            <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold">{deleteSuccessMessage}</span>
          </div>
        )}

        {/* In-Game Playback Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-950/60 border border-purple-500/25 text-[11px] text-purple-200/90 leading-relaxed">
          <Info className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
          <span>
            {isBn
              ? 'এখানে গান চালু রাখলে আপনি যখন ম্যাচ খেলবেন, তখনও ব্যাকগ্রাউন্ডে আপনার পছন্দের গানটি বাজতে থাকবে।'
              : 'Songs played here will seamlessly continue in the background while playing your Ludo matches.'}
          </span>
        </div>

        {/* Embedded Music Player Controls (if there is an active track or tracks exist) */}
        {tracks.length > 0 && (
          <div className="bg-[#1b1432] rounded-xl p-3.5 border border-purple-800/30 shadow-md space-y-3">
            {/* Now Playing Title & Equalizer Animation */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`relative w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-pink-500/40 shadow-inner ${
                    isPlaying
                      ? 'bg-gradient-to-tr from-pink-600 to-indigo-600 animate-spin'
                      : 'bg-purple-900/60'
                  }`}
                  style={{ animationDuration: '4s' }}
                >
                  <Disc className="w-5 h-5 text-white" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-black tracking-wider text-pink-400">
                      {isPlaying
                        ? isBn
                          ? 'এখন বাজছে'
                          : 'NOW PLAYING'
                        : isBn
                        ? 'প্লেলিস্ট'
                        : 'PLAYLIST'}
                    </span>
                    {isPlaying && (
                      <span className="flex items-end gap-0.5 h-3">
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
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white truncate max-w-[220px] sm:max-w-xs">
                    {currentTrack?.name || (isBn ? 'একটি গান নির্বাচন করুন' : 'Select a track')}
                  </div>
                </div>
              </div>

              {/* Time display */}
              <div className="text-[11px] font-mono font-medium text-purple-300/80 shrink-0 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/40">
                {formatDuration(currentTime)} / {formatDuration(duration || currentTrack?.duration || 0)}
              </div>
            </div>

            {/* Scrub / Progress Bar */}
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.5}
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                aria-label="Seek time"
                className="w-full h-1.5 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-pink-500 transition-all hover:h-2"
              />
            </div>

            {/* Control Buttons Bar */}
            <div className="flex items-center justify-between pt-1">
              {/* Shuffle button */}
              <button
                type="button"
                onClick={toggleShuffle}
                title={isBn ? 'শাফল' : 'Shuffle'}
                className={`p-2 rounded-lg transition active:scale-95 ${
                  isShuffle
                    ? 'bg-pink-600/30 text-pink-400 border border-pink-500/40'
                    : 'text-purple-400 hover:text-white hover:bg-purple-900/30'
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Previous Track */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  sounds.playClick();
                  playPrev();
                }}
                title={isBn ? 'আগের গান' : 'Previous Track'}
                className="p-2 rounded-lg text-purple-200 hover:text-white hover:bg-purple-900/40 transition active:scale-95"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Play / Pause button */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  sounds.playClick();
                  togglePlay();
                }}
                title={isPlaying ? (isBn ? 'পজ' : 'Pause') : isBn ? 'প্লে' : 'Play'}
                className="w-11 h-11 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-white shadow-lg shadow-pink-500/30 flex items-center justify-center transition-transform active:scale-90 hover:scale-105"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Next Track */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  sounds.playClick();
                  playNext();
                }}
                title={isBn ? 'পরবর্তী গান' : 'Next Track'}
                className="p-2 rounded-lg text-purple-200 hover:text-white hover:bg-purple-900/40 transition active:scale-95"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Repeat Mode */}
              <button
                type="button"
                onClick={handleCycleRepeat}
                title={
                  repeatMode === 'all'
                    ? isBn
                      ? 'সব গান রিপিট'
                      : 'Repeat All'
                    : repeatMode === 'one'
                    ? isBn
                      ? 'একটি গান রিপিট'
                      : 'Repeat One'
                    : isBn
                    ? 'রিপিট বন্ধ'
                    : 'Repeat Off'
                }
                className={`p-2 rounded-lg transition active:scale-95 ${
                  repeatMode !== 'off'
                    ? 'bg-pink-600/30 text-pink-400 border border-pink-500/40'
                    : 'text-purple-400 hover:text-white hover:bg-purple-900/30'
                }`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Volume Slider Row */}
            <div className="flex items-center gap-2 pt-1 px-1 border-t border-purple-900/40">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  sounds.playClick();
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

        {/* Playlist Items List */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#9b8bb4] px-1">
            <span>{isBn ? 'যোগ করা গানের তালিকা' : 'Saved Song List'}</span>
            <span>
              {tracks.length} {isBn ? 'গান' : 'tracks'}
            </span>
          </div>

          {tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center rounded-xl border border-dashed border-purple-900/40 bg-purple-950/20">
              <Disc className="w-8 h-8 text-purple-400/40 mb-2 animate-pulse" />
              <div className="text-xs font-semibold text-purple-200">
                {isBn ? 'কোনো গান যোগ করা হয়নি' : 'No custom music added yet'}
              </div>
              <p className="text-[11px] text-purple-300/60 mt-1 max-w-xs">
                {isBn
                  ? 'উপরের "গান যোগ করুন" বাটনে ক্লিক করে আপনার মোবাইল বা কম্পিউটারের যে কোনো গান সিলেক্ট করুন।'
                  : 'Click "Add Songs" above to import audio files from your gallery or music folder.'}
              </p>
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {tracks.map((track, idx) => {
                const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                const isThisCurrent = currentTrack?.id === track.id;

                return (
                  <div
                    key={track.id}
                    className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl border transition-all ${
                      isThisCurrent
                        ? 'bg-purple-900/40 border-pink-500/50 text-white shadow-sm'
                        : 'bg-purple-950/30 border-purple-900/30 text-purple-200 hover:bg-purple-900/20 hover:text-white'
                    }`}
                  >
                    {/* Play/Index Button */}
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        sounds.playClick();
                        if (isThisCurrent) {
                          togglePlay();
                        } else {
                          playTrack(track);
                        }
                      }}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${
                        isThisPlaying
                          ? 'bg-pink-500 text-white shadow-md shadow-pink-500/40'
                          : isThisCurrent
                          ? 'bg-purple-700 text-white'
                          : 'bg-purple-900/50 text-purple-300 hover:bg-pink-600 hover:text-white'
                      }`}
                    >
                      {isThisPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>

                    {/* Track info */}
                    <div
                      onClick={() => {
                        triggerHaptic('selection');
                        sounds.playClick();
                        if (isThisCurrent) togglePlay();
                        else playTrack(track);
                      }}
                      className="flex-1 min-w-0 cursor-pointer text-left"
                    >
                      <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                        <span className="truncate">{track.name}</span>
                        {isThisPlaying && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 font-mono shrink-0">
                            PLAYING
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-purple-300/60 flex items-center gap-2 mt-0.5">
                        <span>{formatBytes(track.size)}</span>
                        {track.duration ? (
                          <>
                            <span>•</span>
                            <span>{formatDuration(track.duration)}</span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    {/* Delete button with in-UI confirmation */}
                    {confirmDeleteId === track.id ? (
                      <div className="flex items-center gap-1 shrink-0 animate-in fade-in duration-150">
                        <button
                          type="button"
                          onClick={() => handleDirectDelete(track.id, track.name)}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold shadow-md active:scale-95 transition"
                        >
                          {isBn ? 'মুছুন' : 'Delete'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="p-1 text-slate-400 hover:text-white text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          sounds.playClick();
                          setConfirmDeleteId(track.id);
                        }}
                        title={isBn ? 'গানটি মুছে ফেলুন' : 'Delete song'}
                        className="p-1.5 rounded-lg text-red-400/80 hover:text-red-300 hover:bg-red-950/60 transition active:scale-95 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
