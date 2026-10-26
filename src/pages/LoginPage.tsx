import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, ArrowRight, Eye, EyeOff, KeyRound, Layers, Leaf, Lock, Moon, Sun, Truck, User, ClipboardCheck, FlaskConical } from 'lucide-react';
import { useApp } from '@/store/appStore';
import { DEMO_MODE, MOCK_USERS, type MockUser } from '@/lib/auth';
import { directionFor } from '@/lib/documentSettings';
import type { Locale } from '@/i18n/translations';
import { cn } from '@/lib/cn';

const LANGS: { code: Locale; label: string; short: string }[] = [
  { code: 'ar', label: 'العربية', short: 'ع' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'en', label: 'English', short: 'EN' },
];

const FEATURES = [
  { icon: Layers, key: 'loginFeatMap' },
  { icon: ClipboardCheck, key: 'loginFeatOps' },
  { icon: Truck, key: 'loginFeatFleet' },
] as const;

/** Decorative contour lines; purely visual, hidden from assistive technology. */
function Contours() {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-[0.16]" viewBox="0 0 800 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white">
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M-40 ${120 + i * 62} C 160 ${60 + i * 58}, 300 ${200 + i * 60}, 460 ${130 + i * 62} S 760 ${70 + i * 60}, 860 ${150 + i * 62}`} />
        ))}
      </g>
    </svg>
  );
}

export function LoginPage() {
  const { t, locale, setLocale, theme, toggleTheme, login, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const ids = { user: useId(), pass: useId(), err: useId() };
  const userRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRtl = directionFor(locale) === 'rtl';

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => { userRef.current?.focus(); }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError(t('invalidCredentials'));
      return;
    }
    if (!login(username.trim(), password)) {
      setError(t('invalidCredentials'));
      setPassword('');
    }
  };

  const fillDemo = (user: MockUser) => {
    setUsername(user.username);
    setPassword(user.password);
    setError(null);
  };

  const displayName = (u: MockUser) => (locale === 'ar' ? u.nameAr : locale === 'fr' ? u.nameFr : u.name);
  const fade = (delay: number) => (reduceMotion ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay } });
  const field = 'w-full h-12 rounded-xl border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm text-ink-900 dark:text-ink-100 placeholder:text-ink-400 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-ink-50 dark:bg-ink-950 text-ink-900 dark:text-ink-100">
      {/* Brand panel */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-ink-950 text-white lg:w-[52%] lg:min-h-screen" aria-labelledby="brand-title">
        <Contours />
        <div className="absolute -bottom-32 -end-24 h-96 w-96 rounded-full bg-success-500/20 blur-3xl" aria-hidden="true" />
        <div className="relative z-10 flex h-full flex-col justify-between gap-10 p-6 sm:p-10 xl:p-14">
          <motion.div {...fade(0)} className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/12 ring-1 ring-white/25 backdrop-blur">
              <Leaf className="h-6 w-6 text-success-300" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <p id="brand-title" className="text-xl font-bold tracking-tight">{t('loginEnterpriseName')}</p>
              <p className="text-xs text-brand-100/80">{t('loginGovLabel')}</p>
            </div>
          </motion.div>

          <div className="hidden lg:block max-w-xl">
            <motion.h1 {...fade(0.1)} className="text-4xl xl:text-5xl font-bold leading-[1.25] tracking-tight">{t('loginSubtitle')}</motion.h1>
            <motion.p {...fade(0.18)} className="mt-4 text-base text-brand-100/85 leading-relaxed">{t('loginDescription')}</motion.p>
            <ul className="mt-8 space-y-3">
              {FEATURES.map(({ icon: Icon, key }, i) => (
                <motion.li key={key} {...fade(0.26 + i * 0.08)} className="flex items-center gap-3 rounded-xl bg-white/8 px-4 py-3 ring-1 ring-white/15 backdrop-blur-sm">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/12"><Icon className="h-[18px] w-[18px] text-success-300" aria-hidden="true" /></span>
                  <span className="text-sm text-white/95">{t(key)}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <p className="hidden lg:block text-xs text-brand-100/60">{t('govFooter')} © 2026</p>
        </div>
      </section>

      {/* Form panel */}
      <main className="relative flex flex-1 flex-col">
        <div className="flex items-center justify-end gap-2 p-4 sm:p-6">
          <div role="group" aria-label={t('language')} className="flex items-center gap-0.5 rounded-xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-1">
            {LANGS.map((l) => (
              <button key={l.code} type="button" onClick={() => setLocale(l.code)} aria-pressed={locale === l.code} title={l.label}
                className={cn('h-9 min-w-[2.5rem] rounded-lg px-2.5 text-xs font-semibold transition',
                  locale === l.code ? 'bg-brand-600 text-white' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800')}>
                {l.short}
              </button>
            ))}
          </div>
          <button type="button" onClick={toggleTheme} aria-label={theme === 'light' ? t('darkMode') : t('lightMode')} title={theme === 'light' ? t('darkMode') : t('lightMode')}
            className="grid h-11 w-11 place-items-center rounded-xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
            {theme === 'light' ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-10 sm:px-6">
          <motion.div {...fade(0.05)} className="w-full max-w-md">
            <h2 className="text-3xl font-bold tracking-tight">{t('loginTitle')}</h2>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">{t('welcomeBack')}</p>

            {DEMO_MODE && (
              <div role="note" className="mt-5 flex items-start gap-2.5 rounded-xl bg-warning-50 dark:bg-warning-600/10 px-3.5 py-3 text-xs leading-relaxed text-warning-800 dark:text-warning-200">
                <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{t('loginDemoNotice')}</span>
              </div>
            )}

            <form onSubmit={submit} noValidate className="mt-6 space-y-5">
              {error && (
                <div id={ids.err} role="alert" className="flex items-center gap-2.5 rounded-xl border border-danger-200 dark:border-danger-600/30 bg-danger-50 dark:bg-danger-600/10 px-3.5 py-3 text-sm text-danger-700 dark:text-danger-300">
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor={ids.user} className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">{t('username')}</label>
                <div className="relative">
                  <User className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                  <input id={ids.user} ref={userRef} value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('usernamePlaceholder')}
                    autoComplete="username" autoCapitalize="none" spellCheck={false} aria-invalid={error ? true : undefined} aria-describedby={error ? ids.err : undefined}
                    className={cn(field, 'ps-10 pe-4')} />
                </div>
              </div>

              <div>
                <label htmlFor={ids.pass} className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">{t('password')}</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                  <input id={ids.pass} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('passwordPlaceholder')}
                    autoComplete="current-password" aria-invalid={error ? true : undefined} aria-describedby={error ? ids.err : undefined}
                    className={cn(field, 'ps-10 pe-12')} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? t('hidePassword') : t('showPassword')} aria-pressed={showPassword}
                    className="absolute end-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
                    {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <button type="submit"
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-gov transition hover:bg-brand-700 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30">
                <span>{t('signIn')}</span>
                <ArrowRight className={cn('h-4 w-4 transition-transform', isRtl ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5')} aria-hidden="true" />
              </button>

              <p className="text-center text-xs text-ink-500 dark:text-ink-400">{t('loginForgotHint')}</p>
            </form>

            {DEMO_MODE && (
              <section className="mt-8" aria-labelledby="demo-title">
                <h3 id="demo-title" className="mb-2.5 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-ink-500 dark:text-ink-400">
                  <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('demoAccounts')} · {t('loginDemoPassword')}: <code className="rounded bg-ink-100 dark:bg-ink-800 px-1.5 py-0.5 font-mono">admin</code>
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {MOCK_USERS.map((u) => (
                    <button key={u.username} type="button" onClick={() => fillDemo(u)}
                      className="flex items-center gap-2.5 rounded-xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 px-3 py-2.5 text-start transition hover:border-brand-400 hover:bg-brand-50/60 dark:hover:bg-brand-600/10">
                      <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-xs font-bold text-white', u.avatarColor)}>{u.initials}</span>
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate text-xs font-semibold text-ink-800 dark:text-ink-100">{displayName(u)}</span>
                        <span className="block truncate text-[11px] text-ink-500 dark:text-ink-400" dir="ltr">@{u.username}</span>
                        <span className="block text-[11px] text-ink-500 dark:text-ink-400">{u.readonly ? t('readOnly') : t('fullAccess')}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        </div>

        <p className="px-6 pb-5 text-center text-[11px] text-ink-500 dark:text-ink-400 lg:hidden">{t('govFooter')} © 2026</p>
      </main>
    </div>
  );
}
