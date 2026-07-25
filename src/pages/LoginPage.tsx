import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, User, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2,
  Globe, Sun, Moon, MapPin, Layers, Truck, Activity, TrendingUp, ChevronLeft,
  Building2, Trash2, AlertTriangle, Navigation, Sparkles, KeyRound, Crown,
  Fingerprint, Lock as LockIcon,
} from 'lucide-react';
import { useApp } from '@/store/appStore';
import { MOCK_USERS, type MockUser } from '@/lib/auth';
import type { Locale } from '@/i18n/translations';
import { cn } from '@/lib/cn';

const roleIcons: Record<string, React.ReactNode> = {
  admin: <ShieldCheck className="w-3.5 h-3.5" />,
  environment: <Trash2 className="w-3.5 h-3.5" />,
  municipality: <Building2 className="w-3.5 h-3.5" />,
  cet: <Truck className="w-3.5 h-3.5" />,
  wali: <Crown className="w-3.5 h-3.5" />,
};

const floatingIcons = [
  { icon: <MapPin className="w-5 h-5" />, x: '8%', y: '15%', delay: 0 },
  { icon: <Layers className="w-6 h-6" />, x: '82%', y: '22%', delay: 0.5 },
  { icon: <Truck className="w-5 h-5" />, x: '15%', y: '72%', delay: 1 },
  { icon: <Activity className="w-5 h-5" />, x: '88%', y: '65%', delay: 1.5 },
  { icon: <AlertTriangle className="w-5 h-5" />, x: '70%', y: '85%', delay: 2 },
  { icon: <Navigation className="w-5 h-5" />, x: '25%', y: '40%', delay: 0.8 },
  { icon: <Sparkles className="w-4 h-4" />, x: '50%', y: '12%', delay: 1.2 },
  { icon: <KeyRound className="w-4 h-4" />, x: '40%', y: '88%', delay: 1.8 },
];

const statsCards = [
  { icon: <Layers className="w-5 h-5" />, value: '19', labelKey: 'activeLayers', color: 'from-brand-500 to-brand-700', trend: '+3' },
  { icon: <MapPin className="w-5 h-5" />, value: '1,247', labelKey: 'monitoredPoints', color: 'from-success-500 to-accent-600', trend: '+12' },
  { icon: <TrendingUp className="w-5 h-5" />, value: '87%', labelKey: 'coverageRate', color: 'from-accent-500 to-accent-700', trend: '+5%' },
  { icon: <Truck className="w-5 h-5" />, value: '34', labelKey: 'fleetVehicles', color: 'from-warning-500 to-warning-700', trend: '+2' },
];

export function LoginPage() {
  const { t, locale, setLocale, theme, toggleTheme, login, isAuthenticated, touchActivity } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  // Apply theme + dir on this standalone page
  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle('dark', theme === 'dark');
    html.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', locale);
  }, [theme, locale]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => navigate('/'), 800);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  // Focus username on mount
  useEffect(() => {
    setTimeout(() => usernameRef.current?.focus(), 400);
  }, []);

  // Track activity for inactivity countdown
  useEffect(() => {
    const handler = () => touchActivity();
    window.addEventListener('mousemove', handler);
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('mousemove', handler);
      window.removeEventListener('keydown', handler);
    };
  }, [touchActivity]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError(t('invalidCredentials'));
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const ok = login(username.trim(), password);
      setLoading(false);
      if (ok) {
        setSuccess(true);
        setTimeout(() => navigate('/'), 900);
      } else {
        setError(t('invalidCredentials'));
        setPassword('');
      }
    }, 1100);
  }, [username, password, login, t, navigate]);

  const fillDemo = (user: MockUser) => {
    setUsername(user.username);
    setPassword(user.password);
    setError(null);
    usernameRef.current?.focus();
  };

  const langs: { code: Locale; label: string; short: string }[] = [
    { code: 'ar', label: 'العربية', short: 'AR' },
    { code: 'fr', label: 'Français', short: 'FR' },
    { code: 'en', label: 'English', short: 'EN' },
  ];

  return (
    <div className="min-h-screen flex bg-ink-50 dark:bg-ink-950 overflow-hidden">
      {/* ============ LEFT SIDE — Animated map + branding ============ */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] relative overflow-hidden">
        {/* Satellite map background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-ink-950" />
          {/* Simulated satellite map grid */}
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(74,143,203,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(74,143,203,0.3) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
          {/* Terrain blobs */}
          <motion.div
            className="absolute rounded-full bg-success-500/15 blur-3xl"
            style={{ width: 400, height: 400, top: '10%', left: '5%' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute rounded-full bg-accent-500/15 blur-3xl"
            style={{ width: 350, height: 350, bottom: '15%', right: '10%' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.div
            className="absolute rounded-full bg-warning-500/10 blur-3xl"
            style={{ width: 300, height: 300, top: '45%', left: '40%' }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />

          {/* Animated route lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
            <motion.path
              d="M0,200 Q300,150 500,300 T1000,250"
              stroke="rgba(74,143,203,0.5)" strokeWidth="2" fill="none" strokeDasharray="8 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
            />
            <motion.path
              d="M100,0 Q200,300 400,500 T700,800"
              stroke="rgba(22,163,74,0.4)" strokeWidth="2" fill="none" strokeDasharray="6 6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', delay: 0.5 }}
            />
          </svg>

          {/* Floating GIS icons */}
          {floatingIcons.map((fi, i) => (
            <motion.div
              key={i}
              className="absolute text-brand-200/40"
              style={{ left: fi.x, top: fi.y }}
              animate={{ y: [0, -12, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: fi.delay }}
            >
              {fi.icon}
            </motion.div>
          ))}

          {/* Scanning beam */}
          <motion.div
            className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-brand-300/10 to-transparent"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Glass overlay content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Top: Government branding */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-gov ring-4 ring-white/10">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{t('loginEnterpriseName')}</h1>
                <p className="text-sm text-brand-200 mt-0.5">{t('loginEnterpriseTagline')}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-8 space-y-2"
            >
              <p className="text-3xl font-bold text-white leading-tight" style={{ fontFamily: 'IBM Plex Sans Arabic, Inter, sans-serif' }}>
                {t('loginSubtitle')}
              </p>
              <p className="text-lg text-brand-200/80 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                Plateforme SIG Intelligente de Gestion de la Propreté Urbaine
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs text-brand-100 font-medium border border-white/10">
                  {t('governmentPortal')}
                </span>
                <span className="px-3 py-1 rounded-full bg-success-500/20 backdrop-blur-md text-xs text-success-200 font-medium border border-success-400/20 flex items-center gap-1.5">
                  <Fingerprint className="w-3 h-3" /> {t('secureLogin')}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Middle: Animated stats cards */}
          <div className="grid grid-cols-2 gap-4 max-w-lg my-8">
            {statsCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="glass rounded-xl2 p-4 border border-white/10 hover:border-white/20 transition group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-soft', card.color)}>
                    {card.icon}
                  </div>
                  <span className="text-[10px] font-bold text-success-300 bg-success-500/10 px-1.5 py-0.5 rounded-full">{card.trend}</span>
                </div>
                <p className="text-2xl font-bold text-white tabular-nums">{card.value}</p>
                <p className="text-xs text-brand-200/70 mt-0.5">{t(card.labelKey)}</p>
                <motion.div
                  className="mt-2 h-0.5 rounded-full bg-gradient-to-r from-brand-400/0 via-brand-400/50 to-brand-400/0"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                />
              </motion.div>
            ))}
          </div>

          {/* Bottom: Government identity */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2 text-brand-200/60">
              <Building2 className="w-4 h-4" />
              <p className="text-xs">{t('loginGovLabel')}</p>
            </div>
            <p className="text-[11px] text-brand-300/40">{t('loginDescription')}</p>
          </motion.div>
        </div>
      </div>

      {/* ============ RIGHT SIDE — Login card ============ */}
      <div className="flex-1 flex flex-col relative">
        {/* Top bar: language + theme */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-gov">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink-900 dark:text-white">{t('loginEnterpriseName')}</p>
              <p className="text-[10px] text-brand-600 dark:text-brand-400">{t('loginEnterpriseTagline')}</p>
            </div>
          </div>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-2">
            {/* Language switch */}
            <div className="glass-strong rounded-xl p-1 flex items-center gap-0.5">
              {langs.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLocale(l.code)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg text-xs font-semibold transition',
                    locale === l.code
                      ? 'bg-brand-500 text-white shadow-soft'
                      : 'text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800',
                  )}
                  title={l.label}
                >
                  {l.short}
                </button>
              ))}
            </div>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="glass-strong rounded-xl p-2.5 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition"
              title={theme === 'light' ? t('darkMode') : t('lightMode')}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Login form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 items-center justify-center shadow-gov mb-4"
              >
                <ShieldCheck className="w-7 h-7 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-ink-900 dark:text-white">{t('loginTitle')}</h2>
              <p className="text-sm text-ink-500 dark:text-ink-400 mt-1.5">{t('welcomeBack')}</p>
            </div>

            {/* Login card */}
            <div className="glass-strong rounded-xl3 shadow-lifted p-6 sm:p-8 border border-ink-200/70 dark:border-ink-800/70">
              {/* Error notification */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-danger-50 dark:bg-danger-600/10 border border-danger-200 dark:border-danger-600/30 text-danger-700 dark:text-danger-300 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success notification */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-success-50 dark:bg-success-600/10 border border-success-200 dark:border-success-600/30 text-success-700 dark:text-success-300 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{t('loginSuccess')}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold text-ink-600 dark:text-ink-300 mb-1.5">{t('username')}</label>
                  <div className={cn(
                    'relative flex items-center rounded-xl border transition-all',
                    focusedField === 'username'
                      ? 'border-brand-500 ring-2 ring-brand-500/20 bg-white dark:bg-ink-900'
                      : 'border-ink-200 dark:border-ink-700 bg-ink-50/50 dark:bg-ink-800/40',
                  )}>
                    <span className={cn('absolute left-3.5 transition', focusedField === 'username' ? 'text-brand-500' : 'text-ink-400')}>
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      ref={usernameRef}
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      placeholder={t('usernamePlaceholder')}
                      autoComplete="username"
                      className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-ink-900 dark:text-ink-100 placeholder-ink-400 outline-none"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-ink-600 dark:text-ink-300 mb-1.5">{t('password')}</label>
                  <div className={cn(
                    'relative flex items-center rounded-xl border transition-all',
                    focusedField === 'password'
                      ? 'border-brand-500 ring-2 ring-brand-500/20 bg-white dark:bg-ink-900'
                      : 'border-ink-200 dark:border-ink-700 bg-ink-50/50 dark:bg-ink-800/40',
                  )}>
                    <span className={cn('absolute left-3.5 transition', focusedField === 'password' ? 'text-brand-500' : 'text-ink-400')}>
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder={t('passwordPlaceholder')}
                      autoComplete="current-password"
                      className="w-full bg-transparent pl-10 pr-11 py-3 text-sm text-ink-900 dark:text-ink-100 placeholder-ink-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? t('hidePassword') : t('showPassword')}
                      className="absolute right-3 p-1 text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me + forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={cn(
                      'w-4 h-4 rounded-md border-2 flex items-center justify-center transition',
                      remember ? 'bg-brand-500 border-brand-500' : 'border-ink-300 dark:border-ink-600 group-hover:border-brand-400',
                    )}>
                      {remember && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="sr-only" />
                    <span className="text-xs text-ink-600 dark:text-ink-300">{t('rememberMe')}</span>
                  </label>
                  <button type="button" className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">
                    {locale === 'ar' ? 'نسيت كلمة المرور؟' : locale === 'fr' ? 'Mot de passe oublié?' : 'Forgot password?'}
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || success}
                  className={cn(
                    'w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-bold transition-all duration-200',
                    loading || success
                      ? 'bg-brand-400 text-white/80 cursor-wait'
                      : 'bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:from-brand-700 hover:to-brand-600 shadow-gov hover:shadow-lifted active:scale-[0.98]',
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('signingIn')}</span>
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('loginSuccess')}</span>
                    </>
                  ) : (
                    <>
                      <LockIcon className="w-4 h-4" />
                      <span>{t('signIn')}</span>
                      <ChevronLeft className={cn('w-4 h-4 transition', locale === 'ar' && 'rotate-180')} />
                    </>
                  )}
                </button>
              </form>

              {/* Security badge */}
              <div className="mt-5 pt-5 border-t border-ink-200/60 dark:border-ink-800/60 flex items-center justify-center gap-2 text-[11px] text-ink-400 dark:text-ink-500">
                <Fingerprint className="w-3.5 h-3.5" />
                <span>{t('secureLogin')} · {t('governmentPortal')}</span>
              </div>
            </div>

            {/* Demo accounts */}
            <div className="mt-6">
              <p className="text-center text-xs text-ink-400 dark:text-ink-500 mb-3 flex items-center justify-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                {t('demoAccounts')} · {locale === 'ar' ? 'كلمة المرور: admin' : locale === 'fr' ? 'Mot de passe: admin' : 'Password: admin'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MOCK_USERS.map((user) => (
                  <button
                    key={user.username}
                    onClick={() => fillDemo(user)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 hover:border-brand-300 dark:hover:border-brand-600/50 hover:bg-brand-50/50 dark:hover:bg-brand-600/5 transition group text-right"
                  >
                    <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shrink-0', user.avatarColor)}>
                      {user.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink-700 dark:text-ink-200 truncate">
                        {locale === 'ar' ? user.nameAr : locale === 'fr' ? user.nameFr : user.name}
                      </p>
                      <p className="text-[10px] text-ink-400 truncate">@{user.username}</p>
                    </div>
                    <span className={cn(
                      'shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1',
                      user.readonly
                        ? 'bg-warning-100 text-warning-700 dark:bg-warning-600/20 dark:text-warning-300'
                        : 'bg-brand-100 text-brand-700 dark:bg-brand-600/20 dark:text-brand-300',
                    )}>
                      {roleIcons[user.role]}
                      {user.readonly ? t('readOnly') : t('fullAccess')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-center">
          <p className="text-[11px] text-ink-400 dark:text-ink-500">
            {t('govFooter')} © 2026 · {t('loginGovLabel')}
          </p>
        </div>
      </div>
    </div>
  );
}
