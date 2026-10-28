import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Character } from '../types';
import { speakWithTTS, soundEffects } from '../services/voice';
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
    speakWithTTS(greeting, lang).finally(() => {
      setPreviewingId(null);
    });
  };

  const getRarityBadge = (rarity: Character['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return {
          label: t('rarityLegendary'),
          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        };
      case 'rare':
        return {
          label: t('rarityRare'),
          badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
        };
      default:
        return {
          label: t('rarityCommon'),
          badge: 'bg-white/[0.06] text-neutral-400 border-white/10',
        };
    }
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto space-y-6 relative transition-colors duration-300 motion-page-enter">
      
      {/* Ambient background glow */}
      <div className="ambient-glow-orb w-[350px] h-[350px] bg-yellow-600/15 top-[-40px] left-[-80px] pointer-events-none" />
      <div className="ambient-glow-orb w-[300px] h-[300px] bg-indigo-600/10 top-[200px] right-[-60px] pointer-events-none" />

      {/* 1. Header & Balance Card (Liquid Glass) */}
      <div className="liquid-glass p-5 rounded-3xl relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] flex items-center justify-center text-[var(--app-text)] shrink-0">
              <ShoppingBag className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[var(--app-text)] leading-tight">
                {t('shopHeader')}
              </h1>
              <span className="text-xs opacity-70 font-light block mt-0.5">
                {t('shopSub')}
              </span>
            </div>
          </div>

          {/* Balance Pills */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-xs font-semibold text-yellow-300 shadow-sm">
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
              <span>{resources.coins} {t('coinsUnit')}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-xs font-semibold text-cyan-300 shadow-sm">
              <Gem className="w-3.5 h-3.5 text-cyan-300" />
              <span>{resources.diamonds} {t('diamondsUnit')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Character Grid in Anchored Responsive 4-Column Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 relative z-10">
        {characters.map((char, idx) => {
          const isOwned = ownedCharacterIds.includes(char.id);
          const isActive = activeCharacter.id === char.id;
          const rarity = getRarityBadge(char.rarity);
          const canAfford =
            resources.coins >= char.price_coins && resources.diamonds >= char.price_diamonds;

          return (
            <div
              key={char.id}
              className={`liquid-glass p-5 rounded-3xl flex flex-col justify-between transition-all relative border interactive-card motion-card-enter stagger-${(idx % 6) + 1} h-full min-h-[330px] ${
                isActive
                  ? 'border-emerald-400/60 shadow-[0_0_25px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/30'
                  : 'border-[var(--app-glass-border)] hover:border-[var(--app-glass-border-hover)]'
              }`}
            >
              {/* Top row: Rarity & Active Tag */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${rarity.badge}`}>
                  {rarity.label}
                </span>

                {isActive && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-emerald-300 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                    Выбран
                  </span>
                )}
              </div>

              {/* Character Avatar & Description */}
              <div className="flex flex-col items-center text-center my-3">
                <div className="w-20 h-20 rounded-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] backdrop-blur-xl flex items-center justify-center text-4xl shadow-sm mb-2 group">
                  <span className="hover:scale-110 transition-transform">
                    {char.emoji}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-[var(--app-text)]">{char.name}</h3>
                <p className="text-xs text-[var(--app-text)] opacity-70 line-clamp-2 h-9 mt-1 px-1 font-light leading-relaxed">
                  {char.personality[lang] || char.personality.ru}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-[var(--app-glass-border)] flex items-center gap-2">
                {/* Voice Preview Button */}
                <button
                  onClick={() => handlePreviewVoice(char)}
                  disabled={previewingId === char.id}
                  className="w-9 h-9 rounded-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] hover:border-[var(--app-glass-border-hover)] flex items-center justify-center text-[var(--app-text)] opacity-80 hover:opacity-100 transition-colors shrink-0"
                  title={t('listenVoice')}
                >
                  <Volume2 className={`w-4 h-4 ${previewingId === char.id ? 'animate-pulse text-emerald-400' : ''}`} />
                </button>

                {/* Primary Button: Select or Buy */}
                {isOwned ? (
                  <button
                    onClick={() => selectCharacter(char.id)}
                    disabled={isActive}
                    className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-300 border border-emerald-500/30 cursor-default'
                        : 'liquid-pill-glass'
                    }`}
                  >
                    {isActive ? t('activeStatus') : t('selectBtn')}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (canAfford) {
                        buyCharacter(char);
                      } else {
                        soundEffects.click();
                        alert(t('notEnoughFunds'));
                      }
                    }}
                    className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      canAfford
                        ? 'liquid-pill-white'
                        : 'bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] text-[var(--app-text)] opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <span>{t('buyBtn')}</span>
                    {char.price_coins > 0 && (
                      <span className="flex items-center gap-0.5 text-yellow-500 dark:text-yellow-400 font-mono">
                        <Coins className="w-3 h-3" />
                        {char.price_coins}
                      </span>
                    )}
                    {char.price_diamonds > 0 && (
                      <span className="flex items-center gap-0.5 text-cyan-500 dark:text-cyan-300 font-mono">
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
