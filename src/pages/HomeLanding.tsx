import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Mic, BookOpen, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { TalkingoLogo } from '../components/TalkingoLogo';

export const HomeLanding: React.FC = () => {
  const { activeCharacter } = useApp();

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24">
      
      {/* Hero Section */}
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-16 text-center">
        
        {/* Mascot Centerpiece with Open-Style Mindful Breathing Rings */}
        <div className="flex justify-center mb-8">
          <div className="relative flex items-center justify-center">
            {/* Soft concentric breathing rings */}
            <div className="absolute w-36 h-36 rounded-full bg-[#EAE6DE]/50 animate-ping opacity-25" />
            <div className="absolute w-44 h-44 rounded-full bg-[#E8EFEA]/60 animate-pulse" />
            
            <div className="relative p-3 rounded-full bg-white border border-[#EAE6DE] shadow-sm">
              <TalkingoLogo size="xl" className="scale-110" />
            </div>

            <div className="absolute -bottom-2 bg-[#3F634D] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1 border border-white">
              <Sparkles className="w-3 h-3 text-[#F8BA44]" />
              <span>Голосовой ИИ</span>
            </div>
          </div>
        </div>

        {/* Editorial Title */}
        <span className="text-xs uppercase tracking-widest font-bold text-[#78746D] block mb-3">
          Языковая практика нового поколения
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1C1A17] tracking-tight max-w-xl mx-auto leading-[1.15]">
          Говори уверенно. Каждый день.
        </h1>
        
        <p className="mt-4 text-sm sm:text-base text-[#78746D] max-w-md mx-auto leading-relaxed">
          Talkingo — это пространство живого речевого общения с умным хомячком {activeCharacter.name}. Без страха ошибок и зазубривания.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
          <Link
            to="/talk"
            className="w-full sm:w-auto px-7 py-3.5 btn-open-primary flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            <Mic className="w-4 h-4 text-[#F8BA44]" />
            <span>Начать говорить</span>
            <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
          </Link>
          
          <Link
            to="/learn"
            className="w-full sm:w-auto px-6 py-3.5 btn-open-outline flex items-center justify-center gap-2 text-sm"
          >
            <span>План обучения</span>
          </Link>
        </div>

        {/* Quiet Footnote */}
        <p className="mt-4 text-[11px] text-[#A8A399] tracking-wide">
          Доступно на Русском, Английском и Казахском языках
        </p>
      </div>

      {/* Feature Cards Grid (Open Card Aesthetic) */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="open-card p-6 text-left transition-all hover:border-[#D8D3C8]">
            <div className="w-10 h-10 rounded-2xl bg-[#E8EFEA] text-[#3F634D] flex items-center justify-center mb-4">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1C1A17]">Живой диалог голосом</h3>
            <p className="text-xs text-[#78746D] mt-1.5 leading-relaxed">
              Общайся через микрофон как с настоящим другом. Нейросеть слушает и отвечает естественным приятным голосом.
            </p>
          </div>

          <div className="open-card p-6 text-left transition-all hover:border-[#D8D3C8]">
            <div className="w-10 h-10 rounded-2xl bg-[#F9EFEB] text-[#D2674E] flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1C1A17]">Богатство речи</h3>
            <p className="text-xs text-[#78746D] mt-1.5 leading-relaxed">
              В каждом разговоре хомячок знакомит с красивыми фразеологизмами, пословицами и цитатами из классики.
            </p>
          </div>

          <div className="open-card p-6 text-left transition-all hover:border-[#D8D3C8]">
            <div className="w-10 h-10 rounded-2xl bg-[#F8F3E8] text-[#C49B52] flex items-center justify-center mb-4">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1C1A17]">Лиги и прогресс</h3>
            <p className="text-xs text-[#78746D] mt-1.5 leading-relaxed">
              Поддерживай ежедневный ударный режим (Streak), соревнуйся в лигах и открывай новых персонажей.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
