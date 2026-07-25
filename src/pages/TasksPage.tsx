import { ListTodo, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { CrudManager, type CrudConfig } from '@/components/ui/CrudManager';
import { StatusBadge, PriorityBadge, StatCard } from '@/components/ui';
import { tasks, municipalities, type Task } from '@/data/mockData';
import { useApp } from '@/store/appStore';

const statusMap: Record<string, string> = { pending: 'pending', assigned: 'assigned', inProgress: 'inProgress', completed: 'completed' };

const config: CrudConfig<Task> = {
  entityName: 'مهمة',
  entityNamePlural: 'المهام',
  icon: <ListTodo className="w-5 h-5" />,
  rowKey: (r) => r.id,
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  columns: [
    { key: 'id', header: 'الرمز', sortable: true, searchable: true, width: 100, pinned: 'left', render: (r) => <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">{r.id}</span> },
    { key: 'title', header: 'العنوان', sortable: true, searchable: true, width: 220, render: (r) => <span className="font-medium text-ink-800 dark:text-ink-100">{r.title}</span> },
    { key: 'type', header: 'النوع', sortable: true, searchable: true, width: 100 },
    { key: 'municipality', header: 'البلدية', sortable: true, searchable: true, width: 120 },
    { key: 'assignee', header: 'المسؤول', searchable: true, width: 120 },
    { key: 'priority', header: 'الأولوية', sortable: true, width: 100, render: (r) => <PriorityBadge priority={r.priority} /> },
    { key: 'dueDate', header: 'الاستحقاق', sortable: true, width: 120, exportValue: (r) => r.dueDate, render: (r) => <span className="text-xs text-ink-500">{new Date(r.dueDate).toLocaleDateString('ar-DZ')}</span> },
    { key: 'status', header: 'الحالة', sortable: true, width: 120, render: (r) => <StatusBadge status={statusMap[r.status]} /> },
  ],
  formFields: [
    { key: 'title', label: 'العنوان', type: 'text', required: true, colSpan: 2 },
    { key: 'type', label: 'النوع', type: 'select', required: true, options: [
      { value: 'تنظيف', label: 'تنظيف' }, { value: 'إصلاح حاوية', label: 'إصلاح حاوية' },
      { value: 'تفريغ', label: 'تفريغ' }, { value: 'تفتيش', label: 'تفتيش' }, { value: 'متابعة', label: 'متابعة' },
    ]},
    { key: 'municipalityId', label: 'البلدية', type: 'select', required: true, options: municipalities.map((m) => ({ value: m.id, label: m.nameAr })) },
    { key: 'assignee', label: 'المسؤول', type: 'text', required: true },
    { key: 'priority', label: 'الأولوية', type: 'select', required: true, options: [
      { value: 'critical', label: 'حرج' }, { value: 'high', label: 'عالي' },
      { value: 'medium', label: 'متوسط' }, { value: 'low', label: 'منخفض' },
    ]},
    { key: 'status', label: 'الحالة', type: 'select', required: true, options: [
      { value: 'pending', label: 'قيد الانتظار' }, { value: 'assigned', label: 'مُسند' },
      { value: 'inProgress', label: 'قيد التنفيذ' }, { value: 'completed', label: 'مكتمل' },
    ]},
    { key: 'dueDate', label: 'تاريخ الاستحقاق', type: 'date' },
  ],
  filters: [
    { key: 'status', label: 'الحالة', type: 'select', value: 'all', onChange: () => {}, options: [
      { value: 'pending', label: 'قيد الانتظار' }, { value: 'assigned', label: 'مُسند' },
      { value: 'inProgress', label: 'قيد التنفيذ' }, { value: 'completed', label: 'مكتمل' },
    ]},
    { key: 'priority', label: 'الأولوية', type: 'select', value: 'all', onChange: () => {}, options: [
      { value: 'critical', label: 'حرج' }, { value: 'high', label: 'عالي' },
      { value: 'medium', label: 'متوسط' }, { value: 'low', label: 'منخفض' },
    ]},
  ],
};

export function TasksPage() {
  const { t } = useApp();
  return (
    <CrudManager
      config={{
        ...config,
        stats: (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <StatCard label="إجمالي المهام" value={tasks.length} icon={<ListTodo className="w-5 h-5" />} tone="brand" />
            <StatCard label="مكتملة" value={tasks.filter((t) => t.status === 'completed').length} icon={<CheckCircle2 className="w-5 h-5" />} tone="success" />
            <StatCard label="قيد التنفيذ" value={tasks.filter((t) => t.status === 'inProgress').length} icon={<Clock className="w-5 h-5" />} tone="warning" />
            <StatCard label="حرجة معلقة" value={tasks.filter((t) => t.priority === 'critical' && t.status !== 'completed').length} icon={<AlertCircle className="w-5 h-5" />} tone="danger" />
          </div>
        ),
      }}
      data={tasks}
    />
  );
}
