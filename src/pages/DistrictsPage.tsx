import { MapPin, Users, Trash2, TrendingUp } from 'lucide-react';
import { CrudManager, type CrudConfig } from '@/components/ui/CrudManager';
import { Badge, StatCard } from '@/components/ui';
import { districts, type Municipality } from '@/data/mockData';
import { useApp } from '@/store/appStore';

const config: CrudConfig<Municipality> = {
  entityName: 'دائرة',
  entityNamePlural: 'الدوائر',
  icon: <MapPin className="w-5 h-5" />,
  rowKey: (d) => d.id,
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  columns: [
    { key: 'id', header: 'الرمز', sortable: true, searchable: true, width: 90, pinned: 'left', render: (d) => <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">{d.id}</span> },
    { key: 'nameAr', header: 'الاسم', sortable: true, searchable: true, width: 180, render: (d) => <span className="font-medium text-ink-800 dark:text-ink-100">{d.nameAr}</span> },
    { key: 'population', header: 'السكان', sortable: true, width: 120, align: 'right', exportValue: (d) => d.population, render: (d) => d.population.toLocaleString() },
    { key: 'areaKm2', header: 'المساحة (كم²)', sortable: true, width: 120, align: 'right', exportValue: (d) => d.areaKm2 },
    { key: 'containers', header: 'الحاويات', sortable: true, width: 100, align: 'center', render: (d) => <Badge tone="brand">{d.containers}</Badge> },
    { key: 'openSpots', header: 'نقاط مفتوحة', sortable: true, width: 110, align: 'center', exportValue: (d) => d.openSpots, render: (d) => <Badge tone={d.openSpots > 10 ? 'danger' : 'warning'}>{d.openSpots}</Badge> },
    { key: 'fillRate', header: 'متوسط الامتلاء', sortable: true, width: 140, align: 'right', exportValue: (d) => d.fillRate, render: (d) => (
      <div className="flex items-center gap-2">
        <div className="w-20 h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${d.fillRate}%`, background: d.fillRate > 80 ? '#EF4444' : d.fillRate > 60 ? '#F59E0B' : '#10B981' }} />
        </div>
        <span className="text-xs font-medium">{d.fillRate}%</span>
      </div>
    ) },
    { key: 'inspector', header: 'المسؤول', sortable: true, searchable: true, width: 120 },
  ],
  formFields: [
    { key: 'code', label: 'الكود', type: 'text', required: true, placeholder: '4001' },
    { key: 'nameAr', label: 'الاسم بالعربية', type: 'text', required: true },
    { key: 'nameFr', label: 'الاسم بالفرنسية', type: 'text' },
    { key: 'population', label: 'عدد السكان', type: 'number', min: 0, required: true },
    { key: 'areaKm2', label: 'المساحة (كم²)', type: 'number', min: 0, step: 0.1 },
    { key: 'containers', label: 'عدد الحاويات', type: 'number', min: 0 },
    { key: 'openSpots', label: 'النقاط المفتوحة', type: 'number', min: 0, defaultValue: 0 },
    { key: 'fillRate', label: 'نسبة الامتلاء (%)', type: 'number', min: 0, max: 100, defaultValue: 50 },
    { key: 'collectionRate', label: 'نسبة الجمع (%)', type: 'number', min: 0, max: 100, defaultValue: 50 },
    { key: 'inspector', label: 'المسؤول', type: 'text' },
  ],
  filters: [
    { key: 'fillRate', label: 'نسبة الامتلاء', type: 'select', value: 'all', onChange: () => {}, options: [
      { value: 'high', label: '> 80%' }, { value: 'medium', label: '60% - 80%' }, { value: 'low', label: '< 60%' },
    ]},
  ],
};

export function DistrictsPage() {
  const { t } = useApp();
  return (
    <CrudManager
      config={{
        ...config,
        stats: (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <StatCard label="إجمالي السكان" value={districts.reduce((s, d) => s + d.population, 0).toLocaleString()} icon={<Users className="w-5 h-5" />} tone="brand" />
            <StatCard label="إجمالي المساحة" value={`${districts.reduce((s, d) => s + d.areaKm2, 0)} كم²`} icon={<MapPin className="w-5 h-5" />} tone="success" />
            <StatCard label="إجمالي الحاويات" value={districts.reduce((s, d) => s + d.containers, 0)} icon={<Trash2 className="w-5 h-5" />} tone="warning" />
            <StatCard label="نقاط مفتوحة" value={districts.reduce((s, d) => s + d.openSpots, 0)} icon={<TrendingUp className="w-5 h-5" />} tone="danger" />
          </div>
        ),
      }}
      data={districts}
    />
  );
}
