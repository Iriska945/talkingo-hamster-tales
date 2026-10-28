import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'talkingo.db');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    google_id TEXT UNIQUE,
    email TEXT,
    name TEXT NOT NULL,
    avatar TEXT,
    xp INTEGER DEFAULT 45,
    coins INTEGER DEFAULT 180,
    diamonds INTEGER DEFAULT 12,
    energy INTEGER DEFAULT 5,
    current_streak INTEGER DEFAULT 3,
    last_study_date TEXT,
    active_character_id TEXT DEFAULT '3afffcee-f386-49bd-9358-8661fd63b822',
    league TEXT DEFAULT 'bronze',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_characters (
    user_id TEXT NOT NULL,
    character_id TEXT NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, character_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS dictionary_phrases (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    language TEXT NOT NULL,
    phrase TEXT NOT NULL,
    kid_explanation TEXT,
    literal_meaning TEXT,
    source_book TEXT,
    example TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS leaderboard_competitors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    xp INTEGER NOT NULL,
    league TEXT NOT NULL,
    is_bot INTEGER DEFAULT 1
  );
`);

// Seed default competitors for Duolingo-style leaderboards if empty
const countCompetitors = db.prepare('SELECT COUNT(*) as count FROM leaderboard_competitors').get().count;
if (countCompetitors === 0) {
  const seedList = [
    { id: 'bot-1', name: 'Маша из Астаны', avatar: '🦊', xp: 520, league: 'bronze' },
    { id: 'bot-2', name: 'Alex_Polyglot', avatar: '🐼', xp: 480, league: 'bronze' },
    { id: 'bot-3', name: 'Тимур Сапаров', avatar: '🐯', xp: 410, league: 'bronze' },
    { id: 'bot-4', name: 'Elena_Almaty', avatar: '🐰', xp: 330, league: 'bronze' },
    { id: 'bot-5', name: 'Daulet_Talker', avatar: '🐳', xp: 260, league: 'bronze' },
    { id: 'bot-6', name: 'BookWorm_99', avatar: '🐉', xp: 190, league: 'bronze' },
    { id: 'bot-7', name: 'Sofi_Words', avatar: '🦄', xp: 140, league: 'bronze' },
    { id: 'bot-8', name: 'Denis_Duolingo', avatar: '🐹', xp: 95, league: 'bronze' },
    { id: 'bot-9', name: 'Aigerim_KZ', avatar: '🦊', xp: 60, league: 'bronze' },
  ];

  const insert = db.prepare('INSERT INTO leaderboard_competitors (id, name, avatar, xp, league, is_bot) VALUES (?, ?, ?, ?, ?, ?)');
  const insertMany = db.transaction((list) => {
    for (const b of list) {
      insert.run(b.id, b.name, b.avatar, b.xp, b.league, 1);
    }
  });
  insertMany(seedList);
}

// Ensure default demo user exists
const demoUser = db.prepare('SELECT * FROM users WHERE id = ?').get('demo-user');
if (!demoUser) {
  db.prepare(`
    INSERT INTO users (id, google_id, email, name, avatar, xp, coins, diamonds, energy, current_streak, last_study_date, active_character_id, league)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'demo-user',
    'demo_guest',
    'guest@talkingo.app',
    'Любознательный Ученик',
    '🐹',
    215,
    180,
    12,
    5,
    3,
    new Date().toISOString().slice(0, 10),
    '3afffcee-f386-49bd-9358-8661fd63b822',
    'bronze'
  );

  db.prepare('INSERT OR IGNORE INTO user_characters (user_id, character_id) VALUES (?, ?)').run('demo-user', '3afffcee-f386-49bd-9358-8661fd63b822');
}

// Ensure dictionary phrases are strictly from the 3 allowed classic books:
// 1. «Капитанская дочка» (А. С. Пушкин)
// 2. «The Adventures of Tom Sawyer» (Mark Twain)
// 3. «Менің атым Қожа» (Бердібек Соқпақбаев)
db.prepare(`
  DELETE FROM dictionary_phrases
  WHERE source_book NOT LIKE '%Капитанская дочка%'
    AND source_book NOT LIKE '%Tom Sawyer%'
    AND source_book NOT LIKE '%Менің атым Қожа%'
`).run();

const countPhrases = db.prepare('SELECT COUNT(*) as count FROM dictionary_phrases WHERE user_id = ?').get('demo-user').count;
if (countPhrases === 0) {
  const seedPhrases = [
    {
      id: 'phrase-1',
      user_id: 'demo-user',
      language: 'ru',
      phrase: 'Береги честь смолоду',
      kid_explanation: 'Главный жизненный завет: всегда поступать честно, искренне и благородно с самого детства.',
      literal_meaning: 'Береги свою честь и доброе имя смолоду, точно так же, как берегут новую одежду.',
      source_book: '«Капитанская дочка» — А. С. Пушкин',
      example: '«Береги честь смолоду, а платье снову», — напутствовал отец Петра Гринёва.'
    },
    {
      id: 'phrase-2',
      user_id: 'demo-user',
      language: 'ru',
      phrase: 'Будет дождик, будут и грибки',
      kid_explanation: 'Всё наладится! Любые временные трудности пройдут, и обязательно наступит радость и успех.',
      literal_meaning: 'После тёплого дождя в лесу всегда вырастают грибы — добрая примета надежды.',
      source_book: '«Капитанская дочка» — А. С. Пушкин',
      example: 'Не бойся делать ошибки при разговоре: будет дождик, будут и грибки!'
    },
    {
      id: 'phrase-3',
      user_id: 'demo-user',
      language: 'ru',
      phrase: 'Душа в душу',
      kid_explanation: 'Жить в полном согласии, преданности, искренней дружбе и глубоком понимании.',
      literal_meaning: 'Быть настолько близкими людьми, словно у вас одно дыхание и одно сердце.',
      source_book: '«Капитанская дочка» — А. С. Пушкин',
      example: 'Маша Миронова и Петруша жили душа в душу, преодолевая любые жизненные бури.'
    },
    {
      id: 'phrase-4',
      user_id: 'demo-user',
      language: 'en',
      phrase: 'Like painting a fence',
      kid_explanation: 'Turning any difficult task into a thrilling game so that everyone wants to take part!',
      literal_meaning: 'Clever Tom turned the boring whitewashing of Aunt Polly’s fence into the most coveted game in town.',
      source_book: '«The Adventures of Tom Sawyer» — Mark Twain',
      example: 'Practicing English with Talkingo is like painting a fence — pure joy and adventure!'
    },
    {
      id: 'phrase-5',
      user_id: 'demo-user',
      language: 'en',
      phrase: 'Cross your heart',
      kid_explanation: 'A solemn promise between true friends to always speak the truth.',
      literal_meaning: 'Crossing your hand over your heart as an unbreakable oath of loyalty.',
      source_book: '«The Adventures of Tom Sawyer» — Mark Twain',
      example: 'Cross your heart, Tom! Promise that you will practice new phrases with Hammy today!'
    },
    {
      id: 'phrase-6',
      user_id: 'demo-user',
      language: 'kk',
      phrase: 'Түбінде адам болатын бала',
      kid_explanation: 'Қиындықтан қорықпайтын, жүрегі ашық әрі келешекте үлкен азамат болатын дарынды бала.',
      literal_meaning: 'Бойында намыс пен жігері бар, есейгенде үлкен ел азаматы болатын жас өркен.',
      source_book: '«Менің атым Қожа» — Бердібек Соқпақбаев',
      example: 'Майқанова мұғалім Қожаның тентек болса да, түбінде адам болатынына кәміл сенді.'
    },
    {
      id: 'phrase-7',
      user_id: 'demo-user',
      language: 'kk',
      phrase: 'Қожа көнбейді',
      kid_explanation: 'Әділетсіздікке мойымайтын, шындық үшін тайсалмай күресетін қайсар мінез.',
      literal_meaning: 'Қожаның өзіне тән намысты, тайсалмас қайсар мінезі.',
      source_book: '«Менің атым Қожа» — Бердібек Соқпақбаев',
      example: '«Қожа көнбейді!» — деп өзіне серт беріп, сөздік пен сабаққа құлшына кірісті.'
    }
  ];

  const insertP = db.prepare(`
    INSERT OR REPLACE INTO dictionary_phrases (id, user_id, language, phrase, kid_explanation, literal_meaning, source_book, example)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const p of seedPhrases) {
    insertP.run(p.id, p.user_id, p.language, p.phrase, p.kid_explanation, p.literal_meaning, p.source_book, p.example);
  }
}

// Database helper functions
export const userDb = {
  getById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  getByGoogleId(googleId) {
    return db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
  },

  createFromGoogle({ googleId, email, name, avatar }) {
    const id = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const today = new Date().toISOString().slice(0, 10);
    db.prepare(`
      INSERT INTO users (id, google_id, email, name, avatar, xp, coins, diamonds, energy, current_streak, last_study_date, active_character_id, league)
      VALUES (?, ?, ?, ?, ?, 50, 200, 15, 5, 1, ?, '3afffcee-f386-49bd-9358-8661fd63b822', 'bronze')
    `).run(id, googleId, email, name, avatar, today);

    // Give starter character
    db.prepare('INSERT OR IGNORE INTO user_characters (user_id, character_id) VALUES (?, ?)').run(id, '3afffcee-f386-49bd-9358-8661fd63b822');

    return this.getById(id);
  },

  updateStats(id, { xpDelta = 0, coinsDelta = 0, diamondsDelta = 0, energyDelta = 0 }) {
    const user = this.getById(id);
    if (!user) return null;

    const newXp = Math.max(0, user.xp + xpDelta);
    const newCoins = Math.max(0, user.coins + coinsDelta);
    const newDiamonds = Math.max(0, user.diamonds + diamondsDelta);
    const newEnergy = Math.max(0, Math.min(5, user.energy + energyDelta));

    db.prepare(`
      UPDATE users
      SET xp = ?, coins = ?, diamonds = ?, energy = ?
      WHERE id = ?
    `).run(newXp, newCoins, newDiamonds, newEnergy, id);

    return this.getById(id);
  },

  updateStreak(id) {
    const user = this.getById(id);
    if (!user) return null;

    const today = new Date().toISOString().slice(0, 10);
    if (user.last_study_date === today) return user;

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = user.last_study_date === yesterday ? user.current_streak + 1 : 1;

    db.prepare(`
      UPDATE users
      SET current_streak = ?, last_study_date = ?
      WHERE id = ?
    `).run(newStreak, today, id);

    return this.getById(id);
  },

  setActiveCharacter(id, characterId) {
    db.prepare('UPDATE users SET active_character_id = ? WHERE id = ?').run(characterId, id);
    return this.getById(id);
  },

  unlockCharacter(id, characterId) {
    db.prepare('INSERT OR IGNORE INTO user_characters (user_id, character_id) VALUES (?, ?)').run(id, characterId);
  },

  getUnlockedCharacters(id) {
    return db.prepare('SELECT character_id FROM user_characters WHERE user_id = ?').all(id).map(r => r.character_id);
  },

  getLeaderboard(league = 'bronze', currentUserId = 'demo-user') {
    const bots = db.prepare('SELECT id, name, avatar, xp, league, 1 as is_bot FROM leaderboard_competitors WHERE league = ?').all(league);
    const realUsers = db.prepare('SELECT id, name, avatar, xp, league, 0 as is_bot FROM users WHERE league = ?').all(league);

    // Merge and sort by XP descending
    const all = [...realUsers, ...bots].sort((a, b) => b.xp - a.xp);

    // Map rank
    return all.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      isCurrentUser: item.id === currentUserId
    }));
  },

  addPhrase(userId, { id, language, phrase, kidExplanation, literalMeaning, sourceBook, example }) {
    const phraseId = id || 'phrase_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    db.prepare(`
      INSERT OR REPLACE INTO dictionary_phrases (id, user_id, language, phrase, kid_explanation, literal_meaning, source_book, example)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(phraseId, userId, language || 'ru', phrase, kidExplanation || '', literalMeaning || '', sourceBook || '', example || '');
    return phraseId;
  },

  getPhrases(userId) {
    return db.prepare('SELECT * FROM dictionary_phrases WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  },

  syncUser(id, data = {}) {
    let user = this.getById(id);
    if (!user) return null;

    const { xp, coins, diamonds, currentStreak, activeCharacterId, unlockedCharacters = [] } = data;

    db.prepare(`
      UPDATE users
      SET xp = COALESCE(?, xp),
          coins = COALESCE(?, coins),
          diamonds = COALESCE(?, diamonds),
          current_streak = COALESCE(?, current_streak),
          active_character_id = COALESCE(?, active_character_id)
      WHERE id = ?
    `).run(xp ?? null, coins ?? null, diamonds ?? null, currentStreak ?? null, activeCharacterId ?? null, id);

    if (Array.isArray(unlockedCharacters)) {
      const stmt = db.prepare('INSERT OR IGNORE INTO user_characters (user_id, character_id) VALUES (?, ?)');
      for (const charId of unlockedCharacters) {
        stmt.run(id, charId);
      }
    }

    return {
      ...this.getById(id),
      unlockedCharacters: this.getUnlockedCharacters(id)
    };
  }
};

export default db;
