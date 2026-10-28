/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PlayerColor,
  Token,
  Player,
  GameMode,
  GameScreen,
  Language,
  AppTheme,
  QuickReaction,
  OnlineRoomState,
  HoppingTokenInfo,
  TeamId,
  CareerStats,
  MatchRecord,
  SavedGameState,
} from './types/ludo';
import {
  COLOR_CONFIG,
  TRANSLATIONS,
  COLOR_START_INDEX,
  SAFE_TRACK_INDICES,
  getTeamIdForColor,
  getTeammateColor,
  isSameTeam,
  TEAM_CONFIG,
  isSafePosition,
} from './utils/ludoConstants';
import { sounds } from './utils/soundEffects';
import { getMovableTokenIds, pickBestBotMove } from './utils/botAi';
import { LudoBoard } from './components/LudoBoard';
import { PlayerBox } from './components/PlayerBox';
import { DiceRoller } from './components/DiceRoller';
import { PlayerHUD } from './components/PlayerHUD';
import { TitleScreen } from './components/TitleScreen';
import { OnlineLobbyModal } from './components/OnlineLobbyModal';
import { QuickChatBar } from './components/QuickChatBar';
import { VictoryModal } from './components/VictoryModal';
import { RulesModal } from './components/RulesModal';
import { CareerStatsModal } from './components/CareerStatsModal';
import { SplashScreen } from './components/SplashScreen';
import { OnlineNoticeModal } from './components/OnlineNoticeModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { SettingsModal } from './components/SettingsModal';
import { InGameMusicWidget } from './components/InGameMusicWidget';
import { useCustomMusic } from './context/CustomMusicContext';
import { triggerHaptic, setHapticsEnabled } from './utils/haptics';
import {
  BookOpen,
  ArrowLeft,
  Users,
  Bot as BotIcon,
  Globe,
  RotateCcw,
  Settings,
} from 'lucide-react';

export default function App() {
  const { isPlaying: isCustomMusicPlaying } = useCustomMusic();

  // App Navigation & Setup
  const [screen, setScreen] = useState<GameScreen>('TITLE_MENU');
  const [mode, setMode] = useState<GameMode>('offline_bot');
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(4);
  const [isTeamMode, setIsTeamMode] = useState<boolean>(true); // Default to 2v2 team mode when 4 players selected
  const [activeMovableColor, setActiveMovableColor] = useState<PlayerColor | null>(null);
  const [winningTeamId, setWinningTeamId] = useState<TeamId | null>(null);
  const [myColor, setMyColor] = useState<PlayerColor>('blue');
  const [playerName, setPlayerName] = useState('Player 1');
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('ps_ludo_lang_v1');
      if (saved === 'bn' || saved === 'en') return saved;
    } catch {}
    return 'en';
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('ludo_bgm_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [isOnlineNoticeOpen, setIsOnlineNoticeOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExitConfirmModalOpen, setIsExitConfirmModalOpen] = useState(false);

  // Mobile Settings: Vibration, Bundle Move, Colorblind, and Theme
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ps_ludo_vibration_v1');
      return saved !== null ? saved === 'true' : true;
    } catch {}
    return true;
  });
  const [bundleMove, setBundleMove] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ps_ludo_bundle_move');
      return saved !== null ? saved === 'true' : true;
    } catch {}
    return true;
  });
  const [colorblindMode, setColorblindMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ps_ludo_colorblind');
      return saved === 'true';
    } catch {}
    return false;
  });
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('ps_ludo_theme_v1');
      if (saved === 'night' || saved === 'light' || saved === 'neon') return saved;
    } catch {}
    return 'night';
  });

  const handleSetLang = useCallback((newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem('ps_ludo_lang_v1', newLang);
    } catch {}
  }, []);

  const handleSetTheme = useCallback((newTheme: AppTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('ps_ludo_theme_v1', newTheme);
    } catch {}
  }, []);

  const handleSetVibration = useCallback((enabled: boolean) => {
    setVibrationEnabled(enabled);
    setHapticsEnabled(enabled);
  }, []);

  const handleSetBundleMove = useCallback((enabled: boolean) => {
    setBundleMove(enabled);
    try {
      localStorage.setItem('ps_ludo_bundle_move', String(enabled));
    } catch {}
  }, []);

  const handleSetColorblindMode = useCallback((enabled: boolean) => {
    setColorblindMode(enabled);
    try {
      localStorage.setItem('ps_ludo_colorblind', String(enabled));
    } catch {}
  }, []);

  // Career Stats & Match History (User requirement 3: Saved on phone/localStorage)
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [careerStats, setCareerStats] = useState<CareerStats>(() => {
    try {
      const raw = localStorage.getItem('ps_ludo_career_stats_v1');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      totalCaptures: 0,
    };
  });

  // Current Match Statistics (User requirement 1: Moves & Captures)
  const [totalMoves, setTotalMoves] = useState(0);
  const [totalCaptures, setTotalCaptures] = useState(0);
  const [playerMoves, setPlayerMoves] = useState<Record<PlayerColor, number>>({
    red: 0,
    green: 0,
    yellow: 0,
    blue: 0,
  });
  const [playerCaptures, setPlayerCaptures] = useState<Record<PlayerColor, number>>({
    red: 0,
    green: 0,
    yellow: 0,
    blue: 0,
  });

  // Check saved game presence on screen change or initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ps_ludo_saved_game_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.players) && parsed.players.length > 0) {
          setHasSavedGame(true);
          return;
        }
      }
    } catch {}
    setHasSavedGame(false);
  }, [screen]);

  // Toggle Background Music
  const handleToggleBgm = useCallback(() => {
    const next = !bgmEnabled;
    setBgmEnabled(next);
    localStorage.setItem('ludo_bgm_enabled', String(next));
    sounds.setBgmEnabled(next);
    if (next && screen === 'PLAYING') {
      sounds.startBgm();
    } else if (!next) {
      sounds.stopBgm();
    }
  }, [bgmEnabled, screen]);

  // Toggle Sound Effects & Master Audio
  const handleToggleSound = useCallback(() => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setSoundEnabled(next);
    if (!next) {
      sounds.stopBgm();
    } else if (bgmEnabled && screen === 'PLAYING') {
      sounds.startBgm();
    }
  }, [soundEnabled, bgmEnabled, screen]);

  // Splash Screen State (Cinematic 3-Second Intro on App Entry & Game Start)
  const [isSplashActive, setIsSplashActive] = useState(true);
  const [splashConfig, setSplashConfig] = useState<{
    durationSeconds: number;
    title?: string;
    subtitle?: string;
    onFinishCallback?: () => void;
  }>({
    durationSeconds: 3,
    title: 'Ps Ludo Master',
    subtitle: 'Loading Ps Ludo Master...',
    onFinishCallback: () => setScreen('TITLE_MENU'),
  });

  // Offline Game State
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentTurnColor, setCurrentTurnColor] = useState<PlayerColor>('red');
  const [turnOrder, setTurnOrder] = useState<PlayerColor[]>([]);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [consecutiveSixes, setConsecutiveSixes] = useState(0);
  const [movableTokenIds, setMovableTokenIds] = useState<number[]>([]);
  const [winners, setWinners] = useState<PlayerColor[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [hoppingInfo, setHoppingInfo] = useState<HoppingTokenInfo | null>(null);
  const [isAnimatingMove, setIsAnimatingMove] = useState(false);

  // User requirement 2: Auto-save match state to localStorage
  const saveCurrentMatchState = useCallback(() => {
    if (mode === 'online' || players.length === 0) return;
    try {
      const stateToSave: SavedGameState = {
        players,
        turnOrder,
        currentTurnColor,
        activeMovableColor,
        diceValue,
        hasRolled,
        consecutiveSixes,
        movableTokenIds,
        playerCount,
        mode,
        isTeamMode,
        winningTeamId,
        myColor,
        playerName,
        winners,
        statusMessage,
        totalMoves,
        totalCaptures,
        playerMoves,
        playerCaptures,
        savedAt: Date.now(),
      };
      localStorage.setItem('ps_ludo_saved_game_v1', JSON.stringify(stateToSave));
      setHasSavedGame(true);
    } catch (err) {
      console.warn('Failed to save game state:', err);
    }
  }, [
    mode,
    players,
    turnOrder,
    currentTurnColor,
    activeMovableColor,
    diceValue,
    hasRolled,
    consecutiveSixes,
    movableTokenIds,
    playerCount,
    isTeamMode,
    winningTeamId,
    myColor,
    playerName,
    winners,
    statusMessage,
    totalMoves,
    totalCaptures,
    playerMoves,
    playerCaptures,
  ]);

  // Auto-save active offline game whenever state changes
  useEffect(() => {
    if (screen === 'PLAYING' && mode !== 'online' && players.length > 0 && winners.length === 0) {
      saveCurrentMatchState();
    }
  }, [screen, mode, players, currentTurnColor, diceValue, hasRolled, saveCurrentMatchState, winners.length]);

  // Resume saved game from localStorage
  const handleResumeGame = useCallback(() => {
    try {
      const saved = localStorage.getItem('ps_ludo_saved_game_v1');
      if (!saved) return;
      const data: SavedGameState = JSON.parse(saved);
      if (!data || !data.players || data.players.length === 0) return;

      setPlayers(data.players);
      setTurnOrder(data.turnOrder);
      setCurrentTurnColor(data.currentTurnColor);
      setActiveMovableColor(data.activeMovableColor);
      setDiceValue(data.diceValue);
      setIsRolling(false);
      setHasRolled(data.hasRolled);
      setConsecutiveSixes(data.consecutiveSixes || 0);
      setMovableTokenIds(data.movableTokenIds || []);
      setPlayerCount(data.playerCount || 4);
      setMode(data.mode || 'offline_bot');
      setIsTeamMode(data.isTeamMode !== undefined ? data.isTeamMode : true);
      setWinningTeamId(data.winningTeamId || null);
      setMyColor(data.myColor || 'blue');
      setPlayerName(data.playerName || 'Player 1');
      setWinners(data.winners || []);
      setStatusMessage(data.statusMessage || (lang === 'bn' ? 'খেলা পুনরায় শুরু হলো!' : 'Match resumed!'));
      setTotalMoves(data.totalMoves || 0);
      setTotalCaptures(data.totalCaptures || 0);
      setPlayerMoves(data.playerMoves || { red: 0, green: 0, yellow: 0, blue: 0 });
      setPlayerCaptures(data.playerCaptures || { red: 0, green: 0, yellow: 0, blue: 0 });

      setScreen('PLAYING');
      if (bgmEnabled && soundEnabled) {
        sounds.startBgm();
      }
    } catch (err) {
      console.error('Failed to resume match:', err);
    }
  }, [lang, bgmEnabled, soundEnabled]);

  const handleDiscardSavedGame = useCallback(() => {
    localStorage.removeItem('ps_ludo_saved_game_v1');
    setHasSavedGame(false);
  }, []);

  // Quick Reactions & Chat
  const [activeReactions, setActiveReactions] = useState<QuickReaction[]>([]);

  // Online Multiplayer State
  const [onlineUserId] = useState(() => {
    const saved = localStorage.getItem('ludo_player_id');
    if (saved) return saved;
    const generated = 'user_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('ludo_player_id', generated);
    return generated;
  });
  const [roomState, setRoomState] = useState<OnlineRoomState | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const t = TRANSLATIONS[lang];

  // Helper to initialize 4 tokens for a player
  const createPlayerTokens = (color: PlayerColor): Token[] => {
    return [0, 1, 2, 3].map((id) => ({
      id,
      color,
      step: -1,
    }));
  };

  // Setup Offline Game
  const startOfflineGame = useCallback(() => {
    const allColors: PlayerColor[] = ['blue', 'red', 'green', 'yellow'];
    let selectedColors: PlayerColor[] = [];

    if (playerCount === 2) {
      selectedColors = ['blue', 'green'];
      if (myColor === 'red' || myColor === 'yellow') {
        selectedColors = ['red', 'yellow'];
      }
    } else if (playerCount === 3) {
      selectedColors = ['blue', 'red', 'green'];
      if (!selectedColors.includes(myColor)) {
        selectedColors = ['blue', 'red', 'yellow'];
      }
    } else {
      selectedColors = ['blue', 'red', 'green', 'yellow'];
    }

    const defaultNames: Record<PlayerColor, string> = {
      blue: 'Player 1',
      red: 'Player 2',
      green: 'Player 3',
      yellow: 'Player 4',
    };

    const newPlayers: Player[] = selectedColors.map((color) => {
      const isUser = color === myColor;
      const isBotPlayer = mode === 'offline_bot' ? !isUser : false;
      const name = isUser
        ? playerName || defaultNames[color]
        : mode === 'offline_bot'
        ? `Bot (${COLOR_CONFIG[color].name})`
        : defaultNames[color];

      return {
        id: `p_${color}`,
        name,
        color,
        teamId: isTeamMode && playerCount === 4 ? getTeamIdForColor(color) : undefined,
        isBot: isBotPlayer,
        isConnected: true,
        rank: null,
        tokens: createPlayerTokens(color),
        tokensHome: 0,
      };
    });

    setPlayers(newPlayers);
    setTurnOrder(selectedColors);
    setCurrentTurnColor(selectedColors[0]);
    setActiveMovableColor(null);
    setWinningTeamId(null);
    setDiceValue(null);
    setIsRolling(false);
    setHasRolled(false);
    setConsecutiveSixes(0);
    setMovableTokenIds([]);
    setWinners([]);
    setTotalMoves(0);
    setTotalCaptures(0);
    setPlayerMoves({ red: 0, green: 0, yellow: 0, blue: 0 });
    setPlayerCaptures({ red: 0, green: 0, yellow: 0, blue: 0 });
    localStorage.removeItem('ps_ludo_saved_game_v1');
    setHasSavedGame(false);
    setStatusMessage(
      isTeamMode && playerCount === 4
        ? lang === 'bn'
          ? '২ বনাম ২ টিম ম্যাচ শুরু হলো! দান চালুন।'
          : '2v2 Team Match Started! Roll the dice.'
        : lang === 'bn'
        ? 'খেলা শুরু হলো! দান চালুন।'
        : 'Game started! Roll the dice.'
    );

    // Show 3-second intro when starting game per user request
    setSplashConfig({
      durationSeconds: 3,
      title: 'Ps Ludo Master',
      subtitle:
        isTeamMode && playerCount === 4
          ? lang === 'bn'
            ? '২ বনাম ২ টিম ম্যাচ শুরু হচ্ছে... প্রস্তুত হন!'
            : '2v2 Team Match Starting... Get Ready!'
          : lang === 'bn'
          ? 'ম্যাচ শুরু হচ্ছে... প্রস্তুত হন!'
          : 'Match Starting... Get Ready!',
      onFinishCallback: () => {
        setScreen('PLAYING');
        if (bgmEnabled && soundEnabled) {
          sounds.startBgm();
        }
      },
    });
    setIsSplashActive(true);
  }, [playerCount, myColor, mode, playerName, lang, isTeamMode, bgmEnabled, soundEnabled]);

  // Connect WebSocket for Online Mode
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to Ludo WebSocket server');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'room_state': {
            setRoomState(data.room);
            if (data.room.status === 'in_game') {
              syncFromOnlineRoom(data.room);
            }
            break;
          }
          case 'game_started': {
            setRoomState(data.room);
            setIsOnlineModalOpen(false);
            syncFromOnlineRoom(data.room);
            sounds.playSafeChime();

            // Show SharifToonix splash screen before entering the board
            setSplashConfig({
              durationSeconds: 3,
              title: 'Ps Ludo Master',
              subtitle: lang === 'bn' ? 'অনলাইন ম্যাচ শুরু হচ্ছে... প্রস্তুত হন!' : 'Online Match Starting... Get Ready!',
              onFinishCallback: () => {
                setScreen('PLAYING');
              },
            });
            setIsSplashActive(true);
            break;
          }
          case 'dice_rolled': {
            sounds.playDiceRoll();
            setDiceValue(data.dice);
            setHasRolled(true);
            setMovableTokenIds(data.movableTokenIds || []);
            setRoomState(data.room);
            syncFromOnlineRoom(data.room);
            break;
          }
          case 'token_moved': {
            const { color, tokenId, newStep, dice, capturedInfo, reachedHome, room } = data;
            setIsAnimatingMove(true);

            (async () => {
              let startStep = -1;
              setPlayers((cur) => {
                const p = cur.find((pl) => pl.color === color);
                const t = p?.tokens.find((tok) => tok.id === tokenId);
                if (t) startStep = t.step;
                return cur;
              });

              setHoppingInfo({
                color,
                tokenId,
                count: dice || 1,
                totalCount: dice || 1,
              });

              if (startStep === -1) {
                sounds.playSafeChime();
              } else {
                sounds.playStepHop(dice || 1, dice || 1);
              }

              setPlayers((prev) =>
                prev.map((p) => {
                  if (p.color !== color) return p;
                  return {
                    ...p,
                    tokens: p.tokens.map((t) => (t.id === tokenId ? { ...t, step: newStep } : t)),
                  };
                })
              );

              await new Promise((r) => setTimeout(r, 260));

              setHoppingInfo(null);
              setIsAnimatingMove(false);

              if (capturedInfo) {
                sounds.playCaptureSmash();
              } else if (reachedHome) {
                sounds.playHomeFanfare();
              }

              setRoomState(room);
              syncFromOnlineRoom(room);
            })();
            break;
          }
          case 'reaction_received': {
            setActiveReactions((prev) => [...prev, data.reaction]);
            setTimeout(() => {
              setActiveReactions((prev) => prev.filter((r) => r.id !== data.reaction.id));
            }, 3500);
            break;
          }
          case 'consecutive_sixes_forfeit': {
            setStatusMessage(
              lang === 'bn'
                ? 'টানা ৩টি ছক্কা! চাল বাতিল হলো।'
                : 'Three consecutive 6s! Turn forfeited.'
            );
            break;
          }
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message', e);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected, reconnecting in 2s...');
      setTimeout(connectWebSocket, 2000);
    };

    wsRef.current = ws;
  }, [lang]);

  // Synchronize local UI state with online authoritative room state
  const syncFromOnlineRoom = (room: OnlineRoomState) => {
    const onlinePlayers: Player[] = room.turnOrder.map((color) => {
      const roomPlayer = Object.values(room.players).find((p) => p.color === color);
      const playerTokens = room.tokens[color] || createPlayerTokens(color);
      const tokensHome = playerTokens.filter((t) => t.step === 56).length;
      const rankIdx = room.winners.indexOf(color);

      return {
        id: roomPlayer?.id || `p_${color}`,
        name: roomPlayer?.name || COLOR_CONFIG[color].name,
        color,
        isBot: false,
        isConnected: roomPlayer?.isConnected ?? true,
        rank: rankIdx !== -1 ? rankIdx + 1 : null,
        tokens: playerTokens,
        tokensHome,
      };
    });

    setPlayers(onlinePlayers);
    setTurnOrder(room.turnOrder);
    setCurrentTurnColor(room.currentTurnColor);
    setDiceValue(room.diceValue);
    setHasRolled(room.hasRolled);
    setConsecutiveSixes(room.consecutiveSixes);
    setMovableTokenIds(room.movableTokenIds);
    setWinners(room.winners);

    if (room.winners.length > 0 && room.winners.length >= room.turnOrder.length - 1) {
      setScreen('VICTORY');
    }
  };

  // Switch to next player's turn in Offline mode
  const advanceOfflineTurn = useCallback(
    (currentTurnOrder: PlayerColor[], currentTurn: PlayerColor, currentWinners: PlayerColor[]) => {
      setActiveMovableColor(null);
      setDiceValue(null);
      setHasRolled(false);
      setConsecutiveSixes(0);
      setMovableTokenIds([]);

      const currentIdx = currentTurnOrder.indexOf(currentTurn);
      let nextIdx = (currentIdx + 1) % currentTurnOrder.length;
      let attempts = 0;

      while (attempts < currentTurnOrder.length) {
        const candidate = currentTurnOrder[nextIdx];
        // In team mode, teammates who completed all 4 tokens continue rolling to help their partner!
        if (isTeamMode || !currentWinners.includes(candidate)) {
          setCurrentTurnColor(candidate);
          const nextPlayer = players.find((p) => p.color === candidate);
          setStatusMessage(
            lang === 'bn'
              ? `${nextPlayer?.name || candidate}-এর চাল`
              : `${nextPlayer?.name || candidate}'s turn`
          );
          return;
        }
        nextIdx = (nextIdx + 1) % currentTurnOrder.length;
        attempts++;
      }

      // If all finished
      setScreen('VICTORY');
    },
    [players, lang, isTeamMode]
  );

  // User requirement 1 & 3: Match finish handler, crown celebration, and career stats storage
  const handleMatchVictory = useCallback(
    (winningColors: PlayerColor[], teamWinId?: TeamId | null) => {
      // Clear saved ongoing match
      localStorage.removeItem('ps_ludo_saved_game_v1');
      setHasSavedGame(false);

      const isUserWin =
        isTeamMode && teamWinId
          ? (teamWinId === 'team_red_yellow' && (myColor === 'red' || myColor === 'yellow')) ||
            (teamWinId === 'team_blue_green' && (myColor === 'blue' || myColor === 'green'))
          : winningColors[0] === myColor;

      const topWinnerPlayer = players.find((p) => p.color === winningColors[0]);
      const teamObj = teamWinId ? TEAM_CONFIG[teamWinId] : null;
      const winnerName =
        isTeamMode && teamObj
          ? lang === 'bn'
            ? teamObj.nameBn
            : teamObj.nameEn
          : topWinnerPlayer?.name || COLOR_CONFIG[winningColors[0]]?.name || 'Winner';

      const newMatchRecord: MatchRecord = {
        id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        date: new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        winnerName,
        winnerColor: winningColors[0] || 'red',
        isUserWinner: isUserWin,
        mode,
        totalMoves: totalMoves + 1,
        totalCaptures,
        isTeamMode,
        winningTeamName: teamObj ? (lang === 'bn' ? teamObj.nameBn : teamObj.nameEn) : undefined,
      };

      setCareerStats((prev) => {
        const prevHistory: MatchRecord[] =
          prev.matchHistory && Array.isArray(prev.matchHistory)
            ? prev.matchHistory
            : prev.lastMatch
            ? [prev.lastMatch]
            : [];

        // Prepend new match, retaining the last 15 match records
        const updatedHistory = [newMatchRecord, ...prevHistory].slice(0, 15);

        const updated: CareerStats = {
          totalMatches: (prev.totalMatches || 0) + 1,
          wins: (prev.wins || 0) + (isUserWin ? 1 : 0),
          losses: (prev.losses || 0) + (isUserWin ? 0 : 1),
          totalCaptures: (prev.totalCaptures || 0) + totalCaptures,
          lastMatch: newMatchRecord,
          matchHistory: updatedHistory,
        };
        try {
          localStorage.setItem('ps_ludo_career_stats_v1', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      sounds.playCelebration();
      setTimeout(() => setScreen('VICTORY'), 800);
    },
    [isTeamMode, myColor, players, lang, totalCaptures, totalMoves, mode]
  );

  // Offline Dice Roll
  const handleOfflineRoll = useCallback(() => {
    if (isRolling || hasRolled) return;

    triggerHaptic('medium');
    sounds.playDiceRoll();
    setIsRolling(true);
    setDiceValue(null);

    setTimeout(() => {
      const rolled = Math.floor(Math.random() * 6) + 1;
      setDiceValue(rolled);
      setIsRolling(false);
      setHasRolled(true);
      triggerHaptic(rolled === 6 ? 'success' : 'light');

      const nextSixes = rolled === 6 ? consecutiveSixes + 1 : 0;
      setConsecutiveSixes(nextSixes);

      // Check 3 consecutive 6s
      if (nextSixes === 3) {
        sounds.playCaptureSmash();
        setStatusMessage(
          lang === 'bn'
            ? 'টানা ৩টি ছক্কা! চাল বাতিল হলো।'
            : 'Three consecutive 6s! Turn forfeited.'
        );
        setTimeout(() => {
          advanceOfflineTurn(turnOrder, currentTurnColor, winners);
        }, 1200);
        return;
      }

      const currentPlayer = players.find((p) => p.color === currentTurnColor);
      if (!currentPlayer) return;

      // In 2v2 Team Mode: If this player has finished all 4 tokens, roll to move their teammate's tokens!
      const allMyTokensHome = currentPlayer.tokens.every((t) => t.step === 56);
      let targetMoverColor = currentTurnColor;
      let targetTokens = currentPlayer.tokens;

      if (isTeamMode && allMyTokensHome) {
        const partnerColor = getTeammateColor(currentTurnColor);
        const partnerPlayer = players.find((p) => p.color === partnerColor);
        if (partnerPlayer) {
          targetMoverColor = partnerColor;
          targetTokens = partnerPlayer.tokens;
        }
      }

      setActiveMovableColor(targetMoverColor);
      const movable = getMovableTokenIds(targetTokens, rolled);
      setMovableTokenIds(movable);

      if (movable.length === 0) {
        setStatusMessage(
          lang === 'bn'
            ? 'কোনো চাল সম্ভব নয়! পরবর্তী খেলোয়াড়।'
            : 'No moves possible! Passing turn.'
        );
        setTimeout(() => {
          advanceOfflineTurn(turnOrder, currentTurnColor, winners);
        }, 1200);
      } else if (targetMoverColor !== currentTurnColor) {
        setStatusMessage(
          lang === 'bn'
            ? 'পার্টনারের গুটি চালার সুযোগ পেয়েছেন! গুটি নির্বাচন করুন।'
            : "Rolling for teammate's token! Select a token."
        );
      } else if (movable.length === 1 && !currentPlayer.isBot) {
        setStatusMessage(
          lang === 'bn'
            ? 'গুটির উপর ক্লিক করে চাল দিন।'
            : 'Click on the glowing token to move.'
        );
      } else {
        setStatusMessage(
          lang === 'bn'
            ? 'যেকোনো একটি গুটি নির্বাচন করুন।'
            : 'Select a token to move.'
        );
      }
    }, 450);
  }, [
    isRolling,
    hasRolled,
    consecutiveSixes,
    currentTurnColor,
    players,
    turnOrder,
    winners,
    isTeamMode,
    advanceOfflineTurn,
    lang,
  ]);

  // Offline Move Token with Step-by-Step Counting
  const handleOfflineMoveToken = useCallback(
    async (tokenId: number, chosenColor?: PlayerColor) => {
      if (!hasRolled || diceValue === null || isAnimatingMove) return;
      if (!movableTokenIds.includes(tokenId)) return;

      const moverColor = chosenColor || activeMovableColor || currentTurnColor;
      const moverPlayer = players.find((p) => p.color === moverColor);
      if (!moverPlayer) return;

      const token = moverPlayer.tokens.find((t) => t.id === tokenId);
      if (!token) return;

      // Lock interaction and clear highlight during animation
      setIsAnimatingMove(true);
      setMovableTokenIds([]);

      const startStep = token.step;
      const stepsToMove = startStep === -1 ? 1 : diceValue;

      // Direct smooth movement to target position (no step-by-step counting loop)
      const nextStep = startStep === -1 ? 0 : startStep + diceValue;

      setHoppingInfo({
        color: moverColor,
        tokenId,
        count: stepsToMove,
        totalCount: stepsToMove,
      });

      if (startStep === -1) {
        sounds.playSafeChime();
      } else {
        sounds.playStepHop(diceValue, diceValue);
      }

      setPlayers((prev) =>
        prev.map((p) => {
          if (p.color !== moverColor) return p;
          return {
            ...p,
            tokens: p.tokens.map((t) => (t.id === tokenId ? { ...t, step: nextStep } : t)),
          };
        })
      );

      await new Promise((r) => setTimeout(r, 260));

      setHoppingInfo(null);
      setIsAnimatingMove(false);
      let capturedInfo: { color: PlayerColor; tokenId: number } | null = null;
      let reachedHome = nextStep === 56;

      // User requirement 1: Record total moves and player moves
      setTotalMoves((m) => m + 1);
      setPlayerMoves((pm) => ({ ...pm, [moverColor]: (pm[moverColor] || 0) + 1 }));

      // User requirement 4: কোনো গুটি স্টার হলে বা সেভ হলে সাথে সাথে সেভ সাউন্ড হবে।
      // Check if arrival position is a star cell, safe circle, or safe home stretch
      const isSafeCell = isSafePosition(moverColor, nextStep);

      if (reachedHome) {
        triggerHaptic('success');
        sounds.playHomeFanfare();
      } else if (isSafeCell) {
        triggerHaptic('save');
        sounds.playSafeChime();
      }

      // Check captures on perimeter track (step 0..50)
      let currentUpdatedPlayers = players;
      if (nextStep >= 0 && nextStep <= 50) {
        const myTrackIdx = (COLOR_START_INDEX[moverColor] + nextStep) % 52;
        const isSafe = SAFE_TRACK_INDICES.includes(myTrackIdx);

        if (!isSafe) {
          currentUpdatedPlayers = players.map((p) => {
            if (p.color === moverColor) {
              const updatedTokens = p.tokens.map((t) =>
                t.id === tokenId ? { ...t, step: nextStep } : t
              );
              const tokensHome = updatedTokens.filter((t) => t.step === 56).length;
              return { ...p, tokens: updatedTokens, tokensHome };
            }

            // IN 2v2 TEAM MODE: Friendly teammates CANNOT be captured! Friendly coexistence!
            if (isTeamMode && isSameTeam(moverColor, p.color)) {
              return p; // Friendly teammate: untouched!
            }

            const updatedTokens = p.tokens.map((oppToken) => {
              if (oppToken.step >= 0 && oppToken.step <= 50) {
                const oppTrackIdx = (COLOR_START_INDEX[p.color] + oppToken.step) % 52;
                if (oppTrackIdx === myTrackIdx) {
                  capturedInfo = { color: p.color, tokenId: oppToken.id };
                  triggerHaptic('capture');
                  sounds.playCaptureSmash();
                  return { ...oppToken, step: -1 };
                }
              }
              return oppToken;
            });
            return { ...p, tokens: updatedTokens };
          });
        } else {
          currentUpdatedPlayers = players.map((p) => {
            if (p.color !== moverColor) return p;
            const updatedTokens = p.tokens.map((t) =>
              t.id === tokenId ? { ...t, step: nextStep } : t
            );
            const tokensHome = updatedTokens.filter((t) => t.step === 56).length;
            return { ...p, tokens: updatedTokens, tokensHome };
          });
        }
      } else {
        currentUpdatedPlayers = players.map((p) => {
          if (p.color !== moverColor) return p;
          const updatedTokens = p.tokens.map((t) =>
            t.id === tokenId ? { ...t, step: nextStep } : t
          );
          const tokensHome = updatedTokens.filter((t) => t.step === 56).length;
          return { ...p, tokens: updatedTokens, tokensHome };
        });
      }

      // User requirement 1 & 3: Update capture stats
      if (capturedInfo !== null) {
        setTotalCaptures((c) => c + 1);
        setPlayerCaptures((pc) => ({ ...pc, [moverColor]: (pc[moverColor] || 0) + 1 }));
      }

      setPlayers(currentUpdatedPlayers);

      // Check win condition & match ending rules
      let updatedWinners = [...winners];
      let hasPlayerFinishedNow = false;

      if (isTeamMode) {
        const redHome = currentUpdatedPlayers.find((p) => p.color === 'red')?.tokensHome || 0;
        const yellowHome = currentUpdatedPlayers.find((p) => p.color === 'yellow')?.tokensHome || 0;
        const blueHome = currentUpdatedPlayers.find((p) => p.color === 'blue')?.tokensHome || 0;
        const greenHome = currentUpdatedPlayers.find((p) => p.color === 'green')?.tokensHome || 0;

        if (redHome + yellowHome === 8) {
          setWinningTeamId('team_red_yellow');
          setWinners(['red', 'yellow']);
          handleMatchVictory(['red', 'yellow'], 'team_red_yellow');
          return;
        } else if (blueHome + greenHome === 8) {
          setWinningTeamId('team_blue_green');
          setWinners(['blue', 'green']);
          handleMatchVictory(['blue', 'green'], 'team_blue_green');
          return;
        }
      } else {
        const activeUpdatedPlayer = currentUpdatedPlayers.find((p) => p.color === currentTurnColor);
        if (activeUpdatedPlayer) {
          const allHome = activeUpdatedPlayer.tokens.every((t) => t.step === 56);
          if (allHome && !updatedWinners.includes(currentTurnColor)) {
            updatedWinners.push(currentTurnColor);
            setWinners(updatedWinners);
            activeUpdatedPlayer.rank = updatedWinners.length;
            hasPlayerFinishedNow = true;

            // Strict user rules:
            // 2 Players: 1st player finishes -> wins, 2nd player loses immediately.
            // 3 Players: 1st and 2nd finish -> win, 3rd player loses immediately.
            // 4 Players: 1st, 2nd, 3rd finish -> win, 4th player loses immediately.
            const requiredWinnersToFinish = currentUpdatedPlayers.length - 1;
            if (updatedWinners.length >= requiredWinnersToFinish) {
              handleMatchVictory(updatedWinners);
              return;
            }
          }
        }
      }

      // Bonus turn criteria: rolled 6, captured opponent, or reached home
      // Note: A player who just completed all 4 tokens in solo mode does not roll again
      const getsBonusRoll =
        !hasPlayerFinishedNow && (diceValue === 6 || capturedInfo !== null || reachedHome);

      if (getsBonusRoll) {
        setDiceValue(null);
        setHasRolled(false);
        setMovableTokenIds([]);
        setActiveMovableColor(null);
        setStatusMessage(
          capturedInfo
            ? lang === 'bn'
              ? 'গুটি কাটা গেল! অতিরিক্ত চাল পেলেন! 🔥'
              : 'Knocked out opponent! Bonus turn! 🔥'
            : reachedHome
            ? lang === 'bn'
              ? 'গুটি ঘরে পৌঁছাল! অতিরিক্ত চাল পেলেন! 👑'
              : 'Token reached Home! Bonus roll! 👑'
            : lang === 'bn'
            ? 'ছক্কা! অতিরিক্ত চাল পেলেন! 🎲'
            : 'Rolled a 6! Bonus roll! 🎲'
        );
      } else {
        advanceOfflineTurn(turnOrder, currentTurnColor, updatedWinners);
      }
    },
    [
      hasRolled,
      diceValue,
      isAnimatingMove,
      movableTokenIds,
      activeMovableColor,
      currentTurnColor,
      players,
      isTeamMode,
      winners,
      turnOrder,
      advanceOfflineTurn,
      lang,
    ]
  );

  // Bot Turn Automation in Offline Mode
  useEffect(() => {
    if (screen !== 'PLAYING' || mode !== 'offline_bot' || isAnimatingMove) return;

    const currentPlayer = players.find((p) => p.color === currentTurnColor);
    if (!currentPlayer || !currentPlayer.isBot) return;

    // Phase 1: Bot rolls dice
    if (!hasRolled && !isRolling) {
      const rollTimer = setTimeout(() => {
        handleOfflineRoll();
      }, 700);
      return () => clearTimeout(rollTimer);
    }

    // Phase 2: Bot picks best move
    if (hasRolled && diceValue !== null && movableTokenIds.length > 0) {
      const moveTimer = setTimeout(() => {
        const moverColor = activeMovableColor || currentTurnColor;
        const moverPlayer = players.find((p) => p.color === moverColor);
        const tokensToEvaluate = moverPlayer ? moverPlayer.tokens : currentPlayer.tokens;

        const bestTokenId = pickBestBotMove(
          moverColor,
          tokensToEvaluate,
          diceValue,
          players,
          isTeamMode
        );
        if (bestTokenId !== null) {
          handleOfflineMoveToken(bestTokenId, moverColor);
        }
      }, 800);
      return () => clearTimeout(moveTimer);
    }
  }, [
    screen,
    mode,
    isAnimatingMove,
    players,
    currentTurnColor,
    activeMovableColor,
    isTeamMode,
    hasRolled,
    isRolling,
    diceValue,
    movableTokenIds,
    handleOfflineRoll,
    handleOfflineMoveToken,
  ]);

  // Online Action Handlers
  const handleOnlineCreateRoom = (selectedMaxPlayers: 2 | 3 | 4) => {
    connectWebSocket();
    const roomId = 'LUDO' + Math.floor(100 + Math.random() * 900);
    const msg = {
      type: 'create_room',
      roomId,
      playerId: onlineUserId,
      playerName: playerName || 'Player 1',
      maxPlayers: selectedMaxPlayers,
      preferredColor: myColor,
    };

    const send = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(msg));
      } else {
        setTimeout(send, 100);
      }
    };
    send();
  };

  const handleOnlineJoinRoom = (roomId: string) => {
    connectWebSocket();
    const msg = {
      type: 'join_room',
      roomId,
      playerId: onlineUserId,
      playerName: playerName || 'Player 1',
      preferredColor: myColor,
    };

    const send = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(msg));
      } else {
        setTimeout(send, 100);
      }
    };
    send();
  };

  const handleOnlineSelectColor = (color: PlayerColor) => {
    setMyColor(color);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'set_color',
          color,
        })
      );
    }
  };

  const handleOnlineStartGame = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'start_game' }));
    }
  };

  const handleOnlineRoll = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      sounds.playDiceRoll();
      wsRef.current.send(JSON.stringify({ type: 'roll_dice' }));
    }
  };

  const handleOnlineMoveToken = (tokenId: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'move_token',
          tokenId,
        })
      );
    }
  };

  const handleSendReaction = (text: string, emoji: string) => {
    const reaction: QuickReaction = {
      id: Math.random().toString(36).substring(2, 9),
      senderName: playerName,
      senderColor: myColor,
      text,
      emoji,
      timestamp: Date.now(),
    };

    if (mode === 'online' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'quick_reaction',
          senderName: playerName,
          senderColor: myColor,
          text,
          emoji,
        })
      );
    } else {
      // Local reaction
      setActiveReactions((prev) => [...prev, reaction]);
      setTimeout(() => {
        setActiveReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, 3500);
    }
  };

  // Unified Roll & Move routers
  const handleRoll = () => {
    if (mode === 'online') {
      handleOnlineRoll();
    } else {
      handleOfflineRoll();
    }
  };

  const handleSelectToken = (tokenId: number, chosenColor?: PlayerColor) => {
    if (mode === 'online') {
      handleOnlineMoveToken(tokenId);
    } else {
      handleOfflineMoveToken(tokenId, chosenColor);
    }
  };

  const handleRematch = () => {
    if (mode === 'online') {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'rematch' }));
      }
    } else {
      startOfflineGame();
    }
  };

  // Continuous Ludo Background Music (BGM) while playing match
  useEffect(() => {
    if (
      screen === 'PLAYING' &&
      soundEnabled &&
      bgmEnabled &&
      winners.length === 0 &&
      !winningTeamId &&
      !isCustomMusicPlaying // Give priority to user's custom music if playing
    ) {
      sounds.startBgm();
    } else {
      sounds.stopBgm();
    }

    return () => {
      sounds.stopBgm();
    };
  }, [screen, soundEnabled, bgmEnabled, winners.length, winningTeamId, isCustomMusicPlaying]);

  // Active player info
  const activePlayer = players.find((p) => p.color === currentTurnColor);
  const isMyTurn =
    mode === 'online'
      ? roomState?.players[onlineUserId]?.color === currentTurnColor
      : mode === 'offline_bot'
      ? currentTurnColor === myColor
      : true; // In pass & play, local player takes turn

  const canRollNow = isMyTurn && !hasRolled && !isRolling && !isAnimatingMove && !activePlayer?.isBot;

  // Team score calculations
  const team1TokensHome =
    (players.find((p) => p.color === 'red')?.tokensHome || 0) +
    (players.find((p) => p.color === 'yellow')?.tokensHome || 0);

  const team2TokensHome =
    (players.find((p) => p.color === 'blue')?.tokensHome || 0) +
    (players.find((p) => p.color === 'green')?.tokensHome || 0);

  return (
    <div className={`relative min-h-screen w-full theme-${theme} bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950`}>
      {/* Offline connectivity indicator */}
      <OfflineIndicator lang={lang} />

      {/* Viewport Render Router */}
      {screen === 'TITLE_MENU' ? (
        <TitleScreen
          mode={mode}
          setMode={setMode}
          playerCount={playerCount}
          setPlayerCount={setPlayerCount}
          isTeamMode={isTeamMode}
          setIsTeamMode={setIsTeamMode}
          myColor={myColor}
          setMyColor={setMyColor}
          playerName={playerName}
          setPlayerName={setPlayerName}
          lang={lang}
          setLang={handleSetLang}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          bgmEnabled={bgmEnabled}
          onToggleBgm={handleToggleBgm}
          onStartOffline={startOfflineGame}
          hasSavedGame={hasSavedGame}
          onResumeGame={handleResumeGame}
          onDiscardSavedGame={handleDiscardSavedGame}
          onOpenStats={() => setIsStatsModalOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenOnlineModal={() => {
            setIsOnlineNoticeOpen(true);
          }}
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenIntro={() => {
            setSplashConfig({
              durationSeconds: 3,
              title: 'Ps Ludo Master',
              subtitle: lang === 'bn' ? 'Ps Ludo Master প্রেজেন্টস' : 'Ps Ludo Master Presents',
              onFinishCallback: () => {},
            });
            setIsSplashActive(true);
          }}
        />
      ) : (
        /* PLAYING VIEWPORT (Matching User Screenshot Layout) */
        <div className="relative min-h-screen flex-1 flex flex-col justify-between p-2 sm:p-4 w-full ludo-screen-bg overflow-x-hidden">
          {/* Top Bar Controls */}
          <header className="flex items-center justify-between gap-2 max-w-[500px] mx-auto w-full mb-1">
            {/* Back Button with In-App Confirmation (Iframe safe) */}
            <button
              onClick={() => {
                sounds.playClick();
                triggerHaptic('medium');
                setIsExitConfirmModalOpen(true);
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-400 border-2 border-slate-900 shadow-md flex items-center justify-center text-slate-950 font-bold hover:scale-105 active:scale-95 transition shrink-0 cursor-pointer"
              title={t.backToMenu}
              aria-label={t.backToMenu}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Custom Music Widget spans the entire center area */}
            <InGameMusicWidget
              lang={lang}
              onOpenSettings={() => setIsSettingsOpen(true)}
              fullWidth
            />

            {/* Right Action Controls: QuickChat and Settings */}
            <div className="flex items-center gap-1.5 shrink-0">
              <QuickChatBar
                onSendReaction={handleSendReaction}
                lang={lang}
                activeReactions={activeReactions}
              />

              {/* In-Game Settings Button */}
              <button
                onClick={() => {
                  triggerHaptic('light');
                  sounds.playClick();
                  setIsSettingsOpen(true);
                }}
                title={lang === 'bn' ? 'সেটিংস' : 'Settings'}
                className="w-9 h-9 rounded-full bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-200 shadow hover:bg-purple-900/80 hover:text-white transition active:scale-95 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-purple-300" />
              </button>
            </div>
          </header>

          {/* 2v2 Team Mode Header Scoreboard */}
          {isTeamMode && (
            <div className="w-full max-w-[500px] mx-auto flex items-center justify-center gap-2 mb-1 px-1">
              <div className="flex-1 flex items-center justify-between px-2.5 py-1 rounded-xl bg-slate-950/85 border border-red-500/40 text-amber-300 shadow">
                <span className="text-[11px] font-bold flex items-center gap-1">
                  <span>🛡️</span>
                  <span>{lang === 'bn' ? 'টিম ১' : 'Team 1'}</span>
                  <span className="text-[9px] text-slate-400">(🔴+🟡)</span>
                </span>
                <span className="text-xs font-black font-num text-white bg-red-600/30 px-1.5 py-0.5 rounded border border-red-500/30">
                  {team1TokensHome}/8
                </span>
              </div>

              <span className="text-[10px] font-black text-slate-500">VS</span>

              <div className="flex-1 flex items-center justify-between px-2.5 py-1 rounded-xl bg-slate-950/85 border border-blue-500/40 text-sky-300 shadow">
                <span className="text-[11px] font-bold flex items-center gap-1">
                  <span>🛡️</span>
                  <span>{lang === 'bn' ? 'টিম ২' : 'Team 2'}</span>
                  <span className="text-[9px] text-slate-400">(🔵+🟢)</span>
                </span>
                <span className="text-xs font-black font-num text-white bg-blue-600/30 px-1.5 py-0.5 rounded border border-blue-500/30">
                  {team2TokensHome}/8
                </span>
              </div>
            </div>
          )}

          {/* Main Table Arena Matching Screenshot */}
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[500px] mx-auto my-auto py-1">
            {/* Top Row: Red on Left (Top-Left House), Green on Right (Top-Right House) */}
            <div className="w-full flex items-center justify-between mb-2 px-1">
              {players.find((p) => p.color === 'red') ? (
                <PlayerBox
                  player={players.find((p) => p.color === 'red')!}
                  isActive={currentTurnColor === 'red'}
                  diceValue={currentTurnColor === 'red' ? diceValue : null}
                  isRolling={isRolling}
                  canRoll={canRollNow && currentTurnColor === 'red'}
                  onRoll={handleRoll}
                  orientation="left"
                  playerName="Player 2"
                  isTeamMode={isTeamMode}
                />
              ) : <div />}

              {players.find((p) => p.color === 'green') ? (
                <PlayerBox
                  player={players.find((p) => p.color === 'green')!}
                  isActive={currentTurnColor === 'green'}
                  diceValue={currentTurnColor === 'green' ? diceValue : null}
                  isRolling={isRolling}
                  canRoll={canRollNow && currentTurnColor === 'green'}
                  onRoll={handleRoll}
                  orientation="right"
                  playerName="Player 3"
                  isTeamMode={isTeamMode}
                />
              ) : <div />}
            </div>

            {/* Center: The Ludo Board */}
            <div className="w-full">
              <LudoBoard
                players={players}
                activeColor={currentTurnColor}
                movableTokenIds={movableTokenIds}
                movableColor={activeMovableColor || currentTurnColor}
                isMyTurn={isMyTurn && !isAnimatingMove}
                onSelectToken={handleSelectToken}
                lang={lang}
                hoppingInfo={hoppingInfo}
                isTeamMode={isTeamMode}
              />
            </div>

            {/* Bottom Row: Blue on Left (Bottom-Left House), Yellow on Right (Bottom-Right House) */}
            <div className="w-full flex items-center justify-between mt-2 px-1">
              {players.find((p) => p.color === 'blue') ? (
                <PlayerBox
                  player={players.find((p) => p.color === 'blue')!}
                  isActive={currentTurnColor === 'blue'}
                  diceValue={currentTurnColor === 'blue' ? diceValue : null}
                  isRolling={isRolling}
                  canRoll={canRollNow && currentTurnColor === 'blue'}
                  onRoll={handleRoll}
                  orientation="left"
                  playerName="Player 1"
                  isTeamMode={isTeamMode}
                />
              ) : <div />}

              {players.find((p) => p.color === 'yellow') ? (
                <PlayerBox
                  player={players.find((p) => p.color === 'yellow')!}
                  isActive={currentTurnColor === 'yellow'}
                  diceValue={currentTurnColor === 'yellow' ? diceValue : null}
                  isRolling={isRolling}
                  canRoll={canRollNow && currentTurnColor === 'yellow'}
                  onRoll={handleRoll}
                  orientation="right"
                  playerName="Player 4"
                  isTeamMode={isTeamMode}
                />
              ) : <div />}
            </div>
          </div>

          {/* Bottom Bar: Circular Menu Button (Matching Screenshot bottom-left icon) */}
          <div className="w-full max-w-[500px] mx-auto flex items-center justify-between px-2 pt-1">
            <button
              onClick={() => setIsRulesOpen(true)}
              className="w-10 h-10 rounded-full bg-amber-400 border-2 border-slate-900 shadow-xl flex items-center justify-center text-slate-950 font-bold hover:scale-105 active:scale-95 transition"
              title={t.rules}
            >
              <span className="text-lg">☰</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setLang(lang === 'bn' ? 'en' : 'bn');
              }}
              className="px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/20 text-xs font-bold text-white shadow hover:bg-slate-800 transition"
            >
              {lang === 'bn' ? 'English' : 'বাংলা'}
            </button>
          </div>
        </div>
      )}

      {/* Online Notice Modal (Requested Bengali Message) */}
      <OnlineNoticeModal
        isOpen={isOnlineNoticeOpen}
        onClose={() => setIsOnlineNoticeOpen(false)}
        lang={lang}
      />

      {/* Online Lobby Modal */}
      <OnlineLobbyModal
        isOpen={isOnlineModalOpen}
        onClose={() => setIsOnlineModalOpen(false)}
        roomState={roomState}
        currentUserId={onlineUserId}
        userName={playerName}
        userColor={myColor}
        lang={lang}
        onCreateRoom={handleOnlineCreateRoom}
        onJoinRoom={handleOnlineJoinRoom}
        onStartOnlineGame={handleOnlineStartGame}
        onSelectColor={handleOnlineSelectColor}
      />

      {/* Rules Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        lang={lang}
      />

      {/* Career Stats Modal (User requirement 3: View stats stored on phone) */}
      <CareerStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        lang={lang}
        stats={careerStats}
        onResetStats={() => {
          const reset: CareerStats = {
            totalMatches: 0,
            wins: 0,
            losses: 0,
            totalCaptures: 0,
            matchHistory: [],
          };
          setCareerStats(reset);
          try {
            localStorage.removeItem('ps_ludo_career_stats_v1');
          } catch {}
        }}
      />

      {/* Victory Celebration Modal (User requirement 1: Winner Name, Crown animation, Moves & Captures) */}
      <VictoryModal
        isOpen={screen === 'VICTORY'}
        winners={winners}
        players={players}
        lang={lang}
        isTeamMode={isTeamMode}
        winningTeamId={winningTeamId}
        totalMoves={totalMoves}
        totalCaptures={totalCaptures}
        onRematch={() => {
          setScreen('PLAYING');
          handleRematch();
        }}
        onHome={() => {
          setScreen('TITLE_MENU');
        }}
      />

      {/* Cinematic Splash Screen with SharifToonix Artwork */}
      {isSplashActive && (
        <SplashScreen
          durationSeconds={splashConfig.durationSeconds}
          title={splashConfig.title}
          subtitle={splashConfig.subtitle}
          lang={lang}
          onComplete={() => {
            setIsSplashActive(false);
            if (splashConfig.onFinishCallback) {
              splashConfig.onFinishCallback();
            }
          }}
        />
      )}

      {/* High-Fidelity Settings Screen (Matching user screenshot) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        lang={lang}
        setLang={handleSetLang}
        soundEnabled={soundEnabled}
        setSoundEnabled={(val) => {
          setSoundEnabled(val);
          sounds.setSoundEnabled(val);
        }}
        bgmEnabled={bgmEnabled}
        setBgmEnabled={(val) => {
          setBgmEnabled(val);
          sounds.setBgmEnabled(val);
          localStorage.setItem('ludo_bgm_enabled', String(val));
          if (val && screen === 'PLAYING') {
            sounds.startBgm();
          } else if (!val) {
            sounds.stopBgm();
          }
        }}
        vibrationEnabled={vibrationEnabled}
        setVibrationEnabled={handleSetVibration}
        bundleMove={bundleMove}
        setBundleMove={handleSetBundleMove}
        colorblindMode={colorblindMode}
        setColorblindMode={handleSetColorblindMode}
        theme={theme}
        setTheme={handleSetTheme}
      />

      {/* Leave Game In-App Confirmation Modal (Iframe safe & smooth) */}
      {isExitConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#151a30] border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 max-w-sm w-full text-center shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-inner">
              <ArrowLeft className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-white">
                {lang === 'bn' ? 'খেলা থেকে বের হতে চান?' : 'Leave Game?'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed px-2">
                {lang === 'bn'
                  ? 'আপনার বর্তমান ম্যাচটি সেভ থাকবে। আপনি পরে যেকোনো সময় আবার শুরু করতে পারবেন।'
                  : 'Your current match will be saved automatically. You can resume anytime.'}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  triggerHaptic('light');
                  setIsExitConfirmModalOpen(false);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition active:scale-95 border border-slate-700 cursor-pointer"
              >
                {lang === 'bn' ? 'খেলা চালিয়ে যান' : 'Keep Playing'}
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  triggerHaptic('heavy');
                  saveCurrentMatchState();
                  sounds.stopBgm();
                  setIsExitConfirmModalOpen(false);
                  setScreen('TITLE_MENU');
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition active:scale-95 border border-red-400/30 cursor-pointer"
              >
                {lang === 'bn' ? 'হ্যাঁ, বের হন' : 'Save & Exit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
