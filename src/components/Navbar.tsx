import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { Flame, Gem, Coins, Trophy, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TalkingoLogo } from './TalkingoLogo';

const LANGUAGES: Array<{ code: Language; label: string; flag: string }> = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'kk', label: 'Қазақша', flag: '🇰🇿' },
];

export const Navbar: React.FC = () => {
  const { lang, setLang, resources, profile } = useApp();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const currentLangObj = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/85 backdrop-blur-xl border-b border-[#EAE6DE] px-4 py-2.5 transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Left: Original Clean Talkingo Logo */}
        <Link to="/learn" className="group active:scale-95 transition-transform">
          <TalkingoLogo size="md" withText={true} />
        </Link>

        {/* Center: Language Switcher (Sleek Minimalist Pill) */}
        <div className="relative">
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE6DE] hover:bg-[#F6F3EC] text-xs font-semibold text-[#1C1A17] transition-all shadow-sm active:scale-95"
          >
            <span className="text-sm">{currentLangObj.flag}</span>
            <span className="hidden sm:inline">{currentLangObj.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#78746D] transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {langMenuOpen && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-36 bg-white border border-[#EAE6DE] rounded-2xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              {LANGUAGES.map((item) => (
                <button
                  key={item.code}
                  onClick={() => {
                    setLang(item.code);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
                    lang === item.code
                      ? 'bg-[#E8EFEA] text-[#3F634D] font-bold'
                      : 'text-[#1C1A17] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span className="text-base">{item.flag}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Gamification Status Badges (Minimalist Open Pills) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* League Quick Link */}
          <Link
            to="/leaderboard"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-[#F6F3EC] border border-[#EAE6DE] font-semibold text-xs text-[#1C1A17] transition-all active:scale-95 shadow-sm"
            title="Таблица лидеров"
          >
            <Trophy className="w-3.5 h-3.5 text-[#C49B52]" />
            <span className="hidden sm:inline text-[11px] text-[#78746D]">Лига</span>
          </Link>

          {/* Streak */}
          <Link
            to="/learn"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F9EFEB] hover:bg-[#F3E2DB] border border-[#F1D7CE] font-bold text-xs text-[#D2674E] transition-all active:scale-95"
            title="Дней подряд"
          >
            <Flame className="w-3.5 h-3.5 fill-[#D2674E] text-[#D2674E]" />
            <span>{profile.currentStreak}</span>
          </Link>

          {/* Gems */}
          <Link
            to="/shop"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EBF1F5] hover:bg-[#DEE9F0] border border-[#D3E2EB] font-bold text-xs text-[#476579] transition-all active:scale-95"
            title="Алмазы"
          >
            <Gem className="w-3.5 h-3.5 text-[#476579]" />
            <span>{resources.diamonds}</span>
          </Link>

          {/* Coins */}
          <Link
            to="/shop"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F8F3E8] hover:bg-[#F1E8D5] border border-[#EBE0C7] font-bold text-xs text-[#C49B52] transition-all active:scale-95"
            title="Монеты"
          >
            <Coins className="w-3.5 h-3.5 text-[#C49B52]" />
            <span>{resources.coins}</span>
          </Link>
        </div>

      </div>
    </header>
  );
};
