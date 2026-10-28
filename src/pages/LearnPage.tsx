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
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] pb-28 pt-4 px-4 max-w-lg mx-auto space-y-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Ambient background glow */}
      <div className="ambient-glow-orb w-[350px] h-[350px] bg-indigo-600/15 top-[-60px] left-[-80px] pointer-events-none" />
      <div className="ambient-glow-orb w-[300px] h-[300px] bg-amber-500/10 top-[200px] right-[-60px] pointer-events-none" />

      {/* 1. Mindful Streak Card (Liquid Glass) */}
      <div className="liquid-glass p-5 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Flame className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 leading-none">
                <span className="text-xl font-medium text-[var(--app-text)]">
                  {profile.currentStreak} {profile.currentStreak === 1 ? 'день' : 'дней'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-300">
                  Ударный режим
                </span>
              </div>
              <span className="text-xs opacity-70 mt-1 block font-light">
                {profile.currentStreak > 0
                  ? 'Практика активна сегодня. Так держать!'
                  : 'Сделай 1 голосовой диалог, чтобы зажечь огонёк.'}
              </span>
            </div>
          </div>
        </div>

        {/* 7-Day Mindful Progress Rings */}
        <div className="grid grid-cols-7 gap-1.5 pt-3 border-t border-[var(--app-glass-border)]">
          {WEEKDAYS.map((day, idx) => {
            const isToday = idx === todayIndex;
            const isCompleted = idx <= todayIndex && profile.currentStreak > 0;

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <span className={`text-[10px] font-medium ${isToday ? 'text-[var(--app-text)] font-bold' : 'opacity-50'}`}>
                  {day[lang] || day.ru}
                </span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                      : isToday
                      ? 'border border-[var(--app-text)] text-[var(--app-text)] font-semibold'
                      : 'bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] opacity-50'
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

      {/* 2. Hero Action: Practice Voice Room (Liquid Glass Capsule) */}
      <Link
        to="/talk"
        className="block relative overflow-hidden rounded-[28px] liquid-glass-elevated p-5 shadow-lg hover:border-orange-500/40 transition-all group active:scale-[0.99] z-10"
      >
        <div className="flex items-center justify-between">
          <div className="max-w-[70%]">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-widest opacity-60">
                Голосовая комната
              </span>
            </div>
            <h2 className="text-lg font-medium text-[var(--app-text)] leading-snug">
              Поговори с {activeCharacter.name}
            </h2>
            <p className="text-xs opacity-70 mt-1 leading-relaxed font-light line-clamp-2">
              «{activeCharacter.greeting[lang] || activeCharacter.greeting.ru}»
            </p>
          </div>

          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] backdrop-blur-xl flex items-center justify-center text-3xl group-hover:scale-105 transition-transform shadow-md">
              {activeCharacter.emoji}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--app-cta-bg)] text-[var(--app-cta-text)] flex items-center justify-center shadow-lg">
              <Mic className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--app-glass-border)] flex items-center justify-between text-xs opacity-80 font-light">
          <span className="flex items-center gap-1 text-amber-500 dark:text-amber-300 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            +30 монет • +1 алмаз за диалог
          </span>
          <span className="text-[var(--app-text)] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Войти <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </Link>

      {/* 3. Daily Quests (Liquid Glass Card) */}
      <div className="liquid-glass p-5 relative z-10">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-medium text-[var(--app-text)]">
              {t('questsTitle')}
            </h3>
          </div>
          <span className="text-[11px] font-normal opacity-60">
            Ежедневно
          </span>
        </div>

        <div className="space-y-3">
          {quests.map((q) => {
            const progressPct = Math.min(100, Math.round((q.progress / q.target) * 100));

            return (
              <div
                key={q.id}
                className="p-3.5 rounded-2xl bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] flex items-center justify-between gap-3 transition-colors hover:border-[var(--app-glass-border-hover)]"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[var(--app-glass-bg)] border border-[var(--app-glass-border)] flex items-center justify-center shrink-0 text-base">
                    {q.icon || '🎙️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium text-[var(--app-text)] truncate">
                        {q.title[lang] || q.title.ru}
                      </span>
                      <span className="text-[10px] opacity-60 font-mono">
                        {q.progress}/{q.target}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-[var(--app-glass-border)] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Reward & Claim Pill */}
                <div className="shrink-0">
                  {q.claimed ? (
                    <span className="text-[10px] font-medium opacity-50 px-2 py-1 rounded-full bg-[var(--app-pill-glass-bg)]">
                      Завершено
                    </span>
                  ) : q.progress >= q.target ? (
                    <button
                      onClick={() => claimQuest(q.id)}
                      className="px-3 py-1.5 liquid-pill-white text-xs flex items-center gap-1 shadow-sm active:scale-95"
                    >
                      <Gift className="w-3 h-3 text-[var(--app-cta-text)]" />
                      <span>+{q.rewardCoins}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] font-medium opacity-70 px-2 py-1 rounded-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)]">
                      <Coins className="w-3 h-3 text-yellow-400" />
                      <span>+{q.rewardCoins}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Discovered Phrases Preview */}
      <div className="liquid-glass p-5 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-medium text-[var(--app-text)]">
              Крылатые выражения в словаре
            </h3>
          </div>
          <Link
            to="/dictionary"
            className="text-xs opacity-70 hover:opacity-100 flex items-center gap-0.5"
          >
            Все ({phrases.length}) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {phrases.length > 0 ? (
          <div className="space-y-2">
            {phrases.slice(0, 2).map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-2xl bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--app-text)]">«{p.phrase}»</span>
                  <span className="text-[10px] font-mono opacity-50 uppercase">{p.language}</span>
                </div>
                <p className="text-xs opacity-70 mt-1 font-light leading-relaxed">
                  {p.kidExplanation}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-xs opacity-60 font-light">
            Общайся с хомячком в голосовой комнате, чтобы находить новые цитаты и идиомы!
          </div>
        )}
      </div>

    </div>
  );
};
