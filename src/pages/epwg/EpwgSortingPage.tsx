import { motion } from 'framer-motion';
import { Recycle, Leaf, Trash2, TrendingUp, Percent } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from '@/components/charts/ChartKit';
import { PageHeader, StatCard, Card, CardHeader, CardBody, Badge, EnterpriseDataTable, type EnterpriseColumn } from '@/components/ui';
import { epwgSortingRecords, epwgFacilities, epwgRecyclingRate, epwgStats } from '@/data/epwgData';
import { useApp } from '@/store/appStore';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export function EpwgSortingPage() {
  const { t, locale } = useApp();

  const facilityName = (id: string) => {
    const f = epwgFacilities.find((x) => x.id === id);
    return f ? (locale === 'ar' ? f.nameAr : f.nameFr) : id;
  };

  const totalInput = epwgSortingRecords.reduce((s, r) => s + r.inputTons, 0);
  const totalSorted = epwgSortingRecords.reduce((s, r) => s + r.sortedTons, 0);
  const totalRecycled = epwgSortingRecords.reduce((s, r) => s + r.recycledTons, 0);
  const totalComposted = epwgSortingRecords.reduce((s, r) => s + r.compostedTons, 0);
  const avgRecovery = Math.round((totalRecycled + totalComposted) / totalInput * 100);

  const kpis = [
    { label: locale === 'ar' ? 'إجمالي المدخلات' : 'Total Input', value: `${totalInput.toLocaleString()} ط`, icon: <Trash2 className="w-5 h-5" />, tone: 'brand' as const },
    { label: locale === 'ar' ? 'إجمالي المفرز' : 'Total Sorted', value: `${totalSorted.toLocaleString()} ط`, icon: <Recycle className="w-5 h-5" />, tone: 'warning' as const },
    { label: locale === 'ar' ? 'إجمالي المعاد تدويره' : 'Total Recycled', value: `${totalRecycled.toLocaleString()} ط`, icon: <Recycle className="w-5 h-5" />, tone: 'success' as const, delta: 8 },
    { label: t('epwgRecyclingRate'), value: `${avgRecovery}%`, icon: <Percent className="w-5 h-5" />, tone: 'success' as const, delta: 4 },
  ];

  // Aggregate by month
  const monthlyAgg = ['فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية'].map((month, mi) => {
    const records = epwgSortingRecords.filter((r) => r.date === month);
    return {
      month,
      input: records.reduce((s, r) => s + r.inputTons, 0),
      sorted: records.reduce((s, r) => s + r.sortedTons, 0),
      recycled: records.reduce((s, r) => s + r.recycledTons, 0),
      composted: records.reduce((s, r) => s + r.compostedTons, 0),
    };
  });

  const columns: EnterpriseColumn<typeof epwgSortingRecords[number]>[] = [
    { key: 'facilityId', header: t('epwgFacilities'), sortable: true, searchable: true, pinned: 'left',
      render: (r) => <span className="text-sm font-medium">{facilityName(r.facilityId)}</span>,
      exportValue: (r) => facilityName(r.facilityId) },
    { key: 'date', header: locale === 'ar' ? 'الشهر' : 'Month', sortable: true, width: 100,
      render: (r) => <span className="text-xs">{r.date}</span> },
    { key: 'inputTons', header: locale === 'ar' ? 'المدخلات' : 'Input', sortable: true, width: 110, align: 'left',
      render: (r) => <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">{r.inputTons}</span> },
    { key: 'sortedTons', header: locale === 'ar' ? 'المفرز' : 'Sorted', sortable: true, width: 110, align: 'left',
      render: (r) => <span className="text-sm font-semibold text-warning-600 dark:text-warning-400">{r.sortedTons}</span> },
    { key: 'recycledTons', header: locale === 'ar' ? 'المعاد تدويره' : 'Recycled', sortable: true, width: 120, align: 'left',
      render: (r) => <span className="text-sm font-semibold text-success-600 dark:text-success-400">{r.recycledTons}</span> },
    { key: 'compostedTons', header: locale === 'ar' ? 'المسمّد' : 'Composted', sortable: true, width: 110, align: 'left',
      render: (r) => <span className="text-sm font-semibold text-accent-600 dark:text-accent-400">{r.compostedTons}</span> },
    { key: 'recoveryRate', header: locale === 'ar' ? 'نسبة الاسترجاع' : 'Recovery Rate', sortable: true, width: 140,
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden min-w-[60px]">
            <div className="h-full rounded-full bg-gradient-to-r from-success-500 to-success-600" style={{ width: `${r.recoveryRate}%` }} />
          </div>
          <span className="text-[10px] font-semibold text-ink-500">{r.recoveryRate}%</span>
        </div>
      ) },
  ];

  return (
    <div>
      <PageHeader title={t('epwgSorting')} subtitle={locale === 'ar' ? 'الفرز وإعادة التدوير والتسميد عبر منشآت EPWG' : 'Sorting, recycling & composting across EPWG facilities'} icon={<Recycle className="w-5 h-5" />} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {kpis.map((kpi, i) => (
          <motion.div key={i} {...fadeUp} transition={{ duration: 0.25, delay: i * 0.03 }}>
            <StatCard label={kpi.label} value={kpi.value} icon={kpi.icon} tone={kpi.tone} delta={kpi.delta} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card>
          <CardHeader title={t('epwgSortingPerformance')} icon={<Recycle className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyAgg}>
                <defs>
                  <linearGradient id="sortGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="input" stroke="#0F4C81" strokeWidth={2} fill="none" name={locale === 'ar' ? 'مدخلات' : 'Input'} />
                <Area type="monotone" dataKey="sorted" stroke="#F59E0B" strokeWidth={2} fill="none" name={locale === 'ar' ? 'مفرز' : 'Sorted'} />
                <Area type="monotone" dataKey="recycled" stroke="#16A34A" strokeWidth={2.5} fill="url(#sortGrad)" name={locale === 'ar' ? 'معاد تدويره' : 'Recycled'} />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t('epwgRecoveryPerformance')} icon={<Leaf className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={epwgRecyclingRate} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3}>
                  {epwgRecyclingRate.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title={t('epwgSortingPerformance')} subtitle={locale === 'ar' ? 'سجلات الفرز الشهرية' : 'Monthly sorting records'} icon={<TrendingUp className="w-4 h-4" />} />
        <CardBody>
          <EnterpriseDataTable
            columns={columns}
            rows={epwgSortingRecords}
            rowKey={(r) => r.id}
            pageSize={10}
            title={t('epwgSorting')}
            onPrint={() => window.print()}
          />
        </CardBody>
      </Card>
    </div>
  );
}
