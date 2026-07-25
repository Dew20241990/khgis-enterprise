import { KeyRound, Download, Check, X, Plus } from 'lucide-react';
import { PageHeader, Card, CardHeader, CardBody, Badge, DataTable, StatCard } from '@/components/ui';
import { useApp } from '@/store/appStore';

interface Permission { id: string; module: string; action: string; roles: Record<string, boolean> }

const permData: Permission[] = [
  { id: 'P-1', module: 'لوحة القيادة', action: 'عرض', roles: { 'الوالي': true, 'الأمين العام': true, 'مدير البيئة': true, 'مفتش': true, 'مدير بلدية': true } },
  { id: 'P-2', module: 'الخريطة', action: 'عرض', roles: { 'الوالي': true, 'الأمين العام': true, 'مدير البيئة': true, 'مفتش': true, 'مدير بلدية': true } },
  { id: 'P-3', module: 'الخريطة', action: 'رسم', roles: { 'الوالي': true, 'الأمين العام': true, 'مدير البيئة': true, 'مفتش': false, 'مدير بلدية': false } },
  { id: 'P-4', module: 'النقاط السوداء', action: 'إضافة', roles: { 'الوالي': true, 'الأمين العام': true, 'مدير البيئة': true, 'مفتش': true, 'مدير بلدية': true } },
  { id: 'P-5', module: 'النقاط السوداء', action: 'حل', roles: { 'الوالي': true, 'الأمين العام': true, 'مدير البيئة': true, 'مفتش': false, 'مدير بلدية': true } },
  { id: 'P-6', module: 'التقارير', action: 'تصدير', roles: { 'الوالي': true, 'الأمين العام': true, 'مدير البيئة': true, 'مفتش': false, 'مدير بلدية': false } },
  { id: 'P-7', module: 'المستخدمون', action: 'إدارة', roles: { 'الوالي': true, 'الأمين العام': true, 'مدير البيئة': false, 'مفتش': false, 'مدير بلدية': false } },
  { id: 'P-8', module: 'الإعدادات', action: 'تعديل', roles: { 'الوالي': true, 'الأمين العام': true, 'مدير البيئة': false, 'مفتش': false, 'مدير بلدية': false } },
];

const roleKeys = ['الوالي', 'الأمين العام', 'مدير البيئة', 'مفتش', 'مدير بلدية'];

export function PermissionsPage() {
  const { t } = useApp();

  return (
    <div className="space-y-6">
      <PageHeader title={t('permissions')} subtitle="مصفوفة الصلاحيات حسب الدور" icon={<KeyRound className="w-5 h-5" />}
        actions={<button className="btn-outline"><Download className="w-4 h-4" /> {t('export')}</button>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="الوحدات" value={new Set(permData.map(p => p.module)).size} icon={<KeyRound className="w-5 h-5" />} tone="brand" />
        <StatCard label="الصلاحيات" value={permData.length} icon={<KeyRound className="w-5 h-5" />} tone="success" />
        <StatCard label="الأدوار" value={roleKeys.length} icon={<KeyRound className="w-5 h-5" />} tone="warning" />
        <StatCard label="ممنوحة" value={permData.reduce((a, p) => a + Object.values(p.roles).filter(Boolean).length, 0)} icon={<KeyRound className="w-5 h-5" />} tone="danger" />
      </div>

      <Card>
        <CardHeader title="مصفوفة الصلاحيات" icon={<KeyRound className="w-4 h-4" />} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 dark:border-ink-800">
                <th className="text-right px-4 py-3 text-xs font-semibold text-ink-500 uppercase">الوحدة</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-ink-500 uppercase">الإجراء</th>
                {roleKeys.map(r => <th key={r} className="text-center px-4 py-3 text-xs font-semibold text-ink-500 uppercase">{r}</th>)}
              </tr>
            </thead>
            <tbody>
              {permData.map((p) => (
                <tr key={p.id} className="border-b border-ink-100 dark:border-ink-800/60 hover:bg-ink-50 dark:hover:bg-ink-800/40">
                  <td className="px-4 py-3 font-medium text-ink-800 dark:text-ink-100">{p.module}</td>
                  <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{p.action}</td>
                  {roleKeys.map(r => (
                    <td key={r} className="text-center px-4 py-3">
                      {p.roles[r] ? <Check className="w-4 h-4 text-success-500 mx-auto" /> : <X className="w-4 h-4 text-ink-300 dark:text-ink-600 mx-auto" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
