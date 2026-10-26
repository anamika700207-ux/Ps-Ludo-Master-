import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  CustomTrack,
  getAllCustomTracks,
  saveCustomTrack,
  deleteCustomTrack,
  clearAllCustomTracks,
  probeAudioDuration,
} from '../utils/customMusicDb';

export type RepeatMode = 'all' | 'one' | 'off';

export interface CustomMusicContextType {
  tracks: CustomTrack[];
  currentTrack: CustomTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  isLoading: boolean;
  error: string | null;

  // Player controls
  playTrack: (track: CustomTrack) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  playNext: () => void;
  playPrev: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;

  // File management
  addTracksFromFiles: (files: FileList | File[]) => Promise<number>;
  deleteTrackById: (id: string) => Promise<void>;
  clearPlaylist: () => Promise<void>;
}

const CustomMusicContext = createContext<CustomMusicContextType | null>(null);

export const CustomMusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<CustomTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<CustomTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem('ps_ludo_custom_music_vol');
    return saved !== null ? parseFloat(saved) : 0.85;
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(() => {
    return (localStorage.getItem('ps_ludo_custom_music_repeat') as RepeatMode) || 'all';
  });
  const [isShuffle, setIsShuffle] = useState<boolean>(() => {
    return localStorage.getItem('ps_ludo_custom_music_shuffle') === 'true';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentObjectUrlRef = useRef<string | null>(null);

  // Initialize Audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = volume;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setError(null);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      console.warn('Audio playback error:', audio.error);
      setIsPlaying(false);
      setError('Failed to play audio track.');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
      if (currentObjectUrlRef.current) {
        URL.revokeObjectURL(currentObjectUrlRef.current);
      }
    };
  }, []);

  // Sync volume & mute to audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Load existing tracks from IndexedDB on startup
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const storedTracks = await getAllCustomTracks();
        if (isMounted) {
          setTracks(storedTracks);
          // If there's a previously played track remembered in localStorage, prepare it
          const lastTrackId = localStorage.getItem('ps_ludo_last_played_track');
          if (lastTrackId) {
            const found = storedTracks.find((t) => t.id === lastTrackId);
            if (found) {
              setCurrentTrack(found);
              setDuration(found.duration || 0);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load custom tracks from IndexedDB:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Internal helper to load and play a track
  const loadAndPlayTrack = useCallback((track: CustomTrack, shouldPlay: boolean = true) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Revoke previous object URL
    if (currentObjectUrlRef.current) {
      URL.revokeObjectURL(currentObjectUrlRef.current);
      currentObjectUrlRef.current = null;
    }

    try {
      const url = URL.createObjectURL(track.blob);
      currentObjectUrlRef.current = url;
      audio.src = url;
      audio.currentTime = 0;
      setCurrentTrack(track);
      setDuration(track.duration || 0);
      setCurrentTime(0);
      localStorage.setItem('ps_ludo_last_played_track', track.id);

      if (shouldPlay) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setError(null);
            })
            .catch((err) => {
              console.warn('Auto-play prevented or interrupted:', err);
              setIsPlaying(false);
            });
        }
      }
    } catch (err) {
      console.error('Failed to create audio URL:', err);
      setError('Could not read track file.');
    }
  }, []);

  // Next Track logic
  const playNext = useCallback(() => {
    if (tracks.length === 0) return;

    if (repeatMode === 'one' && currentTrack) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        return;
      }
    }

    if (isShuffle && tracks.length > 1) {
      const otherTracks = tracks.filter((t) => t.id !== currentTrack?.id);
      const randomTrack = otherTracks[Math.floor(Math.random() * otherTracks.length)];
      loadAndPlayTrack(randomTrack, true);
      return;
    }

    const currentIndex = currentTrack ? tracks.findIndex((t) => t.id === currentTrack.id) : -1;
    let nextIndex = currentIndex + 1;

    if (nextIndex >= tracks.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        // Stop playback at end of playlist
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        return;
      }
    }

    loadAndPlayTrack(tracks[nextIndex], true);
  }, [tracks, currentTrack, repeatMode, isShuffle, loadAndPlayTrack]);

  // Previous Track logic
  const playPrev = useCallback(() => {
    if (tracks.length === 0) return;

    // If more than 3 seconds in, restart track
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const currentIndex = currentTrack ? tracks.findIndex((t) => t.id === currentTrack.id) : 0;
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = tracks.length - 1;
    }

    loadAndPlayTrack(tracks[prevIndex], true);
  }, [tracks, currentTrack, loadAndPlayTrack]);

  // Auto-advance on track end
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      playNext();
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playNext]);

  // Player Controls
  const playTrack = useCallback(
    (track: CustomTrack) => {
      loadAndPlayTrack(track, true);
    },
    [loadAndPlayTrack]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      if (!currentTrack && tracks.length > 0) {
        loadAndPlayTrack(tracks[0], true);
      } else if (currentTrack) {
        audio.play().catch((err) => {
          console.warn('Playback resume error:', err);
        });
      }
    }
  }, [isPlaying, currentTrack, tracks, loadAndPlayTrack]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.play().catch(() => {});
    }
  }, [currentTrack]);

  const seekTo = useCallback((seconds: number) => {
    if (audioRef.current && isFinite(seconds)) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    setIsMuted(false);
    localStorage.setItem('ps_ludo_custom_music_vol', clamped.toString());
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const handleSetRepeatMode = useCallback((mode: RepeatMode) => {
    setRepeatMode(mode);
    localStorage.setItem('ps_ludo_custom_music_repeat', mode);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => {
      const next = !prev;
      localStorage.setItem('ps_ludo_custom_music_shuffle', String(next));
      return next;
    });
  }, []);

  // Add Tracks from FileList or File array (from Gallery/Audio Folder)
  const addTracksFromFiles = useCallback(
    async (files: FileList | File[]): Promise<number> => {
      const fileArray = Array.from(files);
      const audioFiles = fileArray.filter(
        (f) =>
          f.type.startsWith('audio/') ||
          /\.(mp3|wav|ogg|m4a|aac|flac|wma|opus)$/i.test(f.name)
      );

      if (audioFiles.length === 0) return 0;

      let addedCount = 0;
      const newlyAddedTracks: CustomTrack[] = [];

      for (const file of audioFiles) {
        try {
          const duration = await probeAudioDuration(file);
          const track: CustomTrack = {
            id: 'track_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            name: file.name.replace(/\.[^/.]+$/, ''), // clean extension for clean title
            size: file.size,
            type: file.type || 'audio/mpeg',
            duration: duration || 0,
            addedAt: Date.now(),
            blob: file,
          };

          await saveCustomTrack(track);
          newlyAddedTracks.push(track);
          addedCount++;
        } catch (err) {
          console.error(`Failed to process audio file ${file.name}:`, err);
        }
      }

      if (newlyAddedTracks.length > 0) {
        setTracks((prev) => [...newlyAddedTracks, ...prev]);
        // If nothing was loaded or playing, load the first newly added track
        if (!currentTrack) {
          loadAndPlayTrack(newlyAddedTracks[0], false);
        }
      }

      return addedCount;
    },
    [currentTrack, loadAndPlayTrack]
  );

  // Delete Track by ID
  const deleteTrackById = useCallback(
    async (id: string) => {
      try {
        await deleteCustomTrack(id);

        const isCurrent = currentTrack?.id === id;
        const updatedTracks = tracks.filter((t) => t.id !== id);
        setTracks(updatedTracks);

        if (isCurrent) {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          if (updatedTracks.length > 0) {
            // Load next track without auto-playing if deleted
            loadAndPlayTrack(updatedTracks[0], isPlaying);
          } else {
            setCurrentTrack(null);
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
            localStorage.removeItem('ps_ludo_last_played_track');
            if (currentObjectUrlRef.current) {
              URL.revokeObjectURL(currentObjectUrlRef.current);
              currentObjectUrlRef.current = null;
            }
          }
        }
      } catch (err) {
        console.error('Failed to delete track:', err);
      }
    },
    [currentTrack, tracks, isPlaying, loadAndPlayTrack]
  );

  // Clear all tracks
  const clearPlaylist = useCallback(async () => {
    try {
      await clearAllCustomTracks();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setTracks([]);
      setCurrentTrack(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      localStorage.removeItem('ps_ludo_last_played_track');
      if (currentObjectUrlRef.current) {
        URL.revokeObjectURL(currentObjectUrlRef.current);
        currentObjectUrlRef.current = null;
      }
    } catch (err) {
      console.error('Failed to clear tracks:', err);
    }
  }, []);

  return (
    <CustomMusicContext.Provider
      value={{
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
        error,
        playTrack,
        togglePlay,
        pause,
        resume,
        playNext,
        playPrev,
        seekTo,
        setVolume,
        toggleMute,
        setRepeatMode: handleSetRepeatMode,
        toggleShuffle,
        addTracksFromFiles,
        deleteTrackById,
        clearPlaylist,
      }}
    >
      {children}
    </CustomMusicContext.Provider>
  );
};

export const useCustomMusic = (): CustomMusicContextType => {
  const context = useContext(CustomMusicContext);
  if (!context) {
    throw new Error('useCustomMusic must be used within a CustomMusicProvider');
  }
  return context;
};
