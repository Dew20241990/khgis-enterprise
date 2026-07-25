import { Shield, Download, ShieldCheck, ShieldAlert, Plus } from 'lucide-react';
import { PageHeader, Card, CardHeader, CardBody, Badge, DataTable, StatCard } from '@/components/ui';
import { useApp } from '@/store/appStore';

interface Role { id: string; name: string; description: string; users: number; permissions: number; color: string }

const roles: Role[] = [
  { id: 'R-1', name: 'الوالي', description: 'صلاحيات كاملة على المنصة', users: 1, permissions: 48, color: 'danger' },
  { id: 'R-2', name: 'الأمين العام', description: 'إدارة شاملة + التقارير', users: 1, permissions: 42, color: 'brand' },
  { id: 'R-3', name: 'مدير البيئة', description: 'إدارة العمليات والموارد', users: 2, permissions: 36, color: 'success' },
  { id: 'R-4', name: 'مفتش بيئي', description: 'جولات تفتيش + توثيق', users: 8, permissions: 18, color: 'warning' },
  { id: 'R-5', name: 'مدير بلدية', description: 'إدارة بلدية محددة', users: 26, permissions: 24, color: 'neutral' },
  { id: 'R-6', name: 'مدير CET', description: 'إدارة مركز طرح تقني', users: 3, permissions: 15, color: 'brand' },
  { id: 'R-7', name: 'مقاول', description: 'عرض العقود والمهام المسندة', users: 4, permissions: 8, color: 'neutral' },
  { id: 'R-8', name: 'محلل بيانات', description: 'قراءة + تصدير التقارير', users: 2, permissions: 12, color: 'success' },
];

export function RolesPage() {
  const { t } = useApp();

  return (
    <div className="space-y-6">
      <PageHeader title={t('roles')} subtitle="إدارة الأدوار الوظيفية" icon={<Shield className="w-5 h-5" />}
        actions={<>
          <button className="btn-outline"><Download className="w-4 h-4" /> {t('export')}</button>
          <button className="btn-primary"><Plus className="w-4 h-4" /> {t('add')}</button>
        </>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('roles')} value={roles.length} icon={<Shield className="w-5 h-5" />} tone="brand" />
        <StatCard label={t('users')} value={roles.reduce((a, r) => a + r.users, 0)} icon={<ShieldCheck className="w-5 h-5" />} tone="success" />
        <StatCard label="الصلاحيات" value={roles.reduce((a, r) => a + r.permissions, 0)} icon={<ShieldAlert className="w-5 h-5" />} tone="warning" />
        <StatCard label="أعلى صلاحية" value="الوالي" icon={<Shield className="w-5 h-5" />} tone="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {roles.map((r) => (
          <Card key={r.id} hover className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.color === 'danger' ? 'bg-danger-50 text-danger-600 dark:bg-danger-600/15 dark:text-danger-400' : r.color === 'brand' ? 'bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-400' : r.color === 'success' ? 'bg-success-50 text-success-600 dark:bg-success-600/15 dark:text-success-400' : r.color === 'warning' ? 'bg-warning-50 text-warning-600 dark:bg-warning-600/15 dark:text-warning-400' : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{r.name}</p>
                  <p className="text-xs text-ink-500 dark:text-ink-400">{r.description}</p>
                </div>
              </div>
              <Badge tone="neutral">{r.permissions} صلاحية</Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-ink-500 dark:text-ink-400">
              <span>{r.users} مستخدم</span>
              <button className="text-brand-600 dark:text-brand-400 hover:underline font-medium">{t('edit')}</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
