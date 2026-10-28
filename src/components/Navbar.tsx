import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import {
  Flame,
  Gem,
  Coins,
  Trophy,
  ChevronDown,
  Sun,
  Moon,
  Layers,
  BookOpen,
  Bookmark,
  ShoppingBag,
  User,
  Mic,
} from 'lucide-react';
import { TalkingoLogo } from './TalkingoLogo';

const LANGUAGES: Array<{ code: Language; label: string; flag: string }> = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'kk', label: 'Қазақша', flag: '🇰🇿' },
];

export const Navbar: React.FC = () => {
  const { lang, setLang, theme, toggleTheme, resources, profile, t } = useApp();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const location = useLocation();

  const currentLangObj = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  const desktopNavLinks = [
    { to: '/learn', label: t('navLearn'), icon: BookOpen },
    { to: '/dictionary', label: t('navDict'), icon: Bookmark },
    { to: '/shop', label: t('navShop'), icon: ShoppingBag },
    { to: '/leaderboard', label: t('navLeague'), icon: Trophy },
    { to: '/settings', label: t('navProfile'), icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[var(--app-nav-bg)] backdrop-blur-2xl border-b border-[var(--app-glass-border)] px-4 sm:px-6 py-2.5 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/learn" className="group active:scale-95 transition-transform">
            <TalkingoLogo size="md" withText={true} />
          </Link>
        </div>

        {/* Center: Desktop Navigation Bar (Anchored for Laptop/Desktop, Hidden on Phones) */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] shadow-sm backdrop-blur-xl">
          {desktopNavLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all ${
                  isActive
                    ? 'bg-[var(--app-cta-bg)] text-[var(--app-cta-text)] font-semibold shadow-sm'
                    : 'text-[var(--app-text)] opacity-70 hover:opacity-100 hover:bg-white/5 font-medium'
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* Quick Talk Pill CTA */}
          <NavLink
            to="/talk"
            className="ml-1 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-[0_0_16px_rgba(255,107,26,0.35)] hover:scale-105 active:scale-95 transition-all"
          >
            <Mic className="w-3.5 h-3.5 animate-pulse" />
            <span>{t('navTalk')}</span>
          </NavLink>
        </nav>

        {/* Right: Quick Controls & Gamification Counters */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Theme Toggle Button (Sun / Moon) */}
          <button
            onClick={toggleTheme}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--app-glass-bg)] border border-[var(--app-glass-border)] hover:border-[var(--app-glass-border-hover)] flex items-center justify-center text-[var(--app-text)] transition-transform active:scale-90 shadow-sm shrink-0"
            title={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
            aria-label="Переключить тему"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
            )}
          </button>

          {/* Language Switcher Liquid Glass Pill */}
          <div className="relative shrink-0">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[var(--app-glass-bg)] border border-[var(--app-glass-border)] hover:border-[var(--app-glass-border-hover)] text-xs font-medium text-[var(--app-text)] transition-all shadow-sm active:scale-95 backdrop-blur-xl"
            >
              <span className="text-sm">{currentLangObj.flag}</span>
              <span className="hidden lg:inline text-neutral-300 dark:text-neutral-300">{currentLangObj.label}</span>
              <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {langMenuOpen && (
              <div className="absolute top-full mt-2 right-0 w-36 liquid-glass-elevated py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      setLang(item.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
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

          {/* Streak Flame Pill */}
          <Link
            to="/learn"
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 font-bold text-xs text-amber-400 transition-all active:scale-95 shadow-[0_0_12px_rgba(245,158,11,0.15)] shrink-0"
            title="Дней подряд"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{profile.currentStreak}</span>
          </Link>

          {/* Gems Pill (Desktop/Tablet) */}
          <Link
            to="/shop"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 font-bold text-xs text-cyan-400 transition-all active:scale-95 shadow-[0_0_12px_rgba(6,182,212,0.15)] shrink-0"
            title="Алмазы"
          >
            <Gem className="w-3.5 h-3.5 text-cyan-400" />
            <span>{resources.diamonds}</span>
          </Link>

          {/* Coins Pill */}
          <Link
            to="/shop"
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/25 font-bold text-xs text-yellow-400 transition-all active:scale-95 shadow-[0_0_12px_rgba(234,179,8,0.15)] shrink-0"
            title="Монеты"
          >
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span>{resources.coins}</span>
          </Link>

          {/* Gallery exhibition link (Desktop) */}
          <Link
            to="/gallery"
            className="hidden md:flex w-8 h-8 rounded-full bg-[var(--app-glass-bg)] border border-[var(--app-glass-border)] hover:border-[var(--app-glass-border-hover)] items-center justify-center text-orange-400 transition-transform active:scale-90 shadow-sm shrink-0"
            title="Галерея сценариев Talkingo (scrn.gallery)"
          >
            <Layers className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </header>
  );
};
