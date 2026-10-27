import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sparkles, Mic, BookOpen, Flame, Trophy, ArrowRight, ShieldCheck, Volume2 } from 'lucide-react';

export const HomeLanding: React.FC = () => {
  const { t, activeCharacter } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-yellow-50/50 to-white pb-20">
      
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-8 text-center">
        
        {/* Animated Mascot Presentation */}
        <div className="relative inline-block mb-6">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-amber-300 via-orange-400 to-pink-500 p-2 shadow-2xl mx-auto flex items-center justify-center animate-bounce-slow">
            <span className="text-7xl sm:text-8xl drop-shadow-lg select-none">
              {activeCharacter.emoji}
            </span>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-duo-green text-white font-black text-xs sm:text-sm px-3 py-1.5 rounded-full border-4 border-white shadow-lg flex items-center gap-1.5 animate-pulse">
            <Mic className="w-4 h-4" />
            <span>Голосовой ИИ</span>
          </div>
        </div>

        {/* Heading in Duolingo style */}
        <h1 className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tight max-w-xl mx-auto leading-tight">
          Учись говорить свободно вместе с <span className="text-duo-green">Talkingo</span>!
        </h1>
        
        <p className="mt-4 text-base sm:text-lg font-bold text-slate-500 max-w-md mx-auto">
          Твой личный голосовой помощник на базе ИИ. Тренируй живую речь, учи литературные идиомы из книг и получай награды!
        </p>

        {/* Big Duolingo Action Button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-sm mx-auto">
          <Link
            to="/learn"
            className="w-full py-4 px-6 rounded-2xl btn-duo-green font-black text-lg shadow-xl shadow-duo-green/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span>Начать тренировку</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to="/talk"
            className="w-full py-4 px-6 rounded-2xl btn-duo-blue font-black text-lg shadow-xl shadow-duo-blue/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Mic className="w-5 h-5" />
            <span>Поговорить голосом</span>
          </Link>
        </div>

        {/* Supported Languages Pills */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-black text-slate-600">
          <span className="px-3 py-1 bg-white rounded-full border border-slate-200 shadow-sm">🇬🇧 English</span>
          <span className="px-3 py-1 bg-white rounded-full border border-slate-200 shadow-sm">🇷🇺 Русский</span>
          <span className="px-3 py-1 bg-white rounded-full border border-slate-200 shadow-sm">🇰🇿 Қазақша</span>
        </div>

      </div>

      {/* Feature Highlights Grid */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-sm text-left hover:border-duo-green transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-duo-green flex items-center justify-center mb-3">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Живой диалог голосом</h3>
            <p className="text-xs font-bold text-slate-500 mt-1">
              Говори в микрофон как с настоящим другом. Хомячок слушает тебя и отвечает приятным голосом.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-sm text-left hover:border-duo-purple transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-duo-purple flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Крылатые выражения</h3>
            <p className="text-xs font-bold text-slate-500 mt-1">
              В каждом разговоре персонаж обучает красивым фразеологизмам и цитатам из Пушкина, Гоголя и классиков.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-sm text-left hover:border-amber-400 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Игровая система</h3>
            <p className="text-xs font-bold text-slate-500 mt-1">
              Держи ударный режим (Streak), выполняй ежедневные квесты и открывай новых персонажей в магазине!
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
