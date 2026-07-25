import { motion } from 'framer-motion';
import { TrendingUp, Truck, BarChart3, Calendar, MapPin } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from '@/components/charts/ChartKit';
import { PageHeader, StatCard, Card, CardHeader, CardBody, EnterpriseDataTable, type EnterpriseColumn } from '@/components/ui';
import {
  epwgStats, epwgMonthlyCollection, epwgDailyCollection,
  epwgWasteByMunicipality, epwgWasteByFacility,
} from '@/data/epwgData';
import { useApp } from '@/store/appStore';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export function EpwgCollectionPage() {
  const { t, locale } = useApp();

  const kpis = [
    { label: t('epwgDailyCollection'), value: `${epwgStats.dailyCollection} ط`, icon: <Truck className="w-5 h-5" />, tone: 'brand' as const, delta: 5 },
    { label: t('epwgMonthlyCollection'), value: `${epwgStats.monthlyCollection.toLocaleString()} ط`, icon: <TrendingUp className="w-5 h-5" />, tone: 'success' as const, delta: 6 },
    { label: t('epwgAnnualCollection'), value: `${(epwgStats.annualCollection / 1000).toFixed(1)}k ط`, icon: <Calendar className="w-5 h-5" />, tone: 'neutral' as const },
    { label: t('epwgMunicipalitiesCovered'), value: 21, icon: <MapPin className="w-5 h-5" />, tone: 'brand' as const },
  ];

  const muniColumns: EnterpriseColumn<typeof epwgWasteByMunicipality[number]>[] = [
    { key: 'name', header: locale === 'ar' ? 'البلدية' : 'Municipality', sortable: true, searchable: true, pinned: 'left',
      render: (r) => <span className="text-sm font-medium">{locale === 'ar' ? r.name : r.nameFr}</span>,
      exportValue: (r) => locale === 'ar' ? r.name : r.nameFr },
    { key: 'tons', header: locale === 'ar' ? 'النفايات (ط/ي)' : 'Waste (t/d)', sortable: true, width: 140, align: 'left',
      render: (r) => <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">{r.tons}</span> },
    { key: 'bar', header: locale === 'ar' ? 'النسبة' : 'Share', width: 200,
      render: (r) => {
        const max = Math.max(...epwgWasteByMunicipality.map((m) => m.tons));
        const pct = Math.round((r.tons / max) * 100);
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden min-w-[80px]">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-ink-400">{pct}%</span>
          </div>
        );
      } },
  ];

  return (
    <div>
      <PageHeader title={t('epwgCollection')} subtitle={locale === 'ar' ? 'إحصائيات جمع النفايات عبر ولاية خنشلة' : 'Waste collection statistics across Khenchela'} icon={<BarChart3 className="w-5 h-5" />} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {kpis.map((kpi, i) => (
          <motion.div key={i} {...fadeUp} transition={{ duration: 0.25, delay: i * 0.03 }}>
            <StatCard label={kpi.label} value={kpi.value} icon={kpi.icon} tone={kpi.tone} delta={kpi.delta} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card>
          <CardHeader title={t('epwgMonthlyCollection')} icon={<TrendingUp className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={epwgMonthlyCollection}>
                <defs>
                  <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0F4C81" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="tons" stroke="#0F4C81" strokeWidth={2.5} fill="url(#colGrad)" name={locale === 'ar' ? 'طن' : 'Tons'} />
                <Area type="monotone" dataKey="trips" stroke="#16A34A" strokeWidth={2} fill="none" name={locale === 'ar' ? 'رحلات' : 'Trips'} />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={locale === 'ar' ? 'الجمع اليومي — جويلية' : 'Daily Collection — July'} icon={<Calendar className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={epwgDailyCollection}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fontSize: 9 }} interval={4} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="tons" stroke="#F59E0B" strokeWidth={2} dot={false} name={locale === 'ar' ? 'طن' : 'Tons'} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card>
          <CardHeader title={t('epwgWasteByMunicipality')} icon={<MapPin className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={epwgWasteByMunicipality} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="tons" radius={[0, 6, 6, 0]} fill="#0F4C81" name={locale === 'ar' ? 'طن/ي' : 't/d'} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t('epwgWasteByFacility')} icon={<BarChart3 className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={epwgWasteByFacility}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="daily" stackId="a" fill="#0F4C81" name={t('epwgDailyWaste')} />
                <Bar dataKey="monthly" stackId="a" fill="#16A34A" name={t('epwgMonthlyWaste')} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title={t('epwgWasteByMunicipality')} subtitle={locale === 'ar' ? 'جدول تفصيلي' : 'Detailed table'} icon={<MapPin className="w-4 h-4" />} />
        <CardBody>
          <EnterpriseDataTable
            columns={muniColumns}
            rows={epwgWasteByMunicipality}
            rowKey={(r) => r.name}
            pageSize={10}
            title={t('epwgWasteByMunicipality')}
            onPrint={() => window.print()}
          />
        </CardBody>
      </Card>
    </div>
  );
}
