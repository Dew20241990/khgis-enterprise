import { Landmark, Users, Building2, MapPin, Phone, Mail, FileText, Download, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { useApp } from '@/store/appStore';

export function MunicipalityPage() {
  const { t } = useApp();
  const departments = [
    { name: 'مديرية النظافة', head: 'سفيان بن عمر', staff: 42, budget: '45 م.دج', color: 'brand' },
    { name: 'مديرية الأشغال', head: 'كريم عثماني', staff: 28, budget: '62 م.دج', color: 'success' },
    { name: 'مديرية التعمير', head: 'ليلى حمداني', staff: 19, budget: '38 م.دج', color: 'warning' },
    { name: 'مديرية البيئة', head: 'محمد خليفي', staff: 15, budget: '21 م.دج', color: 'danger' },
  ];

  const deptTones: Record<string, string> = {
    brand: 'bg-brand-50 dark:bg-brand-600/15 text-brand-600 dark:text-brand-300',
    success: 'bg-success-50 dark:bg-success-600/15 text-success-600 dark:text-success-300',
    warning: 'bg-warning-50 dark:bg-warning-600/15 text-warning-600 dark:text-warning-300',
    danger: 'bg-danger-50 dark:bg-danger-600/15 text-danger-600 dark:text-danger-300',
  };

  return (
    <div>
      <PageHeader
        title={t('municipality')} subtitle="بلدية خنشلة"
        icon={<Landmark className="w-5 h-5" />}
        actions={<button className="btn-outline"><Download className="w-4 h-4" /> {t('export')}</button>}
      />

      {/* Municipality profile banner */}
      <Card className="mb-5 overflow-hidden">
        <div className="relative bg-gradient-to-l from-brand-700 to-success-600 p-6 text-white">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Landmark className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">بلدية خنشلة</h2>
              <p className="text-white/80 text-sm mt-1">ولاية خنشلة · رمز بلدي 4001</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> 21 حي</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> 118,000 ساكن</span>
                <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> 612 حاوية</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> 032 31 00 00</span>
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> contact@apc-khenchela.dz</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="المديريات" value={4} icon={<Building2 className="w-5 h-5" />} tone="brand" />
        <StatCard label="إجمالي الموظفين" value={104} icon={<Users className="w-5 h-5" />} tone="success" />
        <StatCard label="الميزانية 2026" value="166 م.دج" icon={<FileText className="w-5 h-5" />} tone="warning" />
        <StatCard label="معدل التنفيذ" value="78%" icon={<CheckCircle2 className="w-5 h-5" />} tone="neutral" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {departments.map((d) => (
          <Card key={d.name} hover>
            <CardBody>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl2 flex items-center justify-center ${deptTones[d.color]}`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-900 dark:text-white">{d.name}</p>
                    <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">المدير: {d.head}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/40">
                  <p className="text-xs text-ink-400">الموظفون</p>
                  <p className="text-lg font-bold text-ink-800 dark:text-ink-100 mt-0.5">{d.staff}</p>
                </div>
                <div className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/40">
                  <p className="text-xs text-ink-400">الميزانية</p>
                  <p className="text-lg font-bold text-ink-800 dark:text-ink-100 mt-0.5">{d.budget}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
