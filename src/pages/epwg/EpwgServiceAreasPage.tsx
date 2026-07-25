import { motion } from 'framer-motion';
import { MapPin, Layers, Users, Trash2, Building2 } from 'lucide-react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup, Tooltip as LTooltip, ScaleControl } from 'react-leaflet';
import { PageHeader, Card, CardHeader, CardBody, Badge } from '@/components/ui';
import { epwgServiceAreas, epwgFacilities, EPWG_CENTER } from '@/data/epwgData';
import { useApp } from '@/store/appStore';
import { facilityTypeColor } from './epwgHelpers';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export function EpwgServiceAreasPage() {
  const { t, locale } = useApp();

  return (
    <div>
      <PageHeader
        title={t('epwgServiceAreas')}
        subtitle={locale === 'ar' ? 'مناطق خدمة منشآت EPWG عبر بلديات ولاية خنشلة' : 'EPWG facility service areas across Khenchela municipalities'}
        icon={<Layers className="w-5 h-5" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Map */}
        <Card className="lg:col-span-2">
          <CardHeader title={locale === 'ar' ? 'مناطق الخدمة' : 'Service Areas'} icon={<MapPin className="w-4 h-4" />} />
          <CardBody>
            <div className="h-[500px] rounded-xl2 overflow-hidden border border-ink-200/60 dark:border-ink-800/60">
              <MapContainer center={EPWG_CENTER} zoom={9} className="w-full h-full" zoomControl>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="EPWG GIS" />
                <ScaleControl position="bottomleft" />
                {epwgServiceAreas.map((sa, i) => {
                  const facility = epwgFacilities.find((f) => f.id === sa.facilityId);
                  const colors = ['#16A34A', '#0F4C81', '#F59E0B', '#14B8A6', '#8B5CF6'];
                  const color = colors[i % colors.length];
                  return (
                    <Polygon key={sa.id} positions={sa.polygon}
                      pathOptions={{ color, weight: 2, fillOpacity: 0.12 }}>
                      <LTooltip>{locale === 'ar' ? sa.nameAr : sa.name}</LTooltip>
                      <Popup>
                        <div style={{ minWidth: 180 }}>
                          <p style={{ fontWeight: 700, fontSize: 12, color }}>{locale === 'ar' ? sa.nameAr : sa.name}</p>
                          <p style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>{sa.municipalities.length} {locale === 'ar' ? 'بلديات' : 'municipalities'}</p>
                          <p style={{ fontSize: 10, marginTop: 4 }}>Pop: {sa.population.toLocaleString()}</p>
                          <p style={{ fontSize: 10 }}>{sa.dailyTonnage} t/j</p>
                        </div>
                      </Popup>
                    </Polygon>
                  );
                })}
                {epwgFacilities.map((f) => (
                  <CircleMarker key={f.id} center={[f.lat, f.lng]} radius={8}
                    pathOptions={{ color: facilityTypeColor[f.type], fillColor: facilityTypeColor[f.type], fillOpacity: 0.7, weight: 2 }}>
                    <Popup>
                      <p style={{ fontWeight: 700, fontSize: 12 }}>{locale === 'ar' ? f.nameAr : f.nameFr}</p>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </CardBody>
        </Card>

        {/* Service area cards */}
        <div className="space-y-4">
          {epwgServiceAreas.map((sa, i) => {
            const facility = epwgFacilities.find((f) => f.id === sa.facilityId);
            const colors = ['#16A34A', '#0F4C81', '#F59E0B', '#14B8A6', '#8B5CF6'];
            const color = colors[i % colors.length];
            return (
              <motion.div key={sa.id} {...fadeUp} transition={{ duration: 0.3, delay: i * 0.05 }}>
                <Card hover>
                  <CardBody>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: color }}>
                        <Layers className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-ink-900 dark:text-white">{locale === 'ar' ? sa.nameAr : sa.name}</p>
                        <p className="text-[11px] text-ink-400">{facility?.code}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="text-center p-2 rounded-lg bg-ink-50 dark:bg-ink-800/40">
                        <Users className="w-4 h-4 mx-auto text-brand-500 mb-1" />
                        <p className="text-sm font-bold text-ink-800 dark:text-ink-100">{sa.population.toLocaleString()}</p>
                        <p className="text-[9px] text-ink-400">{locale === 'ar' ? 'سكان' : 'Population'}</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-ink-50 dark:bg-ink-800/40">
                        <Trash2 className="w-4 h-4 mx-auto text-warning-500 mb-1" />
                        <p className="text-sm font-bold text-ink-800 dark:text-ink-100">{sa.dailyTonnage}</p>
                        <p className="text-[9px] text-ink-400">t/j</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-ink-400 mb-1.5">{t('epwgCoveredMunicipalities')}</p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(locale === 'ar' ? sa.municipalitiesAr : sa.municipalities).map((m) => (
                          <span key={m} className="chip bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 text-[10px]">
                            <Building2 className="w-2.5 h-2.5" /> {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
