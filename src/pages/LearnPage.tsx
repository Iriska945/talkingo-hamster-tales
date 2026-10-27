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

  // Get current day of week (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const todayIndex = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-28 pt-4 px-4 max-w-lg mx-auto space-y-4">
      
      {/* 1. Duolingo Streak Card */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-4 sm:p-5 text-white shadow-lg border-4 border-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl shadow-inner">
              <Flame className="w-8 h-8 fill-yellow-300 text-yellow-200 animate-pulse" />
            </div>
            <div>
              <span className="text-3xl font-black leading-none tracking-tight block">
                {profile.currentStreak} {t('streak')}
              </span>
              <span className="text-xs font-bold text-white/80">
                {t('daysInRow')}
              </span>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur px-2.5 py-1 rounded-full text-xs font-black">
            🔥 Огонь!
          </div>
        </div>

        {/* 7 Days of the week circles */}
        <div className="flex items-center justify-between gap-1 pt-2 border-t border-white/20">
          {WEEKDAYS.map((day, idx) => {
            const isPassedOrToday = idx <= todayIndex;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[11px] font-extrabold text-white/80">
                  {day[lang] || day.ru}
                </span>
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black transition-all shadow-sm ${
                    isPassedOrToday
                      ? 'bg-amber-300 text-amber-950 font-black ring-2 ring-white scale-105'
                      : 'bg-white/20 text-white/60'
                  }`}
                >
                  {isPassedOrToday ? '✓' : '•'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Main Call To Action: Speaking Room */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-slate-200 relative overflow-hidden group hover:border-duo-green transition-all">
        <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl ${activeCharacter.gradient} opacity-15 rounded-full blur-2xl pointer-events-none`} />

        <div className="flex items-start gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-300 to-orange-400 p-1 flex items-center justify-center text-4xl sm:text-5xl shadow-md border-2 border-white shrink-0 group-hover:scale-105 transition-transform animate-bounce-slow">
            {activeCharacter.emoji}
          </div>

          <div className="flex-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-duo-green flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {t('personalTraining')}
            </span>
            <h2 className="text-xl font-black text-slate-800 leading-tight mt-0.5">
              {activeCharacter.name}
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-1 line-clamp-2">
              {activeCharacter.ability}
            </p>
          </div>
        </div>

        <Link
          to="/talk"
          className="mt-4 w-full py-3.5 px-4 rounded-2xl btn-duo-green font-black text-base shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Mic className="w-5 h-5" />
          <span>{t('tapToStart')} {activeCharacter.name.split(' ')[0]}</span>
        </Link>
      </div>

      {/* 3. Daily Quests Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-black text-slate-800">
              {t('dailyQuests')}
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Обновляются ежедневно
          </span>
        </div>

        <div className="space-y-3">
          {quests.map((q) => {
            const pct = Math.min(100, Math.round((q.progress / q.target) * 100));

            return (
              <div
                key={q.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{q.icon}</span>
                    <span className="text-xs font-black text-slate-700">
                      {q.title[lang] || q.title.ru}
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-500">
                    {q.progress} / {q.target}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      q.completed
                        ? 'bg-duo-green'
                        : 'bg-gradient-to-r from-amber-400 to-orange-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Rewards / Claim Button */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="flex items-center gap-1 text-amber-600">
                      <Coins className="w-3.5 h-3.5 fill-amber-400" />
                      +{q.rewardCoins}
                    </span>
                    <span className="flex items-center gap-1 text-cyan-600">
                      <Gem className="w-3.5 h-3.5 fill-cyan-400" />
                      +{q.rewardDiamonds}
                    </span>
                  </div>

                  {q.claimed ? (
                    <span className="text-xs font-black text-duo-green flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {t('claimed')}
                    </span>
                  ) : q.completed ? (
                    <button
                      onClick={() => claimQuest(q.id)}
                      className="py-1 px-3 rounded-xl btn-duo-green font-black text-xs shadow-sm flex items-center gap-1 animate-bounce"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      {t('claim')}
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400">
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
        className="flex items-center justify-between p-4 rounded-3xl bg-white border-2 border-slate-200 shadow-sm hover:border-duo-purple transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-duo-purple flex items-center justify-center text-2xl">
            📖
          </div>
          <div>
            <span className="text-base font-black text-slate-800 block">
              {t('dictTitle')}
            </span>
            <span className="text-xs font-bold text-slate-400">
              Выучено крылатых фраз: <strong className="text-purple-600">{phrases.length}</strong>
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </Link>

    </div>
  );
};
