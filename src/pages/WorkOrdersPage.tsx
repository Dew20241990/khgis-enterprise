import { useState, useMemo, useCallback } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Popup, ScaleControl,
} from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench, Play, CheckCircle2, XCircle, Clock, AlertTriangle, MapPin,
  Eye, Navigation, ChevronLeft, Filter, Map as MapIcon, List, Calendar,
  User, Building2, Camera, FileText, Activity, ShieldCheck, Archive,
  AlertCircle, Link2, TrendingUp, Award, Truck, Factory,
} from 'lucide-react';
import { useApp } from '@/store/appStore';
import { toast } from '@/components/ui/Toast';
import { Modal, StatCard, Badge, ConfirmDialog } from '@/components/ui';
import { municipalities, KHENCHELA_CENTER, contractors, cetCenters } from '@/data/mockData';
import {
  workflowWorkOrders, workflowObservations,
  statusColors, statusLabels, priorityLabels,
  responsibleEntityLabels,
  type WorkOrder, type WorkOrderStatus, type VerificationResult, type TimelineEvent,
} from '@/data/workflowData';
import { cn } from '@/lib/cn';

const priorityTone: Record<string, 'danger' | 'warning' | 'info' | 'neutral'> = {
  critical: 'danger', high: 'warning', medium: 'info', low: 'neutral',
};
const statusTone: Record<string, 'danger' | 'warning' | 'info' | 'success' | 'neutral'> = {
  created: 'danger', assigned: 'warning', inProgress: 'info',
  completed: 'success', verified: 'success', closed: 'neutral',
  rejected: 'danger', rework: 'warning',
};

const timelineIcons: Record<string, React.ReactNode> = {
  created: <FileText className="w-4 h-4" />,
  assigned: <Navigation className="w-4 h-4" />,
  started: <Activity className="w-4 h-4" />,
  completed: <CheckCircle2 className="w-4 h-4" />,
  verified: <ShieldCheck className="w-4 h-4" />,
  closed: <Archive className="w-4 h-4" />,
  rejected: <XCircle className="w-4 h-4" />,
  rework: <AlertTriangle className="w-4 h-4" />,
  note: <FileText className="w-4 h-4" />,
};

function WOTimeline({ events }: { events: TimelineEvent[] }) {
  const { locale } = useApp();
  return (
    <div className="relative pl-6">
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-ink-200 dark:bg-ink-700" />
      {events.map((ev, i) => (
        <motion.div key={ev.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="relative pb-5 last:pb-0">
          <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-soft" style={{ background: statusColors[ev.type] ?? '#64748B' }}>
            <span className="scale-75">{timelineIcons[ev.type] ?? <FileText className="w-4 h-4" />}</span>
          </div>
          <div className="ml-2">
            <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{locale === 'ar' ? ev.label : locale === 'fr' ? ev.labelFr : ev.labelEn}</p>
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

function WorkOrderDetail({ wo, onClose, onUpdate }: {
  wo: WorkOrder;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<WorkOrder>) => void;
}) {
  const { t, locale, canEdit } = useApp();
  const [confirmAction, setConfirmAction] = useState<'start' | 'complete' | 'verify' | 'close' | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerificationResult>('accepted');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [execNotes, setExecNotes] = useState(wo.executionNotes);
  const observation = workflowObservations.find((o) => o.id === wo.observationId);

  const editable = canEdit();
  const now = new Date();
  const deadline = new Date(wo.deadline);
  const isOverdue = deadline < now && wo.status !== 'closed' && wo.status !== 'verified';
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / 86400000);

  const handleStart = () => {
    onUpdate(wo.id, { status: 'inProgress', workStartedAt: new Date().toISOString() });
    toast.success(t('wfWorkStarted'), wo.number);
    setConfirmAction(null);
  };

  const handleComplete = () => {
    const completedAt = new Date().toISOString();
    onUpdate(wo.id, { status: 'completed', workCompletedAt: completedAt, completionDate: completedAt, executionNotes: execNotes });
    toast.success(t('wfWorkCompletedNotif'), wo.number);
    setConfirmAction(null);
  };

  const handleVerify = () => {
    const updates: Partial<WorkOrder> = {
      verificationDate: new Date().toISOString(),
      verificationResult: verifyResult,
      inspectorNotes: verifyNotes,
      status: verifyResult === 'accepted' ? 'verified' : verifyResult === 'rejected' ? 'rejected' : 'rework',
    };
    onUpdate(wo.id, updates);
    if (verifyResult === 'accepted') toast.success(t('wfVerifiedNotif'), wo.number);
    else if (verifyResult === 'rework') toast.warning(t('wfReworkNotif'), wo.number);
    else toast.error(t('wfRejectedNotif'), wo.number);
    setConfirmAction(null);
  };

  const handleClose = () => {
    onUpdate(wo.id, { status: 'closed', closedAt: new Date().toISOString(), archived: true });
    toast.success(t('wfClosedArchived'), wo.number);
    setConfirmAction(null);
  };

  const fieldClass = 'w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-sm text-ink-900 dark:text-ink-100 outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition';

  return (
    <Modal open onClose={onClose} title={t('wfWorkOrderDetails')} subtitle={wo.number} size="xl">
      <div className="space-y-5">
        {/* Status + deadline banner */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone={statusTone[wo.status]} dot>
            {locale === 'ar' ? statusLabels[wo.status].ar : locale === 'fr' ? statusLabels[wo.status].fr : statusLabels[wo.status].en}
          </Badge>
          <Badge tone={priorityTone[wo.priority]}>
            {locale === 'ar' ? priorityLabels[wo.priority].ar : locale === 'fr' ? priorityLabels[wo.priority].fr : priorityLabels[wo.priority].en}
          </Badge>
          {isOverdue && <Badge tone="danger" dot>{t('wfOverdue')}</Badge>}
          {!isOverdue && daysLeft >= 0 && daysLeft <= 2 && wo.status !== 'closed' && wo.status !== 'verified' && (
            <Badge tone="warning" dot>{t('wfDeadlineApproaching')} ({daysLeft} {t('wfDays')})</Badge>
          )}
          {wo.archived && <Badge tone="neutral"><Archive className="w-3 h-3" /> {t('wfArchive')}</Badge>}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <FileText className="w-4 h-4" />, label: t('wfObservationRef'), value: wo.observationRef },
            { icon: <Building2 className="w-4 h-4" />, label: t('municipality'), value: wo.municipality },
            { icon: <MapPin className="w-4 h-4" />, label: t('wfOperationalZone'), value: wo.operationalZone },
            { icon: <User className="w-4 h-4" />, label: t('wfAssignedTeam'), value: wo.assignedTeam },
            { icon: <Clock className="w-4 h-4" />, label: t('wfEstimatedDuration'), value: `${wo.estimatedDurationHours} ${t('wfHours')}` },
            { icon: <Calendar className="w-4 h-4" />, label: t('wfCreationDate'), value: new Date(wo.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : locale) },
            { icon: <ShieldCheck className="w-4 h-4" />, label: t('wfResponsibleOrg'), value: wo.responsibleOrganizationLabel },
            { icon: <AlertCircle className="w-4 h-4" />, label: t('wfDeadline'), value: new Date(wo.deadline).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : locale) },
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

        {/* GPS from observation */}
        {observation && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-50 dark:bg-brand-600/10">
            <Navigation className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
            <div className="flex-1">
              <p className="text-[10px] text-ink-400">{t('wfGpsCoordinates')}</p>
              <p className="text-xs font-mono text-ink-700 dark:text-ink-200">{observation.lat.toFixed(6)}, {observation.lng.toFixed(6)}</p>
            </div>
            <a href={observation.googleMapsLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition">
              <Link2 className="w-3.5 h-3.5" /> {t('wfGoogleMaps')}
            </a>
          </div>
        )}

        {/* Execution dates */}
        {(wo.workStartedAt || wo.workCompletedAt) && (
          <div className="grid grid-cols-2 gap-3">
            {wo.workStartedAt && (
              <div className="p-3 rounded-lg bg-info-50 dark:bg-info-600/10 border border-info-200/50 dark:border-info-600/20">
                <p className="text-[10px] text-info-600 dark:text-info-400 flex items-center gap-1"><Play className="w-3 h-3" /> {t('wfWorkStarted')}</p>
                <p className="text-xs font-medium text-ink-700 dark:text-ink-200 mt-1">{new Date(wo.workStartedAt).toLocaleString(locale === 'ar' ? 'ar-DZ' : locale)}</p>
              </div>
            )}
            {wo.workCompletedAt && (
              <div className="p-3 rounded-lg bg-success-50 dark:bg-success-600/10 border border-success-200/50 dark:border-success-600/20">
                <p className="text-[10px] text-success-600 dark:text-success-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {t('wfWorkCompleted')}</p>
                <p className="text-xs font-medium text-ink-700 dark:text-ink-200 mt-1">{new Date(wo.workCompletedAt).toLocaleString(locale === 'ar' ? 'ar-DZ' : locale)}</p>
              </div>
            )}
          </div>
        )}

        {/* Execution notes editor (for inProgress) */}
        {wo.status === 'inProgress' && editable && (
          <div>
            <label className="block text-xs font-semibold text-ink-600 dark:text-ink-300 mb-1.5">{t('wfExecutionNotes')}</label>
            <textarea className={fieldClass} rows={2} value={execNotes} onChange={(e) => setExecNotes(e.target.value)} placeholder={t('wfEnterNotes')} />
          </div>
        )}

        {/* After photos */}
        {wo.afterPhotos.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-ink-600 dark:text-ink-300 mb-2 flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" /> {t('wfAfterPhotos')}</p>
            <div className="grid grid-cols-4 gap-2">
              {wo.afterPhotos.map((photo, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden border border-ink-200 dark:border-ink-700">
                  <img src={photo} alt={`After ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification result */}
        {wo.verificationResult && (
          <div className="p-3 rounded-lg bg-brand-50 dark:bg-brand-600/10 border border-brand-200/50 dark:border-brand-600/20">
            <p className="text-xs font-semibold text-brand-700 dark:text-brand-300 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4" /> {t('wfVerificationResult')}
            </p>
            <div className="flex items-center gap-2">
              <Badge tone={wo.verificationResult === 'accepted' ? 'success' : wo.verificationResult === 'rejected' ? 'danger' : 'warning'}>
                {wo.verificationResult === 'accepted' ? t('wfAccepted') : wo.verificationResult === 'rejected' ? t('wfRejected') : t('wfNeedRework')}
              </Badge>
              {wo.verificationDate && <span className="text-xs text-ink-400">{new Date(wo.verificationDate).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : locale)}</span>}
            </div>
            {wo.inspectorNotes && <p className="text-xs text-ink-600 dark:text-ink-300 mt-1.5">{wo.inspectorNotes}</p>}
          </div>
        )}

        {/* Action buttons */}
        {editable && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-ink-200/60 dark:border-ink-800/60">
            {wo.status === 'created' && (
              <button onClick={() => setConfirmAction('start')} className="btn-primary"><Play className="w-4 h-4" /> {t('wfStartWork')}</button>
            )}
            {wo.status === 'inProgress' && (
              <button onClick={() => setConfirmAction('complete')} className="btn-primary bg-success-500 hover:bg-success-600"><CheckCircle2 className="w-4 h-4" /> {t('wfCompleteWork')}</button>
            )}
            {wo.status === 'completed' && (
              <button onClick={() => setConfirmAction('verify')} className="btn-primary bg-accent-500 hover:bg-accent-600"><ShieldCheck className="w-4 h-4" /> {t('wfVerifyWork')}</button>
            )}
            {wo.status === 'verified' && (
              <button onClick={() => setConfirmAction('close')} className="btn-primary bg-ink-600 hover:bg-ink-700"><Archive className="w-4 h-4" /> {t('wfCloseOrder')}</button>
            )}
          </div>
        )}

        {/* Timeline */}
        <div>
          <p className="text-xs font-semibold text-ink-600 dark:text-ink-300 mb-3 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {t('wfTimeline')}</p>
          <WOTimeline events={wo.timeline} />
        </div>
      </div>

      {/* Confirmation dialogs */}
      <ConfirmDialog
        open={confirmAction === 'start'}
        title={t('wfConfirmStart')}
        message={wo.number}
        confirmLabel={t('wfStartWork')}
        onConfirm={handleStart}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        open={confirmAction === 'complete'}
        title={t('wfConfirmComplete')}
        message={wo.number}
        confirmLabel={t('wfCompleteWork')}
        onConfirm={handleComplete}
        onCancel={() => setConfirmAction(null)}
      />
      <Modal open={confirmAction === 'verify'} onClose={() => setConfirmAction(null)} title={t('wfConfirmVerify')} subtitle={wo.number} size="md"
        footer={<>
          <button onClick={() => setConfirmAction(null)} className="btn-ghost">{t('cancel') || 'إلغاء'}</button>
          <button onClick={handleVerify} className="btn-primary bg-accent-500 hover:bg-accent-600"><ShieldCheck className="w-4 h-4" /> {t('wfVerifyWork')}</button>
        </>}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-ink-600 dark:text-ink-300 mb-1.5">{t('wfVerificationResult')}</label>
            <div className="flex gap-2">
              {([
                { value: 'accepted', label: t('wfAccepted'), tone: 'success' },
                { value: 'rework', label: t('wfNeedRework'), tone: 'warning' },
                { value: 'rejected', label: t('wfRejected'), tone: 'danger' },
              ] as { value: VerificationResult; label: string; tone: string }[]).map((opt) => (
                <button key={opt.value} onClick={() => setVerifyResult(opt.value)}
                  className={cn('flex-1 px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition',
                    verifyResult === opt.value
                      ? opt.tone === 'success' ? 'border-success-500 bg-success-50 dark:bg-success-600/15 text-success-700 dark:text-success-300'
                        : opt.tone === 'warning' ? 'border-warning-500 bg-warning-50 dark:bg-warning-600/15 text-warning-700 dark:text-warning-300'
                        : 'border-danger-500 bg-danger-50 dark:bg-danger-600/15 text-danger-700 dark:text-danger-300'
                      : 'border-ink-200 dark:border-ink-700 text-ink-500 hover:border-ink-300 dark:hover:border-ink-600')}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-600 dark:text-ink-300 mb-1.5">{t('wfInspectorNotes')}</label>
            <textarea className="w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30" rows={3} value={verifyNotes} onChange={(e) => setVerifyNotes(e.target.value)} placeholder={t('wfEnterNotes')} />
          </div>
        </div>
      </Modal>
      <ConfirmDialog
        open={confirmAction === 'close'}
        title={t('wfConfirmClose')}
        message={wo.number}
        confirmLabel={t('wfCloseOrder')}
        onConfirm={handleClose}
        onCancel={() => setConfirmAction(null)}
      />
    </Modal>
  );
}

function PerfByEntity({ title, icon, data }: { title: string; icon: React.ReactNode; data: { name: string; total: number; completed: number; rate: number }[] }) {
  const { t } = useApp();
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-brand-500">{icon}</span>
        <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{title}</p>
      </div>
      <div className="space-y-2.5">
        {data.map((d, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-ink-600 dark:text-ink-300 truncate">{d.name}</span>
              <span className="text-xs font-mono text-ink-500">{d.completed}/{d.total}</span>
            </div>
            <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${d.rate}%` }} transition={{ duration: 0.6, delay: i * 0.1 }}
                className={cn('h-full rounded-full', d.rate >= 75 ? 'bg-success-500' : d.rate >= 50 ? 'bg-warning-500' : 'bg-danger-500')} />
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-xs text-ink-400 text-center py-3">{t('noResults') || 'لا توجد نتائج'}</p>}
      </div>
    </div>
  );
}

export function WorkOrdersPage() {
  const { t, locale } = useApp();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMuni, setFilterMuni] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(workflowWorkOrders);

  const handleUpdate = useCallback((id: string, updates: Partial<WorkOrder>) => {
    setWorkOrders((prev) => prev.map((w) => w.id === id ? { ...w, ...updates } : w));
    setSelectedWO((prev) => prev && prev.id === id ? { ...prev, ...updates } : prev);
  }, []);

  const filtered = useMemo(() => {
    return workOrders.filter((w) => {
      if (filterStatus !== 'all' && w.status !== filterStatus) return false;
      if (filterMuni !== 'all' && w.municipalityId !== filterMuni) return false;
      if (search && !w.number.includes(search) && !w.municipality.includes(search) && !w.observationRef.includes(search)) return false;
      return true;
    });
  }, [workOrders, filterStatus, filterMuni, search]);

  const kpis = useMemo(() => {
    const pending = workOrders.filter((w) => w.status === 'created' || w.status === 'assigned').length;
    const inProgress = workOrders.filter((w) => w.status === 'inProgress').length;
    const completed = workOrders.filter((w) => w.status === 'completed' || w.status === 'verified' || w.status === 'closed').length;
    const overdue = workOrders.filter((w) => new Date(w.deadline) < new Date() && w.status !== 'closed' && w.status !== 'verified').length;
    const resolved = workOrders.filter((w) => w.completionDate);
    const avgHours = resolved.length > 0
      ? Math.round(resolved.reduce((acc, w) => acc + (new Date(w.completionDate!).getTime() - new Date(w.createdAt).getTime()) / 3600000, 0) / resolved.length)
      : 0;
    return { pending, inProgress, completed, overdue, avgHours, total: workOrders.length };
  }, [workOrders]);

  const perfByMuni = useMemo(() => {
    const map = new Map<string, { total: number; completed: number }>();
    workOrders.forEach((w) => {
      const cur = map.get(w.municipality) ?? { total: 0, completed: 0 };
      cur.total++;
      if (w.status === 'verified' || w.status === 'closed') cur.completed++;
      map.set(w.municipality, cur);
    });
    return Array.from(map.entries()).map(([name, v]) => ({ name, total: v.total, completed: v.completed, rate: v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0 })).sort((a, b) => b.rate - a.rate).slice(0, 6);
  }, [workOrders]);

  const perfByCet = useMemo(() => {
    return cetCenters.map((c) => {
      const wos = workOrders.filter((w) => w.responsibleOrganization === 'cet' && w.municipality === c.city);
      const completed = wos.filter((w) => w.status === 'verified' || w.status === 'closed').length;
      return { name: c.name, total: wos.length, completed, rate: wos.length > 0 ? Math.round((completed / wos.length) * 100) : 0 };
    });
  }, [workOrders]);

  const perfByContractor = useMemo(() => {
    return contractors.map((c) => {
      const wos = workOrders.filter((w) => w.responsibleOrganization === 'contractor');
      const idx = contractors.indexOf(c);
      const subset = wos.filter((_, i) => i % contractors.length === idx);
      const completed = subset.filter((w) => w.status === 'verified' || w.status === 'closed').length;
      return { name: c.name, total: subset.length, completed, rate: subset.length > 0 ? Math.round((completed / subset.length) * 100) : 0 };
    });
  }, [workOrders]);

  return (
    <div className="space-y-5">
      {/* KPI Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        <StatCard label={t('wfPendingWorkOrders')} value={kpis.pending} icon={<Clock className="w-5 h-5" />} tone="warning" />
        <StatCard label={t('wfWorkStarted') || 'قيد التنفيذ'} value={kpis.inProgress} icon={<Activity className="w-5 h-5" />} tone="warning" />
        <StatCard label={t('wfCompletedWorkOrders')} value={kpis.completed} icon={<CheckCircle2 className="w-5 h-5" />} tone="success" />
        <StatCard label={t('wfOverdueWorkOrders')} value={kpis.overdue} icon={<AlertTriangle className="w-5 h-5" />} tone="danger" />
        <StatCard label={t('wfAvgResolutionTime')} value={`${kpis.avgHours}h`} icon={<TrendingUp className="w-5 h-5" />} tone="brand" />
        <StatCard label={t('wfTotal')} value={kpis.total} icon={<Wrench className="w-5 h-5" />} tone="neutral" />
      </div>

      {/* Performance charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PerfByEntity title={t('wfPerfByMunicipality')} icon={<Building2 className="w-5 h-5" />} data={perfByMuni} />
        <PerfByEntity title={t('wfPerfByCet')} icon={<Factory className="w-5 h-5" />} data={perfByCet} />
        <PerfByEntity title={t('wfPerfByContractor')} icon={<Award className="w-5 h-5" />} data={perfByContractor} />
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('search')} className="input flex-1 max-w-xs text-sm" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input w-auto text-sm">
            <option value="all">{t('status')}</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{locale === 'ar' ? v.ar : locale === 'fr' ? v.fr : v.en}</option>)}
          </select>
          <select value={filterMuni} onChange={(e) => setFilterMuni(e.target.value)} className="input w-auto text-sm">
            <option value="all">{t('municipality')}</option>
            {municipalities.map((m) => <option key={m.id} value={m.id}>{m.nameAr}</option>)}
          </select>
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 dark:bg-ink-800/50 border-b border-ink-200 dark:border-ink-800">
                <tr className="text-right">
                  <th className="px-4 py-3 text-xs font-semibold text-ink-500">{t('wfWorkOrderNumber')}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-ink-500">{t('wfObservationRef')}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-ink-500">{t('municipality')}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-ink-500">{t('wfResponsibleOrg')}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-ink-500">{t('wfAssignedTeam')}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-ink-500">{t('priority')}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-ink-500">{t('wfDeadline')}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-ink-500">{t('status')}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800/60">
                {filtered.map((wo) => {
                  const isOverdue = new Date(wo.deadline) < new Date() && wo.status !== 'closed' && wo.status !== 'verified';
                  return (
                    <tr key={wo.id} className="hover:bg-ink-50/50 dark:hover:bg-ink-800/30 transition cursor-pointer" onClick={() => setSelectedWO(wo)}>
                      <td className="px-4 py-3 font-mono font-semibold text-brand-600 dark:text-brand-400 text-xs">{wo.number}</td>
                      <td className="px-4 py-3 text-xs text-ink-500 font-mono">{wo.observationRef}</td>
                      <td className="px-4 py-3 text-xs text-ink-700 dark:text-ink-200">{wo.municipality}</td>
                      <td className="px-4 py-3 text-xs text-ink-600 dark:text-ink-300">{wo.responsibleOrganizationLabel}</td>
                      <td className="px-4 py-3 text-xs text-ink-600 dark:text-ink-300">{wo.assignedTeam}</td>
                      <td className="px-4 py-3"><Badge tone={priorityTone[wo.priority]}>{locale === 'ar' ? priorityLabels[wo.priority].ar : locale === 'fr' ? priorityLabels[wo.priority].fr : priorityLabels[wo.priority].en}</Badge></td>
                      <td className={cn('px-4 py-3 text-xs', isOverdue ? 'text-danger-600 dark:text-danger-400 font-semibold' : 'text-ink-600 dark:text-ink-300')}>
                        {new Date(wo.deadline).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : locale)}
                        {isOverdue && <span className="block text-[10px]">{t('wfOverdue')}</span>}
                      </td>
                      <td className="px-4 py-3"><Badge tone={statusTone[wo.status]} dot>{locale === 'ar' ? statusLabels[wo.status].ar : locale === 'fr' ? statusLabels[wo.status].fr : statusLabels[wo.status].en}</Badge></td>
                      <td className="px-4 py-3"><Eye className="w-4 h-4 text-ink-400" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="py-12 text-center text-sm text-ink-400">{t('noResults') || 'لا توجد نتائج'}</div>}
        </div>
      )}

      {/* Map View */}
      {view === 'map' && (
        <div className="card overflow-hidden relative h-[600px]">
          <MapContainer center={KHENCHELA_CENTER} zoom={11} className="w-full h-full" zoomControl={true}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OSM" />
            <ScaleControl position="bottomleft" />
            {filtered.map((wo) => {
              const obs = workflowObservations.find((o) => o.id === wo.observationId);
              if (!obs) return null;
              return (
                <CircleMarker key={wo.id} center={[obs.lat, obs.lng]} radius={8}
                  pathOptions={{ color: statusColors[wo.status] ?? '#64748B', fillColor: statusColors[wo.status] ?? '#64748B', fillOpacity: 0.7, weight: 2 }}>
                  <Popup>
                    <div style={{ minWidth: 180 }}>
                      <p style={{ fontWeight: 700, fontSize: 13 }}>{wo.number}</p>
                      <p style={{ fontSize: 11, color: '#64748b' }}>{wo.responsibleOrganizationLabel}</p>
                      <p style={{ fontSize: 11, marginTop: 4 }}>{wo.municipality}</p>
                      <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Ref: {wo.observationRef}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

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

      {/* Detail modal */}
      <AnimatePresence>
        {selectedWO && <WorkOrderDetail wo={selectedWO} onClose={() => setSelectedWO(null)} onUpdate={handleUpdate} />}
      </AnimatePresence>
    </div>
  );
}
