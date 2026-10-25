import React, { useState } from 'react';
import { PlayerColor } from '../types/ludo';
import { COLOR_CONFIG } from '../utils/ludoConstants';
import { sounds } from '../utils/soundEffects';

interface DiceRollerProps {
  value: number | null;
  isRolling: boolean;
  canRoll: boolean;
  color: PlayerColor;
  onRoll: () => void;
  lang: 'bn' | 'en';
  consecutiveSixes?: number;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({
  value,
  isRolling,
  canRoll,
  color,
  onRoll,
  lang,
  consecutiveSixes = 0,
}) => {
  const [animating, setAnimating] = useState(false);
  const colorCfg = COLOR_CONFIG[color];

  const handleRollClick = () => {
    if (!canRoll || isRolling || animating) return;
    setAnimating(true);
    sounds.playDiceRoll();
    onRoll();
    setTimeout(() => {
      setAnimating(false);
    }, 700);
  };

  // Dot matrix mapping for dice faces 1..6
  const renderDots = (num: number) => {
    const dots: boolean[] = Array(9).fill(false);
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
      default:
        dots[4] = true;
    }

    return (
      <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full p-2.5">
        {dots.map((active, i) => (
          <div key={i} className="flex items-center justify-center">
            {active && (
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  num === 6 || num === 1
                    ? colorCfg.bg
                    : 'bg-slate-800'
                } shadow-sm transition-transform`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const rollingDisplay = animating || isRolling;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleRollClick}
        disabled={!canRoll || isRolling || animating}
        aria-label={lang === 'bn' ? 'দান চালুন' : 'Roll Dice'}
        className={`group relative p-1 rounded-2xl transition-all duration-300 ${
          canRoll && !isRolling
            ? 'scale-105 cursor-pointer ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-900 animate-pulse-glow'
            : 'opacity-85 cursor-not-allowed'
        }`}
      >
        {/* Dice Face Container */}
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-200 border-2 border-slate-300 shadow-xl flex items-center justify-center overflow-hidden transition-all duration-500 ${
            rollingDisplay ? 'rotate-[720deg] scale-95 shadow-inner' : 'hover:rotate-6'
          }`}
        >
          {value ? renderDots(value) : renderDots(6)}
        </div>

        {/* Rolling ripple or prompt badge */}
        {canRoll && !rollingDisplay && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500 text-[10px] font-bold text-slate-950 items-center justify-center">
              !
            </span>
          </span>
        )}
      </button>

      {/* Value readout / prompt */}
      <div className="text-center">
        {value !== null && !rollingDisplay ? (
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
              {lang === 'bn' ? 'দান' : 'Roll'}:
            </span>
            <span className="text-lg font-bold font-display text-amber-400">
              {value}
            </span>
            {value === 6 && (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                {lang === 'bn' ? 'ছক্কা!' : 'Bonus!'}
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-medium">
            {canRoll
              ? lang === 'bn'
                ? 'দান চালুন 🎲'
                : 'Tap to Roll 🎲'
              : lang === 'bn'
              ? 'অপেক্ষা করুন...'
              : 'Waiting...'}
          </span>
        )}
      </div>

      {consecutiveSixes > 0 && (
        <div className="flex items-center gap-1 text-[11px] text-amber-300">
          <span>{lang === 'bn' ? 'টানা ছক্কা:' : 'Consecutive 6s:'}</span>
          <span className="font-bold">{consecutiveSixes}/3</span>
        </div>
      )}
    </div>
  );
};
