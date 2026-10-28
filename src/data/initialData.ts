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
    phrase: "Душа в душу",
    kidExplanation: "Жить очень дружно, мирно и во всём соглашаться друг с другом.",
    literalMeaning: "Быть единым дыханием и душой.",
    example: "Мы с моим хомячком Хэмми живём душа в душу!",
    sourceBook: "«Капитанская дочка» — А. С. Пушкин",
    dateAdded: "2026-10-25"
  },
  {
    id: "phrase-2",
    language: "ru",
    phrase: "Бить баклуши",
    kidExplanation: "Бездельничать, лениться или заниматься пустяками.",
    literalMeaning: "Колоть деревянные чурки для ложек — самое простое ремесло на Руси.",
    example: "Хватит бить баклуши, давай лучше потренируем английские фразы!",
    sourceBook: "Русский фольклор и сказания",
    dateAdded: "2026-10-26"
  },
  {
    id: "phrase-3",
    language: "ru",
    phrase: "Воды в рот набрать",
    kidExplanation: "Упорно молчать и ничего не отвечать.",
    literalMeaning: "Держать воду во рту так, что невозможно произнести ни слова.",
    example: "Не бойся говорить с хомячком, словно воды в рот набрал!",
    sourceBook: "«Мёртвые души» — Н. В. Гоголь",
    dateAdded: "2026-10-27"
  },
  {
    id: "phrase-4",
    language: "en",
    phrase: "Piece of cake",
    kidExplanation: "Something that is very simple and easy to do.",
    literalMeaning: "A slice of sweet delicious cake.",
    example: "Learning new words with Hammy is a piece of cake!",
    sourceBook: "American English Idioms & Tales",
    dateAdded: "2026-10-25"
  },
  {
    id: "phrase-5",
    language: "en",
    phrase: "Once in a blue moon",
    kidExplanation: "Happening very rarely.",
    literalMeaning: "An extra full moon appearing within a period, very rare.",
    example: "I eat sweet candies only once in a blue moon.",
    sourceBook: "Classic Folklore & Astronomy Tales",
    dateAdded: "2026-10-26"
  },
  {
    id: "phrase-6",
    language: "kk",
    phrase: "Көзі ашық",
    kidExplanation: "Білімді, көкірегі ояу, оқыған адам туралы айтылады.",
    literalMeaning: "Көзі ашық тұрған адам.",
    example: "Кітап оқыған баланың көзі ашық болады.",
    sourceBook: "Қазақ халық даналығы",
    dateAdded: "2026-10-26"
  },
  {
    id: "phrase-7",
    language: "kk",
    phrase: "Тайға таңба басқандай",
    kidExplanation: "Өте анық, айқын, көрініп тұрған нәрсе.",
    literalMeaning: "Жас тайға таңба салғандай айқын белгі.",
    example: "Оның айтқан сөздері тайға таңба басқандай анық болды.",
    sourceBook: "Қазақ әдебиетінің хрестоматиясы",
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
