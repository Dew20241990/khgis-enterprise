import { ShoppingBag, CheckCircle, XCircle, Clock } from 'lucide-react';
import { CrudManager, type CrudConfig } from '@/components/ui/CrudManager';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { shops, municipalities, type Shop } from '@/data/mockData';
import { useApp } from '@/store/appStore';

const contractLabels: Record<string, { tone: any; label: string }> = {
  active: { tone: 'success', label: 'ساري' },
  expired: { tone: 'danger', label: 'منتهي' },
  pending: { tone: 'warning', label: 'قيد الانتظار' },
};

export function ShopsPage() {
  const { t } = useApp();

  const config: CrudConfig<Shop> = {
    entityName: 'محل تجاري',
    entityNamePlural: t('shops'),
    icon: <ShoppingBag className="w-5 h-5" />,
    rowKey: (r) => r.id,
    columns: [
      { key: 'name', header: t('name'), sortable: true, searchable: true, render: (r) => <span className="font-medium text-ink-800 dark:text-ink-100">{r.name}</span> },
      { key: 'municipality', header: t('municipality'), sortable: true, searchable: true, render: (r) => <span className="text-ink-600 dark:text-ink-300">{r.municipality}</span> },
      { key: 'category', header: t('category'), sortable: true, searchable: true, render: (r) => <span className="text-ink-600 dark:text-ink-300">{r.category}</span> },
      { key: 'contractStatus', header: 'العقد', sortable: true, render: (r) => { const c = contractLabels[r.contractStatus]; return <Badge tone={c.tone}>{c.label}</Badge>; } },
      { key: 'feePaid', header: 'الرسوم', sortable: true, render: (r) => r.feePaid ? <Badge tone="success" dot>مدفوع</Badge> : <Badge tone="danger" dot>غير مدفوع</Badge> },
      { key: 'containers', header: 'الحاويات', sortable: true, render: (r) => <span className="text-xs text-ink-600 dark:text-ink-300">{r.containers}</span> },
      { key: 'inspections', header: 'تفتيشات', sortable: true, render: (r) => <span className="text-xs text-ink-600 dark:text-ink-300">{r.inspections}</span> },
      { key: 'lastInspection', header: 'آخر تفتيش', sortable: true, render: (r) => <span className="text-xs text-ink-500">{new Date(r.lastInspection).toLocaleDateString('ar-DZ')}</span> },
    ],
    formFields: [
      { key: 'name', label: t('name'), type: 'text', required: true },
      { key: 'municipalityId', label: t('municipality'), type: 'select', required: true, options: municipalities.map((m) => ({ value: m.id, label: m.nameAr })) },
      { key: 'category', label: t('category'), type: 'select', required: true, options: [
        { value: 'مطعم', label: 'مطعم' }, { value: 'مقهى', label: 'مقهى' },
        { value: 'سوبر ماركت', label: 'سوبر ماركت' }, { value: 'ملحمة', label: 'ملحمة' },
        { value: 'خباز', label: 'خباز' }, { value: 'صيدلية', label: 'صيدلية' }, { value: 'ملابس', label: 'ملابس' },
      ]},
      { key: 'contractStatus', label: 'حالة العقد', type: 'select', required: true, options: [
        { value: 'active', label: 'ساري' }, { value: 'expired', label: 'منتهي' }, { value: 'pending', label: 'قيد الانتظار' },
      ]},
      { key: 'feePaid', label: 'الرسوم مدفوعة', type: 'checkbox' },
      { key: 'containers', label: 'عدد الحاويات', type: 'number', min: 0, max: 20 },
      { key: 'coords', label: 'الإحداثيات', type: 'gps', colSpan: 2 },
    ],
    filters: [
      { key: 'contractStatus', label: 'العقد', type: 'select', value: 'all', onChange: () => {}, options: [
        { value: 'active', label: 'ساري' }, { value: 'expired', label: 'منتهي' }, { value: 'pending', label: 'قيد الانتظار' },
      ]},
      { key: 'category', label: t('category'), type: 'select', value: 'all', onChange: () => {}, options: [
        { value: 'مطعم', label: 'مطعم' }, { value: 'مقهى', label: 'مقهى' },
        { value: 'سوبر ماركت', label: 'سوبر ماركت' }, { value: 'ملحمة', label: 'ملحمة' },
        { value: 'خباز', label: 'خباز' }, { value: 'صيدلية', label: 'صيدلية' }, { value: 'ملابس', label: 'ملابس' },
      ]},
    ],
    stats: (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="إجمالي المحلات" value={shops.length} icon={<ShoppingBag className="w-5 h-5" />} tone="brand" />
        <StatCard label="عقود سارية" value={shops.filter((s) => s.contractStatus === 'active').length} icon={<CheckCircle className="w-5 h-5" />} tone="success" />
        <StatCard label="عقود منتهية" value={shops.filter((s) => s.contractStatus === 'expired').length} icon={<XCircle className="w-5 h-5" />} tone="danger" />
        <StatCard label="قيد الانتظار" value={shops.filter((s) => s.contractStatus === 'pending').length} icon={<Clock className="w-5 h-5" />} tone="warning" />
      </div>
    ),
  };

  return <CrudManager config={config} data={shops} />;
}
