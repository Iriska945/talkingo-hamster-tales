import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  soundEffects,
  speakWithBrowser,
  speakWithEdgeNeural,
  stopSpeaking,
} from '../services/voice';
import { generateTalkResponse } from '../services/deepseek';
import { ChatMessage } from '../types';
import { RewardModal } from '../components/RewardModal';
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
} from 'lucide-react';

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

export const TalkPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    lang,
    t,
    activeCharacter,
    voiceSettings,
    recordSpeechTurn,
    completeLesson,
  } = useApp();

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [turnsCount, setTurnsCount] = useState<number>(0);
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [showKeyboard, setShowKeyboard] = useState<boolean>(false);
  const [latestDiscoveredPhrase, setLatestDiscoveredPhrase] = useState<{
    phrase: string;
    meaning: string;
    source?: string;
  } | null>(null);

  const recognitionRef = useRef<any>(null);
  const turnsGoal = 5;

  // Initialize character greeting on page mount
  useEffect(() => {
    const greeting = activeCharacter.greeting[lang] || activeCharacter.greeting.ru;
    const initialMsg: ChatMessage = {
      id: 'greeting',
      role: 'assistant',
      content: greeting,
      timestamp: Date.now(),
    };
    setMessages([initialMsg]);

    const timer = setTimeout(() => {
      speakAssistant(greeting);
    }, 400);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [lang, activeCharacter]);

  // Voice synthesis with Edge Neural
  const speakAssistant = async (text: string) => {
    setVoiceState('speaking');
    try {
      if (voiceSettings.ttsEngine === 'webspeech') {
        await speakWithBrowser(text, lang, {
          rate: voiceSettings.voiceRate,
          pitch: voiceSettings.voicePitch,
          voiceName: voiceSettings.voiceName,
        });
      } else {
        await speakWithEdgeNeural(text, lang);
      }
    } catch (e) {
      console.warn('Edge TTS failed, fallback to browser speech:', e);
      await speakWithBrowser(text, lang);
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
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setVoiceState('idle');
      return;
    }

    if (voiceState !== 'idle') return;

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

      setInterimTranscript(interimStr || finalStr);

      if (finalStr.trim()) {
        handleUserSpeech(finalStr.trim());
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

  // Process user message (either spoken or typed)
  const handleUserSpeech = async (userText: string) => {
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
    const txt = textInput.trim();
    setTextInput('');
    handleUserSpeech(txt);
  };

  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === 'assistant');

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF8F5] text-[#1C1A17] transition-all relative overflow-hidden select-none">
      
      {/* 1. Header Bar (Open Style Minimalist Pill Dock) */}
      <div className="relative z-20 flex items-center justify-between p-4 max-w-md mx-auto w-full">
        <button
          onClick={() => {
            stopSpeaking();
            navigate('/learn');
          }}
          className="w-10 h-10 rounded-full bg-white border border-[#EAE6DE] shadow-sm flex items-center justify-center hover:bg-[#F6F3EC] active:scale-95 transition-all"
          title="Завершить сессию"
        >
          <X className="w-5 h-5 text-[#1C1A17]" />
        </button>

        {/* Turns Progress Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EAE6DE] shadow-sm text-xs font-semibold text-[#1C1A17]">
          <span className="w-2 h-2 rounded-full bg-[#3F634D]" />
          <span>{turnsCount} / {turnsGoal} реплик</span>
        </div>

        {/* Active Character Badge */}
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#EAE6DE] shadow-sm text-xs font-bold text-[#1C1A17]">
          <span>{activeCharacter.emoji}</span>
          <span className="text-[11px] font-semibold text-[#78746D]">{activeCharacter.name.split(' ')[0]}</span>
        </div>
      </div>

      {/* 2. Center Stage: Mindful Concentric Breathing Rings */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-md mx-auto w-full text-center">
        
        {/* Concentric Breathing Circle Visualization */}
        <div className="relative my-6 flex items-center justify-center">
          
          {/* Outermost Ring */}
          <div
            className={`absolute rounded-full transition-all duration-700 pointer-events-none ${
              voiceState === 'listening'
                ? 'w-64 h-64 bg-[#E8EFEA] border-2 border-[#3F634D]/30 animate-ping opacity-40'
                : voiceState === 'speaking'
                ? 'w-64 h-64 bg-[#F8F3E8] border-2 border-[#C49B52]/40 animate-pulse'
                : voiceState === 'thinking'
                ? 'w-60 h-60 bg-[#F9EFEB] border border-[#D2674E]/30 animate-pulse'
                : 'w-56 h-56 bg-[#F6F3EC] border border-[#EAE6DE] opacity-60'
            }`}
          />

          {/* Middle Ring */}
          <div
            className={`absolute rounded-full transition-all duration-500 pointer-events-none ${
              voiceState === 'listening'
                ? 'w-48 h-48 bg-[#E8EFEA] opacity-80'
                : voiceState === 'speaking'
                ? 'w-48 h-48 bg-[#F8F3E8] opacity-80'
                : 'w-44 h-44 bg-[#F2EEE6] opacity-70'
            }`}
          />

          {/* Core Mascot Bubble */}
          <div
            className={`relative z-10 w-32 h-32 rounded-full bg-white border border-[#EAE6DE] shadow-[0_8px_24px_rgba(28,26,23,0.06)] flex items-center justify-center text-6xl transition-all duration-300 ${
              voiceState === 'speaking'
                ? 'scale-105'
                : voiceState === 'listening'
                ? 'scale-95'
                : 'hover:scale-102'
            }`}
          >
            <span className={voiceState === 'speaking' ? 'animate-bounce' : 'animate-float-gentle'}>
              {activeCharacter.emoji}
            </span>
          </div>
        </div>

        {/* State Label Tag */}
        <div className="mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${
              voiceState === 'listening'
                ? 'bg-[#E8EFEA] text-[#3F634D] border border-[#3F634D]/30 animate-pulse'
                : voiceState === 'thinking'
                ? 'bg-[#F9EFEB] text-[#D2674E] border border-[#D2674E]/30 animate-pulse'
                : voiceState === 'speaking'
                ? 'bg-[#F8F3E8] text-[#C49B52] border border-[#C49B52]/40'
                : 'bg-white text-[#78746D] border border-[#EAE6DE]'
            }`}
          >
            {voiceState === 'listening' && <Mic className="w-3 h-3 text-[#3F634D]" />}
            {voiceState === 'speaking' && <Volume2 className="w-3 h-3 text-[#C49B52]" />}
            <span>
              {voiceState === 'listening'
                ? 'Слушаю твою речь...'
                : voiceState === 'thinking'
                ? 'Обдумываю ответ...'
                : voiceState === 'speaking'
                ? 'Хомячок говорит...'
                : 'Нажми микрофон для ответа'}
            </span>
          </span>
        </div>

        {/* Assistant Speech Bubble Card */}
        <div className="w-full max-w-sm open-card p-5 text-left transition-all">
          <p className="text-sm font-semibold text-[#1C1A17] leading-relaxed">
            «{lastAssistantMessage?.content || activeCharacter.greeting[lang]}»
          </p>

          {/* New Idiom Notification Banner */}
          {latestDiscoveredPhrase && (
            <div className="mt-3 p-3 rounded-2xl bg-[#F8F3E8] border border-[#EBE0C7] text-left animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#C49B52] mb-0.5">
                <Sparkles className="w-3 h-3 text-[#C49B52]" />
                <span>Новое крылатое выражение в словаре</span>
              </div>
              <p className="text-xs font-bold text-[#1C1A17]">
                «{latestDiscoveredPhrase.phrase}» — {latestDiscoveredPhrase.meaning}
              </p>
              {latestDiscoveredPhrase.source && (
                <p className="text-[10px] text-[#78746D] italic mt-0.5">
                  📖 {latestDiscoveredPhrase.source}
                </p>
              )}
            </div>
          )}

          {/* User Interim Transcript while speaking */}
          {interimTranscript && (
            <div className="mt-2.5 pt-2 border-t border-[#F2EEE6] text-xs font-medium text-[#78746D] italic">
              Ты говоришь: "{interimTranscript}..."
            </div>
          )}
        </div>

        {/* Sound waves indicator */}
        <div className="mt-3">
          <AudioWave active={voiceState === 'speaking' || voiceState === 'listening'} color="bg-[#3F634D]" />
        </div>

      </div>

      {/* 3. Bottom Control Dock (Clean Open Buttons) */}
      <div className="relative z-20 pb-8 pt-2 px-4 max-w-md mx-auto w-full flex flex-col items-center">
        
        {/* Optional text input field */}
        {showKeyboard ? (
          <form onSubmit={handleTextSubmit} className="w-full flex items-center gap-2 mb-3">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Напиши сообщение хомячку..."
              autoFocus
              className="flex-1 px-4 py-3 rounded-full bg-white border border-[#EAE6DE] text-sm text-[#1C1A17] focus:outline-none focus:border-[#3F634D] shadow-sm"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || voiceState === 'thinking'}
              className="w-11 h-11 rounded-full btn-open-primary flex items-center justify-center shrink-0 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowKeyboard(false)}
              className="p-2 text-xs text-[#78746D] hover:text-[#1C1A17]"
            >
              Отмена
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-5 w-full">
            
            {/* Keyboard toggle */}
            <button
              onClick={() => setShowKeyboard(true)}
              className="w-11 h-11 rounded-full bg-white border border-[#EAE6DE] shadow-sm flex items-center justify-center text-[#78746D] hover:text-[#1C1A17] active:scale-95 transition-all"
              title="Печатать текстом"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Central Large Mindful Mic Button */}
            <button
              onClick={handleMicClick}
              disabled={voiceState === 'thinking'}
              className={`w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-lg transition-all active:scale-95 ${
                voiceState === 'listening'
                  ? 'bg-[#3F634D] text-white ring-4 ring-[#E8EFEA]'
                  : voiceState === 'speaking'
                  ? 'bg-[#1C1A17] text-white ring-4 ring-[#F8F3E8]'
                  : 'bg-[#1C1A17] text-white hover:bg-black'
              }`}
            >
              {voiceState === 'listening' ? (
                <MicOff className="w-8 h-8 animate-pulse text-[#FAF8F5]" />
              ) : voiceState === 'speaking' ? (
                <Volume2 className="w-8 h-8 animate-pulse text-[#F8BA44]" />
              ) : (
                <Mic className="w-8 h-8 text-[#FAF8F5]" />
              )}
              <span className="text-[10px] font-bold mt-1 tracking-tight">
                {voiceState === 'speaking'
                  ? 'Стоп'
                  : voiceState === 'listening'
                  ? 'Слушаю'
                  : 'Говорить'}
              </span>
            </button>

            {/* Repeat Audio button */}
            <button
              onClick={() => {
                if (lastAssistantMessage) {
                  speakAssistant(lastAssistantMessage.content);
                }
              }}
              className="w-11 h-11 rounded-full bg-white border border-[#EAE6DE] shadow-sm flex items-center justify-center text-[#78746D] hover:text-[#1C1A17] active:scale-95 transition-all"
              title="Повторить фразу"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}

        <p className="text-[11px] text-[#A8A399] mt-3">
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

    </div>
  );
};
