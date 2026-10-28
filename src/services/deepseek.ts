import { Character, ChatMessage, Language, VoiceSettings } from '../types';

export interface TalkResponse {
  spoken: string;
  tip?: string | null;
  new_phrases: Array<{
    phrase: string;
    meaning: string;
    literal_meaning?: string;
    source_book?: string;
    example?: string;
  }>;
}

const LOCAL_FALLBACK_PHRASES: Record<Language, Array<{ phrase: string; meaning: string; literal: string; source: string; example: string }>> = {
  ru: [
    {
      phrase: "Береги честь смолоду",
      meaning: "Поступать честно, достойно и благородно с самого детства.",
      literal: "Сохранять незапятнанным свое честное имя с юных лет.",
      source: "«Капитанская дочка» — А. С. Пушкин",
      example: "Как завещал отец Петру Гриневу: береги честь смолоду!"
    },
    {
      phrase: "Будет дождик, будут и грибки",
      meaning: "После трудностей и испытаний обязательно наступит радость и успех.",
      literal: "После благодатного дождя в лесу всегда вырастают грибы.",
      source: "«Капитанская дочка» — А. С. Пушкин",
      example: "Не огорчайся ошибкам в учебе: будет дождик, будут и грибки!"
    },
    {
      phrase: "Душа в душу",
      meaning: "Жить в полном согласии, любви, дружбе и взаимопонимании.",
      literal: "Когда два сердца бьются в унисон, словно одна душа.",
      source: "«Капитанская дочка» — А. С. Пушкин",
      example: "Мы с тобой общаемся душа в душу!"
    },
    {
      phrase: "Час от часу не легче",
      meaning: "Неожиданный новый поворот событий, требующий смелости.",
      literal: "С каждым прошедшим часом задача становится серьезнее.",
      source: "«Капитанская дочка» — А. С. Пушкин",
      example: "Час от часу не легче, но мы обязательно справимся с любым заданием!"
    },
    {
      phrase: "Казнить так казнить, жаловать так жаловать",
      meaning: "Поступать решительно, широко и великодушно.",
      literal: "Слова Пугачева о решительности и широте души.",
      source: "«Капитанская дочка» — А. С. Пушкин",
      example: "Учиться так учиться, говорить так говорить!"
    }
  ],
  en: [
    {
      phrase: "Like painting a fence",
      meaning: "Turning hard work or practice into an exciting, enjoyable game.",
      literal: "Tom Sawyer convincing his friends that whitewashing a fence is a rare privilege.",
      source: "«The Adventures of Tom Sawyer» — Mark Twain",
      example: "Practicing new words with me is just like painting a fence — pure fun!"
    },
    {
      phrase: "Cross your heart",
      meaning: "To solemnly promise and swear you are telling the absolute truth.",
      literal: "Drawing an imaginary cross over your chest as an oath.",
      source: "«The Adventures of Tom Sawyer» — Mark Twain",
      example: "Cross your heart that you will practice speaking every single day!"
    },
    {
      phrase: "Play hooky",
      meaning: "To skip routine duties to go on an adventurous, exciting journey.",
      literal: "To stay away from school without permission.",
      source: "«The Adventures of Tom Sawyer» — Mark Twain",
      example: "Tom loved to play hooky and explore the mighty Mississippi river!"
    },
    {
      phrase: "A sight for sore eyes",
      meaning: "Someone or something you are truly delighted and overjoyed to see.",
      literal: "A welcome vision that eases pain and brings comfort.",
      source: "«The Adventures of Tom Sawyer» — Mark Twain",
      example: "Your voice is a sight for sore eyes, my brave friend!"
    }
  ],
  kk: [
    {
      phrase: "Түбінде адам болатын бала",
      meaning: "Болашағынан зор үміт күттіретін, парасатты да дарынды бала.",
      literal: "Келешекте нағыз азамат болатын жас өрен.",
      source: "«Менің атым Қожа» — Бердібек Соқпақбаев",
      example: "Сенің талпынысың зор, түбінде адам болатын баласың!"
    },
    {
      phrase: "Қожа көнбейді",
      meaning: "Ешқашан мойымау, әділдік үшін соңына дейін күресу.",
      literal: "Қожаның ерік-жігері мен қайсар мінезі.",
      source: "«Менің атым Қожа» — Бердібек Соқпақбаев",
      example: "Қиындықтарға еш мойыма, Қожа көнбейді деген осы!"
    },
    {
      phrase: "Жақсының аты өлмейді",
      meaning: "Игі іс пен білімнің сәулесі ешқашан өшпейді.",
      literal: "Жақсы адамның аты да, оның қалдырған ісі де ғасырлар бойы сақталады.",
      source: "«Менің атым Қожа» — Бердібек Соқпақбаев",
      example: "Білім жинаған жанның еңбегі далаға кетпейді, жақсының аты өлмейді!"
    },
    {
      phrase: "Сыр бермеу",
      meaning: "Өзіңді сабырлы ұстау, сыр білдірмей, батыл болу.",
      literal: "Іштегі сезім мен толқуды сыртқа көрсетпеу.",
      source: "«Менің атым Қожа» — Бердібек Соқпақбаев",
      example: "Жаңа тілде сөйлегенде еш қорықпа, сыр бермей батыл сөйле!"
    }
  ]
};

export async function generateTalkResponse(params: {
  messages: ChatMessage[];
  language: Language;
  character: Character;
  voiceSettings: VoiceSettings;
  scenario?: string;
}): Promise<TalkResponse> {
  const { messages, language, character, voiceSettings, scenario = 'free' } = params;
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || "Привет!";

  // 1. Try our own secure backend server endpoint /api/talk
  try {
    const serverRes = await fetch("/api/talk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        language,
        character,
        scenario,
        model: voiceSettings.deepseekModel || "deepseek-v4-flash"
      }),
      signal: AbortSignal.timeout(6000)
    });

    if (serverRes.ok) {
      const data = await serverRes.json();
      if (data && (data.spoken || data.new_phrases)) {
        return {
          spoken: cleanSpokenText(data.spoken),
          tip: data.tip || null,
          new_phrases: Array.isArray(data.new_phrases) ? data.new_phrases : []
        };
      }
    }
  } catch (err) {
    console.warn("Backend /api/talk call failed or not running, falling back to direct client call:", err);
  }

  // 2. Try direct Linkbus API if key is present on client
  if (voiceSettings.deepseekApiKey && voiceSettings.deepseekApiKey.trim().length > 10) {
    try {
      let baseUrl = (voiceSettings.deepseekBaseUrl || "https://www.linkbus.net/v1").replace(/\/+$/, '');
      const endpoint = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;

      const systemPrompt = `You are ${character.name} (${character.emoji}), a lovely companion in a Duolingo-style language learning app named Talkingo.
Current study language: ${language.toUpperCase()} (ru = Russian, en = English, kk = Kazakh).
Character personality: ${character.personality[language]}.

Instructions:
1. Reply warmly, enthusiastically, and naturally in ${language === 'ru' ? 'Russian' : language === 'kk' ? 'Kazakh' : 'English'}.
2. Keep your response conversational and concise (1-2 sentences max), perfect for text-to-speech audio pronunciation.
3. STRICT MANDATORY BOOK RULE: All literary expressions, idioms and catchphrases MUST come EXCLUSIVELY from one of these three classic books:
   - For Russian: «Капитанская дочка» — А. С. Пушкин (e.g. «Береги честь смолоду», «Будет дождик, будут и грибки», «Душа в душу», «Час от часу не легче»)
   - For English: «The Adventures of Tom Sawyer» — Mark Twain (e.g. «Like painting a fence», «Cross your heart», «Play hooky», «A sight for sore eyes»)
   - For Kazakh: «Менің атым Қожа» — Бердібек Соқпақбаев (e.g. «Түбінде адам болатын бала», «Қожа көнбейді», «Жақсының аты өлмейді», «Сыр бермеу»)
   NEVER cite or use any other books or sources!
4. Respond in JSON format:
{
  "spoken": "Your character's cheerful spoken response to the user in 1-2 sentences",
  "new_phrases": [
    {
      "phrase": "The idiom or phrase introduced",
      "meaning": "Simple explanation for learners/kids",
      "literal_meaning": "Literal word-by-word origin/meaning",
      "source_book": "Must be strictly: «Капитанская дочка» — А. С. Пушкин OR «The Adventures of Tom Sawyer» — Mark Twain OR «Менің атым Қожа» — Бердібек Соқпақбаев",
      "example": "A clear example sentence"
    }
  ]
}
If no idiom fits this specific turn, return "new_phrases": [].`;

      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
      ];

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${voiceSettings.deepseekApiKey.trim()}`,
          "User-Agent": "Mozilla/5.0"
        },
        body: JSON.stringify({
          model: voiceSettings.deepseekModel || "deepseek-v4-flash",
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (res.ok) {
        const data = await res.json();
        const msg = data.choices?.[0]?.message;
        const contentStr = msg?.content?.trim() || msg?.reasoning_content?.trim() || "";
        
        const parsed = parseJsonResponse(contentStr);
        if (parsed && (parsed.spoken || parsed.new_phrases)) {
          return {
            spoken: cleanSpokenText(parsed.spoken || contentStr),
            new_phrases: Array.isArray(parsed.new_phrases) ? parsed.new_phrases : []
          };
        } else if (contentStr) {
          return {
            spoken: cleanSpokenText(contentStr),
            new_phrases: []
          };
        }
      } else {
        console.warn(`AI API responded with status ${res.status}`);
      }
    } catch (err) {
      console.warn("Direct API call failed, falling back:", err);
    }
  }

  // 2. Try the Talkingo Supabase talk function
  try {
    const supabaseTalkRes = await fetch("https://tvicfbkeuiuwonhzpaxj.supabase.co/functions/v1/talk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2aWNmYmtldWl1d29uaHpwYXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NDYyNjcsImV4cCI6MjA5NjEyMjI2N30.x3L9b1wx2XiUXVmKKDhrmt-PoqK0j3Og6HHSI_ove9I"
      },
      body: JSON.stringify({
        messages: messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
        langCode: language.toUpperCase(),
        character: character.name.split(' ')[0]
      })
    });

    if (supabaseTalkRes.ok) {
      const data = await supabaseTalkRes.json();
      if (data && data.spoken) {
        return {
          spoken: cleanSpokenText(data.spoken),
          new_phrases: Array.isArray(data.new_phrases) ? data.new_phrases.map((p: any) => ({
            phrase: p.phrase || "",
            meaning: p.meaning || p.kid_explanation || "",
            literal_meaning: p.literal_meaning || "",
            source_book: p.source_book || "",
            example: p.example || ""
          })) : []
        };
      }
    }
  } catch (err) {
    console.warn("Talkingo cloud proxy failed, using dynamic local generator:", err);
  }

  // 3. Dynamic Local Intelligent Response
  return generateLocalSmartResponse(lastUserMessage, language, character);
}

function parseJsonResponse(str: string): any {
  try {
    // Strip possible markdown fences
    const clean = str.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
    return JSON.parse(clean);
  } catch {
    // Try to find first { and last }
    const firstBrace = str.indexOf('{');
    const lastBrace = str.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(str.substring(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function cleanSpokenText(text: string): string {
  return text
    .replace(/\*+/g, '')
    .replace(/[_`#>]/g, '')
    .trim();
}

function generateLocalSmartResponse(userText: string, lang: Language, character: Character): TalkResponse {
  const list = LOCAL_FALLBACK_PHRASES[lang] || LOCAL_FALLBACK_PHRASES.ru;
  const randomIdiom = list[Math.floor(Math.random() * list.length)];

  if (lang === 'ru') {
    return {
      spoken: `Ты отлично говоришь! Про такое говорят: «${randomIdiom.phrase}». Это значит — ${randomIdiom.meaning.toLowerCase()} Что думаешь об этом?`,
      new_phrases: [{
        phrase: randomIdiom.phrase,
        meaning: randomIdiom.meaning,
        literal_meaning: randomIdiom.literal,
        source_book: randomIdiom.source,
        example: randomIdiom.example
      }]
    };
  } else if (lang === 'kk') {
    return {
      spoken: `Сенің сөздерің өте жақсы естіледі! Бізде: «${randomIdiom.phrase}» деген сөз бар. Мағынасы — ${randomIdiom.meaning} Тағы да сөйлесейік пе?`,
      new_phrases: [{
        phrase: randomIdiom.phrase,
        meaning: randomIdiom.meaning,
        literal_meaning: randomIdiom.literal,
        source_book: randomIdiom.source,
        example: randomIdiom.example
      }]
    };
  } else {
    return {
      spoken: `You are doing wonderfully! There is a great saying: "${randomIdiom.phrase}". It means ${randomIdiom.meaning.toLowerCase()} How does that sound to you?`,
      new_phrases: [{
        phrase: randomIdiom.phrase,
        meaning: randomIdiom.meaning,
        literal_meaning: randomIdiom.literal,
        source_book: randomIdiom.source,
        example: randomIdiom.example
      }]
    };
  }
}

export async function testDeepSeekConnection(
  apiKey: string,
  baseUrl: string = "https://www.linkbus.net/v1",
  model: string = "deepseek-v4-flash"
): Promise<{ success: boolean; message: string; modelUsed?: string }> {
  try {
    const cleanUrl = baseUrl.replace(/\/+$/, '');
    const url = cleanUrl.endsWith('/chat/completions') ? cleanUrl : `${cleanUrl}/chat/completions`;
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey.trim()}`,
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
      },
      body: JSON.stringify({
        model: model || "deepseek-v4-flash",
        messages: [{ role: "user", content: "Привет! Ответь одним словом: работает?" }],
        max_tokens: 30
      })
    });

    if (res.ok) {
      const data = await res.json();
      const answer = data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.reasoning_content || "Ответ получен";
      return {
        success: true,
        message: `Успешно! Модель ${model} ответила: «${answer.trim().slice(0, 50)}»`,
        modelUsed: model
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      return { success: false, message: `Ошибка ${res.status}: ${errData?.error?.message || res.statusText}` };
    }
  } catch (e: any) {
    return { success: false, message: `Ошибка сети: ${e.message || 'Не удалось подключиться к серверу'}` };
  }
}
