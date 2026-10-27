import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { testDeepSeekConnection } from '../services/deepseek';
import { speakWithBrowser, soundEffects } from '../services/voice';
import {
  Settings,
  Key,
  Volume2,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sliders,
  ShieldAlert,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { t, lang, voiceSettings, updateVoiceSettings, resetProgress } = useApp();

  const [apiKey, setApiKey] = useState(voiceSettings.deepseekApiKey || '');
  const [baseUrl, setBaseUrl] = useState(voiceSettings.deepseekBaseUrl || 'https://www.linkbus.net/v1');
  const [model, setModel] = useState(voiceSettings.deepseekModel || 'deepseek-v4-flash');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const handleSaveApi = () => {
    updateVoiceSettings({
      deepseekApiKey: apiKey.trim(),
      deepseekBaseUrl: baseUrl.trim(),
      deepseekModel: model.trim(),
    });
    soundEffects.success();
  };

  const handleTestApi = async () => {
    soundEffects.click();
    setTesting(true);
    setTestResult(null);
    const res = await testDeepSeekConnection(apiKey, baseUrl, model);
    setTestResult(res);
    setTesting(false);
    if (res.success) {
      soundEffects.fanfare();
    }
  };

  const handleSelectModel = (newModel: string) => {
    setModel(newModel);
    soundEffects.click();
  };

  const handleTestVoice = () => {
    soundEffects.click();
    const testPhrase =
      lang === 'ru'
        ? 'Привет! Я твой голосовой помощник Talkingo. Я готов тренировать речь вместе с тобой!'
        : lang === 'kk'
        ? 'Сәлем! Мен сенің Talkingo дауыстық көмекшіңмін. Сөйлесуге дайынмын!'
        : 'Hello! I am your Talkingo voice assistant. I am ready to practice speaking with you!';
    speakWithBrowser(testPhrase, lang, {
      rate: voiceSettings.voiceRate,
      pitch: voiceSettings.voicePitch,
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-28 pt-4 px-4 max-w-lg mx-auto space-y-4">
      
      {/* Settings Header */}
      <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800">
            {t('voiceSettingsTitle')}
          </h1>
          <p className="text-xs font-bold text-slate-400">
            Управление ИИ, моделями и параметрами диалога
          </p>
        </div>
      </div>

      {/* 1. DeepSeek / Linkbus API Key Configuration */}
      <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-duo-blue" />
            <h2 className="text-base font-black text-slate-800">
              API Шлюз Linkbus (DeepSeek)
            </h2>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Активен
          </span>
        </div>
        
        <p className="text-xs font-bold text-slate-500 leading-relaxed">
          Ключ с платформы <strong>linkbus.net</strong>. Запросы отправляются к моделям семейства DeepSeek по OpenAI-совместимому протоколу.
        </p>

        {/* Input Key */}
        <div>
          <label className="text-[11px] font-black uppercase text-slate-400 block mb-1">
            API Key (Linkbus)
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-duo-blue/40"
          />
        </div>

        {/* Model Presets from Linkbus */}
        <div>
          <label className="text-[11px] font-black uppercase text-slate-400 block mb-1.5">
            Выбор модели (Витрина Linkbus)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'deepseek-v4-flash', label: 'v4-flash', tag: 'Рекомендуется', price: '$11/$22' },
              { id: 'deepseek-v4-pro', label: 'v4-pro', tag: 'Макс. логика', price: '$33/$66' },
              { id: 'deepseek-flash', label: 'flash', tag: 'Базовая', price: '$11/$22' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelectModel(m.id)}
                className={`p-2.5 rounded-2xl border-2 text-left transition-all ${
                  model === m.id
                    ? 'border-duo-green bg-emerald-50/60 ring-2 ring-duo-green/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-black text-xs text-slate-800">{m.label}</span>
                  <span className="text-[9px] font-bold text-slate-400">{m.price}</span>
                </div>
                <span className="text-[10px] font-black text-duo-green block leading-tight">
                  {m.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Base URL (Optional / Proxy) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-black uppercase text-slate-400">
              Base URL эндпоинта
            </label>
            <div className="flex gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setBaseUrl('https://www.linkbus.net/v1');
                  soundEffects.click();
                }}
                className="text-duo-blue font-bold hover:underline"
              >
                Linkbus
              </button>
              <button
                type="button"
                onClick={() => {
                  setBaseUrl('https://api.deepseek.com/v1');
                  soundEffects.click();
                }}
                className="text-slate-400 font-bold hover:underline"
              >
                Официальный
              </button>
            </div>
          </div>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://www.linkbus.net/v1"
            className="w-full px-3.5 py-2 rounded-2xl bg-slate-100 border border-slate-200 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-duo-blue/40"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSaveApi}
            className="flex-1 py-2.5 rounded-xl btn-duo-green font-black text-xs shadow-md active:scale-95 transition-transform"
          >
            Сохранить настройки
          </button>
          
          <button
            onClick={handleTestApi}
            disabled={testing || !apiKey}
            className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 font-black text-xs text-slate-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {testing ? 'Проверка...' : t('testKey')}
          </button>
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div
            className={`p-3 rounded-2xl text-xs font-black flex items-start gap-2 animate-in fade-in duration-200 ${
              testResult.success
                ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border border-rose-300 text-rose-800'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span className="leading-tight">{testResult.message}</span>
          </div>
        )}
      </div>

      {/* 2. Voice & Speech Synthesis Settings */}
      <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-duo-green" />
            <h2 className="text-base font-black text-slate-800">
              Озвучивание речи (TTS)
            </h2>
          </div>

          <button
            onClick={handleTestVoice}
            className="py-1 px-3 rounded-xl bg-emerald-50 text-duo-green-dark border border-emerald-200 font-black text-xs active:scale-95 transition-transform flex items-center gap-1"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Тест голоса
          </button>
        </div>

        {/* Engine Selection */}
        <div>
          <label className="text-[11px] font-black uppercase text-slate-400 block mb-1.5">
            {t('ttsEngineLabel')}
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
              <input
                type="radio"
                name="ttsEngine"
                checked={voiceSettings.ttsEngine === 'webspeech'}
                onChange={() => updateVoiceSettings({ ttsEngine: 'webspeech' })}
                className="w-4 h-4 text-duo-green"
              />
              <div>
                <span className="text-xs font-black text-slate-800 block">
                  {t('browserSpeech')}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Встроенные голоса системы (Siri, Google, Microsoft). Быстро и без задержек.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
              <input
                type="radio"
                name="ttsEngine"
                checked={voiceSettings.ttsEngine === 'openai'}
                onChange={() => updateVoiceSettings({ ttsEngine: 'openai' })}
                className="w-4 h-4 text-duo-green"
              />
              <div>
                <span className="text-xs font-black text-slate-800 block">
                  {t('openAiTts')}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Нейросетевой голос студийного качества (alloy, nova, shimmer).
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Rate & Pitch Sliders */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div>
            <div className="flex justify-between text-xs font-black text-slate-700 mb-1">
              <span>{t('speechRate')}</span>
              <span className="text-slate-400">{voiceSettings.voiceRate}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={voiceSettings.voiceRate}
              onChange={(e) => updateVoiceSettings({ voiceRate: parseFloat(e.target.value) })}
              className="w-full accent-duo-green"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-black text-slate-700 mb-1">
              <span>{t('speechPitch')}</span>
              <span className="text-slate-400">{voiceSettings.voicePitch}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.05"
              value={voiceSettings.voicePitch}
              onChange={(e) => updateVoiceSettings({ voicePitch: parseFloat(e.target.value) })}
              className="w-full accent-duo-green"
            />
          </div>
        </div>
      </div>

      {/* 3. Reset Data */}
      <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <h2 className="text-base font-black text-slate-800">
            Сброс данных и прогресса
          </h2>
        </div>
        <p className="text-xs font-bold text-slate-400 mb-4">
          Очистит монеты, словарь и вернёт стартовые значения.
        </p>

        <button
          onClick={() => {
            if (confirm('Точно сбросить весь прогресс обучения?')) {
              resetProgress();
            }
          }}
          className="w-full py-2.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 font-black text-xs hover:bg-rose-100 active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Сбросить прогресс к началу</span>
        </button>
      </div>

    </div>
  );
};
