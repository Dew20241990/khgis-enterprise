import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Layers, Factory, Trash2, TreePine, Link2, Route, AlertTriangle, ClipboardCheck, Wrench } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polygon, Polyline, ScaleControl, LayersControl } from 'react-leaflet';
import { PageHeader, Card, CardHeader, CardBody, Badge } from '@/components/ui';
import {
  epwgFacilities, epwgServiceAreas, epwgCollectionRoutes,
  EPWG_CENTER, type FacilityType,
} from '@/data/epwgData';
import { blackSpots, inspections } from '@/data/mockData';
import { useApp } from '@/store/appStore';
import { cn } from '@/lib/cn';
import { facilityTypeColor, statusColor, statusLabel } from './epwgHelpers';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const typeIcon: Record<FacilityType, React.ReactNode> = {
  cet: <Factory className="w-4 h-4" />,
  controlled: <Trash2 className="w-4 h-4" />,
  forest: <TreePine className="w-4 h-4" />,
  special: <Link2 className="w-4 h-4" />,
};

export function EpwgGisPage() {
  const { t, locale } = useApp();
  const [baseLayer, setBaseLayer] = useState<'street' | 'satellite' | 'dark' | 'terrain'>('street');
  const [layers, setLayers] = useState({
    facilities: true, serviceAreas: true, routes: true, municipalities: true,
    blackSpots: false, inspections: false, workOrders: false,
  });

  const baseLayerUrl = {
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  };

  const layerToggles: { key: keyof typeof layers; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'facilities', label: t('epwgFacilities'), icon: <Factory className="w-3.5 h-3.5" />, color: '#0F4C81' },
    { key: 'serviceAreas', label: t('epwgServiceAreas'), icon: <Layers className="w-3.5 h-3.5" />, color: '#16A34A' },
    { key: 'routes', label: locale === 'ar' ? 'مسارات الجمع' : 'Collection Routes', icon: <Route className="w-3.5 h-3.5" />, color: '#F59E0B' },
    { key: 'municipalities', label: locale === 'ar' ? 'البلديات المخدومة' : 'Municipalities Served', icon: <MapPin className="w-3.5 h-3.5" />, color: '#14B8A6' },
    { key: 'blackSpots', label: t('blackSpots'), icon: <AlertTriangle className="w-3.5 h-3.5" />, color: '#DC2626' },
    { key: 'inspections', label: t('inspectionTours'), icon: <ClipboardCheck className="w-3.5 h-3.5" />, color: '#8B5CF6' },
    { key: 'workOrders', label: t('workOrders'), icon: <Wrench className="w-3.5 h-3.5" />, color: '#F97316' },
  ];

  return (
    <div>
      <PageHeader
        title={t('epwgGis')}
        subtitle={locale === 'ar' ? 'خريطة GIS احترافية لشبكة منشآت EPWG' : 'Professional GIS map of EPWG facility network'}
        icon={<MapPin className="w-5 h-5" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Layer control sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader title={locale === 'ar' ? 'طبقات الخريطة' : 'Map Layers'} icon={<Layers className="w-4 h-4" />} />
          <CardBody>
            <div className="space-y-2">
              {layerToggles.map((layer) => (
                <button
                  key={layer.key}
                  onClick={() => setLayers((p) => ({ ...p, [layer.key]: !p[layer.key] }))}
                  className={cn('w-full flex items-center gap-2.5 p-2.5 rounded-xl border transition text-right',
                    layers[layer.key]
                      ? 'bg-brand-50 dark:bg-brand-600/10 border-brand-200 dark:border-brand-600/30'
                      : 'bg-ink-50 dark:bg-ink-800/40 border-ink-200 dark:border-ink-700 opacity-60')}
                >
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: layer.color }}>
                    {layer.icon}
                  </span>
                  <span className="text-xs font-medium text-ink-700 dark:text-ink-200 flex-1">{layer.label}</span>
                  <span className={cn('w-9 h-5 rounded-full transition relative', layers[layer.key] ? 'bg-brand-500' : 'bg-ink-300 dark:bg-ink-700')}>
                    <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all', layers[layer.key] ? 'left-0.5' : 'left-4')} />
                  </span>
                </button>
              ))}
            </div>

            {/* Base layer selector */}
            <div className="mt-4 pt-4 border-t border-ink-100 dark:border-ink-800">
              <p className="text-[10px] font-bold uppercase text-ink-400 mb-2">{locale === 'ar' ? 'الخريطة الأساسية' : 'Base Layer'}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {(['street', 'satellite', 'dark', 'terrain'] as const).map((bl) => (
                  <button key={bl} onClick={() => setBaseLayer(bl)}
                    className={cn('px-2 py-1.5 rounded-lg text-[10px] font-medium transition',
                      baseLayer === bl ? 'bg-brand-500 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-500 hover:bg-ink-200 dark:hover:bg-ink-700')}>
                    {bl === 'street' ? (locale === 'ar' ? 'شوارع' : 'Street') : bl === 'satellite' ? (locale === 'ar' ? 'قمر' : 'Sat') : bl === 'dark' ? (locale === 'ar' ? 'داكن' : 'Dark') : (locale === 'ar' ? 'تضاريس' : 'Terrain')}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-ink-100 dark:border-ink-800">
              <p className="text-[10px] font-bold uppercase text-ink-400 mb-2">{locale === 'ar' ? 'مفتاح' : 'Legend'}</p>
              <div className="space-y-1.5">
                {(['cet', 'controlled', 'forest', 'special'] as const).map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: facilityTypeColor[type] }} />
                    <span className="text-[11px] text-ink-600 dark:text-ink-300">
                      {type === 'cet' ? t('epwgCet') : type === 'controlled' ? t('epwgControlled') : type === 'forest' ? t('epwgForest') : t('epwgSpecial')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Map */}
        <Card className="lg:col-span-3">
          <CardHeader
            title={locale === 'ar' ? 'خريطة شبكة EPWG' : 'EPWG Network Map'}
            subtitle={locale === 'ar' ? 'ولاية خنشلة' : 'Wilaya of Khenchela'}
            icon={<MapPin className="w-4 h-4" />}
          />
          <CardBody>
            <div className="h-[600px] rounded-xl2 overflow-hidden border border-ink-200/60 dark:border-ink-800/60">
              <MapContainer center={EPWG_CENTER} zoom={9} className="w-full h-full" zoomControl>
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="Street">
                    <TileLayer url={baseLayerUrl[baseLayer]} attribution="EPWG GIS" />
                  </LayersControl.BaseLayer>
                </LayersControl>
                <TileLayer key={baseLayer} url={baseLayerUrl[baseLayer]} attribution="EPWG GIS" />
                <ScaleControl position="bottomleft" />

                {/* Service areas */}
                {layers.serviceAreas && epwgServiceAreas.map((sa) => (
                  <Polygon key={sa.id} positions={sa.polygon}
                    pathOptions={{ color: '#16A34A', weight: 1.5, fillOpacity: 0.08, dashArray: '6 4' }}>
                    <Popup>
                      <div style={{ minWidth: 160 }}>
                        <p style={{ fontWeight: 700, fontSize: 12 }}>{locale === 'ar' ? sa.nameAr : sa.name}</p>
                        <p style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>{sa.municipalities.length} {locale === 'ar' ? 'بلديات' : 'municipalities'}</p>
                        <p style={{ fontSize: 10, marginTop: 2 }}>{sa.dailyTonnage} t/j</p>
                        <p style={{ fontSize: 10 }}>Pop: {sa.population.toLocaleString()}</p>
                      </div>
                    </Popup>
                  </Polygon>
                ))}

                {/* Collection routes */}
                {layers.routes && epwgCollectionRoutes.map((r) => (
                  <Polyline key={r.id} positions={r.path}
                    pathOptions={{ color: r.status === 'delayed' ? '#DC2626' : r.status === 'suspended' ? '#94A3B8' : '#F59E0B', weight: 2, dashArray: '5 5' }}>
                    <Popup>
                      <div style={{ minWidth: 140 }}>
                        <p style={{ fontWeight: 700, fontSize: 11 }}>{r.code}</p>
                        <p style={{ fontSize: 10, color: '#64748b' }}>{locale === 'ar' ? r.fromMunicipalityAr : r.fromMunicipality} → EPWG</p>
                        <p style={{ fontSize: 10, marginTop: 4 }}>{r.distanceKm} km · {r.dailyTrips} {locale === 'ar' ? 'رحلات' : 'trips'}</p>
                        <p style={{ fontSize: 10 }}>{r.dailyTonnage} t/j</p>
                      </div>
                    </Popup>
                  </Polyline>
                ))}

                {/* Facilities */}
                {layers.facilities && epwgFacilities.map((f) => (
                  <CircleMarker key={f.id} center={[f.lat, f.lng]} radius={f.type === 'cet' ? 12 : f.type === 'controlled' ? 9 : 7}
                    pathOptions={{ color: facilityTypeColor[f.type], fillColor: facilityTypeColor[f.type], fillOpacity: 0.6, weight: 2 }}>
                    <Popup>
                      <div style={{ minWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: facilityTypeColor[f.type], display: 'inline-block' }} />
                          <p style={{ fontWeight: 700, fontSize: 13 }}>{locale === 'ar' ? f.nameAr : f.nameFr}</p>
                        </div>
                        <p style={{ fontSize: 11, color: '#64748b' }}>{f.typeAr} · {f.code}</p>
                        <p style={{ fontSize: 11, marginTop: 6 }}>{locale === 'ar' ? f.municipalityAr : f.municipality} — {locale === 'ar' ? f.locationAr : f.location}</p>
                        <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>GPS: {f.lat.toFixed(4)}, {f.lng.toFixed(4)}</p>
                        <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 6, background: `${statusColor[f.status]}20`, display: 'inline-block' }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: statusColor[f.status] }}>{statusLabel(f.status, locale)}</span>
                        </div>
                        <p style={{ fontSize: 10, marginTop: 6 }}>{f.currentLoadTpd}/{f.capacityTpd} t/j ({Math.round((f.currentLoadTpd / f.capacityTpd) * 100)}%)</p>
                        <p style={{ fontSize: 10 }}>{locale === 'ar' ? f.managerAr : f.manager}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {/* Municipalities served (small markers) */}
                {layers.municipalities && epwgServiceAreas.flatMap((sa) =>
                  sa.municipalitiesAr.map((m, mi) => {
                    const facility = epwgFacilities.find((f) => f.id === sa.facilityId);
                    if (!facility) return null;
                    const offset = mi * 0.015;
                    return (
                      <CircleMarker key={`${sa.id}-${mi}`} center={[facility.lat + offset, facility.lng + offset * 1.3]} radius={4}
                        pathOptions={{ color: '#14B8A6', fillColor: '#14B8A6', fillOpacity: 0.5, weight: 1 }}>
                        <Popup>
                          <p style={{ fontWeight: 600, fontSize: 11 }}>{locale === 'ar' ? sa.municipalitiesAr[mi] : sa.municipalities[mi]}</p>
                        </Popup>
                      </CircleMarker>
                    );
                  })
                )}

                {/* Black spots */}
                {layers.blackSpots && blackSpots.slice(0, 20).map((s) => (
                  <CircleMarker key={s.id} center={[s.lat, s.lng]} radius={5}
                    pathOptions={{ color: '#DC2626', fillColor: '#EF4444', fillOpacity: 0.6, weight: 1.5 }}>
                    <Popup>
                      <div style={{ minWidth: 140 }}>
                        <p style={{ fontWeight: 700, fontSize: 11 }}>{s.code}</p>
                        <p style={{ fontSize: 10, color: '#64748b' }}>{s.municipality}</p>
                        <p style={{ fontSize: 10, marginTop: 4 }}>{s.category}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {/* Inspections */}
                {layers.inspections && inspections.slice(0, 15).map((insp, i) => (
                  <CircleMarker key={insp.id} center={[EPWG_CENTER[0] + (i % 5) * 0.01, EPWG_CENTER[1] + (i % 5) * 0.01]} radius={4}
                    pathOptions={{ color: '#8B5CF6', fillColor: '#8B5CF6', fillOpacity: 0.5, weight: 1 }}>
                    <Popup>
                      <p style={{ fontWeight: 600, fontSize: 11 }}>{insp.code ?? insp.id}</p>
                    </Popup>
                  </CircleMarker>
                ))}

                {/* Work orders */}
                {layers.workOrders && epwgFacilities.map((f) => (
                  <CircleMarker key={`wo-${f.id}`} center={[f.lat + 0.005, f.lng + 0.005]} radius={3}
                    pathOptions={{ color: '#F97316', fillColor: '#F97316', fillOpacity: 0.5, weight: 1 }}>
                    <Popup>
                      <p style={{ fontSize: 10 }}>{f.code} — WO</p>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
