/**
 * ConfirmDialog — reusable confirmation dialog for destructive/important actions.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'warning' | 'brand';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open, title, message, confirmLabel = 'تأكيد', cancelLabel = 'إلغاء',
  tone = 'danger', onConfirm, onCancel,
}: ConfirmDialogProps) {
  const toneClass = {
    danger: 'bg-danger-500 hover:bg-danger-600',
    warning: 'bg-warning-500 hover:bg-warning-600',
    brand: 'bg-brand-500 hover:bg-brand-600',
  }[tone];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="relative w-full max-w-sm glass-strong rounded-xl3 shadow-lifted overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  tone === 'danger' ? 'bg-danger-100 text-danger-600 dark:bg-danger-600/20 dark:text-danger-300'
                  : tone === 'warning' ? 'bg-warning-100 text-warning-600 dark:bg-warning-600/20 dark:text-warning-300'
                  : 'bg-brand-100 text-brand-600 dark:bg-brand-600/20 dark:text-brand-300'
                )}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-ink-900 dark:text-white">{title}</h3>
                  <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">{message}</p>
                </div>
                <button onClick={onCancel} className="p-1 rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-ink-200/70 dark:border-ink-800/70">
              <button onClick={onCancel} className="btn-ghost text-sm">{cancelLabel}</button>
              <button onClick={onConfirm} className={cn('btn text-sm text-white', toneClass)}>{confirmLabel}</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
