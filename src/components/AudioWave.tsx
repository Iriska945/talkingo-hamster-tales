import React from 'react';

interface AudioWaveProps {
  active: boolean;
  color?: string;
  barsCount?: number;
}

export const AudioWave: React.FC<AudioWaveProps> = ({
  active,
  color = 'bg-white',
  barsCount = 11,
}) => {
  const multipliers = [0.35, 0.65, 1.1, 0.85, 1.5, 0.9, 1.3, 0.75, 1.1, 0.55, 0.35];

  return (
    <div className="flex items-center justify-center gap-1.5 h-8 px-2 select-none">
      {multipliers.slice(0, barsCount).map((scale, i) => (
        <span
          key={i}
          className={`w-1 rounded-full transition-all duration-200 ${color} ${
            active ? 'opacity-95 shadow-[0_0_8px_rgba(255,255,255,0.7)]' : 'h-1.5 opacity-20'
          }`}
          style={{
            height: active ? `${Math.max(6, scale * 26)}px` : '4px',
            animation: active ? `wavePulse 1.2s ease-in-out infinite` : 'none',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};
