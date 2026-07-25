import { Trash2, AlertTriangle, MapPin, CheckCircle } from 'lucide-react';
import { CrudManager, type CrudConfig } from '@/components/ui/CrudManager';
import { Badge, StatusBadge, StatCard } from '@/components/ui';
import { illegalDumps, municipalities, type IllegalDump } from '@/data/mockData';
import { useApp } from '@/store/appStore';

const typeLabels: Record<string, string> = { construction: 'حطام بناء', household: 'نفايات منزلية', industrial: 'نفايات صناعية', mixed: 'مختلطة' };

const config: CrudConfig<IllegalDump> = {
  entityName: 'موقع تفريغ',
  entityNamePlural: 'التفريغ العشوائي',
  icon: <Trash2 className="w-5 h-5" />,
  rowKey: (d) => d.id,
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  columns: [
    { key: 'code', header: 'الكود', sortable: true, searchable: true, width: 100, pinned: 'left', render: (d) => <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">{d.code}</span> },
    { key: 'location', header: 'الموقع', searchable: true, width: 200, render: (d) => <span className="flex items-center gap-1.5 text-ink-600 dark:text-ink-300"><MapPin className="w-3.5 h-3.5 text-ink-400" /> {d.location}</span> },
    { key: 'municipality', header: 'البلدية', sortable: true, searchable: true, width: 120 },
    { key: 'type', header: 'النوع', sortable: true, width: 120, render: (d) => <Badge tone="neutral">{typeLabels[d.type]}</Badge> },
    { key: 'volume', header: 'الحجم (م³)', sortable: true, width: 100, align: 'right', exportValue: (d) => d.volume, render: (d) => `${d.volume} م³` },
    { key: 'status', header: 'الحالة', sortable: true, width: 120, render: (d) => <StatusBadge status={d.status} /> },
    { key: 'reportedAt', header: 'التاريخ', sortable: true, width: 120, render: (d) => <span className="text-xs text-ink-500">{new Date(d.reportedAt).toLocaleDateString('ar-DZ')}</span> },
  ],
  formFields: [
    { key: 'code', label: 'الكود', type: 'text', required: true, placeholder: 'ID-XXXX' },
    { key: 'municipalityId', label: 'البلدية', type: 'select', required: true, options: municipalities.map((m) => ({ value: m.id, label: m.nameAr })) },
    { key: 'location', label: 'الموقع', type: 'text', required: true, colSpan: 2 },
    { key: 'type', label: 'النوع', type: 'select', required: true, options: [
      { value: 'construction', label: 'حطام بناء' }, { value: 'household', label: 'نفايات منزلية' },
      { value: 'industrial', label: 'نفايات صناعية' }, { value: 'mixed', label: 'مختلطة' },
    ]},
    { key: 'volume', label: 'الحجم (م³)', type: 'number', min: 0, step: 0.5 },
    { key: 'status', label: 'الحالة', type: 'select', required: true, options: [
      { value: 'reported', label: 'مُبلّغ' }, { value: 'scheduled', label: 'مجدول' }, { value: 'cleared', label: 'تم التنظيف' },
    ]},
    { key: 'reportedAt', label: 'تاريخ البلاغ', type: 'date' },
    { key: 'coords', label: 'الإحداثيات', type: 'gps', colSpan: 2 },
  ],
  filters: [
    { key: 'status', label: 'الحالة', type: 'select', value: 'all', onChange: () => {}, options: [
      { value: 'reported', label: 'مُبلّغ' }, { value: 'scheduled', label: 'مجدول' }, { value: 'cleared', label: 'تم التنظيف' },
    ]},
    { key: 'type', label: 'النوع', type: 'select', value: 'all', onChange: () => {}, options: [
      { value: 'construction', label: 'حطام بناء' }, { value: 'household', label: 'نفايات منزلية' },
      { value: 'industrial', label: 'نفايات صناعية' }, { value: 'mixed', label: 'مختلطة' },
    ]},
  ],
  quickView: (d) => (
    <div className="space-y-3">
      <div className="aspect-video rounded-xl overflow-hidden bg-ink-100 dark:bg-ink-800">
        <img src={d.photo} alt={d.location} className="w-full h-full object-cover" />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><p className="text-xs text-ink-400">الكود</p><p className="font-medium">{d.code}</p></div>
        <div><p className="text-xs text-ink-400">البلدية</p><p className="font-medium">{d.municipality}</p></div>
        <div><p className="text-xs text-ink-400">النوع</p><Badge tone="neutral">{typeLabels[d.type]}</Badge></div>
        <div><p className="text-xs text-ink-400">الحجم</p><p className="font-medium">{d.volume} م³</p></div>
        <div><p className="text-xs text-ink-400">الحالة</p><StatusBadge status={d.status} /></div>
        <div><p className="text-xs text-ink-400">التاريخ</p><p className="font-medium text-xs">{new Date(d.reportedAt).toLocaleDateString('ar-DZ')}</p></div>
      </div>
    </div>
  ),
};

export function IllegalDumpingPage() {
  const { t } = useApp();
  return (
    <CrudManager
      config={{
        ...config,
        stats: (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <StatCard label="إجمالي المواقع" value={illegalDumps.length} icon={<Trash2 className="w-5 h-5" />} tone="danger" />
            <StatCard label="مُبلّغ" value={illegalDumps.filter((d) => d.status === 'reported').length} icon={<AlertTriangle className="w-5 h-5" />} tone="warning" />
            <StatCard label="مجدول" value={illegalDumps.filter((d) => d.status === 'scheduled').length} icon={<Trash2 className="w-5 h-5" />} tone="brand" />
            <StatCard label="تم التنظيف" value={illegalDumps.filter((d) => d.status === 'cleared').length} icon={<CheckCircle className="w-5 h-5" />} tone="success" />
          </div>
        ),
      }}
      data={illegalDumps}
    />
  );
}
