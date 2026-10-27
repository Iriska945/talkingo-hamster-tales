import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Sparkles, Coins, Gem, Award, ArrowRight } from 'lucide-react';
import { soundEffects } from '../services/voice';

interface RewardModalProps {
  isOpen: boolean;
  coins: number;
  diamonds: number;
  onClose: () => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  isOpen,
  coins,
  diamonds,
  onClose,
}) => {
  const { t, activeCharacter } = useApp();

  useEffect(() => {
    if (isOpen) {
      soundEffects.fanfare();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 250);
      } catch (e) {
        console.warn(e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm liquid-glass-elevated p-6 text-center animate-in zoom-in-95 duration-200 border border-white/20">
        
        {/* Animated Mascot Badge */}
        <div className="relative mx-auto -mt-16 w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500/20 to-yellow-400/30 border border-white/30 backdrop-blur-2xl shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-center text-5xl">
          {activeCharacter.emoji}
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-white text-xs shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Title */}
        <h2 className="mt-4 text-2xl font-medium text-white tracking-tight">
          {t('lessonComplete')} 🎉
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          {activeCharacter.name} гордится твоими речевыми успехами!
        </p>

        {/* Rewards Grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/25">
            <Coins className="w-5 h-5 text-yellow-400" />
            <div className="text-left">
              <span className="block text-lg font-bold text-yellow-300 leading-none">+{coins}</span>
              <span className="text-[10px] text-neutral-400">{t('rewardCoins')}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/25">
            <Gem className="w-5 h-5 text-cyan-300" />
            <div className="text-left">
              <span className="block text-lg font-bold text-cyan-300 leading-none">+{diamonds}</span>
              <span className="text-[10px] text-neutral-400">{t('rewardDiamonds')}</span>
            </div>
          </div>
        </div>

        {/* Bonus XP */}
        <div className="mt-3 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-500/10 border border-purple-500/25 text-xs font-medium text-purple-300">
          <Award className="w-4 h-4 text-purple-400" />
          <span>+25 XP Опыт красноречия</span>
        </div>

        {/* Continue Button: High Contrast White Pill */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-3.5 px-6 liquid-pill-white text-sm flex items-center justify-center gap-2"
        >
          <span>{t('awesome')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
