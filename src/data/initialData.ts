import { DailyQuest, DictionaryPhrase, UserProfile, UserResources, VoiceSettings } from '../types';

export const INITIAL_RESOURCES: UserResources = {
  energy: 5,
  maxEnergy: 5,
  coins: 180,
  diamonds: 12,
  xp: 45
};

export const INITIAL_PROFILE: UserProfile = {
  name: "Любознательный Ученик",
  activeCharacterId: "3afffcee-f386-49bd-9358-8661fd63b822", // Hammy
  currentStreak: 3,
  lastStudyDate: new Date().toISOString().slice(0, 10),
  streakDays: [
    new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
    new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10),
    new Date().toISOString().slice(0, 10),
  ],
  totalLessonsCompleted: 5,
  totalWordsLearned: 12,
};

export const INITIAL_QUESTS: DailyQuest[] = [
  {
    id: "quest_speak_3",
    key: "speak_3",
    title: {
      ru: "Поговори 3 раза с хомячком",
      en: "Speak 3 times with your buddy",
      kk: "Хомякпен 3 рет сөйлес"
    },
    target: 3,
    progress: 1,
    completed: false,
    claimed: false,
    rewardCoins: 25,
    rewardDiamonds: 1,
    icon: "🎤"
  },
  {
    id: "quest_learn_2",
    key: "learn_2",
    title: {
      ru: "Выучи 2 новые фразы или идиомы",
      en: "Learn 2 new idioms or phrases",
      kk: "2 жаңа сөз тіркесін үйрен"
    },
    target: 2,
    progress: 1,
    completed: false,
    claimed: false,
    rewardCoins: 40,
    rewardDiamonds: 2,
    icon: "📖"
  },
  {
    id: "quest_finish_1",
    key: "finish_1",
    title: {
      ru: "Заверши 1 полный речевой урок (5 реплик)",
      en: "Complete 1 full speaking lesson (5 turns)",
      kk: "1 толық сөйлесу сабағын аяқта"
    },
    target: 1,
    progress: 0,
    completed: false,
    claimed: false,
    rewardCoins: 50,
    rewardDiamonds: 3,
    icon: "🏆"
  }
];

export const INITIAL_PHRASES: DictionaryPhrase[] = [
  {
    id: "phrase-1",
    language: "ru",
    phrase: "Береги честь смолоду",
    kidExplanation: "Главный жизненный завет: всегда поступать честно, искренне и благородно с самого детства.",
    literalMeaning: "Береги свою честь и доброе имя смолоду, точно так же, как берегут новую одежду.",
    example: "«Береги честь смолоду, а платье снову», — напутствовал отец Петра Гринёва.",
    sourceBook: "«Капитанская дочка» — А. С. Пушкин",
    dateAdded: "2026-10-25"
  },
  {
    id: "phrase-2",
    language: "ru",
    phrase: "Будет дождик, будут и грибки",
    kidExplanation: "Всё наладится! Любые временные трудности пройдут, и обязательно наступит радость и успех.",
    literalMeaning: "После тёплого дождя в лесу всегда вырастают грибы — добрая примета надежды.",
    example: "Не бойся делать ошибки при разговоре: будет дождик, будут и грибки!",
    sourceBook: "«Капитанская дочка» — А. С. Пушкин",
    dateAdded: "2026-10-26"
  },
  {
    id: "phrase-3",
    language: "ru",
    phrase: "Душа в душу",
    kidExplanation: "Жить в полном согласии, преданности, искренней дружбе и глубоком понимании.",
    literalMeaning: "Быть настолько близкими людьми, словно у вас одно дыхание и одно сердце.",
    example: "Маша Миронова и Петруша жили душа в душу, преодолевая любые жизненные бури.",
    sourceBook: "«Капитанская дочка» — А. С. Пушкин",
    dateAdded: "2026-10-27"
  },
  {
    id: "phrase-4",
    language: "en",
    phrase: "Like painting a fence",
    kidExplanation: "Turning any difficult task into a thrilling game so that everyone wants to take part!",
    literalMeaning: "Clever Tom turned the boring whitewashing of Aunt Polly’s fence into the most coveted game in town.",
    example: "Practicing English with Talkingo is like painting a fence — pure joy and adventure!",
    sourceBook: "«The Adventures of Tom Sawyer» — Mark Twain",
    dateAdded: "2026-10-25"
  },
  {
    id: "phrase-5",
    language: "en",
    phrase: "Cross your heart",
    kidExplanation: "A solemn promise between true friends to always speak the truth.",
    literalMeaning: "Crossing your hand over your heart as an unbreakable oath of loyalty.",
    example: "Cross your heart, Tom! Promise that you will practice new phrases with Hammy today!",
    sourceBook: "«The Adventures of Tom Sawyer» — Mark Twain",
    dateAdded: "2026-10-26"
  },
  {
    id: "phrase-6",
    language: "kk",
    phrase: "Түбінде адам болатын бала",
    kidExplanation: "Қиындықтан қорықпайтын, жүрегі ашық әрі келешекте үлкен азамат болатын дарынды бала.",
    literalMeaning: "Бойында намыс пен жігері бар, есейгенде үлкен ел азаматы болатын жас өркен.",
    example: "Майқанова мұғалім Қожаның тентек болса да, түбінде адам болатынына кәміл сенді.",
    sourceBook: "«Менің атым Қожа» — Бердібек Соқпақбаев",
    dateAdded: "2026-10-26"
  },
  {
    id: "phrase-7",
    language: "kk",
    phrase: "Қожа көнбейді",
    kidExplanation: "Әділетсіздікке мойымайтын, шындық үшін тайсалмай күресетін қайсар мінез.",
    literalMeaning: "Қожаның өзіне тән намысты, тайсалмас қайсар мінезі.",
    example: "«Қожа көнбейді!» — деп өзіне серт беріп, сөздік пен сабаққа құлшына кірісті.",
    sourceBook: "«Менің атым Қожа» — Бердібек Соқпақбаев",
    dateAdded: "2026-10-27"
  }
];

export const INITIAL_VOICE_SETTINGS: VoiceSettings = {
  deepseekApiKey: "",
  deepseekBaseUrl: "",
  deepseekModel: "deepseek-v4-flash",
  ttsEngine: "elevenlabs",
  elevenlabsVoiceId: "cgSgspJ2msm6clMCkdW9",
  voiceRate: 0.95,
  voicePitch: 1.1,
  soundEffects: true
};
