import { motion } from 'framer-motion';
import {
  ClipboardCheck, AlertTriangle, Trash2, Truck, Wrench, Users,
  Gauge, Clock, CheckCircle2, Activity, MapPin, TrendingUp,
} from 'lucide-react';
import { StatCard, Card, CardHeader, CardBody, Badge } from '@/components/ui';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from '@/components/charts/ChartKit';
import { useApp } from '@/store/appStore';
import {
  blackSpots, containers, inspections, routes, workOrders, complaints,
  illegalDumps, vehicles, blackSpotTrend, wasteCollected,
} from '@/data/mockData';
import { workflowWorkOrders } from '@/data/workflowData';
import { cn } from '@/lib/cn';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export function OperationalDashboardPage() {
  const { t, locale, user } = useApp();
  const label = (ar: string, fr: string, en: string) => (locale === 'ar' ? ar : locale === 'fr' ? fr : en);

  const openSpots = blackSpots.filter(s => s.status === 'open').length;
  const inProgressSpots = blackSpots.filter(s => s.status === 'inProgress').length;
  const resolvedSpots = blackSpots.filter(s => s.status === 'resolved').length;
  const overflowing = containers.filter(c => c.status === 'full').length;
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const pendingWO = workflowWorkOrders.filter(w => w.status === 'created' || w.status === 'assigned').length;
  const completedWO = workflowWorkOrders.filter(w => w.status === 'verified' || w.status === 'closed').length;
  const pendingWO2 = workOrders.filter(w => w.status === 'open' || w.status === 'assigned').length;
  const completedWO2 = workOrders.filter(w => w.status === 'completed').length;
  const newComplaints = complaints.filter(c => c.status === 'new').length;

  const kpis = [
    { label: label('النقاط السوداء المفتوحة', 'Points Noirs Ouverts', 'Open Black Spots'), value: openSpots, icon: <AlertTriangle className="w-5 h-5" />, tone: 'danger' as const },
    { label: label('قيد المعالجة', 'En Cours', 'In Progress'), value: inProgressSpots, icon: <Activity className="w-5 h-5" />, tone: 'warning' as const },
    { label: label('نقاط محلولة', 'Points Résolus', 'Resolved Spots'), value: resolvedSpots, icon: <CheckCircle2 className="w-5 h-5" />, tone: 'success' as const },
    { label: label('حاويات ممتلئة', 'Conteneurs Pleins', 'Overflowing'), value: overflowing, icon: <Trash2 className="w-5 h-5" />, tone: 'danger' as const },
    { label: label('جولات التفتيش', 'Tournées d\'Inspection', 'Inspection Tours'), value: inspections.length, icon: <ClipboardCheck className="w-5 h-5" />, tone: 'brand' as const },
    { label: label('عمليات التنظيف', 'Opérations de Nettoyage', 'Cleaning Ops'), value: routes.length, icon: <Truck className="w-5 h-5" />, tone: 'success' as const },
    { label: label('مركبات نشطة', 'Véhicules Actifs', 'Active Vehicles'), value: activeVehicles, icon: <Truck className="w-5 h-5" />, tone: 'brand' as const },
    { label: label('أوامر شغل معلقة', 'OT en Attente', 'Pending Work Orders'), value: pendingWO + pendingWO2, icon: <Wrench className="w-5 h-5" />, tone: 'warning' as const },
    { label: label('أوامر شغل مكتملة', 'OT Terminés', 'Completed Work Orders'), value: completedWO + completedWO2, icon: <CheckCircle2 className="w-5 h-5" />, tone: 'success' as const },
    { label: label('شكاوى جديدة', 'Nouvelles Plaintes', 'New Complaints'), value: newComplaints, icon: <Users className="w-5 h-5" />, tone: 'warning' as const },
    { label: label('التفريغ العشوائي', 'Dépôts Sauvages', 'Illegal Dumping'), value: illegalDumps.length, icon: <Trash2 className="w-5 h-5" />, tone: 'danger' as const },
    { label: label('معدل الأداء', 'Taux de Performance', 'Performance Rate'), value: '82%', icon: <Gauge className="w-5 h-5" />, tone: 'success' as const },
  ];

  const recentSpots = blackSpots.slice(0, 6);
  const recentWO = [...workflowWorkOrders].slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-11 h-11 rounded-xl2 bg-gradient-to-br from-brand-500/10 to-success-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center ring-1 ring-brand-200/50 dark:ring-brand-600/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink-900 dark:text-white tracking-tight">
              {label('لوحة القيادة التشغيلية', 'Tableau de Bord Opérationnel', 'Operational Dashboard')}
            </h1>
            <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">
              {user ? (locale === 'ar' ? user.nameAr : locale === 'fr' ? user.nameFr : user.name) : ''} · {label('العمليات الميدانية', 'Opérations Terrain', 'Field Operations')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => (
          <motion.div key={i} {...fadeUp} transition={{ duration: 0.25, delay: i * 0.02 }}>
            <StatCard label={kpi.label} value={kpi.value} icon={kpi.icon} tone={kpi.tone} />
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title={label('تطور النقاط السوداء', 'Tendance Points Noirs', 'Black Spot Trend')} icon={<TrendingUp className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={blackSpotTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="g-op" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#DC2626" stopOpacity={0.3} /><stop offset="100%" stopColor="#DC2626" stopOpacity={0} /></linearGradient>
                  <linearGradient id="g-rs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16A34A" stopOpacity={0.3} /><stop offset="100%" stopColor="#16A34A" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.92)', color: '#fff', fontSize: 12 }} />
                <Area type="monotone" dataKey="open" name={label('مفتوحة', 'Ouverts', 'Open')} stroke="#DC2626" strokeWidth={2.5} fill="url(#g-op)" />
                <Area type="monotone" dataKey="resolved" name={label('محلولة', 'Résolus', 'Resolved')} stroke="#16A34A" strokeWidth={2.5} fill="url(#g-rs)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={label('النفايات المجموعة (طن)', 'Déchets Collectés (t)', 'Waste Collected (tons)')} icon={<Trash2 className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={wasteCollected} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.92)', color: '#fff', fontSize: 12 }} cursor={{ fill: 'rgba(15,76,129,0.06)' }} />
                <Bar dataKey="tons" name={label('طن', 'Tonnes', 'Tons')} fill="#0F4C81" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Recent lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title={label('أحدث النقاط السوداء', 'Derniers Points Noirs', 'Recent Black Spots')} icon={<AlertTriangle className="w-4 h-4" />} />
          <CardBody>
            <div className="space-y-2">
              {recentSpots.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl2 hover:bg-ink-50 dark:hover:bg-ink-800/30 transition">
                  <div className={cn('w-2 h-2 rounded-full shrink-0',
                    s.status === 'open' ? 'bg-danger-500' : s.status === 'inProgress' ? 'bg-warning-500' : s.status === 'resolved' ? 'bg-success-500' : 'bg-ink-400')} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-100 truncate">{s.code} · {s.category}</p>
                    <p className="text-xs text-ink-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.municipality} — {s.neighborhood}</p>
                  </div>
                  <Badge tone={s.priority === 'critical' ? 'danger' : s.priority === 'high' ? 'warning' : 'info'}>{s.priority}</Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={label('أحدث أوامر الشغل', 'Derniers OT', 'Recent Work Orders')} icon={<Wrench className="w-4 h-4" />} />
          <CardBody>
            <div className="space-y-2">
              {recentWO.map((w) => (
                <div key={w.id} className="flex items-center gap-3 p-2.5 rounded-xl2 hover:bg-ink-50 dark:hover:bg-ink-800/30 transition">
                  <div className={cn('w-2 h-2 rounded-full shrink-0',
                    w.status === 'created' ? 'bg-warning-500' : w.status === 'assigned' ? 'bg-brand-500' : w.status === 'completed' ? 'bg-success-500' : 'bg-ink-400')} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-100 truncate">{w.number}</p>
                    <p className="text-xs text-ink-400">{w.municipality}</p>
                  </div>
                  <Badge tone={w.status === 'created' ? 'warning' : w.status === 'assigned' ? 'brand' : 'success'}>{w.status}</Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
