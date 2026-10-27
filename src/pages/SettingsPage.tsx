import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { speakWithBrowser, soundEffects } from '../services/voice';
import {
  Volume2,
  Globe,
  Target,
  Sparkles,
  CheckCircle2,
  LogOut,
  RotateCcw,
  Check,
  User,
} from 'lucide-react';

const DAILY_GOALS = [
  { id: 5, label: '5 мин/день', desc: 'Лёгкий старт' },
  { id: 10, label: '10 мин/день', desc: 'Оптимально' },
  { id: 15, label: '15 мин/день', desc: 'Ударный темп' },
];

export const SettingsPage: React.FC = () => {
  const { lang, setLang, profile, voiceSettings, updateVoiceSettings, resetProgress } = useApp();
  const [selectedGoal, setSelectedGoal] = useState<number>(10);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; avatar: string }>({
    name: profile.name,
    email: 'user@gmail.com',
    avatar: '🐹'
  });

  const handleGoogleLogin = () => {
    soundEffects.click();
    setIsLoggedIn(true);
    setUserProfile({
      name: 'Ученик Google',
      email: 'alex.study@gmail.com',
      avatar: '🎓'
    });
    soundEffects.success();
  };

  const handleTestVoice = () => {
    soundEffects.click();
    const testPhrase =
      lang === 'ru'
        ? 'Привет! Я твой голосовой помощник Talkingo.'
        : lang === 'en'
        ? 'Hello! I am your Talkingo voice companion.'
        : 'Сәлем! Мен сенің Talkingo серігіңмін.';
    speakWithBrowser(testPhrase, lang);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 pt-4 px-4 max-w-lg mx-auto space-y-4">
      
      {/* 1. User Profile & Google Sign-In Card */}
      <div className="open-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#F6F3EC] border border-[#EAE6DE] flex items-center justify-center text-2xl shadow-sm">
              {isLoggedIn ? userProfile.avatar : '🐹'}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1C1A17] leading-tight">
                {isLoggedIn ? userProfile.name : profile.name}
              </h2>
              <span className="text-xs text-[#78746D]">
                {isLoggedIn ? userProfile.email : 'Гостевой профиль (прогресс сохранён)'}
              </span>
            </div>
          </div>

          {isLoggedIn ? (
            <button
              onClick={() => {
                soundEffects.click();
                setIsLoggedIn(false);
              }}
              className="p-2 rounded-full bg-[#F6F3EC] text-[#78746D] hover:text-[#D2674E] transition-colors"
              title="Выйти"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="px-3.5 py-1.5 btn-open-primary text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Войти</span>
            </button>
          )}
        </div>

        {/* Sync status badge */}
        <div className="flex items-center gap-1.5 p-2.5 rounded-2xl bg-[#E8EFEA]/60 border border-[#D5E2D9] text-[11px] text-[#3F634D] font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Прогресс, открытые персонажи и словарь синхронизируются в базу данных</span>
        </div>
      </div>

      {/* 2. Daily Goal Card */}
      <div className="open-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#C49B52]" />
          <h3 className="text-sm font-bold text-[#1C1A17]">
            Цель на день
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {DAILY_GOALS.map((goal) => (
            <button
              key={goal.id}
              onClick={() => {
                soundEffects.click();
                setSelectedGoal(goal.id);
              }}
              className={`p-3 rounded-2xl border text-center transition-all ${
                selectedGoal === goal.id
                  ? 'border-[#1C1A17] bg-[#1C1A17] text-white shadow-sm'
                  : 'border-[#EAE6DE] bg-[#F8F6F1] text-[#1C1A17] hover:bg-[#F2EEE6]'
              }`}
            >
              <span className="block text-xs font-bold leading-tight">
                {goal.label}
              </span>
              <span className={`block text-[10px] mt-1 ${selectedGoal === goal.id ? 'text-[#FAF8F5]/80' : 'text-[#78746D]'}`}>
                {goal.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Voice Settings (Microsoft Edge Neural) */}
      <div className="open-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#3F634D]" />
            <h3 className="text-sm font-bold text-[#1C1A17]">
              Голосовой движок
            </h3>
          </div>
          <button
            onClick={handleTestVoice}
            className="text-[11px] font-bold text-[#3F634D] hover:underline flex items-center gap-1"
          >
            Проверить звук
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#F8F6F1] border border-[#EAE6DE] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#1C1A17] block">
              Нейросетевой голос
            </span>
            <span className="text-[11px] text-[#78746D]">
              Microsoft Edge Neural (Живые интонации и акценты)
            </span>
          </div>
          <span className="text-[10px] font-bold bg-[#E8EFEA] text-[#3F634D] px-2.5 py-1 rounded-full">
            Активен
          </span>
        </div>
      </div>

      {/* 4. Language Selection */}
      <div className="open-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#476579]" />
          <h3 className="text-sm font-bold text-[#1C1A17]">
            Язык изучения
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'ru', flag: '🇷🇺', label: 'Русский' },
            { id: 'en', flag: '🇬🇧', label: 'English' },
            { id: 'kk', flag: '🇰🇿', label: 'Қазақша' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setLang(item.id as any)}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 transition-all ${
                lang === item.id
                  ? 'border-[#1C1A17] bg-[#1C1A17] text-white font-bold shadow-sm'
                  : 'border-[#EAE6DE] bg-[#F8F6F1] text-[#1C1A17] hover:bg-[#F2EEE6] font-medium'
              }`}
            >
              <span className="text-base">{item.flag}</span>
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Minimalistic Reset Option */}
      <div className="pt-2 text-center">
        <button
          onClick={() => {
            if (confirm('Сбросить накопленный прогресс и начать сначала?')) {
              resetProgress();
            }
          }}
          className="text-xs text-[#A8A399] hover:text-[#D2674E] transition-colors inline-flex items-center gap-1 font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Сбросить прогресс к началу</span>
        </button>
      </div>

    </div>
  );
};
