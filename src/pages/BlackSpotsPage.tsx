import { useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, Camera, MessageSquare, Eye } from 'lucide-react';
import { CrudManager, type CrudConfig } from '@/components/ui/CrudManager';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/Modal';
import { blackSpots, municipalities, type BlackSpot } from '@/data/mockData';
import { useApp } from '@/store/appStore';

export function BlackSpotsPage() {
  const { t } = useApp();
  const navigate = useNavigate();

  const config: CrudConfig<BlackSpot> = {
    entityName: 'نقطة سوداء',
    entityNamePlural: t('blackSpots'),
    icon: <AlertTriangle className="w-5 h-5" />,
    rowKey: (r) => r.id,
    onRowClick: (r) => navigate(`/black-spots/${r.id}`),
    columns: [
      { key: 'code', header: 'الرمز', sortable: true, searchable: true, render: (r) => <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">{r.code}</span> },
      { key: 'titleAr', header: 'النوع', sortable: true, searchable: true, render: (r) => <span className="font-medium text-ink-800 dark:text-ink-100">{r.titleAr}</span> },
      { key: 'municipality', header: t('municipality'), sortable: true, searchable: true, render: (r) => <span className="text-ink-600 dark:text-ink-300">{r.municipality}</span> },
      { key: 'address', header: t('address'), searchable: true, render: (r) => <span className="text-ink-500 dark:text-ink-400 text-xs">{r.address}</span> },
      { key: 'priority', header: t('priority'), sortable: true, render: (r) => <PriorityBadge priority={r.priority} /> },
      { key: 'status', header: t('status'), sortable: true, render: (r) => <StatusBadge status={r.status} /> },
      { key: 'reportedAt', header: t('date'), sortable: true, render: (r) => <span className="text-xs text-ink-500">{new Date(r.reportedAt).toLocaleDateString('ar-DZ')}</span> },
      {
        key: 'actions', header: t('actions'), pinned: 'right',
        render: (r) => (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => navigate(`/black-spots/${r.id}`)} className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-600/10 transition" title="عرض"><MapPin className="w-4 h-4" /></button>
          </div>
        ),
      },
    ],
    formFields: [
      { key: 'code', label: 'الرمز', type: 'text', required: true, placeholder: 'BS-XXXX' },
      { key: 'titleAr', label: 'النوع', type: 'select', required: true, options: [
        { value: 'تراكم النفايات', label: 'تراكم النفايات' },
        { value: 'حاوية مكسورة', label: 'حاوية مكسورة' },
        { value: 'تفريغ غير قانوني', label: 'تفريغ غير قانوني' },
        { value: 'انسداد مجاري', label: 'انسداد مجاري' },
        { value: 'حطام بناء', label: 'حطام بناء' },
        { value: 'رمي عشوائي', label: 'رمي عشوائي' },
      ]},
      { key: 'municipalityId', label: t('municipality'), type: 'select', required: true, options: municipalities.map((m) => ({ value: m.id, label: m.nameAr })) },
      { key: 'neighborhood', label: 'الحي', type: 'text' },
      { key: 'address', label: t('address'), type: 'text', colSpan: 2 },
      { key: 'priority', label: t('priority'), type: 'select', required: true, options: [
        { value: 'critical', label: 'حرج' }, { value: 'high', label: 'عالي' },
        { value: 'medium', label: 'متوسط' }, { value: 'low', label: 'منخفض' },
      ]},
      { key: 'status', label: t('status'), type: 'select', required: true, options: [
        { value: 'open', label: 'مفتوح' }, { value: 'inProgress', label: 'قيد التنفيذ' },
        { value: 'resolved', label: 'تم الحل' }, { value: 'closed', label: 'مغلق' },
      ]},
      { key: 'reportedAt', label: 'تاريخ البلاغ', type: 'date' },
      { key: 'description', label: 'الوصف', type: 'textarea', colSpan: 2 },
      { key: 'coords', label: 'الإحداثيات', type: 'gps', colSpan: 2, helpText: 'حدد موقع النقطة السوداء على الخريطة' },
    ],
    filters: [
      { key: 'status', label: t('status'), type: 'select', value: 'all', onChange: () => {}, options: [
        { value: 'open', label: 'مفتوح' }, { value: 'inProgress', label: 'قيد التنفيذ' },
        { value: 'resolved', label: 'تم الحل' }, { value: 'closed', label: 'مغلق' },
      ]},
      { key: 'priority', label: t('priority'), type: 'select', value: 'all', onChange: () => {}, options: [
        { value: 'critical', label: 'حرج' }, { value: 'high', label: 'عالي' },
        { value: 'medium', label: 'متوسط' }, { value: 'low', label: 'منخفض' },
      ]},
      { key: 'municipality', label: t('municipality'), type: 'select', value: 'all', onChange: () => {}, options: municipalities.map((m) => ({ value: m.id, label: m.nameAr })) },
    ],
    quickView: (r) => (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="aspect-video rounded-xl overflow-hidden bg-ink-100 dark:bg-ink-800">
            <img src={r.photo} alt={r.titleAr} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><p className="text-xs text-ink-400">{t('municipality')}</p><p className="font-medium">{r.municipality}</p></div>
              <div><p className="text-xs text-ink-400">{t('priority')}</p><PriorityBadge priority={r.priority} /></div>
              <div><p className="text-xs text-ink-400">{t('status')}</p><StatusBadge status={r.status} /></div>
              <div><p className="text-xs text-ink-400">{t('date')}</p><p className="font-medium text-xs">{new Date(r.reportedAt).toLocaleDateString('ar-DZ')}</p></div>
            </div>
            <div>
              <p className="text-xs text-ink-400 mb-1">{t('address')}</p>
              <p className="text-sm flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-brand-500" /> {r.address}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-500">
              <span className="flex items-center gap-1"><Camera className="w-3.5 h-3.5" /> {r.inspections} تفتيش</span>
              <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> 3 تعليقات</span>
            </div>
          </div>
        </div>
      </div>
    ),
    stats: (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label={t('blackSpots')} value={blackSpots.length} icon={<AlertTriangle className="w-5 h-5" />} tone="brand" />
        <StatCard label="مفتوحة" value={blackSpots.filter((b) => b.status === 'open').length} icon={<AlertTriangle className="w-5 h-5" />} tone="danger" />
        <StatCard label="قيد التنفيذ" value={blackSpots.filter((b) => b.status === 'inProgress').length} icon={<AlertTriangle className="w-5 h-5" />} tone="warning" />
        <StatCard label="تم الحل" value={blackSpots.filter((b) => b.status === 'resolved').length} icon={<AlertTriangle className="w-5 h-5" />} tone="success" />
      </div>
    ),
  };

  return <CrudManager config={config} data={blackSpots} />;
}
