import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Language, DictionaryPhrase } from '../types';
import { speakWithEdgeNeural, soundEffects } from '../services/voice';
import {
  Bookmark,
  Search,
  Volume2,
  BookOpen,
  Sparkles,
  Layers,
  RotateCw,
  Check,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STARTER_PHRASES: Record<Language, Array<Omit<DictionaryPhrase, 'id' | 'dateAdded'>>> = {
  ru: [
    {
      language: 'ru',
      phrase: 'Не разлей вода',
      kidExplanation: 'Очень крепкая и верная дружба, которую ничто не может разрушить.',
      literalMeaning: 'Даже вода не может протечь между лучшими друзьями.',
      sourceBook: 'Русские народные сказки',
      example: 'Мы с Хэмми теперь настоящие друзья — не разлей вода!',
    },
    {
      language: 'ru',
      phrase: 'Взять себя в руки',
      kidExplanation: 'Успокоиться, побороть волнение и собраться с мыслями.',
      literalMeaning: 'Словно удержать себя от лишних движений.',
      sourceBook: '«Отцы и дети» — И. С. Тургенев',
      example: 'Перед тем как говорить в микрофон, возьми себя в руки и сделай вдох.',
    },
    {
      language: 'ru',
      phrase: 'Светлая голова',
      kidExplanation: 'Очень умный, сообразительный и находчивый человек.',
      literalMeaning: 'Голова, полная ясных и добрых мыслей.',
      sourceBook: '«Детство» — Л. Н. Толстой',
      example: 'Ты отлично произнес фразу, у тебя поистине светлая голова!',
    },
  ],
  en: [
    {
      language: 'en',
      phrase: 'Break a leg',
      kidExplanation: 'A friendly and theatrical way to wish someone great luck and success.',
      literalMeaning: 'To fracture a bone in your leg (superstition saying).',
      sourceBook: 'Theatre & Stage Folklore',
      example: 'You are going to do great with your speech, break a leg!',
    },
    {
      language: 'en',
      phrase: 'Bite the bullet',
      kidExplanation: 'To be brave and face a challenge with confidence.',
      literalMeaning: 'Biting a lead bullet during medical care in ancient times.',
      sourceBook: 'Classic Adventure Tales',
      example: 'Do not be afraid of mistakes, just bite the bullet and speak!',
    },
  ],
  kk: [
    {
      language: 'kk',
      phrase: 'Ат салысу',
      kidExplanation: 'Бір игі іске шын жүректен көмектесу және үлес қосу.',
      literalMeaning: 'Атпен қатарласа жүріп жәрдемдесу.',
      sourceBook: 'Қазақ халық даналығы',
      example: 'Тіл үйрену жолында бәріміз ат салысайық!',
    },
  ],
};

export const DictionaryPage: React.FC = () => {
  const { lang, phrases, addDictionaryPhrase } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'quiz'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState<Language | 'all'>('all');
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Quiz Flashcards state
  const [quizIndex, setQuizIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Merge starter phrases if user collection is small
  const allPhrases: DictionaryPhrase[] = phrases.length > 0
    ? phrases
    : STARTER_PHRASES[lang]?.map((p, i) => ({
        ...p,
        id: 'starter-' + i,
        dateAdded: new Date().toISOString(),
      })) || [];

  const filteredPhrases = allPhrases.filter((p) => {
    const matchesLang = selectedLang === 'all' || p.language === selectedLang;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.phrase.toLowerCase().includes(query) ||
      p.kidExplanation.toLowerCase().includes(query) ||
      (p.sourceBook && p.sourceBook.toLowerCase().includes(query));
    return matchesLang && matchesSearch;
  });

  const handleSpeakPhrase = (id: string, phrase: string, phraseLang: Language) => {
    soundEffects.click();
    setSpeakingId(id);
    speakWithEdgeNeural(phrase, phraseLang).then(() => {
      setSpeakingId(null);
    });
  };

  const currentQuizCard = allPhrases[quizIndex % Math.max(1, allPhrases.length)];

  const handleNextCard = (remembered: boolean) => {
    if (remembered) {
      soundEffects.success();
    } else {
      soundEffects.click();
    }

    setIsFlipped(false);
    if (quizIndex + 1 >= allPhrases.length) {
      setQuizFinished(true);
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      } catch (e) {
        console.warn(e);
      }
    } else {
      setQuizIndex(quizIndex + 1);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-28 pt-4 px-4 max-w-lg mx-auto space-y-4 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="ambient-glow-orb w-[350px] h-[350px] bg-cyan-600/15 top-[-40px] left-[-80px] pointer-events-none" />
      <div className="ambient-glow-orb w-[300px] h-[300px] bg-indigo-600/10 top-[200px] right-[-60px] pointer-events-none" />

      {/* 1. Header with Mode Switcher (List vs Flashcards) */}
      <div className="liquid-glass p-5 border border-white/15 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/[0.08] border border-white/15 flex items-center justify-center text-white">
              <Bookmark className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-lg font-medium text-white leading-tight">
                Словарь выражений
              </h1>
              <span className="text-xs text-neutral-400 font-light">
                Выучено: <strong className="text-emerald-400 font-semibold">{allPhrases.length}</strong> фраз
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-full bg-white/[0.06] border border-white/15">
            <button
              onClick={() => {
                soundEffects.click();
                setViewMode('list');
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Список
            </button>
            <button
              onClick={() => {
                soundEffects.click();
                setViewMode('quiz');
                setQuizIndex(0);
                setIsFlipped(false);
                setQuizFinished(false);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
                viewMode === 'quiz'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Карточки</span>
            </button>
          </div>
        </div>

        {/* Search bar & filter pills (only in list mode) */}
        {viewMode === 'list' && (
          <>
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по фразе или автору..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/[0.06] border border-white/15 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'Все' },
                { id: 'ru', label: '🇷🇺 Русский' },
                { id: 'en', label: '🇬🇧 English' },
                { id: 'kk', label: '🇰🇿 Қазақша' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedLang(tab.id as any)}
                  className={`py-1 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedLang === tab.id
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'bg-white/[0.05] border border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 2. Flashcard Training Mode */}
      {viewMode === 'quiz' && (
        <div className="space-y-4 relative z-10">
          {quizFinished ? (
            <div className="liquid-glass p-8 text-center space-y-4 border border-white/15">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                🎉
              </div>
              <h2 className="text-xl font-medium text-white">
                Тренировка завершена!
              </h2>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed font-light">
                Отличная работа! Ты повторил все {allPhrases.length} выражений и закрепил их значение.
              </p>
              <button
                onClick={() => {
                  soundEffects.click();
                  setQuizIndex(0);
                  setIsFlipped(false);
                  setQuizFinished(false);
                }}
                className="px-6 py-2.5 liquid-pill-white text-xs font-semibold shadow-sm"
              >
                Повторить ещё раз
              </button>
            </div>
          ) : currentQuizCard ? (
            <div className="liquid-glass p-6 min-h-[300px] flex flex-col justify-between transition-all relative border border-white/20">
              
              {/* Progress counter */}
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Карточка {quizIndex + 1} из {allPhrases.length}</span>
                <span className="text-[10px] uppercase font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  {currentQuizCard.language === 'ru' ? 'Русский' : currentQuizCard.language === 'en' ? 'English' : 'Қазақша'}
                </span>
              </div>

              {/* Card Face */}
              <div className="my-8 text-center">
                <h3 className="text-2xl font-medium text-white tracking-tight leading-snug">
                  «{currentQuizCard.phrase}»
                </h3>

                <button
                  onClick={() => handleSpeakPhrase('quiz-' + quizIndex, currentQuizCard.phrase, currentQuizCard.language)}
                  className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/15 text-xs font-medium text-white hover:bg-white/15 transition-colors"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${speakingId ? 'animate-pulse text-emerald-400' : ''}`} />
                  <span>Прослушать</span>
                </button>

                {/* Flipped details */}
                {isFlipped ? (
                  <div className="mt-6 p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-left space-y-2 animate-in fade-in zoom-in-95">
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-emerald-400 block tracking-wider">
                        Значение
                      </span>
                      <p className="text-xs text-white font-light leading-relaxed">
                        {currentQuizCard.kidExplanation}
                      </p>
                    </div>

                    {currentQuizCard.literalMeaning && (
                      <div className="text-xs text-neutral-400 font-light">
                        <span className="text-white font-normal">Буквально: </span>
                        <span>{currentQuizCard.literalMeaning}</span>
                      </div>
                    )}

                    {currentQuizCard.sourceBook && (
                      <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1 pt-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{currentQuizCard.sourceBook}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        soundEffects.click();
                        setIsFlipped(true);
                      }}
                      className="px-4 py-2 rounded-full border border-white/20 bg-white/[0.04] text-xs font-medium text-neutral-300 hover:bg-white/10 transition-all"
                    >
                      Показать значение
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => handleNextCard(false)}
                  className="flex-1 py-2.5 rounded-full bg-white/[0.06] border border-white/15 hover:bg-white/10 text-xs font-medium text-neutral-300 transition-colors"
                >
                  Повторить позже
                </button>

                <button
                  onClick={() => handleNextCard(true)}
                  className="flex-1 py-2.5 rounded-full liquid-pill-white text-xs font-semibold flex items-center justify-center gap-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5 text-black" />
                  <span>Помню (+5 XP)</span>
                </button>
              </div>

            </div>
          ) : null}
        </div>
      )}

      {/* 3. List Mode: Phrase Cards */}
      {viewMode === 'list' && (
        <div className="space-y-3 relative z-10">
          {filteredPhrases.length === 0 ? (
            <div className="liquid-glass p-8 text-center border border-white/15">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/[0.08] flex items-center justify-center text-2xl mb-2">
                ✨
              </div>
              <h3 className="text-sm font-medium text-white">Фразы не найдены</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto font-light">
                Попробуй изменить поисковый запрос или фильтр языка.
              </p>
            </div>
          ) : (
            filteredPhrases.map((item) => (
              <div
                key={item.id}
                className="liquid-glass p-4.5 transition-all hover:border-white/25 space-y-2.5 border border-white/15"
              >
                {/* Header row: Phrase & Audio Button */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-white block leading-snug">
                      «{item.phrase}»
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                      {item.language === 'ru' ? 'Русский' : item.language === 'en' ? 'English' : 'Қазақша'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSpeakPhrase(item.id, item.phrase, item.language)}
                    className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/15 hover:bg-white/15 flex items-center justify-center text-neutral-300 shrink-0 transition-colors"
                    title="Озвучить"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${speakingId === item.id ? 'animate-pulse text-emerald-400' : ''}`} />
                  </button>
                </div>

                {/* Kid-friendly meaning */}
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 block mb-0.5">
                    ✨ Простое объяснение
                  </span>
                  <p className="text-xs text-white font-light leading-relaxed">
                    {item.kidExplanation}
                  </p>
                </div>

                {/* Literal meaning */}
                {item.literalMeaning && (
                  <div className="text-xs text-neutral-400 font-light">
                    <span className="text-neutral-200 font-normal">Буквально: </span>
                    <span>{item.literalMeaning}</span>
                  </div>
                )}

                {/* Example */}
                {item.example && (
                  <div className="text-xs text-neutral-300 bg-white/[0.03] p-2.5 rounded-2xl border border-white/10 font-light">
                    <span className="text-neutral-400 font-normal">Пример: </span>
                    <span className="italic text-white">«{item.example}»</span>
                  </div>
                )}

                {/* Source Book Citation */}
                {item.sourceBook && (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-400 pt-0.5">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.sourceBook}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
