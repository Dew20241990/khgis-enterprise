import { useState, useEffect } from 'react';
import { Navigation, Truck, Download, MapPin, Clock, Fuel, Activity, Gauge, Search } from 'lucide-react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { PageHeader, Card, CardHeader, CardBody, Badge, StatusBadge, StatCard } from '@/components/ui';
import { useApp } from '@/store/appStore';
import { vehicles, drivers, KHENCHELA_CENTER } from '@/data/mockData';

const truckIcon = L.divIcon({
  className: 'truck-marker',
  html: `<div style="background:#0F4C81;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:14px;">🚛</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const idleIcon = L.divIcon({
  className: 'truck-marker-idle',
  html: `<div style="background:#94a3b8;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:12px;">🚛</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const maintenanceIcon = L.divIcon({
  className: 'truck-marker-maint',
  html: `<div style="background:#F59E0B;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:12px;">🔧</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function getIcon(status: string) {
  if (status === 'active') return truckIcon;
  if (status === 'maintenance') return maintenanceIcon;
  return idleIcon;
}

const routePaths: Record<string, [number, number][]> = {};
vehicles.forEach((v, i) => {
  const base = v;
  const pts: [number, number][] = [];
  for (let j = 0; j < 8; j++) {
    pts.push([
      base.lat + Math.sin(j * 0.5 + i) * 0.008,
      base.lng + Math.cos(j * 0.5 + i) * 0.008,
    ]);
  }
  routePaths[v.id] = pts;
});

function LiveMap({ selectedId }: { selectedId: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedId) {
      const v = vehicles.find((v) => v.id === selectedId);
      if (v) map.flyTo([v.lat, v.lng], 13, { duration: 1.5 });
    }
  }, [selectedId, map]);
  return null;
}

export function TruckTrackingPage() {
  const { t } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [positions, setPositions] = useState(() =>
    vehicles.map((v) => ({ id: v.id, lat: v.lat, lng: v.lng, heading: 0 }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prev) =>
        prev.map((p) => {
          const path = routePaths[p.id];
          if (!path) return p;
          const nextIdx = Math.floor(Math.random() * path.length);
          return { ...p, lat: path[nextIdx][0], lng: path[nextIdx][1], heading: Math.random() * 360 };
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const active = vehicles.filter((v) => v.status === 'active');
  const filtered = vehicles.filter((v) =>
    v.plate.toLowerCase().includes(search.toLowerCase()) ||
    v.driver.toLowerCase().includes(search.toLowerCase()) ||
    v.municipality.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t('truckTracking')} subtitle="تتبع مباشر لمركبات الجمع — ولاية خنشلة" icon={<Navigation className="w-5 h-5" />}
        actions={<button className="btn-outline"><Download className="w-4 h-4" /> {t('export')}</button>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('active')} value={active.length} icon={<Truck className="w-5 h-5" />} tone="success" />
        <StatCard label="خامل" value={vehicles.filter(v => v.status === 'idle').length} icon={<Truck className="w-5 h-5" />} tone="neutral" />
        <StatCard label="صيانة" value={vehicles.filter(v => v.status === 'maintenance').length} icon={<Truck className="w-5 h-5" />} tone="warning" />
        <StatCard label="غير متصل" value={vehicles.filter(v => v.status === 'offline').length} icon={<Truck className="w-5 h-5" />} tone="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="خريطة التتبع المباشر" icon={<Activity className="w-4 h-4" />} action={<Badge tone="success" dot>مباشر</Badge>} />
            <div className="h-[500px] rounded-xl overflow-hidden border border-ink-200 dark:border-ink-800">
              <MapContainer center={KHENCHELA_CENTER} zoom={10} className="w-full h-full" zoomControl={false} attributionControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LiveMap selectedId={selectedId} />
                {positions.map((p) => {
                  const v = vehicles.find((v) => v.id === p.id)!;
                  return (
                    <Marker key={p.id} position={[p.lat, p.lng]} icon={getIcon(v.status)}>
                      <Popup>
                        <div className="text-right min-w-[180px]">
                          <p className="font-bold text-sm">{v.plate}</p>
                          <p className="text-xs text-ink-500">{v.driver}</p>
                          <p className="text-xs">{v.municipality}</p>
                          <p className="text-xs mt-1">الوقود: {v.fuel}% | السرعة: {Math.floor(20 + Math.random() * 40)} كم/س</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
                {selectedId && routePaths[selectedId] && (
                  <Polyline positions={routePaths[selectedId]} pathOptions={{ color: '#0F4C81', weight: 3, opacity: 0.6, dashArray: '8 6' }} />
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
                const pos = positions.find((p) => p.id === v.id);
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
                      {v.status === 'active' && pos && (
                        <p className="text-[10px] text-ink-400 mt-1">{Math.floor(20 + Math.random() * 40)} كم/س</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      {selectedId && (() => {
        const v = vehicles.find((v) => v.id === selectedId)!;
        const d = drivers.find((d) => d.vehicle === v.plate);
        return (
          <Card>
            <CardHeader title={`تفاصil ${v.plate}`} icon={<Gauge className="w-4 h-4" />} />
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
