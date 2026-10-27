import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Character } from '../types';
import { speakWithBrowser, soundEffects } from '../services/voice';
import { ShoppingBag, Coins, Gem, Check, Volume2 } from 'lucide-react';

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
          label: 'Легендарный',
          badge: 'bg-[#F9EFEB] text-[#D2674E] border border-[#F1D7CE]',
        };
      case 'rare':
        return {
          label: 'Редкий',
          badge: 'bg-[#EBF1F5] text-[#476579] border border-[#D3E2EB]',
        };
      default:
        return {
          label: 'Обычный',
          badge: 'bg-[#F6F3EC] text-[#78746D] border border-[#EAE6DE]',
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 pt-4 px-4 max-w-lg mx-auto space-y-4">
      
      {/* 1. Header & Balance Card */}
      <div className="open-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#F6F3EC] flex items-center justify-center text-[#1C1A17]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1C1A17] leading-tight">
                Магазин компаньонов
              </h1>
              <span className="text-xs text-[#78746D]">
                Открывай персонажей за успехи в речи
              </span>
            </div>
          </div>

          {/* Balance Pills */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F8F3E8] border border-[#EBE0C7] text-xs font-bold text-[#C49B52]">
              <Coins className="w-3.5 h-3.5" />
              <span>{resources.coins}</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#EBF1F5] border border-[#D3E2EB] text-xs font-bold text-[#476579]">
              <Gem className="w-3.5 h-3.5" />
              <span>{resources.diamonds}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Character Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {characters.map((char) => {
          const isOwned = ownedCharacterIds.includes(char.id);
          const isActive = activeCharacter.id === char.id;
          const rarity = getRarityBadge(char.rarity);
          const canAfford =
            resources.coins >= char.price_coins && resources.diamonds >= char.price_diamonds;

          return (
            <div
              key={char.id}
              className={`open-card p-4 flex flex-col justify-between transition-all relative ${
                isActive ? 'ring-2 ring-[#3F634D] ring-offset-2' : 'hover:border-[#D8D3C8]'
              }`}
            >
              {/* Top row: Rarity & Active Tag */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rarity.badge}`}>
                  {rarity.label}
                </span>

                {isActive && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8EFEA] text-[#3F634D] flex items-center gap-0.5">
                    <Check className="w-3 h-3" />
                    Выбран
                  </span>
                )}
              </div>

              {/* Character Avatar */}
              <div className="flex flex-col items-center text-center my-2">
                <div className="w-20 h-20 rounded-full bg-[#F8F6F1] border border-[#EAE6DE] flex items-center justify-center text-4xl shadow-sm mb-2 group">
                  <span className="hover:scale-110 transition-transform">
                    {char.emoji}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#1C1A17]">{char.name}</h3>
                <p className="text-[11px] text-[#78746D] line-clamp-2 mt-0.5 px-1">
                  {char.personality[lang] || char.personality.ru}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-[#F2EEE6] flex items-center gap-2">
                {/* Voice Preview Button */}
                <button
                  onClick={() => handlePreviewVoice(char)}
                  disabled={previewingId === char.id}
                  className="w-9 h-9 rounded-full bg-[#F6F3EC] hover:bg-[#EAE6DE] flex items-center justify-center text-[#78746D] transition-colors shrink-0"
                  title="Прослушать голос"
                >
                  <Volume2 className={`w-4 h-4 ${previewingId === char.id ? 'animate-pulse text-[#3F634D]' : ''}`} />
                </button>

                {/* Primary Button: Select or Buy */}
                {isOwned ? (
                  <button
                    onClick={() => selectCharacter(char.id)}
                    disabled={isActive}
                    className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#E8EFEA] text-[#3F634D] cursor-default'
                        : 'btn-open-outline'
                    }`}
                  >
                    {isActive ? 'Активен' : 'Выбрать'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (canAfford) {
                        buyCharacter(char);
                      } else {
                        soundEffects.click();
                        alert('Недостаточно монет или алмазов! Практикуйся в речевом тренажёре.');
                      }
                    }}
                    className={`flex-1 py-2 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      canAfford
                        ? 'btn-open-primary'
                        : 'bg-[#F2EEE6] text-[#A8A399] cursor-not-allowed'
                    }`}
                  >
                    <span>Купить</span>
                    {char.price_coins > 0 && (
                      <span className="flex items-center gap-0.5 text-[#F8BA44]">
                        <Coins className="w-3 h-3" />
                        {char.price_coins}
                      </span>
                    )}
                    {char.price_diamonds > 0 && (
                      <span className="flex items-center gap-0.5 text-[#5B8296]">
                        <Gem className="w-3 h-3" />
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
