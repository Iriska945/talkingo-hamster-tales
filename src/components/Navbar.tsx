import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { Flame, Gem, Coins, Trophy, ChevronDown, Sun, Moon, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TalkingoLogo } from './TalkingoLogo';

const LANGUAGES: Array<{ code: Language; label: string; flag: string }> = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'kk', label: 'Қазақша', flag: '🇰🇿' },
];

export const Navbar: React.FC = () => {
  const { lang, setLang, theme, toggleTheme, resources, profile } = useApp();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const currentLangObj = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-[var(--app-nav-bg)] backdrop-blur-2xl border-b border-[var(--app-glass-border)] px-4 py-3 transition-colors duration-300">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Left: Open-style Spaced Logo */}
        <Link to="/learn" className="group active:scale-95 transition-transform">
          <TalkingoLogo size="md" withText={true} />
        </Link>

        {/* Center: Controls (Language Selector + Sun/Moon Theme Toggle + Gallery Link) */}
        <div className="flex items-center gap-2">
          
          {/* Theme Toggle Button (Sun / Moon) */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full bg-[var(--app-glass-bg)] border border-[var(--app-glass-border)] hover:border-[var(--app-glass-border-hover)] flex items-center justify-center text-[var(--app-text)] transition-transform active:scale-90 shadow-sm"
            title={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
            aria-label="Переключить тему"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Language Switcher Liquid Glass Pill */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--app-glass-bg)] border border-[var(--app-glass-border)] hover:border-[var(--app-glass-border-hover)] text-xs font-medium text-[var(--app-text)] transition-all shadow-sm active:scale-95 backdrop-blur-xl"
            >
              <span className="text-sm">{currentLangObj.flag}</span>
              <span className="hidden sm:inline text-neutral-300 dark:text-neutral-300">{currentLangObj.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {langMenuOpen && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-40 liquid-glass-elevated py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      setLang(item.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                      lang === item.code
                        ? 'bg-orange-500/15 text-orange-400 font-semibold'
                        : 'hover:bg-white/[0.08]'
                    }`}
                  >
                    <span className="text-base">{item.flag}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Gallery exhibition pill */}
          <Link
            to="/gallery"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--app-glass-bg)] border border-[var(--app-glass-border)] hover:border-[var(--app-glass-border-hover)] text-xs text-[var(--app-text)] transition-all active:scale-95 backdrop-blur-md"
            title="Галерея сценариев Talkingo (scrn.gallery)"
          >
            <Layers className="w-3.5 h-3.5 text-orange-500" />
            <span className="hidden md:inline text-[11px] font-medium opacity-80">Галерея</span>
          </Link>
        </div>

        {/* Right: Gamification Badges (Liquid Glass Chips) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* League Quick Link */}
          <Link
            to="/leaderboard"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--app-glass-bg)] hover:border-[var(--app-glass-border-hover)] border border-[var(--app-glass-border)] text-xs text-[var(--app-text)] transition-all active:scale-95 shadow-sm backdrop-blur-md"
            title="Таблица лидеров"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline text-[11px] opacity-70 font-medium">Лига</span>
          </Link>

          {/* Streak Flame Pill */}
          <Link
            to="/learn"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 font-bold text-xs text-amber-400 transition-all active:scale-95 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
            title="Дней подряд"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{profile.currentStreak}</span>
          </Link>

          {/* Gems Pill */}
          <Link
            to="/shop"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 font-bold text-xs text-cyan-400 transition-all active:scale-95 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
            title="Алмазы"
          >
            <Gem className="w-3.5 h-3.5 text-cyan-400" />
            <span>{resources.diamonds}</span>
          </Link>

          {/* Coins Pill */}
          <Link
            to="/shop"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/25 font-bold text-xs text-yellow-400 transition-all active:scale-95 shadow-[0_0_12px_rgba(234,179,8,0.15)]"
            title="Монеты"
          >
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span>{resources.coins}</span>
          </Link>
        </div>

      </div>
    </header>
  );
};
