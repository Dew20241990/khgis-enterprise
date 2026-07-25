import { Building2, Star, Users, Truck } from 'lucide-react';
import { CrudManager, type CrudConfig } from '@/components/ui/CrudManager';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { contractors, type Contractor } from '@/data/mockData';
import { useApp } from '@/store/appStore';

const statusLabels: Record<string, { tone: any; label: string }> = {
  active: { tone: 'success', label: 'نشط' },
  suspended: { tone: 'danger', label: 'موقوف' },
  expired: { tone: 'neutral', label: 'منتهي' },
};

export function ContractorsPage() {
  const { t } = useApp();

  const config: CrudConfig<Contractor> = {
    entityName: 'مقاول',
    entityNamePlural: t('contractors'),
    icon: <Building2 className="w-5 h-5" />,
    rowKey: (r) => r.id,
    columns: [
      { key: 'name', header: t('name'), sortable: true, searchable: true, render: (r) => <span className="font-medium text-ink-800 dark:text-ink-100">{r.name}</span> },
      { key: 'zone', header: t('zone'), sortable: true, searchable: true, render: (r) => <span className="text-ink-600 dark:text-ink-300">{r.zone}</span> },
      { key: 'contractValue', header: 'قيمة العقد', sortable: true, render: (r) => <span className="text-xs font-mono text-ink-600 dark:text-ink-300">{(r.contractValue / 1000000).toFixed(1)} م دج</span> },
      { key: 'rating', header: t('rating'), sortable: true, render: (r) => (
        <span className="flex items-center gap-1 text-xs">
          <Star className="w-3.5 h-3.5 text-warning-500 fill-warning-500" />
          <span className="font-medium">{r.rating.toFixed(1)}</span>
        </span>
      )},
      { key: 'vehicles', header: 'المركبات', sortable: true, render: (r) => <span className="text-xs text-ink-600 dark:text-ink-300">{r.vehicles}</span> },
      { key: 'employees', header: 'العمال', sortable: true, render: (r) => <span className="text-xs text-ink-600 dark:text-ink-300">{r.employees}</span> },
      { key: 'startDate', header: 'بداية العقد', sortable: true, render: (r) => <span className="text-xs text-ink-500">{r.startDate}</span> },
      { key: 'endDate', header: 'نهاية العقد', sortable: true, render: (r) => <span className="text-xs text-ink-500">{r.endDate}</span> },
      { key: 'status', header: t('status'), sortable: true, render: (r) => { const c = statusLabels[r.status]; return <Badge tone={c.tone} dot>{c.label}</Badge>; } },
    ],
    formFields: [
      { key: 'name', label: t('name'), type: 'text', required: true },
      { key: 'zone', label: t('zone'), type: 'text', required: true },
      { key: 'contractValue', label: 'قيمة العقد (دج)', type: 'number', required: true, min: 0, step: 100000 },
      { key: 'status', label: t('status'), type: 'select', required: true, options: [
        { value: 'active', label: 'نشط' }, { value: 'suspended', label: 'موقوف' }, { value: 'expired', label: 'منتهي' },
      ]},
      { key: 'vehicles', label: 'عدد المركبات', type: 'number', min: 0, max: 100 },
      { key: 'employees', label: 'عدد العمال', type: 'number', min: 0, max: 500 },
      { key: 'startDate', label: 'بداية العقد', type: 'date' },
      { key: 'endDate', label: 'نهاية العقد', type: 'date' },
    ],
    stats: (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="إجمالي المقاولين" value={contractors.length} icon={<Building2 className="w-5 h-5" />} tone="brand" />
        <StatCard label="نشطون" value={contractors.filter((c) => c.status === 'active').length} icon={<Building2 className="w-5 h-5" />} tone="success" />
        <StatCard label="إجمالي المركبات" value={contractors.reduce((a, c) => a + c.vehicles, 0)} icon={<Truck className="w-5 h-5" />} tone="warning" />
        <StatCard label="إجمالي العمال" value={contractors.reduce((a, c) => a + c.employees, 0)} icon={<Users className="w-5 h-5" />} tone="neutral" />
      </div>
    ),
  };

  return <CrudManager config={config} data={contractors} />;
}
