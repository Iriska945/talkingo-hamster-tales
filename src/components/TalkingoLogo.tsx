import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  className?: string;
}

export const TalkingoLogo: React.FC<LogoProps> = ({
  size = 'md',
  withText = false,
  className = '',
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', text: 'text-base', badge: 'text-[9px]' },
    md: { box: 'w-9 h-9', text: 'text-lg', badge: 'text-[10px]' },
    lg: { box: 'w-14 h-14', text: 'text-2xl', badge: 'text-xs' },
    xl: { box: 'w-20 h-20', text: 'text-3xl', badge: 'text-sm' },
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Iconic Vector Hamster Mascot + Speech Wave */}
      <div className={`relative ${current.box} shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm hover:scale-105 transition-transform"
        >
          {/* Ambient soft glow filter */}
          <defs>
            <linearGradient id="hamsterGlow" x1="16" y1="16" x2="84" y2="84" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F8BA44" />
              <stop offset="0.6" stopColor="#EE9126" />
              <stop offset="1" stopColor="#E26A2C" />
            </linearGradient>
            <linearGradient id="earInner" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#FBE9D0" />
              <stop offset="1" stopColor="#F4D2A7" />
            </linearGradient>
          </defs>

          {/* Left Ear */}
          <circle cx="25" cy="22" r="14" fill="#EE9126" />
          <circle cx="25" cy="22" r="8" fill="url(#earInner)" />

          {/* Right Ear */}
          <circle cx="75" cy="22" r="14" fill="#EE9126" />
          <circle cx="75" cy="22" r="8" fill="url(#earInner)" />

          {/* Main Head: Organic Pebble / Speech Bubble Shape */}
          <path
            d="M50 18 C 76 18, 86 34, 86 56 C 86 78, 72 88, 50 88 C 36 88, 28 84, 18 92 C 17 84, 14 74, 14 56 C 14 34, 24 18, 50 18 Z"
            fill="url(#hamsterGlow)"
          />

          {/* Cheerful Soft Cheeks Area */}
          <ellipse cx="50" cy="62" rx="24" ry="18" fill="#FFFDF9" />

          {/* Left Blush */}
          <ellipse cx="28" cy="60" rx="5" ry="4" fill="#FCA5A5" opacity="0.6" />
          {/* Right Blush */}
          <ellipse cx="72" cy="60" rx="5" ry="4" fill="#FCA5A5" opacity="0.6" />

          {/* Calm, Mindful Eyes (Warm Dark Slate) */}
          <circle cx="38" cy="46" r="4.5" fill="#1C1A17" />
          <circle cx="39.5" cy="44.5" r="1.8" fill="#FFFFFF" />

          <circle cx="62" cy="46" r="4.5" fill="#1C1A17" />
          <circle cx="63.5" cy="44.5" r="1.8" fill="#FFFFFF" />

          {/* Little Triangle Nose */}
          <path
            d="M48 54 Q 50 52 52 54 L 50 57 Z"
            fill="#E26A2C"
          />

          {/* Gentle Smile */}
          <path
            d="M45 59 Q 47.5 62 50 60 Q 52.5 62 55 59"
            stroke="#1C1A17"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Sound Wave Rings Radiating from speech tail */}
          <path
            d="M91 44 C 94 48, 94 54, 91 58"
            stroke="#3F634D"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M96 38 C 101 45, 101 57, 96 64"
            stroke="#3F634D"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* Brand Wordmark (Clean Editorial Look) */}
      {withText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`${current.text} font-bold text-[#1C1A17] tracking-tight font-sans`}>
              talkingo
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#3F634D]" />
            <span className={`px-2 py-0.5 rounded-full bg-[#E8EFEA] text-[#3F634D] font-bold ${current.badge} tracking-wider uppercase`}>
              ai
            </span>
          </div>
          <span className="text-[10px] font-medium text-[#78746D] tracking-wide mt-1">
            осознанная речь
          </span>
        </div>
      )}
    </div>
  );
};
