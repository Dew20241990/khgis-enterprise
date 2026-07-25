import { useState, useMemo, useCallback } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Popup, ScaleControl,
} from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck, MapPin, Plus, X, Eye, Clock, AlertTriangle, CheckCircle2,
  Activity, FileText, Camera, Navigation, ChevronLeft, Filter, Map as MapIcon,
  List, Calendar, User, Building2, Layers, AlertCircle, Trash2, Link2,
} from 'lucide-react';
import { useApp } from '@/store/appStore';
import { toast } from '@/components/ui/Toast';
import { Modal, StatCard, Badge } from '@/components/ui';
import { municipalities, neighborhoods, KHENCHELA_CENTER } from '@/data/mockData';
import {
  workflowInspections, workflowObservations, workflowWorkOrders,
  statusColors, statusLabels, priorityLabels, riskLabels,
  observationTypeData, responsibleEntityLabels,
  type Observation, type ObservationStatus, type Priority, type RiskLevel,
  type ObservationType, type ResponsibleEntity, type TimelineEvent,
} from '@/data/workflowData';
import { cn } from '@/lib/cn';

const priorityTone: Record<string, 'danger' | 'warning' | 'info' | 'neutral'> = {
  critical: 'danger', high: 'warning', medium: 'info', low: 'neutral',
};

const statusTone: Record<string, 'danger' | 'warning' | 'info' | 'success' | 'neutral'> = {
  open: 'danger', created: 'danger', assigned: 'warning', inProgress: 'info',
  completed: 'success', verified: 'success', closed: 'neutral',
  rejected: 'danger', rework: 'warning',
};

const timelineIcons: Record<string, React.ReactNode> = {
  created: <FileText className="w-4 h-4" />,
  assigned: <Navigation className="w-4 h-4" />,
  started: <Activity className="w-4 h-4" />,
  completed: <CheckCircle2 className="w-4 h-4" />,
  verified: <CheckCircle2 className="w-4 h-4" />,
  closed: <Layers className="w-4 h-4" />,
  rejected: <AlertCircle className="w-4 h-4" />,
  rework: <AlertTriangle className="w-4 h-4" />,
  note: <FileText className="w-4 h-4" />,
};

function Timeline({ events }: { events: TimelineEvent[] }) {
  const { locale } = useApp();
  return (
    <div className="relative pl-6">
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-ink-200 dark:bg-ink-700" />
      {events.map((ev, i) => (
        <motion.div
          key={ev.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="relative pb-5 last:pb-0"
        >
          <div
            className="absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-soft"
            style={{ background: statusColors[ev.type] ?? '#64748B' }}
          >
            <span className="scale-75">{timelineIcons[ev.type] ?? <FileText className="w-4 h-4" />}</span>
          </div>
          <div className="ml-2">
            <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">
              {locale === 'ar' ? ev.label : locale === 'fr' ? ev.labelFr : ev.labelEn}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-ink-400">{new Date(ev.date).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : locale)}</span>
              <span className="text-xs text-ink-400">·</span>
              <span className="text-xs text-ink-500 dark:text-ink-400">{ev.actor}</span>
            </div>
            {ev.note && <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 bg-ink-50 dark:bg-ink-800/50 rounded-lg px-2 py-1">{ev.note}</p>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ObservationDetail({ observation, onClose }: { observation: Observation; onClose: () => void }) {
  const { t, locale } = useApp();
  const workOrder = workflowWorkOrders.find((w) => w.observationId === observation.id);

  return (
    <Modal open onClose={onClose} title={t('wfObservationDetails')} subtitle={observation.number} size="xl">
      <div className="space-y-5">
        {/* Status + Priority */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone={statusTone[observation.status]} dot>
            {locale === 'ar' ? statusLabels[observation.status].ar : locale === 'fr' ? statusLabels[observation.status].fr : statusLabels[observation.status].en}
          </Badge>
          <Badge tone={priorityTone[observation.priority]}>
            {locale === 'ar' ? priorityLabels[observation.priority].ar : locale === 'fr' ? priorityLabels[observation.priority].fr : priorityLabels[observation.priority].en}
          </Badge>
          <Badge tone={priorityTone[observation.riskLevel]}>
            {locale === 'ar' ? riskLabels[observation.riskLevel].ar : locale === 'fr' ? riskLabels[observation.riskLevel].fr : riskLabels[observation.riskLevel].en}
          </Badge>
          {observation.workOrderId && (
            <Badge tone="brand" dot>{t('wfWorkOrderCreated')}: {observation.workOrderId}</Badge>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <FileText className="w-4 h-4" />, label: t('wfInspectionNumber'), value: observation.inspectionNumber },
            { icon: <Building2 className="w-4 h-4" />, label: t('municipality'), value: observation.municipality },
            { icon: <MapPin className="w-4 h-4" />, label: t('wfOperationalZone'), value: observation.operationalZone },
            { icon: <Layers className="w-4 h-4" />, label: t('wfSector'), value: observation.sector },
            { icon: <MapPin className="w-4 h-4" />, label: t('wfNeighborhood') || 'الحي', value: observation.neighborhood },
            { icon: <MapPin className="w-4 h-4" />, label: t('wfSector') || 'الشارع', value: observation.street },
            { icon: <AlertCircle className="w-4 h-4" />, label: t('wfObservationType'), value: observation.typeLabel },
            { icon: <User className="w-4 h-4" />, label: t('wfResponsibleEntity'), value: observation.responsibleEntityLabel },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-ink-50 dark:bg-ink-800/40">
              <span className="text-brand-500 shrink-0">{row.icon}</span>
              <div className="min-w-0">
                <p className="text-[10px] text-ink-400">{row.label}</p>
                <p className="text-xs font-medium text-ink-700 dark:text-ink-200 truncate">{row.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* GPS + Maps link */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-50 dark:bg-brand-600/10">
          <Navigation className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
          <div className="flex-1">
            <p className="text-[10px] text-ink-400">{t('wfGpsCoordinates')}</p>
            <p className="text-xs font-mono text-ink-700 dark:text-ink-200">{observation.lat.toFixed(6)}, {observation.lng.toFixed(6)}</p>
          </div>
          <a href={observation.googleMapsLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition">
            <Link2 className="w-3.5 h-3.5" /> {t('wfGoogleMaps')}
          </a>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs font-semibold text-ink-600 dark:text-ink-300 mb-1.5">{t('description') || 'الوصف'}</p>
          <p className="text-sm text-ink-700 dark:text-ink-200 leading-relaxed">{observation.description}</p>
        </div>

        {/* Before photos */}
        <div>
          <p className="text-xs font-semibold text-ink-600 dark:text-ink-300 mb-2 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" /> {t('wfBeforePhotos')}
          </p>
          {observation.beforePhotos.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {observation.beforePhotos.map((photo, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden border border-ink-200 dark:border-ink-700">
                  <img src={photo} alt={`Before ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-ink-400">{t('wfNoPhotos')}</p>}
        </div>

        {/* Inspector notes */}
        <div>
          <p className="text-xs font-semibold text-ink-600 dark:text-ink-300 mb-1.5">{t('wfInspectorNotes')}</p>
          <p className="text-sm text-ink-700 dark:text-ink-200 bg-ink-50 dark:bg-ink-800/40 rounded-lg p-3">{observation.inspectorNotes}</p>
        </div>

        {/* Linked Work Order */}
        {workOrder && (
          <div className="p-4 rounded-xl2 border border-brand-200 dark:border-brand-600/30 bg-brand-50/50 dark:bg-brand-600/5">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">{t('wfWorkOrderDetails')}: {workOrder.number}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-ink-400">{t('wfAssignedTeam')}:</span> <span className="text-ink-700 dark:text-ink-200 font-medium">{workOrder.assignedTeam}</span></div>
              <div><span className="text-ink-400">{t('wfDeadline')}:</span> <span className="text-ink-700 dark:text-ink-200 font-medium">{new Date(workOrder.deadline).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : locale)}</span></div>
              <div><span className="text-ink-400">{t('wfEstimatedDuration')}:</span> <span className="text-ink-700 dark:text-ink-200 font-medium">{workOrder.estimatedDurationHours} {t('wfHours')}</span></div>
              <div><span className="text-ink-400">{t('status')}:</span> <Badge tone={statusTone[workOrder.status]}>{locale === 'ar' ? statusLabels[workOrder.status].ar : locale === 'fr' ? statusLabels[workOrder.status].fr : statusLabels[workOrder.status].en}</Badge></div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div>
          <p className="text-xs font-semibold text-ink-600 dark:text-ink-300 mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> {t('wfTimeline')}
          </p>
          <Timeline events={observation.timeline} />
        </div>
      </div>
    </Modal>
  );
}

function NewObservationModal({ open, onClose, onAdd }: {
  open: boolean;
  onClose: () => void;
  onAdd: (obs: Partial<Observation> & { requiresIntervention?: boolean }) => void;

}) {
  const { t, locale } = useApp();
  const [form, setForm] = useState({
    municipalityId: municipalities[0].id,
    operationalZone: '',
    neighborhood: '',
    sector: '',
    street: '',
    type: 'waste_accumulation' as ObservationType,
    description: '',
    priority: 'medium' as Priority,
    riskLevel: 'medium' as RiskLevel,
    responsibleEntity: 'municipality' as ResponsibleEntity,
    inspectorNotes: '',
    requiresIntervention: true,
  });

  const handleSubmit = () => {
    const m = municipalities.find((m) => m.id === form.municipalityId)!;
    const lat = m.center[0] + (Math.random() - 0.5) * 0.02;
    const lng = m.center[1] + (Math.random() - 0.5) * 0.02;
    onAdd({
      ...form,
      municipality: m.nameAr,
      lat, lng,
    });
    onClose();
  };

  const fieldClass = 'w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-sm text-ink-900 dark:text-ink-100 outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition';
  const labelClass = 'block text-xs font-semibold text-ink-600 dark:text-ink-300 mb-1.5';

  return (
    <Modal open={open} onClose={onClose} title={t('wfNewObservation')} size="xl"
      footer={
        <>
          <button onClick={onClose} className="btn-ghost">{t('cancel') || 'إلغاء'}</button>
          <button onClick={handleSubmit} className="btn-primary">
            <Plus className="w-4 h-4" /> {t('wfAddObservation')}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('municipality')}</label>
          <select className={fieldClass} value={form.municipalityId}
            onChange={(e) => setForm({ ...form, municipalityId: e.target.value })}>
            {municipalities.map((m) => <option key={m.id} value={m.id}>{m.nameAr}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>{t('wfOperationalZone')}</label>
          <select className={fieldClass} value={form.operationalZone}
            onChange={(e) => setForm({ ...form, operationalZone: e.target.value })}>
            <option value="">—</option>
            <option value="المنطقة الشمالية">المنطقة الشمالية</option>
            <option value="المنطقة الجنوبية">المنطقة الجنوبية</option>
            <option value="المنطقة الشرقية">المنطقة الشرقية</option>
            <option value="المنطقة الغربية">المنطقة الغربية</option>
            <option value="المنطقة المركزية">المنطقة المركزية</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>{t('wfNeighborhood') || 'الحي'}</label>
          <select className={fieldClass} value={form.neighborhood}
            onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}>
            <option value="">—</option>
            {neighborhoods.filter((n) => n.municipalityId === form.municipalityId).map((n) => (
              <option key={n.id} value={n.nameAr}>{n.nameAr}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{t('wfSector')}</label>
          <select className={fieldClass} value={form.sector}
            onChange={(e) => setForm({ ...form, sector: e.target.value })}>
            <option value="">—</option>
            <option value="القطاع 1">القطاع 1</option>
            <option value="القطاع 2">القطاع 2</option>
            <option value="القطاع 3">القطاع 3</option>
            <option value="القطاع 4">القطاع 4</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className={labelClass}>{t('wfSector') || 'الشارع'}</label>
          <input type="text" className={fieldClass} value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            placeholder="شارع الاستقلال" />
        </div>
        <div>
          <label className={labelClass}>{t('wfObservationType')}</label>
          <select className={fieldClass} value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as ObservationType })}>
            {Object.entries(observationTypeData).map(([key, val]) => (
              <option key={key} value={key}>{locale === 'ar' ? val.ar : locale === 'fr' ? val.fr : val.en}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{t('wfResponsibleEntity')}</label>
          <select className={fieldClass} value={form.responsibleEntity}
            onChange={(e) => setForm({ ...form, responsibleEntity: e.target.value as ResponsibleEntity })}>
            {Object.entries(responsibleEntityLabels).map(([key, val]) => (
              <option key={key} value={key}>{locale === 'ar' ? val.ar : locale === 'fr' ? val.fr : val.en}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{t('priority')}</label>
          <select className={fieldClass} value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
            <option value="critical">{priorityLabels.critical.ar}</option>
            <option value="high">{priorityLabels.high.ar}</option>
            <option value="medium">{priorityLabels.medium.ar}</option>
            <option value="low">{priorityLabels.low.ar}</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>{t('wfRiskLevel')}</label>
          <select className={fieldClass} value={form.riskLevel}
            onChange={(e) => setForm({ ...form, riskLevel: e.target.value as RiskLevel })}>
            <option value="critical">{riskLabels.critical.ar}</option>
            <option value="high">{riskLabels.high.ar}</option>
            <option value="medium">{riskLabels.medium.ar}</option>
            <option value="low">{riskLabels.low.ar}</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className={labelClass}>{t('description') || 'الوصف'}</label>
          <textarea className={fieldClass} rows={2} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder={t('wfEnterDescription')} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>{t('wfInspectorNotes')}</label>
          <textarea className={fieldClass} rows={2} value={form.inspectorNotes}
            onChange={(e) => setForm({ ...form, inspectorNotes: e.target.value })}
            placeholder={t('wfEnterNotes')} />
        </div>
        <div className="col-span-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.requiresIntervention}
              onChange={(e) => setForm({ ...form, requiresIntervention: e.target.checked })}
              className="w-4 h-4 rounded accent-brand-500" />
            <span className="text-sm text-ink-700 dark:text-ink-200">{t('wfRequiresIntervention')} → {t('wfAutoWorkOrder')}</span>
          </label>
        </div>
      </div>
    </Modal>
  );
}

export function InspectionsPage() {
  const { t, locale } = useApp();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selectedObs, setSelectedObs] = useState<Observation | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMuni, setFilterMuni] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [observations, setObservations] = useState<Observation[]>(workflowObservations);

  const handleAddObservation = useCallback((partial: Partial<Observation> & { requiresIntervention?: boolean }) => {
    const oIdx = observations.length;
    const m = municipalities.find((m) => m.id === partial.municipalityId)!;
    const type = partial.type ?? 'waste_accumulation';
    const newObs: Observation = {
      id: `OBS-${10001 + oIdx}`,
      number: `OBS-${10001 + oIdx}`,
      inspectionNumber: `INS-${7001 + Math.floor(oIdx / 2)}`,
      municipality: m.nameAr,
      municipalityId: m.id,
      operationalZone: partial.operationalZone ?? '',
      neighborhood: partial.neighborhood ?? '',
      sector: partial.sector ?? '',
      street: partial.street ?? '',
      type,
      typeLabel: observationTypeData[type].ar,
      typeLabelFr: observationTypeData[type].fr,
      typeLabelEn: observationTypeData[type].en,
      description: partial.description ?? '',
      priority: partial.priority ?? 'medium',
      riskLevel: partial.riskLevel ?? 'medium',
      lat: partial.lat ?? m.center[0],
      lng: partial.lng ?? m.center[1],
      googleMapsLink: `https://www.google.com/maps?q=${partial.lat ?? m.center[0]},${partial.lng ?? m.center[1]}`,
      responsibleEntity: partial.responsibleEntity ?? 'municipality',
      responsibleEntityLabel: responsibleEntityLabels[partial.responsibleEntity ?? 'municipality'].ar,
      beforePhotos: [],
      inspectorNotes: partial.inspectorNotes ?? '',
      status: 'open',
      workOrderId: partial.requiresIntervention ? `WO-${20001 + oIdx}` : null,
      createdAt: new Date().toISOString(),
      timeline: [{
        id: 'ev-1', type: 'created',
        label: 'إنشاء الملاحظة', labelFr: 'Observation créée', labelEn: 'Observation Created',
        date: new Date().toISOString(), actor: m.inspector,
      }],
    };
    setObservations((prev) => [newObs, ...prev]);
    if (newObs.workOrderId) {
      toast.success(t('wfCreatedNotif'), `${newObs.number} → ${newObs.workOrderId}`);
    } else {
      toast.success(t('wfNewObservation'), newObs.number);
    }
  }, [observations.length, t]);

  const filtered = useMemo(() => {
    return observations.filter((o) => {
      if (filterStatus !== 'all' && o.status !== filterStatus) return false;
      if (filterMuni !== 'all' && o.municipalityId !== filterMuni) return false;
      if (search && !o.number.includes(search) && !o.municipality.includes(search) && !o.typeLabel.includes(search)) return false;
      return true;
    });
  }, [observations, filterStatus, filterMuni, search]);

  const kpis = useMemo(() => {
    const open = observations.filter((o) => o.status === 'open').length;
    const assigned = observations.filter((o) => o.status === 'assigned').length;
    const inProgress = observations.filter((o) => o.status === 'inProgress').length;
    const completed = observations.filter((o) => o.status === 'completed' || o.status === 'verified' || o.status === 'closed').length;
    const wos = workflowWorkOrders;
    const overdue = wos.filter((w) => new Date(w.deadline) < new Date() && w.status !== 'closed' && w.status !== 'verified').length;
    const resolved = wos.filter((w) => w.status === 'verified' || w.status === 'closed').length;
    const avgHours = resolved > 0
      ? Math.round(wos.filter((w) => w.completionDate).reduce((acc, w) => acc + (new Date(w.completionDate!).getTime() - new Date(w.createdAt).getTime()) / 3600000, 0) / resolved)
      : 0;
    return { open, assigned, inProgress, completed, overdue, avgHours, total: observations.length, resolved };
  }, [observations]);

  return (
    <div className="space-y-5">
      {/* KPI Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        <StatCard label={t('wfOpenObservations')} value={kpis.open} icon={<AlertCircle className="w-5 h-5" />} tone="danger" />
        <StatCard label={t('wfPendingWorkOrders')} value={kpis.assigned + kpis.inProgress} icon={<Clock className="w-5 h-5" />} tone="warning" />
        <StatCard label={t('wfCompletedWorkOrders')} value={kpis.completed} icon={<CheckCircle2 className="w-5 h-5" />} tone="success" />
        <StatCard label={t('wfOverdueWorkOrders')} value={kpis.overdue} icon={<AlertTriangle className="w-5 h-5" />} tone="danger" />
        <StatCard label={t('wfAvgResolutionTime')} value={`${kpis.avgHours}h`} icon={<Activity className="w-5 h-5" />} tone="brand" />
        <StatCard label={t('wfTotal')} value={kpis.total} icon={<ClipboardCheck className="w-5 h-5" />} tone="neutral" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 glass-strong rounded-xl p-1">
          <button onClick={() => setView('list')} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition', view === 'list' ? 'bg-brand-500 text-white' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800')}>
            <List className="w-3.5 h-3.5" /> {t('list') || 'قائمة'}
          </button>
          <button onClick={() => setView('map')} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition', view === 'map' ? 'bg-brand-500 text-white' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800')}>
            <MapIcon className="w-3.5 h-3.5" /> {t('map') || 'خريطة'}
          </button>
        </div>

        <div className="flex-1 flex items-center gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('search')}
            className="input flex-1 max-w-xs text-sm" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input w-auto text-sm">
            <option value="all">{t('status')}</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{locale === 'ar' ? v.ar : locale === 'fr' ? v.fr : v.en}</option>)}
          </select>
          <select value={filterMuni} onChange={(e) => setFilterMuni(e.target.value)} className="input w-auto text-sm">
            <option value="all">{t('municipality')}</option>
            {municipalities.map((m) => <option key={m.id} value={m.id}>{m.nameAr}</option>)}
          </select>
        </div>

        <button onClick={() => setShowNewModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> {t('wfNewObservation')}
        </button>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 dark:bg-ink-800/50 border-b border-ink-200 dark:border-ink-800">
                <tr className="text-right">
                  <th className="px-4 py-3 text-xs font-semibold text-ink-500">{t('wfObservationNumber')}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-ink-500">{t('wfInspectionNumber')}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-ink-500">{t('municipality')}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-ink-500">{t('wfObservationType')}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-ink-500">{t('priority')}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-ink-500">{t('wfRiskLevel')}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-ink-500">{t('wfResponsibleEntity')}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-ink-500">{t('status')}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-ink-500">{t('wfWorkOrderNumber')}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800/60">
                {filtered.map((obs) => (
                  <tr key={obs.id} className="hover:bg-ink-50/50 dark:hover:bg-ink-800/30 transition cursor-pointer" onClick={() => setSelectedObs(obs)}>
                    <td className="px-4 py-3 font-mono font-semibold text-brand-600 dark:text-brand-400 text-xs">{obs.number}</td>
                    <td className="px-4 py-3 text-xs text-ink-500 font-mono">{obs.inspectionNumber}</td>
                    <td className="px-4 py-3 text-xs text-ink-700 dark:text-ink-200">{obs.municipality}</td>
                    <td className="px-4 py-3 text-xs text-ink-600 dark:text-ink-300">{obs.typeLabel}</td>
                    <td className="px-4 py-3"><Badge tone={priorityTone[obs.priority]}>{locale === 'ar' ? priorityLabels[obs.priority].ar : locale === 'fr' ? priorityLabels[obs.priority].fr : priorityLabels[obs.priority].en}</Badge></td>
                    <td className="px-4 py-3"><Badge tone={priorityTone[obs.riskLevel]}>{locale === 'ar' ? riskLabels[obs.riskLevel].ar : locale === 'fr' ? riskLabels[obs.riskLevel].fr : riskLabels[obs.riskLevel].en}</Badge></td>
                    <td className="px-4 py-3 text-xs text-ink-600 dark:text-ink-300">{obs.responsibleEntityLabel}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone[obs.status]} dot>{locale === 'ar' ? statusLabels[obs.status].ar : locale === 'fr' ? statusLabels[obs.status].fr : statusLabels[obs.status].en}</Badge></td>
                    <td className="px-4 py-3 text-xs font-mono text-brand-600 dark:text-brand-400">{obs.workOrderId ?? '—'}</td>
                    <td className="px-4 py-3"><Eye className="w-4 h-4 text-ink-400" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-ink-400">{t('noResults') || 'لا توجد نتائج'}</div>
          )}
        </div>
      )}

      {/* Map View */}
      {view === 'map' && (
        <div className="card overflow-hidden relative h-[600px]">
          <MapContainer center={KHENCHELA_CENTER} zoom={11} className="w-full h-full" zoomControl={true}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OSM" />
            <ScaleControl position="bottomleft" />
            {filtered.map((obs) => (
              <CircleMarker
                key={obs.id}
                center={[obs.lat, obs.lng]}
                radius={8}
                pathOptions={{
                  color: statusColors[obs.status] ?? '#64748B',
                  fillColor: statusColors[obs.status] ?? '#64748B',
                  fillOpacity: 0.7,
                  weight: 2,
                }}
              >
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <p style={{ fontWeight: 700, fontSize: 13 }}>{obs.number}</p>
                    <p style={{ fontSize: 11, color: '#64748b' }}>{obs.typeLabel}</p>
                    <p style={{ fontSize: 11, marginTop: 4 }}>{obs.municipality} — {obs.street}</p>
                    <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>{obs.responsibleEntityLabel}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {/* Map legend */}
          <div className="absolute top-3 right-3 z-[500] glass-strong rounded-xl shadow-lifted p-3 space-y-1.5">
            <p className="text-xs font-semibold text-ink-700 dark:text-ink-200 mb-1">{t('wfMapLegend')}</p>
            {[
              { color: '#EF4444', label: t('wfRedOpen') },
              { color: '#F97316', label: t('wfOrangeAssigned') },
              { color: '#3B82F6', label: t('wfBlueProgress') },
              { color: '#16A34A', label: t('wfGreenCompleted') },
              { color: '#94A3B8', label: t('wfGrayClosed') },
            ].map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                <span className="text-[10px] text-ink-600 dark:text-ink-300">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observation detail modal */}
      <AnimatePresence>
        {selectedObs && <ObservationDetail observation={selectedObs} onClose={() => setSelectedObs(null)} />}
      </AnimatePresence>

      {/* New observation modal */}
      <NewObservationModal open={showNewModal} onClose={() => setShowNewModal(false)} onAdd={handleAddObservation} />
    </div>
  );
}
