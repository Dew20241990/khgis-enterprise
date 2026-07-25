import {
  BarChart3, TrendingUp, TrendingDown, Users, Trash2, Truck, Clock, Target, Award, Download,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { blackSpotTrend, wasteCollected, performanceIndicators, responseTimeTrend, inspectionsByDay, fillRateByDistrict } from '@/data/mockData';
import { useApp } from '@/store/appStore';

const tip = { borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.92)', color: '#fff', fontSize: 12, padding: '8px 12px' };

export function AnalyticsPage() {
  const { t } = useApp();

  const radarData = performanceIndicators.map(p => ({ subject: p.name, value: p.value, target: p.target }));

  return (
    <div>
      <PageHeader
        title={t('analytics')} subtitle="تحليلات متقدمة للأداء"
        icon={<BarChart3 className="w-5 h-5" />}
        actions={<button className="btn-outline"><Download className="w-4 h-4" /> {t('export')}</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="كفاءة الجمع" value="87%" icon={<Target className="w-5 h-5" />} tone="brand" delta={5} />
        <StatCard label="رضا المواطنين" value="72%" icon={<Award className="w-5 h-5" />} tone="success" delta={8} />
        <StatCard label="التغطية" value="94%" icon={<Trash2 className="w-5 h-5" />} tone="warning" delta={2} />
        <StatCard label="زمن الاستجابة" value="28 س" icon={<Clock className="w-5 h-5" />} tone="neutral" delta={-18} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card>
          <CardHeader title="مقارنة المفتوحة والمحلولة" subtitle="خلال 6 أشهر" icon={<TrendingUp className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={blackSpotTrend} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tip} cursor={{ fill: 'rgba(37,99,235,0.06)' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="open" name="مفتوحة" radius={[6, 6, 0, 0]} fill="#EF4444" />
                <Bar dataKey="resolved" name="محلولة" radius={[6, 6, 0, 0]} fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="رادار الأداء" subtitle="القيمة مقابل الهدف" icon={<Target className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(148,163,184,0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <PolarRadiusAxis tick={{ fontSize: 9, fill: '#94a3b8' }} angle={90} />
                <Radar name="القيمة" dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.3} />
                <Radar name="الهدف" dataKey="target" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
                <Tooltip contentStyle={tip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader title="النفايات المجموعة" subtitle="بالطن" icon={<Trash2 className="w-4 h-4" />} action={<Badge tone="success" dot>+10% نمو</Badge>} />
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={wasteCollected} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                <defs><linearGradient id="aWaste" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} /><stop offset="100%" stopColor="#F59E0B" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tip} />
                <Area type="monotone" dataKey="tons" name="طن" stroke="#F59E0B" strokeWidth={2.5} fill="url(#aWaste)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="زمن الاستجابة" subtitle="ساعات (6 أسابيع)" icon={<Clock className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={responseTimeTrend} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tip} />
                <Line type="monotone" dataKey="hours" name="ساعات" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <Card>
          <CardHeader title="نشاط التفتيش" subtitle="آخر 14 يوماً" icon={<BarChart3 className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={inspectionsByDay} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tip} cursor={{ fill: 'rgba(37,99,235,0.06)' }} />
                <Bar dataKey="count" name="جولات" radius={[6, 6, 0, 0]} fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="أداء الأحياء" subtitle="متوسط الامتلاء" icon={<TrendingUp className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={fillRateByDistrict} layout="vertical" margin={{ top: 6, right: 8, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={tip} cursor={{ fill: 'rgba(37,99,235,0.06)' }} />
                <Bar dataKey="rate" name="نسبة" radius={[0, 6, 6, 0]} fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
