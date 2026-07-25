import { Building2, Gauge, MapPin, Users, Plus, Download } from 'lucide-react';
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { SmartForm, type FormField } from '@/components/ui/SmartForm';
import { toast } from '@/components/ui/Toast';
import { cetCenters, KHENCHELA_CENTER, type CetCenter } from '@/data/mockData';
import { useApp } from '@/store/appStore';

const formFields: FormField[] = [
  { key: 'name', label: 'اسم المركز', type: 'text', required: true, placeholder: 'مركز الطرح التقني' },
  { key: 'city', label: 'المدينة', type: 'text', required: true },
  { key: 'capacityTpd', label: 'الطاقة الاستيعابية (طن/يوم)', type: 'number', required: true, min: 0, step: 10 },
  { key: 'currentLoadTpd', label: 'الحمل الحالي (طن/يوم)', type: 'number', min: 0, step: 10 },
  { key: 'status', label: 'الحالة', type: 'select', required: true, options: [
    { value: 'operational', label: 'تشغيلي' }, { value: 'near-capacity', label: 'قرب الامتلاء' }, { value: 'maintenance', label: 'صيانة' },
  ]},
  { key: 'manager', label: 'المدير', type: 'text' },
  { key: 'coords', label: 'الإحداثيات', type: 'gps', colSpan: 2 },
];

export function CetCentersPage() {
  const { t } = useApp();
  const [rows, setRows] = useState<CetCenter[]>(cetCenters);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CetCenter | null>(null);

  const totalCap = rows.reduce((s, c) => s + c.capacityTpd, 0);
  const totalLoad = rows.reduce((s, c) => s + c.currentLoadTpd, 0);

  const handleSubmit = (values: Record<string, any>) => {
    if (editing) {
      setRows(rows.map((c) => c.id === editing.id ? { ...c, ...values } : c));
      toast.success('تم التحديث', 'تم تحديث المركز بنجاح');
    } else {
      const newCenter: CetCenter = {
        id: `CET-${Date.now()}`,
        name: values.name, city: values.city,
        capacityTpd: values.capacityTpd ?? 0, currentLoadTpd: values.currentLoadTpd ?? 0,
        status: values.status ?? 'operational',
        lat: KHENCHELA_CENTER[0], lng: KHENCHELA_CENTER[1],
        manager: values.manager ?? '',
      };
      setRows([...rows, newCenter]);
      toast.success('تم الإنشاء', 'تم إنشاء المركز بنجاح');
    }
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title={t('cetCenters')} subtitle={`${rows.length} مركز طرح`}
        icon={<Building2 className="w-5 h-5" />}
        actions={<>
          <button className="btn-outline"><Download className="w-4 h-4" /> {t('export')}</button>
          <button onClick={() => { setEditing(null); setFormOpen(true); }} className="btn-primary"><Plus className="w-4 h-4" /> {t('add')}</button>
        </>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="إجمالي المراكز" value={rows.length} icon={<Building2 className="w-5 h-5" />} tone="brand" />
        <StatCard label="الطاقة الإجمالية" value={`${totalCap.toLocaleString()} ط/ي`} icon={<Gauge className="w-5 h-5" />} tone="success" />
        <StatCard label="الحمل الحالي" value={`${totalLoad.toLocaleString()} ط/ي`} icon={<Gauge className="w-5 h-5" />} tone="warning" />
        <StatCard label="نسبة الاستغلال" value={`${Math.round((totalLoad / totalCap) * 100)}%`} icon={<Gauge className="w-5 h-5" />} tone="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          {rows.map((c) => {
            const rate = Math.round((c.currentLoadTpd / c.capacityTpd) * 100);
            return (
              <Card key={c.id} hover>
                <CardBody>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl2 bg-gradient-to-br from-brand-500/10 to-success-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center ring-1 ring-brand-200/50 dark:ring-brand-600/20">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink-900 dark:text-white">{c.name}</p>
                        <p className="text-xs text-ink-500 dark:text-ink-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {c.city}</p>
                      </div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center p-2 rounded-lg bg-ink-50 dark:bg-ink-800/40">
                      <p className="text-xs text-ink-400">الطاقة</p>
                      <p className="text-sm font-bold text-ink-800 dark:text-ink-100">{c.capacityTpd}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-ink-50 dark:bg-ink-800/40">
                      <p className="text-xs text-ink-400">الحمل</p>
                      <p className="text-sm font-bold text-ink-800 dark:text-ink-100">{c.currentLoadTpd}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-ink-50 dark:bg-ink-800/40">
                      <p className="text-xs text-ink-400">المدير</p>
                      <p className="text-sm font-bold text-ink-800 dark:text-ink-100">{c.manager}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-ink-500 dark:text-ink-400">نسبة الاستغلال</span>
                      <span className="font-semibold text-ink-700 dark:text-ink-200">{rate}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${rate}%`, background: rate > 90 ? '#EF4444' : rate > 70 ? '#F59E0B' : '#10B981' }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-ink-100 dark:border-ink-800/60">
                    <button onClick={() => { setEditing(c); setFormOpen(true); }} className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">{t('edit')}</button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        <Card>
          <div className="h-[480px] rounded-xl overflow-hidden border border-ink-200 dark:border-ink-800">
            <MapContainer center={KHENCHELA_CENTER} zoom={9} className="w-full h-full" zoomControl={false} attributionControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {rows.map((c) => (
                <Marker key={c.id} position={[c.lat, c.lng]}>
                  <Popup><div className="text-right"><p className="font-bold text-sm">{c.name}</p><p className="text-xs">{c.currentLoadTpd}/{c.capacityTpd} طن/يوم</p></div></Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </Card>
      </div>

      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        title={editing ? `${t('edit')} مركز طرح` : `${t('add')} مركز طرح`}
        size="lg"
      >
        <SmartForm
          fields={formFields}
          initialValues={editing ?? {}}
          onSubmit={handleSubmit}
          onCancel={() => { setFormOpen(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}
