/**
 * Toast notification system — success, warning, error, info toasts with auto-dismiss.
 */

import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type ToastType = 'success' | 'warning' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    const duration = toast.duration ?? 4000;
    if (duration > 0) setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), duration);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (title: string, message?: string) => useToastStore.getState().add({ type: 'success', title, message }),
  warning: (title: string, message?: string) => useToastStore.getState().add({ type: 'warning', title, message }),
  error: (title: string, message?: string) => useToastStore.getState().add({ type: 'error', title, message, duration: 6000 }),
  info: (title: string, message?: string) => useToastStore.getState().add({ type: 'info', title, message }),
};

const config: Record<ToastType, { icon: React.ReactNode; bg: string; text: string; border: string }> = {
  success: { icon: <CheckCircle2 className="w-5 h-5" />, bg: 'bg-success-50 dark:bg-success-600/15', text: 'text-success-700 dark:text-success-300', border: 'border-success-200 dark:border-success-600/30' },
  warning: { icon: <AlertTriangle className="w-5 h-5" />, bg: 'bg-warning-50 dark:bg-warning-600/15', text: 'text-warning-700 dark:text-warning-300', border: 'border-warning-200 dark:border-warning-600/30' },
  error: { icon: <XCircle className="w-5 h-5" />, bg: 'bg-danger-50 dark:bg-danger-600/15', text: 'text-danger-700 dark:text-danger-300', border: 'border-danger-200 dark:border-danger-600/30' },
  info: { icon: <Info className="w-5 h-5" />, bg: 'bg-sky-50 dark:bg-sky-600/15', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-600/30' },
};

export function ToastContainer() {
  const { toasts, remove } = useToastStore();
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-full max-w-sm px-4">
      <AnimatePresence>
        {toasts.map((t) => {
          const c = config[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={cn('flex items-start gap-3 p-3.5 rounded-xl border shadow-lifted glass-strong', c.bg, c.border)}
            >
              <span className={cn('shrink-0', c.text)}>{c.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-semibold', c.text)}>{t.title}</p>
                {t.message && <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{t.message}</p>}
              </div>
              <button onClick={() => remove(t.id)} className="p-0.5 rounded text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
