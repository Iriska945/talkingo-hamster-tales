import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  soundEffects,
  speakWithTTS,
  stopSpeaking,
} from '../services/voice';
import { generateTalkResponse } from '../services/deepseek';
import { ChatMessage } from '../types';
import { RewardModal } from '../components/RewardModal';
import { GoogleAuthModal } from '../components/GoogleAuthModal';
import { AudioWave } from '../components/AudioWave';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Sparkles,
  Send,
  Keyboard,
  RotateCcw,
  Lightbulb,
  Lock,
} from 'lucide-react';

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';
type PracticeScenario = 'free' | 'cafe' | 'airport' | 'story' | 'interview';

const SCENARIOS: Array<{ id: PracticeScenario; label: string; icon: string }> = [
  { id: 'free', label: 'Свободный', icon: '💬' },
  { id: 'cafe', label: 'В кафе', icon: '☕' },
  { id: 'airport', label: 'Аэропорт', icon: '✈️' },
  { id: 'story', label: 'Сказка', icon: '📖' },
  { id: 'interview', label: 'Интервью', icon: '💼' },
];

export const TalkPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialScenario = (searchParams.get('scenario') as PracticeScenario) || 'free';
  const {
    lang,
    t,
    activeCharacter,
    voiceSettings,
    recordSpeechTurn,
    completeLesson,
    profile,
  } = useApp();

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [scenario, setScenario] = useState<PracticeScenario>(
    ['free', 'cafe', 'airport', 'story', 'interview'].includes(initialScenario)
      ? initialScenario
      : 'free'
  );
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [coachTip, setCoachTip] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [turnsCount, setTurnsCount] = useState<number>(0);
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [guestQueriesUsed, setGuestQueriesUsed] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('talkingo_guest_query_count') || '0', 10) || 0;
    } catch {
      return 0;
    }
  });
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [showKeyboard, setShowKeyboard] = useState<boolean>(false);
  const [latestDiscoveredPhrase, setLatestDiscoveredPhrase] = useState<{
    phrase: string;
    meaning: string;
    source?: string;
  } | null>(null);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const turnsGoal = 5;

  // Initialize character greeting based on scenario
  useEffect(() => {
    stopSpeaking();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    let greeting = activeCharacter.greeting[lang] || activeCharacter.greeting.ru;
    if (scenario === 'cafe') {
      greeting = lang === 'ru'
        ? 'Добро пожаловать в наше уютное кафе! Что для вас приготовить сегодня?'
        : lang === 'kk'
        ? 'Біздің жайлы дәмханамызға қош келдіңіз! Бүгін не ішесіз немесе жейсіз?'
        : 'Welcome to our cozy cafe! What can I get for you today?';
    } else if (scenario === 'airport') {
      greeting = lang === 'ru'
        ? 'Здравствуйте! Проходите на стойку регистрации. Куда вы летите сегодня?'
        : lang === 'kk'
        ? 'Сәлеметсіз бе! Тіркеу орнына қош келдіңіз. Бүгін қай қалаға ұшасыз?'
        : 'Hello! Welcome to the airport check-in desk. Where are you flying to today?';
    } else if (scenario === 'story') {
      greeting = lang === 'ru'
        ? 'В некотором царстве, в тридевятом государстве... С чего начнется наше приключение?'
        : lang === 'kk'
        ? 'Ерте, ерте, ертеде, ешкі жүні бөртеде... Біздің ғажайып саяхатымыз неден басталсын?'
        : 'Once upon a time, in a faraway land... How shall our grand adventure begin?';
    } else if (scenario === 'interview') {
      greeting = lang === 'ru'
        ? 'Рад познакомиться! Расскажи немного о себе, своих увлечениях и мечтах.'
        : lang === 'kk'
        ? 'Танысқаныма қуаныштымын! Өзің туралы, қызығушылықтарың жайлы айтып берші.'
        : 'Nice to meet you! Tell me a little bit about yourself and your passions.';
    }

    const initialMsg: ChatMessage = {
      id: 'greeting-' + scenario,
      role: 'assistant',
      content: greeting,
      timestamp: Date.now(),
    };
    setMessages([initialMsg]);
    setCoachTip(null);

    const timer = setTimeout(() => {
      speakAssistant(greeting);
    }, 400);

    return () => {
      clearTimeout(timer);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      stopSpeaking();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [lang, activeCharacter.id, scenario]);

  // Voice synthesis with ElevenLabs Studio Neural Voice (Female) & Speed Control
  const speakAssistant = async (text: string) => {
    stopSpeaking();
    setVoiceState('speaking');
    try {
      await speakWithTTS(text, lang, {
        voiceId: voiceSettings.elevenlabsVoiceId || 'EXAVITQu4vr4xnSDxMaL',
        rate: voiceSpeed,
      });
    } catch (e) {
      console.warn('ElevenLabs TTS error:', e);
    } finally {
      setVoiceState('idle');
    }
  };

  // Start speech recognition listening
  const handleMicClick = () => {
    if (voiceState === 'speaking') {
      stopSpeaking();
      setVoiceState('idle');
      return;
    }

    if (voiceState === 'listening') {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (interimTranscript.trim()) {
        const textToSubmit = interimTranscript.trim();
        setInterimTranscript('');
        handleUserSpeech(textToSubmit);
      } else {
        setVoiceState('idle');
      }
      return;
    }

    if (voiceState !== 'idle') return;

    // Check guest limit of 5 queries
    if (!profile.isLoggedIn && guestQueriesUsed >= 5) {
      soundEffects.click();
      setIsAuthModalOpen(true);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      alert('Распознавание речи не поддерживается в этом браузере. Используйте клавиатуру.');
      setShowKeyboard(true);
      return;
    }

    const recognition = createSpeechRecognizer(lang);
    if (!recognition) {
      setShowKeyboard(true);
      return;
    }

    recognitionRef.current = recognition;
    setVoiceState('listening');
    soundEffects.listenStart();

    recognition.onresult = (event: any) => {
      let interimStr = '';
      let finalStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript;
        } else {
          interimStr += event.results[i][0].transcript;
        }
      }

      const textToShow = (finalStr || interimStr).trim();
      if (textToShow) {
        setInterimTranscript(textToShow);
      }

      if (finalStr.trim()) {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch {}
        }
        handleUserSpeech(finalStr.trim());
      } else if (interimStr.trim()) {
        // Debounce auto-send after user finishes speaking (1.6s of silence)
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch {}
          }
          const textToSubmit = interimStr.trim();
          if (textToSubmit) {
            setInterimTranscript('');
            handleUserSpeech(textToSubmit);
          }
        }, 1600);
      }
    };

    recognition.onerror = (e: any) => {
      console.warn('SpeechRecognition error:', e);
      setVoiceState('idle');
    };

    recognition.onend = () => {
      setVoiceState((current) => (current === 'listening' ? 'idle' : current));
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn(e);
      setVoiceState('idle');
    }
  };

  // Process user message (spoken or typed)
  const handleUserSpeech = async (userText: string) => {
    // Enforce 5 query limit for guest users
    if (!profile.isLoggedIn && guestQueriesUsed >= 5) {
      soundEffects.click();
      setIsAuthModalOpen(true);
      return;
    }

    if (!profile.isLoggedIn) {
      const nextCount = guestQueriesUsed + 1;
      setGuestQueriesUsed(nextCount);
      try {
        localStorage.setItem('talkingo_guest_query_count', nextCount.toString());
      } catch {}
    }

    setVoiceState('thinking');
    setInterimTranscript('');

    const newMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);

    try {
      const response = await generateTalkResponse({
        messages: updatedMessages,
        language: lang,
        character: activeCharacter,
        voiceSettings,
        scenario,
      });

      const assistantMsg: ChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: response.spoken,
        timestamp: Date.now(),
        phrasesFound: response.new_phrases,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      recordSpeechTurn(response.new_phrases || []);

      if (response.tip) {
        setCoachTip(response.tip);
      } else {
        setCoachTip(null);
      }

      if (response.new_phrases && response.new_phrases.length > 0) {
        const found = response.new_phrases[0];
        setLatestDiscoveredPhrase({
          phrase: found.phrase,
          meaning: found.meaning,
          source: found.source_book,
        });
        soundEffects.success();
      }

      const nextTurns = turnsCount + 1;
      setTurnsCount(nextTurns);

      await speakAssistant(response.spoken);

      if (nextTurns >= turnsGoal) {
        completeLesson(30, 1);
        setShowRewardModal(true);
        setTurnsCount(0);
      }
    } catch (err) {
      console.error(err);
      setVoiceState('idle');
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || voiceState === 'thinking') return;
    if (!profile.isLoggedIn && guestQueriesUsed >= 5) {
      soundEffects.click();
      setIsAuthModalOpen(true);
      return;
    }
    const txt = textInput.trim();
    setTextInput('');
    handleUserSpeech(txt);
  };

  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === 'assistant');

  return (
    <div className="h-[100dvh] max-h-[100dvh] flex flex-col justify-between bg-[var(--app-bg)] text-[var(--app-text)] transition-colors duration-300 relative overflow-hidden select-none">
      
      {/* Ambient Atmospheric Glow Mesh */}
      <div className="ambient-glow-orb w-[400px] h-[400px] bg-indigo-600/20 top-[-80px] left-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="ambient-glow-orb w-[300px] h-[300px] bg-cyan-600/15 top-[30%] right-[-80px] pointer-events-none" />

      {/* 1. Header Bar with Liquid Glass Pills & Scenario Selector */}
      <div className="relative z-20 pt-[max(0.6rem,env(safe-area-inset-top))] px-4 pb-1 max-w-md mx-auto w-full space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              stopSpeaking();
              navigate('/learn');
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] hover:border-[var(--app-glass-border-hover)] backdrop-blur-xl flex items-center justify-center text-[var(--app-text)] hover:opacity-100 active:scale-95 transition-all shadow-sm"
            title="Завершить сессию"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--app-text)]" />
          </button>

          {/* Guest Limit or Session Turns */}
          {!profile.isLoggedIn ? (
            <button
              onClick={() => {
                soundEffects.click();
                setIsAuthModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-semibold hover:bg-amber-500/25 transition-all shadow-sm active:scale-95"
              title={lang === 'ru' ? 'Осталось бесплатных запросов' : lang === 'kk' ? 'Тегін сұрақтар саны' : 'Free queries left'}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
              <span>
                {lang === 'ru'
                  ? `Осталось: ${Math.max(0, 5 - guestQueriesUsed)}/5`
                  : lang === 'kk'
                  ? `Қалғаны: ${Math.max(0, 5 - guestQueriesUsed)}/5`
                  : `Free: ${Math.max(0, 5 - guestQueriesUsed)}/5`}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span>{lang === 'ru' ? 'Безлимит' : lang === 'kk' ? 'Шектеусіз' : 'Unlimited'}</span>
            </div>
          )}

          {/* Active Character Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] backdrop-blur-xl text-xs font-medium text-[var(--app-text)]">
            <span>{activeCharacter.emoji}</span>
            <span className="text-[11px] opacity-80">{activeCharacter.name.split(' ')[0]}</span>
          </div>
        </div>

        {/* Practice Scenario Selector Liquid Glass Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 scroll-smooth">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                soundEffects.click();
                setScenario(s.id);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                scenario === s.id
                  ? 'bg-[var(--app-cta-bg)] text-[var(--app-cta-text)] font-semibold shadow-md'
                  : 'bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] text-[var(--app-text)] opacity-75 hover:opacity-100 hover:border-[var(--app-glass-border-hover)] backdrop-blur-md'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Center Stage: Mesmerizing Liquid Glass Breathing Rings */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center px-4 max-w-md mx-auto w-full text-center overflow-y-auto no-scrollbar py-1">
        
        {/* Concentric Breathing Circle Visualization */}
        <div className="relative my-1 sm:my-2 flex items-center justify-center shrink-0">
          
          {/* Outermost Breathing Ring */}
          <div
            className={`absolute rounded-full transition-all duration-700 pointer-events-none ${
              voiceState === 'listening'
                ? 'w-44 h-44 sm:w-56 sm:h-56 border border-emerald-400/40 bg-emerald-500/10 animate-ping opacity-40 shadow-[0_0_40px_rgba(16,185,129,0.3)]'
                : voiceState === 'speaking'
                ? 'w-44 h-44 sm:w-56 sm:h-56 border border-amber-400/40 bg-amber-500/10 animate-pulse opacity-60 shadow-[0_0_40px_rgba(245,158,11,0.3)]'
                : voiceState === 'thinking'
                ? 'w-40 h-40 sm:w-52 sm:h-52 border border-purple-400/40 bg-purple-500/10 animate-pulse opacity-50'
                : 'w-36 h-36 sm:w-48 sm:h-48 border border-[var(--app-glass-border)] bg-[var(--app-glass-subtle)] opacity-40'
            }`}
          />

          {/* Middle Ring */}
          <div
            className={`absolute rounded-full transition-all duration-500 pointer-events-none ${
              voiceState === 'listening'
                ? 'w-32 h-32 sm:w-44 sm:h-44 border border-emerald-400/30 bg-emerald-500/15'
                : voiceState === 'speaking'
                ? 'w-32 h-32 sm:w-44 sm:h-44 border border-amber-400/30 bg-amber-500/15'
                : 'w-28 h-28 sm:w-40 sm:h-40 border border-[var(--app-glass-border)] bg-[var(--app-glass-subtle)]'
            }`}
          />

          {/* Core Mascot Liquid Glass Lens */}
          <div
            className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full liquid-glass-elevated border border-[var(--app-glass-border)] flex items-center justify-center text-4xl sm:text-5xl transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.12)] ${
              voiceState === 'speaking'
                ? 'scale-105 border-amber-400/60 shadow-[0_0_35px_rgba(245,158,11,0.3)]'
                : voiceState === 'listening'
                ? 'scale-95 border-emerald-400/60 shadow-[0_0_35px_rgba(16,185,129,0.3)]'
                : 'hover:scale-102'
            }`}
          >
            <span className={voiceState === 'speaking' ? 'animate-bounce' : 'animate-float-gentle'}>
              {activeCharacter.emoji}
            </span>
          </div>
        </div>

        {/* State Label Tag */}
        <div className="mb-2 shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium tracking-wide transition-all backdrop-blur-xl ${
              voiceState === 'listening'
                ? 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-300 border border-emerald-500/30 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : voiceState === 'thinking'
                ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 animate-pulse'
                : voiceState === 'speaking'
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                : 'bg-[var(--app-pill-glass-bg)] text-[var(--app-text)] border border-[var(--app-glass-border)] opacity-90'
            }`}
          >
            {voiceState === 'listening' && <Mic className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />}
            {voiceState === 'speaking' && <Volume2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />}
            <span>
              {voiceState === 'listening'
                ? 'Слушаю твою речь...'
                : voiceState === 'thinking'
                ? 'Обдумываю ответ...'
                : voiceState === 'speaking'
                ? `${activeCharacter.name.split(' ')[0]} говорит...`
                : 'Нажми микрофон для ответа'}
            </span>
          </span>
        </div>

        {/* Assistant Speech Bubble Card (Liquid Glass with Crystal Contrast) */}
        <div className="w-full max-w-sm liquid-glass p-3.5 sm:p-4 text-left transition-all border border-[var(--app-glass-border)] shadow-lg max-h-[36vh] overflow-y-auto no-scrollbar">
          <p className="text-xs sm:text-sm font-normal text-[var(--app-text)] leading-relaxed">
            «{lastAssistantMessage?.content || activeCharacter.greeting[lang]}»
          </p>

          {/* Grammar & Pronunciation Coach Tip */}
          {coachTip && (
            <div className="mt-2.5 p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-left animate-in slide-in-from-top-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 mb-0.5">
                <Lightbulb className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                <span>Совет репетитора</span>
              </div>
              <p className="text-xs text-[var(--app-text)] opacity-90 leading-tight font-light">
                {coachTip}
              </p>
            </div>
          )}

          {/* New Idiom Notification Banner */}
          {latestDiscoveredPhrase && (
            <div className="mt-2.5 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-left animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>Новое крылатое выражение</span>
              </div>
              <p className="text-xs font-medium text-[var(--app-text)]">
                «{latestDiscoveredPhrase.phrase}» — {latestDiscoveredPhrase.meaning}
              </p>
              {latestDiscoveredPhrase.source && (
                <p className="text-[10px] text-[var(--app-text)] opacity-60 italic mt-0.5 font-light">
                  📖 {latestDiscoveredPhrase.source}
                </p>
              )}
            </div>
          )}

          {/* User Interim Transcript while speaking */}
          {interimTranscript && (
            <div className="mt-2 pt-2 border-t border-[var(--app-glass-border)] text-xs font-light text-[var(--app-text)] opacity-75 italic">
              Ты говоришь: "{interimTranscript}..."
            </div>
          )}
        </div>

        {/* Liquid Audio Waves */}
        <div className="mt-2 shrink-0">
          <AudioWave active={voiceState === 'speaking' || voiceState === 'listening'} />
        </div>

      </div>

      {/* 3. Bottom Control Dock (Liquid Glass Capsule) */}
      <div className="relative z-20 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1 px-4 max-w-md mx-auto w-full flex flex-col items-center shrink-0">
        
        {/* Guest Limit Warning Banner if 5 queries reached */}
        {!profile.isLoggedIn && guestQueriesUsed >= 5 && (
          <div className="w-full mb-2 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-center animate-in slide-in-from-bottom-2 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-500 mb-1">
              <Lock className="w-4 h-4 text-amber-500" />
              <span>
                {lang === 'ru'
                  ? 'Лимит 5 бесплатных реплик исчерпан'
                  : lang === 'kk'
                  ? '5 тегін реплика шегі таусылды'
                  : 'Free limit of 5 queries reached'}
              </span>
            </div>
            <p className="text-[11px] text-[var(--app-text)] opacity-75 mb-2">
              {lang === 'ru'
                ? 'Войдите через Google, чтобы продолжить безлимитную практику!'
                : lang === 'kk'
                ? 'Шектеусіз тәжірибені жалғастыру үшін Google арқылы кіріңіз!'
                : 'Sign in with Google to unlock unlimited speech practice!'}
            </p>
            <button
              onClick={() => {
                soundEffects.click();
                setIsAuthModalOpen(true);
              }}
              className="py-1.5 px-4 rounded-full bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs inline-flex items-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{lang === 'ru' ? 'Войти через Google' : lang === 'kk' ? 'Google арқылы кіру' : 'Sign in with Google'}</span>
            </button>
          </div>
        )}

        {/* Optional text input field */}
        {showKeyboard ? (
          <form onSubmit={handleTextSubmit} className="w-full flex items-center gap-2 mb-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Напиши сообщение хомячку..."
              autoFocus
              className="flex-1 px-4 py-2 rounded-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] text-sm text-[var(--app-text)] placeholder:opacity-50 focus:outline-none focus:border-[var(--app-glass-border-hover)] shadow-sm"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || voiceState === 'thinking'}
              className="w-9 h-9 rounded-full liquid-pill-white flex items-center justify-center shrink-0 disabled:opacity-40"
            >
              <Send className="w-4 h-4 text-[var(--app-cta-text)]" />
            </button>
            <button
              type="button"
              onClick={() => setShowKeyboard(false)}
              className="p-1.5 text-xs text-[var(--app-text)] opacity-60 hover:opacity-100"
            >
              Отмена
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between w-full px-3 sm:px-6">
            
            {/* Keyboard toggle */}
            <button
              onClick={() => {
                soundEffects.click();
                setShowKeyboard(true);
              }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] hover:border-[var(--app-glass-border-hover)] backdrop-blur-xl flex items-center justify-center text-[var(--app-text)] opacity-80 hover:opacity-100 active:scale-95 transition-all shadow-sm"
              title="Печатать текстом"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Central Large Mindful Mic Button (Liquid Glass Primary CTA) */}
            <button
              onClick={handleMicClick}
              disabled={voiceState === 'thinking'}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center transition-all active:scale-95 shadow-xl ${
                voiceState === 'listening'
                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-400/40 shadow-[0_0_35px_rgba(16,185,129,0.5)]'
                  : voiceState === 'speaking'
                  ? 'bg-amber-500 text-white ring-4 ring-amber-400/40 shadow-[0_0_35px_rgba(245,158,11,0.5)]'
                  : voiceState === 'thinking'
                  ? 'bg-purple-600 text-white ring-4 ring-purple-400/40 animate-pulse'
                  : 'bg-[var(--app-cta-bg)] text-[var(--app-cta-text)] hover:opacity-90 shadow-2xl'
              }`}
            >
              {voiceState === 'listening' ? (
                <MicOff className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse text-white" />
              ) : voiceState === 'speaking' ? (
                <Volume2 className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse text-white" />
              ) : voiceState === 'thinking' ? (
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-white" />
              ) : (
                <Mic className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--app-cta-text)]" />
              )}
              <span className={`text-[9px] sm:text-[10px] font-semibold mt-0.5 sm:mt-1 tracking-tight ${
                voiceState === 'listening' || voiceState === 'speaking' || voiceState === 'thinking'
                  ? 'text-white'
                  : 'text-[var(--app-cta-text)]'
              }`}>
                {voiceState === 'speaking'
                  ? 'Стоп'
                  : voiceState === 'listening'
                  ? 'Слушаю'
                  : voiceState === 'thinking'
                  ? 'Думаю...'
                  : 'Говорить'}
              </span>
            </button>

            {/* Right Group: Repeat & Speed Selector */}
            <div className="flex items-center gap-1.5">
              {/* Voice Speed Toggle (0.8x / 1.0x / 1.2x) */}
              <button
                onClick={() => {
                  soundEffects.click();
                  setVoiceSpeed((prev) => (prev === 0.8 ? 1.0 : prev === 1.0 ? 1.2 : 0.8));
                }}
                className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] hover:border-[var(--app-glass-border-hover)] backdrop-blur-xl text-[10px] sm:text-[11px] font-semibold text-[var(--app-text)] opacity-80 hover:opacity-100 active:scale-95 transition-all shadow-sm"
                title="Скорость речи (0.8x / 1.0x / 1.2x)"
              >
                {voiceSpeed}x
              </button>

              {/* Repeat Audio button */}
              <button
                onClick={() => {
                  if (lastAssistantMessage) {
                    soundEffects.click();
                    speakAssistant(lastAssistantMessage.content);
                  }
                }}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] hover:border-[var(--app-glass-border-hover)] backdrop-blur-xl flex items-center justify-center text-[var(--app-text)] opacity-80 hover:opacity-100 active:scale-95 transition-all shadow-sm"
                title="Повторить фразу"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <p className="text-[10px] sm:text-[11px] text-[var(--app-text)] opacity-60 mt-1.5 font-light text-center">
          Нажми микрофон и отвечай хомячку своими словами
        </p>

      </div>

      {/* 4. Lesson Complete Reward Modal */}
      <RewardModal
        isOpen={showRewardModal}
        coins={30}
        diamonds={1}
        onClose={() => setShowRewardModal(false)}
      />

      {/* 5. Google Auth Modal for 5-query limit */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

    </div>
  );
};
