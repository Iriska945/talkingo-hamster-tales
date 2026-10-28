import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { speakWithBrowser, speakWithEdgeNeural, soundEffects } from '../services/voice';
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
  Sun,
  Moon,
  Layers,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DAILY_GOALS = [
  { id: 5, label: '5 мин/день', desc: 'Лёгкий старт' },
  { id: 10, label: '10 мин/день', desc: 'Оптимально' },
  { id: 15, label: '15 мин/день', desc: 'Ударный темп' },
];

export const SettingsPage: React.FC = () => {
  const { lang, setLang, theme, setTheme, profile, voiceSettings, updateVoiceSettings, resetProgress } = useApp();
  const [selectedGoal, setSelectedGoal] = useState<number>(10);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
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

  const handleTestVoice = async () => {
    soundEffects.click();
    setIsPlayingTest(true);
    const testPhrase =
      lang === 'ru'
        ? 'Привет! Это живой женский голос ElevenLabs в Talkingo.'
        : lang === 'en'
        ? 'Hello! This is ElevenLabs studio female voice in Talkingo.'
        : 'Сәлем! Бұл Talkingo-дағы ElevenLabs студиялық дауысы.';

    try {
      if (voiceSettings.ttsEngine === 'webspeech') {
        await speakWithBrowser(testPhrase, lang);
      } else {
        await speakWithEdgeNeural(testPhrase, lang, {
          engine: voiceSettings.ttsEngine || 'elevenlabs',
          voiceId: voiceSettings.elevenlabsVoiceId || 'cgSgspJ2msm6clMCkdW9',
        });
      }
    } catch {
      await speakWithBrowser(testPhrase, lang);
    } finally {
      setIsPlayingTest(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] pb-28 pt-4 px-4 max-w-lg mx-auto space-y-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Ambient background glow */}
      <div className="ambient-glow-orb w-[350px] h-[350px] bg-indigo-600/15 top-[-40px] left-[-80px] pointer-events-none" />
      <div className="ambient-glow-orb w-[300px] h-[300px] bg-cyan-600/10 top-[200px] right-[-60px] pointer-events-none" />

      {/* 1. User Profile & Google Sign-In Card (Liquid Glass) */}
      <div className="liquid-glass p-5 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] flex items-center justify-center text-2xl shadow-sm">
              {isLoggedIn ? userProfile.avatar : '🐹'}
            </div>
            <div>
              <h2 className="text-base font-medium text-[var(--app-text)] leading-tight">
                {isLoggedIn ? userProfile.name : profile.name}
              </h2>
              <span className="text-xs opacity-70 font-light">
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
              className="p-2.5 rounded-full bg-[var(--app-pill-glass-bg)] opacity-70 hover:opacity-100 hover:text-rose-400 transition-colors"
              title="Выйти"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="px-4 py-2 liquid-pill-white text-xs flex items-center gap-2 active:scale-95"
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
        <div className="flex items-center gap-1.5 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-400 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
          <span>Синхронизация в базу данных SQLite активна</span>
        </div>
      </div>

      {/* 2. Theme Selection Card (Light / Dark) */}
      <div className="liquid-glass p-5 space-y-3 relative z-10">
        <div className="flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-orange-500" />}
          <h3 className="text-sm font-medium text-[var(--app-text)]">
            Тема оформления
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              soundEffects.click();
              setTheme('dark');
            }}
            className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 ${
              theme === 'dark'
                ? 'border-orange-500 bg-black text-white font-semibold shadow-md'
                : 'border-[var(--app-glass-border)] bg-[var(--app-pill-glass-bg)] text-[var(--app-text)] hover:opacity-90'
            }`}
          >
            <Moon className="w-4 h-4 text-amber-400" />
            <span className="text-xs">Тёмная (Glass)</span>
          </button>

          <button
            onClick={() => {
              soundEffects.click();
              setTheme('light');
            }}
            className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 ${
              theme === 'light'
                ? 'border-orange-500 bg-white text-black font-semibold shadow-md'
                : 'border-[var(--app-glass-border)] bg-[var(--app-pill-glass-bg)] text-[var(--app-text)] hover:opacity-90'
            }`}
          >
            <Sun className="w-4 h-4 text-orange-500" />
            <span className="text-xs">Светлая (Canvas)</span>
          </button>
        </div>
      </div>

      {/* 3. Scenario Flows Exhibition Link */}
      <Link
        to="/gallery"
        className="liquid-glass p-4.5 flex items-center justify-between group hover:border-orange-500/40 transition-all relative z-10 block"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-medium text-[var(--app-text)]">
                Галерея сценариев (scrn.gallery)
              </h3>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-orange-500/15 text-orange-400 font-bold uppercase">
                NEW
              </span>
            </div>
            <p className="text-xs opacity-70 font-light mt-0.5">
              Интерактивный просмотр всех 432 экранов и сценариев в рамке iPhone
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
      </Link>

      {/* 4. Daily Goal Card (Liquid Glass) */}
      <div className="liquid-glass p-5 space-y-3 relative z-10">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-medium text-[var(--app-text)]">
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
                  ? 'border-orange-500 bg-[var(--app-cta-bg)] text-[var(--app-cta-text)] font-semibold shadow-sm'
                  : 'border-[var(--app-glass-border)] bg-[var(--app-pill-glass-bg)] text-[var(--app-text)] hover:opacity-90'
              }`}
            >
              <span className="block text-xs leading-tight">
                {goal.label}
              </span>
              <span className="block text-[10px] mt-1 opacity-70 font-light">
                {goal.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Voice Settings (ElevenLabs Studio Female Voice & Fallbacks) */}
      <div className="liquid-glass p-5 space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-medium text-[var(--app-text)]">
              Голосовой движок и озвучка
            </h3>
          </div>
          <button
            onClick={handleTestVoice}
            disabled={isPlayingTest}
            className="text-[11px] font-semibold text-cyan-500 dark:text-cyan-400 hover:opacity-80 transition-opacity flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 active:scale-95"
          >
            <Sparkles className={`w-3 h-3 ${isPlayingTest ? 'animate-spin' : ''}`} />
            <span>{isPlayingTest ? 'Озвучиваю...' : 'Тест звука'}</span>
          </button>
        </div>

        {/* Engine Switcher */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              soundEffects.click();
              updateVoiceSettings({ ttsEngine: 'elevenlabs' });
            }}
            className={`p-3 rounded-2xl border text-left transition-all ${
              (voiceSettings.ttsEngine === 'elevenlabs' || !voiceSettings.ttsEngine)
                ? 'border-emerald-500/60 bg-emerald-500/10 text-[var(--app-text)] shadow-sm'
                : 'border-[var(--app-glass-border)] bg-[var(--app-pill-glass-bg)] opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold">ElevenLabs AI</span>
              {(voiceSettings.ttsEngine === 'elevenlabs' || !voiceSettings.ttsEngine) && (
                <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.2 rounded-full">HD</span>
              )}
            </div>
            <span className="text-[10px] opacity-70 block font-light leading-snug">
              Премиум студийный женский голос (Multilingual V2)
            </span>
          </button>

          <button
            onClick={() => {
              soundEffects.click();
              updateVoiceSettings({ ttsEngine: 'edgeneural' });
            }}
            className={`p-3 rounded-2xl border text-left transition-all ${
              voiceSettings.ttsEngine === 'edgeneural'
                ? 'border-emerald-500/60 bg-emerald-500/10 text-[var(--app-text)] shadow-sm'
                : 'border-[var(--app-glass-border)] bg-[var(--app-pill-glass-bg)] opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold">Edge Neural</span>
              {voiceSettings.ttsEngine === 'edgeneural' && (
                <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.2 rounded-full">OK</span>
              )}
            </div>
            <span className="text-[10px] opacity-70 block font-light leading-snug">
              Быстрый нейросетевой голос Microsoft
            </span>
          </button>
        </div>

        {/* ElevenLabs Female Voices Selector */}
        {(voiceSettings.ttsEngine === 'elevenlabs' || !voiceSettings.ttsEngine) && (
          <div className="space-y-2 pt-1 border-t border-[var(--app-glass-border)]">
            <span className="text-[11px] font-medium opacity-70 block">
              Выбор женского тембра (ElevenLabs):
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', emoji: '🌸', desc: 'Игривый, тёплый, яркий' },
                { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', emoji: '✨', desc: 'Мягкий, естественный' },
                { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', emoji: '📖', desc: 'Литературный, спокойный' },
                { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', emoji: '🎓', desc: 'Чёткий, образовательный' },
              ].map((v) => {
                const isSelected = (voiceSettings.elevenlabsVoiceId || 'cgSgspJ2msm6clMCkdW9') === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      soundEffects.click();
                      updateVoiceSettings({ elevenlabsVoiceId: v.id });
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-[var(--app-cta-bg)] text-[var(--app-cta-text)] font-semibold shadow-sm'
                        : 'border-[var(--app-glass-border)] bg-[var(--app-pill-glass-bg)] text-[var(--app-text)] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{v.emoji}</span>
                      <span className="text-xs font-medium">{v.name}</span>
                    </div>
                    <span className="text-[9px] opacity-70 block mt-0.5 truncate font-light">
                      {v.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 6. Language Selection */}
      <div className="liquid-glass p-5 space-y-3 relative z-10">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-medium text-[var(--app-text)]">
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
                  ? 'border-orange-500 bg-[var(--app-cta-bg)] text-[var(--app-cta-text)] font-semibold shadow-sm'
                  : 'border-[var(--app-glass-border)] bg-[var(--app-pill-glass-bg)] text-[var(--app-text)] hover:opacity-90 font-normal'
              }`}
            >
              <span className="text-base">{item.flag}</span>
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 7. Reset Option */}
      <div className="pt-2 text-center relative z-10">
        <button
          onClick={() => {
            if (confirm('Сбросить накопленный прогресс и начать сначала?')) {
              resetProgress();
            }
          }}
          className="text-xs opacity-50 hover:text-rose-400 hover:opacity-100 transition-colors inline-flex items-center gap-1 font-light"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Сбросить прогресс к началу</span>
        </button>
      </div>

    </div>
  );
};
