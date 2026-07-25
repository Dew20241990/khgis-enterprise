import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Factory, Trash2, Recycle, Building2, Gauge, Truck, Wrench, AlertTriangle,
  MapPin, TrendingUp, Activity, ShieldCheck, ArrowLeft, Flame, Droplets,
  Cloud, ClipboardCheck, Layers, Boxes,
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polygon, ScaleControl } from 'react-leaflet';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from '@/components/charts/ChartKit';
import { PageHeader, StatCard, Card, CardHeader, CardBody, Badge } from '@/components/ui';
import {
  epwgFacilities, epwgStats, epwgAlerts, epwgMonthlyCollection,
  epwgWasteByFacility, epwgRecyclingRate, EPWG_CENTER,
} from '@/data/epwgData';
import { useApp } from '@/store/appStore';
import { cn } from '@/lib/cn';
import {
  facilityTypeColor, facilityTypeTone, statusColor, envStatusColor,
  fillRateColor, statusLabel, envStatusLabel,
} from './epwgHelpers';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export function EpwgDashboardPage() {
  const { t, locale } = useApp();
  const [baseLayer, setBaseLayer] = useState<'street' | 'satellite' | 'dark'>('street');

  const baseLayerUrl = {
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  };

  const utilizationRate = Math.round((epwgStats.currentWasteVolume / epwgStats.totalCapacity) * 100);

  const kpis = [
    { label: t('epwgTotalFacilities'), value: epwgStats.totalFacilities, icon: <Factory className="w-5 h-5" />, tone: 'brand' as const },
    { label: t('epwgCetCenters'), value: epwgStats.cetCount, icon: <Building2 className="w-5 h-5" />, tone: 'brand' as const },
    { label: t('epwgControlledLandfills'), value: epwgStats.controlledCount + epwgStats.forestCount, icon: <Trash2 className="w-5 h-5" />, tone: 'warning' as const },
    { label: t('epwgSortingFacilities'), value: epwgStats.sortingFacilities, icon: <Recycle className="w-5 h-5" />, tone: 'success' as const },
    { label: t('epwgMunicipalitiesCovered'), value: 21, icon: <MapPin className="w-5 h-5" />, tone: 'neutral' as const },
    { label: t('epwgCurrentWasteVolume'), value: `${epwgStats.currentWasteVolume} ط/ي`, icon: <Gauge className="w-5 h-5" />, tone: 'warning' as const },
    { label: t('epwgRemainingCapacity'), value: `${epwgStats.remainingCapacity} ط/ي`, icon: <Boxes className="w-5 h-5" />, tone: 'success' as const },
    { label: t('epwgRecyclingRate'), value: `${epwgStats.recyclingRate}%`, icon: <Recycle className="w-5 h-5" />, tone: 'success' as const, delta: 4 },
    { label: t('epwgDailyCollection'), value: `${epwgStats.dailyCollection} ط`, icon: <Truck className="w-5 h-5" />, tone: 'brand' as const },
    { label: t('epwgMonthlyCollection'), value: `${epwgStats.monthlyCollection.toLocaleString()} ط`, icon: <TrendingUp className="w-5 h-5" />, tone: 'brand' as const, delta: 6 },
    { label: t('epwgAnnualCollection'), value: `${(epwgStats.annualCollection / 1000).toFixed(1)}k ط`, icon: <Activity className="w-5 h-5" />, tone: 'neutral' as const },
    { label: t('epwgActiveWorkOrders'), value: epwgStats.activeWorkOrders, icon: <Wrench className="w-5 h-5" />, tone: 'warning' as const },
    { label: t('epwgEnvAlerts'), value: epwgStats.criticalAlerts, icon: <AlertTriangle className="w-5 h-5" />, tone: 'danger' as const },
  ];

  return (
    <div>
      <PageHeader
        title={locale === 'ar' ? 'مركز القيادة — EPWG' : locale === 'fr' ? 'Centre de Commandement — EPWG' : 'Command Center — EPWG'}
        subtitle={locale === 'ar' ? 'المؤسسة العمومية الولائية لتسيير مراكز الردم التقني — ولاية خنشلة' : locale === 'fr' ? 'Établissement Public de Gestion des Centres de Recyclage — Wilaya de Khenchela' : 'Public Establishment for Landfill Center Management — Khenchela Province'}
        icon={<ShieldCheck className="w-5 h-5" />}
        actions={
          <Link to="/epwg/facilities" className="btn-primary text-xs">
            {t('epwgFacilities')} <ArrowLeft className={cn('w-3.5 h-3.5', locale === 'ar' && 'rotate-180')} />
          </Link>
        }
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
        {kpis.map((kpi, i) => (
          <motion.div key={i} {...fadeUp} transition={{ duration: 0.25, delay: i * 0.02 }}>
            <StatCard label={kpi.label} value={kpi.value} icon={kpi.icon} tone={kpi.tone} delta={kpi.delta} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* GIS Map */}
        <Card className="lg:col-span-2">
          <CardHeader
            title={locale === 'ar' ? 'خريطة شبكة المنشآت' : locale === 'fr' ? 'Carte du réseau d\'installations' : 'Facility Network Map'}
            subtitle={locale === 'ar' ? 'ولاية خنشلة — توزيع المنشآت' : 'Khenchela Province — Facility Distribution'}
            icon={<MapPin className="w-4 h-4" />}
            action={
              <div className="flex items-center gap-1 glass-strong rounded-lg p-0.5">
                {(['street', 'satellite', 'dark'] as const).map((bl) => (
                  <button key={bl} onClick={() => setBaseLayer(bl)}
                    className={cn('px-2 py-1 rounded-md text-[10px] font-medium transition',
                      baseLayer === bl ? 'bg-brand-500 text-white' : 'text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800')}>
                    {bl === 'street' ? (locale === 'ar' ? 'شوارع' : 'Street') : bl === 'satellite' ? (locale === 'ar' ? 'قمر' : 'Sat') : (locale === 'ar' ? 'داكن' : 'Dark')}
                  </button>
                ))}
              </div>
            }
          />
          <CardBody>
            <div className="h-[420px] rounded-xl2 overflow-hidden border border-ink-200/60 dark:border-ink-800/60">
              <MapContainer center={EPWG_CENTER} zoom={9} className="w-full h-full" zoomControl>
                <TileLayer key={baseLayer} url={baseLayerUrl[baseLayer]} attribution="EPWG GIS" />
                <ScaleControl position="bottomleft" />
                {epwgFacilities.map((f) => (
                  <CircleMarker key={f.id} center={[f.lat, f.lng]} radius={f.type === 'cet' ? 12 : f.type === 'controlled' ? 9 : 7}
                    pathOptions={{ color: facilityTypeColor[f.type], fillColor: facilityTypeColor[f.type], fillOpacity: 0.6, weight: 2 }}>
                    <Popup>
                      <div style={{ minWidth: 180 }}>
                        <p style={{ fontWeight: 700, fontSize: 13 }}>{locale === 'ar' ? f.nameAr : f.nameFr}</p>
                        <p style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{f.typeAr}</p>
                        <p style={{ fontSize: 11, marginTop: 6 }}>{locale === 'ar' ? f.municipalityAr : f.municipality}</p>
                        <p style={{ fontSize: 10, marginTop: 4 }}>{f.currentLoadTpd}/{f.capacityTpd} t/j</p>
                        <p style={{ fontSize: 10, color: statusColor[f.status], marginTop: 2 }}>{statusLabel(f.status, locale)}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {(['cet', 'controlled', 'forest', 'special'] as const).map((type) => (
                <div key={type} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ background: facilityTypeColor[type] }} />
                  <span className="text-[11px] text-ink-600 dark:text-ink-300">
                    {type === 'cet' ? t('epwgCet') : type === 'controlled' ? t('epwgControlled') : type === 'forest' ? t('epwgForest') : t('epwgSpecial')}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Environmental Alerts */}
        <Card>
          <CardHeader
            title={t('epwgEnvAlerts')}
            subtitle={`${epwgStats.criticalAlerts} ${locale === 'ar' ? 'حرج' : locale === 'fr' ? 'critique' : 'critical'}`}
            icon={<AlertTriangle className="w-4 h-4" />}
          />
          <CardBody>
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto scroll-area">
              {epwgAlerts.map((alert) => {
                const facility = epwgFacilities.find((f) => f.id === alert.facilityId);
                return (
                  <motion.div key={alert.id} {...fadeUp}
                    className={cn('p-3 rounded-xl border',
                      alert.level === 'critical' ? 'bg-danger-50 dark:bg-danger-600/10 border-danger-200 dark:border-danger-600/30'
                      : alert.level === 'warning' ? 'bg-warning-50 dark:bg-warning-600/10 border-warning-200 dark:border-warning-600/30'
                      : 'bg-brand-50 dark:bg-brand-600/10 border-brand-200 dark:border-brand-600/30')}>
                    <div className="flex items-start gap-2">
                      <span className={cn('shrink-0 w-7 h-7 rounded-lg flex items-center justify-center',
                        alert.level === 'critical' ? 'bg-danger-500 text-white'
                        : alert.level === 'warning' ? 'bg-warning-500 text-white'
                        : 'bg-brand-500 text-white')}>
                        {alert.level === 'critical' ? <Flame className="w-3.5 h-3.5" /> : alert.level === 'warning' ? <AlertTriangle className="w-3.5 h-3.5" /> : <ClipboardCheck className="w-3.5 h-3.5" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-ink-800 dark:text-ink-100">{locale === 'ar' ? alert.titleAr : alert.title}</p>
                        <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5">{locale === 'ar' ? alert.messageAr : alert.message}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge tone={facilityTypeTone[facility?.type ?? 'cet']}>{facility?.code}</Badge>
                          <span className="text-[10px] text-ink-400">{alert.time}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Monthly Collection Trend */}
        <Card>
          <CardHeader title={t('epwgMonthlyCollection')} subtitle="t/j" icon={<TrendingUp className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={epwgMonthlyCollection}>
                <defs>
                  <linearGradient id="epwgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0F4C81" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="tons" stroke="#0F4C81" strokeWidth={2.5} fill="url(#epwgGrad)" name={locale === 'ar' ? 'طن' : 'Tons'} />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Waste by Facility */}
        <Card>
          <CardHeader title={t('epwgWasteByFacility')} subtitle="t/j" icon={<Factory className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={epwgWasteByFacility} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="daily" name={t('epwgDailyWaste')} radius={[0, 6, 6, 0]}>
                  {epwgWasteByFacility.map((_, i) => <Cell key={i} fill={facilityTypeColor[epwgFacilities[i].type]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recycling Composition */}
        <Card>
          <CardHeader title={t('epwgRecyclingRate')} icon={<Recycle className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={epwgRecyclingRate} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {epwgRecyclingRate.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Overall Utilization */}
        <Card>
          <CardHeader title={t('epwgFacilityUtilization')} icon={<Gauge className="w-4 h-4" />} />
          <CardBody>
            <div className="flex items-center justify-center h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="40%" outerRadius="100%" data={[{ name: 'util', value: utilizationRate, fill: fillRateColor(utilizationRate) }]} startAngle={90} endAngle={-270}>
                  <RadialBar background dataKey="value" cornerRadius={20} />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 36, fontWeight: 700, fill: fillRateColor(utilizationRate) }}>
                    {utilizationRate}%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 -mt-4">
              <div className="flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-brand-500" />
                <span className="text-xs text-ink-500">{epwgStats.currentWasteVolume} t/j {locale === 'ar' ? 'مستخدم' : 'used'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-success-500" />
                <span className="text-xs text-ink-500">{epwgStats.remainingCapacity} t/j {locale === 'ar' ? 'متبقي' : 'remaining'}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
