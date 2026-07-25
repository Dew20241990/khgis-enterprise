import { Users, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { CrudManager, type CrudConfig } from '@/components/ui/CrudManager';
import { Badge, StatCard } from '@/components/ui';
import { useApp } from '@/store/appStore';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'suspended' | 'pending';
  lastLogin: string;
}

export const users: User[] = [
  { id: 'U-1', name: 'سفيان بن عمر', email: 's.benomar@khenchela.dz', role: 'مدير النظافة', department: 'مديرية البيئة', status: 'active', lastLogin: '2026-07-21T08:00:00Z' },
  { id: 'U-2', name: 'محمد خليفي', email: 'm.khelifi@khenchela.dz', role: 'مفتش بيئي', department: 'مديرية البيئة', status: 'active', lastLogin: '2026-07-21T07:30:00Z' },
  { id: 'U-3', name: 'عبد الرحمن مرزوق', email: 'a.merzoug@khenchela.dz', role: 'مفتش بيئي', department: 'مديرية البيئة', status: 'active', lastLogin: '2026-07-20T16:00:00Z' },
  { id: 'U-4', name: 'فاطمة بلقاسم', email: 'f.belkacem@khenchela.dz', role: 'مديرة بلدية', department: 'بلدية خنشلة', status: 'active', lastLogin: '2026-07-21T09:00:00Z' },
  { id: 'U-5', name: 'لخضر حمداني', email: 'l.hamdani@khenchela.dz', role: 'مدير CET', department: 'مركز الطرح قايس', status: 'active', lastLogin: '2026-07-21T06:00:00Z' },
  { id: 'U-6', name: 'رضا سعدي', email: 'r.saadi@khenchela.dz', role: 'مقاول', department: 'مؤسسة النظافة الذهبية', status: 'suspended', lastLogin: '2026-07-15T10:00:00Z' },
  { id: 'U-7', name: 'كمال عثماني', email: 'k.othmani@khenchela.dz', role: 'الأمين العام', department: 'الديوان', status: 'active', lastLogin: '2026-07-21T08:30:00Z' },
  { id: 'U-8', name: 'سمير لعروسي', email: 's.laroussi@khenchela.dz', role: 'مفتش بيئي', department: 'مديرية البيئة', status: 'pending', lastLogin: '2026-07-10T12:00:00Z' },
];

const config: CrudConfig<User> = {
  entityName: 'مستخدم',
  entityNamePlural: 'المستخدمون',
  icon: <Users className="w-5 h-5" />,
  rowKey: (u) => u.id,
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  columns: [
    { key: 'name', header: 'الاسم', sortable: true, searchable: true, width: 200, pinned: 'left', render: (u) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-success-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{u.name[0]}</div>
        <div>
          <p className="font-medium text-ink-800 dark:text-ink-100">{u.name}</p>
          <p className="text-xs text-ink-400">{u.email}</p>
        </div>
      </div>
    ) },
    { key: 'role', header: 'الدور', sortable: true, searchable: true, width: 140 },
    { key: 'department', header: 'المصلحة', sortable: true, searchable: true, width: 180 },
    { key: 'status', header: 'الحالة', sortable: true, width: 120, render: (u) => <Badge tone={u.status === 'active' ? 'success' : u.status === 'suspended' ? 'danger' : 'warning'} dot>{u.status === 'active' ? 'نشط' : u.status === 'suspended' ? 'موقوف' : 'معلق'}</Badge> },
    { key: 'lastLogin', header: 'آخر دخول', sortable: true, width: 140, exportValue: (u) => u.lastLogin, render: (u) => <span className="text-xs text-ink-500">{new Date(u.lastLogin).toLocaleDateString('ar-DZ')}</span> },
  ],
  formFields: [
    { key: 'name', label: 'الاسم الكامل', type: 'text', required: true, placeholder: 'سفيان بن عمر' },
    { key: 'email', label: 'البريد الإلكتروني', type: 'text', required: true, placeholder: 'name@khenchela.dz' },
    { key: 'role', label: 'الدور', type: 'select', required: true, options: [
      { value: 'مدير النظافة', label: 'مدير النظافة' }, { value: 'مفتش بيئي', label: 'مفتش بيئي' },
      { value: 'مدير بلدية', label: 'مدير بلدية' }, { value: 'مدير CET', label: 'مدير CET' },
      { value: 'مقاول', label: 'مقاول' }, { value: 'الأمين العام', label: 'الأمين العام' },
      { value: 'محلل بيانات', label: 'محلل بيانات' },
    ]},
    { key: 'department', label: 'المصلحة', type: 'text', required: true },
    { key: 'status', label: 'الحالة', type: 'select', required: true, options: [
      { value: 'active', label: 'نشط' }, { value: 'suspended', label: 'موقوف' }, { value: 'pending', label: 'معلق' },
    ]},
  ],
  filters: [
    { key: 'status', label: 'الحالة', type: 'select', value: 'all', onChange: () => {}, options: [
      { value: 'active', label: 'نشط' }, { value: 'suspended', label: 'موقوف' }, { value: 'pending', label: 'معلق' },
    ]},
    { key: 'role', label: 'الدور', type: 'select', value: 'all', onChange: () => {}, options: [
      { value: 'مدير النظافة', label: 'مدير النظافة' }, { value: 'مفتش بيئي', label: 'مفتش بيئي' },
      { value: 'مدير بلدية', label: 'مدير بلدية' }, { value: 'مدير CET', label: 'مدير CET' },
    ]},
  ],
};

export function UsersPage() {
  const { t } = useApp();
  return (
    <CrudManager
      config={{
        ...config,
        stats: (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <StatCard label={t('users')} value={users.length} icon={<Users className="w-5 h-5" />} tone="brand" />
            <StatCard label={t('active')} value={users.filter((u) => u.status === 'active').length} icon={<ShieldCheck className="w-5 h-5" />} tone="success" />
            <StatCard label="موقوف" value={users.filter((u) => u.status === 'suspended').length} icon={<ShieldAlert className="w-5 h-5" />} tone="danger" />
            <StatCard label={t('pending')} value={users.filter((u) => u.status === 'pending').length} icon={<Shield className="w-5 h-5" />} tone="warning" />
          </div>
        ),
      }}
      data={users}
    />
  );
}
