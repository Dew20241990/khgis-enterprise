import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { CommandPalette } from './CommandPalette';
import { ToastContainer } from '@/components/ui/Toast';
import { useApp } from '@/store/appStore';

export function AppLayout({ children }: { children: ReactNode }) {
  const { theme, locale, t } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (typeof document !== 'undefined') {
    const html = document.documentElement;
    html.classList.toggle('dark', theme === 'dark');
    html.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', locale);
  }

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 text-ink-900 dark:text-ink-100">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          <TopBar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto animate-fade-in">
            {children}
          </main>
          <footer className="px-6 py-4 text-center text-xs text-ink-400 dark:text-ink-500 border-t border-ink-200/60 dark:border-ink-800/60">
            {t('govFooter')} © 2026
          </footer>
        </div>
      </div>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CommandPalette />
      <ToastContainer />
    </div>
  );
}
