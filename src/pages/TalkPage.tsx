import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  soundEffects,
  speakWithBrowser,
  speakWithElevenLabs,
  speakWithOpenAI,
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
  VolumeX,
  Sparkles,
  Send,
  BookOpen,
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
    const greetingText = activeCharacter.greeting[lang] || activeCharacter.greeting.ru;
    const initialMsg: ChatMessage = {
      id: 'greeting-' + Date.now(),
      role: 'assistant',
      content: greetingText,
      timestamp: Date.now(),
    };
    setMessages([initialMsg]);

    // Say greeting aloud
    speakAssistant(greetingText);

    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.warn(e);
        }
      }
    };
  }, [activeCharacter.id, lang]);

  // Voice output dispatcher based on settings
  const speakAssistant = async (text: string) => {
    setVoiceState('speaking');
    try {
      if (voiceSettings.ttsEngine === 'openai' && voiceSettings.openaiApiKey) {
        await speakWithOpenAI(text, voiceSettings.openaiApiKey);
      } else if (voiceSettings.ttsEngine === 'elevenlabs' && voiceSettings.elevenlabsApiKey) {
        await speakWithElevenLabs(text, voiceSettings.elevenlabsApiKey, voiceSettings.elevenlabsVoiceId);
      } else if (voiceSettings.ttsEngine === 'webspeech') {
        await speakWithBrowser(text, lang, {
          rate: voiceSettings.voiceRate,
          pitch: voiceSettings.voicePitch,
          voiceName: voiceSettings.voiceName,
        });
      } else {
        // High quality Microsoft Edge Neural TTS by default!
        await speakWithEdgeNeural(text, lang);
      }
    } catch (e) {
      console.warn("TTS failed, falling back to browser speech:", e);
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
      alert(t('notSupported'));
      return;
    }

    const recognition = createSpeechRecognizer(lang);
    if (!recognition) {
      alert(t('notSupported'));
      return;
    }

    recognitionRef.current = recognition;
    setInterimTranscript('');
    setVoiceState('listening');
    soundEffects.listenStart();

    recognition.onresult = (event: any) => {
      let finalStr = '';
      let interimStr = '';
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
      // Call DeepSeek / AI Service
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

      // Record speech turn & update daily quests
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

      // Check lesson progress
      const nextTurns = turnsCount + 1;
      setTurnsCount(nextTurns);

      // Speak AI reply aloud
      await speakAssistant(response.spoken);

      // Reward after turnsGoal completed
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
    <div
      className={`min-h-screen flex flex-col justify-between bg-gradient-to-br ${activeCharacter.gradient} text-white transition-all duration-300 relative overflow-hidden select-none`}
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />

      {/* 1. Header Bar */}
      <div className="relative z-10 flex items-center justify-between p-4 max-w-lg mx-auto w-full">
        <button
          onClick={() => {
            stopSpeaking();
            navigate('/learn');
          }}
          className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl hover:bg-white/30 active:scale-95 transition-all shadow-md border border-white/20"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Turns Progress Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-md">
          <span className="text-xs font-black">
            🎯 {turnsCount} / {turnsGoal} {t('fiveTurnLesson')}
          </span>
        </div>

        {/* Active Character Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 font-black text-xs shadow-md">
          <span>{activeCharacter.emoji}</span>
          <span>{activeCharacter.name.split(' ')[0]}</span>
        </div>
      </div>

      {/* 2. Character Center Stage */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-lg mx-auto w-full text-center">
        
        {/* Animated Mascot Emoji */}
        <div className="relative my-2 sm:my-4">
          
          {/* Pulsing ring effects around character when active */}
          {voiceState === 'listening' && (
            <div className="absolute inset-0 rounded-full bg-red-400/40 animate-ping -z-10 scale-125" />
          )}
          {voiceState === 'speaking' && (
            <div className="absolute inset-0 rounded-full bg-green-300/40 animate-pulse -z-10 scale-125" />
          )}
          {voiceState === 'thinking' && (
            <div className="absolute inset-0 rounded-full bg-purple-400/40 animate-pulse -z-10 scale-110" />
          )}

          <div
            className={`text-[120px] sm:text-[150px] drop-shadow-2xl transition-all duration-300 ${
              voiceState === 'speaking'
                ? 'scale-110 animate-bounce'
                : voiceState === 'listening'
                ? 'scale-95'
                : voiceState === 'thinking'
                ? 'animate-pulse'
                : 'animate-bounce-slow'
            }`}
          >
            {activeCharacter.emoji}
          </div>
        </div>

        {/* State Badge */}
        <div className="mb-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black shadow-md transition-all ${
              voiceState === 'listening'
                ? 'bg-rose-500 text-white animate-pulse'
                : voiceState === 'thinking'
                ? 'bg-purple-600 text-white animate-pulse'
                : voiceState === 'speaking'
                ? 'bg-emerald-500 text-white'
                : 'bg-white/20 text-white/90 backdrop-blur'
            }`}
          >
            {voiceState === 'listening' && <Mic className="w-3.5 h-3.5" />}
            {voiceState === 'speaking' && <Volume2 className="w-3.5 h-3.5" />}
            <span>{t(voiceState)}</span>
          </span>
        </div>

        {/* Audio Wave Visualizer */}
        <AudioWave active={voiceState === 'speaking' || voiceState === 'listening'} />

        {/* Assistant Speech Bubble */}
        <div className="mt-2 w-full max-w-sm bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 text-slate-800 shadow-2xl border-4 border-white/80 transition-all">
          <p className="text-sm sm:text-base font-extrabold leading-snug">
            "{lastAssistantMessage?.content || activeCharacter.greeting[lang]}"
          </p>

          {/* New Idiom Notification Banner */}
          {latestDiscoveredPhrase && (
            <div className="mt-3 p-2.5 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 text-left animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-1 text-xs font-black text-amber-800 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Новое крылатое выражение в словаре!</span>
              </div>
              <p className="text-xs font-black text-amber-950">
                «{latestDiscoveredPhrase.phrase}» — {latestDiscoveredPhrase.meaning}
              </p>
              {latestDiscoveredPhrase.source && (
                <p className="text-[10px] font-bold text-amber-700 italic mt-0.5">
                  📖 {latestDiscoveredPhrase.source}
                </p>
              )}
            </div>
          )}

          {/* User Interim Transcript while speaking */}
          {interimTranscript && (
            <div className="mt-2 pt-2 border-t border-slate-200 text-xs font-bold text-slate-500 italic">
              Ты говоришь: "{interimTranscript}..."
            </div>
          )}
        </div>

      </div>

      {/* 3. Bottom Controls */}
      <div className="relative z-10 p-6 pb-10 max-w-lg mx-auto w-full flex flex-col items-center">
        
        {/* Toggle Keyboard / Text Input */}
        {showKeyboard ? (
          <form
            onSubmit={handleTextSubmit}
            className="w-full flex items-center gap-2 mb-4 animate-in fade-in duration-150"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Напиши фразу здесь..."
              className="flex-1 py-3 px-4 rounded-2xl bg-white text-slate-800 font-bold text-sm shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || voiceState === 'thinking'}
              className="p-3 rounded-2xl bg-duo-green text-white font-black shadow-xl active:scale-90 transition-transform disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowKeyboard(false)}
              className="p-3 rounded-2xl bg-white/20 text-white font-black shadow-xl active:scale-90 transition-transform"
            >
              <Mic className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <div className="w-full flex items-center justify-center gap-6 mb-2">
            
            {/* Keyboard mode button */}
            <button
              onClick={() => setShowKeyboard(true)}
              className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg active:scale-90 transition-all border border-white/20"
              title="Написать текстом"
            >
              <Keyboard className="w-5 h-5" />
            </button>

            {/* Giant Central 🎤 Microphone Button */}
            <div className="relative">
              {/* Outer pulsing animated ripple */}
              <div
                className={`absolute -inset-3 rounded-full transition-all duration-300 -z-10 ${
                  voiceState === 'listening'
                    ? 'bg-rose-400/50 animate-ping'
                    : voiceState === 'speaking'
                    ? 'bg-emerald-400/40 animate-pulse'
                    : 'bg-white/20 animate-pulse-glow'
                }`}
              />

              <button
                onClick={handleMicClick}
                disabled={voiceState === 'thinking'}
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all border-4 border-white ${
                  voiceState === 'listening'
                    ? 'bg-rose-500 text-white scale-105 ring-8 ring-rose-300'
                    : voiceState === 'speaking'
                    ? 'bg-emerald-500 text-white ring-8 ring-emerald-300'
                    : 'bg-white text-slate-800 hover:scale-105 active:scale-95 ring-8 ring-white/40'
                } disabled:opacity-60`}
              >
                {voiceState === 'listening' ? (
                  <MicOff className="w-12 h-12 animate-pulse" />
                ) : voiceState === 'speaking' ? (
                  <Volume2 className="w-12 h-12 animate-pulse" />
                ) : (
                  <Mic className="w-12 h-12 text-duo-green" />
                )}
                <span className="text-[11px] font-black uppercase mt-1 tracking-tight">
                  {voiceState === 'speaking'
                    ? 'Остановить'
                    : voiceState === 'listening'
                    ? 'Слушаю'
                    : 'Нажми'}
                </span>
              </button>
            </div>

            {/* Repeat Audio button */}
            <button
              onClick={() => {
                if (lastAssistantMessage) {
                  speakAssistant(lastAssistantMessage.content);
                }
              }}
              className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg active:scale-90 transition-all border border-white/20"
              title="Повторить фразу"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        )}

        <p className="text-xs font-black text-white/90 drop-shadow mt-2">
          {t('tapToTalk')}
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
