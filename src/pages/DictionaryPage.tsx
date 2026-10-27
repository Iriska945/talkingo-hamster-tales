import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { speakWithBrowser, soundEffects } from '../services/voice';
import { Bookmark, Search, Volume2, BookOpen, Sparkles } from 'lucide-react';

export const DictionaryPage: React.FC = () => {
  const { t, phrases } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState<Language | 'all'>('all');
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const filteredPhrases = phrases.filter((p) => {
    const matchesLang = selectedLang === 'all' || p.language === selectedLang;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.phrase.toLowerCase().includes(query) ||
      p.kidExplanation.toLowerCase().includes(query) ||
      (p.sourceBook && p.sourceBook.toLowerCase().includes(query));
    return matchesLang && matchesSearch;
  });

  const handleSpeakPhrase = (id: string, phrase: string, lang: Language) => {
    soundEffects.click();
    setSpeakingId(id);
    speakWithBrowser(phrase, lang).then(() => {
      setSpeakingId(null);
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 pt-4 px-4 max-w-lg mx-auto space-y-4">
      
      {/* 1. Header & Search Card */}
      <div className="open-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-[#F6F3EC] flex items-center justify-center text-[#1C1A17]">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1C1A17] leading-tight">
              Словарь выражений
            </h1>
            <span className="text-xs text-[#78746D]">
              Собрано выражений: <strong className="text-[#3F634D]">{phrases.length}</strong>
            </span>
          </div>
        </div>

        {/* Minimalist Search Input */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-[#A8A399] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по фразе или автору..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#F8F6F1] border border-[#EAE6DE] text-xs text-[#1C1A17] placeholder:text-[#A8A399] focus:outline-none focus:border-[#3F634D] transition-colors"
          />
        </div>

        {/* Language Filter Pills */}
        <div className="flex items-center gap-1.5 pt-1">
          {[
            { id: 'all', label: 'Все' },
            { id: 'ru', label: '🇷🇺 Русский' },
            { id: 'en', label: '🇬🇧 English' },
            { id: 'kk', label: '🇰🇿 Қазақша' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedLang(tab.id as any)}
              className={`py-1 px-3 rounded-full text-xs font-semibold transition-all ${
                selectedLang === tab.id
                  ? 'bg-[#1C1A17] text-white shadow-sm'
                  : 'bg-[#F8F6F1] text-[#78746D] hover:bg-[#F2EEE6]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Phrase Cards List */}
      {filteredPhrases.length === 0 ? (
        <div className="open-card p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#F6F3EC] flex items-center justify-center text-2xl mb-2">
            ✨
          </div>
          <h3 className="text-sm font-bold text-[#1C1A17]">Словарь пока пуст</h3>
          <p className="text-xs text-[#78746D] mt-1 max-w-xs mx-auto">
            Общайся с хомячком в голосовом тренажёре — он будет делиться новыми крылатыми фразами в каждом диалоге!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPhrases.map((item) => (
            <div
              key={item.id}
              className="open-card p-4 transition-all hover:border-[#D8D3C8] space-y-2.5"
            >
              {/* Header row: Phrase & Audio Button */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="text-sm font-bold text-[#1C1A17] block leading-snug">
                    «{item.phrase}»
                  </span>
                  <span className="text-[10px] font-semibold text-[#A8A399] uppercase tracking-wider">
                    {item.language === 'ru' ? 'Русский' : item.language === 'en' ? 'English' : 'Қазақша'}
                  </span>
                </div>

                <button
                  onClick={() => handleSpeakPhrase(item.id, item.phrase, item.language)}
                  className="w-8 h-8 rounded-full bg-[#F6F3EC] hover:bg-[#EAE6DE] flex items-center justify-center text-[#78746D] shrink-0 transition-colors"
                  title="Озвучить"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${speakingId === item.id ? 'animate-pulse text-[#3F634D]' : ''}`} />
                </button>
              </div>

              {/* Kid-friendly meaning */}
              <div className="p-3 rounded-2xl bg-[#E8EFEA]/50 border border-[#D5E2D9]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3F634D] block mb-0.5">
                  ✨ Простое объяснение
                </span>
                <p className="text-xs text-[#1C1A17] leading-relaxed">
                  {item.kidExplanation}
                </p>
              </div>

              {/* Literal meaning */}
              {item.literalMeaning && (
                <div className="text-xs text-[#78746D]">
                  <span className="font-semibold text-[#1C1A17]">Буквально: </span>
                  <span>{item.literalMeaning}</span>
                </div>
              )}

              {/* Example */}
              {item.example && (
                <div className="text-xs text-[#1C1A17] bg-[#F8F6F1] p-2.5 rounded-2xl border border-[#EAE6DE]">
                  <span className="text-[#78746D] font-semibold">Пример: </span>
                  <span className="italic">«{item.example}»</span>
                </div>
              )}

              {/* Source Book Citation */}
              {item.sourceBook && (
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#C49B52] pt-0.5">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.sourceBook}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
