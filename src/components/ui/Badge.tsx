import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useApp } from '@/store/appStore';
import { domainLabel, PRIORITY_KEYS, STATUS_KEYS } from '@/i18n/domain';

export type BadgeTone = 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';

const tones: Record<BadgeTone, string> = {
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-600/15 dark:text-brand-300 ring-1 ring-brand-200/60 dark:ring-brand-600/20',
  success: 'bg-success-50 text-success-700 dark:bg-success-600/15 dark:text-success-300 ring-1 ring-success-200/60 dark:ring-success-600/20',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-600/15 dark:text-warning-300 ring-1 ring-warning-200/60 dark:ring-warning-600/20',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-600/15 dark:text-danger-300 ring-1 ring-danger-200/60 dark:ring-danger-600/20',
  neutral: 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300 ring-1 ring-ink-200/60 dark:ring-ink-700/60',
  info: 'bg-sky-50 text-sky-700 dark:bg-sky-600/15 dark:text-sky-300 ring-1 ring-sky-200/60 dark:ring-sky-600/20',
};

export function Badge({ children, tone = 'neutral', className, dot }: { children: ReactNode; tone?: BadgeTone; className?: string; dot?: boolean }) {
  return (
    <span className={cn('chip', tones[tone], className)}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

const STATUS_TONE: Record<string, BadgeTone> = {
  open: 'danger', inProgress: 'warning', resolved: 'success', closed: 'neutral',
  active: 'success', idle: 'neutral', maintenance: 'warning', offline: 'danger',
  pending: 'warning', scheduled: 'info', completed: 'success', flagged: 'danger',
  assigned: 'info', planned: 'info', delayed: 'danger', operational: 'success',
  'near-capacity': 'warning', suspended: 'danger', expired: 'neutral',
  'on-duty': 'success', 'off-duty': 'neutral', leave: 'info', ok: 'success',
  full: 'danger', damaged: 'danger', created: 'danger', verified: 'success',
  rejected: 'danger', rework: 'warning',
};

/** Shows an operational status. `status` is the stored code; the label is translated at display time. */
export function StatusBadge({ status }: { status: string }) {
  const { t } = useApp();
  return <Badge tone={STATUS_TONE[status] ?? 'neutral'} dot>{domainLabel(t, STATUS_KEYS, status)}</Badge>;
}

const PRIORITY_TONE: Record<string, BadgeTone> = {
  critical: 'danger', high: 'warning', medium: 'info', low: 'neutral',
};

/** Shows a priority or risk level. `priority` is the stored code; the label is translated at display time. */
export function PriorityBadge({ priority }: { priority: string }) {
  const { t } = useApp();
  return <Badge tone={PRIORITY_TONE[priority] ?? 'neutral'}>{domainLabel(t, PRIORITY_KEYS, priority)}</Badge>;
}
