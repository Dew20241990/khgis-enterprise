import { Home, Users, Trash2, AlertTriangle } from 'lucide-react';
import { CrudManager, type CrudConfig } from '@/components/ui/CrudManager';
import { Badge, StatCard } from '@/components/ui';
import { neighborhoods, municipalities, type Neighborhood } from '@/data/mockData';
import { useApp } from '@/store/appStore';

const config: CrudConfig<Neighborhood> = {
  entityName: 'حي',
  entityNamePlural: 'الأحياء',
  icon: <Home className="w-5 h-5" />,
  rowKey: (n) => n.id,
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  columns: [
    { key: 'nameAr', header: 'الاسم', sortable: true, searchable: true, width: 160, pinned: 'left', render: (n) => <span className="font-medium text-ink-800 dark:text-ink-100">{n.nameAr}</span> },
    { key: 'municipality', header: 'البلدية', sortable: true, searchable: true, width: 140 },
    { key: 'population', header: 'السكان', sortable: true, width: 110, align: 'right', exportValue: (n) => n.population, render: (n) => n.population.toLocaleString() },
    { key: 'containers', header: 'الحاويات', sortable: true, width: 90, align: 'center' },
    { key: 'openSpots', header: 'النقاط السوداء', sortable: true, width: 120, align: 'center', exportValue: (n) => n.openSpots, render: (n) => <Badge tone={n.openSpots > 3 ? 'danger' : n.openSpots > 0 ? 'warning' : 'success'}>{n.openSpots}</Badge> },
    { key: 'fillRate', header: 'نسبة الامتلاء', sortable: true, width: 130, align: 'right', exportValue: (n) => n.fillRate, render: (n) => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
          <div className={`h-full rounded-full ${n.fillRate > 80 ? 'bg-success-500' : n.fillRate > 60 ? 'bg-warning-500' : 'bg-danger-500'}`} style={{ width: `${n.fillRate}%` }} />
        </div>
        <span className="text-xs font-medium">{n.fillRate}%</span>
      </div>
    ) },
  ],
  formFields: [
    { key: 'nameAr', label: 'الاسم', type: 'text', required: true, placeholder: 'حي النصر' },
    { key: 'municipalityId', label: 'البلدية', type: 'select', required: true, options: municipalities.map((m) => ({ value: m.id, label: m.nameAr })) },
    { key: 'population', label: 'عدد السكان', type: 'number', min: 0, placeholder: '5000' },
    { key: 'containers', label: 'عدد الحاويات', type: 'number', min: 0, placeholder: '30' },
    { key: 'openSpots', label: 'النقاط السوداء المفتوحة', type: 'number', min: 0, defaultValue: 0 },
    { key: 'fillRate', label: 'نسبة الامتلاء (%)', type: 'number', min: 0, max: 100, defaultValue: 50 },
  ],
  filters: [
    { key: 'municipality', label: 'البلدية', type: 'select', value: 'all', onChange: () => {}, options: municipalities.map((m) => ({ value: m.id, label: m.nameAr })) },
  ],
  quickView: (n) => (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div><p className="text-xs text-ink-400">الاسم</p><p className="font-medium">{n.nameAr}</p></div>
      <div><p className="text-xs text-ink-400">البلدية</p><p className="font-medium">{n.municipality}</p></div>
      <div><p className="text-xs text-ink-400">السكان</p><p className="font-medium">{n.population.toLocaleString()}</p></div>
      <div><p className="text-xs text-ink-400">الحاويات</p><p className="font-medium">{n.containers}</p></div>
      <div><p className="text-xs text-ink-400">النقاط السوداء</p><p className="font-medium">{n.openSpots}</p></div>
      <div><p className="text-xs text-ink-400">نسبة الامتلاء</p><p className="font-medium">{n.fillRate}%</p></div>
    </div>
  ),
};

export function NeighborhoodsPage() {
  const { t } = useApp();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('neighborhoods')} value={neighborhoods.length} icon={<Home className="w-5 h-5" />} tone="brand" />
        <StatCard label={t('population')} value={neighborhoods.reduce((a, n) => a + n.population, 0).toLocaleString()} icon={<Users className="w-5 h-5" />} tone="success" />
        <StatCard label={t('containers')} value={neighborhoods.reduce((a, n) => a + n.containers, 0)} icon={<Trash2 className="w-5 h-5" />} tone="warning" />
        <StatCard label={t('blackSpots')} value={neighborhoods.reduce((a, n) => a + n.openSpots, 0)} icon={<AlertTriangle className="w-5 h-5" />} tone="danger" />
      </div>
      <CrudManager config={config} data={neighborhoods} />
    </div>
  );
}
