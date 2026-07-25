import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';

const tones: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-600/15 dark:text-brand-300 ring-1 ring-brand-200/60 dark:ring-brand-600/20',
  success: 'bg-success-50 text-success-700 dark:bg-success-600/15 dark:text-success-300 ring-1 ring-success-200/60 dark:ring-success-600/20',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-600/15 dark:text-warning-300 ring-1 ring-warning-200/60 dark:ring-warning-600/20',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-600/15 dark:text-danger-300 ring-1 ring-danger-200/60 dark:ring-danger-600/20',
  neutral: 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300 ring-1 ring-ink-200/60 dark:ring-ink-700/60',
  info: 'bg-sky-50 text-sky-700 dark:bg-sky-600/15 dark:text-sky-300 ring-1 ring-sky-200/60 dark:ring-sky-600/20',
};

export function Badge({ children, tone = 'neutral', className, dot }: { children: ReactNode; tone?: Tone; className?: string; dot?: boolean }) {
  return (
    <span className={cn('chip', tones[tone], className)}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: Tone; label: string }> = {
    open: { tone: 'danger', label: 'مفتوح' },
    inProgress: { tone: 'warning', label: 'قيد التنفيذ' },
    resolved: { tone: 'success', label: 'تم الحل' },
    closed: { tone: 'neutral', label: 'مغلق' },
    active: { tone: 'success', label: 'نشط' },
    idle: { tone: 'neutral', label: 'خامل' },
    maintenance: { tone: 'warning', label: 'صيانة' },
    offline: { tone: 'danger', label: 'غير متصل' },
    pending: { tone: 'warning', label: 'قيد الانتظار' },
    scheduled: { tone: 'info', label: 'مجدول' },
    completed: { tone: 'success', label: 'مكتمل' },
    flagged: { tone: 'danger', label: 'مُعلّم' },
    assigned: { tone: 'info', label: 'مُسند' },
    planned: { tone: 'info', label: 'مخطط' },
    delayed: { tone: 'danger', label: 'متأخر' },
    operational: { tone: 'success', label: 'تشغيلي' },
    'near-capacity': { tone: 'warning', label: 'قرب الامتلاء' },
    suspended: { tone: 'danger', label: 'موقوف' },
    expired: { tone: 'neutral', label: 'منتهي' },
    'on-duty': { tone: 'success', label: 'في الخدمة' },
    'off-duty': { tone: 'neutral', label: 'خارج الخدمة' },
    leave: { tone: 'info', label: 'إجازة' },
    ok: { tone: 'success', label: 'سليم' },
    full: { tone: 'danger', label: 'ممتلئ' },
    damaged: { tone: 'danger', label: 'تالف' },
  };
  const cfg = map[status] ?? { tone: 'neutral' as Tone, label: status };
  return <Badge tone={cfg.tone} dot>{cfg.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { tone: Tone; label: string }> = {
    critical: { tone: 'danger', label: 'حرج' },
    high: { tone: 'warning', label: 'عالي' },
    medium: { tone: 'info', label: 'متوسط' },
    low: { tone: 'neutral', label: 'منخفض' },
  };
  const cfg = map[priority] ?? { tone: 'neutral' as Tone, label: priority };
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
}
