import { useState, useMemo } from 'react';
import { Truck, Navigation, Gauge, Plus, Download } from 'lucide-react';
import { PageHeader, StatCard, EnterpriseDataTable, type EnterpriseColumn, type FilterConfig, Modal, SmartForm, type FormField } from '@/components/ui';
import { epwgVehicles, epwgFacilities, type EpwgVehicle, type VehicleStatus, type VehicleType } from '@/data/epwgData';
import { useApp } from '@/store/appStore';
import { vehicleStatusColor, vehicleStatusLabel } from './epwgHelpers';
import { toast } from '@/components/ui/Toast';

export function EpwgVehiclesPage() {
  const { t, locale } = useApp();
  const [rows, setRows] = useState<EpwgVehicle[]>(epwgVehicles);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);

  const facilityName = (id: string) => {
    const f = epwgFacilities.find((x) => x.id === id);
    return f ? (locale === 'ar' ? f.nameAr : f.nameFr) : id;
  };

  const filtered = useMemo(() => rows.filter((v) => {
    return (statusFilter === 'all' || v.status === statusFilter) &&
           (typeFilter === 'all' || v.type === typeFilter) &&
           (facilityFilter === 'all' || v.facilityId === facilityFilter);
  }), [rows, statusFilter, typeFilter, facilityFilter]);

  const stats = {
    total: rows.length,
    active: rows.filter((v) => v.status === 'active').length,
    maintenance: rows.filter((v) => v.status === 'maintenance').length,
    idle: rows.filter((v) => v.status === 'idle').length,
  };

  const filters: FilterConfig[] = [
    { key: 'status', label: t('epwgVehicleStatus'), type: 'select', value: statusFilter, onChange: setStatusFilter,
      options: (['active', 'maintenance', 'idle', 'broken'] as VehicleStatus[]).map((s) => ({ value: s, label: vehicleStatusLabel(s, locale) })) },
    { key: 'type', label: locale === 'ar' ? 'النوع' : 'Type', type: 'select', value: typeFilter, onChange: setTypeFilter,
      options: (['roll-off', 'tipper', 'hook-loader', 'sweeper', 'wheel-loader', 'water-tanker'] as VehicleType[]).map((ty) => ({ value: ty, label: ty })) },
    { key: 'facility', label: t('epwgFacilities'), type: 'select', value: facilityFilter, onChange: setFacilityFilter,
      options: epwgFacilities.map((f) => ({ value: f.id, label: locale === 'ar' ? f.nameAr : f.nameFr })) },
  ];

  const columns: EnterpriseColumn<EpwgVehicle>[] = [
    { key: 'plate', header: locale === 'ar' ? 'اللوحة' : 'Plate', sortable: true, searchable: true, pinned: 'left', width: 120,
      render: (v) => <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">{v.plate}</span> },
    { key: 'typeAr', header: locale === 'ar' ? 'النوع' : 'Type', sortable: true, width: 140,
      render: (v) => <span className="text-xs text-ink-500">{v.typeAr}</span> },
    { key: 'facilityId', header: t('epwgFacilities'), sortable: true, searchable: true, width: 160,
      render: (v) => <span className="text-xs">{facilityName(v.facilityId)}</span>,
      exportValue: (v) => facilityName(v.facilityId) },
    { key: 'capacityTons', header: locale === 'ar' ? 'الطاقة (طن)' : 'Capacity (t)', sortable: true, width: 120, align: 'left',
      render: (v) => <span className="text-sm font-semibold">{v.capacityTons || '—'}</span> },
    { key: 'status', header: t('epwgVehicleStatus'), sortable: true, width: 130,
      render: (v) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{ background: `${vehicleStatusColor[v.status]}20`, color: vehicleStatusColor[v.status] }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: vehicleStatusColor[v.status] }} />
          {vehicleStatusLabel(v.status, locale)}
        </span>
      ) },
    { key: 'driverAr', header: locale === 'ar' ? 'السائق' : 'Driver', sortable: true, searchable: true, width: 130,
      render: (v) => <span className="text-xs">{locale === 'ar' ? v.driverAr : v.driver}</span> },
    { key: 'odometer', header: locale === 'ar' ? 'العدّاد' : 'Odometer', sortable: true, width: 120, align: 'left',
      render: (v) => <span className="text-xs text-ink-500">{v.odometer.toLocaleString()} km</span> },
    { key: 'lastMaintenance', header: locale === 'ar' ? 'آخر صيانة' : 'Last Maint.', sortable: true, width: 120,
      render: (v) => <span className="text-xs text-ink-500">{v.lastMaintenance}</span> },
  ];

  const formFields: FormField[] = [
    { key: 'plate', label: locale === 'ar' ? 'اللوحة' : 'Plate', type: 'text', required: true },
    { key: 'type', label: locale === 'ar' ? 'النوع' : 'Type', type: 'select', required: true,
      options: (['roll-off', 'tipper', 'hook-loader', 'sweeper', 'wheel-loader', 'water-tanker'] as VehicleType[]).map((ty) => ({ value: ty, label: ty })) },
    { key: 'facilityId', label: t('epwgFacilities'), type: 'select', required: true,
      options: epwgFacilities.map((f) => ({ value: f.id, label: locale === 'ar' ? f.nameAr : f.nameFr })) },
    { key: 'capacityTons', label: locale === 'ar' ? 'الطاقة (طن)' : 'Capacity (tons)', type: 'number', min: 0 },
    { key: 'driver', label: locale === 'ar' ? 'السائق' : 'Driver', type: 'text' },
  ];

  const handleSubmit = (values: Record<string, any>) => {
    const newV: EpwgVehicle = {
      id: `EV-${Date.now().toString().slice(-3)}`,
      plate: values.plate,
      type: values.type, typeAr: values.type,
      facilityId: values.facilityId,
      capacityTons: values.capacityTons ?? 0,
      status: 'active',
      driver: values.driver ?? '—', driverAr: values.driver ?? '—',
      odometer: 0,
      lastMaintenance: new Date().toISOString().slice(0, 10),
    };
    setRows([newV, ...rows]);
    toast.success(locale === 'ar' ? 'تمت الإضافة' : 'Added', locale === 'ar' ? 'تمت إضافة المركبة' : 'Vehicle added');
    setFormOpen(false);
  };

  return (
    <div>
      <PageHeader title={t('epwgVehicles')} subtitle={`${rows.length} ${locale === 'ar' ? 'مركبة' : 'vehicles'}`} icon={<Truck className="w-5 h-5" />}
        actions={<>
          <button className="btn-outline"><Download className="w-4 h-4" /> {t('export')}</button>
          <button onClick={() => setFormOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> {t('add')}</button>
        </>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label={locale === 'ar' ? 'إجمالي المركبات' : 'Total Vehicles'} value={stats.total} icon={<Truck className="w-5 h-5" />} tone="brand" />
        <StatCard label={locale === 'ar' ? 'نشطة' : 'Active'} value={stats.active} icon={<Navigation className="w-5 h-5" />} tone="success" />
        <StatCard label={locale === 'ar' ? 'صيانة' : 'Maintenance'} value={stats.maintenance} icon={<Gauge className="w-5 h-5" />} tone="warning" />
        <StatCard label={locale === 'ar' ? 'خاملة' : 'Idle'} value={stats.idle} icon={<Truck className="w-5 h-5" />} tone="neutral" />
      </div>

      <EnterpriseDataTable columns={columns} rows={filtered} rowKey={(v) => v.id} filters={filters} pageSize={10} title={t('epwgVehicles')} onPrint={() => window.print()} />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={locale === 'ar' ? 'مركبة جديدة' : 'New Vehicle'} size="lg">
        <SmartForm fields={formFields} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Modal>
    </div>
  );
}
