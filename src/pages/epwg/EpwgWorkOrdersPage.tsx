import { useState, useMemo } from 'react';
import { Wrench, Flame, ClipboardCheck, Building, Cog, Plus, Download } from 'lucide-react';
import { PageHeader, StatCard, EnterpriseDataTable, type EnterpriseColumn, type FilterConfig, Modal, SmartForm, type FormField } from '@/components/ui';
import { epwgWorkOrders, epwgFacilities, type EpwgWorkOrder } from '@/data/epwgData';
import { useApp } from '@/store/appStore';
import { toast } from '@/components/ui/Toast';

const priorityColor: Record<string, string> = {
  critical: '#DC2626', high: '#F97316', medium: '#F59E0B', low: '#16A34A',
};
const statusColor: Record<string, string> = {
  open: '#0F4C81', assigned: '#14B8A6', inProgress: '#F59E0B', completed: '#16A34A', cancelled: '#94A3B8',
};
const typeIcon: Record<string, React.ReactNode> = {
  maintenance: <Cog className="w-3.5 h-3.5" />,
  repair: <Wrench className="w-3.5 h-3.5" />,
  construction: <Building className="w-3.5 h-3.5" />,
  environmental: <Flame className="w-3.5 h-3.5" />,
  equipment: <ClipboardCheck className="w-3.5 h-3.5" />,
};

export function EpwgWorkOrdersPage() {
  const { t, locale } = useApp();
  const [rows, setRows] = useState<EpwgWorkOrder[]>(epwgWorkOrders);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);

  const facilityName = (id: string) => {
    const f = epwgFacilities.find((x) => x.id === id);
    return f ? (locale === 'ar' ? f.nameAr : f.nameFr) : id;
  };

  const filtered = useMemo(() => rows.filter((w) => {
    return (statusFilter === 'all' || w.status === statusFilter) &&
           (priorityFilter === 'all' || w.priority === priorityFilter) &&
           (facilityFilter === 'all' || w.facilityId === facilityFilter);
  }), [rows, statusFilter, priorityFilter, facilityFilter]);

  const stats = {
    open: rows.filter((w) => w.status === 'open').length,
    inProgress: rows.filter((w) => w.status === 'inProgress').length,
    completed: rows.filter((w) => w.status === 'completed').length,
    critical: rows.filter((w) => w.priority === 'critical').length,
  };

  const filters: FilterConfig[] = [
    { key: 'status', label: t('epwgOperationalStatus'), type: 'select', value: statusFilter, onChange: setStatusFilter,
      options: [
        { value: 'open', label: locale === 'ar' ? 'مفتوح' : 'Open' },
        { value: 'assigned', label: locale === 'ar' ? 'مُسند' : 'Assigned' },
        { value: 'inProgress', label: locale === 'ar' ? 'قيد التنفيذ' : 'In Progress' },
        { value: 'completed', label: locale === 'ar' ? 'مكتمل' : 'Completed' },
        { value: 'cancelled', label: locale === 'ar' ? 'ملغى' : 'Cancelled' },
      ] },
    { key: 'priority', label: locale === 'ar' ? 'الأولوية' : 'Priority', type: 'select', value: priorityFilter, onChange: setPriorityFilter,
      options: [
        { value: 'critical', label: locale === 'ar' ? 'حرج' : 'Critical' },
        { value: 'high', label: locale === 'ar' ? 'عالي' : 'High' },
        { value: 'medium', label: locale === 'ar' ? 'متوسط' : 'Medium' },
        { value: 'low', label: locale === 'ar' ? 'منخفض' : 'Low' },
      ] },
    { key: 'facility', label: t('epwgFacilities'), type: 'select', value: facilityFilter, onChange: setFacilityFilter,
      options: epwgFacilities.map((f) => ({ value: f.id, label: locale === 'ar' ? f.nameAr : f.nameFr })) },
  ];

  const columns: EnterpriseColumn<EpwgWorkOrder>[] = [
    { key: 'code', header: locale === 'ar' ? 'الرمز' : 'Code', sortable: true, searchable: true, pinned: 'left', width: 110,
      render: (w) => <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">{w.code}</span> },
    { key: 'titleAr', header: locale === 'ar' ? 'العنوان' : 'Title', sortable: true, searchable: true, width: 240,
      render: (w) => (
        <div className="flex items-center gap-2">
          <span className="text-ink-400">{typeIcon[w.type]}</span>
          <span className="text-sm">{locale === 'ar' ? w.titleAr : w.title}</span>
        </div>
      ) },
    { key: 'facilityId', header: t('epwgFacilities'), sortable: true, searchable: true, width: 150,
      render: (w) => <span className="text-xs">{facilityName(w.facilityId)}</span>,
      exportValue: (w) => facilityName(w.facilityId) },
    { key: 'type', header: locale === 'ar' ? 'النوع' : 'Type', sortable: true, width: 120,
      render: (w) => <span className="text-xs text-ink-500">{w.typeAr}</span> },
    { key: 'status', header: t('epwgOperationalStatus'), sortable: true, width: 130,
      render: (w) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{ background: `${statusColor[w.status]}20`, color: statusColor[w.status] }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor[w.status] }} />
          {w.status}
        </span>
      ) },
    { key: 'priority', header: locale === 'ar' ? 'الأولوية' : 'Priority', sortable: true, width: 110,
      render: (w) => (
        <span className="text-xs font-semibold" style={{ color: priorityColor[w.priority] }}>{w.priority}</span>
      ) },
    { key: 'assigneeAr', header: locale === 'ar' ? 'المسؤول' : 'Assignee', sortable: true, width: 130,
      render: (w) => <span className="text-xs">{locale === 'ar' ? w.assigneeAr : w.assignee}</span> },
    { key: 'progress', header: locale === 'ar' ? 'التقدم' : 'Progress', sortable: true, width: 120,
      render: (w) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden min-w-[60px]">
            <div className="h-full rounded-full" style={{ width: `${w.progress}%`, background: statusColor[w.status] }} />
          </div>
          <span className="text-[10px] font-semibold text-ink-500">{w.progress}%</span>
        </div>
      ) },
    { key: 'estimatedCost', header: locale === 'ar' ? 'التكلفة' : 'Cost', sortable: true, width: 110, align: 'left',
      render: (w) => <span className="text-xs font-semibold text-ink-700 dark:text-ink-200">{w.estimatedCost.toLocaleString()} دج</span> },
    { key: 'dueDate', header: locale === 'ar' ? 'الاستحقاق' : 'Due', sortable: true, width: 110,
      render: (w) => <span className="text-xs text-ink-500">{w.dueDate}</span> },
  ];

  const formFields: FormField[] = [
    { key: 'title', label: locale === 'ar' ? 'العنوان' : 'Title', type: 'text', required: true },
    { key: 'facilityId', label: t('epwgFacilities'), type: 'select', required: true,
      options: epwgFacilities.map((f) => ({ value: f.id, label: locale === 'ar' ? f.nameAr : f.nameFr })) },
    { key: 'type', label: locale === 'ar' ? 'النوع' : 'Type', type: 'select', required: true,
      options: [
        { value: 'maintenance', label: locale === 'ar' ? 'صيانة' : 'Maintenance' },
        { value: 'repair', label: locale === 'ar' ? 'إصلاح' : 'Repair' },
        { value: 'construction', label: locale === 'ar' ? 'أشغال' : 'Construction' },
        { value: 'environmental', label: locale === 'ar' ? 'بيئي' : 'Environmental' },
        { value: 'equipment', label: locale === 'ar' ? 'معدّات' : 'Equipment' },
      ] },
    { key: 'priority', label: locale === 'ar' ? 'الأولوية' : 'Priority', type: 'select', required: true,
      options: [
        { value: 'critical', label: locale === 'ar' ? 'حرج' : 'Critical' },
        { value: 'high', label: locale === 'ar' ? 'عالي' : 'High' },
        { value: 'medium', label: locale === 'ar' ? 'متوسط' : 'Medium' },
        { value: 'low', label: locale === 'ar' ? 'منخفض' : 'Low' },
      ] },
    { key: 'assignee', label: locale === 'ar' ? 'المسؤول' : 'Assignee', type: 'text' },
    { key: 'estimatedCost', label: locale === 'ar' ? 'التكلفة التقديرية' : 'Estimated Cost', type: 'number', min: 0 },
  ];

  const handleSubmit = (values: Record<string, any>) => {
    const newWO: EpwgWorkOrder = {
      id: `EWO-${Date.now()}`,
      code: `EWO-${9000 + rows.length + 1}`,
      facilityId: values.facilityId,
      title: values.title, titleAr: values.title,
      type: values.type, typeAr: values.type,
      status: 'open',
      priority: values.priority,
      assignee: values.assignee ?? '—', assigneeAr: values.assignee ?? '—',
      createdAt: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      estimatedCost: values.estimatedCost ?? 0,
      progress: 0,
    };
    setRows([newWO, ...rows]);
    toast.success(locale === 'ar' ? 'تم الإنشاء' : 'Created', locale === 'ar' ? 'تم إنشاء أمر العمل' : 'Work order created');
    setFormOpen(false);
  };

  return (
    <div>
      <PageHeader
        title={t('epwgWorkOrders')}
        subtitle={`${rows.length} ${locale === 'ar' ? 'أمر عمل' : 'work orders'}`}
        icon={<Wrench className="w-5 h-5" />}
        actions={
          <>
            <button className="btn-outline"><Download className="w-4 h-4" /> {t('export')}</button>
            <button onClick={() => setFormOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> {t('add')}</button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label={locale === 'ar' ? 'مفتوحة' : 'Open'} value={stats.open} icon={<Wrench className="w-5 h-5" />} tone="brand" />
        <StatCard label={locale === 'ar' ? 'قيد التنفيذ' : 'In Progress'} value={stats.inProgress} icon={<Cog className="w-5 h-5" />} tone="warning" />
        <StatCard label={locale === 'ar' ? 'مكتملة' : 'Completed'} value={stats.completed} icon={<ClipboardCheck className="w-5 h-5" />} tone="success" />
        <StatCard label={locale === 'ar' ? 'حرجة' : 'Critical'} value={stats.critical} icon={<Flame className="w-5 h-5" />} tone="danger" />
      </div>

      <EnterpriseDataTable
        columns={columns}
        rows={filtered}
        rowKey={(w) => w.id}
        filters={filters}
        pageSize={10}
        title={t('epwgWorkOrders')}
        onPrint={() => window.print()}
      />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={locale === 'ar' ? 'أمر عمل جديد' : 'New Work Order'} size="lg">
        <SmartForm fields={formFields} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Modal>
    </div>
  );
}
