import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { speakWithBrowser, soundEffects } from '../services/voice';
import { Bookmark, Search, Volume2, BookOpen, Sparkles, Filter } from 'lucide-react';

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
    <div className="min-h-screen bg-[#f7f7f7] pb-28 pt-4 px-4 max-w-lg mx-auto space-y-4">
      
      {/* Dictionary Header */}
      <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Bookmark className="w-5 h-5 text-duo-purple" />
          <h1 className="text-xl font-black text-slate-800">
            {t('dictTitle')}
          </h1>
        </div>
        <p className="text-xs font-bold text-slate-400">
          {t('dictSub')}
        </p>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPhrases')}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 font-bold text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-duo-purple/40"
          />
        </div>

        {/* Language Filter Pills */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: t('allLanguages') },
            { id: 'ru', label: '🇷🇺 Русский' },
            { id: 'en', label: '🇬🇧 English' },
            { id: 'kk', label: '🇰🇿 Қазақша' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => {
                soundEffects.click();
                setSelectedLang(pill.id as Language | 'all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all ${
                selectedLang === pill.id
                  ? 'bg-duo-purple text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phrases List */}
      {filteredPhrases.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border-2 border-slate-200 shadow-sm space-y-3">
          <div className="text-5xl animate-bounce-slow">🐹📖</div>
          <h3 className="text-base font-black text-slate-700">Ничего не найдено</h3>
          <p className="text-xs font-bold text-slate-400 max-w-xs mx-auto">
            {t('dictEmpty')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPhrases.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-200 shadow-sm hover:border-purple-300 transition-all space-y-2.5"
            >
              {/* Phrase Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">
                    {item.language === 'ru' ? 'Русский' : item.language === 'en' ? 'English' : 'Қазақша'}
                  </span>
                  <h3 className="text-lg font-black text-slate-800 leading-tight">
                    {item.phrase}
                  </h3>
                </div>

                <button
                  onClick={() => handleSpeakPhrase(item.id, item.phrase, item.language)}
                  className={`p-2.5 rounded-2xl bg-purple-50 text-duo-purple border border-purple-200 shadow-sm hover:bg-purple-100 active:scale-90 transition-transform ${
                    speakingId === item.id ? 'ring-2 ring-purple-400 animate-pulse' : ''
                  }`}
                  title={t('pronounce')}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Kid-friendly meaning */}
              <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
                <span className="text-[10px] font-black uppercase text-purple-700 block mb-0.5">
                  ✨ {t('kidFriendly')}
                </span>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                  {item.kidExplanation}
                </p>
              </div>

              {/* Literal meaning */}
              {item.literalMeaning && (
                <div className="text-xs font-bold text-slate-500">
                  <span className="text-slate-400 font-extrabold">{t('literal')}: </span>
                  <span>{item.literalMeaning}</span>
                </div>
              )}

              {/* Example */}
              {item.example && (
                <div className="text-xs font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-extrabold">{t('example')}: </span>
                  <span className="italic">«{item.example}»</span>
                </div>
              )}

              {/* Source Book Citation */}
              {item.sourceBook && (
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-700 pt-1">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
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
