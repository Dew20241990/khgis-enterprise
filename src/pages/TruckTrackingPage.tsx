import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigation, Truck, Download, MapPin, Activity, Gauge, Search, AlertTriangle, FlaskConical } from 'lucide-react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { PageHeader, Card, CardHeader, CardBody, Badge, StatusBadge, StatCard } from '@/components/ui';
import { BasemapTileLayer } from '@/components/gis/BasemapTileLayer';
import { useApp } from '@/store/appStore';
import { vehicles, KHENCHELA_CENTER } from '@/data/mockData';
import { freshness, type TelemetrySource, type VehiclePosition } from '@/lib/telemetry';
import { useTelemetry } from '@/lib/useTelemetry';
import { toCsv } from '@/lib/csv';
import { downloadFile } from '@/lib/importExport';

const markerHtml = (bg: string, size: number, glyph: string, extra = '') =>
  `<div style="background:${bg};color:#fff;border-radius:50%;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:${size / 2.3}px;${extra}">${glyph}</div>`;

const truckIcon = L.divIcon({ className: 'truck-marker', html: markerHtml('#0F4C81', 32, '🚛'), iconSize: [32, 32], iconAnchor: [16, 16] });
const idleIcon = L.divIcon({ className: 'truck-marker-idle', html: markerHtml('#94a3b8', 28, '🚛'), iconSize: [28, 28], iconAnchor: [14, 14] });
const maintenanceIcon = L.divIcon({ className: 'truck-marker-maint', html: markerHtml('#F59E0B', 28, '🔧'), iconSize: [28, 28], iconAnchor: [14, 14] });
const staleIcon = L.divIcon({ className: 'truck-marker-stale', html: markerHtml('#94a3b8', 28, '🚛', 'opacity:0.55;border-style:dashed;'), iconSize: [28, 28], iconAnchor: [14, 14] });

function getIcon(status: string, stale: boolean) {
  if (stale) return staleIcon;
  if (status === 'active') return truckIcon;
  if (status === 'maintenance') return maintenanceIcon;
  return idleIcon;
}

const TRAIL_LENGTH = 30;
const demoVehicles = vehicles.map((v) => ({ id: v.id, lat: v.lat, lng: v.lng, active: v.status === 'active' }));

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 13, { duration: 1.5 });
  }, [target, map]);
  return null;
}

function sourceBadgeTone(source: TelemetrySource): 'success' | 'warning' | 'danger' {
  return source === 'live' ? 'success' : source === 'demo' ? 'warning' : 'danger';
}

export function TruckTrackingPage() {
  const { t, locale } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { snapshot, loading, isConfigured } = useTelemetry(demoVehicles);

  // Observed trail per vehicle (real history of received fixes, not a drawn route).
  const trails = useRef<Map<string, [number, number][]>>(new Map());
  const [, forceTrailRender] = useState(0);
  useEffect(() => {
    if (snapshot.source === 'none') return;
    for (const p of snapshot.positions) {
      const trail = trails.current.get(p.vehicleId) ?? [];
      const last = trail[trail.length - 1];
      if (!last || last[0] !== p.lat || last[1] !== p.lng) {
        trail.push([p.lat, p.lng]);
        if (trail.length > TRAIL_LENGTH) trail.shift();
        trails.current.set(p.vehicleId, trail);
      }
    }
    forceTrailRender((n) => n + 1);
  }, [snapshot]);

  const positionById = useMemo(() => {
    const m = new Map<string, VehiclePosition>();
    snapshot.positions.forEach((p) => m.set(p.vehicleId, p));
    return m;
  }, [snapshot]);

  const now = Date.parse(snapshot.fetchedAt);
  const isStale = (p: VehiclePosition | undefined) =>
    snapshot.source === 'live' && p !== undefined && freshness(p.timestamp, now) === 'stale';
  const staleCount = snapshot.positions.filter((p) => isStale(p)).length;

  const active = vehicles.filter((v) => v.status === 'active');
  const filtered = vehicles.filter((v) =>
    v.plate.toLowerCase().includes(search.toLowerCase()) ||
    v.driver.toLowerCase().includes(search.toLowerCase()) ||
    v.municipality.toLowerCase().includes(search.toLowerCase())
  );

  const selectedPos = selectedId ? positionById.get(selectedId) : undefined;
  const flyTarget: [number, number] | null = selectedPos ? [selectedPos.lat, selectedPos.lng] : null;
  const selectedTrail = selectedId ? trails.current.get(selectedId) : undefined;

  const sourceLabel = snapshot.source === 'live' ? t('telemetryLive') : snapshot.source === 'demo' ? t('telemetryDemo') : t('telemetryNone');
  const timeFmt = (iso: string) => new Date(iso).toLocaleTimeString(locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-GB');

  const exportPositions = () => {
    const rows = vehicles.map((v) => {
      const p = positionById.get(v.id);
      return [v.plate, v.driver, v.municipality, v.status, p?.lat ?? '', p?.lng ?? '', p?.speedKmh ?? '', p?.timestamp ?? '', snapshot.source];
    });
    downloadFile(
      toCsv(['plate', 'driver', 'municipality', 'status', 'lat', 'lng', 'speed_kmh', 'fix_time', 'source'], rows),
      `vehicle-positions-${snapshot.source}.csv`,
      'text/csv;charset=utf-8',
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('truckTracking')} subtitle="تتبع مركبات الجمع — ولاية خنشلة" icon={<Navigation className="w-5 h-5" />}
        actions={<button onClick={exportPositions} className="btn-outline"><Download className="w-4 h-4" /> {t('export')}</button>} />

      {snapshot.source === 'demo' && (
        <div role="status" className="flex items-start gap-2 p-3 rounded-xl bg-warning-50 text-warning-800 dark:bg-warning-600/15 dark:text-warning-200 text-sm">
          <FlaskConical className="w-4 h-4 mt-0.5 shrink-0" /> <span>{t('telemetryDemoNotice')}</span>
        </div>
      )}
      {snapshot.source === 'none' && !loading && (
        <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-danger-50 text-danger-700 dark:bg-danger-600/15 dark:text-danger-200 text-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{t('telemetryNoneNotice')}{snapshot.error ? ` (${snapshot.error})` : ''}</span>
        </div>
      )}
      {loading && isConfigured && <p className="text-sm text-ink-500">{t('telemetryLoading')}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('active')} value={active.length} icon={<Truck className="w-5 h-5" />} tone="success" />
        <StatCard label="خامل" value={vehicles.filter(v => v.status === 'idle').length} icon={<Truck className="w-5 h-5" />} tone="neutral" />
        <StatCard label="صيانة" value={vehicles.filter(v => v.status === 'maintenance').length} icon={<Truck className="w-5 h-5" />} tone="warning" />
        <StatCard label="غير متصل" value={vehicles.filter(v => v.status === 'offline').length} icon={<Truck className="w-5 h-5" />} tone="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="خريطة التتبع"
              icon={<Activity className="w-4 h-4" />}
              action={
                <div className="flex items-center gap-2">
                  {staleCount > 0 && <Badge tone="warning">{staleCount} {t('telemetryStale')}</Badge>}
                  <Badge tone={sourceBadgeTone(snapshot.source)} dot>{sourceLabel}</Badge>
                  {snapshot.source !== 'none' && <span className="text-[10px] text-ink-400">{t('telemetryLastUpdate')}: {timeFmt(snapshot.fetchedAt)}</span>}
                </div>
              }
            />
            <div className="h-[500px] rounded-xl overflow-hidden border border-ink-200 dark:border-ink-800">
              <MapContainer center={KHENCHELA_CENTER} zoom={10} className="w-full h-full" zoomControl={false}>
                <BasemapTileLayer id="osm" />
                <FlyTo target={flyTarget} />
                {vehicles.map((v) => {
                  const p = positionById.get(v.id);
                  if (!p) return null;
                  const stale = isStale(p);
                  return (
                    <Marker key={v.id} position={[p.lat, p.lng]} icon={getIcon(v.status, stale)}>
                      <Popup>
                        <div className="text-right min-w-[180px]">
                          <p className="font-bold text-sm">{v.plate}</p>
                          <p className="text-xs text-ink-500">{v.driver}</p>
                          <p className="text-xs">{v.municipality}</p>
                          <p className="text-xs mt-1">الوقود: {v.fuel}% | السرعة: {p.speedKmh !== undefined ? `${Math.round(p.speedKmh)} كم/س` : t('telemetryNotReported')}</p>
                          <p className="text-[10px] text-ink-400 mt-1">{t('telemetryLastUpdate')}: {timeFmt(p.timestamp)}{stale ? ` — ${t('telemetryStale')}` : ''}</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
                {selectedTrail && selectedTrail.length > 1 && (
                  <Polyline positions={selectedTrail} pathOptions={{ color: '#0F4C81', weight: 3, opacity: 0.6, dashArray: '8 6' }} />
                )}
              </MapContainer>
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader title="المركبات" icon={<Truck className="w-4 h-4" />} action={
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-400 absolute top-1/2 -translate-y-1/2 right-2.5" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث..." className="w-32 pr-7 text-xs rounded-lg bg-ink-100 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 py-1.5 outline-none focus:ring-1 ring-brand-500/30" />
            </div>
          } />
          <CardBody>
            <div className="space-y-2 max-h-[440px] overflow-y-auto">
              {filtered.map((v) => {
                const pos = positionById.get(v.id);
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedId(v.id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition text-right ${selectedId === v.id ? 'bg-brand-50 dark:bg-brand-600/15 ring-1 ring-brand-300 dark:ring-brand-600/30' : 'hover:bg-ink-50 dark:hover:bg-ink-800/40'}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${v.status === 'active' ? 'bg-success-50 text-success-600 dark:bg-success-600/15 dark:text-success-400' : v.status === 'maintenance' ? 'bg-warning-50 text-warning-600 dark:bg-warning-600/15 dark:text-warning-400' : 'bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400'}`}>
                      <Truck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink-800 dark:text-ink-100 truncate">{v.plate}</p>
                      <p className="text-xs text-ink-500 dark:text-ink-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {v.municipality}
                      </p>
                    </div>
                    <div className="text-left shrink-0">
                      <StatusBadge status={v.status} />
                      {!pos && snapshot.source !== 'demo' ? (
                        <p className="text-[10px] text-ink-400 mt-1">{t('telemetryNoSignal')}</p>
                      ) : pos?.speedKmh !== undefined ? (
                        <p className="text-[10px] text-ink-400 mt-1">{Math.round(pos.speedKmh)} كم/س</p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      {selectedId && (() => {
        const v = vehicles.find((x) => x.id === selectedId);
        if (!v) return null;
        return (
          <Card>
            <CardHeader title={`تفاصيل ${v.plate}`} icon={<Gauge className="w-4 h-4" />} />
            <CardBody>
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/40">
                  <p className="text-xs text-ink-400">المركبة</p>
                  <p className="font-bold text-sm">{v.plate}</p>
                </div>
                <div className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/40">
                  <p className="text-xs text-ink-400">السائق</p>
                  <p className="font-bold text-sm">{v.driver}</p>
                </div>
                <div className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/40">
                  <p className="text-xs text-ink-400">البلدية</p>
                  <p className="font-bold text-sm">{v.municipality}</p>
                </div>
                <div className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/40">
                  <p className="text-xs text-ink-400">الوقود</p>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                      <div className={`h-full rounded-full ${v.fuel > 50 ? 'bg-success-500' : v.fuel > 20 ? 'bg-warning-500' : 'bg-danger-500'}`} style={{ width: `${v.fuel}%` }} />
                    </div>
                    <span className="text-xs font-bold">{v.fuel}%</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/40">
                  <p className="text-xs text-ink-400">المسافة</p>
                  <p className="font-bold text-sm">{v.mileage.toLocaleString()} كم</p>
                </div>
                <div className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/40">
                  <p className="text-xs text-ink-400">الحالة</p>
                  <StatusBadge status={v.status} />
                </div>
              </div>
            </CardBody>
          </Card>
        );
      })()}
    </div>
  );
}
