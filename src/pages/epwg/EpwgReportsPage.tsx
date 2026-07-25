import { motion } from 'framer-motion';
import {
  FileText, FileBarChart, FileSpreadsheet, Calendar, Download, Printer,
  Building, Gauge, Leaf, FileWarning,
} from 'lucide-react';
import { PageHeader, Card, CardHeader, CardBody, Badge } from '@/components/ui';
import { useApp } from '@/store/appStore';
import { cn } from '@/lib/cn';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

interface ReportTemplate {
  id: string;
  title: string;
  titleAr: string;
  titleFr: string;
  description: string;
  descriptionAr: string;
  icon: React.ReactNode;
  tone: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
  period: string;
  periodAr: string;
}

const reportTemplates: ReportTemplate[] = [
  { id: 'daily', title: 'Daily Report', titleAr: 'تقرير يومي', titleFr: 'Rapport quotidien', description: 'Daily waste intake, collection volumes, and operational status across all facilities.', descriptionAr: 'معدّل النفايات اليومي وحجم الجمع والحالة التشغيلية عبر جميع المنشآت.', icon: <Calendar className="w-5 h-5" />, tone: 'brand', period: 'Daily', periodAr: 'يومي' },
  { id: 'weekly', title: 'Weekly Report', titleAr: 'تقرير أسبوعي', titleFr: 'Rapport hebdomadaire', description: 'Weekly aggregation of collection, sorting, and environmental metrics.', descriptionAr: 'تجميع أسبوعي لمؤشرات الجمع والفرز والمراقبة البيئية.', icon: <FileText className="w-5 h-5" />, tone: 'brand', period: 'Weekly', periodAr: 'أسبوعي' },
  { id: 'monthly', title: 'Monthly Report', titleAr: 'تقرير شهري', titleFr: 'Rapport mensuel', description: 'Comprehensive monthly performance review with KPIs and trend analysis.', descriptionAr: 'مراجعة شهرية شاملة للأداء مع المؤشرات وتحليل الاتجاهات.', icon: <FileBarChart className="w-5 h-5" />, tone: 'success', period: 'Monthly', periodAr: 'شهري' },
  { id: 'annual', title: 'Annual Report', titleAr: 'تقرير سنوي', titleFr: 'Rapport annuel', description: 'Yearly summary of all EPWG operations, capacity utilization, and environmental compliance.', descriptionAr: 'ملخص سنوي لجميع عمليات EPWG واستغلال الطاقة والامتثال البيئي.', icon: <FileSpreadsheet className="w-5 h-5" />, tone: 'neutral', period: 'Annual', periodAr: 'سنوي' },
  { id: 'facility', title: 'Facility Performance Report', titleAr: 'تقرير أداء المنشأة', titleFr: 'Rapport de performance d\'installation', description: 'Per-facility performance breakdown including capacity, throughput, and equipment status.', descriptionAr: 'تفصيل أداء كل منشأة يشمل الطاقة والإنتاجية وحالة المعدّات.', icon: <Building className="w-5 h-5" />, tone: 'brand', period: 'On-demand', periodAr: 'عند الطلب' },
  { id: 'capacity', title: 'Capacity Report', titleAr: 'تقرير الطاقة', titleFr: 'Rapport de capacité', description: 'Remaining capacity analysis and projected lifespan for each facility.', descriptionAr: 'تحليل الطاقة المتبقية والعمر المتوقع لكل منشأة.', icon: <Gauge className="w-5 h-5" />, tone: 'warning', period: 'Quarterly', periodAr: 'ربعي' },
  { id: 'environmental', title: 'Environmental Report', titleAr: 'تقرير بيئي', titleFr: 'Rapport environnemental', description: 'Groundwater, leachate, gas monitoring results and environmental compliance status.', descriptionAr: 'نتائج مراقبة المياه الجوفية والرشاحة والغاز وحالة الامتثال البيئي.', icon: <Leaf className="w-5 h-5" />, tone: 'success', period: 'Quarterly', periodAr: 'ربعي' },
];

const toneMap = {
  brand: 'from-brand-500/10 to-brand-500/5 text-brand-600 dark:text-brand-400',
  success: 'from-success-500/10 to-success-500/5 text-success-600 dark:text-success-400',
  warning: 'from-warning-500/10 to-warning-500/5 text-warning-600 dark:text-warning-400',
  danger: 'from-danger-500/10 to-danger-500/5 text-danger-600 dark:text-danger-400',
  neutral: 'from-ink-500/10 to-ink-500/5 text-ink-600 dark:text-ink-300',
};

export function EpwgReportsPage() {
  const { t, locale } = useApp();

  return (
    <div>
      <PageHeader title={t('epwgReports')} subtitle={locale === 'ar' ? 'تقارير EPWG — توليد وتصدير' : 'EPWG Reports — Generation & Export'} icon={<FileBarChart className="w-5 h-5" />} />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reportTemplates.map((r, i) => (
          <motion.div key={r.id} {...fadeUp} transition={{ duration: 0.3, delay: i * 0.04 }}>
            <Card hover className="h-full">
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <div className={cn('w-12 h-12 rounded-xl2 flex items-center justify-center bg-gradient-to-br', toneMap[r.tone])}>
                    {r.icon}
                  </div>
                  <Badge tone={r.tone}>{locale === 'ar' ? r.periodAr : r.period}</Badge>
                </div>
                <h3 className="text-sm font-bold text-ink-900 dark:text-white mb-1">{locale === 'ar' ? r.titleAr : r.title}</h3>
                <p className="text-xs text-ink-500 dark:text-ink-400 mb-4 leading-relaxed">{locale === 'ar' ? r.descriptionAr : r.description}</p>
                <div className="flex items-center gap-2 pt-3 border-t border-ink-100 dark:border-ink-800/60">
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-brand-500 text-white hover:bg-brand-600 transition">
                    <Download className="w-3.5 h-3.5" /> {locale === 'ar' ? 'تصدير PDF' : 'Export PDF'}
                  </button>
                  <button className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800 transition">
                    <Printer className="w-3.5 h-3.5" /> {locale === 'ar' ? 'طباعة' : 'Print'}
                  </button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent generated reports */}
      <Card className="mt-5">
        <CardHeader title={locale === 'ar' ? 'التقارير الأخيرة' : 'Recent Reports'} icon={<FileText className="w-4 h-4" />} />
        <CardBody>
          <div className="space-y-2">
            {[
              { name: 'Rapport mensuel — Juillet 2026', nameAr: 'تقرير شهري — جويلية 2026', date: '2026-07-25', size: '2.4 MB' },
              { name: 'Rapport environnemental Q2 2026', nameAr: 'تقرير بيئي ر2 2026', date: '2026-07-15', size: '3.8 MB' },
              { name: 'Rapport de capacité — Q2 2026', nameAr: 'تقرير الطاقة — ر2 2026', date: '2026-07-10', size: '1.9 MB' },
              { name: 'Rapport quotidien — 24 Juillet', nameAr: 'تقرير يومي — 24 جويلية', date: '2026-07-24', size: '850 KB' },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-ink-100 dark:border-ink-800/60 hover:bg-ink-50/50 dark:hover:bg-ink-800/30 transition">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-brand-100 dark:bg-brand-600/20 text-brand-600 dark:text-brand-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink-800 dark:text-ink-100">{locale === 'ar' ? r.nameAr : r.name}</p>
                  <p className="text-[10px] text-ink-400">{r.date} · {r.size}</p>
                </div>
                <button className="p-2 rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
