import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';
import { soundEffects } from '../services/voice';
import {
  signInWithGoogleFirebase,
  registerWithEmail,
  signInWithEmail,
  resetPassword,
} from '../services/firebase';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'login' | 'register';
type Lang = 'ru' | 'en' | 'kk';

const TEXT: Record<Lang, Record<string, string>> = {
  ru: {
    login: 'Вход', register: 'Регистрация', google: 'Продолжить с Google', or: 'или по email',
    name: 'Имя', email: 'Email', password: 'Пароль (мин. 6 символов)',
    submitLogin: 'Войти', submitRegister: 'Создать аккаунт', forgot: 'Забыли пароль?',
    resetSent: 'Письмо для сброса пароля отправлено', secure: 'Защищено Firebase Authentication',
    sub: 'Сохраняй прогресс на всех устройствах',
  },
  en: {
    login: 'Sign in', register: 'Sign up', google: 'Continue with Google', or: 'or with email',
    name: 'Name', email: 'Email', password: 'Password (min. 6 characters)',
    submitLogin: 'Sign in', submitRegister: 'Create account', forgot: 'Forgot password?',
    resetSent: 'Password reset email sent', secure: 'Secured by Firebase Authentication',
    sub: 'Keep your progress synced across devices',
  },
  kk: {
    login: 'Кіру', register: 'Тіркелу', google: 'Google арқылы жалғастыру', or: 'немесе email арқылы',
    name: 'Аты', email: 'Email', password: 'Құпиясөз (кемінде 6 таңба)',
    submitLogin: 'Кіру', submitRegister: 'Аккаунт құру', forgot: 'Құпиясөзді ұмыттыңыз ба?',
    resetSent: 'Құпиясөзді қалпына келтіру хаты жіберілді', secure: 'Firebase Authentication қорғауымен',
    sub: 'Прогресті барлық құрылғыларда сақтаңыз',
  },
};

const ERRORS: Record<Lang, Record<string, string>> = {
  ru: {
    'auth/invalid-email': 'Некорректный email',
    'auth/email-already-in-use': 'Этот email уже зарегистрирован',
    'auth/weak-password': 'Пароль слишком короткий',
    'auth/invalid-credential': 'Неверный email или пароль',
    'auth/user-not-found': 'Пользователь не найден',
    'auth/wrong-password': 'Неверный пароль',
    'auth/too-many-requests': 'Слишком много попыток, попробуйте позже',
    'auth/popup-closed-by-user': 'Окно входа закрыто',
    'auth/popup-blocked': 'Браузер заблокировал окно входа',
    'auth/unauthorized-domain': 'Домен не разрешён в Firebase Console',
    'auth/operation-not-allowed': 'Способ входа не включён в Firebase Console',
    'auth/network-request-failed': 'Ошибка сети',
    default: 'Не удалось войти. Попробуйте ещё раз',
  },
  en: {
    'auth/invalid-email': 'Invalid email',
    'auth/email-already-in-use': 'This email is already registered',
    'auth/weak-password': 'Password is too short',
    'auth/invalid-credential': 'Wrong email or password',
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Wrong password',
    'auth/too-many-requests': 'Too many attempts, try again later',
    'auth/popup-closed-by-user': 'Sign-in window was closed',
    'auth/popup-blocked': 'The browser blocked the sign-in window',
    'auth/unauthorized-domain': 'Domain is not authorized in Firebase Console',
    'auth/operation-not-allowed': 'Sign-in method is not enabled in Firebase Console',
    'auth/network-request-failed': 'Network error',
    default: 'Sign-in failed. Please try again',
  },
  kk: {
    'auth/invalid-email': 'Email қате',
    'auth/email-already-in-use': 'Бұл email тіркелген',
    'auth/weak-password': 'Құпиясөз тым қысқа',
    'auth/invalid-credential': 'Email немесе құпиясөз қате',
    'auth/user-not-found': 'Пайдаланушы табылмады',
    'auth/wrong-password': 'Құпиясөз қате',
    'auth/too-many-requests': 'Тым көп әрекет, кейінірек көріңіз',
    'auth/popup-closed-by-user': 'Кіру терезесі жабылды',
    'auth/popup-blocked': 'Браузер кіру терезесін бұғаттады',
    'auth/unauthorized-domain': 'Домен Firebase Console-да рұқсат етілмеген',
    'auth/operation-not-allowed': 'Кіру әдісі Firebase Console-да қосылмаған',
    'auth/network-request-failed': 'Желі қатесі',
    default: 'Кіру сәтсіз аяқталды. Қайталап көріңіз',
  },
};

const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { lang, loginWithGoogle } = useApp();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const l: Lang = (lang as Lang) in TEXT ? (lang as Lang) : 'ru';
  const tx = TEXT[l];
  const errText = (err: any) => ERRORS[l][err?.code] || ERRORS[l].default;

  const finish = async (user: Awaited<ReturnType<typeof signInWithEmail>>) => {
    await loginWithGoogle(user);
    setPassword('');
    onClose();
  };

  const run = async (action: () => Promise<void>) => {
    soundEffects.click();
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);
    try {
      await action();
    } catch (err: any) {
      console.warn('Firebase auth error:', err?.code || err);
      setErrorMsg(errText(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => run(async () => finish(await signInWithGoogleFirebase()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const user = mode === 'register'
        ? await registerWithEmail(name, email, password)
        : await signInWithEmail(email, password);
      await finish(user);
    });
  };

  const handleReset = () => run(async () => {
    if (!email.trim()) throw { code: 'auth/invalid-email' };
    await resetPassword(email);
    setInfoMsg(tx.resetSent);
  });

  const inputCls = 'w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] focus:border-orange-400 focus:outline-none text-sm text-[var(--app-text)] placeholder:opacity-50';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="w-full max-w-sm liquid-glass-elevated p-6 rounded-3xl border border-[var(--app-glass-border)] shadow-2xl relative text-[var(--app-text)] space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => { soundEffects.click(); onClose(); }}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)] flex items-center justify-center opacity-70 hover:opacity-100 transition-all active:scale-90"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center pt-1">
          <h2 id="auth-modal-title" className="text-xl font-bold leading-tight">
            {mode === 'login' ? tx.login : tx.register}
          </h2>
          <p className="text-xs opacity-70 mt-1">{tx.sub}</p>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[var(--app-pill-glass-bg)] border border-[var(--app-glass-border)]">
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setErrorMsg(null); setInfoMsg(null); }}
              className={`py-2 rounded-xl text-xs font-semibold transition-all ${mode === m ? 'bg-orange-500 text-white shadow' : 'opacity-70 hover:opacity-100'}`}
            >
              {m === 'login' ? tx.login : tx.register}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md border border-neutral-300 disabled:opacity-50"
        >
          <GoogleIcon className="w-5 h-5 shrink-0" />
          <span>{tx.google}</span>
        </button>

        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider opacity-60">
          <div className="flex-1 h-px bg-[var(--app-glass-border)]" />
          <span>{tx.or}</span>
          <div className="flex-1 h-px bg-[var(--app-glass-border)]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
          {mode === 'register' && (
            <label className="relative block">
              <span className="sr-only">{tx.name}</span>
              <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input className={inputCls} placeholder={tx.name} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>
          )}
          <label className="relative block">
            <span className="sr-only">{tx.email}</span>
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input className={inputCls} type="email" placeholder={tx.email} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </label>
          <label className="relative block">
            <span className="sr-only">{tx.password}</span>
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              className={inputCls}
              type="password"
              placeholder={tx.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              minLength={6}
              required
            />
          </label>

          {errorMsg && (
            <p role="alert" className="text-[11px] text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-center">{errorMsg}</p>
          )}
          {infoMsg && (
            <p role="status" className="text-[11px] text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-center">{infoMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email || password.length < 6}
            className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : mode === 'login' ? tx.submitLogin : tx.submitRegister}
          </button>

          {mode === 'login' && (
            <button type="button" onClick={handleReset} disabled={loading} className="w-full text-[11px] opacity-70 hover:opacity-100 hover:text-orange-400">
              {tx.forgot}
            </button>
          )}
        </form>

        <div className="pt-2 border-t border-[var(--app-glass-border)] flex items-center justify-center gap-1.5 text-[10px] opacity-60">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{tx.secure}</span>
        </div>
      </div>
    </div>
  );
};
