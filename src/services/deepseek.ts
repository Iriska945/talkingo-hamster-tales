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
      phrase: "Не разлей вода",
      meaning: "Очень крепкая и неразлучная дружба.",
      literal: "Даже вода не может пройти между близкими друзьями.",
      source: "Русские сказки и былины",
      example: "Мы с тобой теперь друзья — не разлей вода!"
    },
    {
      phrase: "Взять себя в руки",
      meaning: "Справиться со своим волнением, успокоиться и собраться.",
      literal: "Физически удержать свои руки.",
      source: "«Отцы и дети» — И. С. Тургенев",
      example: "Когда сложно говорить на новом языке, просто возьми себя в руки и улыбнись!"
    },
    {
      phrase: "Светлая голова",
      meaning: "Очень умный, сообразительный и способный человек.",
      literal: "Голова, излучающая свет.",
      source: "«Детство» — Л. Н. Толстой",
      example: "Ты отлично говоришь, у тебя поистине светлая голова!"
    },
    {
      phrase: "Семи пядей во лбу",
      meaning: "Выдающийся ум, чрезвычайно умный человек.",
      literal: "Лоб высотой в семь старинных мер длины (пядей).",
      source: "Русский эпос",
      example: "Не обязательно быть семи пядей во лбу, главное — тренироваться каждый день!"
    }
  ],
  en: [
    {
      phrase: "Break a leg",
      meaning: "Good luck! A theatrical way to wish someone great success.",
      literal: "To fracture a bone in your leg.",
      source: "Classic Theatre & Literature Lore",
      example: "You are doing great with your English practice, break a leg!"
    },
    {
      phrase: "Bite the bullet",
      meaning: "To face a difficult situation with courage and bravery.",
      literal: "To literally bite on a lead bullet during medicine treatment long ago.",
      source: "Historical Tales of Courage",
      example: "Don't be shy to speak, just bite the bullet and try!"
    },
    {
      phrase: "Hit the books",
      meaning: "To study enthusiastically and learn something new.",
      literal: "To physically hit books with your hands.",
      source: "Modern Student Colloquial Sayings",
      example: "It's always fun to hit the books together with your hamster friend!"
    }
  ],
  kk: [
    {
      phrase: "Ат салысу",
      meaning: "Бір іске бар ықыласпен көмектесу, қолдау көрсету.",
      literal: "Атпен қатарласа жүріп көмектесу.",
      source: "Қазақ салт-дәстүрлері",
      example: "Тіл үйренуге барлығымыз бірге ат салысайық!"
    },
    {
      phrase: "Көңілі түсу",
      meaning: "Біреуге немесе бір нәрсеге деген ықыласы, ниеті ауу.",
      literal: "Көңілдің төмен түсуі немесе бейімделуі.",
      source: "Абайдың қара сөздері",
      example: "Сенің талпынысыңа қарап, көңілім толқып тұр!"
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
      })
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
