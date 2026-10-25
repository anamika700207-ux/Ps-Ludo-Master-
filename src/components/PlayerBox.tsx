import React from 'react';
import { Player, PlayerColor } from '../types/ludo';
import { PinPawn } from './PinPawn';
import { sounds } from '../utils/soundEffects';
import { getTeamIdForColor, TEAM_CONFIG } from '../utils/ludoConstants';

interface PlayerBoxProps {
  player: Player;
  isActive: boolean;
  diceValue: number | null;
  isRolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
  orientation: 'left' | 'right'; // left: avatar on left, dice on right; right: dice on left, avatar on right
  playerName: string;
  isTeamMode?: boolean;
}

export const PlayerBox: React.FC<PlayerBoxProps> = ({
  player,
  isActive,
  diceValue,
  isRolling,
  canRoll,
  onRoll,
  orientation,
  playerName,
  isTeamMode = false,
}) => {
  const handleDiceClick = () => {
    if (isActive && canRoll && !isRolling) {
      sounds.playDiceRoll();
      onRoll();
    }
  };

  // Render dots for the dice face inside the tray
  const renderDiceFace = (val: number | null) => {
    const dots: boolean[] = Array(9).fill(false);
    const num = val || 1;

    switch (num) {
      case 1:
        dots[4] = true;
        break;
      case 2:
        dots[0] = true;
        dots[8] = true;
        break;
      case 3:
        dots[0] = true;
        dots[4] = true;
        dots[8] = true;
        break;
      case 4:
        dots[0] = true;
        dots[2] = true;
        dots[6] = true;
        dots[8] = true;
        break;
      case 5:
        dots[0] = true;
        dots[2] = true;
        dots[4] = true;
        dots[6] = true;
        dots[8] = true;
        break;
      case 6:
        dots[0] = true;
        dots[2] = true;
        dots[3] = true;
        dots[5] = true;
        dots[6] = true;
        dots[8] = true;
        break;
    }

    return (
      <div
        onClick={handleDiceClick}
        className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-gradient-to-b from-white via-slate-50 to-slate-200 border-2 border-slate-300 shadow-md flex items-center justify-center cursor-pointer transition-all ${
          isRolling ? 'rotate-[720deg] scale-95 duration-500' : 'hover:scale-105 active:scale-95'
        } ${isActive && canRoll ? 'ring-2 ring-amber-400 animate-pulse' : ''}`}
      >
        <div className="grid grid-cols-3 grid-rows-3 gap-0.5 sm:gap-1 w-full h-full p-2">
          {dots.map((active, idx) => (
            <div key={idx} className="flex items-center justify-center">
              {active && (
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-slate-900 shadow-sm" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex items-center gap-1.5 select-none">
      {/* Turn Arrow Indicator when orientation is right and arrow points towards dice */}
      {isActive && orientation === 'right' && (
        <div className="flex items-center justify-center animate-bounce -mr-1 z-20">
          <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-8 sm:h-8 filter drop-shadow">
            <polygon points="4,12 18,4 18,20" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
            <polygon points="7,12 16,6 16,18" fill="#fbbf24" />
          </svg>
        </div>
      )}

      {/* Outer Blue Container with Yellow Border (Exact match to user screenshot) */}
      <div className="flex items-stretch p-1 sm:p-1.5 bg-gradient-to-b from-[#006bd6] via-[#005bb8] to-[#004894] rounded-xl sm:rounded-2xl border-[3px] sm:border-4 border-[#ffcb05] shadow-lg overflow-hidden">
        {orientation === 'left' ? (
          <>
            {/* Left Compartment: Avatar / PinPawn */}
            <div className="w-11 h-12 sm:w-14 sm:h-15 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#0058b8] to-[#003e85] border border-[#268eff] flex items-center justify-center shadow-inner relative overflow-hidden">
              <PinPawn color={player.color} size={28} />
              {isTeamMode && (
                <div className="absolute top-0 inset-x-0 bg-black/75 py-0.5 px-0.5 text-center">
                  <span className="text-[7.5px] sm:text-[9px] font-black text-amber-300 whitespace-nowrap">
                    {player.color === 'red' || player.color === 'yellow' ? 'টিম ১ 🔴🟡' : 'টিম ২ 🔵🟢'}
                  </span>
                </div>
              )}
            </div>

            {/* Right Compartment: Soft Pink/Cream Dice Tray */}
            <div className="w-12 h-12 sm:w-15 sm:h-15 ml-1 sm:ml-1.5 rounded-lg sm:rounded-xl bg-[#fedae5] border-2 border-[#fbaec3] shadow-inner flex items-center justify-center relative">
              {isActive ? (
                renderDiceFace(diceValue)
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#f9c3d4]/50 border border-[#f599b5]/40 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-rose-300 opacity-60">🎲</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Left Compartment: Soft Pink/Cream Dice Tray */}
            <div className="w-12 h-12 sm:w-15 sm:h-15 mr-1 sm:ml-0 rounded-lg sm:rounded-xl bg-[#fedae5] border-2 border-[#fbaec3] shadow-inner flex items-center justify-center relative">
              {isActive ? (
                renderDiceFace(diceValue)
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#f9c3d4]/50 border border-[#f599b5]/40 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-rose-300 opacity-60">🎲</span>
                </div>
              )}
            </div>

            {/* Right Compartment: Avatar / PinPawn */}
            <div className="w-11 h-12 sm:w-14 sm:h-15 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#0058b8] to-[#003e85] border border-[#268eff] flex items-center justify-center shadow-inner relative overflow-hidden">
              <PinPawn color={player.color} size={28} />
              {isTeamMode && (
                <div className="absolute top-0 inset-x-0 bg-black/75 py-0.5 px-0.5 text-center">
                  <span className="text-[7.5px] sm:text-[9px] font-black text-sky-300 whitespace-nowrap">
                    {player.color === 'red' || player.color === 'yellow' ? 'টিম ১ 🔴🟡' : 'টিম ২ 🔵🟢'}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Turn Arrow Indicator when orientation is left and arrow points towards dice */}
      {isActive && orientation === 'left' && (
        <div className="flex items-center justify-center animate-bounce -ml-1 z-20">
          <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-8 sm:h-8 filter drop-shadow">
            <polygon points="20,12 6,4 6,20" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
            <polygon points="17,12 8,6 8,18" fill="#fbbf24" />
          </svg>
        </div>
      )}
    </div>
  );
};

