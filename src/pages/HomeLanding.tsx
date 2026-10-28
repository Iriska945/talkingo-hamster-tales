import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Mic,
  BookOpen,
  Trophy,
  ArrowRight,
  Sparkles,
  Volume2,
  Coffee,
  Plane,
  Book,
  Briefcase,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { TalkingoLogo } from '../components/TalkingoLogo';
import { speakWithTTS, soundEffects } from '../services/voice';

export const HomeLanding: React.FC = () => {
  const { activeCharacter, lang } = useApp();
  const [isPlayingSample, setIsPlayingSample] = useState(false);

  const handlePlayVoiceSample = async () => {
    soundEffects.click();
    setIsPlayingSample(true);
    const sampleText =
      lang === 'ru'
        ? 'Привет! Я твой голосовой компаньон Talkingo. Давай поболтаем о чём угодно или закажем кофе!'
        : lang === 'kk'
        ? 'Сәлем! Мен сенің Talkingo серігіңмін. Кел, бірге тіл үйреніп, еркін сөйлесейік!'
        : "Hello! I'm your Talkingo voice companion. Let's practice speaking naturally and have fun!";

    try {
      await speakWithTTS(sampleText, lang);
    } catch (e) {
      console.warn('ElevenLabs preview error:', e);
    } finally {
      setIsPlayingSample(false);
    }
  };

  const SCENARIO_LINKS = [
    { id: 'cafe', title: 'В кафе', desc: 'Заказ напитков и десертов', icon: '☕', link: '/talk?scenario=cafe' },
    { id: 'airport', title: 'В аэропорту', desc: 'Регистрация и перелёт', icon: '✈️', link: '/talk?scenario=airport' },
    { id: 'story', title: 'Сказка', desc: 'Интерактивное приключение', icon: '📖', link: '/talk?scenario=story' },
    { id: 'interview', title: 'Интервью', desc: 'Вопросы о мечтах и хобби', icon: '💼', link: '/talk?scenario=interview' },
  ];

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] relative overflow-hidden pb-28 transition-colors duration-300">
      
      {/* Ambient Atmospheric Light Mesh */}
      <div className="ambient-glow-orb w-[480px] h-[480px] bg-indigo-600/20 top-[-80px] left-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="ambient-glow-orb w-[380px] h-[380px] bg-cyan-600/15 top-[280px] left-[-100px] pointer-events-none" />
      <div className="ambient-glow-orb w-[340px] h-[340px] bg-amber-500/10 top-[420px] right-[-80px] pointer-events-none" />

      {/* Hero Section */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-14 pb-14 text-center">
        
        {/* Open-style Liquid Glass Centerpiece with Ambient Breathing Orb */}
        <div className="flex justify-center mb-10">
          <div className="relative flex items-center justify-center">
            
            {/* Ethereal Concentric Breathing Rings */}
            <div className="absolute w-52 h-52 rounded-full border border-white/10 animate-ping opacity-20 pointer-events-none" />
            <div className="absolute w-40 h-40 rounded-full bg-white/[0.03] border border-white/10 animate-pulse pointer-events-none" />
            
            {/* Central Liquid Glass Capsule */}
            <div className="relative p-5 rounded-full liquid-glass border border-[var(--app-glass-border)] shadow-[0_0_50px_rgba(255,107,26,0.12)]">
              <TalkingoLogo size="xl" className="scale-110" />
            </div>

            {/* Glowing Tag Pill */}
            <div className="absolute -bottom-3 bg-[var(--app-pill-glass-bg)] backdrop-blur-xl text-[var(--app-text)] text-[11px] font-medium px-3.5 py-0.5 rounded-full border border-[var(--app-glass-border)] shadow-md flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-medium">Голосовой ИИ {activeCharacter.name.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* Editorial Spaced Subtitle */}
        <span className="text-[11px] uppercase tracking-[0.35em] text-[var(--app-text)] opacity-60 font-medium block mb-4">
          Mindful Speech Practice
        </span>

        {/* Editorial Minimalist Title */}
        <h1 className="text-4xl sm:text-6xl font-light text-[var(--app-text)] tracking-tight max-w-xl mx-auto leading-[1.12]">
          Говори уверенно. <br />
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-amber-600 dark:from-white dark:via-neutral-200 dark:to-neutral-400">
            Каждый день.
          </span>
        </h1>
        
        <p className="mt-5 text-sm sm:text-base text-[var(--app-text)] opacity-75 max-w-md mx-auto leading-relaxed font-light">
          Пространство живого речевого общения с умным хомячком {activeCharacter.name}. Без заучивания правил и страха ошибок.
        </p>

        {/* Action Buttons (Open Style High-Contrast White Pill + Glass Pill) */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-sm mx-auto">
          <Link
            to="/talk"
            className="w-full sm:w-auto px-8 py-3.5 liquid-pill-white flex items-center justify-center gap-2 text-sm"
          >
            <Mic className="w-4 h-4 text-[var(--app-cta-text)]" />
            <span>Начать говорить</span>
            <ArrowRight className="w-4 h-4 ml-0.5 opacity-70" />
          </Link>
          
          <button
            onClick={handlePlayVoiceSample}
            disabled={isPlayingSample}
            className="w-full sm:w-auto px-6 py-3.5 liquid-pill-glass flex items-center justify-center gap-2 text-sm"
          >
            <Volume2 className={`w-4 h-4 text-amber-500 dark:text-amber-400 ${isPlayingSample ? 'animate-pulse' : ''}`} />
            <span>{isPlayingSample ? 'Говорит...' : 'Голос Хэмми'}</span>
          </button>
        </div>

        {/* Footnote */}
        <p className="mt-5 text-[11px] text-[var(--app-text)] opacity-60 tracking-wide font-light">
          Русский • English • Қазақша • ElevenLabs Studio HD Voice
        </p>
      </div>

      {/* Scenarios Interactive Carousel */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-medium text-[var(--app-text)] uppercase tracking-wider">
              Выбери сценарий практики
            </h2>
          </div>
          <Link to="/learn" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 font-medium transition-colors">
            <span>Все сценарии →</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SCENARIO_LINKS.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className="liquid-glass p-4 text-left transition-all hover:border-[var(--app-glass-border-hover)] group active:scale-[0.98] border border-[var(--app-glass-border)]"
            >
              <div className="w-10 h-10 rounded-2xl bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] flex items-center justify-center text-xl mb-3 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-sm font-medium text-[var(--app-text)] group-hover:text-amber-500 dark:group-hover:text-amber-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-[11px] text-[var(--app-text)] opacity-70 mt-1 font-light leading-snug line-clamp-2">
                {item.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Feature Cards Grid (Liquid Glass Cards) */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="liquid-glass p-6 text-left transition-all hover:border-[var(--app-glass-border-hover)] group border border-[var(--app-glass-border)]">
            <div className="w-10 h-10 rounded-2xl bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
            </div>
            <h3 className="text-base font-medium text-[var(--app-text)]">Живой диалог голосом</h3>
            <p className="text-xs text-[var(--app-text)] opacity-70 mt-2 leading-relaxed font-light">
              Общайся через микрофон в свободной беседе или по сценариям: кафе, аэропорт, сказка и интервью.
            </p>
          </div>

          <div className="liquid-glass p-6 text-left transition-all hover:border-[var(--app-glass-border-hover)] group border border-[var(--app-glass-border)]">
            <div className="w-10 h-10 rounded-2xl bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
            <h3 className="text-base font-medium text-[var(--app-text)]">Богатство речи</h3>
            <p className="text-xs text-[var(--app-text)] opacity-70 mt-2 leading-relaxed font-light">
              В каждом разговоре хомячок делится красивыми фразеологизмами, пословицами и цитатами с карточками для повторения.
            </p>
          </div>

          <div className="liquid-glass p-6 text-left transition-all hover:border-[var(--app-glass-border-hover)] group border border-[var(--app-glass-border)]">
            <div className="w-10 h-10 rounded-2xl bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            </div>
            <h3 className="text-base font-medium text-[var(--app-text)]">Лиги и турниры</h3>
            <p className="text-xs text-[var(--app-text)] opacity-70 mt-2 leading-relaxed font-light">
              Поддерживай ежедневный ударный режим (Streak), поднимайся в лигах от Бронзы до Рубина и собирай алмазы.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
