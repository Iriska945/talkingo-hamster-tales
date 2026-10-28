import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppTheme, Character, DailyQuest, DictionaryPhrase, Language, UserProfile, UserResources, VoiceSettings } from '../types';
import { CHARACTERS } from '../data/characters';
import { INITIAL_PHRASES, INITIAL_PROFILE, INITIAL_QUESTS, INITIAL_RESOURCES, INITIAL_VOICE_SETTINGS } from '../data/initialData';
import { soundEffects } from '../services/voice';

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: AppTheme;
  toggleTheme: () => void;
  setTheme: (theme: AppTheme) => void;
  t: (key: string) => string;
  characters: Character[];
  activeCharacter: Character;
  ownedCharacterIds: string[];
  resources: UserResources;
  profile: UserProfile;
  quests: DailyQuest[];
  phrases: DictionaryPhrase[];
  voiceSettings: VoiceSettings;
  buyCharacter: (character: Character) => boolean;
  selectCharacter: (characterId: string) => void;
  recordSpeechTurn: (phrasesFound: Array<{ phrase: string; meaning: string; literal_meaning?: string; source_book?: string; example?: string }>) => void;
  completeLesson: (coins: number, diamonds: number) => void;
  claimQuest: (questId: string) => void;
  addDictionaryPhrase: (phrase: Omit<DictionaryPhrase, 'id' | 'dateAdded'>) => void;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  resetProgress: () => void;
}

const STORAGE_KEYS = {
  LANG: 'talkingo_lang',
  RESOURCES: 'talkingo_resources',
  PROFILE: 'talkingo_profile',
  OWNED: 'talkingo_owned_chars',
  QUESTS: 'talkingo_quests',
  PHRASES: 'talkingo_phrases',
  VOICE: 'talkingo_voice_settings',
};

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  ru: {
    appName: "Talkingo",
    learn: "Учить",
    talk: "Говорить",
    shop: "Магазин",
    dictionary: "Словарь",
    quests: "Задания",
    settings: "Настройки",
    streak: "Дней подряд",
    daysInRow: "Дней занятий подряд",
    personalTraining: "Речевой тренажёр",
    tapToStart: "Нажми, чтобы говорить с",
    dailyQuests: "Ежедневные задания",
    speak3times: "Поговори 3 раза сегодня",
    learn2phrases: "Выучи 2 новые фразы",
    finishLesson: "Закончи 1 урок речи",
    claim: "Забрать",
    claimed: "Получено",
    shopTitle: "Магазин персонажей",
    shopSub: "Выбирай собеседника с уникальными способностями и бонусами!",
    own: "В наличии",
    buy: "Купить",
    select: "Выбрать",
    active: "Активный",
    dictTitle: "Мой словарь",
    dictSub: "Крылатые выражения, идиомы и пословицы из книг",
    dictEmpty: "Пока пусто. Поговори с хомячком, чтобы открыть крылатые фразы!",
    searchPhrases: "Поиск по фразам и значениям...",
    allLanguages: "Все языки",
    tapToTalk: "Нажми микрофон и говори",
    listening: "Слушаю тебя…",
    thinking: "Думаю над ответом…",
    speaking: "Говорю…",
    idle: "Готов к беседе",
    closeChat: "Завершить",
    lessonComplete: "Урок завершён!",
    rewardCoins: "монет",
    rewardDiamonds: "алмазов",
    awesome: "Супер!",
    common: "Обычный",
    rare: "Редкий",
    legendary: "Легендарный",
    notSupported: "Браузер не поддерживает микрофон. Открой в Google Chrome.",
    literal: "Дословно",
    kidFriendly: "Простыми словами",
    example: "Пример",
    source: "Источник",
    pronounce: "Озвучить",
    voiceSettingsTitle: "Настройки ИИ и голоса",
    apiKeyLabel: "Ключ DeepSeek API",
    apiKeyPlaceholder: "sk-...",
    testKey: "Проверить ключ",
    ttsEngineLabel: "Движок озвучки",
    browserSpeech: "Встроенный в браузер (Бесплатно, быстро)",
    openAiTts: "OpenAI TTS (Требует ключ OpenAI)",
    elevenLabsTts: "ElevenLabs (Требует ключ ElevenLabs)",
    speechRate: "Скорость речи",
    speechPitch: "Высота голоса (тон)",
    startPracticing: "Начать урок",
    fiveTurnLesson: "5 реплик до награды",
    turnsCompleted: "реплик сказано",
  },
  en: {
    appName: "Talkingo",
    learn: "Learn",
    talk: "Talk",
    shop: "Shop",
    dictionary: "Dictionary",
    quests: "Quests",
    settings: "Settings",
    streak: "Day streak",
    daysInRow: "Days in a row",
    personalTraining: "Speaking Trainer",
    tapToStart: "Tap to chat with",
    dailyQuests: "Daily Quests",
    speak3times: "Speak 3 times today",
    learn2phrases: "Learn 2 new phrases",
    finishLesson: "Finish 1 speaking lesson",
    claim: "Claim",
    claimed: "Claimed",
    shopTitle: "Character Shop",
    shopSub: "Choose a study buddy with special powers and rewards!",
    own: "Owned",
    buy: "Buy",
    select: "Select",
    active: "Active",
    dictTitle: "My Dictionary",
    dictSub: "Literary idioms and classic book expressions",
    dictEmpty: "Empty for now. Chat with your character to collect phrases!",
    searchPhrases: "Search phrases or meanings...",
    allLanguages: "All languages",
    tapToTalk: "Tap mic and speak",
    listening: "Listening…",
    thinking: "Thinking…",
    speaking: "Speaking…",
    idle: "Ready to chat",
    closeChat: "Close",
    lessonComplete: "Lesson Complete!",
    rewardCoins: "coins",
    rewardDiamonds: "diamonds",
    awesome: "Awesome!",
    common: "Common",
    rare: "Rare",
    legendary: "Legendary",
    notSupported: "Your browser doesn't support voice. Try Google Chrome.",
    literal: "Literal",
    kidFriendly: "Kid-friendly",
    example: "Example",
    source: "Source",
    pronounce: "Listen",
    voiceSettingsTitle: "AI & Voice Settings",
    apiKeyLabel: "DeepSeek API Key",
    apiKeyPlaceholder: "sk-...",
    testKey: "Test Key",
    ttsEngineLabel: "Voice Engine",
    browserSpeech: "Built-in Browser (Free, zero latency)",
    openAiTts: "OpenAI TTS (Requires OpenAI Key)",
    elevenLabsTts: "ElevenLabs (Requires ElevenLabs Key)",
    speechRate: "Speech speed",
    speechPitch: "Pitch",
    startPracticing: "Start Practice",
    fiveTurnLesson: "5 turns to reward",
    turnsCompleted: "turns completed",
  },
  kk: {
    appName: "Talkingo",
    learn: "Үйрену",
    talk: "Сөйлесу",
    shop: "Дүкен",
    dictionary: "Сөздік",
    quests: "Тапсырмалар",
    settings: "Баптаулар",
    streak: "Қатарынан күн",
    daysInRow: "Қатарынан сабақ күндері",
    personalTraining: "Сөйлеу жаттықтырушысы",
    tapToStart: "Сөйлесу үшін бас",
    dailyQuests: "Күнделікті тапсырмалар",
    speak3times: "Бүгін 3 рет сөйлес",
    learn2phrases: "2 жаңа сөз үйрен",
    finishLesson: "1 сөйлесу сабағын аяқта",
    claim: "Алу",
    claimed: "Алынды",
    shopTitle: "Кейіпкерлер дүкені",
    shopSub: "Өзіңе ұнайтын ерекше қабілеті бар кейіпкерді таңда!",
    own: "Бар",
    buy: "Сатып алу",
    select: "Таңдау",
    active: "Белсенді",
    dictTitle: "Менің сөздігім",
    dictSub: "Кітаптардан алынған қанатты сөздер мен мақал-мәтелдер",
    dictEmpty: "Әзірше бос. Досыңмен сөйлесіп, жаңа тіркестер жина!",
    searchPhrases: "Сөздер мен мағынаны іздеу...",
    allLanguages: "Барлық тілдер",
    tapToTalk: "Микрофонды басып сөйле",
    listening: "Тыңдап тұрмын…",
    thinking: "Ойланудамын…",
    speaking: "Сөйлеудемін…",
    idle: "Сөйлесуге дайын",
    closeChat: "Жабу",
    lessonComplete: "Сабақ аяқталды!",
    rewardCoins: "монета",
    rewardDiamonds: "алмаз",
    awesome: "Тамаша!",
    common: "Қарапайым",
    rare: "Сирек",
    legendary: "Аңызға айналған",
    notSupported: "Браузер дауысты қолдамайды. Google Chrome қолданыңыз.",
    literal: "Сөзбе-сөз",
    kidFriendly: "Қарапайым тілмен",
    example: "Мысал",
    source: "Дереккөз",
    pronounce: "Тыңдау",
    voiceSettingsTitle: "ИИ және дауыс баптаулары",
    apiKeyLabel: "DeepSeek API кілті",
    apiKeyPlaceholder: "sk-...",
    testKey: "Кілтті тексеру",
    ttsEngineLabel: "Дауыс қозғалтқышы",
    browserSpeech: "Браузерлік дауыс (Тегін)",
    openAiTts: "OpenAI TTS (OpenAI кілті қажет)",
    elevenLabsTts: "ElevenLabs (ElevenLabs кілті қажет)",
    speechRate: "Сөйлеу жылдамдығы",
    speechPitch: "Дауыс ырғағы",
    startPracticing: "Жаттығуды бастау",
    fiveTurnLesson: "Марапатқа дейін 5 реплика",
    turnsCompleted: "реплика айтылды",
  }
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      if (!localStorage.getItem('tg_theme_force_v4')) {
        localStorage.setItem('tg_theme', 'dark');
        localStorage.setItem('tg_theme_force_v4', '1');
        return 'dark';
      }
      const saved = localStorage.getItem('tg_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  const toggleTheme = () => {
    soundEffects.click();
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
  };

  useEffect(() => {
    try {
      localStorage.setItem('tg_theme', theme);
      localStorage.setItem('tg_gallery_theme', theme);
      document.documentElement.dataset.theme = theme;
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', theme === 'light' ? '#f4f4f1' : '#000000');
      }
    } catch (e) {
      console.warn('Theme update error:', e);
    }
  }, [theme]);

  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    return (saved === 'ru' || saved === 'en' || saved === 'kk') ? saved : 'ru';
  });

  const [resources, setResources] = useState<UserResources>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESOURCES);
      return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
    } catch {
      return INITIAL_RESOURCES;
    }
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  });

  const [ownedCharacterIds, setOwnedCharacterIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OWNED);
      return saved ? JSON.parse(saved) : ["3afffcee-f386-49bd-9358-8661fd63b822"];
    } catch {
      return ["3afffcee-f386-49bd-9358-8661fd63b822"];
    }
  });

  const [quests, setQuests] = useState<DailyQuest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTS);
      return saved ? JSON.parse(saved) : INITIAL_QUESTS;
    } catch {
      return INITIAL_QUESTS;
    }
  });

  const [phrases, setPhrases] = useState<DictionaryPhrase[]>(() => {
    try {
      if (!localStorage.getItem('tg_phrases_v3_curated')) {
        localStorage.setItem(STORAGE_KEYS.PHRASES, JSON.stringify(INITIAL_PHRASES));
        localStorage.setItem('tg_phrases_v3_curated', '1');
        return INITIAL_PHRASES;
      }
      const saved = localStorage.getItem(STORAGE_KEYS.PHRASES);
      return saved ? JSON.parse(saved) : INITIAL_PHRASES;
    } catch {
      return INITIAL_PHRASES;
    }
  });

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VOICE);
      const parsed = saved ? JSON.parse(saved) : {};
      return {
        ...INITIAL_VOICE_SETTINGS,
        ...parsed,
        ttsEngine: 'elevenlabs',
        elevenlabsVoiceId: parsed.elevenlabsVoiceId || 'cgSgspJ2msm6clMCkdW9',
      };
    } catch {
      return INITIAL_VOICE_SETTINGS;
    }
  });

  // Save changes to localStorage & sync to SQLite database
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
    // Background sync to server SQLite DB
    fetch('/api/user/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'demo-user',
        xpGained: 0,
        coinsGained: 0,
        diamondsGained: 0
      })
    }).catch(() => {});
  }, [resources]);

  // Initial load from SQLite database to hydrate real progress
  useEffect(() => {
    fetch('/api/user/state?userId=demo-user')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) {
          setResources(prev => ({
            ...prev,
            xp: Math.max(prev.xp, data.user.xp || 0),
            coins: Math.max(prev.coins, data.user.coins || 0),
            diamonds: Math.max(prev.diamonds, data.user.diamonds || 0),
          }));
          if (data.user.current_streak) {
            setProfile(prev => ({
              ...prev,
              currentStreak: Math.max(prev.currentStreak, data.user.current_streak)
            }));
          }
          if (Array.isArray(data.user.unlockedCharacters) && data.user.unlockedCharacters.length > 0) {
            setOwnedCharacterIds(prev => Array.from(new Set([...prev, ...data.user.unlockedCharacters])));
          }
        }
      })
      .catch(() => {});

    // Also hydrate dictionary phrases from SQLite
    fetch('/api/user/phrases?userId=demo-user')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.phrases && Array.isArray(data.phrases) && data.phrases.length > 0) {
          setPhrases(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newOnes = data.phrases
              .filter((p: any) => !existingIds.has(p.id))
              .map((p: any) => ({
                id: p.id,
                language: p.language || 'ru',
                phrase: p.phrase,
                kidExplanation: p.kid_explanation || '',
                literalMeaning: p.literal_meaning || '',
                sourceBook: p.source_book || '',
                example: p.example || '',
                dateAdded: p.created_at || new Date().toISOString(),
              }));
            return [...newOnes, ...prev];
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OWNED, JSON.stringify(ownedCharacterIds));
  }, [ownedCharacterIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PHRASES, JSON.stringify(phrases));
  }, [phrases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOICE, JSON.stringify(voiceSettings));
  }, [voiceSettings]);

  const activeCharacter = CHARACTERS.find(c => c.id === profile.activeCharacterId) || CHARACTERS[0];

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    soundEffects.click();
  };

  const t = (key: string): string => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.ru?.[key] || key;
  };

  const buyCharacter = (character: Character): boolean => {
    if (ownedCharacterIds.includes(character.id)) return true;

    if (resources.coins >= character.price_coins && resources.diamonds >= character.price_diamonds) {
      setResources(prev => ({
        ...prev,
        coins: prev.coins - character.price_coins,
        diamonds: prev.diamonds - character.price_diamonds,
      }));
      setOwnedCharacterIds(prev => [...prev, character.id]);
      setProfile(prev => ({ ...prev, activeCharacterId: character.id }));
      soundEffects.fanfare();
      return true;
    }
    return false;
  };

  const selectCharacter = (characterId: string) => {
    if (ownedCharacterIds.includes(characterId)) {
      setProfile(prev => ({ ...prev, activeCharacterId: characterId }));
      soundEffects.click();
    }
  };

  const updateQuestProgress = (key: string, amount: number) => {
    setQuests(prev => prev.map(q => {
      if (q.key === key) {
        const newProgress = Math.min(q.target, q.progress + amount);
        return {
          ...q,
          progress: newProgress,
          completed: newProgress >= q.target
        };
      }
      return q;
    }));
  };

  const recordSpeechTurn = (newPhrasesFound: Array<{ phrase: string; meaning: string; literal_meaning?: string; source_book?: string; example?: string }>) => {
    // 1. Advance speak_3 quest
    updateQuestProgress('speak_3', 1);

    // 2. Add phrases if found
    if (newPhrasesFound && newPhrasesFound.length > 0) {
      updateQuestProgress('learn_2', newPhrasesFound.length);
      const today = new Date().toISOString().slice(0, 10);
      newPhrasesFound.forEach(p => {
        if (!phrases.some(existing => existing.phrase.toLowerCase() === p.phrase.toLowerCase())) {
          setPhrases(prev => [
            {
              id: 'phrase-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
              language: lang,
              phrase: p.phrase,
              kidExplanation: p.meaning,
              literalMeaning: p.literal_meaning,
              sourceBook: p.source_book,
              example: p.example,
              dateAdded: today,
            },
            ...prev
          ]);
        }
      });
      setProfile(prev => ({ ...prev, totalWordsLearned: prev.totalWordsLearned + newPhrasesFound.length }));
    }

    // 3. Update streak check
    const today = new Date().toISOString().slice(0, 10);
    setProfile(prev => {
      if (!prev.streakDays.includes(today)) {
        return {
          ...prev,
          lastStudyDate: today,
          currentStreak: prev.currentStreak + 1,
          streakDays: [...prev.streakDays, today]
        };
      }
      return prev;
    });
  };

  const completeLesson = (rewardCoins: number, rewardDiamonds: number) => {
    setResources(prev => ({
      ...prev,
      coins: prev.coins + rewardCoins,
      diamonds: prev.diamonds + rewardDiamonds,
      xp: prev.xp + 25,
    }));
    updateQuestProgress('finish_1', 1);
    setProfile(prev => ({
      ...prev,
      totalLessonsCompleted: prev.totalLessonsCompleted + 1
    }));
    soundEffects.fanfare();

    // Persist completed lesson to SQLite
    fetch('/api/user/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'demo-user',
        xpGained: 25,
        coinsGained: rewardCoins,
        diamondsGained: rewardDiamonds
      })
    }).catch(() => {});
  };

  const claimQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return;

    setResources(prev => ({
      ...prev,
      coins: prev.coins + quest.rewardCoins,
      diamonds: prev.diamonds + quest.rewardDiamonds,
    }));

    setQuests(prev => prev.map(q => q.id === questId ? { ...q, claimed: true } : q));
    soundEffects.success();
  };

  const addDictionaryPhrase = (phrase: Omit<DictionaryPhrase, 'id' | 'dateAdded'>) => {
    const today = new Date().toISOString().slice(0, 10);
    const newId = 'phrase-' + Date.now();
    setPhrases(prev => [
      {
        ...phrase,
        id: newId,
        dateAdded: today
      },
      ...prev
    ]);
    soundEffects.success();

    // Persist to SQLite
    fetch('/api/user/phrases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'demo-user',
        phrase: {
          id: newId,
          language: phrase.language || lang,
          phrase: phrase.phrase,
          kidExplanation: phrase.kidExplanation,
          literalMeaning: phrase.literalMeaning,
          sourceBook: phrase.sourceBook,
          example: phrase.example
        }
      })
    }).catch(() => {});
  };

  const updateVoiceSettings = (newSettings: Partial<VoiceSettings>) => {
    setVoiceSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetProgress = () => {
    localStorage.clear();
    setResources(INITIAL_RESOURCES);
    setProfile(INITIAL_PROFILE);
    setOwnedCharacterIds(["3afffcee-f386-49bd-9358-8661fd63b822"]);
    setQuests(INITIAL_QUESTS);
    setPhrases(INITIAL_PHRASES);
    setVoiceSettings(INITIAL_VOICE_SETTINGS);
    soundEffects.click();
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        theme,
        toggleTheme,
        setTheme,
        t,
        characters: CHARACTERS,
        activeCharacter,
        ownedCharacterIds,
        resources,
        profile,
        quests,
        phrases,
        voiceSettings,
        buyCharacter,
        selectCharacter,
        recordSpeechTurn,
        completeLesson,
        claimQuest,
        addDictionaryPhrase,
        updateVoiceSettings,
        resetProgress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
