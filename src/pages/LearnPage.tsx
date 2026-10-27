import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Flame, Mic, CheckCircle2, ChevronRight, Gift, Trophy, Sparkles, BookOpen, Coins, Gem } from 'lucide-react';

const WEEKDAYS = [
  { ru: 'Пн', en: 'M', kk: 'Дс' },
  { ru: 'Вт', en: 'T', kk: 'Сс' },
  { ru: 'Ср', en: 'W', kk: 'Ср' },
  { ru: 'Чт', en: 'T', kk: 'Бс' },
  { ru: 'Пт', en: 'F', kk: 'Жм' },
  { ru: 'Сб', en: 'S', kk: 'Сб' },
  { ru: 'Вс', en: 'S', kk: 'Жс' },
];

export const LearnPage: React.FC = () => {
  const { t, lang, profile, quests, claimQuest, activeCharacter, phrases } = useApp();

  // Get current day of week (0 = Mon, 6 = Sun)
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 pt-4 px-4 max-w-lg mx-auto space-y-4">
      
      {/* 1. Mindful Streak Card (Open Minimalist Warm Aesthetic) */}
      <div className="open-card p-5 border-[#EAE6DE]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#F9EFEB] flex items-center justify-center text-[#D2674E]">
              <Flame className="w-6 h-6 fill-[#D2674E] text-[#D2674E]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xl font-extrabold text-[#1C1A17]">
                  {profile.currentStreak} {profile.currentStreak === 1 ? 'день' : 'дней'}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F9EFEB] text-[#D2674E]">
                  Ударный режим
                </span>
              </div>
              <span className="text-xs text-[#78746D] mt-1 block">
                {profile.currentStreak > 0
                  ? 'Практика активна сегодня. Так держать!'
                  : 'Сделай 1 голосовой диалог, чтобы зажечь огонёк.'}
              </span>
            </div>
          </div>
        </div>

        {/* 7-Day Mindful Progress Rings */}
        <div className="grid grid-cols-7 gap-1.5 pt-2 border-t border-[#F2EEE6]">
          {WEEKDAYS.map((day, idx) => {
            const isToday = idx === todayIndex;
            const isCompleted = idx <= todayIndex && profile.currentStreak > 0;

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <span className={`text-[10px] font-semibold ${isToday ? 'text-[#1C1A17] font-bold' : 'text-[#A8A399]'}`}>
                  {day[lang] || day.ru}
                </span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-[#3F634D] text-white shadow-sm'
                      : isToday
                      ? 'border-2 border-[#1C1A17] text-[#1C1A17] font-bold'
                      : 'bg-[#F2EEE6] text-[#A8A399]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-[10px]">{idx + 1}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Hero Action: Practice Voice Room */}
      <Link
        to="/talk"
        className="block relative overflow-hidden rounded-[26px] bg-[#1C1A17] text-[#FAF8F5] p-5 shadow-sm hover:bg-black transition-all group active:scale-[0.99]"
      >
        <div className="flex items-center justify-between">
          <div className="max-w-[70%]">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8A399]">
                Голосовая комната
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">
              Поговори с {activeCharacter.name}
            </h2>
            <p className="text-xs text-[#A8A399] mt-1 leading-relaxed">
              «{activeCharacter.greeting[lang] || activeCharacter.greeting.ru}»
            </p>
          </div>

          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              {activeCharacter.emoji}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#3F634D] text-white flex items-center justify-center shadow-md">
              <Mic className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#A8A399]">
          <span className="flex items-center gap-1 text-[#F8BA44] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            +30 монет • +1 алмаз за диалог
          </span>
          <span className="text-white font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Войти <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </Link>

      {/* 3. Daily Quests (Open Clean Card) */}
      <div className="open-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C49B52]" />
            <h3 className="text-sm font-bold text-[#1C1A17]">
              {t('questsTitle')}
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[#78746D]">
            Ежедневно
          </span>
        </div>

        <div className="space-y-2.5">
          {quests.map((q) => {
            const progressPct = Math.min(100, Math.round((q.progress / q.target) * 100));

            return (
              <div
                key={q.id}
                className="p-3.5 rounded-2xl bg-[#F8F6F1] border border-[#EAE6DE] flex items-center justify-between gap-3 transition-colors hover:bg-white"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#1C1A17] truncate">
                      {q.title[lang] || q.title.ru}
                    </span>
                    <span className="text-[11px] font-bold text-[#78746D] ml-2">
                      {q.progress}/{q.target}
                    </span>
                  </div>

                  {/* Clean progress line */}
                  <div className="w-full h-1.5 bg-[#EAE6DE] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3F634D] rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="shrink-0">
                  {q.claimed ? (
                    <span className="px-2.5 py-1 rounded-full bg-[#E8EFEA] text-[#3F634D] text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Готово
                    </span>
                  ) : q.completed ? (
                    <button
                      onClick={() => claimQuest(q.id)}
                      className="px-3 py-1 btn-open-sage text-xs flex items-center gap-1 shadow-sm active:scale-95"
                    >
                      <Gift className="w-3 h-3" />
                      Забрать
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#A8A399] font-medium">
                      В процессе
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Quick Links: Dictionary Counter */}
      <Link
        to="/dictionary"
        className="open-card p-4 flex items-center justify-between hover:border-[#D8D3C8] transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F6F3EC] text-[#1C1A17] flex items-center justify-center text-xl">
            📖
          </div>
          <div>
            <span className="text-sm font-bold text-[#1C1A17] block">
              {t('dictTitle')}
            </span>
            <span className="text-xs text-[#78746D]">
              Выучено выражений: <strong className="text-[#3F634D]">{phrases.length}</strong>
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#A8A399] group-hover:translate-x-1 transition-transform" />
      </Link>

    </div>
  );
};
