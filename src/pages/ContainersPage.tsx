import { Trash2, AlertTriangle, Wrench, Gauge } from 'lucide-react';
import { CrudManager, type CrudConfig } from '@/components/ui/CrudManager';
import { StatusBadge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { containers, municipalities, type Container } from '@/data/mockData';
import { useApp } from '@/store/appStore';

const typeLabels: Record<string, string> = { standard: 'قياسية', underground: 'تحت أرضية', recycling: 'إعادة تدوير', organic: 'عضوية' };

export function ContainersPage() {
  const { t } = useApp();

  const config: CrudConfig<Container> = {
    entityName: 'حاوية',
    entityNamePlural: t('containers'),
    icon: <Trash2 className="w-5 h-5" />,
    rowKey: (r) => r.id,
    columns: [
      { key: 'code', header: 'الرمز', sortable: true, searchable: true, render: (r) => <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">{r.code}</span> },
      { key: 'municipality', header: t('municipality'), sortable: true, searchable: true, render: (r) => <span className="text-ink-600 dark:text-ink-300">{r.municipality}</span> },
      { key: 'type', header: t('type'), sortable: true, searchable: true, render: (r) => <span className="text-ink-600 dark:text-ink-300">{typeLabels[r.type]}</span> },
      { key: 'capacity', header: t('capacity'), sortable: true, render: (r) => <span className="text-ink-600 dark:text-ink-300">{r.capacity} لتر</span> },
      {
        key: 'fillLevel', header: t('fillLevel'), sortable: true,
        render: (r) => (
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${r.fillLevel}%`, background: r.fillLevel > 85 ? '#EF4444' : r.fillLevel > 60 ? '#F59E0B' : '#10B981' }} />
            </div>
            <span className="text-xs font-medium text-ink-600 dark:text-ink-300">{r.fillLevel}%</span>
          </div>
        ),
      },
      { key: 'status', header: t('status'), sortable: true, render: (r) => <StatusBadge status={r.status} /> },
      { key: 'lastEmptied', header: 'آخر تفريغ', sortable: true, render: (r) => <span className="text-xs text-ink-500">{new Date(r.lastEmptied).toLocaleDateString('ar-DZ')}</span> },
    ],
    formFields: [
      { key: 'code', label: 'الرمز', type: 'text', required: true, placeholder: 'CTN-XXXX' },
      { key: 'municipalityId', label: t('municipality'), type: 'select', required: true, options: municipalities.map((m) => ({ value: m.id, label: m.nameAr })) },
      { key: 'type', label: t('type'), type: 'select', required: true, options: [
        { value: 'standard', label: 'قياسية' }, { value: 'underground', label: 'تحت أرضية' },
        { value: 'recycling', label: 'إعادة تدوير' }, { value: 'organic', label: 'عضوية' },
      ]},
      { key: 'capacity', label: t('capacity'), type: 'number', required: true, placeholder: '240', min: 50, max: 5000, step: 10 },
      { key: 'fillLevel', label: 'نسبة الامتلاء', type: 'number', min: 0, max: 100, step: 1, placeholder: '0' },
      { key: 'status', label: t('status'), type: 'select', required: true, options: [
        { value: 'ok', label: 'سليم' }, { value: 'full', label: 'ممتلئ' },
        { value: 'damaged', label: 'تالف' }, { value: 'maintenance', label: 'صيانة' },
      ]},
      { key: 'lastEmptied', label: 'آخر تفريغ', type: 'date' },
      { key: 'coords', label: 'الإحداثيات', type: 'gps', colSpan: 2 },
    ],
    filters: [
      { key: 'status', label: t('status'), type: 'select', value: 'all', onChange: () => {}, options: [
        { value: 'ok', label: 'سليم' }, { value: 'full', label: 'ممتلئ' },
        { value: 'damaged', label: 'تالف' }, { value: 'maintenance', label: 'صيانة' },
      ]},
      { key: 'type', label: t('type'), type: 'select', value: 'all', onChange: () => {}, options: [
        { value: 'standard', label: 'قياسية' }, { value: 'underground', label: 'تحت أرضية' },
        { value: 'recycling', label: 'إعادة تدوير' }, { value: 'organic', label: 'عضوية' },
      ]},
      { key: 'municipality', label: t('municipality'), type: 'select', value: 'all', onChange: () => {}, options: municipalities.map((m) => ({ value: m.id, label: m.nameAr })) },
    ],
    stats: (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="إجمالي الحاويات" value={containers.length} icon={<Trash2 className="w-5 h-5" />} tone="brand" />
        <StatCard label="ممتلئة" value={containers.filter((c) => c.status === 'full').length} icon={<AlertTriangle className="w-5 h-5" />} tone="danger" />
        <StatCard label="تالفة" value={containers.filter((c) => c.status === 'damaged').length} icon={<Wrench className="w-5 h-5" />} tone="warning" />
        <StatCard label="في صيانة" value={containers.filter((c) => c.status === 'maintenance').length} icon={<Gauge className="w-5 h-5" />} tone="neutral" />
      </div>
    ),
  };

  return <CrudManager config={config} data={containers} />;
}
