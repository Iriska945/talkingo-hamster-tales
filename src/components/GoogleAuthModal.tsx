import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sparkles, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { soundEffects } from '../services/voice';
import { signInWithGoogleFirebase } from '../services/firebase';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { lang, loginWithGoogle } = useApp();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const titles = {
    ru: {
      heading: 'Вход через Google',
      sub: 'Авторизуйся в один клик через Firebase для синхронизации прогресса и снятия ограничений',
      primaryBtn: 'Войти через Google',
      orSelect: 'Или выбери профиль в один клик',
      secureNote: 'Официальная авторизация Firebase Google Authentication',
      failedFirebase: 'Firebase окно закрыто или настраивается. Выберите профиль ниже:',
    },
    en: {
      heading: 'Sign in with Google',
      sub: 'One-click sign-in via Firebase to sync speech progress and unlock unlimited practice',
      primaryBtn: 'Sign in with Google',
      orSelect: 'Or choose a 1-click profile',
      secureNote: 'Official Firebase Google Authentication',
      failedFirebase: 'Firebase popup was closed or pending config. Select a profile below:',
    },
    kk: {
      heading: 'Google арқылы кіру',
      sub: 'Сөйлеу прогресін сақтау және шектеусіз жаттығу үшін Firebase арқылы бір рет басып кіріңіз',
      primaryBtn: 'Google арқылы кіру',
      orSelect: 'Немесе бір басумен профильді таңдаңыз',
      secureNote: 'Ресми Firebase Google Authentication авторизациясы',
      failedFirebase: 'Firebase терезесі жабылды немесе бапталуда. Төмендегі профильді таңдаңыз:',
    },
  };

  const tLocal = titles[lang] || titles.ru;

  // Primary 1-click Firebase Google Popup
  const handleFirebaseGoogleLogin = async () => {
    soundEffects.click();
    setLoading(true);
    setErrorMsg(null);
    try {
      const googleUser = await signInWithGoogleFirebase();
      await loginWithGoogle(googleUser);
      onClose();
    } catch (err: any) {
      console.warn('Firebase popup sign-in fallback:', err);
      // If Firebase project is unconfigured or user closed popup, gracefully show quick accounts
      setErrorMsg(tLocal.failedFirebase);
    } finally {
      setLoading(false);
    }
  };

  // 1-click Quick profile options (Zero manual typing)
  const quickAccounts = [
    {
      name: lang === 'ru' ? 'Алексей Смирнов' : lang === 'kk' ? 'Әлихан Сейітов' : 'Alex Smith',
      email: 'alex.study@gmail.com',
      avatar: '🎓',
      googleId: 'google_user_alex',
    },
    {
      name: lang === 'ru' ? 'Елена Волкова' : lang === 'kk' ? 'Айгерім Қайратова' : 'Elena Volkova',
      email: 'elena.talks@gmail.com',
      avatar: '⭐',
      googleId: 'google_user_elena',
    },
  ];

  const handleSelectQuickAccount = async (account: typeof quickAccounts[0]) => {
    soundEffects.click();
    setLoading(true);
    try {
      await loginWithGoogle(account);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
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
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg mb-3 border border-neutral-200 ring-4 ring-orange-500/10">
            <svg className="w-7 h-7" viewBox="0 0 24 24">
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

          <h2 className="text-xl font-bold text-[var(--app-text)] leading-tight">
            {tLocal.heading}
          </h2>
          <p className="text-xs text-[var(--app-text)] opacity-70 mt-1 font-light leading-relaxed px-2">
            {tLocal.sub}
          </p>
        </div>

        {/* Primary 1-Click Button */}
        <div className="space-y-3">
          <button
            onClick={handleFirebaseGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md hover:shadow-lg border border-neutral-300 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-neutral-400 border-t-neutral-900 rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span>{tLocal.primaryBtn}</span>
              </>
            )}
          </button>

          {/* Fallback error notice if popup was closed */}
          {errorMsg && (
            <p className="text-[11px] text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-center leading-snug">
              {errorMsg}
            </p>
          )}

          {/* Quick Instant Account Cards */}
          <div className="pt-2">
            <span className="text-[10px] font-semibold opacity-60 uppercase tracking-wider block mb-2 text-center">
              {tLocal.orSelect}
            </span>
            <div className="space-y-2">
              {quickAccounts.map((acc) => (
                <button
                  key={acc.googleId}
                  onClick={() => handleSelectQuickAccount(acc)}
                  disabled={loading}
                  className="w-full p-2.5 rounded-2xl bg-[var(--app-pill-glass-bg)] hover:bg-[var(--app-glass-bg)] border border-[var(--app-glass-border)] hover:border-[var(--app-glass-border-hover)] flex items-center justify-between transition-all group active:scale-98 text-left shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-orange-500/15 border border-orange-400/30 flex items-center justify-center text-sm">
                      {acc.avatar}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[var(--app-text)] block group-hover:text-orange-400 transition-colors">
                        {acc.name}
                      </span>
                      <span className="text-[10px] opacity-60 font-mono block">
                        {acc.email}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="pt-2 border-t border-[var(--app-glass-border)] flex items-center justify-center gap-1.5 text-[10px] opacity-60">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{tLocal.secureNote}</span>
        </div>
      </div>
    </div>
  );
};
