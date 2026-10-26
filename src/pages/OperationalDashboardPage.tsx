import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { CircleMarker, MapContainer, Tooltip } from 'react-leaflet';
import { AlertTriangle, Building2, ClipboardCheck, Home, MessageSquareWarning, Route as RouteIcon, Trash2, Truck, UserSquare2, Wrench, FlaskConical } from 'lucide-react';
import { BasemapTileLayer } from '@/components/gis/BasemapTileLayer';
import { useApp } from '@/store/appStore';
import {
  blackSpots, complaints, containers, drivers, inspections, KHENCHELA_CENTER, municipalities, neighborhoods, routes, vehicles,
  type Municipality, type Vehicle,
} from '@/data/mockData';
import { conicGradient, distribution, topWithOthers, weightedCollectionRate } from '@/lib/dashboardStats';
import { cn } from '@/lib/cn';

const TYPE_ORDER = ['standard', 'underground', 'recycling', 'organic'] as const;
const TYPE_KEY: Record<(typeof TYPE_ORDER)[number], string> = {
  standard: 'dshTypeStandard', underground: 'dshTypeUnderground', recycling: 'dshTypeRecycling', organic: 'dshTypeOrganic',
};
const TYPE_COLORS = ['#1F6FEB', '#16A34A', '#E39B0B', '#7B5CE0'];
const VEHICLE_ORDER: Vehicle['status'][] = ['active', 'maintenance', 'idle', 'offline'];
const VEHICLE_STATUS_KEY: Record<Vehicle['status'], string> = {
  active: 'dshStActive', idle: 'dshStIdle', maintenance: 'dshStMaintenance', offline: 'dshStOffline',
};
const VEHICLE_STATUS_CLASS: Record<Vehicle['status'], string> = {
  active: 'bg-success-50 text-success-700 dark:bg-success-600/15 dark:text-success-300',
  maintenance: 'bg-danger-50 text-danger-700 dark:bg-danger-600/15 dark:text-danger-300',
  idle: 'bg-warning-50 text-warning-700 dark:bg-warning-600/15 dark:text-warning-300',
  offline: 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300',
};

const numberLocale = (l: string) => (l === 'ar' ? 'ar-DZ-u-nu-latn' : l);

function Panel({ title, action, children, className }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-2xl border border-ink-200/70 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-card', className)}>
      <header className="flex items-center justify-between gap-3 px-5 pt-4">
        <h2 className="text-base font-semibold text-ink-900 dark:text-white">{title}</h2>
        {action}
      </header>
      <div className="p-5 pt-3">{children}</div>
    </section>
  );
}

export function OperationalDashboardPage() {
  const { t, locale } = useApp();
  const reduce = useReducedMotion();
  const nf = useMemo(() => new Intl.NumberFormat(numberLocale(locale)), [locale]);

  const munName = useMemo(() => {
    const byAr = new Map<string, Municipality>(municipalities.map((m) => [m.nameAr, m]));
    const byId = new Map<string, Municipality>(municipalities.map((m) => [m.id, m]));
    const pick = (m: Municipality) => (locale === 'ar' ? m.nameAr : locale === 'fr' ? m.nameFr : m.name);
    return { fromAr: (ar: string) => { const m = byAr.get(ar); return m ? pick(m) : ar; }, fromId: (id: string) => { const m = byId.get(id); return m ? pick(m) : id; } };
  }, [locale]);

  const stats = useMemo(() => {
    const openSpots = blackSpots.filter((s) => s.status === 'open');
    const fullContainers = containers.filter((c) => c.status === 'full');
    const activeVehicles = vehicles.filter((v) => v.status === 'active');
    return {
      openSpots, fullContainers, activeVehicles,
      activeRounds: routes.filter((r) => r.status === 'active').length,
      newComplaints: complaints.filter((c) => c.status === 'new').length,
      inMaintenance: vehicles.filter((v) => v.status === 'maintenance').length,
      rate: weightedCollectionRate(municipalities),
      bars: topWithOthers(municipalities, 7),
      types: distribution(containers.map((c) => c.type), [...TYPE_ORDER]),
    };
  }, []);

  const activity = useMemo(() => {
    const items = [
      ...complaints.map((c) => ({ id: c.id, kind: 'dshActComplaint', place: munName.fromAr(c.municipality), date: c.date })),
      ...inspections.map((i) => ({ id: i.id, kind: 'dshActInspection', place: munName.fromAr(i.municipality), date: i.date })),
    ];
    return items.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id)).slice(0, 5);
  }, [munName]);

  const vehicleRows = useMemo(
    () => [...vehicles].sort((a, b) => VEHICLE_ORDER.indexOf(a.status) - VEHICLE_ORDER.indexOf(b.status)).slice(0, 6),
    [],
  );

  const kpis = [
    { label: t('dshMunicipalities'), value: municipalities.length, icon: Building2, tint: 'bg-brand-600' },
    { label: t('dshNeighborhoods'), value: neighborhoods.length, icon: Home, tint: 'bg-success-600' },
    { label: t('dshContainers'), value: containers.length, icon: Trash2, tint: 'bg-warning-600' },
    { label: t('dshVehicles'), value: vehicles.length, icon: Truck, tint: 'bg-accent-600' },
    { label: t('dshDrivers'), value: drivers.length, icon: UserSquare2, tint: 'bg-brand-800' },
    { label: t('dshActiveRounds'), value: stats.activeRounds, icon: RouteIcon, tint: 'bg-success-700' },
  ];

  const summary = [
    { label: t('dshOpenSpots'), value: stats.openSpots.length, sub: t('dshOpenSpotsSub').replace('{n}', nf.format(blackSpots.length)), icon: AlertTriangle, tone: 'text-danger-600 bg-danger-50 dark:bg-danger-600/15 dark:text-danger-300' },
    { label: t('dshNewComplaints'), value: stats.newComplaints, sub: t('dshNewComplaintsSub').replace('{n}', nf.format(complaints.length)), icon: MessageSquareWarning, tone: 'text-warning-700 bg-warning-50 dark:bg-warning-600/15 dark:text-warning-300' },
    { label: t('dshMaintenanceCount'), value: stats.inMaintenance, sub: t('dshMaintenanceSub').replace('{n}', nf.format(vehicles.length)), icon: Wrench, tone: 'text-brand-700 bg-brand-50 dark:bg-brand-600/15 dark:text-brand-300' },
  ];

  const maxBar = Math.max(1, ...stats.bars.map((b) => b.value));
  const fade = (i: number) => (reduce ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, delay: i * 0.05 } });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-white">{t('dshTitle')}</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{t('dshSubtitle')}</p>
        </div>
        <p role="note" className="flex items-center gap-2 rounded-full bg-warning-50 px-3 py-1.5 text-xs font-medium text-warning-800 dark:bg-warning-600/15 dark:text-warning-200">
          <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {t('dshDemoNotice')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k, i) => (
          <motion.div key={k.label} {...fade(i)} className="flex items-center gap-3 rounded-2xl border border-ink-200/70 bg-white p-4 shadow-card dark:border-ink-800 dark:bg-ink-900">
            <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white', k.tint)}><k.icon className="h-5 w-5" aria-hidden="true" /></span>
            <div className="min-w-0 leading-tight">
              <p className="text-2xl font-bold tabular-nums text-ink-900 dark:text-white">{nf.format(k.value)}</p>
              <p className="text-xs text-ink-500 dark:text-ink-400">{k.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel
          title={t('dshMapTitle')}
          className="xl:col-span-2"
          action={
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-600 dark:text-ink-300">
              <li className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-danger-600" />{t('dshLegendFull')}</li>
              <li className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-success-600" />{t('dshLegendOk')}</li>
              <li className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-warning-600" />{t('dshLegendSpots')}</li>
              <li className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-brand-600" />{t('dshLegendVehicles')}</li>
            </ul>
          }
        >
          <div className="h-[340px] overflow-hidden rounded-xl border border-ink-200 dark:border-ink-800" role="img" aria-label={t('dshMapLabel')}>
            <MapContainer center={KHENCHELA_CENTER} zoom={10} className="h-full w-full" scrollWheelZoom={false}>
              <BasemapTileLayer id="osm" />
              {containers.map((c) => (
                <CircleMarker key={c.id} center={[c.lat, c.lng]} radius={c.status === 'full' ? 5 : 3.5}
                  pathOptions={{ color: '#fff', weight: 1, fillOpacity: 0.9, fillColor: c.status === 'full' ? '#DC2626' : '#16A34A' }}>
                  <Tooltip>{c.code}</Tooltip>
                </CircleMarker>
              ))}
              {stats.openSpots.map((s) => (
                <CircleMarker key={s.id} center={[s.lat, s.lng]} radius={6} pathOptions={{ color: '#fff', weight: 1.5, fillOpacity: 0.95, fillColor: '#D97706' }}>
                  <Tooltip>{s.code}</Tooltip>
                </CircleMarker>
              ))}
              {stats.activeVehicles.map((v) => (
                <CircleMarker key={v.id} center={[v.lat, v.lng]} radius={7} pathOptions={{ color: '#fff', weight: 2, fillOpacity: 1, fillColor: '#1F4E8C' }}>
                  <Tooltip>{v.plate}</Tooltip>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </Panel>

        <Panel title={t('dshVehiclesTitle')} action={<Link to="/vehicles" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300">{t('dshViewAll')}</Link>}>
          <ul className="divide-y divide-ink-100 dark:divide-ink-800">
            {vehicleRows.map((v) => (
              <li key={v.id} className="flex items-center gap-3 py-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300"><Truck className="h-4 w-4" aria-hidden="true" /></span>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="text-sm font-semibold text-ink-900 dark:text-white" dir="ltr">{v.plate}</p>
                  <p className="truncate text-xs text-ink-500 dark:text-ink-400">{munName.fromAr(v.municipality)} · {t('dshFuel')} {v.fuel}%</p>
                </div>
                <span className={cn('whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold', VEHICLE_STATUS_CLASS[v.status])}>{t(VEHICLE_STATUS_KEY[v.status])}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <section className="flex items-center gap-4 rounded-2xl border border-ink-200/70 bg-white p-5 shadow-card dark:border-ink-800 dark:bg-ink-900">
          <div className="grid h-[84px] w-[84px] shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#16A34A 0 ${stats.rate}%, #E2E8F0 ${stats.rate}% 100%)` }} role="img" aria-label={`${stats.rate}%`}>
            <span className="grid h-[62px] w-[62px] place-items-center rounded-full bg-white text-lg font-bold tabular-nums text-ink-900 dark:bg-ink-900 dark:text-white">{stats.rate}%</span>
          </div>
          <div className="min-w-0 leading-snug">
            <p className="font-semibold text-ink-900 dark:text-white">{t('dshCollectionRate')}</p>
            <p className="text-xs text-ink-500 dark:text-ink-400">{t('dshCollectionSub')}</p>
          </div>
        </section>
        {summary.map((s) => (
          <section key={s.label} className="flex items-center gap-4 rounded-2xl border border-ink-200/70 bg-white p-5 shadow-card dark:border-ink-800 dark:bg-ink-900">
            <span className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-xl', s.tone)}><s.icon className="h-6 w-6" aria-hidden="true" /></span>
            <div className="min-w-0 leading-snug">
              <p className="text-2xl font-bold tabular-nums text-ink-900 dark:text-white">{nf.format(s.value)}</p>
              <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{s.label}</p>
              <p className="text-xs text-ink-500 dark:text-ink-400">{s.sub}</p>
            </div>
          </section>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-5">
        <Panel title={t('dshChartTitle')} className="xl:col-span-2">
          <div className="flex h-[210px] items-end gap-2 border-b border-ink-200 dark:border-ink-800" role="list">
            {stats.bars.map((b) => (
              <div key={b.id} role="listitem" className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[11px] font-semibold tabular-nums text-ink-700 dark:text-ink-200">{nf.format(b.value)}</span>
                <div className={cn('w-full max-w-[40px] rounded-t-md', b.isOthers ? 'bg-brand-300 dark:bg-brand-700' : 'bg-brand-600')} style={{ height: `${Math.max(4, Math.round((b.value / maxBar) * 150))}px` }} />
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex gap-2">
            {stats.bars.map((b) => (
              <p key={b.id} className="min-w-0 flex-1 truncate text-center text-[11px] text-ink-500 dark:text-ink-400" title={b.isOthers ? t('dshOthers') : munName.fromId(b.id)}>
                {b.isOthers ? t('dshOthers') : munName.fromId(b.id)}
              </p>
            ))}
          </div>
        </Panel>

        <Panel title={t('dshTypesTitle')} className="xl:col-span-1">
          <div className="flex flex-wrap items-center gap-5">
            <div className="grid h-[120px] w-[120px] shrink-0 place-items-center rounded-full" style={{ background: conicGradient(stats.types, TYPE_COLORS) }} role="img" aria-label={t('dshTypesTitle')}>
              <div className="grid h-[88px] w-[88px] place-items-center rounded-full bg-white text-center leading-tight dark:bg-ink-900">
                <span><b className="block text-lg tabular-nums text-ink-900 dark:text-white">{nf.format(containers.length)}</b><span className="text-[11px] text-ink-500 dark:text-ink-400">{t('dshContainers')}</span></span>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              {stats.types.map((s, i) => (
                <li key={s.key} className="flex items-center gap-2 text-ink-700 dark:text-ink-200">
                  <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                  <span>{t(TYPE_KEY[s.key as (typeof TYPE_ORDER)[number]])}</span>
                  <span className="text-xs tabular-nums text-ink-500 dark:text-ink-400">{nf.format(s.count)} ({s.percent}%)</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel title={t('dshActivityTitle')} className="xl:col-span-2" action={<ClipboardCheck className="h-4 w-4 text-ink-400" aria-hidden="true" />}>
          {activity.length === 0 ? <p className="text-sm text-ink-500">{t('dshNoData')}</p> : (
            <ul className="divide-y divide-ink-100 dark:divide-ink-800">
              {activity.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">{t(a.kind)} · <span dir="ltr">{a.id}</span></p>
                    <p className="truncate text-xs text-ink-500 dark:text-ink-400">{a.place}</p>
                  </div>
                  <time dateTime={a.date} className="shrink-0 text-xs tabular-nums text-ink-500 dark:text-ink-400">{new Date(a.date).toLocaleDateString(numberLocale(locale))}</time>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
