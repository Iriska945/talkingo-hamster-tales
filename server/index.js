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

// ElevenLabs configuration (Female voices)
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
// Default female voice: Jessica (Playful, Bright, Warm, perfect companion tone)
const DEFAULT_FEMALE_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "cgSgspJ2msm6clMCkdW9";

// Curated high-quality ElevenLabs female voices
const ELEVENLABS_FEMALE_VOICES = [
  { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica", desc: "Игривый, тёплый, дружелюбный (Рекомендуется)" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", desc: "Мягкий, уверенный, естественный" },
  { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda", desc: "Литературный, тёплый, спокойный" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", desc: "Чёткий, образовательный, ясный" },
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", desc: "Спокойный, медитативный, классический" },
];

// Voice mappings for Microsoft Edge Neural TTS fallback
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
    tts: {
      primary: 'elevenlabs',
      fallback: 'edge-neural',
      elevenlabsConfigured: !!ELEVENLABS_API_KEY,
      defaultVoiceId: DEFAULT_FEMALE_VOICE_ID,
    }
  });
});

// 2. Available TTS voices endpoint
app.get('/api/tts/voices', (req, res) => {
  res.json({
    engine: 'elevenlabs',
    configured: !!ELEVENLABS_API_KEY,
    defaultVoiceId: DEFAULT_FEMALE_VOICE_ID,
    voices: ELEVENLABS_FEMALE_VOICES,
  });
});

// 3. High-Quality Neural TTS Endpoint (ElevenLabs with auto Edge Neural fallback)
app.post('/api/tts', async (req, res) => {
  try {
    const {
      text,
      language = 'ru',
      engine = 'elevenlabs',
      voiceId,
      voiceName,
      rate = 1.0,
      pitch = 0
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/[*_#`~>]/g, '')
      .trim();

    // 1. If engine is elevenlabs (default) and API key exists, synthesize with ElevenLabs
    if ((engine === 'elevenlabs' || !engine) && ELEVENLABS_API_KEY) {
      const selectedVoiceId = voiceId || DEFAULT_FEMALE_VOICE_ID;
      try {
        const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
          method: "POST",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY.trim(),
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.85,
              style: 0.2,
              use_speaker_boost: true
            }
          })
        });

        if (elevenRes.ok) {
          const buffer = await elevenRes.arrayBuffer();
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('X-TTS-Engine', 'elevenlabs');
          res.setHeader('X-TTS-Voice', selectedVoiceId);
          res.setHeader('Cache-Control', 'public, max-age=86400');
          return res.send(Buffer.from(buffer));
        } else {
          const errText = await elevenRes.text();
          console.warn(`ElevenLabs API returned ${elevenRes.status}, falling back to Edge Neural:`, errText);
        }
      } catch (elevenErr) {
        console.warn("ElevenLabs request failed, falling back to Edge Neural:", elevenErr);
      }
    }

    // 2. Microsoft Edge Neural TTS (Primary Fallback)
    const selectedVoice = voiceName || EDGE_VOICE_MAP[language] || EDGE_VOICE_MAP.ru;

    const tts = new MsEdgeTTS();
    await tts.setMetadata(selectedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    // Dynamic speech speed control (e.g. 0.8x for slower practice, 1.2x for faster)
    const ratePercent = Math.round((Number(rate) - 1.0) * 100);
    const rateStr = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
    const pitchStr = pitch ? `${Math.round(pitch * 20)}Hz` : "+0Hz";

    const { audioStream } = tts.toStream(cleanText, { rate: rateStr, pitch: pitchStr });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-TTS-Engine', 'edgeneural');
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

// 5. User Progress & State Sync Endpoints
app.get('/api/user/state', (req, res) => {
  const userId = req.query.userId || 'demo-user';
  let user = userDb.getById(userId);
  if (!user) {
    user = userDb.getById('demo-user');
  }
  const unlocked = userDb.getUnlockedCharacters(user?.id || 'demo-user');
  res.json({
    success: true,
    user: {
      ...user,
      unlockedCharacters: unlocked
    }
  });
});

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

app.post('/api/user/sync', (req, res) => {
  const { userId = 'demo-user', ...data } = req.body;
  const updated = userDb.syncUser(userId, data);
  res.json({ success: true, user: updated });
});

// Dictionary Endpoints
app.get('/api/user/phrases', (req, res) => {
  const userId = req.query.userId || 'demo-user';
  const phrases = userDb.getPhrases(userId);
  res.json({ success: true, phrases });
});

app.post('/api/user/phrases', (req, res) => {
  const { userId = 'demo-user', phrase } = req.body;
  if (!phrase || !phrase.phrase) {
    return res.status(400).json({ error: 'Phrase data is required' });
  }
  const id = userDb.addPhrase(userId, phrase);
  res.json({ success: true, id });
});

// 6. Voice Assistant Chat with Linkbus / DeepSeek & Practice Scenarios
app.post('/api/talk', async (req, res) => {
  try {
    const {
      messages,
      language = 'ru',
      character,
      model = DEFAULT_MODEL,
      userId = 'demo-user',
      scenario = 'free',
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const charName = character?.name || "Хэмми (Hammy)";
    const charEmoji = character?.emoji || "🐹";
    const charPersonality = character?.personality?.[language] || "Дружелюбный хомячок-учитель.";

    // Scenario prompt guidelines
    const SCENARIOS_PROMPT = {
      free: "Casual, friendly conversation about anything the user wants to talk about.",
      cafe: "Roleplay: You are a friendly barista / waiter at a cozy cafe. Help the user order coffee, pastries, or lunch, ask about their day.",
      airport: "Roleplay: You are a polite airport staff / customs officer guiding the user through check-in, baggage, and flights.",
      story: "Roleplay: You are telling an engaging interactive fairytale / story with the user, pausing to ask what happens next.",
      interview: "Roleplay: You are an interviewer for a cool dream club or creative project, asking friendly conversational questions."
    };

    const currentScenarioContext = SCENARIOS_PROMPT[scenario] || SCENARIOS_PROMPT.free;

    const systemPrompt = `You are ${charName} (${charEmoji}), a lovely companion in a Duolingo-style language learning app named Talkingo.
Current study language: ${String(language).toUpperCase()} (ru = Russian, en = English, kk = Kazakh).
Character personality: ${charPersonality}.
Active Practice Scenario: ${currentScenarioContext}.

Instructions:
1. Reply warmly, enthusiastically, and naturally in ${language === 'ru' ? 'Russian' : language === 'kk' ? 'Kazakh' : 'English'}.
2. Keep your response conversational and concise (1-2 sentences max), ideal for voice audio pronunciation.
3. Naturally weave in or explain an interesting idiom / literary expression (крылатое выражение / мақал / idiom) suitable for children and learners when fitting.
4. If the user made a grammar or pronunciation slip, gently suggest a natural alternative in the "tip" field without sounding pedantic.
5. Respond strictly in JSON format:
{
  "spoken": "Your character's cheerful spoken response to the user in 1-2 sentences",
  "tip": "Optional 1-sentence tip e.g. 💡 Можно сказать естественнее: ..., or null if no correction is needed",
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

    // Automatically persist any learned phrases to user's dictionary in SQLite
    if (parsed && Array.isArray(parsed.new_phrases)) {
      for (const p of parsed.new_phrases) {
        if (p.phrase && userId) {
          userDb.addPhrase(userId, {
            language: language,
            phrase: p.phrase,
            kidExplanation: p.meaning,
            literalMeaning: p.literal_meaning,
            sourceBook: p.source_book,
            example: p.example,
          });
        }
      }
    }

    if (parsed && (parsed.spoken || parsed.new_phrases)) {
      return res.json({
        spoken: String(parsed.spoken || contentStr).replace(/\*+/g, '').replace(/[_`#>]/g, '').trim(),
        tip: parsed.tip || null,
        new_phrases: Array.isArray(parsed.new_phrases) ? parsed.new_phrases : []
      });
    }

    res.json({
      spoken: String(contentStr).replace(/\*+/g, '').replace(/[_`#>]/g, '').trim(),
      tip: null,
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
