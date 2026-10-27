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
  }
};

export default db;
