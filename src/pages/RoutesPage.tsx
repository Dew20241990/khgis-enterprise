import { Route as RouteIcon, Play, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { CrudManager, type CrudConfig } from '@/components/ui/CrudManager';
import { StatusBadge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { routes, vehicles, drivers, municipalities, type Route } from '@/data/mockData';
import { useApp } from '@/store/appStore';

export function RoutesPage() {
  const { t } = useApp();

  const config: CrudConfig<Route> = {
    entityName: 'مسار',
    entityNamePlural: t('routes'),
    icon: <RouteIcon className="w-5 h-5" />,
    rowKey: (r) => r.id,
    columns: [
      { key: 'code', header: 'الرمز', sortable: true, searchable: true, render: (r) => <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">{r.code}</span> },
      { key: 'name', header: t('name'), sortable: true, searchable: true, render: (r) => <span className="font-medium text-ink-800 dark:text-ink-100">{r.name}</span> },
      { key: 'municipality', header: t('municipality'), sortable: true, searchable: true, render: (r) => <span className="text-ink-600 dark:text-ink-300">{r.municipality}</span> },
      { key: 'vehicle', header: 'المركبة', searchable: true, render: (r) => <span className="font-mono text-xs text-brand-600 dark:text-brand-400">{r.vehicle}</span> },
      { key: 'driver', header: 'السائق', searchable: true, render: (r) => <span className="text-ink-600 dark:text-ink-300">{r.driver}</span> },
      { key: 'stops', header: 'محطات', sortable: true, render: (r) => <span className="text-xs text-ink-600 dark:text-ink-300">{r.stops}</span> },
      { key: 'distanceKm', header: 'المسافة', sortable: true, render: (r) => <span className="text-xs text-ink-600 dark:text-ink-300">{r.distanceKm} كم</span> },
      { key: 'durationMin', header: 'المدة', sortable: true, render: (r) => <span className="text-xs text-ink-600 dark:text-ink-300">{r.durationMin} د</span> },
      {
        key: 'progress', header: 'التقدم', sortable: true,
        render: (r) => (
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${r.progress}%` }} />
            </div>
            <span className="text-xs text-ink-600 dark:text-ink-300">{r.progress}%</span>
          </div>
        ),
      },
      { key: 'status', header: t('status'), sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    ],
    formFields: [
      { key: 'code', label: 'الرمز', type: 'text', required: true, placeholder: 'RT-XXXX' },
      { key: 'name', label: t('name'), type: 'text', required: true },
      { key: 'municipalityId', label: t('municipality'), type: 'select', required: true, options: municipalities.map((m) => ({ value: m.id, label: m.nameAr })) },
      { key: 'vehicle', label: 'المركبة', type: 'select', options: vehicles.map((v) => ({ value: v.plate, label: v.plate })) },
      { key: 'driver', label: 'السائق', type: 'select', options: drivers.map((d) => ({ value: d.name, label: d.name })) },
      { key: 'stops', label: 'عدد المحطات', type: 'number', min: 1, max: 100 },
      { key: 'distanceKm', label: 'المسافة (كم)', type: 'number', min: 1, step: 0.5 },
      { key: 'durationMin', label: 'المدة (دقيقة)', type: 'number', min: 1 },
      { key: 'status', label: t('status'), type: 'select', required: true, options: [
        { value: 'planned', label: 'مخطط' }, { value: 'active', label: 'نشط' },
        { value: 'completed', label: 'مكتمل' }, { value: 'delayed', label: 'متأخر' },
      ]},
    ],
    stats: (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="إجمالي المسارات" value={routes.length} icon={<RouteIcon className="w-5 h-5" />} tone="brand" />
        <StatCard label="نشطة" value={routes.filter((r) => r.status === 'active').length} icon={<Play className="w-5 h-5" />} tone="success" />
        <StatCard label="مكتملة" value={routes.filter((r) => r.status === 'completed').length} icon={<CheckCircle className="w-5 h-5" />} tone="brand" />
        <StatCard label="متأخرة" value={routes.filter((r) => r.status === 'delayed').length} icon={<AlertCircle className="w-5 h-5" />} tone="danger" />
      </div>
    ),
  };

  return <CrudManager config={config} data={routes} />;
}
