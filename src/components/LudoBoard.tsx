import React from 'react';
import { PlayerColor, Token, Player, HoppingTokenInfo } from '../types/ludo';
import {
  getTokenCoordinate,
  Coord,
} from '../utils/ludoConstants';
import { PinPawn } from './PinPawn';

interface LudoBoardProps {
  players: Player[];
  activeColor: PlayerColor;
  movableTokenIds: number[];
  movableColor?: PlayerColor;
  isMyTurn: boolean;
  onSelectToken: (tokenId: number, color?: PlayerColor) => void;
  lang: 'bn' | 'en';
  hoppingInfo?: HoppingTokenInfo | null;
  isTeamMode?: boolean;
}

export const LudoBoard: React.FC<LudoBoardProps> = ({
  players,
  activeColor,
  movableTokenIds,
  movableColor,
  isMyTurn,
  onSelectToken,
  lang,
  hoppingInfo,
  isTeamMode = false,
}) => {
  const toBengaliNum = (num: number, l: 'bn' | 'en') => {
    if (l !== 'bn') return String(num);
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
  };

  const targetMovableColor = movableColor || activeColor;

  // Compute all token positions on the board
  interface PlacedToken {
    token: Token;
    player: Player;
    coord: Coord;
    key: string;
    isMovable: boolean;
  }

  const placedTokens: PlacedToken[] = [];

  players.forEach((player) => {
    player.tokens.forEach((token) => {
      const coord = getTokenCoordinate(player.color, token.id, token.step);
      const isMovable =
        isMyTurn &&
        player.color === targetMovableColor &&
        movableTokenIds.includes(token.id);

      placedTokens.push({
        token,
        player,
        coord,
        key: `${player.color}-${token.id}`,
        isMovable,
      });
    });
  });

  // Group tokens that share the exact same integer grid cell for offset stacking
  const cellGroups = new Map<string, PlacedToken[]>();
  placedTokens.forEach((pt) => {
    const cellKey = `${Math.round(pt.coord[0] * 10) / 10},${Math.round(pt.coord[1] * 10) / 10}`;
    if (!cellGroups.has(cellKey)) {
      cellGroups.set(cellKey, []);
    }
    cellGroups.get(cellKey)!.push(pt);
  });

  // Calculate micro offsets for multiple tokens in the same cell
  const getOffset = (group: PlacedToken[], index: number): { x: number; y: number; scale: number } => {
    if (group.length <= 1) return { x: 0, y: 0, scale: 1 };
    if (group.length === 2) {
      return index === 0 ? { x: -5, y: -5, scale: 0.85 } : { x: 5, y: 5, scale: 0.85 };
    }
    if (group.length === 3) {
      if (index === 0) return { x: 0, y: -6, scale: 0.78 };
      if (index === 1) return { x: -6, y: 5, scale: 0.78 };
      return { x: 6, y: 5, scale: 0.78 };
    }
    const offsets = [
      { x: -5, y: -5 },
      { x: 5, y: -5 },
      { x: -5, y: 5 },
      { x: 5, y: 5 },
    ];
    return { ...offsets[index % 4], scale: 0.75 };
  };

  // Safe track spots with circular ring markers matching the uploaded board photo
  const safeCircleCoords: Coord[] = [
    [8, 2],   // Red safe spot
    [2, 6],   // Green safe spot
    [6, 12],  // Yellow safe spot
    [12, 8],  // Blue safe spot
    [7, 3],   // Green home stretch indicator
  ];

  const isSafeCircleCell = (r: number, c: number) => {
    return safeCircleCoords.some(([sr, sc]) => sr === r && sc === c);
  };

  // Check cell color for home paths, starting positions and safe spots
  const getCellType = (r: number, c: number) => {
    // Green (Top-Left): start at [6, 1], home stretch [7, 1..5], safe spot at [2, 6]
    if (r === 7 && c >= 1 && c <= 5) return 'green-home';
    if (r === 6 && c === 1) return 'green-start';
    if (r === 2 && c === 6) return 'green-safe';

    // Yellow (Top-Right): start at [1, 8], home stretch [1..5, 7], safe spot at [6, 12]
    if (c === 7 && r >= 1 && r <= 5) return 'yellow-home';
    if (r === 1 && c === 8) return 'yellow-start';
    if (r === 6 && c === 12) return 'yellow-safe';

    // Blue (Bottom-Right): start at [8, 13], home stretch [7, 9..13], safe spot at [12, 8]
    if (r === 7 && c >= 9 && c <= 13) return 'blue-home';
    if (r === 8 && c === 13) return 'blue-start';
    if (r === 12 && c === 8) return 'blue-safe';

    // Red (Bottom-Left): start at [13, 6], home stretch [9..13, 7], safe spot at [8, 2]
    if (c === 7 && r >= 9 && r <= 13) return 'red-home';
    if (r === 13 && c === 6) return 'red-start';
    if (r === 8 && c === 2) return 'red-safe';

    return 'neutral';
  };

  return (
    <div className="relative w-full max-w-[500px] aspect-square mx-auto rounded-xl border-4 border-slate-900 bg-white select-none overflow-hidden shadow-2xl">
      {/* 15x15 Base Grid */}
      <div
        className="w-full h-full grid"
        style={{
          gridTemplateColumns: 'repeat(15, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(15, minmax(0, 1fr))',
        }}
      >
        {Array.from({ length: 15 }).map((_, r) =>
          Array.from({ length: 15 }).map((_, c) => {
            const isTopLeftBase = r < 6 && c < 6;
            const isTopRightBase = r < 6 && c >= 9;
            const isBottomRightBase = r >= 9 && c >= 9;
            const isBottomLeftBase = r >= 9 && c < 6;
            const isCenter = r >= 6 && r <= 8 && c >= 6 && c <= 8;

            if (isTopLeftBase || isTopRightBase || isBottomRightBase || isBottomLeftBase || isCenter) {
              return <div key={`${r}-${c}`} className="pointer-events-none" />;
            }

            const cellType = getCellType(r, c);
            const hasSafeCircle = isSafeCircleCell(r, c);

            let bgClass = 'bg-white border-slate-900';

            if (cellType === 'green-home' || cellType === 'green-start' || cellType === 'green-safe') {
              bgClass = 'bg-[#00a651] border-slate-900';
            } else if (cellType === 'yellow-home' || cellType === 'yellow-start' || cellType === 'yellow-safe') {
              bgClass = 'bg-[#ffcb05] border-slate-900';
            } else if (cellType === 'blue-home' || cellType === 'blue-start' || cellType === 'blue-safe') {
              bgClass = 'bg-[#0071bc] border-slate-900';
            } else if (cellType === 'red-home' || cellType === 'red-start' || cellType === 'red-safe') {
              bgClass = 'bg-[#e52427] border-slate-900';
            }

            return (
              <div
                key={`${r}-${c}`}
                className={`border-[1px] ${bgClass} flex items-center justify-center relative`}
              >
                {/* Safe spot concentric ring marker matching board photo */}
                {hasSafeCircle && (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-black/35 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-black/25" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* --- 4 CORNER HOUSES / YARDS (BEAUTIFULLY DECORATED WITH TOKEN COLORS) --- */}

      {/* 1. Top-Left: GREEN HOUSE (সবুজ ঘর) */}
      <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-gradient-to-br from-[#0da644] via-[#059639] to-[#025a21] border-r-2 border-b-2 border-slate-900 flex items-center justify-center relative shadow-inner overflow-hidden">
        {/* Subtle Ornamental Corner Filigree */}
        <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-200/90 rounded-tl pointer-events-none" />
        <div className="absolute top-2 left-2 text-[10px] text-emerald-200/70 font-bold select-none pointer-events-none">🟢</div>

        {/* Rich Layered Dark Green Center Circle */}
        <div className="absolute inset-0 m-auto w-[76%] h-[76%] rounded-full bg-gradient-to-b from-[#006e2e] via-[#005824] to-[#003d18] border-2 border-emerald-400/50 shadow-[inset_0_3px_10px_rgba(0,0,0,0.5),0_0_12px_rgba(16,185,129,0.25)] flex items-center justify-center pointer-events-none">
          {/* Subtle Center Rosette Ring */}
          <div className="w-7 h-7 rounded-full border border-emerald-300/30 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/40" />
          </div>
        </div>

        {/* 4 Beautiful Jewel Sockets Decorated in Green */}
        {[
          { left: '30%', top: '30%' },
          { left: '70%', top: '30%' },
          { left: '30%', top: '70%' },
          { left: '70%', top: '70%' },
        ].map((pos, idx) => (
          <div
            key={idx}
            className="absolute w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white shadow-[0_2px_8px_rgba(5,150,105,0.4)] border-2 border-emerald-600/80 flex items-center justify-center pointer-events-none p-1"
            style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)' }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-100 via-emerald-50 to-white border border-emerald-400 flex items-center justify-center shadow-inner">
              <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-gradient-to-b from-emerald-500 to-green-600 shadow-sm border border-emerald-300" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. Top-Right: YELLOW HOUSE (হলুদ ঘর) */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-gradient-to-bl from-[#ffcb05] via-[#f59e0b] to-[#c26d04] border-l-2 border-b-2 border-slate-900 flex items-center justify-center relative shadow-inner overflow-hidden">
        {/* Subtle Ornamental Corner Filigree */}
        <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-200/90 rounded-tr pointer-events-none" />
        <div className="absolute top-2 right-2 text-[10px] text-amber-100/80 font-bold select-none pointer-events-none">🟡</div>

        {/* Rich Layered Dark Amber Center Circle */}
        <div className="absolute inset-0 m-auto w-[76%] h-[76%] rounded-full bg-gradient-to-b from-[#f39200] via-[#d97706] to-[#9a4e03] border-2 border-amber-300/60 shadow-[inset_0_3px_10px_rgba(0,0,0,0.5),0_0_12px_rgba(245,158,11,0.25)] flex items-center justify-center pointer-events-none">
          {/* Subtle Center Rosette Ring */}
          <div className="w-7 h-7 rounded-full border border-amber-300/35 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-300/50" />
          </div>
        </div>

        {/* 4 Beautiful Jewel Sockets Decorated in Yellow */}
        {[
          { left: '30%', top: '30%' },
          { left: '70%', top: '30%' },
          { left: '30%', top: '70%' },
          { left: '70%', top: '70%' },
        ].map((pos, idx) => (
          <div
            key={idx}
            className="absolute w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white shadow-[0_2px_8px_rgba(217,119,6,0.4)] border-2 border-amber-500/80 flex items-center justify-center pointer-events-none p-1"
            style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)' }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-100 via-amber-50 to-white border border-amber-400 flex items-center justify-center shadow-inner">
              <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-gradient-to-b from-amber-400 to-yellow-500 shadow-sm border border-amber-200" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Bottom-Right: BLUE HOUSE (নীল ঘর) */}
      <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-gradient-to-tl from-[#0284c7] via-[#0071bc] to-[#004785] border-l-2 border-t-2 border-slate-900 flex items-center justify-center relative shadow-inner overflow-hidden">
        {/* Subtle Ornamental Corner Filigree */}
        <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-sky-200/90 rounded-br pointer-events-none" />
        <div className="absolute bottom-2 right-2 text-[10px] text-sky-200/80 font-bold select-none pointer-events-none">🔵</div>

        {/* Rich Layered Dark Navy Center Circle */}
        <div className="absolute inset-0 m-auto w-[76%] h-[76%] rounded-full bg-gradient-to-b from-[#004b87] via-[#003866] to-[#002444] border-2 border-sky-400/50 shadow-[inset_0_3px_10px_rgba(0,0,0,0.5),0_0_12px_rgba(2,132,199,0.25)] flex items-center justify-center pointer-events-none">
          {/* Subtle Center Rosette Ring */}
          <div className="w-7 h-7 rounded-full border border-sky-300/35 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-300/50" />
          </div>
        </div>

        {/* 4 Beautiful Jewel Sockets Decorated in Blue */}
        {[
          { left: '30%', top: '30%' },
          { left: '70%', top: '30%' },
          { left: '30%', top: '70%' },
          { left: '70%', top: '70%' },
        ].map((pos, idx) => (
          <div
            key={idx}
            className="absolute w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white shadow-[0_2px_8px_rgba(2,132,199,0.4)] border-2 border-sky-600/80 flex items-center justify-center pointer-events-none p-1"
            style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)' }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-sky-100 via-sky-50 to-white border border-sky-400 flex items-center justify-center shadow-inner">
              <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-gradient-to-b from-sky-500 to-blue-600 shadow-sm border border-sky-300" />
            </div>
          </div>
        ))}
      </div>

      {/* 4. Bottom-Left: RED HOUSE (লাল ঘর) */}
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-gradient-to-tr from-[#f43f5e] via-[#e52427] to-[#991b1b] border-r-2 border-t-2 border-slate-900 flex items-center justify-center relative shadow-inner overflow-hidden">
        {/* Subtle Ornamental Corner Filigree */}
        <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-rose-200/90 rounded-bl pointer-events-none" />
        <div className="absolute bottom-2 left-2 text-[10px] text-rose-200/80 font-bold select-none pointer-events-none">🔴</div>

        {/* Rich Layered Dark Crimson Center Circle */}
        <div className="absolute inset-0 m-auto w-[76%] h-[76%] rounded-full bg-gradient-to-b from-[#b0171a] via-[#8c1215] to-[#590a0c] border-2 border-rose-400/50 shadow-[inset_0_3px_10px_rgba(0,0,0,0.5),0_0_12px_rgba(225,29,72,0.25)] flex items-center justify-center pointer-events-none">
          {/* Subtle Center Rosette Ring */}
          <div className="w-7 h-7 rounded-full border border-rose-300/35 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-300/50" />
          </div>
        </div>

        {/* 4 Beautiful Jewel Sockets Decorated in Red */}
        {[
          { left: '30%', top: '30%' },
          { left: '70%', top: '30%' },
          { left: '30%', top: '70%' },
          { left: '70%', top: '70%' },
        ].map((pos, idx) => (
          <div
            key={idx}
            className="absolute w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white shadow-[0_2px_8px_rgba(225,29,72,0.4)] border-2 border-rose-600/80 flex items-center justify-center pointer-events-none p-1"
            style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)' }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-rose-100 via-rose-50 to-white border border-rose-400 flex items-center justify-center shadow-inner">
              <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-gradient-to-b from-rose-500 to-red-600 shadow-sm border border-rose-300" />
            </div>
          </div>
        ))}
      </div>

      {/* --- CENTER 3x3 FINISH GOAL (Triangles matching board photo) --- */}
      <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] border-2 border-slate-900 overflow-hidden bg-white">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Left triangle: Green */}
          <polygon points="0,0 50,50 0,100" fill="#00a651" stroke="#0f172a" strokeWidth="1.5" />
          {/* Top triangle: Yellow */}
          <polygon points="0,0 50,50 100,0" fill="#ffcb05" stroke="#0f172a" strokeWidth="1.5" />
          {/* Right triangle: Blue */}
          <polygon points="100,0 50,50 100,100" fill="#0071bc" stroke="#0f172a" strokeWidth="1.5" />
          {/* Bottom triangle: Red */}
          <polygon points="0,100 50,50 100,100" fill="#e52427" stroke="#0f172a" strokeWidth="1.5" />
        </svg>
      </div>

      {/* --- DYNAMIC PAWN TOKENS LAYER (Direct Smooth Pawn Movement) --- */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from(cellGroups.entries()).map(([, group]) => {
          return group.map((pt, idx) => {
            const [row, col] = pt.coord;
            const offset = getOffset(group, idx);

            const leftPercent = ((col + 0.5) / 15) * 100;
            const topPercent = ((row + 0.5) / 15) * 100;

            const isHopping =
              hoppingInfo?.color === pt.player.color &&
              hoppingInfo?.tokenId === pt.token.id;

            return (
              <div
                key={pt.key}
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${
                    isHopping ? 1.25 : offset.scale
                  })`,
                  zIndex: isHopping ? 70 : pt.isMovable ? 40 : 20 + idx,
                }}
                className={`absolute transition-all duration-300 ease-out pointer-events-auto ${
                  pt.isMovable ? 'cursor-pointer hover:scale-125' : ''
                }`}
                onClick={() => {
                  if (pt.isMovable) {
                    onSelectToken(pt.token.id, pt.player.color);
                  }
                }}
              >
                {/* Pulsing indicator halo when token can move */}
                {pt.isMovable && !isHopping && (
                  <span className="absolute -inset-1 rounded-full bg-amber-400 opacity-75 animate-ping pointer-events-none" />
                )}

                {/* THE PIN PAWN */}
                <PinPawn
                  color={pt.player.color}
                  size={30}
                  isHopping={isHopping}
                  className={pt.isMovable ? 'animate-bounce' : ''}
                />
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};
