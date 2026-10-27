import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Character } from '../types';
import { speakWithBrowser, soundEffects } from '../services/voice';
import { ShoppingBag, Coins, Gem, Sparkles, Check, Volume2, Star } from 'lucide-react';

export const ShopPage: React.FC = () => {
  const {
    t,
    lang,
    characters,
    ownedCharacterIds,
    activeCharacter,
    resources,
    buyCharacter,
    selectCharacter,
  } = useApp();

  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const handlePreviewVoice = (c: Character) => {
    soundEffects.click();
    setPreviewingId(c.id);
    const greeting = c.greeting[lang] || c.greeting.ru;
    speakWithBrowser(greeting, lang).then(() => {
      setPreviewingId(null);
    });
  };

  const getRarityBadge = (rarity: Character['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return {
          label: t('legendary'),
          bg: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
          border: 'border-purple-300',
        };
      case 'rare':
        return {
          label: t('rare'),
          bg: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
          border: 'border-blue-300',
        };
      default:
        return {
          label: t('common'),
          bg: 'bg-slate-200 text-slate-700',
          border: 'border-slate-300',
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-28 pt-4 px-4 max-w-lg mx-auto space-y-4">
      
      {/* Shop Header */}
      <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-black uppercase text-duo-blue flex items-center gap-1">
            <ShoppingBag className="w-4 h-4" />
            {t('shopTitle')}
          </span>
          <h1 className="text-xl font-black text-slate-800 leading-tight mt-0.5">
            Собери всю коллекцию!
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-0.5">
            {t('shopSub')}
          </p>
        </div>

        {/* User Balance Chips */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-xs font-black text-amber-700">
            <Coins className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>{resources.coins}</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-cyan-50 border border-cyan-200 text-xs font-black text-cyan-700">
            <Gem className="w-4 h-4 fill-cyan-400 text-cyan-500" />
            <span>{resources.diamonds}</span>
          </div>
        </div>
      </div>

      {/* Characters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {characters.map((char) => {
          const isOwned = ownedCharacterIds.includes(char.id);
          const isActive = activeCharacter.id === char.id;
          const badge = getRarityBadge(char.rarity);
          const canAfford =
            resources.coins >= char.price_coins &&
            resources.diamonds >= char.price_diamonds;

          return (
            <div
              key={char.id}
              className={`relative bg-white rounded-3xl p-4 border-2 transition-all shadow-sm flex flex-col justify-between ${
                isActive
                  ? 'border-duo-green ring-4 ring-duo-green/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Top Header: Rarity & Stars */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${badge.bg}`}
                >
                  {badge.label}
                </span>

                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: char.stars }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>

              {/* Character Avatar Box */}
              <div className="relative my-2 text-center">
                <div
                  className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr ${char.gradient} p-2 flex items-center justify-center text-5xl shadow-md border-2 border-white transition-transform hover:scale-105`}
                >
                  {char.emoji}
                </div>

                {/* Voice Preview button */}
                <button
                  onClick={() => handlePreviewVoice(char)}
                  className={`absolute bottom-0 right-1/2 translate-x-8 translate-y-1 p-1.5 rounded-full bg-white text-slate-700 shadow-md border border-slate-200 active:scale-90 transition-transform ${
                    previewingId === char.id ? 'ring-2 ring-duo-blue animate-pulse' : ''
                  }`}
                  title="Послушать приветствие"
                >
                  <Volume2 className="w-3.5 h-3.5 text-duo-blue" />
                </button>
              </div>

              {/* Info */}
              <div className="text-center mt-1 mb-3">
                <h3 className="text-base font-black text-slate-800 leading-tight">
                  {char.name}
                </h3>
                <p className="text-[11px] font-bold text-slate-500 mt-1 min-h-[32px] line-clamp-2">
                  {char.ability}
                </p>
              </div>

              {/* Action Button */}
              <div>
                {isActive ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-2xl bg-duo-green/15 text-duo-green-dark font-black text-xs flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t('active')}</span>
                  </button>
                ) : isOwned ? (
                  <button
                    onClick={() => selectCharacter(char.id)}
                    className="w-full py-2.5 rounded-2xl btn-duo-blue font-black text-xs shadow-md active:scale-95 transition-transform"
                  >
                    {t('select')}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (canAfford) {
                        buyCharacter(char);
                      } else {
                        soundEffects.click();
                        alert('Недостаточно монет или алмазов! Тренируйся в речевом тренажёре, чтобы заработать.');
                      }
                    }}
                    className={`w-full py-2.5 rounded-2xl font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-transform ${
                      canAfford
                        ? 'btn-duo-green'
                        : 'bg-slate-200 text-slate-400 border-b-2 border-slate-300'
                    }`}
                  >
                    <span>{t('buy')}</span>
                    {char.price_coins > 0 && (
                      <span className="flex items-center gap-0.5 ml-1">
                        <Coins className="w-3.5 h-3.5 fill-amber-300" />
                        {char.price_coins}
                      </span>
                    )}
                    {char.price_diamonds > 0 && (
                      <span className="flex items-center gap-0.5 ml-1">
                        <Gem className="w-3.5 h-3.5 fill-cyan-300" />
                        {char.price_diamonds}
                      </span>
                    )}
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
