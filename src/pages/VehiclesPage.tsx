import { Truck, Fuel, Wrench, Gauge } from 'lucide-react';
import { CrudManager, type CrudConfig } from '@/components/ui/CrudManager';
import { StatusBadge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { vehicles, municipalities, type Vehicle } from '@/data/mockData';
import { useApp } from '@/store/appStore';

const typeLabels: Record<string, string> = { truck: 'شاحنة', compactor: 'ضاغط', sweeper: 'مكنسة', van: 'فان' };

export function VehiclesPage() {
  const { t } = useApp();

  const config: CrudConfig<Vehicle> = {
    entityName: 'مركبة',
    entityNamePlural: t('vehicles'),
    icon: <Truck className="w-5 h-5" />,
    rowKey: (r) => r.id,
    columns: [
      { key: 'plate', header: 'لوحة', sortable: true, searchable: true, render: (r) => <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">{r.plate}</span> },
      { key: 'type', header: t('type'), sortable: true, searchable: true, render: (r) => <span className="text-ink-600 dark:text-ink-300">{typeLabels[r.type]}</span> },
      { key: 'capacity', header: t('capacity'), sortable: true, render: (r) => <span className="text-ink-600 dark:text-ink-300">{r.capacity} م³</span> },
      { key: 'driver', header: 'السائق', searchable: true, render: (r) => <span className="text-ink-600 dark:text-ink-300">{r.driver}</span> },
      { key: 'municipality', header: t('municipality'), sortable: true, searchable: true, render: (r) => <span className="text-ink-600 dark:text-ink-300">{r.municipality}</span> },
      { key: 'fuel', header: 'الوقود', sortable: true, render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${r.fuel}%`, background: r.fuel < 20 ? '#EF4444' : r.fuel < 50 ? '#F59E0B' : '#10B981' }} />
          </div>
          <span className="text-xs text-ink-600 dark:text-ink-300">{r.fuel}%</span>
        </div>
      )},
      { key: 'status', header: t('status'), sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    ],
    formFields: [
      { key: 'plate', label: 'لوحة', type: 'text', required: true, placeholder: '40-XXXX-23' },
      { key: 'type', label: t('type'), type: 'select', required: true, options: [
        { value: 'truck', label: 'شاحنة' }, { value: 'compactor', label: 'ضاغط' },
        { value: 'sweeper', label: 'مكنسة' }, { value: 'van', label: 'فان' },
      ]},
      { key: 'capacity', label: t('capacity'), type: 'number', required: true, min: 1, max: 30, step: 1 },
      { key: 'driver', label: 'السائق', type: 'text' },
      { key: 'municipalityId', label: t('municipality'), type: 'select', options: municipalities.map((m) => ({ value: m.id, label: m.nameAr })) },
      { key: 'fuel', label: 'الوقود', type: 'number', min: 0, max: 100, step: 1 },
      { key: 'mileage', label: 'المسافة', type: 'number', min: 0, step: 100 },
      { key: 'status', label: t('status'), type: 'select', required: true, options: [
        { value: 'active', label: 'نشط' }, { value: 'idle', label: 'خامل' },
        { value: 'maintenance', label: 'صيانة' }, { value: 'offline', label: 'غير متصل' },
      ]},
      { key: 'coords', label: 'الإحداثيات', type: 'gps', colSpan: 2 },
    ],
    filters: [
      { key: 'status', label: t('status'), type: 'select', value: 'all', onChange: () => {}, options: [
        { value: 'active', label: 'نشط' }, { value: 'idle', label: 'خامل' },
        { value: 'maintenance', label: 'صيانة' }, { value: 'offline', label: 'غير متصل' },
      ]},
      { key: 'type', label: t('type'), type: 'select', value: 'all', onChange: () => {}, options: [
        { value: 'truck', label: 'شاحنة' }, { value: 'compactor', label: 'ضاغط' },
        { value: 'sweeper', label: 'مكنسة' }, { value: 'van', label: 'فان' },
      ]},
    ],
    stats: (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="إجمالي المركبات" value={vehicles.length} icon={<Truck className="w-5 h-5" />} tone="brand" />
        <StatCard label="نشطة" value={vehicles.filter((v) => v.status === 'active').length} icon={<Gauge className="w-5 h-5" />} tone="success" />
        <StatCard label="في صيانة" value={vehicles.filter((v) => v.status === 'maintenance').length} icon={<Wrench className="w-5 h-5" />} tone="warning" />
        <StatCard label="وقود منخفض" value={vehicles.filter((v) => v.fuel < 20).length} icon={<Fuel className="w-5 h-5" />} tone="danger" />
      </div>
    ),
  };

  return <CrudManager config={config} data={vehicles} />;
}
