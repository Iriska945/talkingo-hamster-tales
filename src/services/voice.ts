import { Language } from '../types';

const LANG_CODE_MAP: Record<Language, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  kk: 'kk-KZ',
};

// Web Audio API Synthesizer for Duolingo-style sound effects
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundEffects = {
  click: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  },

  listenStart: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.warn(e);
    }
  },

  success: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      // Duolingo chime chords
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.35);
      });
    } catch (e) {
      console.warn(e);
    }
  },

  fanfare: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.07);
        osc.stop(ctx.currentTime + i * 0.07 + 0.45);
      });
    } catch (e) {
      console.warn(e);
    }
  }
};

// Speak with high-quality free Microsoft Edge Neural TTS via backend
export async function speakWithEdgeNeural(
  text: string,
  lang: Language
): Promise<void> {
  stopSpeaking();
  const cleanText = text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/[*_#`~>]/g, '')
    .trim();

  if (!cleanText) return;

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: cleanText,
        language: lang
      })
    });

    if (!res.ok) {
      throw new Error(`Edge TTS HTTP ${res.status}`);
    }

    const blob = await res.blob();
    const audio = new Audio(URL.createObjectURL(blob));
    currentAudio = audio;

    return new Promise((resolve) => {
      audio.onended = () => {
        currentAudio = null;
        resolve();
      };
      audio.onerror = () => {
        currentAudio = null;
        resolve();
      };
      audio.play().catch(() => resolve());
    });
  } catch (err) {
    console.warn("Edge Neural TTS failed, falling back to browser speech:", err);
    return speakWithBrowser(cleanText, lang);
  }
}
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );
}

// Create Speech Recognition instance
export function createSpeechRecognizer(lang: Language) {
  if (typeof window === 'undefined') return null;
  const SpeechRecognitionClass =
    (window as unknown as { SpeechRecognition?: new () => any }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;

  if (!SpeechRecognitionClass) return null;

  const recognition = new SpeechRecognitionClass();
  recognition.lang = LANG_CODE_MAP[lang] || 'ru-RU';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;
  return recognition;
}

// Stop any currently playing audio / synthesis
let currentAudio: HTMLAudioElement | null = null;

export function stopSpeaking() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio = null;
    } catch (e) {
      console.warn(e);
    }
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// Speak text using Web Speech Synthesis API
export function speakWithBrowser(
  text: string,
  lang: Language,
  options: { rate?: number; pitch?: number; voiceName?: string } = {}
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve();
      return;
    }

    stopSpeaking();

    // Clean text from Markdown or emojis for cleaner pronunciation
    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/[*_#`~>]/g, '')
      .trim();

    if (!cleanText) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = LANG_CODE_MAP[lang] || 'ru-RU';
    utterance.rate = options.rate ?? 0.95;
    utterance.pitch = options.pitch ?? 1.1;

    // Pick suitable voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const prefix = LANG_CODE_MAP[lang].split('-')[0];
      const matchingVoice =
        voices.find(v => options.voiceName && v.name === options.voiceName) ||
        voices.find(v => v.lang.startsWith(prefix) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Yuri') || v.name.includes('Milena') || v.name.includes('Siri'))) ||
        voices.find(v => v.lang.startsWith(prefix));

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      console.warn("SpeechSynthesis error:", e);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

// Speak with external OpenAI TTS API
export async function speakWithOpenAI(
  text: string,
  apiKey: string,
  voice: string = 'alloy'
): Promise<void> {
  stopSpeaking();
  const cleanText = text.replace(/[*_#`~>]/g, '').trim();

  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "tts-1",
      input: cleanText,
      voice: voice
    })
  });

  if (!res.ok) {
    throw new Error(`OpenAI TTS Error: ${res.status}`);
  }

  const blob = await res.blob();
  const audio = new Audio(URL.createObjectURL(blob));
  currentAudio = audio;

  return new Promise((resolve) => {
    audio.onended = () => {
      currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      currentAudio = null;
      resolve();
    };
    audio.play().catch(() => resolve());
  });
}

// Speak with external ElevenLabs API
export async function speakWithElevenLabs(
  text: string,
  apiKey: string,
  voiceId: string = "21m00Tcm4TlvDq8ikWAM"
): Promise<void> {
  stopSpeaking();
  const cleanText = text.replace(/[*_#`~>]/g, '').trim();

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: cleanText,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8
      }
    })
  });

  if (!res.ok) {
    throw new Error(`ElevenLabs TTS Error: ${res.status}`);
  }

  const blob = await res.blob();
  const audio = new Audio(URL.createObjectURL(blob));
  currentAudio = audio;

  return new Promise((resolve) => {
    audio.onended = () => {
      currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      currentAudio = null;
      resolve();
    };
    audio.play().catch(() => resolve());
  });
}
