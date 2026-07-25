import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Factory, Trash2, Recycle, Building2, MapPin, Gauge, Users, Wrench, Truck,
  Search, Filter, Leaf, Flame, Droplets, Cloud, ShieldCheck, TreePine, Link2,
  ChevronLeft, Calendar,
} from 'lucide-react';
import { PageHeader, Card, CardBody, Badge, Modal } from '@/components/ui';
import {
  epwgFacilities, type EpwgFacility, type FacilityType,
} from '@/data/epwgData';
import { useApp } from '@/store/appStore';
import { cn } from '@/lib/cn';
import {
  facilityTypeColor, facilityTypeTone, statusColor, envStatusColor,
  fillRateColor, statusLabel, envStatusLabel,
} from './epwgHelpers';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const typeIcon: Record<FacilityType, React.ReactNode> = {
  cet: <Factory className="w-5 h-5" />,
  controlled: <Trash2 className="w-5 h-5" />,
  forest: <TreePine className="w-5 h-5" />,
  special: <Link2 className="w-5 h-5" />,
};

export function EpwgFacilitiesPage() {
  const { t, locale } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<EpwgFacility | null>(null);

  const filtered = useMemo(() => {
    return epwgFacilities.filter((f) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        f.nameAr.includes(q) || f.nameFr.toLowerCase().includes(q) ||
        f.code.toLowerCase().includes(q) || f.municipalityAr.includes(q) ||
        f.municipality.toLowerCase().includes(q);
      const matchType = typeFilter === 'all' || f.type === typeFilter;
      const matchStatus = statusFilter === 'all' || f.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [search, typeFilter, statusFilter]);

  const typeCounts = {
    cet: epwgFacilities.filter((f) => f.type === 'cet').length,
    controlled: epwgFacilities.filter((f) => f.type === 'controlled').length,
    forest: epwgFacilities.filter((f) => f.type === 'forest').length,
    special: epwgFacilities.filter((f) => f.type === 'special').length,
  };

  return (
    <div>
      <PageHeader
        title={t('epwgFacilities')}
        subtitle={locale === 'ar' ? 'مراكز الردم التقني والمردمات المراقبة — ولاية خنشلة' : locale === 'fr' ? 'Centres de recyclage et décharges contrôlées — Khenchela' : 'Technical Landfill Centers & Controlled Landfills — Khenchela'}
        icon={<Factory className="w-5 h-5" />}
      />

      {/* Type summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {([
          { type: 'cet' as const, count: typeCounts.cet, label: t('epwgCet'), icon: <Factory className="w-5 h-5" />, tone: 'brand' as const },
          { type: 'controlled' as const, count: typeCounts.controlled, label: t('epwgControlled'), icon: <Trash2 className="w-5 h-5" />, tone: 'warning' as const },
          { type: 'forest' as const, count: typeCounts.forest, label: t('epwgForest'), icon: <TreePine className="w-5 h-5" />, tone: 'success' as const },
          { type: 'special' as const, count: typeCounts.special, label: t('epwgSpecial'), icon: <Link2 className="w-5 h-5" />, tone: 'neutral' as const },
        ]).map((card, i) => (
          <motion.div key={card.type} {...fadeUp} transition={{ duration: 0.25, delay: i * 0.05 }}>
            <button
              onClick={() => setTypeFilter(typeFilter === card.type ? 'all' : card.type)}
              className={cn('w-full text-right card card-hover p-4 transition', typeFilter === card.type && 'ring-2 ring-brand-500/40')}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br',
                  card.tone === 'brand' ? 'from-brand-500/10 to-brand-500/5 text-brand-600 dark:text-brand-400'
                  : card.tone === 'warning' ? 'from-warning-500/10 to-warning-500/5 text-warning-600 dark:text-warning-400'
                  : card.tone === 'success' ? 'from-success-500/10 to-success-500/5 text-success-600 dark:text-success-400'
                  : 'from-ink-500/10 to-ink-500/5 text-ink-600 dark:text-ink-300')}>
                  {card.icon}
                </span>
                <span className="text-2xl font-bold text-ink-900 dark:text-white">{card.count}</span>
              </div>
              <p className="text-xs font-medium text-ink-500 dark:text-ink-400">{card.label}</p>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-ink-400 absolute top-1/2 -translate-y-1/2 right-3" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="input pr-10"
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input w-auto">
          <option value="all">{t('epwgFacilityType')}: {locale === 'ar' ? 'الكل' : 'All'}</option>
          <option value="cet">{t('epwgCet')}</option>
          <option value="controlled">{t('epwgControlled')}</option>
          <option value="forest">{t('epwgForest')}</option>
          <option value="special">{t('epwgSpecial')}</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto">
          <option value="all">{t('epwgOperationalStatus')}: {locale === 'ar' ? 'الكل' : 'All'}</option>
          <option value="operational">{statusLabel('operational', locale)}</option>
          <option value="near-capacity">{statusLabel('near-capacity', locale)}</option>
          <option value="maintenance">{statusLabel('maintenance', locale)}</option>
        </select>
      </div>

      {/* Facility cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((f, i) => {
          const rate = Math.round((f.currentLoadTpd / f.capacityTpd) * 100);
          const usedPct = Math.round((f.usedCapacityTons / f.capacityTotalTons) * 100);
          return (
            <motion.div key={f.id} {...fadeUp} transition={{ duration: 0.3, delay: i * 0.03 }}>
              <Card hover className="cursor-pointer h-full" >
                <CardBody>
                  <div onClick={() => setSelected(f)}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl2 flex items-center justify-center text-white shadow-soft"
                          style={{ background: facilityTypeColor[f.type] }}>
                          {typeIcon[f.type]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-ink-900 dark:text-white">{locale === 'ar' ? f.nameAr : f.nameFr}</p>
                          <p className="text-[11px] text-ink-400 font-mono">{f.code}</p>
                        </div>
                      </div>
                      <Badge tone={facilityTypeTone[f.type]}>{f.typeAr}</Badge>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400 mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{locale === 'ar' ? f.municipalityAr : f.municipality} — {locale === 'ar' ? f.locationAr : f.location}</span>
                    </div>

                    {/* Status badges */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ background: `${statusColor[f.status]}20`, color: statusColor[f.status] }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor[f.status] }} />
                        {statusLabel(f.status, locale)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ background: `${envStatusColor[f.envStatus]}20`, color: envStatusColor[f.envStatus] }}>
                        <Leaf className="w-3 h-3" />
                        {envStatusLabel(f.envStatus, locale)}
                      </span>
                    </div>

                    {/* Capacity stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 rounded-lg bg-ink-50 dark:bg-ink-800/40">
                        <p className="text-[10px] text-ink-400">{t('epwgCapacity')}</p>
                        <p className="text-sm font-bold text-ink-800 dark:text-ink-100">{f.capacityTpd}</p>
                        <p className="text-[9px] text-ink-400">ط/ي</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-ink-50 dark:bg-ink-800/40">
                        <p className="text-[10px] text-ink-400">{t('epwgDailyWaste')}</p>
                        <p className="text-sm font-bold text-ink-800 dark:text-ink-100">{f.dailyWaste}</p>
                        <p className="text-[9px] text-ink-400">ط/ي</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-ink-50 dark:bg-ink-800/40">
                        <p className="text-[10px] text-ink-400">{t('epwgFillRate')}</p>
                        <p className="text-sm font-bold" style={{ color: fillRateColor(rate) }}>{rate}%</p>
                      </div>
                    </div>

                    {/* Daily fill bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-ink-500">{t('epwgFillRate')}</span>
                        <span className="font-semibold text-ink-700 dark:text-ink-200">{f.currentLoadTpd}/{f.capacityTpd} ط/ي</span>
                      </div>
                      <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, background: fillRateColor(rate) }} />
                      </div>
                    </div>

                    {/* Lifetime capacity bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-ink-500">{locale === 'ar' ? 'الطاقة الإجمالية' : 'Lifetime Capacity'}</span>
                        <span className="font-semibold text-ink-700 dark:text-ink-200">{usedPct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600" style={{ width: `${usedPct}%` }} />
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-3">
                      {f.hasSorting && <span className="chip bg-success-100 text-success-700 dark:bg-success-600/20 dark:text-success-300 text-[9px]"><Recycle className="w-2.5 h-2.5" /> {t('epwgSortingArea')}</span>}
                      {f.hasRecycling && <span className="chip bg-brand-100 text-brand-700 dark:bg-brand-600/20 dark:text-brand-300 text-[9px]"><Recycle className="w-2.5 h-2.5" /> {t('epwgRecyclingArea')}</span>}
                      {f.hasComposting && <span className="chip bg-warning-100 text-warning-700 dark:bg-warning-600/20 dark:text-warning-300 text-[9px]"><Leaf className="w-2.5 h-2.5" /> {t('epwgCompostingArea')}</span>}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-ink-100 dark:border-ink-800/60">
                      <div className="flex items-center gap-1.5 text-[11px] text-ink-500 dark:text-ink-400">
                        <Users className="w-3 h-3" />
                        <span>{locale === 'ar' ? f.managerAr : f.manager}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-ink-400">
                        <span className="flex items-center gap-0.5"><Wrench className="w-3 h-3" /> {f.equipmentCount}</span>
                        <span className="flex items-center gap-0.5"><Truck className="w-3 h-3" /> {f.vehicleCount}</span>
                        <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {f.openedYear}</span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-ink-400">{locale === 'ar' ? 'لا توجد منشآت' : 'No facilities found'}</div>
      )}

      {/* Facility Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? (locale === 'ar' ? selected.nameAr : selected.nameFr) : ''}
        size="xl"
      >
        {selected && <FacilityDetail facility={selected} />}
      </Modal>
    </div>
  );
}

function FacilityDetail({ facility: f }: { facility: EpwgFacility }) {
  const { t, locale } = useApp();
  const rate = Math.round((f.currentLoadTpd / f.capacityTpd) * 100);
  const usedPct = Math.round((f.usedCapacityTons / f.capacityTotalTons) * 100);
  const remainingTons = f.capacityTotalTons - f.usedCapacityTons;

  const detailRows = [
    { label: locale === 'ar' ? 'المعرّف' : 'Facility ID', value: f.id },
    { label: locale === 'ar' ? 'الرمز' : 'Code', value: f.code },
    { label: t('epwgFacilityType'), value: f.typeAr },
    { label: locale === 'ar' ? 'البلدية' : 'Municipality', value: locale === 'ar' ? f.municipalityAr : f.municipality },
    { label: locale === 'ar' ? 'الدائرة' : 'District', value: locale === 'ar' ? f.districtAr : f.district },
    { label: locale === 'ar' ? 'الموقع' : 'Location', value: locale === 'ar' ? f.locationAr : f.location },
    { label: 'GPS', value: `${f.lat.toFixed(4)}, ${f.lng.toFixed(4)}` },
    { label: t('epwgOperationalStatus'), value: statusLabel(f.status, locale) },
    { label: t('epwgEnvironmentalStatus'), value: envStatusLabel(f.envStatus, locale) },
    { label: t('epwgManager'), value: locale === 'ar' ? f.managerAr : f.manager },
    { label: t('epwgCapacity'), value: `${f.capacityTpd} ط/ي` },
    { label: t('epwgRemainingCapacity'), value: `${f.capacityTpd - f.currentLoadTpd} ط/ي` },
    { label: t('epwgDailyWaste'), value: `${f.dailyWaste} ط` },
    { label: t('epwgMonthlyWaste'), value: `${f.monthlyWaste.toLocaleString()} ط` },
    { label: t('epwgAnnualWaste'), value: `${f.annualWaste.toLocaleString()} ط` },
    { label: t('epwgOpenedYear'), value: String(f.openedYear) },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 rounded-xl2 bg-gradient-to-br from-brand-50 to-success-50 dark:from-brand-900/20 dark:to-success-900/20">
        <div className="w-14 h-14 rounded-xl2 flex items-center justify-center text-white shadow-soft"
          style={{ background: facilityTypeColor[f.type] }}>
          {typeIcon[f.type]}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-ink-900 dark:text-white">{locale === 'ar' ? f.nameAr : f.nameFr}</h3>
          <p className="text-sm text-ink-500 dark:text-ink-400">{f.typeAr} · {f.code}</p>
        </div>
        <Badge tone={facilityTypeTone[f.type]}>{f.typeAr}</Badge>
      </div>

      {/* Service area */}
      <div>
        <p className="text-xs font-bold uppercase text-ink-400 mb-2">{t('epwgCoveredMunicipalities')}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {(locale === 'ar' ? f.serviceAreaAr : f.serviceArea).map((m) => (
            <span key={m} className="chip bg-brand-100 text-brand-700 dark:bg-brand-600/20 dark:text-brand-300 text-xs">
              <MapPin className="w-3 h-3" /> {m}
            </span>
          ))}
        </div>
      </div>

      {/* Capacity meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl2 bg-ink-50 dark:bg-ink-800/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-ink-500">{t('epwgFillRate')} (يومي)</span>
            <span className="text-sm font-bold" style={{ color: fillRateColor(rate) }}>{rate}%</span>
          </div>
          <div className="h-3 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, background: fillRateColor(rate) }} />
          </div>
          <p className="text-[11px] text-ink-400 mt-1.5">{f.currentLoadTpd} / {f.capacityTpd} ط/ي</p>
        </div>
        <div className="p-4 rounded-xl2 bg-ink-50 dark:bg-ink-800/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-ink-500">{locale === 'ar' ? 'الطاقة الإجمالية المستخدمة' : 'Lifetime Capacity Used'}</span>
            <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{usedPct}%</span>
          </div>
          <div className="h-3 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600" style={{ width: `${usedPct}%` }} />
          </div>
          <p className="text-[11px] text-ink-400 mt-1.5">{f.usedCapacityTons.toLocaleString()} / {f.capacityTotalTons.toLocaleString()} ط ({remainingTons.toLocaleString()} {locale === 'ar' ? 'متبقي' : 'remaining'})</p>
        </div>
      </div>

      {/* Areas */}
      <div className="grid grid-cols-3 gap-3">
        <div className={cn('p-3 rounded-xl text-center', f.hasSorting ? 'bg-success-50 dark:bg-success-600/10 text-success-700 dark:text-success-300' : 'bg-ink-50 dark:bg-ink-800/40 text-ink-400')}>
          <Recycle className="w-5 h-5 mx-auto mb-1" />
          <p className="text-[10px] font-medium">{t('epwgSortingArea')}</p>
          <p className="text-xs font-bold mt-0.5">{f.hasSorting ? (locale === 'ar' ? 'متوفر' : 'Yes') : (locale === 'ar' ? 'غير متوفر' : 'No')}</p>
        </div>
        <div className={cn('p-3 rounded-xl text-center', f.hasRecycling ? 'bg-brand-50 dark:bg-brand-600/10 text-brand-700 dark:text-brand-300' : 'bg-ink-50 dark:bg-ink-800/40 text-ink-400')}>
          <Recycle className="w-5 h-5 mx-auto mb-1" />
          <p className="text-[10px] font-medium">{t('epwgRecyclingArea')}</p>
          <p className="text-xs font-bold mt-0.5">{f.hasRecycling ? (locale === 'ar' ? 'متوفر' : 'Yes') : (locale === 'ar' ? 'غير متوفر' : 'No')}</p>
        </div>
        <div className={cn('p-3 rounded-xl text-center', f.hasComposting ? 'bg-warning-50 dark:bg-warning-600/10 text-warning-700 dark:text-warning-300' : 'bg-ink-50 dark:bg-ink-800/40 text-ink-400')}>
          <Leaf className="w-5 h-5 mx-auto mb-1" />
          <p className="text-[10px] font-medium">{t('epwgCompostingArea')}</p>
          <p className="text-xs font-bold mt-0.5">{f.hasComposting ? (locale === 'ar' ? 'متوفر' : 'Yes') : (locale === 'ar' ? 'غير متوفر' : 'No')}</p>
        </div>
      </div>

      {/* Detail table */}
      <div className="rounded-xl2 border border-ink-200 dark:border-ink-800 overflow-hidden">
        <table className="w-full">
          <tbody>
            {detailRows.map((row, i) => (
              <tr key={i} className={cn(i % 2 === 0 ? 'bg-ink-50/50 dark:bg-ink-800/30' : '')}>
                <td className="px-4 py-2.5 text-xs font-medium text-ink-500 dark:text-ink-400 w-1/2">{row.label}</td>
                <td className="px-4 py-2.5 text-sm font-semibold text-ink-800 dark:text-ink-100">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Environmental notes */}
      <div className="p-4 rounded-xl2 bg-gradient-to-br from-success-50 to-brand-50 dark:from-success-900/10 dark:to-brand-900/10 border border-success-200/50 dark:border-success-600/20">
        <div className="flex items-center gap-2 mb-2">
          <Leaf className="w-4 h-4 text-success-600 dark:text-success-400" />
          <p className="text-xs font-bold text-success-700 dark:text-success-300">{t('epwgEnvNotes')}</p>
        </div>
        <p className="text-sm text-ink-700 dark:text-ink-200">{locale === 'ar' ? f.envNotesAr : f.envNotes}</p>
      </div>
    </div>
  );
}
