import type { ReactNode } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/cn';

const TONES = {
  info: 'border-brand-200 bg-brand-50/60 text-brand-700 dark:border-brand-600/30 dark:bg-brand-600/10 dark:text-brand-300',
  warning: 'border-warning-200 bg-warning-50/60 text-warning-700 dark:border-warning-600/30 dark:bg-warning-600/10 dark:text-warning-300',
} as const;

/** A static, non-dismissible explanation box (used to say plainly what a demo screen does and does not do). */
export function Notice({ title, children, tone = 'info', className }: {
  title?: string;
  children: ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  const Icon = tone === 'warning' ? AlertTriangle : Info;
  return (
    <div role="note" className={cn('flex items-start gap-3 rounded-xl border p-3.5 text-sm', TONES[tone], className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className={cn('leading-relaxed', title && 'mt-0.5')}>{children}</div>
      </div>
    </div>
  );
}
