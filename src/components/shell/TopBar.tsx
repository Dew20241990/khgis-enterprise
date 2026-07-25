import { NavLink, useLocation } from 'react-router-dom';
import { Menu, Search, Sparkles, ChevronLeft } from 'lucide-react';
import { useApp } from '@/store/appStore';
import { NotificationCenter } from './NotificationCenter';
import { UserMenu } from './UserMenu';
import { cn } from '@/lib/cn';

const routeLabels: Record<string, string> = {
  '/': 'dashboard', '/gis': 'gisMap', '/municipalities': 'municipalities',
  '/neighborhoods': 'neighborhoods', '/black-spots': 'blackSpots',
  '/illegal-dumping': 'illegalDumping', '/containers': 'wasteContainers',
  '/shops': 'commercialViolations', '/inspections': 'inspectionTours',
  '/routes': 'cleaningOperations', '/work-orders': 'workOrders',
  '/vehicles': 'vehicles', '/drivers': 'drivers', '/truck-tracking': 'truckTracking',
  '/cet-centers': 'cetCenters', '/contractors': 'contractors',
  '/complaints': 'publicComplaints', '/reports': 'reports', '/analytics': 'analytics',
  '/statistics': 'statistics', '/documents': 'documents',
  '/users': 'users', '/roles': 'roles', '/permissions': 'permissions',
  '/audit-logs': 'auditLogs', '/ai-assistant': 'aiAssistant', '/settings': 'settings',
  // Legacy compat
  '/districts': 'districts', '/municipality': 'municipality', '/tasks': 'tasks',
};

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { t, setCommandOpen } = useApp();
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const currentKey = location.pathname === '/' ? '/' : '/' + segments[0];
  const label = t(routeLabels[currentKey] ?? 'dashboard');

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center gap-3 px-4 lg:px-6 border-b border-ink-200 dark:border-ink-800 bg-white/80 dark:bg-ink-900/80 backdrop-blur-xl">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
        <Menu className="w-5 h-5" />
      </button>

      <nav className="hidden md:flex items-center gap-1.5 text-sm min-w-0">
        <NavLink to="/" className="text-ink-400 dark:text-ink-500 hover:text-ink-600 dark:hover:text-ink-300 transition">{t('dashboard')}</NavLink>
        {segments.length > 0 && (
          <>
            <ChevronLeft className="w-3.5 h-3.5 text-ink-300 dark:text-ink-600" />
            <span className="text-ink-800 dark:text-ink-100 font-medium truncate">{label}</span>
          </>
        )}
      </nav>

      <div className="flex-1" />

      <button
        onClick={() => setCommandOpen(true)}
        className="hidden sm:flex items-center gap-2.5 h-9 w-64 lg:w-72 px-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50/60 dark:bg-ink-800/40 text-sm text-ink-400 hover:border-brand-300 dark:hover:border-brand-600/40 transition"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-right">{t('search')}</span>
        <kbd className="text-[10px] font-medium bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 px-1.5 py-0.5 rounded">Ctrl K</kbd>
      </button>

      <button
        onClick={() => setCommandOpen(true)}
        className="sm:hidden p-2 rounded-xl text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition"
      >
        <Search className="w-5 h-5" />
      </button>

      <NavLink
        to="/ai-assistant"
        className={cn('hidden md:flex items-center gap-2 h-9 px-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-success-600 hover:opacity-90 transition shadow-soft')}
      >
        <Sparkles className="w-4 h-4" /> {t('aiAssistant')}
      </NavLink>

      <NotificationCenter />
      <UserMenu />
    </header>
  );
}
