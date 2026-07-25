import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/store/appStore';

interface CmdItem { id: string; label: string; path: string; group: string }

const navPaths: [string, string][] = [
  ['/', 'dashboard'], ['/gis', 'gisMap'], ['/municipalities', 'municipalities'],
  ['/neighborhoods', 'neighborhoods'], ['/black-spots', 'blackSpots'],
  ['/illegal-dumping', 'illegalDumping'], ['/containers', 'wasteContainers'],
  ['/shops', 'commercialViolations'], ['/inspections', 'inspectionTours'],
  ['/routes', 'cleaningOperations'], ['/work-orders', 'workOrders'],
  ['/vehicles', 'vehicles'], ['/drivers', 'drivers'], ['/truck-tracking', 'truckTracking'],
  ['/cet-centers', 'cetCenters'], ['/contractors', 'contractors'],
  ['/complaints', 'publicComplaints'], ['/reports', 'reports'], ['/analytics', 'analytics'],
  ['/statistics', 'statistics'], ['/documents', 'documents'],
  ['/users', 'users'], ['/roles', 'roles'], ['/permissions', 'permissions'],
  ['/audit-logs', 'auditLogs'], ['/ai-assistant', 'aiAssistant'], ['/settings', 'settings'],
];

export function CommandPalette() {
  const { commandOpen, setCommandOpen, t } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const items: CmdItem[] = navPaths.map(([path, key]) => ({ id: path, label: t(key), path, group: t('overview') }));

  const filtered = items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setCommandOpen(!commandOpen); }
      if (e.key === 'Escape') setCommandOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandOpen, setCommandOpen]);

  const go = (path: string) => { navigate(path); setCommandOpen(false); setQuery(''); };

  return createPortal(
    <AnimatePresence>
      {commandOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={() => setCommandOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-xl glass-strong rounded-xl3 shadow-lifted overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-ink-200/70 dark:border-ink-800/70">
              <Search className="w-5 h-5 text-ink-400" />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="flex-1 bg-transparent outline-none text-sm text-ink-900 dark:text-white placeholder-ink-400" />
              <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-ink-400 bg-ink-100 dark:bg-ink-800 px-1.5 py-0.5 rounded">
                <Command className="w-3 h-3" />K
              </kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-ink-400">{t('noResults')}</p>
              ) : (
                filtered.map((item) => (
                  <button key={item.id} onClick={() => go(item.path)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-ink-700 dark:text-ink-200 hover:bg-brand-50 dark:hover:bg-brand-600/10 transition">
                    <span>{item.label}</span>
                    <span className="text-xs text-ink-400">{item.group}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
