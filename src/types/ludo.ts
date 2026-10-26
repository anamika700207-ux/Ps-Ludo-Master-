export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type TeamId = 'team_red_yellow' | 'team_blue_green';

export interface Token {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  step: number; // -1: Yard, 0..50: Perimeter track, 51..55: Home path, 56: Home center (finished)
}

export interface HoppingTokenInfo {
  color: PlayerColor;
  tokenId: number;
  count: number;
  totalCount: number;
}

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  teamId?: TeamId;
  isBot: boolean;
  isConnected: boolean;
  rank: number | null; // 1, 2, 3, 4
  tokens: Token[];
  tokensHome: number;
}

export type GameMode = 'offline_pass_play' | 'offline_bot' | 'online';

export type GameScreen = 'TITLE_MENU' | 'PLAYING' | 'VICTORY';

export type Language = 'bn' | 'en';

export interface QuickReaction {
  id: string;
  senderName: string;
  senderColor: PlayerColor;
  text: string;
  emoji: string;
  timestamp: number;
}

export interface MoveLog {
  id: string;
  playerColor: PlayerColor;
  playerName: string;
  text: string;
  type: 'roll' | 'move' | 'capture' | 'home' | 'bonus' | 'pass';
  timestamp: number;
}

export type AppTheme = 'night' | 'light' | 'neon';

export interface GameSettings {
  language: Language;
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  bundleMove: boolean;
  colorblindMode: boolean;
  theme: AppTheme;
  botSpeed?: 'fast' | 'normal';
}

export interface OnlineRoomState {
  roomId: string;
  hostId: string;
  maxPlayers: 2 | 3 | 4;
  isTeamMode?: boolean;
  players: Record<string, {
    id: string;
    name: string;
    color: PlayerColor;
    isReady: boolean;
    isConnected: boolean;
  }>;
  status: 'waiting' | 'in_game' | 'finished';
  currentTurnColor: PlayerColor;
  turnOrder: PlayerColor[];
  diceValue: number | null;
  hasRolled: boolean;
  consecutiveSixes: number;
  movableTokenIds: number[];
  tokens: Record<PlayerColor, Token[]>;
  winners: PlayerColor[];
  turnDeadline: number;
}

export interface MatchStats {
  totalMoves: number;
  totalCaptures: number;
  playerMoves: Record<PlayerColor, number>;
  playerCaptures: Record<PlayerColor, number>;
}

export interface SavedGameState {
  players: Player[];
  turnOrder: PlayerColor[];
  currentTurnColor: PlayerColor;
  activeMovableColor: PlayerColor | null;
  diceValue: number | null;
  hasRolled: boolean;
  consecutiveSixes: number;
  movableTokenIds: number[];
  playerCount: 2 | 3 | 4;
  mode: GameMode;
  isTeamMode: boolean;
  winningTeamId: TeamId | null;
  myColor: PlayerColor;
  playerName: string;
  winners: PlayerColor[];
  statusMessage: string;
  totalMoves: number;
  totalCaptures: number;
  playerMoves: Record<PlayerColor, number>;
  playerCaptures: Record<PlayerColor, number>;
  savedAt: number;
}

export interface CareerStats {
  totalMatches: number;
  wins: number;
  losses: number;
  totalCaptures: number;
  lastMatch?: {
    date: string;
    winnerName: string;
    winnerColor: PlayerColor;
    isUserWinner: boolean;
    mode: GameMode;
    totalMoves: number;
    totalCaptures: number;
    isTeamMode?: boolean;
    winningTeamName?: string;
  };
}
