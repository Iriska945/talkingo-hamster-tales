export type Language = 'ru' | 'en' | 'kk';
export type AppTheme = 'dark' | 'light';

export interface Character {
  id: string;
  name: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'legendary';
  stars: number;
  price_coins: number;
  price_diamonds: number;
  ability: string;
  ability_key: string;
  gradient: string;
  is_starter: boolean;
  personality: {
    ru: string;
    en: string;
    kk: string;
  };
  greeting: {
    ru: string;
    en: string;
    kk: string;
  };
}

export interface UserResources {
  energy: number;
  maxEnergy: number;
  coins: number;
  diamonds: number;
  xp: number;
}

export interface UserProfile {
  name: string;
  email?: string;
  avatar?: string;
  googleId?: string;
  isLoggedIn?: boolean;
  activeCharacterId: string;
  currentStreak: number;
  lastStudyDate: string;
  streakDays: string[]; // YYYY-MM-DD
  totalLessonsCompleted: number;
  totalWordsLearned: number;
}

export interface DailyQuest {
  id: string;
  key: string;
  title: {
    ru: string;
    en: string;
    kk: string;
  };
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  rewardCoins: number;
  rewardDiamonds: number;
  icon: string;
}

export interface DictionaryPhrase {
  id: string;
  language: Language;
  phrase: string;
  kidExplanation: string;
  literalMeaning?: string;
  sourceBook?: string;
  example?: string;
  dateAdded: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  phrasesFound?: Array<{
    phrase: string;
    meaning: string;
    source_book?: string;
  }>;
}

export interface VoiceSettings {
  deepseekApiKey: string;
  deepseekBaseUrl: string;
  deepseekModel: string;
  ttsEngine: 'elevenlabs';
  elevenlabsApiKey?: string;
  elevenlabsVoiceId?: string;
  voiceRate: number;
  voicePitch: number;
  voiceName?: string;
  soundEffects: boolean;
}

export interface Competitor {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  league: string;
  rank: number;
  isCurrentUser?: boolean;
  is_bot?: boolean;
}

export interface AuthUser {
  id: string;
  google_id?: string;
  email?: string;
  name: string;
  avatar: string;
  xp: number;
  coins: number;
  diamonds: number;
  energy: number;
  current_streak: number;
  league: string;
  active_character_id: string;
  unlockedCharacters?: string[];
}
