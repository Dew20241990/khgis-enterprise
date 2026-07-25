import { Building2, Users, Trash2, AlertTriangle } from 'lucide-react';
import { CrudManager, type CrudConfig } from '@/components/ui/CrudManager';
import { StatCard, Badge } from '@/components/ui';
import { useApp } from '@/store/appStore';
import { municipalities, type Municipality } from '@/data/mockData';

const config: CrudConfig<Municipality> = {
  entityName: 'بلدية',
  entityNamePlural: 'البلديات',
  icon: <Building2 className="w-5 h-5" />,
  rowKey: (m) => m.id,
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  allowDuplicate: true,
  allowArchive: true,
  columns: [
    { key: 'code', header: 'الكود', sortable: true, searchable: true, width: 90, pinned: 'left' },
    { key: 'nameAr', header: 'الاسم', sortable: true, searchable: true, width: 180, render: (m) => (
      <div>
        <p className="font-medium text-ink-800 dark:text-ink-100">{m.nameAr}</p>
        <p className="text-xs text-ink-400">{m.nameFr}</p>
      </div>
    ) },
    { key: 'population', header: 'السكان', sortable: true, searchable: true, width: 120, align: 'right', exportValue: (m) => m.population, render: (m) => m.population.toLocaleString() },
    { key: 'areaKm2', header: 'المساحة', sortable: true, width: 100, align: 'right', exportValue: (m) => m.areaKm2, render: (m) => `${m.areaKm2} كم²` },
    { key: 'households', header: 'الأسر', sortable: true, width: 100, align: 'right', exportValue: (m) => m.households, render: (m) => m.households.toLocaleString() },
    { key: 'containers', header: 'الحاويات', sortable: true, width: 90, align: 'center' },
    { key: 'openSpots', header: 'النقاط السوداء', sortable: true, width: 120, align: 'center', exportValue: (m) => m.openSpots, render: (m) => <Badge tone={m.openSpots > 5 ? 'danger' : m.openSpots > 2 ? 'warning' : 'success'}>{m.openSpots}</Badge> },
    { key: 'collectionRate', header: 'نسبة الجمع', sortable: true, width: 140, align: 'right', exportValue: (m) => m.collectionRate, render: (m) => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
          <div className={`h-full rounded-full ${m.collectionRate > 80 ? 'bg-success-500' : m.collectionRate > 65 ? 'bg-warning-500' : 'bg-danger-500'}`} style={{ width: `${m.collectionRate}%` }} />
        </div>
        <span className="text-xs font-medium">{m.collectionRate}%</span>
      </div>
    ) },
    { key: 'inspector', header: 'المسؤول', sortable: true, searchable: true, width: 120 },
  ],
  formFields: [
    { key: 'code', label: 'الكود', type: 'text', required: true, placeholder: '4001' },
    { key: 'nameAr', label: 'الاسم بالعربية', type: 'text', required: true, placeholder: 'خنشلة' },
    { key: 'nameFr', label: 'الاسم بالفرنسية', type: 'text', placeholder: 'Khenchela' },
    { key: 'name', label: 'الاسم بالإنجليزية', type: 'text', placeholder: 'Khenchela' },
    { key: 'population', label: 'عدد السكان', type: 'number', required: true, min: 0, placeholder: '118000' },
    { key: 'areaKm2', label: 'المساحة (كم²)', type: 'number', required: true, min: 0, step: 0.1, placeholder: '51.0' },
    { key: 'households', label: 'عدد الأسر', type: 'number', min: 0, placeholder: '28500' },
    { key: 'containers', label: 'عدد الحاويات', type: 'number', min: 0, placeholder: '612' },
    { key: 'openSpots', label: 'النقاط السوداء المفتوحة', type: 'number', min: 0, defaultValue: 0 },
    { key: 'resolvedSpots', label: 'النقاط السوداء المحلولة', type: 'number', min: 0, defaultValue: 0 },
    { key: 'fillRate', label: 'نسبة الامتلاء (%)', type: 'number', min: 0, max: 100, defaultValue: 50 },
    { key: 'collectionRate', label: 'نسبة الجمع (%)', type: 'number', min: 0, max: 100, defaultValue: 50 },
    { key: 'inspector', label: 'المفتش المسؤول', type: 'text', placeholder: 'س. بن عمر' },
  ],
  filters: [
    {
      key: 'collectionRate',
      label: 'نسبة الجمع',
      type: 'select',
      value: 'all',
      onChange: () => {},
      options: [
        { value: 'high', label: '> 80%' },
        { value: 'medium', label: '65% - 80%' },
        { value: 'low', label: '< 65%' },
      ],
    },
  ],
  quickView: (m) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><p className="text-xs text-ink-400">الكود</p><p className="font-medium">{m.code}</p></div>
        <div><p className="text-xs text-ink-400">الاسم</p><p className="font-medium">{m.nameAr} ({m.nameFr})</p></div>
        <div><p className="text-xs text-ink-400">السكان</p><p className="font-medium">{m.population.toLocaleString()}</p></div>
        <div><p className="text-xs text-ink-400">المساحة</p><p className="font-medium">{m.areaKm2} كم²</p></div>
        <div><p className="text-xs text-ink-400">الحاويات</p><p className="font-medium">{m.containers}</p></div>
        <div><p className="text-xs text-ink-400">نسبة الجمع</p><p className="font-medium">{m.collectionRate}%</p></div>
        <div><p className="text-xs text-ink-400">النقاط المفتوحة</p><p className="font-medium">{m.openSpots}</p></div>
        <div><p className="text-xs text-ink-400">النقاط المحلولة</p><p className="font-medium">{m.resolvedSpots}</p></div>
        <div className="col-span-2"><p className="text-xs text-ink-400">المفتش المسؤول</p><p className="font-medium">{m.inspector}</p></div>
      </div>
    </div>
  ),
  detailView: (m) => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-800/40">
          <p className="text-xs text-ink-400">السكان</p>
          <p className="text-xl font-bold">{m.population.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-800/40">
          <p className="text-xs text-ink-400">المساحة</p>
          <p className="text-xl font-bold">{m.areaKm2} كم²</p>
        </div>
        <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-800/40">
          <p className="text-xs text-ink-400">الأسر</p>
          <p className="text-xl font-bold">{m.households.toLocaleString()}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-800/40">
          <p className="text-xs text-ink-400 mb-1">نسبة الجمع</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
              <div className={`h-full rounded-full ${m.collectionRate > 80 ? 'bg-success-500' : m.collectionRate > 65 ? 'bg-warning-500' : 'bg-danger-500'}`} style={{ width: `${m.collectionRate}%` }} />
            </div>
            <span className="font-bold">{m.collectionRate}%</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-800/40">
          <p className="text-xs text-ink-400 mb-1">نسبة الامتلاء</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
              <div className={`h-full rounded-full ${m.fillRate > 80 ? 'bg-success-500' : m.fillRate > 60 ? 'bg-warning-500' : 'bg-danger-500'}`} style={{ width: `${m.fillRate}%` }} />
            </div>
            <span className="font-bold">{m.fillRate}%</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-800/40">
          <p className="text-xs text-ink-400">الحاويات</p>
          <p className="text-lg font-bold">{m.containers}</p>
        </div>
        <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-800/40">
          <p className="text-xs text-ink-400">النقاط السوداء</p>
          <p className="text-lg font-bold">{m.openSpots} مفتوحة / {m.resolvedSpots} محلولة</p>
        </div>
      </div>
      <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-800/40">
        <p className="text-xs text-ink-400 mb-1">المفتش المسؤول</p>
        <p className="font-medium">{m.inspector}</p>
      </div>
    </div>
  ),
};

export function MunicipalitiesPage() {
  const { t } = useApp();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('municipalities')} value={municipalities.length} icon={<Building2 className="w-5 h-5" />} tone="brand" />
        <StatCard label={t('population')} value={municipalities.reduce((a, m) => a + m.population, 0).toLocaleString()} icon={<Users className="w-5 h-5" />} tone="success" />
        <StatCard label={t('wasteContainers')} value={municipalities.reduce((a, m) => a + m.containers, 0)} icon={<Trash2 className="w-5 h-5" />} tone="warning" />
        <StatCard label={t('blackSpots')} value={municipalities.reduce((a, m) => a + m.openSpots, 0)} icon={<AlertTriangle className="w-5 h-5" />} tone="danger" />
      </div>
      <CrudManager config={config} data={municipalities} />
    </div>
  );
}
