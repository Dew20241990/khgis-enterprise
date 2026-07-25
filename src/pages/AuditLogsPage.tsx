import { ScrollText, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { CrudManager, type CrudConfig } from '@/components/ui/CrudManager';
import { Badge, StatCard } from '@/components/ui';
import { useApp } from '@/store/appStore';

export interface LogEntry {
  id: string;
  user: string;
  action: string;
  module: string;
  ip: string;
  timestamp: string;
  level: 'info' | 'warning' | 'danger';
}

export const logs: LogEntry[] = Array.from({ length: 40 }, (_, i) => {
  const actions = ['تسجيل دخول', 'إضافة نقطة سوداء', 'تعديل حاوية', 'حذف تقرير', 'تصدير بيانات', 'تغيير صلاحية', 'حل نقطة سوداء', 'إضافة مستخدم'];
  const modules = ['لوحة القيادة', 'الخريطة', 'النقاط السوداء', 'الحاويات', 'التقارير', 'المستخدمون', 'الإعدادات'];
  const users = ['س. بن عمر', 'م. خليفي', 'ف. بلقاسم', 'ل. حمداني', 'ك. عثماني'];
  return {
    id: `L-${i + 1}`,
    user: users[i % users.length],
    action: actions[i % actions.length],
    module: modules[i % modules.length],
    ip: `192.168.${10 + (i % 50)}.${1 + (i % 200)}`,
    timestamp: new Date(2026, 6, 21, 8 + (i % 10), (i * 7) % 60).toISOString(),
    level: (['info', 'info', 'warning', 'info', 'danger', 'info'] as LogEntry['level'][])[i % 6],
  };
});

const config: CrudConfig<LogEntry> = {
  entityName: 'سجل',
  entityNamePlural: 'سجلات التدقيق',
  icon: <ScrollText className="w-5 h-5" />,
  rowKey: (l) => l.id,
  allowCreate: false,
  allowEdit: false,
  allowDelete: true,
  allowDuplicate: false,
  allowArchive: false,
  columns: [
    { key: 'timestamp', header: 'الوقت', sortable: true, width: 180, pinned: 'left', exportValue: (l) => l.timestamp, render: (l) => <span className="text-xs text-ink-500 font-mono">{new Date(l.timestamp).toLocaleString('ar-DZ')}</span> },
    { key: 'user', header: 'المستخدم', sortable: true, searchable: true, width: 140, render: (l) => <span className="font-medium text-ink-800 dark:text-ink-100">{l.user}</span> },
    { key: 'action', header: 'الإجراء', searchable: true, width: 160 },
    { key: 'module', header: 'الوحدة', sortable: true, searchable: true, width: 140, render: (l) => <Badge tone="neutral">{l.module}</Badge> },
    { key: 'ip', header: 'IP', width: 150, render: (l) => <span className="font-mono text-xs text-ink-500">{l.ip}</span> },
    { key: 'level', header: 'المستوى', sortable: true, width: 120, render: (l) => <Badge tone={l.level === 'danger' ? 'danger' : l.level === 'warning' ? 'warning' : 'success'} dot>{l.level === 'danger' ? 'حرج' : l.level === 'warning' ? 'تحذير' : 'معلومة'}</Badge> },
  ],
  formFields: [],
  filters: [
    { key: 'level', label: 'المستوى', type: 'select', value: 'all', onChange: () => {}, options: [
      { value: 'info', label: 'معلومة' }, { value: 'warning', label: 'تحذير' }, { value: 'danger', label: 'حرج' },
    ]},
    { key: 'module', label: 'الوحدة', type: 'select', value: 'all', onChange: () => {}, options: [
      { value: 'لوحة القيادة', label: 'لوحة القيادة' }, { value: 'الخريطة', label: 'الخريطة' },
      { value: 'النقاط السوداء', label: 'النقاط السوداء' }, { value: 'الحاويات', label: 'الحاويات' },
      { value: 'التقارير', label: 'التقارير' }, { value: 'المستخدمون', label: 'المستخدمون' },
    ]},
  ],
};

export function AuditLogsPage() {
  const { t } = useApp();
  return (
    <CrudManager
      config={{
        ...config,
        stats: (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <StatCard label="إجمالي السجلات" value={logs.length} icon={<ScrollText className="w-5 h-5" />} tone="brand" />
            <StatCard label="معلومات" value={logs.filter((l) => l.level === 'info').length} icon={<Info className="w-5 h-5" />} tone="success" />
            <StatCard label="تحذيرات" value={logs.filter((l) => l.level === 'warning').length} icon={<AlertTriangle className="w-5 h-5" />} tone="warning" />
            <StatCard label="حرج" value={logs.filter((l) => l.level === 'danger').length} icon={<AlertCircle className="w-5 h-5" />} tone="danger" />
          </div>
        ),
      }}
      data={logs}
    />
  );
}
