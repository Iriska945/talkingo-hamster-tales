import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Mic, BookOpen, Trophy, ArrowRight, Sparkles, Volume2, ShieldCheck } from 'lucide-react';
import { TalkingoLogo } from '../components/TalkingoLogo';

export const HomeLanding: React.FC = () => {
  const { activeCharacter } = useApp();

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden pb-28">
      
      {/* Ambient Atmospheric Light Mesh */}
      <div className="ambient-glow-orb w-[450px] h-[450px] bg-indigo-600/20 top-[-80px] left-1/2 -translate-x-1/2" />
      <div className="ambient-glow-orb w-[350px] h-[350px] bg-cyan-600/15 top-[280px] left-[-100px]" />
      <div className="ambient-glow-orb w-[300px] h-[300px] bg-amber-500/10 top-[400px] right-[-80px]" />

      {/* Hero Section */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-14 pb-16 text-center">
        
        {/* Open-style Liquid Glass Centerpiece with Ambient Breathing Orb */}
        <div className="flex justify-center mb-10">
          <div className="relative flex items-center justify-center">
            
            {/* Ethereal Concentric Breathing Rings */}
            <div className="absolute w-52 h-52 rounded-full border border-white/10 animate-ping opacity-20 pointer-events-none" />
            <div className="absolute w-40 h-40 rounded-full bg-white/[0.03] border border-white/10 animate-pulse pointer-events-none" />
            
            {/* Central Liquid Glass Capsule */}
            <div className="relative p-5 rounded-full liquid-glass border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.12)]">
              <TalkingoLogo size="xl" className="scale-110" />
            </div>

            {/* Glowing Tag Pill */}
            <div className="absolute -bottom-3 bg-white/10 backdrop-blur-xl text-white text-[11px] font-medium px-3.5 py-0.5 rounded-full border border-white/20 shadow-lg flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Голосовой ИИ {activeCharacter.name.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* Editorial Spaced Subtitle */}
        <span className="text-[11px] uppercase tracking-[0.35em] text-neutral-400 font-medium block mb-4">
          Mindful Speech Practice
        </span>

        {/* Editorial Minimalist Title */}
        <h1 className="text-4xl sm:text-6xl font-light text-white tracking-tight max-w-xl mx-auto leading-[1.12]">
          Говори уверенно. <br />
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
            Каждый день.
          </span>
        </h1>
        
        <p className="mt-5 text-sm sm:text-base text-neutral-400 max-w-md mx-auto leading-relaxed font-light">
          Пространство живого речевого общения с умным хомячком {activeCharacter.name}. Без заучивания правил и страха ошибок.
        </p>

        {/* Action Buttons (Open Style High-Contrast White Pill + Glass Pill) */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-sm mx-auto">
          <Link
            to="/talk"
            className="w-full sm:w-auto px-8 py-3.5 liquid-pill-white flex items-center justify-center gap-2 text-sm"
          >
            <Mic className="w-4 h-4 text-black" />
            <span>Начать говорить</span>
            <ArrowRight className="w-4 h-4 ml-0.5 opacity-70" />
          </Link>
          
          <Link
            to="/learn"
            className="w-full sm:w-auto px-7 py-3.5 liquid-pill-glass flex items-center justify-center gap-2 text-sm"
          >
            <span>План обучения</span>
          </Link>
        </div>

        {/* Footnote */}
        <p className="mt-5 text-[11px] text-neutral-400 tracking-wide font-light">
          Русский • English • Қазақша • Edge Neural HD Voice
        </p>
      </div>

      {/* Feature Cards Grid (Liquid Glass Cards) */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="liquid-glass p-6 text-left transition-all hover:border-white/25 group">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/10 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-base font-medium text-white">Живой диалог голосом</h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-light">
              Общайся через микрофон в свободной беседе или по сценариям: кафе, аэропорт, сказка и интервью.
            </p>
          </div>

          <div className="liquid-glass p-6 text-left transition-all hover:border-white/25 group">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/10 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-base font-medium text-white">Богатство речи</h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-light">
              В каждом разговоре хомячок делится красивыми фразеологизмами, пословицами и цитатами с карточками для повторения.
            </p>
          </div>

          <div className="liquid-glass p-6 text-left transition-all hover:border-white/25 group">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/10 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-base font-medium text-white">Лиги и турниры</h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-light">
              Поддерживай ежедневный ударный режим (Streak), поднимайся в лигах от Бронзы до Рубина и собирай алмазы.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
