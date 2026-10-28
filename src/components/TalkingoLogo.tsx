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
    sm: { box: 'w-7 h-7', text: 'text-xs', badge: 'text-[8px]' },
    md: { box: 'w-8 h-8', text: 'text-sm', badge: 'text-[9px]' },
    lg: { box: 'w-12 h-12', text: 'text-lg', badge: 'text-[10px]' },
    xl: { box: 'w-16 h-16', text: 'text-2xl', badge: 'text-xs' },
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Liquid Glass Orb / Acoustic Lens Icon */}
      <div className={`relative ${current.box} shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(251,191,36,0.35)] hover:scale-105 transition-transform"
        >
          <defs>
            {/* Ambient Glass Gradients */}
            <radialGradient id="liquidOrbCore" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="25%" stopColor="#FDE68A" stopOpacity="0.8" />
              <stop offset="65%" stopColor="#F59E0B" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.95" />
            </radialGradient>
            <linearGradient id="glassSpecular" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ringGlow" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60A5FA" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Ethereal Outer Acoustic Wave */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="url(#ringGlow)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.6"
          />

          {/* Liquid Glass Sphere Body */}
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="url(#liquidOrbCore)"
            stroke="url(#glassSpecular)"
            strokeWidth="1.5"
          />

          {/* Subtle Top Specular Glass Reflection */}
          <ellipse
            cx="44"
            cy="32"
            rx="18"
            ry="9"
            fill="#FFFFFF"
            opacity="0.35"
          />

          {/* Minimalist Friendly Character Eyes & Smile */}
          <circle cx="41" cy="48" r="3.2" fill="#09090C" />
          <circle cx="42" cy="46.8" r="1.1" fill="#FFFFFF" />

          <circle cx="59" cy="48" r="3.2" fill="#09090C" />
          <circle cx="60" cy="46.8" r="1.1" fill="#FFFFFF" />

          {/* Gentle Joyful Arc */}
          <path
            d="M45 56 C 47.5 59, 52.5 59, 55 56"
            stroke="#09090C"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Sound Wave Resonance Dots */}
          <circle cx="86" cy="44" r="2.5" fill="#38BDF8" opacity="0.8" />
          <circle cx="92" cy="50" r="2" fill="#A855F7" opacity="0.6" />
        </svg>
      </div>

      {/* Editorial Open-Style Spaced Wordmark */}
      {withText && (
        <div className="flex flex-col shrink-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`${current.text} font-bold text-[var(--app-text)] tracking-wider uppercase font-sans`}>
              talkingo
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#ff6b1a] shrink-0" />
            <span className={`px-1.5 py-0.5 rounded-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] text-[var(--app-text)] font-semibold ${current.badge} tracking-wider uppercase shrink-0`}>
              ai
            </span>
          </div>
          <span className="hidden sm:block text-[9px] font-medium opacity-60 tracking-wider uppercase mt-1">
            mindful speech
          </span>
        </div>
      )}
    </div>
  );
};
