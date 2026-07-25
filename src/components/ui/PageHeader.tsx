import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-11 h-11 rounded-xl2 bg-gradient-to-br from-brand-500/10 to-success-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center ring-1 ring-brand-200/50 dark:ring-brand-600/20">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-ink-900 dark:text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
