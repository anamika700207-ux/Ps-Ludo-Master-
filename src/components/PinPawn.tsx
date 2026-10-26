import React from 'react';
import { PlayerColor } from '../types/ludo';

interface PinPawnProps {
  color: PlayerColor;
  size?: number; // width and height in px
  className?: string;
  isHopping?: boolean;
}

export const PinPawn: React.FC<PinPawnProps> = ({
  color,
  size = 20, // Compact, refined circular token
  className = '',
  isHopping = false,
}) => {
  // Vibrant, rich color palette for the circular tokens
  const colorMap = {
    red: {
      fillTop: '#ff4d4f',
      fillBase: '#e52427',
      fillDark: '#b0171a',
      ringOutline: '#820005',
      innerRing: '#ffffff',
      centerDot: '#ffffff',
      shadowColor: 'rgba(176, 23, 26, 0.55)',
    },
    green: {
      fillTop: '#22c55e',
      fillBase: '#0da644',
      fillDark: '#076f2d',
      ringOutline: '#03471c',
      innerRing: '#ffffff',
      centerDot: '#ffffff',
      shadowColor: 'rgba(7, 111, 45, 0.55)',
    },
    yellow: {
      fillTop: '#fde047',
      fillBase: '#fed215',
      fillDark: '#eab308',
      ringOutline: '#92400e',
      innerRing: '#ffffff',
      centerDot: '#ffffff',
      shadowColor: 'rgba(217, 119, 6, 0.55)',
    },
    blue: {
      fillTop: '#38bdf8',
      fillBase: '#0071bc',
      fillDark: '#004785',
      ringOutline: '#002a52',
      innerRing: '#ffffff',
      centerDot: '#ffffff',
      shadowColor: 'rgba(0, 71, 133, 0.55)',
    },
  };

  const c = colorMap[color];
  const gradientId = `token-grad-${color}`;

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center select-none transition-transform duration-200 ${
        isHopping ? 'scale-115' : ''
      } ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
        style={{
          filter: `drop-shadow(0 3px 5px ${c.shadowColor})`,
        }}
      >
        <defs>
          {/* Main 3D spherical dome gradient */}
          <radialGradient id={gradientId} cx="36%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="25%" stopColor={c.fillTop} />
            <stop offset="70%" stopColor={c.fillBase} />
            <stop offset="100%" stopColor={c.fillDark} />
          </radialGradient>

          {/* Gloss highlight on top edge */}
          <linearGradient id={`gloss-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* 1. Base dark contour rim */}
        <circle cx="50" cy="50" r="48" fill={c.ringOutline} />

        {/* 2. Crisp White Outer Ring for unmistakable board contrast */}
        <circle cx="50" cy="50" r="45" fill="#ffffff" />

        {/* 3. Outer Color Bevel Ring */}
        <circle cx="50" cy="50" r="39" fill={c.fillDark} />

        {/* 4. Domed Vibrant Circular Body */}
        <circle cx="50" cy="50" r="36" fill={`url(#${gradientId})`} />

        {/* 5. Inner White Concentric Ring */}
        <circle
          cx="50"
          cy="50"
          r="24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.5"
          opacity="0.85"
        />

        {/* 6. Center Concentric Jewel Dot */}
        <circle cx="50" cy="50" r="12" fill={c.fillBase} stroke={c.ringOutline} strokeWidth="1.5" />
        <circle cx="50" cy="50" r="5" fill="#ffffff" opacity="0.9" />

        {/* 7. Specular 3D Gloss Sheen */}
        <ellipse cx="44" cy="36" rx="14" ry="7" fill={`url(#gloss-${color})`} transform="rotate(-20 44 36)" />
      </svg>
    </div>
  );
};
