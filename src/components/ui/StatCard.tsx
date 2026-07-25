import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
  delta?: number;
  hint?: string;
}

const toneMap = {
  brand: 'from-brand-500/10 to-brand-500/5 text-brand-600 dark:text-brand-400',
  success: 'from-success-500/10 to-success-500/5 text-success-600 dark:text-success-400',
  warning: 'from-warning-500/10 to-warning-500/5 text-warning-600 dark:text-warning-400',
  danger: 'from-danger-500/10 to-danger-500/5 text-danger-600 dark:text-danger-400',
  neutral: 'from-ink-500/10 to-ink-500/5 text-ink-600 dark:text-ink-300',
};

export function StatCard({ label, value, icon, tone = 'brand', delta, hint }: StatCardProps) {
  return (
    <div className="card card-hover p-5 relative overflow-hidden">
      <div className={cn('absolute -top-8 -left-8 w-28 h-28 rounded-full bg-gradient-to-br blur-2xl opacity-60', toneMap[tone])} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-500 dark:text-ink-400">{label}</p>
          <p className="text-2xl font-bold text-ink-900 dark:text-white mt-1.5 tracking-tight">{value}</p>
          {hint && <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">{hint}</p>}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br', toneMap[tone])}>
          {icon}
        </div>
      </div>
      {delta !== undefined && (
        <div className="relative mt-3 flex items-center gap-1.5">
          <span className={cn('inline-flex items-center gap-0.5 text-xs font-semibold', delta >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400')}>
            {delta >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(delta)}%
          </span>
          <span className="text-xs text-ink-400 dark:text-ink-500">عن الشهر الماضي</span>
        </div>
      )}
    </div>
  );
}
