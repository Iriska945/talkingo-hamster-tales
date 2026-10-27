import React from 'react';

interface AudioWaveProps {
  active: boolean;
  color?: string;
}

export const AudioWave: React.FC<AudioWaveProps> = ({ active, color = 'bg-white' }) => {
  return (
    <div className="flex items-center justify-center gap-1.5 h-8">
      {[0.4, 0.8, 1.2, 0.6, 0.9, 0.5, 1.1, 0.7].map((heightScale, i) => (
        <span
          key={i}
          className={`w-1.5 rounded-full transition-all duration-150 ${color} ${
            active ? 'animate-pulse' : 'h-1.5 opacity-40'
          }`}
          style={{
            height: active ? `${Math.max(6, heightScale * 26)}px` : '6px',
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s',
          }}
        />
      ))}
    </div>
  );
};
