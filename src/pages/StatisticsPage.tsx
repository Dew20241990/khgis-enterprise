import { PieChart, Download, TrendingUp, BarChart3, Activity, MapPin } from 'lucide-react';
import { PageHeader, Card, CardHeader, CardBody, StatCard } from '@/components/ui';
import { BarChart, Bar, PieChart as RPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from '@/components/charts/ChartKit';
import { useApp } from '@/store/appStore';
import { blackSpots, containers, municipalities, blackSpotTrend, wasteCollected, containerTypeDist, performanceIndicators } from '@/data/mockData';

export function StatisticsPage() {
  const { t } = useApp();

  return (
    <div className="space-y-6">
      <PageHeader title={t('statistics')} subtitle="إحصائيات شاملة — ولاية خنشلة" icon={<PieChart className="w-5 h-5" />}
        actions={<button className="btn-outline"><Download className="w-4 h-4" /> {t('export')}</button>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('kpiTotalSpots')} value={blackSpots.length} icon={<TrendingUp className="w-5 h-5" />} tone="danger" />
        <StatCard label={t('kpiContainers')} value={containers.length} icon={<BarChart3 className="w-5 h-5" />} tone="brand" />
        <StatCard label={t('municipalities')} value={municipalities.length} icon={<MapPin className="w-5 h-5" />} tone="success" />
        <StatCard label="أطنان/شهر" value={wasteCollected[wasteCollected.length - 1].tons.toLocaleString()} icon={<Activity className="w-5 h-5" />} tone="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="تطور النقاط السوداء" icon={<TrendingUp className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={blackSpotTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.92)', color: '#fff', fontSize: 12 }} cursor={{ fill: 'rgba(15,76,129,0.06)' }} />
                <Bar dataKey="open" name="مفتوحة" fill="#DC2626" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="resolved" name="تم حلها" fill="#16A34A" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="توزيع الحاويات" icon={<PieChart className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <RPie>
                <Pie data={containerTypeDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} label>
                  {containerTypeDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.92)', color: '#fff', fontSize: 12 }} />
              </RPie>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="النفايات المجموعة" subtitle="بالأطنان" icon={<BarChart3 className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={wasteCollected} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.92)', color: '#fff', fontSize: 12 }} cursor={{ fill: 'rgba(15,76,129,0.06)' }} />
                <Bar dataKey="tons" name="أطنان" fill="#0F4C81" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="مؤشرات الأداء" icon={<Activity className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <RadialBarChart data={performanceIndicators} innerRadius="25%" outerRadius="100%" startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={6} fill="#0F4C81" background={{ fill: 'rgba(148,163,184,0.1)' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.92)', color: '#fff', fontSize: 12 }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
