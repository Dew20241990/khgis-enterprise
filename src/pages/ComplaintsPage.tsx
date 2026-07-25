import { MessageSquare, Inbox, Eye, CheckCircle } from 'lucide-react';
import { CrudManager, type CrudConfig } from '@/components/ui/CrudManager';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { complaints, municipalities, type Complaint } from '@/data/mockData';
import { useApp } from '@/store/appStore';

export function ComplaintsPage() {
  const { t } = useApp();

  const config: CrudConfig<Complaint> = {
    entityName: 'شكوى',
    entityNamePlural: t('complaints'),
    icon: <MessageSquare className="w-5 h-5" />,
    rowKey: (r) => r.id,
    columns: [
      { key: 'code', header: 'الرمز', sortable: true, searchable: true, render: (r) => <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">{r.code}</span> },
      { key: 'citizen', header: 'المواطن', searchable: true, render: (r) => <span className="text-ink-600 dark:text-ink-300">{r.citizen}</span> },
      { key: 'municipality', header: t('municipality'), sortable: true, searchable: true, render: (r) => <span className="text-ink-600 dark:text-ink-300">{r.municipality}</span> },
      { key: 'category', header: t('category'), sortable: true, searchable: true, render: (r) => <span className="text-ink-600 dark:text-ink-300">{r.category}</span> },
      { key: 'priority', header: t('priority'), sortable: true, render: (r) => <PriorityBadge priority={r.priority} /> },
      { key: 'status', header: t('status'), sortable: true, render: (r) => <StatusBadge status={r.status} /> },
      { key: 'date', header: t('date'), sortable: true, render: (r) => <span className="text-xs text-ink-500">{new Date(r.date).toLocaleDateString('ar-DZ')}</span> },
    ],
    formFields: [
      { key: 'code', label: 'الرمز', type: 'text', required: true, placeholder: 'CM-XXXX' },
      { key: 'citizen', label: 'المواطن', type: 'text', required: true },
      { key: 'municipalityId', label: t('municipality'), type: 'select', required: true, options: municipalities.map((m) => ({ value: m.id, label: m.nameAr })) },
      { key: 'category', label: t('category'), type: 'select', required: true, options: [
        { value: 'تراكم نفايات', label: 'تراكم نفايات' },
        { value: 'حاوية مكسورة', label: 'حاوية مكسورة' },
        { value: 'روائح كريهة', label: 'روائح كريهة' },
        { value: 'تفريغ عشوائي', label: 'تفريغ عشوائي' },
        { value: 'عدم جمع النفايات', label: 'عدم جمع النفايات' },
      ]},
      { key: 'priority', label: t('priority'), type: 'select', required: true, options: [
        { value: 'critical', label: 'حرج' }, { value: 'high', label: 'عالي' },
        { value: 'medium', label: 'متوسط' }, { value: 'low', label: 'منخفض' },
      ]},
      { key: 'status', label: t('status'), type: 'select', required: true, options: [
        { value: 'new', label: 'جديد' }, { value: 'reviewing', label: 'قيد المراجعة' },
        { value: 'assigned', label: 'مُسند' }, { value: 'resolved', label: 'تم الحل' },
      ]},
      { key: 'date', label: t('date'), type: 'date' },
      { key: 'description', label: 'الوصف', type: 'textarea', colSpan: 2 },
      { key: 'coords', label: 'الإحداثيات', type: 'gps', colSpan: 2 },
    ],
    stats: (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="إجمالي الشكاوى" value={complaints.length} icon={<MessageSquare className="w-5 h-5" />} tone="brand" />
        <StatCard label="جديدة" value={complaints.filter((c) => c.status === 'new').length} icon={<Inbox className="w-5 h-5" />} tone="warning" />
        <StatCard label="قيد المراجعة" value={complaints.filter((c) => c.status === 'reviewing').length} icon={<Eye className="w-5 h-5" />} tone="brand" />
        <StatCard label="تم حلها" value={complaints.filter((c) => c.status === 'resolved').length} icon={<CheckCircle className="w-5 h-5" />} tone="success" />
      </div>
    ),
  };

  return <CrudManager config={config} data={complaints} />;
}
