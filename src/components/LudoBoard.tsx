import React from 'react';
import { PlayerColor, Token, Player, HoppingTokenInfo } from '../types/ludo';
import {
  getTokenCoordinate,
  Coord,
  YARD_SOCKET_POSITIONS,
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
    // If in yard (step === -1), each token has its own independent socket
    const cellKey =
      pt.token.step === -1
        ? `${pt.player.color}-yard-${pt.token.id}`
        : `${Math.round(pt.coord[0] * 10) / 10},${Math.round(pt.coord[1] * 10) / 10}`;

    if (!cellGroups.has(cellKey)) {
      cellGroups.set(cellKey, []);
    }
    cellGroups.get(cellKey)!.push(pt);
  });

  // Calculate micro offsets & dynamic reduction scaling when multiple tokens share the same cell
  const getOffset = (group: PlacedToken[], index: number): { x: number; y: number; scale: number } => {
    // Single token or yard token: always centered at standard scale
    if (group.length <= 1) return { x: 0, y: 0, scale: 1.0 };

    // 2 tokens: slightly offset diagonally so both are clear
    if (group.length === 2) {
      return index === 0
        ? { x: -3.5, y: -3.5, scale: 0.82 }
        : { x: 3.5, y: 3.5, scale: 0.82 };
    }

    // 3 tokens: triangle formation
    if (group.length === 3) {
      if (index === 0) return { x: 0, y: -4.5, scale: 0.72 };
      if (index === 1) return { x: -4.5, y: 4, scale: 0.72 };
      return { x: 4.5, y: 4, scale: 0.72 };
    }

    // 4 tokens: 2x2 grid
    if (group.length === 4) {
      const offsets = [
        { x: -4, y: -4 },
        { x: 4, y: -4 },
        { x: -4, y: 4 },
        { x: 4, y: 4 },
      ];
      return { ...offsets[index % 4], scale: 0.62 };
    }

    // 5+ tokens: circle formation
    const angle = (index / group.length) * Math.PI * 2;
    const radius = 5.5;
    return {
      x: Math.round(Math.cos(angle) * radius * 10) / 10,
      y: Math.round(Math.sin(angle) * radius * 10) / 10,
      scale: 0.52,
    };
  };

  // Safe track spots with stars (☆) matching classic reference board photo
  const isSafeStarCell = (r: number, c: number) => {
    return (
      (r === 8 && c === 2) ||  // Red safe star
      (r === 2 && c === 6) ||  // Green safe star
      (r === 6 && c === 12) || // Yellow safe star
      (r === 12 && c === 8)    // Blue safe star
    );
  };

  // Check cell color for home paths, starting positions and safe spots
  const getCellType = (r: number, c: number) => {
    // Red (Top-Left): start at [6, 1], home stretch [7, 1..5]
    if (r === 7 && c >= 1 && c <= 5) return 'red-home';
    if (r === 6 && c === 1) return 'red-start';

    // Green (Top-Right): start at [1, 8], home stretch [1..5, 7]
    if (c === 7 && r >= 1 && r <= 5) return 'green-home';
    if (r === 1 && c === 8) return 'green-start';

    // Yellow (Bottom-Right): start at [8, 13], home stretch [7, 9..13]
    if (r === 7 && c >= 9 && c <= 13) return 'yellow-home';
    if (r === 8 && c === 13) return 'yellow-start';

    // Blue (Bottom-Left): start at [13, 6], home stretch [9..13, 7]
    if (c === 7 && r >= 9 && r <= 13) return 'blue-home';
    if (r === 13 && c === 6) return 'blue-start';

    return 'neutral';
  };

  return (
    <div className="relative w-full max-w-[500px] aspect-square mx-auto rounded-2xl border-4 border-[#17345b] bg-white select-none overflow-hidden shadow-2xl shadow-black/50">
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
            const hasStar = isSafeStarCell(r, c);

            let bgClass = 'bg-white';
            let borderClass = 'border-[#7d8d9f]/70';

            if (cellType === 'red-home' || cellType === 'red-start') {
              bgClass = 'bg-[#ed3038] text-white';
            } else if (cellType === 'green-home' || cellType === 'green-start') {
              bgClass = 'bg-[#19a85b] text-white';
            } else if (cellType === 'yellow-home' || cellType === 'yellow-start') {
              bgClass = 'bg-[#ffc928] text-slate-900';
            } else if (cellType === 'blue-home' || cellType === 'blue-start') {
              bgClass = 'bg-[#1677e8] text-white';
            }

            return (
              <div
                key={`${r}-${c}`}
                className={`border-[0.5px] ${borderClass} ${bgClass} flex items-center justify-center relative font-bold`}
              >
                {/* Safe spot star marker matching reference image */}
                {hasStar && (
                  <span className="text-[#64748b] text-sm sm:text-base select-none pointer-events-none leading-none">
                    ☆
                  </span>
                )}

                {/* Starting direction arrows on starting cells */}
                {cellType === 'red-start' && (
                  <div className="flex flex-col items-center justify-center leading-none text-white select-none pointer-events-none">
                    <span className="text-[14px] sm:text-[16px] font-black">→</span>
                  </div>
                )}
                {cellType === 'green-start' && (
                  <div className="flex flex-col items-center justify-center leading-none text-white select-none pointer-events-none">
                    <span className="text-[14px] sm:text-[16px] font-black">↓</span>
                  </div>
                )}
                {cellType === 'yellow-start' && (
                  <div className="flex flex-col items-center justify-center leading-none text-slate-900 select-none pointer-events-none">
                    <span className="text-[14px] sm:text-[16px] font-black">←</span>
                  </div>
                )}
                {cellType === 'blue-start' && (
                  <div className="flex flex-col items-center justify-center leading-none text-white select-none pointer-events-none">
                    <span className="text-[14px] sm:text-[16px] font-black">↑</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* --- 4 CORNER HOUSES / YARDS (MATCHING USER REFERENCE SCREENSHOT) --- */}

      {/* 1. Corner Colored Yard Panels (40% x 40% in each corner) */}
      <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-[#ed3038] border-r-2 border-b-2 border-[#17345b] shadow-inner pointer-events-none" />
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[#19a85b] border-l-2 border-b-2 border-[#17345b] shadow-inner pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-[#ffc928] border-l-2 border-t-2 border-[#17345b] shadow-inner pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-[#1677e8] border-r-2 border-t-2 border-[#17345b] shadow-inner pointer-events-none" />

      {/* 2. Inner White Rounded Yard Bases (28% x 28% centered in each corner) */}
      <div className="absolute top-[6%] left-[6%] w-[28%] h-[28%] bg-white rounded-2xl border border-black/10 shadow-sm pointer-events-none" />
      <div className="absolute top-[6%] left-[66%] w-[28%] h-[28%] bg-white rounded-2xl border border-black/10 shadow-sm pointer-events-none" />
      <div className="absolute top-[66%] left-[66%] w-[28%] h-[28%] bg-white rounded-2xl border border-black/10 shadow-sm pointer-events-none" />
      <div className="absolute top-[66%] left-[6%] w-[28%] h-[28%] bg-white rounded-2xl border border-black/10 shadow-sm pointer-events-none" />

      {/* 3. 16 Circular Resting Sockets (Rendered directly from YARD_SOCKET_POSITIONS for 100% exact alignment) */}
      {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((color) => {
        const sockets = YARD_SOCKET_POSITIONS[color];
        const ringBorder =
          color === 'red'
            ? 'border-[#ed3038] bg-rose-50/70'
            : color === 'green'
            ? 'border-[#19a85b] bg-emerald-50/70'
            : color === 'yellow'
            ? 'border-[#ffc928] bg-amber-50/70'
            : 'border-[#1677e8] bg-sky-50/70';
        const innerDot =
          color === 'red'
            ? 'bg-[#ed3038]/15 border-[#ed3038]/30'
            : color === 'green'
            ? 'bg-[#19a85b]/15 border-[#19a85b]/30'
            : color === 'yellow'
            ? 'bg-[#ffc928]/20 border-[#ffc928]/40'
            : 'bg-[#1677e8]/15 border-[#1677e8]/30';

        return sockets.map((pos, idx) => (
          <div
            key={`${color}-socket-${idx}`}
            className={`absolute w-[9.2%] h-[9.2%] rounded-full border-[2.5px] ${ringBorder} flex items-center justify-center pointer-events-none shadow-inner`}
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className={`w-[60%] h-[60%] rounded-full ${innerDot} border`} />
          </div>
        ));
      })}

      {/* 4. Player Custom Names Displayed on Each Corner House ("প্লেয়ার এর ঘর অনুযায়ী নিচে ছোট্ট করে লেখা") */}
      {players.map((p) => {
        const isRed = p.color === 'red';
        const isGreen = p.color === 'green';
        const isBlue = p.color === 'blue';
        const isYellow = p.color === 'yellow';

        const leftPos = isRed || isBlue ? '20%' : '80%';
        const topPos = isRed || isGreen ? '34.8%' : '94.8%';

        const badgeBorder =
          isRed
            ? 'border-red-300/70 bg-red-950/90 text-red-100 shadow-red-900/40'
            : isGreen
            ? 'border-emerald-300/70 bg-emerald-950/90 text-emerald-100 shadow-emerald-900/40'
            : isYellow
            ? 'border-amber-300/70 bg-amber-950/90 text-amber-100 shadow-amber-900/40'
            : 'border-blue-300/70 bg-blue-950/90 text-blue-100 shadow-blue-900/40';

        return (
          <div
            key={`house-name-${p.color}`}
            className="absolute z-25 pointer-events-none flex flex-col items-center justify-center max-w-[34%]"
            style={{
              left: leftPos,
              top: topPos,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className={`px-2 py-0.5 rounded-full border shadow-md flex items-center justify-center gap-1 ${badgeBorder} backdrop-blur-sm max-w-full`}
            >
              <span className="text-[9px] sm:text-[10.5px] font-black truncate max-w-[85px] sm:max-w-[105px] tracking-tight leading-none drop-shadow">
                {p.name}
              </span>
            </div>
          </div>
        );
      })}

      {/* --- CENTER 3x3 FINISH GOAL (Classic 4 Triangles matching reference) --- */}
      <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] border-2 border-[#17345b] overflow-hidden bg-white">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Left triangle: Red (meets Red home lane) */}
          <polygon points="0,0 50,50 0,100" fill="#ed3038" stroke="#17345b" strokeWidth="1" />
          {/* Top triangle: Green (meets Green home lane) */}
          <polygon points="0,0 50,50 100,0" fill="#19a85b" stroke="#17345b" strokeWidth="1" />
          {/* Right triangle: Yellow (meets Yellow home lane) */}
          <polygon points="100,0 50,50 100,100" fill="#ffc928" stroke="#17345b" strokeWidth="1" />
          {/* Bottom triangle: Blue (meets Blue home lane) */}
          <polygon points="0,100 50,50 100,100" fill="#1677e8" stroke="#17345b" strokeWidth="1" />
          {/* Center Goal Circle */}
          <circle cx="50" cy="50" r="16" fill="#ffffff" stroke="#17345b" strokeWidth="1.5" />
          {/* Crown Emblem in the Center */}
          <text
            x="50"
            y="56"
            textAnchor="middle"
            fontSize="18"
            className="select-none pointer-events-none"
          >
            👑
          </text>
        </svg>
      </div>

      {/* --- DYNAMIC PAWN TOKENS LAYER (Exact Responsive Sizing & Center-Aligned Positioning) --- */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {Array.from(cellGroups.entries()).map(([, group]) => {
          return group.map((pt, idx) => {
            const [row, col] = pt.coord;
            const offset = getOffset(group, idx);

            const isYard = pt.token.step === -1;
            // Home Area token diameter: 8.2% of board (fits centered inside the 9.2% socket ring)
            // Track token diameter: 5.2% of board (~78% of a cell's 6.667% width)
            const tokenSizePercent = isYard ? 8.2 : 5.2;

            // When in yard, use exact socket centers to eliminate any displacement
            let leftPercent: number;
            let topPercent: number;

            if (isYard) {
              const socketPos = YARD_SOCKET_POSITIONS[pt.player.color][pt.token.id];
              leftPercent = socketPos.left;
              topPercent = socketPos.top;
            } else {
              const [row, col] = pt.coord;
              leftPercent = ((col + 0.5) / 15) * 100;
              topPercent = ((row + 0.5) / 15) * 100;
            }

            const isHopping =
              hoppingInfo?.color === pt.player.color &&
              hoppingInfo?.tokenId === pt.token.id;

            const isTurnPlayer = pt.player.color === (movableColor || activeColor);

            // User requirement: "আর যে গুটির চাল থাকবে সে গুটি অন্যান্য গুলির তুলনায় একটু বড় দেখা যাবে।"
            // When token has a valid move on this turn (pt.isMovable), it scales up by 1.25x so it's clearly larger!
            // Also turn player's tokens scale up slightly (1.08x) to signal whose turn it is.
            const turnScale = pt.isMovable ? 1.25 : isTurnPlayer ? 1.08 : 1.0;
            const finalScale = offset.scale * turnScale;

            return (
              <div
                key={pt.key}
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  width: `${tokenSizePercent}%`,
                  height: `${tokenSizePercent}%`,
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${finalScale})`,
                  zIndex: isHopping ? 70 : pt.isMovable ? 50 : isTurnPlayer ? 35 + idx : 20 + idx,
                }}
                className={`absolute transition-all duration-300 ease-out pointer-events-auto flex items-center justify-center ${
                  pt.isMovable ? 'cursor-pointer hover:scale-135' : ''
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

                {/* Turn highlight halo for active player's tokens */}
                {isTurnPlayer && !pt.isMovable && !isHopping && (
                  <span className="absolute -inset-0.5 rounded-full ring-1 ring-amber-300/40 pointer-events-none" />
                )}

                {/* The User's Exact PinPawn Token (Scaled to 100% of wrapper container) */}
                <PinPawn
                  color={pt.player.color}
                  size="100%"
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
