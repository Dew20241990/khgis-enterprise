import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, User, Settings, LogOut, Moon, Sun, Globe, Check, ShieldCheck, Lock } from 'lucide-react';
import { useApp } from '@/store/appStore';
import type { Locale } from '@/i18n/translations';
import { cn } from '@/lib/cn';

export function UserMenu() {
  const { theme, toggleTheme, locale, setLocale, t, user, logout } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setLangOpen(false); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const langs: { code: Locale; label: string; flag: string }[] = [
    { code: 'ar', label: 'العربية', flag: '🇩🇿' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/login');
  };

  const displayName = user ? (locale === 'ar' ? user.nameAr : locale === 'fr' ? user.nameFr : user.name) : '';
  const displayRole = user ? (locale === 'ar' ? user.roleLabelAr : locale === 'fr' ? user.roleLabelFr : user.roleLabel) : '';
  const displayDept = user ? (locale === 'ar' ? user.departmentAr : user.department) : '';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 p-1 pr-2 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 transition"
      >
        <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shrink-0', user?.avatarColor ?? 'from-brand-500 to-success-500')}>
          {user?.initials ?? '؟'}
        </div>
        <div className="hidden md:block text-right leading-tight">
          <p className="text-xs font-semibold text-ink-800 dark:text-ink-100">{displayName}</p>
          <p className="text-[11px] text-ink-500 dark:text-ink-400">{displayRole}</p>
        </div>
        <ChevronDown className="w-4 h-4 text-ink-400" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 mt-2 w-64 glass-strong rounded-xl2 shadow-lifted z-50 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-4 border-b border-ink-200/70 dark:border-ink-800/70">
              <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-base font-bold', user?.avatarColor ?? 'from-brand-500 to-success-500')}>{user?.initials ?? '؟'}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900 dark:text-white truncate">{displayName}</p>
                <p className="text-xs text-ink-500 dark:text-ink-400 truncate">{user?.email ?? ''}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-600/15 text-[10px] font-semibold text-brand-700 dark:text-brand-300">
                    <ShieldCheck className="w-2.5 h-2.5" /> {displayRole}
                  </span>
                  {user?.readonly && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-warning-50 dark:bg-warning-600/15 text-[10px] font-semibold text-warning-700 dark:text-warning-300">
                      <Lock className="w-2.5 h-2.5" /> {t('readOnly')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-2">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
                <User className="w-4 h-4 text-ink-500" /> {t('profile')}
              </button>
              <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
                {theme === 'light' ? <Moon className="w-4 h-4 text-ink-500" /> : <Sun className="w-4 h-4 text-ink-500" />}
                {theme === 'light' ? t('darkMode') : t('lightMode')}
              </button>

              <div className="relative">
                <button onClick={() => setLangOpen(!langOpen)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
                  <Globe className="w-4 h-4 text-ink-500" /> {t('language')}
                  <ChevronDown className="w-3.5 h-3.5 mr-auto text-ink-400" />
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      {langs.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => { setLocale(l.code); setLangOpen(false); }}
                          className={cn('w-full flex items-center gap-2.5 pr-9 pl-3 py-2 rounded-lg text-sm hover:bg-ink-100 dark:hover:bg-ink-800 transition', locale === l.code ? 'text-brand-600 dark:text-brand-400 font-medium' : 'text-ink-600 dark:text-ink-300')}
                        >
                          <span>{l.flag}</span> {l.label}
                          {locale === l.code && <Check className="w-3.5 h-3.5 mr-auto" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
                <Settings className="w-4 h-4 text-ink-500" /> {t('settings')}
              </button>
              <div className="my-1 h-px bg-ink-200/70 dark:bg-ink-800/70" />
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-600/10 transition">
                <LogOut className="w-4 h-4" /> {t('logout')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
