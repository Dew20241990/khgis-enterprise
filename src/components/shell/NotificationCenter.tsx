import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useApp } from '@/store/appStore';
import { alerts as initialAlerts } from '@/data/mockData';
import { cn } from '@/lib/cn';

export function NotificationCenter() {
  const { notifOpen, setNotifOpen, t } = useApp();
  const [items, setItems] = useState(initialAlerts);
  const ref = useRef<HTMLDivElement>(null);

  const unread = items.filter((a) => !a.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setNotifOpen]);

  const markAll = () => setItems((p) => p.map((a) => ({ ...a, read: true })));
  const toggle = (id: string) => setItems((p) => p.map((a) => (a.id === id ? { ...a, read: !a.read } : a)));

  const icon = (level: string) => {
    const cls = 'w-5 h-5';
    if (level === 'critical') return <AlertCircle className={cn(cls, 'text-danger-500')} />;
    if (level === 'warning') return <AlertTriangle className={cn(cls, 'text-warning-500')} />;
    return <Info className={cn(cls, 'text-brand-500')} />;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setNotifOpen(!notifOpen)}
        className="relative p-2 rounded-xl text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-danger-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-ink-900">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {notifOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 mt-2 w-[380px] glass-strong rounded-xl2 shadow-lifted z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-200/70 dark:border-ink-800/70">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-ink-900 dark:text-white">{t('notifications')}</h3>
                {unread > 0 && <span className="chip bg-danger-50 text-danger-600 dark:bg-danger-600/15 dark:text-danger-300">{unread} جديد</span>}
              </div>
              <button onClick={markAll} className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> تعليم الكل كمقروء
              </button>
            </div>
            <div className="max-h-[420px] overflow-y-auto">
              {items.map((a) => (
                <button
                  key={a.id}
                  onClick={() => toggle(a.id)}
                  className={cn(
                    'w-full flex gap-3 px-4 py-3 text-right border-b border-ink-100 dark:border-ink-800/60 hover:bg-ink-50 dark:hover:bg-ink-800/40 transition',
                    !a.read && 'bg-brand-50/40 dark:bg-brand-600/5',
                  )}
                >
                  <div className="shrink-0 mt-0.5">{icon(a.level)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-ink-800 dark:text-ink-100 truncate">{a.title}</p>
                      {!a.read && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 line-clamp-2">{a.message}</p>
                    <p className="text-[11px] text-ink-400 dark:text-ink-500 mt-1">{a.time}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-ink-200/70 dark:border-ink-800/70">
              <button className="w-full text-center text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline">عرض كل الإشعارات</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
