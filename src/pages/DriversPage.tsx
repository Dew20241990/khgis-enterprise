import { User, Star, Phone } from 'lucide-react';
import { CrudManager, type CrudConfig } from '@/components/ui/CrudManager';
import { StatusBadge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { drivers, vehicles, type Driver } from '@/data/mockData';
import { useApp } from '@/store/appStore';

const statusLabels: Record<string, string> = { 'on-duty': 'في الخدمة', 'off-duty': 'خارج الخدمة', 'leave': 'إجازة' };

export function DriversPage() {
  const { t } = useApp();

  const config: CrudConfig<Driver> = {
    entityName: 'سائق',
    entityNamePlural: t('drivers'),
    icon: <User className="w-5 h-5" />,
    rowKey: (r) => r.id,
    columns: [
      { key: 'name', header: t('name'), sortable: true, searchable: true, render: (r) => <span className="font-medium text-ink-800 dark:text-ink-100">{r.name}</span> },
      { key: 'phone', header: t('phone'), searchable: true, render: (r) => <span className="font-mono text-xs text-ink-600 dark:text-ink-300">{r.phone}</span> },
      { key: 'license', header: 'رخصة', searchable: true, render: (r) => <span className="text-xs text-ink-600 dark:text-ink-300">{r.license}</span> },
      { key: 'vehicle', header: 'المركبة', searchable: true, render: (r) => <span className="font-mono text-xs text-brand-600 dark:text-brand-400">{r.vehicle}</span> },
      { key: 'rating', header: t('rating'), sortable: true, render: (r) => (
        <span className="flex items-center gap-1 text-xs">
          <Star className="w-3.5 h-3.5 text-warning-500 fill-warning-500" />
          <span className="font-medium">{r.rating.toFixed(1)}</span>
        </span>
      )},
      { key: 'tours', header: 'الجولات', sortable: true, render: (r) => <span className="text-xs text-ink-600 dark:text-ink-300">{r.tours}</span> },
      { key: 'hoursThisWeek', header: 'ساعات/أسبوع', sortable: true, render: (r) => <span className="text-xs text-ink-600 dark:text-ink-300">{r.hoursThisWeek} س</span> },
      { key: 'status', header: t('status'), sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    ],
    formFields: [
      { key: 'name', label: t('name'), type: 'text', required: true },
      { key: 'phone', label: t('phone'), type: 'text', required: true, placeholder: '0550 XXX XXX' },
      { key: 'license', label: 'رقم الرخصة', type: 'text', required: true, placeholder: 'B-2026-XXX' },
      { key: 'vehicle', label: 'المركبة', type: 'select', options: vehicles.map((v) => ({ value: v.plate, label: v.plate })) },
      { key: 'status', label: t('status'), type: 'select', required: true, options: [
        { value: 'on-duty', label: 'في الخدمة' }, { value: 'off-duty', label: 'خارج الخدمة' }, { value: 'leave', label: 'إجازة' },
      ]},
    ],
    stats: (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="إجمالي السائقين" value={drivers.length} icon={<User className="w-5 h-5" />} tone="brand" />
        <StatCard label="في الخدمة" value={drivers.filter((d) => d.status === 'on-duty').length} icon={<User className="w-5 h-5" />} tone="success" />
        <StatCard label="خارج الخدمة" value={drivers.filter((d) => d.status === 'off-duty').length} icon={<User className="w-5 h-5" />} tone="neutral" />
        <StatCard label="متوسط التقييم" value={(drivers.reduce((a, d) => a + d.rating, 0) / drivers.length).toFixed(1)} icon={<Star className="w-5 h-5" />} tone="warning" />
      </div>
    ),
  };

  return <CrudManager config={config} data={drivers} />;
}
