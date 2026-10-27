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
      // Multi-stage confetti burst
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-4 border-slate-100 text-center animate-in zoom-in-95 duration-200">
        
        {/* Animated Mascot Badge */}
        <div className="relative mx-auto -mt-16 w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-400 border-4 border-white shadow-xl flex items-center justify-center text-5xl animate-bounce-slow">
          {activeCharacter.emoji}
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-duo-green border-2 border-white flex items-center justify-center text-white text-sm shadow">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Title */}
        <h2 className="mt-4 text-2xl font-black text-slate-800 tracking-tight">
          {t('lessonComplete')} 🎉
        </h2>
        <p className="text-xs font-bold text-slate-500 mt-1">
          {activeCharacter.name} гордится твоими речевыми успехами!
        </p>

        {/* Rewards Grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-amber-50 border-2 border-amber-200">
            <Coins className="w-6 h-6 text-amber-500 fill-amber-400" />
            <div className="text-left">
              <span className="block text-lg font-black text-amber-900 leading-none">+{coins}</span>
              <span className="text-[10px] font-bold text-amber-700">{t('rewardCoins')}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-cyan-50 border-2 border-cyan-200">
            <Gem className="w-6 h-6 text-cyan-500 fill-cyan-400" />
            <div className="text-left">
              <span className="block text-lg font-black text-cyan-900 leading-none">+{diamonds}</span>
              <span className="text-[10px] font-bold text-cyan-700">{t('rewardDiamonds')}</span>
            </div>
          </div>
        </div>

        {/* Bonus XP */}
        <div className="mt-3 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-violet-50 border border-violet-200 text-xs font-black text-violet-700">
          <Award className="w-4 h-4 text-violet-600" />
          <span>+25 XP Опыт красноречия</span>
        </div>

        {/* Continue Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-3.5 px-4 rounded-2xl btn-duo-green font-black text-base shadow-lg flex items-center justify-center gap-2 transition-transform"
        >
          <span>{t('awesome')}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
};
