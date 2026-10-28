import { PlayerColor, TeamId } from '../types/ludo';

export type Coord = [number, number]; // [row, col] on 15x15 grid

// 52 Perimeter track coordinates
export const TRACK_COORDINATES: Coord[] = [
  // Red Arm Top (0..4)
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  // Top Arm Left (5..10)
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  // Top Arm Middle (11)
  [0, 7],
  // Top Arm Right / Green Start (12..17)
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  // Right Arm Top (18..23)
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  // Right Arm Middle (24)
  [7, 14],
  // Right Arm Bottom / Yellow Start (25..30)
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  // Bottom Arm Right (31..36)
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  // Bottom Arm Middle (37)
  [14, 7],
  // Bottom Arm Left / Blue Start (38..43)
  [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  // Left Arm Bottom (44..49)
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  // Left Arm Middle (50)
  [7, 0],
  // Left Arm Corner (51)
  [6, 0],
];

// Starting track index on perimeter for each color (Matching reference classic board)
export const COLOR_START_INDEX: Record<PlayerColor, number> = {
  red: 0,     // [6, 1] - Left arm top
  green: 13,  // [1, 8] - Top arm right
  yellow: 26, // [8, 13] - Right arm bottom
  blue: 39,   // [13, 6] - Bottom arm left
};

// Safe squares on perimeter (indices)
export const SAFE_TRACK_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

// Home stretch coordinates (steps 51 to 55) for each color
export const HOME_STRETCH_COORDINATES: Record<PlayerColor, Coord[]> = {
  red: [
    [7, 1], [7, 2], [7, 3], [7, 4], [7, 5]
  ],
  green: [
    [1, 7], [2, 7], [3, 7], [4, 7], [5, 7]
  ],
  yellow: [
    [7, 13], [7, 12], [7, 11], [7, 10], [7, 9]
  ],
  blue: [
    [13, 7], [12, 7], [11, 7], [10, 7], [9, 7]
  ],
};

// Center Goal coordinate
export const CENTER_GOAL_COORDINATE: Coord = [7, 7];

// Exact percentage coordinates for the 4 sockets in each player's yard base
// White inner boxes are 28% x 28% centered at 20% / 80% (margins of 6% from board edges)
// Sockets are symmetrically placed at 14.4% and 25.6% (and 74.4% and 85.6%)
export interface YardSocketPercent {
  left: number;
  top: number;
}

export const YARD_SOCKET_POSITIONS: Record<PlayerColor, YardSocketPercent[]> = {
  red: [
    { left: 14.4, top: 14.4 },
    { left: 25.6, top: 14.4 },
    { left: 14.4, top: 25.6 },
    { left: 25.6, top: 25.6 },
  ],
  green: [
    { left: 74.4, top: 14.4 },
    { left: 85.6, top: 14.4 },
    { left: 74.4, top: 25.6 },
    { left: 85.6, top: 25.6 },
  ],
  yellow: [
    { left: 74.4, top: 74.4 },
    { left: 85.6, top: 74.4 },
    { left: 74.4, top: 85.6 },
    { left: 85.6, top: 85.6 },
  ],
  blue: [
    { left: 14.4, top: 74.4 },
    { left: 25.6, top: 74.4 },
    { left: 14.4, top: 85.6 },
    { left: 25.6, top: 85.6 },
  ],
};

// Token yard resting coordinates for 4 pawns in each base (matching exact 14.4% and 25.6% socket centers)
export const YARD_COORDINATES: Record<PlayerColor, Coord[]> = {
  red: [
    [1.66, 1.66], [1.66, 3.34], [3.34, 1.66], [3.34, 3.34]
  ],
  green: [
    [1.66, 10.66], [1.66, 12.34], [3.34, 10.66], [3.34, 12.34]
  ],
  yellow: [
    [10.66, 10.66], [10.66, 12.34], [12.34, 10.66], [12.34, 12.34]
  ],
  blue: [
    [10.66, 1.66], [10.66, 3.34], [12.34, 1.66], [12.34, 3.34]
  ]
};

// Helper to convert token step to [row, col]
export function getTokenCoordinate(color: PlayerColor, tokenId: number, step: number): Coord {
  if (step === -1) {
    return YARD_COORDINATES[color][tokenId];
  }
  if (step >= 0 && step <= 50) {
    const trackIdx = (COLOR_START_INDEX[color] + step) % 52;
    return TRACK_COORDINATES[trackIdx];
  }
  if (step >= 51 && step <= 55) {
    return HOME_STRETCH_COORDINATES[color][step - 51];
  }
  // Step 56: Home center goal
  const offsets: Record<PlayerColor, Coord> = {
    red: [7, 6.4],
    green: [6.4, 7],
    yellow: [7, 7.6],
    blue: [7.6, 7]
  };
  return offsets[color];
}

// Check if a perimeter track index is safe
export function isSafePosition(color: PlayerColor, step: number): boolean {
  if (step < 0) return true; // yard is safe
  if (step > 50) return true; // home stretch is 100% safe
  const trackIdx = (COLOR_START_INDEX[color] + step) % 52;
  return SAFE_TRACK_INDICES.includes(trackIdx);
}

// Color palettes and design tokens
export const COLOR_CONFIG = {
  red: {
    name: 'Red',
    nameBn: 'লাল',
    hex: '#ef4444',
    bg: 'bg-red-500',
    border: 'border-red-500',
    text: 'text-red-500',
    lightHex: '#fee2e2',
    accentGrad: 'from-red-500 to-rose-600',
    ring: 'ring-red-400',
    shadow: 'shadow-red-500/50',
    badge: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  green: {
    name: 'Green',
    nameBn: 'সবুজ',
    hex: '#10b981',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500',
    text: 'text-emerald-500',
    lightHex: '#d1fae5',
    accentGrad: 'from-emerald-500 to-green-600',
    ring: 'ring-emerald-400',
    shadow: 'shadow-emerald-500/50',
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  yellow: {
    name: 'Yellow',
    nameBn: 'হলুদ',
    hex: '#f59e0b',
    bg: 'bg-amber-500',
    border: 'border-amber-500',
    text: 'text-amber-500',
    lightHex: '#fef3c7',
    accentGrad: 'from-amber-400 to-yellow-500',
    ring: 'ring-amber-300',
    shadow: 'shadow-amber-500/50',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  blue: {
    name: 'Blue',
    nameBn: 'নীল',
    hex: '#3b82f6',
    bg: 'bg-blue-500',
    border: 'border-blue-500',
    text: 'text-blue-500',
    lightHex: '#dbeafe',
    accentGrad: 'from-blue-500 to-indigo-600',
    ring: 'ring-blue-400',
    shadow: 'shadow-blue-500/50',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
};

// 2v2 Diagonal Team Mode Configuration
export const TEAM_CONFIG: Record<
  TeamId,
  {
    id: TeamId;
    nameEn: string;
    nameBn: string;
    shortNameBn: string;
    colors: [PlayerColor, PlayerColor];
    colorNamesBn: string;
    colorNamesEn: string;
    badgeBg: string;
    tagColor: string;
    accentGrad: string;
    border: string;
  }
> = {
  team_red_yellow: {
    id: 'team_red_yellow',
    nameEn: 'Team Red & Yellow',
    nameBn: 'টিম ১ (লাল ও হলুদ)',
    shortNameBn: 'টিম ১ 🔴+🟡',
    colors: ['red', 'yellow'],
    colorNamesBn: 'লাল + হলুদ',
    colorNamesEn: 'Red + Yellow',
    badgeBg: 'bg-gradient-to-r from-red-600/30 via-rose-500/20 to-amber-500/30 border-red-500/40 text-amber-300',
    tagColor: 'text-rose-400',
    accentGrad: 'from-rose-500 to-amber-500',
    border: 'border-rose-400',
  },
  team_blue_green: {
    id: 'team_blue_green',
    nameEn: 'Team Blue & Green',
    nameBn: 'টিম ২ (নীল ও সবুজ)',
    shortNameBn: 'টিম ২ 🔵+🟢',
    colors: ['blue', 'green'],
    colorNamesBn: 'নীল + সবুজ',
    colorNamesEn: 'Blue + Green',
    badgeBg: 'bg-gradient-to-r from-blue-600/30 via-sky-500/20 to-emerald-500/30 border-blue-500/40 text-emerald-300',
    tagColor: 'text-sky-400',
    accentGrad: 'from-blue-500 to-emerald-500',
    border: 'border-sky-400',
  },
};

export function getTeamIdForColor(color: PlayerColor): TeamId {
  if (color === 'red' || color === 'yellow') {
    return 'team_red_yellow';
  }
  return 'team_blue_green';
}

export function getTeammateColor(color: PlayerColor): PlayerColor {
  switch (color) {
    case 'red':
      return 'yellow';
    case 'yellow':
      return 'red';
    case 'blue':
      return 'green';
    case 'green':
      return 'blue';
  }
}

export function isSameTeam(colorA: PlayerColor, colorB: PlayerColor): boolean {
  return getTeamIdForColor(colorA) === getTeamIdForColor(colorB);
}

// Translations
export const TRANSLATIONS = {
  bn: {
    gameTitle: 'Ps Ludo Master',
    tagline: 'ক্লাসিক বোর্ড গেমের প্রিমিয়াম অভিজ্ঞতা',
    playOffline: 'অফলাইন খেলুন',
    playOnline: 'অনলাইন মাল্টিপ্লেয়ার',
    passAndPlay: 'পাস ও খেলুন',
    passAndPlayDesc: 'একই ডিভাইসে ২-৪ জন বন্ধু খেলুন',
    vsComputer: 'বনাম কম্পিউটার (বট)',
    vsComputerDesc: 'বুদ্ধিমান বটের বিরুদ্ধে একাকী প্র্যাকটিস',
    createRoom: 'রুম তৈরি করুন',
    joinRoom: 'রুমে জয়েন করুন',
    enterRoomCode: 'রুম কোড লিখুন',
    enterYourName: 'আপনার নাম লিখুন',
    playersCount: 'খেলোয়াড়ের সংখ্যা',
    twoPlayers: '২ খেলোয়াড়',
    threePlayers: '৩ খেলোয়াড়',
    fourPlayers: '৪ খেলোয়াড়',
    matchType: 'ম্যাচের ধরণ',
    standardMode: '১ বনাম ১ (একক খেলা)',
    teamMode: '২ বনাম ২ কোনাকুনি টিম',
    teamModeDesc: 'কোনাকুনি দুই প্লেয়ার মিলে টিম: লাল+হলুদ বনাম নীল+সবুজ!',
    team1Name: 'টিম ১ (লাল ও হলুদ)',
    team2Name: 'টিম ২ (নীল ও সবুজ)',
    teamPartnerHelp: 'পার্টনারের সব গুটি পাকা হলে সে সঙ্গীর গুটি চালতে পারবে!',
    teamNoCaptureRule: 'টিমমেটের গুটি কাটা যাবে না - একসাথে একই ঘরে থাকতে পারবে!',
    teamVictory: 'টিম বিজয়ী চ্যাম্পিয়ন!',
    teamScore: 'টিম স্কোর',
    selectYourColor: 'আপনার রঙ নির্বাচন করুন',
    startGame: 'খেলা শুরু করুন',
    backToMenu: 'প্রধান মেনু',
    rollDice: 'দান চালুন',
    yourTurn: 'আপনার চাল',
    botThinking: 'কম্পিউটার ভাবছে...',
    waitingForRoll: 'দানের অপেক্ষা...',
    sixBonus: 'ছক্কা! অতিরিক্ত দান পেলেন!',
    capturedPawn: 'গুটি কাটা গেল!',
    reachedHome: 'গুটি ঘরে পৌঁছাল!',
    partnerAssist: 'পার্টনারের গুটি চালছেন!',
    threeSixesPass: 'টানা ৩টি ছক্কা! চাল বাতিল হলো।',
    noLegalMoves: 'কোনো বৈধ চাল নেই, পরবর্তী খেলোয়াড়ের পালা।',
    winner: 'বিজয়ী!',
    firstPlace: '১ম স্থান',
    secondPlace: '২য় স্থান',
    thirdPlace: '৩য় স্থান',
    fourthPlace: '৪র্থ স্থান',
    defeated: 'পরাজিত',
    playAgain: 'আবার খেলুন',
    rematch: 'রি-ম্যাচ',
    sound: 'শব্দ',
    music: 'মিউজিক',
    rules: 'খেলার নিয়মাবলী',
    rulesTitle: 'লুডু খেলার নিয়মাবলী',
    rule1: '১. গুটি ঘর (Yard) থেকে বের করতে ছক্কা (৬) মারতে হবে।',
    rule2: '২. ছক্কা (৬) মারলে একটি অতিরিক্ত চাল পাওয়া যায়। তবে টানা ৩টি ছক্কা মারলে চাল বাতিল হবে।',
    rule3: '৩. প্রতিপক্ষের গুটির উপর পড়লে সেটি কাটা যাবে এবং তার ঘরে ফেরত যাবে। সফলভাবে কাটলে অতিরিক্ত চাল পাওয়া যাবে।',
    rule4: '৪. তারকা (★) চিহ্নিত ঘরগুলো নিরাপদ (Safe Zone), এখানে কোনো গুটি কাটা যায় না।',
    rule5: '৫. [খেলার সমাপ্তি ও বিজয়ী] ২ জন খেললে ১ম জন সব গুটি তুললে বিজয়ী হবে এবং ২য় জন সাথে সাথে হেরে যাবে (খেলা সেখানেই শেষ)। ৩ জন খেললে ১ম ও ২য় স্থান বিজয়ী হবে এবং ৩য় জন হেরে যাবে। ৪ জন খেললে ১ম, ২য় ও ৩য় স্থান বিজয়ী হবে এবং ৪র্থ জন হেরে যাবে (একা একা খেলতে পারবে না)।',
    rule6: '৬. [২ বনাম ২ টিম মোড] কোনাকুনি বিপরীত খেলোয়াড়েরা পার্টনার (লাল+হলুদ এবং নীল+সবুজ)। টিমের কেউ টিমমেটের গুটি কাটবে না। একজনের সব গুটি ঘরে পৌঁছালে সে পার্টনারের গুটি চালাতে পারবে। যে টিমের মোট ৮টি গুটি আগে ঘরে পৌঁছাবে সেই টিম জয়ী হবে!',
    copyCode: 'কোড কপি করুন',
    copied: 'কপি হয়েছে!',
    shareRoomHint: 'বন্ধুদের সাথে এই রুম কোড শেয়ার করুন',
    waitingForHost: 'হোস্ট খেলা শুরু করার জন্য অপেক্ষা করুন...',
    waitingForPlayers: 'খেলোয়াড়দের জন্য অপেক্ষা করা হচ্ছে...',
    leaveGame: 'খেলা ছাড়ুন',
    confirmLeave: 'আপনি কি নিশ্চিত খেলা থেকে বের হতে চান?',
    watchIntro: 'Intro দেখুন',
    matchStarting: 'ম্যাচ শুরু হচ্ছে... প্রস্তুত হন!',
    loadingGame: 'গেম লোড হচ্ছে...',
    settings: 'সেটিংস',
    soundAndHaptics: 'SOUND & HAPTICS',
    soundEffects: 'Sound Effects',
    soundEffectsDesc: 'Play sound effects',
    musicTitle: 'Music',
    musicDesc: 'Play background music',
    hapticFeedback: 'Haptic Feedback',
    hapticFeedbackDesc: 'Vibrate on interactions',
    gameplay: 'GAMEPLAY',
    bundleMove: 'Bundle Move',
    bundleMoveDesc: 'Move multiple balls at once',
    colorblindMode: 'Colorblind Mode',
    colorblindModeDesc: 'Add patterns to balls',
    language: 'LANGUAGE',
    theme: 'THEME',
    themeNight: 'Night',
    themeLight: 'Light',
    themeNeon: 'Neon',
    quickMessages: [
      'দারুণ চাল! 🔥',
      'টিমওয়ার্ক সেরা! 🤝',
      'শুভকামনা! 🍀',
      'একটু দেখে চালুন! 😅',
      'ধন্যবাদ! 🤝',
      'ছক্কা লাগবেই! 🎲',
      'বাহ্ দারুণ খেলা! 👏',
      'আহা গুটি গেল! 😭',
      'জয় নিশ্চিত! 👑'
    ]
  },
  en: {
    gameTitle: 'Ps Ludo Master',
    tagline: 'The Authentic Board Game Experience',
    watchIntro: 'Watch Intro',
    matchStarting: 'Match Starting... Get Ready!',
    loadingGame: 'Loading Game...',
    playOffline: 'Play Offline',
    playOnline: 'Online Multiplayer',
    passAndPlay: 'Pass & Play',
    passAndPlayDesc: 'Play with 2-4 friends on one device',
    vsComputer: 'Vs Computer (Bot)',
    vsComputerDesc: 'Sharpen your skills against smart AI',
    createRoom: 'Create Room',
    joinRoom: 'Join Room',
    enterRoomCode: 'Enter Room Code',
    enterYourName: 'Enter Your Name',
    playersCount: 'Player Count',
    twoPlayers: '2 Players',
    threePlayers: '3 Players',
    fourPlayers: '4 Players',
    matchType: 'Match Mode',
    standardMode: '1 vs 1 (Solo Classic)',
    teamMode: '2 vs 2 Diagonal Teams',
    teamModeDesc: 'Diagonally opposite players pair up: Red+Yellow vs Blue+Green!',
    team1Name: 'Team 1 (Red & Yellow)',
    team2Name: 'Team 2 (Blue & Green)',
    teamPartnerHelp: 'When all 4 tokens of a player reach Home, they can move their partner’s tokens!',
    teamNoCaptureRule: 'Teammates cannot capture each other and can share the same square!',
    teamVictory: 'Team Champion Victory!',
    teamScore: 'Team Score',
    selectYourColor: 'Select Your Color',
    startGame: 'Start Game',
    backToMenu: 'Main Menu',
    rollDice: 'Roll Dice',
    yourTurn: 'Your Turn',
    botThinking: 'Computer is thinking...',
    waitingForRoll: 'Waiting to roll...',
    sixBonus: 'Rolled a 6! Bonus turn awarded!',
    capturedPawn: 'Knocked out opponent token!',
    reachedHome: 'Token reached Home!',
    partnerAssist: 'Moving partner’s token!',
    threeSixesPass: 'Three consecutive 6s! Turn forfeited.',
    noLegalMoves: 'No valid moves available. Next turn.',
    winner: 'Winner!',
    firstPlace: '1st Place',
    secondPlace: '2nd Place',
    thirdPlace: '3rd Place',
    fourthPlace: '4th Place',
    defeated: 'Defeated',
    playAgain: 'Play Again',
    rematch: 'Rematch',
    sound: 'Sound FX',
    music: 'Music',
    rules: 'Rules',
    rulesTitle: 'Ludo Official Rules',
    rule1: '1. Roll a 6 to bring a token out of the yard onto the starting track.',
    rule2: '2. Rolling a 6 grants a bonus roll. Three consecutive 6s forfeits the roll.',
    rule3: '3. Landing on an opponent token knocks it back to their yard and earns a bonus roll.',
    rule4: '4. Star squares (★) and starting spots are Safe Zones where tokens cannot be captured.',
    rule5: '5. [Match Ending & Winners] In 2-player mode, the first to finish wins (1st place) and the other loses immediately. In 3-player mode, the first two win (1st & 2nd) and the 3rd loses. In 4-player mode, the first three win (1st, 2nd, 3rd) and the 4th loses immediately (they cannot play alone).',
    rule6: '6. [2v2 Team Mode] Diagonally opposite players are teammates (Red+Yellow and Blue+Green). Teammates cannot capture each other. When a player brings all 4 tokens Home, their rolls move their partner’s tokens. First team with all 8 tokens Home wins!',
    copyCode: 'Copy Code',
    copied: 'Copied!',
    shareRoomHint: 'Share this code with your friends to play together',
    waitingForHost: 'Waiting for host to start...',
    waitingForPlayers: 'Waiting for players to join...',
    leaveGame: 'Leave Game',
    confirmLeave: 'Are you sure you want to exit the current match?',
    settings: 'SETTINGS',
    soundAndHaptics: 'SOUND & HAPTICS',
    soundEffects: 'Sound Effects',
    soundEffectsDesc: 'Play sound effects',
    musicTitle: 'Music',
    musicDesc: 'Play background music',
    hapticFeedback: 'Haptic Feedback',
    hapticFeedbackDesc: 'Vibrate on interactions',
    gameplay: 'GAMEPLAY',
    bundleMove: 'Bundle Move',
    bundleMoveDesc: 'Move multiple balls at once',
    colorblindMode: 'Colorblind Mode',
    colorblindModeDesc: 'Add patterns to balls',
    language: 'LANGUAGE',
    theme: 'THEME',
    themeNight: 'Night',
    themeLight: 'Light',
    themeNeon: 'Neon',
    quickMessages: [
      'Nice move! 🔥',
      'Teamwork makes the dream work! 🤝',
      'Good luck! 🍀',
      'Watch out! 😅',
      'Thank you! 🤝',
      'Need a 6! 🎲',
      'Well played! 👏',
      'Oops knockout! 😭',
      'Victory is mine! 👑'
    ]
  }
};
