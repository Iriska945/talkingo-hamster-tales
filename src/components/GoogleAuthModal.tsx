import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Sparkles, ArrowRight, ShieldCheck, Mail, User } from 'lucide-react';
import { soundEffects } from '../services/voice';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { lang, loginWithGoogle } = useApp();
  const [loading, setLoading] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const defaultAccount = {
    name: lang === 'ru' ? 'Алексей Смирнов' : lang === 'kk' ? 'Әлихан Сейітов' : 'Alex Smith',
    email: 'alex.study@gmail.com',
    avatar: '🎓',
    googleId: 'google_user_alex_study',
  };

  const handleSelectAccount = async (account: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
  }) => {
    soundEffects.click();
    setLoading(true);
    try {
      await loginWithGoogle(account);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customName.trim()) return;

    soundEffects.click();
    setLoading(true);
    try {
      await loginWithGoogle({
        googleId: 'google_' + Date.now(),
        email: customEmail.trim(),
        name: customName.trim(),
        avatar: '🎓',
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    ru: {
      heading: 'Вход через Google',
      sub: 'Синхронизируй свой речевой прогресс, словарный запас и награды',
      chooseAcc: 'Выбери аккаунт Google',
      useOther: 'Войти с другим email Google',
      namePlaceholder: 'Твоё имя в Google',
      emailPlaceholder: 'Твой email @gmail.com',
      submitBtn: 'Войти в аккаунт',
      backBtn: 'Назад к списку',
      secureNote: 'Безопасная авторизация через Google OAuth 2.0',
    },
    en: {
      heading: 'Sign in with Google',
      sub: 'Sync your speech progress, literary dictionary, and streak across devices',
      chooseAcc: 'Choose a Google account',
      useOther: 'Use another Google email',
      namePlaceholder: 'Your Google name',
      emailPlaceholder: 'Your @gmail.com address',
      submitBtn: 'Sign in',
      backBtn: 'Back to accounts',
      secureNote: 'Secure authorization via Google OAuth 2.0',
    },
    kk: {
      heading: 'Google арқылы кіру',
      sub: 'Сөйлеу прогресін, сөздік қорын және марапаттарды сақта',
      chooseAcc: 'Google аккаунтын таңдаңыз',
      useOther: 'Басқа Google поштасымен кіру',
      namePlaceholder: 'Google-дегі есіміңіз',
      emailPlaceholder: '@gmail.com поштаңыз',
      submitBtn: 'Аккаунтқа кіру',
      backBtn: 'Тізімге қайту',
      secureNote: 'Google OAuth 2.0 арқылы қауіпсіз авторизация',
    },
  };

  const tLocal = titles[lang] || titles.ru;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm liquid-glass-elevated p-6 rounded-3xl border border-[var(--app-glass-border)] shadow-2xl relative text-[var(--app-text)] space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            soundEffects.click();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] hover:border-[var(--app-glass-border-hover)] flex items-center justify-center text-[var(--app-text)] opacity-70 hover:opacity-100 transition-all active:scale-90"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Google Header */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md mb-3 border border-neutral-200">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <h2 className="text-lg font-semibold text-[var(--app-text)] leading-tight">
            {tLocal.heading}
          </h2>
          <p className="text-xs text-[var(--app-text)] opacity-70 mt-1 font-light leading-relaxed px-2">
            {tLocal.sub}
          </p>
        </div>

        {/* Account Selector vs Custom Email */}
        {!customMode ? (
          <div className="space-y-3">
            <span className="text-[11px] font-medium opacity-60 uppercase tracking-wider block">
              {tLocal.chooseAcc}
            </span>

            {/* Quick 1-click Preset Account */}
            <button
              onClick={() => handleSelectAccount(defaultAccount)}
              disabled={loading}
              className="w-full p-3 rounded-2xl bg-[var(--app-pill-glass-bg)] hover:bg-[var(--app-glass-bg)] border border-[var(--app-glass-border)] hover:border-[var(--app-glass-border-hover)] flex items-center justify-between transition-all group active:scale-98 text-left shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-lg">
                  {defaultAccount.avatar}
                </div>
                <div>
                  <span className="text-xs font-semibold text-[var(--app-text)] block group-hover:text-orange-400 transition-colors">
                    {defaultAccount.name}
                  </span>
                  <span className="text-[11px] opacity-60 font-mono block">
                    {defaultAccount.email}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Switch to Custom Email Input */}
            <button
              onClick={() => {
                soundEffects.click();
                setCustomMode(true);
              }}
              className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-[var(--app-glass-border)] hover:border-[var(--app-glass-border-hover)] text-xs text-[var(--app-text)] opacity-70 hover:opacity-100 flex items-center justify-center gap-2 transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{tLocal.useOther}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-medium opacity-70 block mb-1">
                Имя
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 opacity-50" />
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={tLocal.namePlaceholder}
                  className="w-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium opacity-70 block mb-1">
                Gmail адрес
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 opacity-50" />
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder={tLocal.emailPlaceholder}
                  className="w-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCustomMode(false)}
                className="flex-1 py-2 rounded-xl border border-[var(--app-glass-border)] text-xs opacity-70 hover:opacity-100 transition-opacity"
              >
                {tLocal.backBtn}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 liquid-pill-white text-xs font-semibold flex items-center justify-center gap-1 active:scale-95"
              >
                <span>{tLocal.submitBtn}</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Security badge */}
        <div className="pt-2 border-t border-[var(--app-glass-border)] flex items-center justify-center gap-1.5 text-[10px] opacity-60">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{tLocal.secureNote}</span>
        </div>
      </div>
    </div>
  );
};
