import { useState } from 'react';
import {
  FileBarChart, FileText, FileSpreadsheet, Printer, Download, Calendar, Filter,
  AlertTriangle, Trash2, Truck, ClipboardCheck, TrendingUp, MapPin,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { blackSpotTrend, wasteCollected, containerTypeDist, fillRateByDistrict } from '@/data/mockData';
import { useApp } from '@/store/appStore';

const tip = { borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.92)', color: '#fff', fontSize: 12, padding: '8px 12px' };

export function ReportsPage() {
  const { t } = useApp();
  const [period, setPeriod] = useState('جويلية 2026');

  const reportTypes = [
    { icon: <AlertTriangle className="w-5 h-5" />, title: 'تقرير النقاط السوداء', desc: 'تحليل شامل للنقاط السوداء', count: 48, color: 'danger' },
    { icon: <Trash2 className="w-5 h-5" />, title: 'تقرير الحاويات', desc: 'حالة وامتلاء الحاويات', count: 1011, color: 'brand' },
    { icon: <Truck className="w-5 h-5" />, title: 'تقرير المركبات', desc: 'استغلال وصيانة المركبات', count: 24, color: 'success' },
    { icon: <ClipboardCheck className="w-5 h-5" />, title: 'تقرير التفتيش', desc: 'جولات ونتائج المفتشين', count: 40, color: 'warning' },
    { icon: <MapPin className="w-5 h-5" />, title: 'تقرير الأحياء', desc: 'أداء الأحياء الحضرية', count: 6, color: 'brand' },
    { icon: <TrendingUp className="w-5 h-5" />, title: 'تقرير الأداء', desc: 'مؤشرات الأداء الرئيسية', count: 5, color: 'success' },
  ];

  const colorMap: Record<string, string> = {
    brand: 'bg-brand-50 dark:bg-brand-600/15 text-brand-600 dark:text-brand-300',
    success: 'bg-success-50 dark:bg-success-600/15 text-success-600 dark:text-success-300',
    warning: 'bg-warning-50 dark:bg-warning-600/15 text-warning-600 dark:text-warning-300',
    danger: 'bg-danger-50 dark:bg-danger-600/15 text-danger-600 dark:text-danger-300',
  };

  return (
    <div>
      <PageHeader
        title={t('reports')} subtitle="تقارير شهرية وتحليلية"
        icon={<FileBarChart className="w-5 h-5" />}
        actions={
          <>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input sm:w-44">
              <option>جويلية 2026</option><option>جوان 2026</option><option>ماي 2026</option><option>أفريل 2026</option>
            </select>
            <button className="btn-outline"><Printer className="w-4 h-4" /> {t('print')}</button>
            <button className="btn-primary"><Download className="w-4 h-4" /> {t('export')}</button>
          </>
        }
      />

      {/* Export buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="text-sm text-ink-500 dark:text-ink-400">تصدير بصيغة:</span>
        <button className="btn-outline text-sm"><FileText className="w-4 h-4 text-danger-500" /> {t('exportPdf')}</button>
        <button className="btn-outline text-sm"><FileSpreadsheet className="w-4 h-4 text-success-500" /> {t('exportExcel')}</button>
        <button className="btn-outline text-sm"><FileText className="w-4 h-4 text-brand-500" /> {t('exportWord')}</button>
      </div>

      {/* Report types grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {reportTypes.map((r) => (
          <Card key={r.title} hover>
            <CardBody>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl2 flex items-center justify-center ${colorMap[r.color]}`}>{r.icon}</div>
                <Badge tone="neutral">{r.count} سجل</Badge>
              </div>
              <p className="text-sm font-semibold text-ink-900 dark:text-white">{r.title}</p>
              <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{r.desc}</p>
              <div className="flex items-center gap-2 mt-4">
                <button className="btn-outline text-xs flex-1"><Download className="w-3.5 h-3.5" /> تحميل</button>
                <button className="btn-ghost text-xs"><Printer className="w-3.5 h-3.5" /></button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Report preview / print layout */}
      <Card>
        <CardHeader title="معاينة التقرير" subtitle={period} icon={<FileText className="w-4 h-4" />} action={<Badge tone="brand" dot>جاهز للتصدير</Badge>} />
        <CardBody>
          {/* Print-style header */}
          <div className="border-b-2 border-ink-200 dark:border-ink-800 pb-4 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-400">الجمهورية الجزائرية الديمقراطية الشعبية</p>
                <p className="text-sm font-bold text-ink-900 dark:text-white mt-1">ولاية خنشلة — مديرية النظافة الحضرية</p>
                <p className="text-xs text-ink-500 mt-0.5">التقرير الشهري — {period}</p>
              </div>
              <div className="text-left">
                <p className="text-xs text-ink-400">رقم المرجع</p>
                <p className="text-sm font-mono font-semibold text-ink-800 dark:text-ink-100">RPT-2026-07-001</p>
              </div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'نقاط سوداء محلولة', value: '58', tone: 'success' },
              { label: 'نقاط مفتوحة', value: '39', tone: 'danger' },
              { label: 'نفايات مجمعة (طن)', value: '4,780', tone: 'warning' },
              { label: 'جولات تفتيش', value: '40', tone: 'brand' },
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-xl border border-ink-200 dark:border-ink-800">
                <p className="text-xs text-ink-500 dark:text-ink-400">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.tone === 'success' ? 'text-success-600' : s.tone === 'danger' ? 'text-danger-600' : s.tone === 'warning' ? 'text-warning-600' : 'text-brand-600'}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <p className="text-sm font-semibold text-ink-800 dark:text-ink-100 mb-3">تطور النقاط السوداء</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={blackSpotTrend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <defs><linearGradient id="r1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.3} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tip} />
                  <Area type="monotone" dataKey="resolved" name="محلولة" stroke="#10B981" strokeWidth={2} fill="url(#r1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-800 dark:text-ink-100 mb-3">النفايات المجموعة (طن)</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={wasteCollected} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tip} cursor={{ fill: 'rgba(37,99,235,0.06)' }} />
                  <Bar dataKey="tons" name="طن" radius={[6, 6, 0, 0]} fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-800 dark:text-ink-100 mb-3">توزيع الحاويات</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={containerTypeDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                    {containerTypeDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-800 dark:text-ink-100 mb-3">الامتلاء حسب الحي</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={fillRateByDistrict} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tip} cursor={{ fill: 'rgba(37,99,235,0.06)' }} />
                  <Bar dataKey="rate" name="نسبة" radius={[6, 6, 0, 0]} fill="#2563EB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Signature footer */}
          <div className="grid grid-cols-2 gap-8 mt-8 pt-5 border-t border-ink-200 dark:border-ink-800">
            <div>
              <p className="text-xs text-ink-400 mb-8">المفتش المسؤول</p>
              <div className="border-t border-ink-300 dark:border-ink-700 pt-1"><p className="text-xs font-medium text-ink-700 dark:text-ink-200">س. بن عمر</p></div>
            </div>
            <div>
              <p className="text-xs text-ink-400 mb-8">مدير النظافة</p>
              <div className="border-t border-ink-300 dark:border-ink-700 pt-1"><p className="text-xs font-medium text-ink-700 dark:text-ink-200">سفيان بن عمر</p></div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
