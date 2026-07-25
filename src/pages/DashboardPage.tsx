import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Popup, Polygon, ScaleControl, LayersControl,
} from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Trash2, Truck, ClipboardCheck, Gauge, Clock, TrendingUp, TrendingDown,
  MapPin, ArrowRight, Camera, Sparkles, FileBarChart, Download, Activity, Building2,
  Trophy, Flame, CheckCircle2, AlertCircle, Wrench, Shield, Sun, Cloud, CloudRain,
  Search, Filter, Printer, FileText, FileSpreadsheet, FileType, Brain, Target,
  Zap, Eye, Navigation, Layers, Users, Map as MapIcon, Award, Factory, Route,
  Calendar, ChevronRight, BarChart3, PieChart as PieIcon, LineChart as LineIcon,
  CircleDot, Square, Triangle, Hexagon, Star, Cpu, Gauge as GaugeIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard, Card, CardHeader, CardBody, Badge, Modal } from '@/components/ui';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from '@/components/charts/ChartKit';
import { useApp } from '@/store/appStore';
import {
  blackSpots, containers, vehicles, inspections, tasks, municipalities, neighborhoods,
  cetCenters, contractors, complaints, illegalDumps, commercialViolations, routes, drivers,
  blackSpotTrend, fillRateByMunicipality, containerTypeDist, responseTimeTrend,
  performanceIndicators, municipalityRanking, calendarInspections, wasteCollected, alerts,
  KHENCHELA_CENTER, WILAYA_BOUNDARY, workOrders,
} from '@/data/mockData';
import { workflowWorkOrders } from '@/data/workflowData';
import { cn } from '@/lib/cn';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

type EnvStatus = 'excellent' | 'good' | 'average' | 'poor' | 'critical';
const statusConfig: Record<EnvStatus, { ar: string; fr: string; en: string; color: string; bg: string; tone: 'success' | 'brand' | 'warning' | 'danger' | 'neutral' }> = {
  excellent: { ar: 'ممتاز', fr: 'Excellent', en: 'Excellent', color: '#16A34A', bg: 'bg-success-500', tone: 'success' },
  good: { ar: 'جيد', fr: 'Bon', en: 'Good', color: '#0F4C81', bg: 'bg-brand-500', tone: 'brand' },
  average: { ar: 'متوسط', fr: 'Moyen', en: 'Average', color: '#F59E0B', bg: 'bg-warning-500', tone: 'warning' },
  poor: { ar: 'ضعيف', fr: 'Faible', en: 'Poor', color: '#F97316', bg: 'bg-warning-600', tone: 'warning' },
  critical: { ar: 'حرج', fr: 'Critique', en: 'Critical', color: '#DC2626', bg: 'bg-danger-500', tone: 'danger' },
};

const priorityTone: Record<string, 'danger' | 'warning' | 'info' | 'neutral'> = {
  critical: 'danger', high: 'warning', medium: 'info', low: 'neutral',
};

// ─── SECTION 1: Executive Header ───────────────────────────────────────────────
function ExecutiveHeader({ envStatus }: { envStatus: EnvStatus }) {
  const { t, locale, user } = useApp();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-FR' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString(locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-FR' : 'en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  const sc = statusConfig[envStatus];

  return (
    <motion.div {...fadeUp} transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-xl3 bg-gradient-to-br from-brand-700 via-brand-800 to-ink-900 p-6 lg:p-7 text-white shadow-gov">
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-brand-400/15 blur-3xl" />
      <div className="absolute -bottom-24 -right-10 w-72 h-72 rounded-full bg-success-500/15 blur-3xl" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 blur-2xl rounded-full" />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl2 bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0 shadow-soft">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="chip bg-white/15 text-white backdrop-blur-sm text-[10px]">KhGIS Enterprise</span>
              <span className="chip bg-white/15 text-white backdrop-blur-sm text-[10px]">
                {locale === 'ar' ? 'ولاية خنشلة' : locale === 'fr' ? 'Wilaya de Khenchela' : 'Khenchela Province'}
              </span>
            </div>
            <h1 className="text-lg lg:text-xl font-bold tracking-tight">
              {locale === 'ar' ? 'مركز القيادة واتخاذ القرار' : locale === 'fr' ? 'Centre de Commandement et Décision' : 'Executive Command & Decision Center'}
            </h1>
            <p className="text-xs text-brand-100 mt-0.5">
              {locale === 'ar' ? 'المنصة الذكية الجغرافية لتسيير النظافة الحضرية' : locale === 'fr' ? 'Plateforme SIG de Gestion de la Propreté Urbaine' : 'Smart GIS Platform for Urban Sanitation Management'}
            </p>
          </div>
        </div>

        {/* Center: Date/Time */}
        <div className="flex items-center gap-4 px-5 py-3 rounded-xl2 bg-white/8 backdrop-blur-sm border border-white/10">
          <div className="text-center">
            <p className="text-[10px] text-brand-100 uppercase tracking-wider">{locale === 'ar' ? 'التاريخ' : locale === 'fr' ? 'Date' : 'Date'}</p>
            <p className="text-sm font-semibold mt-0.5">{dateStr}</p>
          </div>
          <div className="w-px h-10 bg-white/15" />
          <div className="text-center">
            <p className="text-[10px] text-brand-100 uppercase tracking-wider">{locale === 'ar' ? 'الوقت' : locale === 'fr' ? 'Heure' : 'Time'}</p>
            <p className="text-sm font-mono font-semibold mt-0.5">{timeStr}</p>
          </div>
        </div>

        {/* Right: Weather + User + Status */}
        <div className="flex items-center gap-3">
          {/* Weather placeholder */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl2 bg-white/8 backdrop-blur-sm border border-white/10">
            <Sun className="w-5 h-5 text-warning-300" />
            <div>
              <p className="text-sm font-semibold">28°C</p>
              <p className="text-[10px] text-brand-100">{locale === 'ar' ? 'مشمس' : locale === 'fr' ? 'Ensoleillé' : 'Sunny'}</p>
            </div>
          </div>

          {/* User */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl2 bg-white/8 backdrop-blur-sm border border-white/10">
            <div className="w-8 h-8 rounded-full bg-brand-400/30 flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0) ?? 'W'}
            </div>
            <div>
              <p className="text-xs font-semibold">{user?.name ?? (locale === 'ar' ? 'الوالي' : locale === 'fr' ? 'Wali' : 'Governor')}</p>
              <p className="text-[10px] text-brand-100">{locale === 'ar' ? 'والٍ (قراءة فقط)' : locale === 'fr' ? 'Gouverneur (Lecture)' : 'Governor (Read-only)'}</p>
            </div>
          </div>

          {/* Environmental status */}
          <div className={cn('flex items-center gap-2 px-4 py-2 rounded-xl2 text-white shadow-soft', sc.bg)}>
            <Gauge className="w-4 h-4" />
            <div>
              <p className="text-[10px] uppercase tracking-wider opacity-80">{locale === 'ar' ? 'الحالة البيئية' : locale === 'fr' ? 'État Environ.' : 'Env. Status'}</p>
              <p className="text-sm font-bold">{locale === 'ar' ? sc.ar : locale === 'fr' ? sc.fr : sc.en}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── SECTION 2: Executive KPI Cards ────────────────────────────────────────────
function ExecutiveKPIs() {
  const { t } = useApp();
  const openSpots = blackSpots.filter(s => s.status === 'open' || s.status === 'inProgress').length;
  const criticalSpots = blackSpots.filter(s => s.priority === 'critical').length;
  const resolvedSpots = blackSpots.filter(s => s.status === 'resolved' || s.status === 'closed').length;
  const pendingSpots = blackSpots.filter(s => s.status === 'open').length;
  const overflowing = containers.filter(c => c.status === 'full').length;
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const pendingWO = workOrders.filter(w => w.status === 'open' || w.status === 'assigned').length;
  const completedWO = workOrders.filter(w => w.status === 'completed').length;
  const wfPending = workflowWorkOrders.filter(w => w.status === 'created' || w.status === 'assigned').length;
  const wfCompleted = workflowWorkOrders.filter(w => w.status === 'verified' || w.status === 'closed').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
  const avgFill = Math.round(containers.reduce((a, c) => a + c.fillLevel, 0) / containers.length);

  const kpis = [
    { label: t('municipalities'), value: municipalities.length, icon: <Building2 className="w-5 h-5" />, tone: 'brand' as const, delta: 0 },
    { label: t('wfOperationalZone') || 'المناطق التشغيلية', value: 5, icon: <MapPin className="w-5 h-5" />, tone: 'neutral' as const },
    { label: t('wfNeighborhood') || 'الأحياء', value: neighborhoods.length, icon: <Layers className="w-5 h-5" />, tone: 'brand' as const },
    { label: t('kpiInspections'), value: inspections.length, icon: <ClipboardCheck className="w-5 h-5" />, tone: 'warning' as const, delta: 15 },
    { label: t('kpiTotalSpots'), value: blackSpots.length, icon: <AlertTriangle className="w-5 h-5" />, tone: 'danger' as const, delta: -8 },
    { label: t('criticalSpots') || 'النقاط الحرجة', value: criticalSpots, icon: <Flame className="w-5 h-5" />, tone: 'danger' as const },
    { label: t('kpiResolvedRate'), value: resolvedSpots, icon: <CheckCircle2 className="w-5 h-5" />, tone: 'success' as const, delta: 5 },
    { label: t('pendingSpots') || 'النقاط المعلقة', value: pendingSpots, icon: <Clock className="w-5 h-5" />, tone: 'warning' as const },
    { label: t('illegalDumping') || 'التفريغ العشوائي', value: illegalDumps.length, icon: <Trash2 className="w-5 h-5" />, tone: 'danger' as const },
    { label: t('commercialViolations') || 'المخالفات التجارية', value: commercialViolations.length, icon: <AlertCircle className="w-5 h-5" />, tone: 'warning' as const },
    { label: t('kpiContainers'), value: containers.length, icon: <Trash2 className="w-5 h-5" />, tone: 'brand' as const, delta: 3 },
    { label: t('overflowingContainers') || 'الحاويات الممتلئة', value: overflowing, icon: <AlertCircle className="w-5 h-5" />, tone: 'danger' as const },
    { label: t('cleaningOpsToday') || 'عمليات اليوم', value: routes.length, icon: <Truck className="w-5 h-5" />, tone: 'success' as const },
    { label: t('completedOps') || 'عمليات مكتملة', value: routes.filter(r => r.status === 'completed').length, icon: <CheckCircle2 className="w-5 h-5" />, tone: 'success' as const },
    { label: t('wfPendingWorkOrders'), value: wfPending + pendingWO, icon: <Wrench className="w-5 h-5" />, tone: 'warning' as const },
    { label: t('wfCompletedWorkOrders'), value: wfCompleted + completedWO, icon: <CheckCircle2 className="w-5 h-5" />, tone: 'success' as const },
    { label: t('inspectionCoverage') || 'تغطية التفتيش', value: '94%', icon: <ClipboardCheck className="w-5 h-5" />, tone: 'brand' as const, delta: 2 },
    { label: t('citizenComplaints') || 'شكاوى المواطنين', value: complaints.length, icon: <Users className="w-5 h-5" />, tone: 'warning' as const },
    { label: t('resolvedComplaints') || 'شكاوى محلولة', value: resolvedComplaints, icon: <CheckCircle2 className="w-5 h-5" />, tone: 'success' as const },
    { label: t('envIndex') || 'مؤشر الأداء البيئي', value: '78.4', icon: <Gauge className="w-5 h-5" />, tone: 'brand' as const, delta: 4 },
    { label: t('avgResolutionTime') || 'متوسط وقت الحل', value: '28h', icon: <Clock className="w-5 h-5" />, tone: 'neutral' as const, delta: -12 },
    { label: t('overallPerformance') || 'الأداء العام', value: '82%', icon: <Activity className="w-5 h-5" />, tone: 'success' as const, delta: 6 },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {kpis.map((kpi, i) => (
        <motion.div key={i} {...fadeUp} transition={{ duration: 0.25, delay: i * 0.02 }}>
          <StatCard label={kpi.label} value={kpi.value} icon={kpi.icon} tone={kpi.tone} delta={kpi.delta} />
        </motion.div>
      ))}
    </div>
  );
}

// ─── SECTION 3: Executive GIS Map ──────────────────────────────────────────────
function ExecutiveMap() {
  const { t, locale, theme } = useApp();
  const [selected, setSelected] = useState<{ type: string; title: string; details: string; muni: string } | null>(null);
  const [baseLayer, setBaseLayer] = useState<'street' | 'satellite' | 'dark' | 'terrain'>('street');
  const [showHeat, setShowHeat] = useState(false);
  const [layers, setLayers] = useState({
    municipalities: true, blackSpots: true, illegalDump: true, containers: false,
    cetCenters: true, contractors: true, workOrders: true, vehicles: false,
  });

  const baseLayerUrl = {
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  };

  const spotColors: Record<string, string> = {
    open: '#EF4444', inProgress: '#F97316', resolved: '#16A34A', closed: '#94A3B8',
  };

  return (
    <Card>
      <CardHeader
        title={locale === 'ar' ? 'الخريطة الجغرافية التنفيذية' : locale === 'fr' ? 'Carte SIG Exécutive' : 'Executive GIS Map'}
        subtitle={locale === 'ar' ? 'ولاية خنشلة — نظرة شاملة' : locale === 'fr' ? 'Wilaya de Khenchela — Vue d\'ensemble' : 'Khenchela Province — Overview'}
        icon={<MapIcon className="w-4 h-4" />}
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 glass-strong rounded-lg p-0.5">
              {(['street', 'satellite', 'dark', 'terrain'] as const).map((bl) => (
                <button key={bl} onClick={() => setBaseLayer(bl)}
                  className={cn('px-2 py-1 rounded-md text-[10px] font-medium transition',
                    baseLayer === bl ? 'bg-brand-500 text-white' : 'text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800')}>
                  {bl === 'street' ? (locale === 'ar' ? 'شوارع' : 'Street') : bl === 'satellite' ? (locale === 'ar' ? 'قمر' : 'Sat') : bl === 'dark' ? (locale === 'ar' ? 'داكن' : 'Dark') : (locale === 'ar' ? 'تضاريس' : 'Terrain')}
                </button>
              ))}
            </div>
            <button onClick={() => setShowHeat(!showHeat)}
              className={cn('flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition',
                showHeat ? 'bg-danger-500 text-white border-danger-500' : 'border-ink-200 dark:border-ink-700 text-ink-500 hover:bg-ink-50 dark:hover:bg-ink-800')}>
              <Flame className="w-3 h-3" /> {locale === 'ar' ? 'خريطة حرارية' : 'Heat'}
            </button>
          </div>
        }
      />
      <CardBody>
        <div className="relative h-[500px] rounded-xl2 overflow-hidden border border-ink-200/60 dark:border-ink-800/60">
          <MapContainer center={KHENCHELA_CENTER} zoom={10} className="w-full h-full" zoomControl>
            <TileLayer key={baseLayer} url={baseLayerUrl[baseLayer]} attribution="GIS" />
            <ScaleControl position="bottomleft" />

            {/* Wilaya boundary */}
            <Polygon positions={WILAYA_BOUNDARY} pathOptions={{ color: '#0F4C81', weight: 2, fillOpacity: 0.05, dashArray: '8 4' }} />

            {/* Municipality boundaries */}
            {layers.municipalities && municipalities.map((m) => (
              <Polygon key={m.id} positions={m.polygon} pathOptions={{ color: '#0F4C81', weight: 1, fillOpacity: 0.03 }}>
                <Popup>
                  <div style={{ minWidth: 140 }}>
                    <p style={{ fontWeight: 700, fontSize: 13 }}>{m.nameAr}</p>
                    <p style={{ fontSize: 11, color: '#64748b' }}>{m.nameFr}</p>
                    <p style={{ fontSize: 10, marginTop: 4 }}>Pop: {m.population.toLocaleString()}</p>
                    <p style={{ fontSize: 10 }}>Containers: {m.containers}</p>
                    <p style={{ fontSize: 10 }}>Fill: {m.fillRate}%</p>
                  </div>
                </Popup>
              </Polygon>
            ))}

            {/* Black spots */}
            {layers.blackSpots && blackSpots.map((s) => (
              <CircleMarker key={s.id} center={[s.lat, s.lng]} radius={6}
                pathOptions={{ color: spotColors[s.status] ?? '#64748B', fillColor: spotColors[s.status] ?? '#64748B', fillOpacity: 0.7, weight: 2 }}>
                <Popup>
                  <div style={{ minWidth: 160 }}>
                    <p style={{ fontWeight: 700, fontSize: 13 }}>{s.code}</p>
                    <p style={{ fontSize: 11, color: '#64748b' }}>{s.category}</p>
                    <p style={{ fontSize: 11, marginTop: 4 }}>{s.municipality} — {s.neighborhood}</p>
                    <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Priority: {s.priority}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Illegal dumping */}
            {layers.illegalDump && illegalDumps.map((d) => (
              <CircleMarker key={d.id} center={[d.lat, d.lng]} radius={5}
                pathOptions={{ color: '#DC2626', fillColor: '#F97316', fillOpacity: 0.6, weight: 1.5 }}>
                <Popup>
                  <div style={{ minWidth: 140 }}>
                    <p style={{ fontWeight: 700, fontSize: 12 }}>{d.code}</p>
                    <p style={{ fontSize: 10, color: '#64748b' }}>Volume: {d.volume}m³</p>
                    <p style={{ fontSize: 10 }}>{d.municipality}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* CET Centers */}
            {layers.cetCenters && cetCenters.map((c) => (
              <CircleMarker key={c.id} center={[c.lat, c.lng]} radius={10}
                pathOptions={{ color: '#16A34A', fillColor: '#16A34A', fillOpacity: 0.5, weight: 3 }}>
                <Popup>
                  <div style={{ minWidth: 160 }}>
                    <p style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</p>
                    <p style={{ fontSize: 11, color: '#64748b' }}>Capacity: {c.capacityTpd} tpd</p>
                    <p style={{ fontSize: 11 }}>Load: {c.currentLoadTpd}/{c.capacityTpd} ({Math.round(c.currentLoadTpd / c.capacityTpd * 100)}%)</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Work orders */}
            {layers.workOrders && workflowWorkOrders.slice(0, 20).map((w) => {
              const obs = blackSpots.find((b) => b.id === w.observationId);
              if (!obs) return null;
              return (
                <CircleMarker key={w.id} center={[obs.lat, obs.lng]} radius={5}
                  pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.5, weight: 1.5 }}>
                  <Popup>
                    <div style={{ minWidth: 140 }}>
                      <p style={{ fontWeight: 700, fontSize: 12 }}>{w.number}</p>
                      <p style={{ fontSize: 10, color: '#64748b' }}>Status: {w.status}</p>
                      <p style={{ fontSize: 10 }}>{w.municipality}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          {/* Layer control panel */}
          <div className="absolute top-3 left-3 z-[500] glass-strong rounded-xl shadow-lifted p-3 max-w-[200px]">
            <p className="text-xs font-semibold text-ink-700 dark:text-ink-200 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> {locale === 'ar' ? 'الطبقات' : 'Layers'}
            </p>
            <div className="space-y-1.5">
              {(Object.entries(layers) as [string, boolean][]).map(([key, val]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={val}
                    onChange={(e) => setLayers({ ...layers, [key]: e.target.checked })}
                    className="w-3.5 h-3.5 rounded accent-brand-500" />
                  <span className="text-[10px] text-ink-600 dark:text-ink-300">
                    {key === 'municipalities' ? (locale === 'ar' ? 'البلديات' : 'Municipalities')
                      : key === 'blackSpots' ? (locale === 'ar' ? 'النقاط السوداء' : 'Black Spots')
                      : key === 'illegalDump' ? (locale === 'ar' ? 'التفريغ العشوائي' : 'Illegal Dumping')
                      : key === 'containers' ? (locale === 'ar' ? 'الحاويات' : 'Containers')
                      : key === 'cetCenters' ? (locale === 'ar' ? 'مراكز الطرح' : 'CET Centers')
                      : key === 'contractors' ? (locale === 'ar' ? 'المقاولين' : 'Contractors')
                      : key === 'workOrders' ? (locale === 'ar' ? 'أوامر الشغل' : 'Work Orders')
                      : (locale === 'ar' ? 'المركبات' : 'Vehicles')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 right-3 z-[500] glass-strong rounded-xl shadow-lifted p-3 space-y-1.5">
            <p className="text-xs font-semibold text-ink-700 dark:text-ink-200 mb-1">{locale === 'ar' ? 'وسيلة الإيضاح' : 'Legend'}</p>
            {[
              { color: '#EF4444', label: locale === 'ar' ? 'نقطة سوداء مفتوحة' : 'Open Black Spot' },
              { color: '#F97316', label: locale === 'ar' ? 'قيد المعالجة' : 'In Progress' },
              { color: '#16A34A', label: locale === 'ar' ? 'محلولة' : 'Resolved' },
              { color: '#94A3B8', label: locale === 'ar' ? 'مغلقة' : 'Closed' },
              { color: '#0F4C81', label: locale === 'ar' ? 'حدود البلدية' : 'Municipality' },
            ].map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                <span className="text-[10px] text-ink-600 dark:text-ink-300">{l.label}</span>
              </div>
            ))}
          </div>

          {/* Coordinates display */}
          <div className="absolute bottom-3 left-3 z-[500] glass-strong rounded-lg shadow-soft px-3 py-1.5">
            <p className="text-[10px] font-mono text-ink-500">35.4236°N, 7.1453°E</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// ─── SECTION 4: Environmental Performance Analytics ──────────────────────────
function ExecutiveAnalytics() {
  const { t, locale } = useApp();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const illegalTrend = [
    { month: 'فيفري', cases: 12, cleared: 8 },
    { month: 'مارس', cases: 15, cleared: 11 },
    { month: 'أفريل', cases: 10, cleared: 9 },
    { month: 'ماي', cases: 18, cleared: 14 },
    { month: 'جوان', cases: 14, cleared: 12 },
    { month: 'جويلية', cases: 9, cleared: 8 },
  ];

  const complaintsTrend = [
    { month: 'فيفري', new: 24, resolved: 18 },
    { month: 'مارس', cases: 28, resolved: 22 },
    { month: 'أفريل', new: 20, resolved: 19 },
    { month: 'ماي', new: 32, resolved: 25 },
    { month: 'جوان', new: 26, resolved: 24 },
    { month: 'جويلية', new: 18, resolved: 17 },
  ];

  const envIndexTrend = [
    { month: 'فيفري', index: 68.2 },
    { month: 'مارس', index: 71.5 },
    { month: 'أفريل', index: 69.8 },
    { month: 'ماي', index: 73.4 },
    { month: 'جوان', index: 75.1 },
    { month: 'جويلية', index: 78.4 },
  ];

  const dailyOps = Array.from({ length: 7 }, (_, i) => ({
    day: `${['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'][i]}`,
    inspections: 3 + ((i * 4) % 8),
    cleaning: 8 + ((i * 3) % 6),
    workOrders: 2 + ((i * 2) % 5),
  }));

  return (
    <Card>
      <CardHeader
        title={locale === 'ar' ? 'تحليلات الأداء البيئي' : locale === 'fr' ? 'Analyse de Performance Environnementale' : 'Environmental Performance Analytics'}
        icon={<BarChart3 className="w-4 h-4" />}
        action={
          <div className="flex items-center gap-1 glass-strong rounded-lg p-0.5">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={cn('px-2.5 py-1 rounded-md text-[10px] font-medium transition',
                  period === p ? 'bg-brand-500 text-white' : 'text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800')}>
                {p === 'daily' ? (locale === 'ar' ? 'يومي' : 'Daily') : p === 'weekly' ? (locale === 'ar' ? 'أسبوعي' : 'Weekly') : p === 'monthly' ? (locale === 'ar' ? 'شهري' : 'Monthly') : (locale === 'ar' ? 'سنوي' : 'Yearly')}
              </button>
            ))}
          </div>
        }
      />
      <CardBody>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Black Spots Trend */}
          <div>
            <p className="text-xs font-semibold text-ink-600 dark:text-ink-300 mb-2">{t('blackSpotTrend')}</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={blackSpotTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="g-open2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#DC2626" stopOpacity={0.3} /><stop offset="100%" stopColor="#DC2626" stopOpacity={0} /></linearGradient>
                  <linearGradient id="g-resolved2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16A34A" stopOpacity={0.3} /><stop offset="100%" stopColor="#16A34A" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.92)', color: '#fff', fontSize: 12 }} />
                <Area type="monotone" dataKey="open" name={locale === 'ar' ? 'مفتوحة' : 'Open'} stroke="#DC2626" strokeWidth={2.5} fill="url(#g-open2)" />
                <Area type="monotone" dataKey="resolved" name={locale === 'ar' ? 'محلولة' : 'Resolved'} stroke="#16A34A" strokeWidth={2.5} fill="url(#g-resolved2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Illegal Dumping Trend */}
          <div>
            <p className="text-xs font-semibold text-ink-600 dark:text-ink-300 mb-2">{locale === 'ar' ? 'تطور التفريغ العشوائي' : 'Illegal Dumping Trend'}</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={illegalTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.92)', color: '#fff', fontSize: 12 }} cursor={{ fill: 'rgba(15,76,129,0.06)' }} />
                <Bar dataKey="cases" name={locale === 'ar' ? 'حالات' : 'Cases'} fill="#F97316" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="cleared" name={locale === 'ar' ? 'تم تنظيفها' : 'Cleared'} fill="#16A34A" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Complaints Trend */}
          <div>
            <p className="text-xs font-semibold text-ink-600 dark:text-ink-300 mb-2">{locale === 'ar' ? 'تطور الشكاوى' : 'Complaints Trend'}</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={complaintsTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.92)', color: '#fff', fontSize: 12 }} />
                <Line type="monotone" dataKey="new" name={locale === 'ar' ? 'جديدة' : 'New'} stroke="#0F4C81" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="resolved" name={locale === 'ar' ? 'محلولة' : 'Resolved'} stroke="#14B8A6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Environmental Index Evolution */}
          <div>
            <p className="text-xs font-semibold text-ink-600 dark:text-ink-300 mb-2">{locale === 'ar' ? 'تطور المؤشر البيئي' : 'Environmental Index Evolution'}</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={envIndexTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="g-env" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0F4C81" stopOpacity={0.3} /><stop offset="100%" stopColor="#0F4C81" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[60, 90]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.92)', color: '#fff', fontSize: 12 }} />
                <Area type="monotone" dataKey="index" name={locale === 'ar' ? 'المؤشر' : 'Index'} stroke="#0F4C81" strokeWidth={2.5} fill="url(#g-env)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily operations */}
        <div className="mt-4">
          <p className="text-xs font-semibold text-ink-600 dark:text-ink-300 mb-2">{locale === 'ar' ? 'العمليات الأسبوعية' : 'Weekly Operations'}</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dailyOps} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.92)', color: '#fff', fontSize: 12 }} cursor={{ fill: 'rgba(15,76,129,0.06)' }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="inspections" name={locale === 'ar' ? 'تفتيش' : 'Inspections'} fill="#0F4C81" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="cleaning" name={locale === 'ar' ? 'تنظيف' : 'Cleaning'} fill="#16A34A" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="workOrders" name={locale === 'ar' ? 'أوامر شغل' : 'Work Orders'} fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}

// ─── SECTION 5: Municipality Performance Ranking ─────────────────────────────
function MunicipalityRanking() {
  const { t, locale } = useApp();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'fillRate' | 'openSpots' | 'collectionRate'>('score');

  const data = useMemo(() => {
    return municipalities
      .map((m) => ({
        id: m.id,
        name: m.nameAr,
        nameFr: m.nameFr,
        score: Math.round(m.collectionRate * 0.4 + m.fillRate * 0.3 + (m.resolvedSpots / (m.openSpots + m.resolvedSpots + 1)) * 100 * 0.3),
        cleanlinessIndex: m.fillRate,
        openCases: m.openSpots,
        resolvedCases: m.resolvedSpots,
        avgResponseTime: 18 + (m.openSpots * 2),
        inspectionScore: 50 + (m.collectionRate % 50),
        completionRate: Math.round((m.resolvedSpots / (m.openSpots + m.resolvedSpots + 1)) * 100),
        collectionRate: m.collectionRate,
        population: m.population,
      }))
      .filter((m) => !search || m.name.includes(search) || m.nameFr.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'openSpots') return a.openCases - b.openCases;
        if (sortBy === 'fillRate') return b.cleanlinessIndex - a.cleanlinessIndex;
        return (b as any)[sortBy] - (a as any)[sortBy];
      });
  }, [search, sortBy]);

  const statusFor = (score: number): { tone: 'success' | 'brand' | 'warning' | 'danger'; label: string } => {
    if (score >= 80) return { tone: 'success', label: locale === 'ar' ? 'ممتاز' : 'Excellent' };
    if (score >= 65) return { tone: 'brand', label: locale === 'ar' ? 'جيد' : 'Good' };
    if (score >= 50) return { tone: 'warning', label: locale === 'ar' ? 'متوسط' : 'Average' };
    return { tone: 'danger', label: locale === 'ar' ? 'ضعيف' : 'Poor' };
  };

  return (
    <Card>
      <CardHeader
        title={locale === 'ar' ? 'ترتيب البلديات' : locale === 'fr' ? 'Classement des Communes' : 'Municipality Ranking'}
        icon={<Trophy className="w-4 h-4" />}
        action={
          <div className="flex items-center gap-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('search')}
              className="input w-40 text-xs" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="input w-auto text-xs">
              <option value="score">{locale === 'ar' ? 'النتيجة' : 'Score'}</option>
              <option value="fillRate">{locale === 'ar' ? 'النظافة' : 'Cleanliness'}</option>
              <option value="openSpots">{locale === 'ar' ? 'الحالات المفتوحة' : 'Open Cases'}</option>
              <option value="collectionRate">{locale === 'ar' ? 'معدل الجمع' : 'Collection'}</option>
            </select>
          </div>
        }
      />
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 dark:bg-ink-800/50 border-b border-ink-200 dark:border-ink-800">
              <tr className="text-right">
                <th className="px-3 py-2.5 text-xs font-semibold text-ink-500">#</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-ink-500">{locale === 'ar' ? 'البلدية' : 'Municipality'}</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-ink-500">{locale === 'ar' ? 'النتيجة' : 'Score'}</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-ink-500">{locale === 'ar' ? 'مؤشر النظافة' : 'Cleanliness'}</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-ink-500">{locale === 'ar' ? 'مفتوحة' : 'Open'}</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-ink-500">{locale === 'ar' ? 'محلولة' : 'Resolved'}</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-ink-500">{locale === 'ar' ? 'الاستجابة' : 'Response (h)'}</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-ink-500">{locale === 'ar' ? 'التفتيش' : 'Inspection'}</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-ink-500">{locale === 'ar' ? 'الإكمال' : 'Completion'}</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-ink-500">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800/60">
              {data.slice(0, 12).map((m, i) => {
                const st = statusFor(m.score);
                return (
                  <tr key={m.id} className="hover:bg-ink-50/50 dark:hover:bg-ink-800/30 transition">
                    <td className="px-3 py-2.5">
                      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
                        i === 0 ? 'bg-warning-100 text-warning-700 dark:bg-warning-600/20 dark:text-warning-400'
                          : i < 3 ? 'bg-brand-100 text-brand-700 dark:bg-brand-600/20 dark:text-brand-400'
                          : 'bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400')}>
                        {i + 1}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{m.name}</p>
                      <p className="text-[10px] text-ink-400">{m.nameFr}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-sm font-bold text-ink-800 dark:text-ink-100">{m.score}</span>
                      <span className="text-xs text-ink-400">/100</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${m.cleanlinessIndex}%` }} />
                        </div>
                        <span className="text-xs text-ink-500">{m.cleanlinessIndex}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5"><Badge tone="danger">{m.openCases}</Badge></td>
                    <td className="px-3 py-2.5"><Badge tone="success">{m.resolvedCases}</Badge></td>
                    <td className="px-3 py-2.5 text-xs text-ink-600 dark:text-ink-300">{m.avgResponseTime}h</td>
                    <td className="px-3 py-2.5 text-xs text-ink-600 dark:text-ink-300">{m.inspectionScore}%</td>
                    <td className="px-3 py-2.5 text-xs text-ink-600 dark:text-ink-300">{m.completionRate}%</td>
                    <td className="px-3 py-2.5"><Badge tone={st.tone} dot>{st.label}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}

// ─── SECTION 6: CET Performance Ranking ──────────────────────────────────────
function CetPerformance() {
  const { t, locale } = useApp();

  const data = cetCenters.map((c) => {
    const loadPct = Math.round((c.currentLoadTpd / c.capacityTpd) * 100);
    const assigned = 40 + Math.round(loadPct / 3);
    const completed = Math.round(assigned * (0.7 + (loadPct % 20) / 100));
    const pending = assigned - completed;
    const delayed = Math.round(pending * 0.15);
    const avgTime = 2 + Math.round(loadPct / 20);
    const score = Math.round(100 - loadPct * 0.3 - delayed * 2);
    return { ...c, loadPct, assigned, completed, pending, delayed, avgTime, score };
  });

  return (
    <Card>
      <CardHeader title={locale === 'ar' ? 'أداء مراكز الطرح التقني' : locale === 'fr' ? 'Performance des CET' : 'CET Performance'} icon={<Factory className="w-4 h-4" />} />
      <CardBody>
        <div className="space-y-4">
          {data.map((c) => (
            <div key={c.id} className="p-4 rounded-xl2 border border-ink-200/60 dark:border-ink-800/60 hover:shadow-soft transition">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{c.name}</p>
                  <p className="text-xs text-ink-400">{c.city} · {c.manager}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={c.status === 'operational' ? 'success' : c.status === 'near-capacity' ? 'warning' : 'danger'} dot>
                    {c.status === 'operational' ? (locale === 'ar' ? 'تشغيلي' : 'Operational') : c.status === 'near-capacity' ? (locale === 'ar' ? 'قرب الامتلاء' : 'Near Capacity') : (locale === 'ar' ? 'صيانة' : 'Maintenance')}
                  </Badge>
                  <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{c.score}/100</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label: locale === 'ar' ? 'مسندة' : 'Assigned', value: c.assigned, tone: 'text-brand-600 dark:text-brand-400' },
                  { label: locale === 'ar' ? 'مكتملة' : 'Completed', value: c.completed, tone: 'text-success-600 dark:text-success-400' },
                  { label: locale === 'ar' ? 'معلقة' : 'Pending', value: c.pending, tone: 'text-warning-600 dark:text-warning-400' },
                  { label: locale === 'ar' ? 'متأخرة' : 'Delayed', value: c.delayed, tone: 'text-danger-600 dark:text-danger-400' },
                ].map((s, i) => (
                  <div key={i} className="text-center p-2 rounded-lg bg-ink-50 dark:bg-ink-800/40">
                    <p className={cn('text-lg font-bold', s.tone)}>{s.value}</p>
                    <p className="text-[10px] text-ink-400">{s.label}</p>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-ink-500">{locale === 'ar' ? 'الحمولة' : 'Load'}</span>
                  <span className="text-xs font-mono text-ink-600 dark:text-ink-300">{c.currentLoadTpd}/{c.capacityTpd} tpd ({c.loadPct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${c.loadPct}%` }} transition={{ duration: 0.6 }}
                    className={cn('h-full rounded-full', c.loadPct > 85 ? 'bg-danger-500' : c.loadPct > 70 ? 'bg-warning-500' : 'bg-success-500')} />
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-ink-500">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {locale === 'ar' ? 'متوسط الجمع' : 'Avg Collection'}: {c.avgTime}h</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// ─── SECTION 7: Private Contractor Performance ──────────────────────────────
function ContractorPerformance() {
  const { t, locale } = useApp();

  const data = contractors.map((c) => {
    const assigned = 30 + Math.round(c.rating * 8);
    const completed = Math.round(assigned * (c.rating / 5));
    const pending = assigned - completed;
    const delayed = Math.round(pending * 0.2);
    const compliance = Math.round(c.rating / 5 * 100);
    return { ...c, assigned, completed, pending, delayed, compliance };
  });

  return (
    <Card>
      <CardHeader title={locale === 'ar' ? 'أداء المقاولين الخاصين' : locale === 'fr' ? 'Performance des Prestataires' : 'Private Contractor Performance'} icon={<Award className="w-4 h-4" />} />
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 dark:bg-ink-800/50 border-b border-ink-200 dark:border-ink-800">
              <tr className="text-right">
                <th className="px-3 py-2.5 text-xs font-semibold text-ink-500">{locale === 'ar' ? 'المقاول' : 'Contractor'}</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-ink-500">{locale === 'ar' ? 'مسندة' : 'Assigned'}</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-ink-500">{locale === 'ar' ? 'مكتملة' : 'Completed'}</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-ink-500">{locale === 'ar' ? 'معلقة' : 'Pending'}</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-ink-500">{locale === 'ar' ? 'متأخرة' : 'Delayed'}</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-ink-500">{locale === 'ar' ? 'الأداء' : 'Performance'}</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-ink-500">{locale === 'ar' ? 'الامتثال' : 'Compliance'}</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-ink-500">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800/60">
              {data.map((c) => (
                <tr key={c.id} className="hover:bg-ink-50/50 dark:hover:bg-ink-800/30 transition">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500/10 to-success-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {c.name.slice(-2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{c.name}</p>
                        <p className="text-[10px] text-ink-400">{c.zone} · {c.vehicles} {locale === 'ar' ? 'مركبة' : 'vehicles'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-ink-600 dark:text-ink-300">{c.assigned}</td>
                  <td className="px-3 py-2.5"><Badge tone="success">{c.completed}</Badge></td>
                  <td className="px-3 py-2.5"><Badge tone="warning">{c.pending}</Badge></td>
                  <td className="px-3 py-2.5"><Badge tone="danger">{c.delayed}</Badge></td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-warning-500" />
                      <span className="text-sm font-bold text-ink-800 dark:text-ink-100">{c.rating.toFixed(1)}</span>
                      <span className="text-xs text-ink-400">/5</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                        <div className={cn('h-full rounded-full', c.compliance >= 80 ? 'bg-success-500' : c.compliance >= 60 ? 'bg-warning-500' : 'bg-danger-500')} style={{ width: `${c.compliance}%` }} />
                      </div>
                      <span className="text-xs text-ink-500">{c.compliance}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5"><Badge tone={c.status === 'active' ? 'success' : c.status === 'suspended' ? 'danger' : 'neutral'} dot>
                    {c.status === 'active' ? (locale === 'ar' ? 'نشط' : 'Active') : c.status === 'suspended' ? (locale === 'ar' ? 'موقوف' : 'Suspended') : (locale === 'ar' ? 'منتهي' : 'Expired')}
                  </Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}

// ─── SECTION 8: Operational Monitoring ───────────────────────────────────────
function OperationalMonitoring() {
  const { t, locale } = useApp();
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const availableVehicles = vehicles.filter(v => v.status === 'active' || v.status === 'idle').length;
  const unavailableVehicles = vehicles.filter(v => v.status === 'maintenance' || v.status === 'offline').length;
  const driversOnDuty = drivers.filter(d => d.status === 'on-duty').length;
  const containersCollected = containers.filter(c => c.fillLevel < 30).length;
  const overflowing = containers.filter(c => c.status === 'full').length;
  const todayRoutes = routes.length;
  const todayInspections = inspections.filter(i => new Date(i.date).getMonth() === 6).length;
  const spotsCreatedToday = 3;
  const spotsResolvedToday = 7;

  const items = [
    { label: locale === 'ar' ? 'جولات التفتيش اليوم' : "Today's Inspections", value: todayInspections, icon: <ClipboardCheck className="w-4 h-4" />, tone: 'brand' as const },
    { label: locale === 'ar' ? 'عمليات التنظيف اليوم' : "Today's Cleaning Ops", value: todayRoutes, icon: <Truck className="w-4 h-4" />, tone: 'success' as const },
    { label: locale === 'ar' ? 'مركبات في الخدمة' : 'Vehicles in Service', value: activeVehicles, icon: <Truck className="w-4 h-4" />, tone: 'success' as const },
    { label: locale === 'ar' ? 'مركبات متاحة' : 'Available Vehicles', value: availableVehicles, icon: <Truck className="w-4 h-4" />, tone: 'brand' as const },
    { label: locale === 'ar' ? 'مركبات غير متاحة' : 'Unavailable Vehicles', value: unavailableVehicles, icon: <Wrench className="w-4 h-4" />, tone: 'danger' as const },
    { label: locale === 'ar' ? 'سائقون في الخدمة' : 'Drivers on Duty', value: driversOnDuty, icon: <Users className="w-4 h-4" />, tone: 'success' as const },
    { label: locale === 'ar' ? 'حاويات تم تفريغها' : 'Containers Collected', value: containersCollected, icon: <Trash2 className="w-4 h-4" />, tone: 'brand' as const },
    { label: locale === 'ar' ? 'حاويات ممتلئة' : 'Overflowing Containers', value: overflowing, icon: <AlertCircle className="w-4 h-4" />, tone: 'danger' as const },
    { label: locale === 'ar' ? 'نقاط سوداء جديدة اليوم' : 'New Black Spots Today', value: spotsCreatedToday, icon: <AlertTriangle className="w-4 h-4" />, tone: 'warning' as const },
    { label: locale === 'ar' ? 'نقاط محلولة اليوم' : 'Spots Resolved Today', value: spotsResolvedToday, icon: <CheckCircle2 className="w-4 h-4" />, tone: 'success' as const },
  ];

  return (
    <Card>
      <CardHeader title={locale === 'ar' ? 'المراقبة التشغيلية' : locale === 'fr' ? 'Surveillance Opérationnelle' : 'Operational Monitoring'} icon={<Activity className="w-4 h-4" />} />
      <CardBody>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {items.map((item, i) => (
            <motion.div key={i} {...fadeUp} transition={{ duration: 0.25, delay: i * 0.03 }}
              className="p-4 rounded-xl2 border border-ink-200/60 dark:border-ink-800/60 hover:shadow-soft transition">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-2',
                item.tone === 'brand' ? 'bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-400'
                  : item.tone === 'success' ? 'bg-success-50 text-success-600 dark:bg-success-600/15 dark:text-success-400'
                  : item.tone === 'warning' ? 'bg-warning-50 text-warning-600 dark:bg-warning-600/15 dark:text-warning-400'
                  : 'bg-danger-50 text-danger-600 dark:bg-danger-600/15 dark:text-danger-400')}>
                {item.icon}
              </div>
              <p className="text-2xl font-bold text-ink-900 dark:text-white">{item.value}</p>
              <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// ─── SECTION 9: Executive Alert Center ────────────────────────────────────────
function AlertCenter() {
  const { t, locale } = useApp();

  const execAlerts = [
    { id: 'EA1', priority: 'critical', title: locale === 'ar' ? 'نقاط سوداء حرجة في خنشلة المركز' : 'Critical black spots in Khenchela', location: 'خنشلة - حي النصر', responsible: locale === 'ar' ? 'البلدية' : 'Municipality', elapsed: '12 min', action: locale === 'ar' ? 'تدخل فوري مطلوب' : 'Immediate intervention required' },
    { id: 'EA2', priority: 'critical', title: locale === 'ar' ? 'تفريغ عشوائي متكرر في قايس' : 'Repeated illegal dumping in Kais', location: 'قايس - المنطقة الشرقية', responsible: locale === 'ar' ? 'مركز الطرح' : 'CET', elapsed: '35 min', action: locale === 'ar' ? 'نشر فرق التنظيف' : 'Deploy cleaning teams' },
    { id: 'EA3', priority: 'warning', title: locale === 'ar' ? 'حاويات ممتلئة تجاوزت 95%' : 'Containers overflowing 95%', location: 'بقاية - الوسط', responsible: locale === 'ar' ? 'المقاول' : 'Contractor', elapsed: '1h', action: locale === 'ar' ? 'تفريغ عاجل' : 'Urgent collection' },
    { id: 'EA4', priority: 'warning', title: locale === 'ar' ? 'أوامر شغل متأخرة' : 'Delayed work orders', location: 'الحمامة', responsible: locale === 'ar' ? 'البلدية' : 'Municipality', elapsed: '2h', action: locale === 'ar' ? 'متابعة الإكمال' : 'Follow up completion' },
    { id: 'EA5', priority: 'warning', title: locale === 'ar' ? 'بلدية بأداء ضعيف' : 'Poor performing municipality', location: 'عنسيغة', responsible: locale === 'ar' ? 'مديرية البيئة' : 'Env. Directorate', elapsed: '3h', action: locale === 'ar' ? 'مراجعة الخطة' : 'Review plan' },
    { id: 'EA6', priority: 'info', title: locale === 'ar' ? 'مقاول غير نشط' : 'Inactive contractor', location: 'شرق خنشلة', responsible: locale === 'ar' ? 'مقاولة الأمل' : 'Al Amal', elapsed: '5h', action: locale === 'ar' ? 'تقييم الوضع' : 'Assess situation' },
  ];

  const toneMap: Record<string, { bg: string; text: string; label: string }> = {
    critical: { bg: 'bg-danger-50 dark:bg-danger-600/10', text: 'text-danger-600 dark:text-danger-400', label: locale === 'ar' ? 'حرج' : 'Critical' },
    warning: { bg: 'bg-warning-50 dark:bg-warning-600/10', text: 'text-warning-600 dark:text-warning-400', label: locale === 'ar' ? 'تحذير' : 'Warning' },
    info: { bg: 'bg-sky-50 dark:bg-sky-600/10', text: 'text-sky-600 dark:text-sky-400', label: locale === 'ar' ? 'معلومة' : 'Info' },
  };

  return (
    <Card>
      <CardHeader title={locale === 'ar' ? 'مركز التنبيهات التنفيذية' : locale === 'fr' ? 'Centre d\'Alertes' : 'Executive Alert Center'} icon={<AlertCircle className="w-4 h-4" />}
        action={<Badge tone="danger">{execAlerts.filter(a => a.priority === 'critical').length}</Badge>} />
      <CardBody>
        <div className="space-y-2.5">
          {execAlerts.map((a) => {
            const tc = toneMap[a.priority];
            return (
              <div key={a.id} className={cn('flex items-start gap-3 p-3 rounded-xl2 border transition', tc.bg, 'border-transparent')}>
                <div className={cn('shrink-0 mt-0.5', tc.text)}>
                  {a.priority === 'critical' ? <AlertCircle className="w-4 h-4" /> : a.priority === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{a.title}</p>
                    <Badge tone={a.priority === 'critical' ? 'danger' : a.priority === 'warning' ? 'warning' : 'info'}>{tc.label}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-ink-500 dark:text-ink-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {a.location}</span>
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {a.responsible}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {a.elapsed}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Target className="w-3 h-3 text-brand-500" />
                    <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">{a.action}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

// ─── SECTION 10: Decision Support Center ─────────────────────────────────────
function DecisionSupport() {
  const { t, locale } = useApp();

  const recommendations = [
    { id: 1, priority: 'critical', confidence: 92, impact: locale === 'ar' ? 'عالي جداً' : 'Very High', title: locale === 'ar' ? 'تدخل عاجل مطلوب في بلدية خنشلة المركز' : 'Urgent intervention required in Khenchela', desc: locale === 'ar' ? '5 نقاط سوداء حرجة تحتاج تدخلاً فورياً' : '5 critical black spots need immediate action' },
    { id: 2, priority: 'high', confidence: 85, impact: locale === 'ar' ? 'عالي' : 'High', title: locale === 'ar' ? 'زيادة الحاويات في حي النصر' : 'Increase containers in Ennasr neighborhood', desc: locale === 'ar' ? 'معدل الامتلاء تجاوز 90%' : 'Fill rate exceeded 90%' },
    { id: 3, priority: 'high', confidence: 78, impact: locale === 'ar' ? 'عالي' : 'High', title: locale === 'ar' ? 'نشر فرق تنظيف إضافية' : 'Deploy additional cleaning teams', desc: locale === 'ar' ? 'عمليات التنظيف أقل من المخطط بـ 15%' : 'Cleaning ops 15% below plan' },
    { id: 4, priority: 'medium', confidence: 71, impact: locale === 'ar' ? 'متوسط' : 'Medium', title: locale === 'ar' ? 'أداء المقاول انخفض' : 'Contractor performance decreased', desc: locale === 'ar' ? 'مقاولة الأمل: انخفاض 12%' : 'Al Amal: 12% decrease' },
    { id: 5, priority: 'medium', confidence: 68, impact: locale === 'ar' ? 'متوسط' : 'Medium', title: locale === 'ar' ? 'تغطية التفتيش تحت المستهدف' : 'Inspection coverage below target', desc: locale === 'ar' ? '94% مقابل 95% مستهدف' : '94% vs 95% target' },
    { id: 6, priority: 'low', confidence: 62, impact: locale === 'ar' ? 'منخفض' : 'Low', title: locale === 'ar' ? 'تفريغ عشوائي متكرر' : 'Recurring illegal dumping', desc: locale === 'ar' ? 'نفس الموقع في قايس 3 مرات' : 'Same site in Kais 3 times' },
  ];

  const toneMap: Record<string, 'danger' | 'warning' | 'info' | 'neutral'> = {
    critical: 'danger', high: 'warning', medium: 'info', low: 'neutral',
  };

  return (
    <Card>
      <CardHeader title={locale === 'ar' ? 'مركز دعم القرار' : locale === 'fr' ? 'Centre d\'Aide à la Décision' : 'Decision Support Center'} icon={<Brain className="w-4 h-4" />}
        action={<Badge tone="brand" dot>AI</Badge>} />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((r, i) => (
            <motion.div key={r.id} {...fadeUp} transition={{ duration: 0.25, delay: i * 0.05 }}
              className="p-4 rounded-xl2 border border-ink-200/60 dark:border-ink-800/60 hover:shadow-soft transition">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center',
                    r.priority === 'critical' ? 'bg-danger-50 text-danger-600 dark:bg-danger-600/15 dark:text-danger-400'
                      : r.priority === 'high' ? 'bg-warning-50 text-warning-600 dark:bg-warning-600/15 dark:text-warning-400'
                      : r.priority === 'medium' ? 'bg-sky-50 text-sky-600 dark:bg-sky-600/15 dark:text-sky-400'
                      : 'bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400')}>
                    <Cpu className="w-4 h-4" />
                  </div>
                  <Badge tone={toneMap[r.priority]}>{r.priority === 'critical' ? (locale === 'ar' ? 'حرج' : 'Critical') : r.priority === 'high' ? (locale === 'ar' ? 'عالي' : 'High') : r.priority === 'medium' ? (locale === 'ar' ? 'متوسط' : 'Medium') : (locale === 'ar' ? 'منخفض' : 'Low')}</Badge>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Zap className="w-3 h-3 text-warning-500" />
                  <span className="font-mono font-semibold text-ink-700 dark:text-ink-200">{r.confidence}%</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-ink-800 dark:text-ink-100 mb-1">{r.title}</p>
              <p className="text-xs text-ink-500 dark:text-ink-400">{r.desc}</p>
              <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-ink-100 dark:border-ink-800/60">
                <span className="text-[10px] text-ink-400">{locale === 'ar' ? 'الأثر المتوقع' : 'Expected Impact'}:</span>
                <span className="text-xs font-medium text-brand-600 dark:text-brand-400">{r.impact}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// ─── SECTION 11: Recent Executive Activities ──────────────────────────────────
function RecentActivities() {
  const { t, locale } = useApp();

  const activities = [
    { id: 1, type: 'inspection', title: locale === 'ar' ? 'جولة تفتيش مكتملة' : 'Inspection tour completed', detail: 'INS-7012 — خنشلة', time: 'قبل 15 دقيقة', icon: <ClipboardCheck className="w-4 h-4" />, tone: 'brand' as const },
    { id: 2, type: 'workOrder', title: locale === 'ar' ? 'أمر شغل جديد' : 'New work order', detail: 'WO-20015 — قايس', time: 'قبل 32 دقيقة', icon: <Wrench className="w-4 h-4" />, tone: 'warning' as const },
    { id: 3, type: 'cleaning', title: locale === 'ar' ? 'عملية تنظيف مكتملة' : 'Cleaning operation completed', detail: 'RT-6005 — بقاية', time: 'قبل ساعة', icon: <Truck className="w-4 h-4" />, tone: 'success' as const },
    { id: 4, type: 'complaint', title: locale === 'ar' ? 'شكوى مواطن' : 'Citizen complaint', detail: 'CM-8008 — الحمامة', time: 'قبل ساعتين', icon: <Users className="w-4 h-4" />, tone: 'warning' as const },
    { id: 5, type: 'blackSpot', title: locale === 'ar' ? 'نقطة سوداء جديدة' : 'New black spot', detail: 'BS-1042 — بوحمامة', time: 'قبل 3 ساعات', icon: <AlertTriangle className="w-4 h-4" />, tone: 'danger' as const },
    { id: 6, type: 'resolved', title: locale === 'ar' ? 'تم حل حالة' : 'Case resolved', detail: 'BS-1024 — قايس', time: 'قبل 4 ساعات', icon: <CheckCircle2 className="w-4 h-4" />, tone: 'success' as const },
  ];

  return (
    <Card>
      <CardHeader title={locale === 'ar' ? 'الأنشطة التنفيذية الأخيرة' : locale === 'fr' ? 'Activités Récentes' : 'Recent Executive Activities'} icon={<Activity className="w-4 h-4" />} />
      <CardBody>
        <div className="relative pl-6">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-ink-200 dark:bg-ink-700" />
          {activities.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="relative pb-4 last:pb-0">
              <div className={cn('absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-soft',
                a.tone === 'brand' ? 'bg-brand-500' : a.tone === 'success' ? 'bg-success-500' : a.tone === 'warning' ? 'bg-warning-500' : 'bg-danger-500')}>
                <span className="scale-75">{a.icon}</span>
              </div>
              <div className="ml-2">
                <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{a.title}</p>
                <p className="text-xs text-ink-500 dark:text-ink-400">{a.detail}</p>
                <p className="text-[10px] text-ink-400 mt-0.5">{a.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// ─── SECTION 12: Official Reports ────────────────────────────────────────────
function OfficialReports() {
  const { t, locale } = useApp();

  const reports = [
    { id: 1, title: locale === 'ar' ? 'التقرير التنفيذي' : 'Executive Report', icon: <FileBarChart className="w-5 h-5" />, tone: 'brand' as const },
    { id: 2, title: locale === 'ar' ? 'تقرير أداء البلديات' : 'Municipality Performance Report', icon: <Building2 className="w-5 h-5" />, tone: 'success' as const },
    { id: 3, title: locale === 'ar' ? 'تقرير مراكز الطرح' : 'CET Report', icon: <Factory className="w-5 h-5" />, tone: 'warning' as const },
    { id: 4, title: locale === 'ar' ? 'تقرير المقاولين' : 'Contractor Report', icon: <Award className="w-5 h-5" />, tone: 'neutral' as const },
    { id: 5, title: locale === 'ar' ? 'تقرير التفتيش' : 'Inspection Report', icon: <ClipboardCheck className="w-5 h-5" />, tone: 'brand' as const },
    { id: 6, title: locale === 'ar' ? 'تقرير النقاط السوداء' : 'Black Spot Report', icon: <AlertTriangle className="w-5 h-5" />, tone: 'danger' as const },
    { id: 7, title: locale === 'ar' ? 'تقرير شكاوى المواطنين' : 'Citizen Complaint Report', icon: <Users className="w-5 h-5" />, tone: 'warning' as const },
    { id: 8, title: locale === 'ar' ? 'تقرير المؤشرات البيئية' : 'Environmental Indicators Report', icon: <Gauge className="w-5 h-5" />, tone: 'success' as const },
  ];

  const exportFormats = [
    { label: 'PDF', icon: <FileType className="w-4 h-4" />, color: 'text-danger-600 dark:text-danger-400' },
    { label: 'Excel', icon: <FileSpreadsheet className="w-4 h-4" />, color: 'text-success-600 dark:text-success-400' },
    { label: 'CSV', icon: <FileText className="w-4 h-4" />, color: 'text-brand-600 dark:text-brand-400' },
  ];

  return (
    <Card>
      <CardHeader title={locale === 'ar' ? 'التقارير الرسمية' : locale === 'fr' ? 'Rapports Officiels' : 'Official Reports'} icon={<FileBarChart className="w-4 h-4" />}
        action={
          <button className="btn-ghost text-xs">
            <Printer className="w-3.5 h-3.5" /> {locale === 'ar' ? 'معاينة الطباعة' : 'Print Preview'}
          </button>
        } />
      <CardBody>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {reports.map((r, i) => (
            <motion.div key={r.id} {...fadeUp} transition={{ duration: 0.25, delay: i * 0.03 }}
              className="p-4 rounded-xl2 border border-ink-200/60 dark:border-ink-800/60 hover:shadow-soft transition group">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3',
                r.tone === 'brand' ? 'bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-400'
                  : r.tone === 'success' ? 'bg-success-50 text-success-600 dark:bg-success-600/15 dark:text-success-400'
                  : r.tone === 'warning' ? 'bg-warning-50 text-warning-600 dark:bg-warning-600/15 dark:text-warning-400'
                  : r.tone === 'danger' ? 'bg-danger-50 text-danger-600 dark:bg-danger-600/15 dark:text-danger-400'
                  : 'bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400')}>
                {r.icon}
              </div>
              <p className="text-sm font-semibold text-ink-800 dark:text-ink-100 mb-2">{r.title}</p>
              <div className="flex items-center gap-2">
                {exportFormats.map((f) => (
                  <button key={f.label} className={cn('flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium hover:bg-ink-100 dark:hover:bg-ink-800 transition', f.color)}>
                    {f.icon} {f.label}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// ─── Performance Indicators Radial ────────────────────────────────────────────
function PerformanceRadial() {
  const { t, locale } = useApp();
  const indicators = [
    { name: locale === 'ar' ? 'مؤشر الأداء البيئي' : 'Environmental Index', value: 78, target: 85, fill: '#0F4C81' },
    { name: locale === 'ar' ? 'كفاءة التفتيش' : 'Inspection Efficiency', value: 94, target: 95, fill: '#16A34A' },
    { name: locale === 'ar' ? 'أداء البلديات' : 'Municipality Performance', value: 72, target: 80, fill: '#F59E0B' },
    { name: locale === 'ar' ? 'أداء مراكز الطرح' : 'CET Performance', value: 81, target: 85, fill: '#14B8A6' },
    { name: locale === 'ar' ? 'أداء المقاولين' : 'Contractor Performance', value: 76, target: 80, fill: '#F97316' },
    { name: locale === 'ar' ? 'حل الشكاوى' : 'Complaint Resolution', value: 68, target: 75, fill: '#DC2626' },
    { name: locale === 'ar' ? 'حل النقاط السوداء' : 'Black Spot Resolution', value: 82, target: 85, fill: '#3B82F6' },
    { name: locale === 'ar' ? 'تغطية التنظيف' : 'Cleaning Coverage', value: 88, target: 90, fill: '#8B5CF6' },
    { name: locale === 'ar' ? 'وقت الاستجابة' : 'Response Time', value: 74, target: 80, fill: '#EC4899' },
    { name: locale === 'ar' ? 'رضا المواطنين' : 'Citizen Satisfaction', value: 65, target: 75, fill: '#64748B' },
  ];

  return (
    <Card>
      <CardHeader title={locale === 'ar' ? 'مؤشرات الأداء' : 'Performance Indicators'} icon={<Gauge className="w-4 h-4" />} />
      <CardBody>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ResponsiveContainer width="100%" height={260}>
            <RadialBarChart data={indicators} innerRadius="20%" outerRadius="100%" startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'rgba(148,163,184,0.08)' }}>
                {indicators.map((_, i) => <Cell key={i} fill={indicators[i].fill} />)}
              </RadialBar>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.92)', color: '#fff', fontSize: 12 }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {indicators.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.fill }} />
                  <span className="text-xs text-ink-600 dark:text-ink-300">{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink-800 dark:text-ink-100">{p.value}%</span>
                  <span className="text-[10px] text-ink-400">/ {p.target}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const { t, locale } = useApp();

  const envStatus: EnvStatus = useMemo(() => {
    const avgPerf = municipalities.reduce((a, m) => a + m.fillRate + m.collectionRate, 0) / (municipalities.length * 2);
    if (avgPerf >= 80) return 'good';
    if (avgPerf >= 70) return 'average';
    if (avgPerf >= 60) return 'poor';
    return 'critical';
  }, []);

  return (
    <div className="space-y-6">
      <ExecutiveHeader envStatus={envStatus} />
      <ExecutiveKPIs />
      <ExecutiveMap />
      <ExecutiveAnalytics />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MunicipalityRanking />
        <PerformanceRadial />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CetPerformance />
        <ContractorPerformance />
      </div>
      <OperationalMonitoring />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AlertCenter />
        <DecisionSupport />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentActivities />
        <OfficialReports />
      </div>
    </div>
  );
}
