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
      phrase: 'Береги честь смолоду',
      kidExplanation: 'Главный жизненный завет: всегда поступать честно, искренне и благородно с самого детства.',
      literalMeaning: 'Береги свою честь и доброе имя смолоду, точно так же, как берегут новую одежду.',
      sourceBook: '«Капитанская дочка» — А. С. Пушкин',
      example: '«Береги честь смолоду, а платье снову», — напутствовал отец Петра Гринёва.',
    },
    {
      language: 'ru',
      phrase: 'Будет дождик, будут и грибки',
      kidExplanation: 'Всё наладится! Любые временные трудности пройдут, и обязательно наступит радость и успех.',
      literalMeaning: 'После тёплого дождя в лесу всегда вырастают грибы — примета веры в доброе будущее.',
      sourceBook: '«Капитанская дочка» — А. С. Пушкин',
      example: 'Не бойся делать ошибки при разговоре: будет дождик, будут и грибки!',
    },
    {
      language: 'ru',
      phrase: 'Душа в душу',
      kidExplanation: 'Жить в согласии, верности, взаимной поддержке и глубоком понимании.',
      literalMeaning: 'Быть настолько близкими друзьями, словно у вас одно дыхание и одно сердце.',
      sourceBook: '«Капитанская дочка» — А. С. Пушкин',
      example: 'Маша Миронова и Петруша жили душа в душу, оставаясь верными своей любви.',
    },
    {
      language: 'ru',
      phrase: 'Час от часу не легче',
      kidExplanation: 'Когда неожиданно наступает череда новых интересных событий или испытаний.',
      literalMeaning: 'С каждым новым часом задача становится глубже, требуя смелости.',
      sourceBook: '«Капитанская дочка» — А. С. Пушкин',
      example: 'Час от часу не легче — хомячок Хэмми приготовил для нас новый скоростной диалог!',
    },
    {
      language: 'ru',
      phrase: 'Казнить так казнить, жаловать так жаловать',
      kidExplanation: 'Делать дело с открытой душой, щедро и на все сто процентов.',
      literalMeaning: 'Атаманское правило: проявлять великодушие и решительность без полумер.',
      sourceBook: '«Капитанская дочка» — А. С. Пушкин',
      example: 'Учить иностранный язык надо смело: казнить так казнить, жаловать так жаловать!',
    },
  ],
  en: [
    {
      language: 'en',
      phrase: 'Like painting a fence',
      kidExplanation: 'Turning any difficult task into a thrilling game so that everyone wants to take part!',
      literalMeaning: 'Clever Tom turned the boring whitewashing of Aunt Polly’s fence into the most coveted game in town.',
      sourceBook: '«The Adventures of Tom Sawyer» — Mark Twain',
      example: 'Practicing English with Talkingo is like painting a fence — pure joy and adventure!',
    },
    {
      language: 'en',
      phrase: 'Cross your heart',
      kidExplanation: 'A solemn promise between true friends to always speak the truth.',
      literalMeaning: 'Crossing your hand over your heart as an unbreakable oath of loyalty.',
      sourceBook: '«The Adventures of Tom Sawyer» — Mark Twain',
      example: 'Cross your heart, Tom! Promise that you will practice new phrases with Hammy today!',
    },
    {
      language: 'en',
      phrase: 'Play hooky',
      kidExplanation: 'To skip boring routine chores in order to embark on a brave adventure.',
      literalMeaning: 'To playfully hook away from the classroom toward freedom in nature.',
      sourceBook: '«The Adventures of Tom Sawyer» — Mark Twain',
      example: 'Tom and Huck played hooky to explore the mysterious riverbanks of Mississippi.',
    },
    {
      language: 'en',
      phrase: 'A sight for sore eyes',
      kidExplanation: 'Someone or something you are overjoyed and deeply relieved to see after a long separation.',
      literalMeaning: 'A welcome vision so heartwarming that it soothes tired, longing eyes.',
      sourceBook: '«The Adventures of Tom Sawyer» — Mark Twain',
      example: 'When Tom and Becky safely returned from the cave, they were truly a sight for sore eyes!',
    },
  ],
  kk: [
    {
      language: 'kk',
      phrase: 'Түбінде адам болатын бала',
      kidExplanation: 'Қиындықтан қорықпайтын, жүрегі ашық әрі келешекте үлкен азамат болатын дарынды бала.',
      literalMeaning: 'Бойында намыс пен жігері бар, есейгенде үлкен ел азаматы болатын жас өркен.',
      sourceBook: '«Менің атым Қожа» — Бердібек Соқпақбаев',
      example: 'Майқанова мұғалім Қожаның тентек болса да, түбінде адам болатынына кәміл сенді.',
    },
    {
      language: 'kk',
      phrase: 'Қожа көнбейді',
      kidExplanation: 'Әділетсіздікке мойымайтын, шындық үшін тайсалмай күресетін қайсар мінез.',
      literalMeaning: 'Қожаның өзіне тән намысты, тайсалмас қайсар мінезі.',
      sourceBook: '«Менің атым Қожа» — Бердібек Соқпақбаев',
      example: '«Қожа көнбейді!» — деп өзіне серт беріп, сөздік пен сабаққа құлшына кірісті.',
    },
    {
      language: 'kk',
      phrase: 'Жақсының аты өлмейді',
      kidExplanation: 'Ізгі іс пен таза абырой ешқашан ұмытылмайды, ұрпаққа өнеге болып қалады.',
      literalMeaning: 'Жақсы адамның соңында қалдырған асыл мұрасы мен игі есімі мәңгі жасайды.',
      sourceBook: '«Менің атым Қожа» — Бердібек Соқпақбаев',
      example: 'Қожа әкесі Қадырды мақтан тұтып: «Жақсының аты өлмейді», — деп тебіренді.',
    },
    {
      language: 'kk',
      phrase: 'Сыр бермеу',
      kidExplanation: 'Қиын кезде көңіл-күйін жасырып, сабыр сақтап, сыртқа білдірмеу.',
      literalMeaning: 'Ішкі сырды берік сақтап, қиындықта жасымау.',
      sourceBook: '«Менің атым Қожа» — Бердібек Соқпақбаев',
      example: 'Қожа қанша қысылса да, достарының алдында сыр бермеуге тырысты.',
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
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] pb-28 pt-6 px-4 max-w-4xl mx-auto space-y-4 relative transition-colors duration-300 motion-page-enter">
      
      {/* Ambient background glow */}
      <div className="ambient-glow-orb w-[350px] h-[350px] bg-cyan-600/15 top-[-40px] left-[-80px] pointer-events-none" />
      <div className="ambient-glow-orb w-[300px] h-[300px] bg-indigo-600/10 top-[200px] right-[-60px] pointer-events-none" />

      {/* 1. Header with Mode Switcher (List vs Flashcards) */}
      <div className="liquid-glass p-5 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] flex items-center justify-center text-[var(--app-text)]">
              <Bookmark className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-lg font-medium text-[var(--app-text)] leading-tight">
                Словарь выражений
              </h1>
              <span className="text-xs opacity-70 font-light">
                Выучено: <strong className="text-emerald-500 font-semibold">{allPhrases.length}</strong> фраз
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
                  ? 'bg-[var(--app-cta-bg)] text-[var(--app-cta-text)] font-semibold shadow-sm'
                  : 'text-[var(--app-text)] opacity-60 hover:opacity-100'
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
              <Search className="w-4 h-4 text-[var(--app-text)] opacity-40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по фразе или автору..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] text-xs text-[var(--app-text)] placeholder:opacity-40 focus:outline-none focus:border-[var(--app-glass-border-hover)] transition-colors"
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
                      ? 'bg-[var(--app-cta-bg)] text-[var(--app-cta-text)] font-semibold shadow-sm'
                      : 'bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] text-[var(--app-text)] opacity-70 hover:opacity-100'
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
            <div className="liquid-glass p-8 text-center space-y-4 border border-[var(--app-glass-border)]">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                🎉
              </div>
              <h2 className="text-xl font-medium text-[var(--app-text)]">
                Тренировка завершена!
              </h2>
              <p className="text-xs text-[var(--app-text)] opacity-70 max-w-xs mx-auto leading-relaxed font-light">
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
            <div className="liquid-glass p-6 min-h-[300px] flex flex-col justify-between transition-all relative border border-[var(--app-glass-border)] shadow-xl">
              
              {/* Progress counter */}
              <div className="flex items-center justify-between text-xs text-[var(--app-text)] opacity-70">
                <span>Карточка {quizIndex + 1} из {allPhrases.length}</span>
                <span className="text-[10px] uppercase font-semibold text-emerald-500 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  {currentQuizCard.language === 'ru' ? 'Русский' : currentQuizCard.language === 'en' ? 'English' : 'Қазақша'}
                </span>
              </div>

              {/* Card Face */}
              <div className="my-8 text-center">
                <h3 className="text-2xl font-medium text-[var(--app-text)] tracking-tight leading-snug">
                  «{currentQuizCard.phrase}»
                </h3>

                <button
                  onClick={() => handleSpeakPhrase('quiz-' + quizIndex, currentQuizCard.phrase, currentQuizCard.language)}
                  className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] text-xs font-medium text-[var(--app-text)] hover:opacity-100 opacity-90 transition-colors"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${speakingId ? 'animate-pulse text-emerald-400' : ''}`} />
                  <span>Прослушать</span>
                </button>

                {/* Flipped details */}
                {isFlipped ? (
                  <div className="mt-6 p-4 rounded-2xl bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] text-left space-y-2 animate-in fade-in zoom-in-95">
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-emerald-500 dark:text-emerald-400 block tracking-wider">
                        Значение
                      </span>
                      <p className="text-xs text-[var(--app-text)] font-light leading-relaxed">
                        {currentQuizCard.kidExplanation}
                      </p>
                    </div>

                    {currentQuizCard.literalMeaning && (
                      <div className="text-xs text-[var(--app-text)] opacity-70 font-light">
                        <span className="text-[var(--app-text)] font-normal">Буквально: </span>
                        <span>{currentQuizCard.literalMeaning}</span>
                      </div>
                    )}

                    {currentQuizCard.sourceBook && (
                      <div className="text-[11px] text-amber-500 dark:text-amber-400 font-medium flex items-center gap-1 pt-1">
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
                      className="px-4 py-2 rounded-full border border-[var(--app-glass-border)] bg-[var(--app-pill-glass-bg)] text-xs font-medium text-[var(--app-text)] opacity-80 hover:opacity-100 transition-all"
                    >
                      Показать значение
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-[var(--app-glass-border)]">
                <button
                  onClick={() => handleNextCard(false)}
                  className="flex-1 py-2.5 rounded-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] hover:opacity-100 opacity-80 text-xs font-medium text-[var(--app-text)] transition-colors"
                >
                  Повторить позже
                </button>

                <button
                  onClick={() => handleNextCard(true)}
                  className="flex-1 py-2.5 rounded-full liquid-pill-white text-xs font-semibold flex items-center justify-center gap-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5 text-[var(--app-cta-text)]" />
                  <span>Помню (+5 XP)</span>
                </button>
              </div>

            </div>
          ) : null}
        </div>
      )}

      {/* 3. List Mode: Phrase Cards in Responsive Grid */}
      {viewMode === 'list' && (
        <div className="relative z-10">
          {filteredPhrases.length === 0 ? (
            <div className="liquid-glass p-8 text-center border border-[var(--app-glass-border)]">
              <div className="w-12 h-12 mx-auto rounded-full bg-[var(--app-pill-glass-bg)] flex items-center justify-center text-2xl mb-2">
                ✨
              </div>
              <h3 className="text-sm font-medium text-[var(--app-text)]">Фразы не найдены</h3>
              <p className="text-xs text-[var(--app-text)] opacity-70 mt-1 max-w-xs mx-auto font-light">
                Попробуй изменить поисковый запрос или фильтр языка.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPhrases.map((item, idx) => (
                <div
                  key={item.id}
                  className={`liquid-glass p-5 flex flex-col justify-between transition-all interactive-card motion-card-enter border border-[var(--app-glass-border)] space-y-3 stagger-${(idx % 6) + 1}`}
                >
                  <div className="space-y-3">
                    {/* Header row: Phrase & Audio Button */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <span className="text-base font-semibold text-[var(--app-text)] block leading-snug tracking-tight">
                          «{item.phrase}»
                        </span>
                        <span className="text-[10px] font-mono text-[var(--app-text)] opacity-50 uppercase tracking-wider">
                          {item.language === 'ru' ? '🇷🇺 Русский' : item.language === 'en' ? '🇬🇧 English' : '🇰🇿 Қазақша'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleSpeakPhrase(item.id, item.phrase, item.language)}
                        className="w-9 h-9 rounded-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] hover:border-[var(--app-glass-border-hover)] flex items-center justify-center text-[var(--app-text)] shrink-0 transition-transform active:scale-90 interactive-btn"
                        title="Озвучить"
                      >
                        <Volume2 className={`w-4 h-4 ${speakingId === item.id ? 'animate-pulse text-emerald-400' : ''}`} />
                      </button>
                    </div>

                    {/* Kid-friendly meaning */}
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 block mb-0.5">
                        ✨ Простое объяснение
                      </span>
                      <p className="text-xs text-[var(--app-text)] font-light leading-relaxed">
                        {item.kidExplanation}
                      </p>
                    </div>

                    {/* Literal meaning */}
                    {item.literalMeaning && (
                      <div className="text-xs text-[var(--app-text)] opacity-70 font-light">
                        <span className="text-[var(--app-text)] font-normal">Буквально: </span>
                        <span>{item.literalMeaning}</span>
                      </div>
                    )}

                    {/* Example */}
                    {item.example && (
                      <div className="text-xs text-[var(--app-text)] bg-[var(--app-pill-glass-bg)] p-2.5 rounded-2xl border border-[var(--app-glass-border)] font-light">
                        <span className="text-[var(--app-text)] opacity-60 font-normal">Пример: </span>
                        <span className="italic text-[var(--app-text)] font-normal">«{item.example}»</span>
                      </div>
                    )}
                  </div>

                  {/* Source Book Citation Badge */}
                  {item.sourceBook && (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-400 pt-2 border-t border-[var(--app-glass-border)]">
                      <BookOpen className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <span className="truncate font-medium">{item.sourceBook}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
