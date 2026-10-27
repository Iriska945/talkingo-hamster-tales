import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { userDb } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Linkbus configuration strictly from server environment
const LINKBUS_API_KEY = process.env.LINKBUS_API_KEY || process.env.DEEPSEEK_API_KEY || "";
const LINKBUS_BASE_URL = (process.env.LINKBUS_BASE_URL || "https://www.linkbus.net/v1").replace(/\/+$/, '');
const DEFAULT_MODEL = process.env.LINKBUS_MODEL || "deepseek-v4-flash";

// Voice mappings for Microsoft Edge Neural TTS
const EDGE_VOICE_MAP = {
  ru: "ru-RU-SvetlanaNeural",
  en: "en-US-AnaNeural",       // Cute energetic mascot tone
  kk: "kk-KZ-AigulNeural",     // Authentic Kazakh
};

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    provider: 'linkbus',
    defaultModel: DEFAULT_MODEL,
    tts: 'edge-neural'
  });
});

// 2. High-Quality Free Edge Neural TTS Endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, language = 'ru', voiceName } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/[*_#`~>]/g, '')
      .trim();

    const selectedVoice = voiceName || EDGE_VOICE_MAP[language] || EDGE_VOICE_MAP.ru;

    const tts = new MsEdgeTTS();
    await tts.setMetadata(selectedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const { audioStream } = tts.toStream(cleanText);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    audioStream.pipe(res);

    audioStream.on('error', (err) => {
      console.error('Edge TTS stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'TTS audio streaming error' });
      }
    });

  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'TTS conversion failed', message: error.message });
  }
});

// 3. Google OAuth & Auth endpoints
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential, profile } = req.body;
    let googleId = profile?.googleId || profile?.sub;
    let email = profile?.email || '';
    let name = profile?.name || 'Ученик';
    let avatar = profile?.picture || '🐹';

    // If Google ID token was passed, verify or decode payload
    if (credential) {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          googleId = payload.sub;
          email = payload.email || email;
          name = payload.name || name;
          avatar = payload.picture || avatar;
        }
      } catch (err) {
        console.warn('Could not decode Google JWT directly, using payload info');
      }
    }

    if (!googleId) {
      return res.status(400).json({ error: 'Invalid Google login payload' });
    }

    let user = userDb.getByGoogleId(googleId);
    if (!user) {
      user = userDb.createFromGoogle({ googleId, email, name, avatar });
    } else {
      userDb.updateStreak(user.id);
    }

    const unlocked = userDb.getUnlockedCharacters(user.id);

    res.json({
      success: true,
      user: {
        ...user,
        unlockedCharacters: unlocked
      }
    });
  } catch (e) {
    console.error('Google auth error:', e);
    res.status(500).json({ error: 'Authentication failed', message: e.message });
  }
});

// Demo/Guest login for immediate 1-click test
app.post('/api/auth/guest', (req, res) => {
  let user = userDb.getById('demo-user');
  if (!user) {
    user = userDb.createFromGoogle({
      googleId: 'demo_' + Date.now(),
      email: 'guest@talkingo.app',
      name: 'Любознательный Ученик',
      avatar: '🐹'
    });
  }
  const unlocked = userDb.getUnlockedCharacters(user.id);
  res.json({
    success: true,
    user: {
      ...user,
      unlockedCharacters: unlocked
    }
  });
});

// 4. Leaderboard (Таблица рекордсменов в стиле Duolingo)
app.get('/api/leaderboard', (req, res) => {
  const league = req.query.league || 'bronze';
  const userId = req.query.userId || 'demo-user';
  const list = userDb.getLeaderboard(league, userId);
  res.json({
    league,
    competitors: list,
    nextLeague: league === 'bronze' ? 'silver' : league === 'silver' ? 'gold' : league === 'gold' ? 'sapphire' : 'ruby',
    promotionCutoff: 3,
    demotionCutoff: 7
  });
});

// 5. Update user progress from frontend
app.post('/api/user/progress', (req, res) => {
  const { userId = 'demo-user', xpGained = 0, coinsGained = 0, diamondsGained = 0 } = req.body;
  const updatedUser = userDb.updateStats(userId, {
    xpDelta: xpGained,
    coinsDelta: coinsGained,
    diamondsDelta: diamondsGained,
  });
  if (xpGained > 0) {
    userDb.updateStreak(userId);
  }
  res.json({ success: true, user: updatedUser });
});

// 6. Voice Assistant Chat with Linkbus / DeepSeek
app.post('/api/talk', async (req, res) => {
  try {
    const { messages, language = 'ru', character, model = DEFAULT_MODEL, userId = 'demo-user' } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const charName = character?.name || "Хэмми (Hammy)";
    const charEmoji = character?.emoji || "🐹";
    const charPersonality = character?.personality?.[language] || "Дружелюбный хомячок-учитель.";

    const systemPrompt = `You are ${charName} (${charEmoji}), a lovely companion in a Duolingo-style language learning app named Talkingo.
Current study language: ${String(language).toUpperCase()} (ru = Russian, en = English, kk = Kazakh).
Character personality: ${charPersonality}.

Instructions:
1. Reply warmly, enthusiastically, and naturally in ${language === 'ru' ? 'Russian' : language === 'kk' ? 'Kazakh' : 'English'}.
2. Keep your response conversational and concise (1-2 sentences max), ideal for voice audio pronunciation.
3. Naturally weave in or explain an interesting idiom / literary expression (крылатое выражение / мақал / idiom) suitable for children and learners.
4. Respond in JSON format:
{
  "spoken": "Your character's cheerful spoken response to the user in 1-2 sentences",
  "new_phrases": [
    {
      "phrase": "The idiom or phrase introduced",
      "meaning": "Simple explanation for learners/kids",
      "literal_meaning": "Literal word-by-word origin/meaning",
      "source_book": "Book, author, folklore or literary source",
      "example": "A clear example sentence"
    }
  ]
}
If no new idiom fits this specific turn, return "new_phrases": [].`;

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
    ];

    const endpoint = LINKBUS_BASE_URL.endsWith('/chat/completions')
      ? LINKBUS_BASE_URL
      : `${LINKBUS_BASE_URL}/chat/completions`;

    const aiRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LINKBUS_API_KEY.trim()}`,
        "User-Agent": "Mozilla/5.0 (compatible; TalkingoServer/1.0)"
      },
      body: JSON.stringify({
        model: model,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error(`Linkbus API returned ${aiRes.status}:`, errText);
      return res.status(aiRes.status).json({
        error: `AI provider error: ${aiRes.status}`,
        details: errText
      });
    }

    const data = await aiRes.json();
    const msg = data.choices?.[0]?.message;
    const contentStr = msg?.content?.trim() || msg?.reasoning_content?.trim() || "";

    let parsed = null;
    try {
      const clean = contentStr.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      const firstBrace = contentStr.indexOf('{');
      const lastBrace = contentStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
          parsed = JSON.parse(contentStr.substring(firstBrace, lastBrace + 1));
        } catch {
          parsed = null;
        }
      }
    }

    // Give 5 XP per spoken turn to user in database
    if (userId) {
      userDb.updateStats(userId, { xpDelta: 5 });
    }

    if (parsed && (parsed.spoken || parsed.new_phrases)) {
      return res.json({
        spoken: String(parsed.spoken || contentStr).replace(/\*+/g, '').replace(/[_`#>]/g, '').trim(),
        new_phrases: Array.isArray(parsed.new_phrases) ? parsed.new_phrases : []
      });
    }

    res.json({
      spoken: String(contentStr).replace(/\*+/g, '').replace(/[_`#>]/g, '').trim(),
      new_phrases: []
    });

  } catch (error) {
    console.error('Error in /api/talk:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// 7. Serve React frontend in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// For all non-API GET routes, return index.html (SPA routing)
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Talkingo Full-Stack Server running on http://0.0.0.0:${PORT}`);
  console.log(`   Connected to AI Gateway: ${LINKBUS_BASE_URL} (Model: ${DEFAULT_MODEL})`);
  console.log(`   Audio Engine: Microsoft Edge Neural TTS Active`);
});
