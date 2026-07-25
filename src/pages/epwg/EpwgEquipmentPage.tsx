import { useState, useMemo } from 'react';
import { Wrench, Cog, Gauge, Fence, Droplets, Wind, Radio, Plus, Download } from 'lucide-react';
import { PageHeader, StatCard, EnterpriseDataTable, type EnterpriseColumn, type FilterConfig, Modal, SmartForm, type FormField } from '@/components/ui';
import { epwgEquipment, epwgFacilities, type EpwgEquipment, type EquipmentStatus } from '@/data/epwgData';
import { useApp } from '@/store/appStore';
import { equipmentStatusColor, equipmentStatusLabel } from './epwgHelpers';
import { toast } from '@/components/ui/Toast';

const typeIcon: Record<string, React.ReactNode> = {
  compactor: <Cog className="w-3.5 h-3.5" />,
  weighbridge: <Gauge className="w-3.5 h-3.5" />,
  loader: <Wrench className="w-3.5 h-3.5" />,
  fence: <Fence className="w-3.5 h-3.5" />,
  'leachate-plant': <Droplets className="w-3.5 h-3.5" />,
  'gas-extraction': <Wind className="w-3.5 h-3.5" />,
  'monitoring-station': <Radio className="w-3.5 h-3.5" />,
};

export function EpwgEquipmentPage() {
  const { t, locale } = useApp();
  const [rows, setRows] = useState<EpwgEquipment[]>(epwgEquipment);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);

  const facilityName = (id: string) => {
    const f = epwgFacilities.find((x) => x.id === id);
    return f ? (locale === 'ar' ? f.nameAr : f.nameFr) : id;
  };

  const filtered = useMemo(() => rows.filter((e) => {
    return (statusFilter === 'all' || e.status === statusFilter) &&
           (typeFilter === 'all' || e.type === typeFilter) &&
           (facilityFilter === 'all' || e.facilityId === facilityFilter);
  }), [rows, statusFilter, typeFilter, facilityFilter]);

  const stats = {
    total: rows.length,
    operational: rows.filter((e) => e.status === 'operational').length,
    maintenance: rows.filter((e) => e.status === 'maintenance').length,
    broken: rows.filter((e) => e.status === 'broken').length,
  };

  const filters: FilterConfig[] = [
    { key: 'status', label: t('epwgEquipmentStatus'), type: 'select', value: statusFilter, onChange: setStatusFilter,
      options: (['operational', 'maintenance', 'broken', 'planned'] as EquipmentStatus[]).map((s) => ({ value: s, label: equipmentStatusLabel(s, locale) })) },
    { key: 'type', label: locale === 'ar' ? 'النوع' : 'Type', type: 'select', value: typeFilter, onChange: setTypeFilter,
      options: [
        { value: 'compactor', label: locale === 'ar' ? 'ضاغط' : 'Compactor' },
        { value: 'weighbridge', label: locale === 'ar' ? 'ميزان' : 'Weighbridge' },
        { value: 'loader', label: locale === 'ar' ? 'محمل' : 'Loader' },
        { value: 'fence', label: locale === 'ar' ? 'سياج' : 'Fence' },
        { value: 'leachate-plant', label: locale === 'ar' ? 'وحدة رشاحة' : 'Leachate Plant' },
        { value: 'gas-extraction', label: locale === 'ar' ? 'نظام غاز' : 'Gas Extraction' },
        { value: 'monitoring-station', label: locale === 'ar' ? 'محطة مراقبة' : 'Monitoring Station' },
      ] },
    { key: 'facility', label: t('epwgFacilities'), type: 'select', value: facilityFilter, onChange: setFacilityFilter,
      options: epwgFacilities.map((f) => ({ value: f.id, label: locale === 'ar' ? f.nameAr : f.nameFr })) },
  ];

  const columns: EnterpriseColumn<EpwgEquipment>[] = [
    { key: 'id', header: locale === 'ar' ? 'المعرّف' : 'ID', sortable: true, searchable: true, pinned: 'left', width: 90,
      render: (e) => <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">{e.id}</span> },
    { key: 'nameAr', header: locale === 'ar' ? 'الاسم' : 'Name', sortable: true, searchable: true, width: 180,
      render: (e) => (
        <div className="flex items-center gap-2">
          <span className="text-ink-400">{typeIcon[e.type]}</span>
          <span className="text-sm">{locale === 'ar' ? e.nameAr : e.name}</span>
        </div>
      ) },
    { key: 'facilityId', header: t('epwgFacilities'), sortable: true, searchable: true, width: 160,
      render: (e) => <span className="text-xs">{facilityName(e.facilityId)}</span>,
      exportValue: (e) => facilityName(e.facilityId) },
    { key: 'typeAr', header: locale === 'ar' ? 'النوع' : 'Type', sortable: true, width: 130,
      render: (e) => <span className="text-xs text-ink-500">{e.typeAr}</span> },
    { key: 'status', header: t('epwgEquipmentStatus'), sortable: true, width: 130,
      render: (e) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{ background: `${equipmentStatusColor[e.status]}20`, color: equipmentStatusColor[e.status] }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: equipmentStatusColor[e.status] }} />
          {equipmentStatusLabel(e.status, locale)}
        </span>
      ) },
    { key: 'lastService', header: locale === 'ar' ? 'آخر صيانة' : 'Last Service', sortable: true, width: 120,
      render: (e) => <span className="text-xs text-ink-500">{e.lastService}</span> },
    { key: 'nextService', header: locale === 'ar' ? 'الصيانة القادمة' : 'Next Service', sortable: true, width: 120,
      render: (e) => <span className="text-xs text-ink-500">{e.nextService}</span> },
    { key: 'notes', header: locale === 'ar' ? 'ملاحظات' : 'Notes', searchable: true, width: 200,
      render: (e) => <span className="text-xs text-ink-400 truncate">{e.notes}</span> },
  ];

  const formFields: FormField[] = [
    { key: 'name', label: locale === 'ar' ? 'الاسم' : 'Name', type: 'text', required: true },
    { key: 'facilityId', label: t('epwgFacilities'), type: 'select', required: true,
      options: epwgFacilities.map((f) => ({ value: f.id, label: locale === 'ar' ? f.nameAr : f.nameFr })) },
    { key: 'type', label: locale === 'ar' ? 'النوع' : 'Type', type: 'select', required: true,
      options: [
        { value: 'compactor', label: locale === 'ar' ? 'ضاغط' : 'Compactor' },
        { value: 'weighbridge', label: locale === 'ar' ? 'ميزان' : 'Weighbridge' },
        { value: 'loader', label: locale === 'ar' ? 'محمل' : 'Loader' },
        { value: 'fence', label: locale === 'ar' ? 'سياج' : 'Fence' },
      ] },
    { key: 'status', label: t('epwgEquipmentStatus'), type: 'select', required: true,
      options: (['operational', 'maintenance', 'broken', 'planned'] as EquipmentStatus[]).map((s) => ({ value: s, label: equipmentStatusLabel(s, locale) })) },
    { key: 'notes', label: locale === 'ar' ? 'ملاحظات' : 'Notes', type: 'text' },
  ];

  const handleSubmit = (values: Record<string, any>) => {
    const newEq: EpwgEquipment = {
      id: `EQ-${Date.now().toString().slice(-3)}`,
      facilityId: values.facilityId,
      name: values.name, nameAr: values.name,
      type: values.type, typeAr: values.type,
      status: values.status,
      lastService: new Date().toISOString().slice(0, 10),
      nextService: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      notes: values.notes ?? '',
    };
    setRows([newEq, ...rows]);
    toast.success(locale === 'ar' ? 'تمت الإضافة' : 'Added', locale === 'ar' ? 'تمت إضافة المعدّة' : 'Equipment added');
    setFormOpen(false);
  };

  return (
    <div>
      <PageHeader title={t('epwgEquipment')} subtitle={`${rows.length} ${locale === 'ar' ? 'معدّة' : 'equipment items'}`} icon={<Wrench className="w-5 h-5" />}
        actions={<>
          <button className="btn-outline"><Download className="w-4 h-4" /> {t('export')}</button>
          <button onClick={() => setFormOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> {t('add')}</button>
        </>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label={locale === 'ar' ? 'إجمالي المعدّات' : 'Total Equipment'} value={stats.total} icon={<Wrench className="w-5 h-5" />} tone="brand" />
        <StatCard label={locale === 'ar' ? 'تشغيلي' : 'Operational'} value={stats.operational} icon={<Cog className="w-5 h-5" />} tone="success" />
        <StatCard label={locale === 'ar' ? 'صيانة' : 'Maintenance'} value={stats.maintenance} icon={<Gauge className="w-5 h-5" />} tone="warning" />
        <StatCard label={locale === 'ar' ? 'معطل' : 'Broken'} value={stats.broken} icon={<Wrench className="w-5 h-5" />} tone="danger" />
      </div>

      <EnterpriseDataTable columns={columns} rows={filtered} rowKey={(e) => e.id} filters={filters} pageSize={10} title={t('epwgEquipment')} onPrint={() => window.print()} />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={locale === 'ar' ? 'معدّة جديدة' : 'New Equipment'} size="lg">
        <SmartForm fields={formFields} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Modal>
    </div>
  );
}
