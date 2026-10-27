import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { Flame, Zap, Gem, Coins, Globe, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const LANGUAGES: Array<{ code: Language; label: string; flag: string }> = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'kk', label: 'Қазақша', flag: '🇰🇿' },
];

export const Navbar: React.FC = () => {
  const { lang, setLang, resources, profile, activeCharacter } = useApp();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const currentLangObj = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 px-4 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Left: App Logo & Mascot */}
        <Link to="/learn" className="flex items-center gap-2 group active:scale-95 transition-transform">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-300 via-orange-400 to-pink-500 flex items-center justify-center text-2xl shadow-md border-2 border-white group-hover:scale-105 transition-transform">
            {activeCharacter.emoji}
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xl font-black text-duo-green tracking-tight flex items-center gap-1">
              Talkingo
              <span className="text-xs bg-duo-green/10 text-duo-green font-extrabold px-1.5 py-0.5 rounded-full">AI</span>
            </span>
            <p className="text-[11px] font-bold text-slate-400 leading-none">{activeCharacter.name}</p>
          </div>
        </Link>

        {/* Center: Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-200/80 font-black text-xs text-slate-700 transition-all active:scale-95 shadow-sm"
          >
            <span className="text-base leading-none">{currentLangObj.flag}</span>
            <span className="hidden xs:inline">{currentLangObj.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {langMenuOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-1.5 min-w-[140px] z-50 animate-in fade-in zoom-in-95 duration-100">
              {LANGUAGES.map((item) => (
                <button
                  key={item.code}
                  onClick={() => {
                    setLang(item.code);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-all ${
                    lang === item.code
                      ? 'bg-duo-green/15 text-duo-green-dark'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-lg leading-none">{item.flag}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Gamified Resources (Duolingo Header Bar) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak */}
          <Link
            to="/learn"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 font-black text-xs text-orange-600 transition-transform active:scale-95"
            title="Дней подряд"
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
            <span>{profile.currentStreak}</span>
          </Link>

          {/* Gems */}
          <Link
            to="/shop"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 font-black text-xs text-cyan-600 transition-transform active:scale-95"
            title="Алмазы"
          >
            <Gem className="w-4 h-4 fill-cyan-400 text-cyan-500" />
            <span>{resources.diamonds}</span>
          </Link>

          {/* Coins */}
          <Link
            to="/shop"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 font-black text-xs text-amber-700 transition-transform active:scale-95"
            title="Монеты"
          >
            <Coins className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>{resources.coins}</span>
          </Link>

          {/* Energy */}
          <div
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 font-black text-xs text-rose-600"
            title="Энергия"
          >
            <Zap className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>{resources.energy}/{resources.maxEnergy}</span>
          </div>
        </div>

      </div>
    </header>
  );
};
