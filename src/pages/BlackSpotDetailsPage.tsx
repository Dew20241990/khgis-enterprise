import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import {
  ArrowRight, MapPin, Calendar, User, AlertTriangle, Camera, FileText, MessageSquare,
  History, Image as ImageIcon, Paperclip, CheckCircle2, Clock, Navigation, Phone, Download,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { blackSpots } from '@/data/mockData';
import { useApp } from '@/store/appStore';
import { cn } from '@/lib/cn';

interface TimelineEntry { date: string; title: string; desc: string; icon: 'report' | 'inspect' | 'assign' | 'resolve' }

const timeline: TimelineEntry[] = [
  { date: '2026-07-21 09:15', title: 'تفتيش ميداني', desc: 'تم رصد الموقع وتوثيق الحالة بالصور من قبل المفتش س. بن عمر.', icon: 'inspect' },
  { date: '2026-07-20 14:30', title: 'إسناد المهمة', desc: 'تم إسناد المعالجة لورشة النظافة بالحي.', icon: 'assign' },
  { date: '2026-07-18 11:00', title: 'بلاغ جديد', desc: 'بلاغ من مواطن عبر التطبيق حول تراكم النفايات.', icon: 'report' },
];

const comments = [
  { user: 'س. بن عمر', role: 'مفتش', time: 'قبل ساعتين', text: 'الوضع يتطلب تدخلاً عاجلاً، الحاويات ممتلئة والنفايات تتجاوزها.' },
  { user: 'م. خليفي', role: 'رئيس ورشة', time: 'قبل 4 ساعات', text: 'تم برمجة جولة تفريغ غداً صباحاً مع إضافة حاويتين إضافيتين.' },
];

export function BlackSpotDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useApp();
  const spot = blackSpots.find((s) => s.id === id) ?? blackSpots[0];
  const [tab, setTab] = useState<'timeline' | 'photos' | 'documents' | 'comments'>('timeline');

  const tabs = [
    { key: 'timeline' as const, label: t('timeline'), icon: <History className="w-4 h-4" /> },
    { key: 'photos' as const, label: t('photos'), icon: <ImageIcon className="w-4 h-4" /> },
    { key: 'documents' as const, label: t('documents'), icon: <FileText className="w-4 h-4" /> },
    { key: 'comments' as const, label: t('comments'), icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const iconMap = {
    report: <AlertTriangle className="w-4 h-4 text-danger-500" />,
    inspect: <Camera className="w-4 h-4 text-brand-500" />,
    assign: <User className="w-4 h-4 text-warning-500" />,
    resolve: <CheckCircle2 className="w-4 h-4 text-success-500" />,
  };

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <button onClick={() => navigate('/black-spots')} className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600 dark:hover:text-brand-400 transition">
        <ArrowRight className="w-4 h-4" /> العودة للقائمة
      </button>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl2 bg-gradient-to-br from-danger-500/15 to-warning-500/15 text-danger-600 dark:text-danger-400 flex items-center justify-center ring-1 ring-danger-200/50 dark:ring-danger-600/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-ink-900 dark:text-white">{spot.code}</h1>
              <PriorityBadge priority={spot.priority} />
              <StatusBadge status={spot.status} />
            </div>
            <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">{spot.titleAr} — {spot.address}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline"><Download className="w-4 h-4" /> تصدير</button>
          <button className="btn-primary"><CheckCircle2 className="w-4 h-4" /> تحديد كمحلول</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: photos + map */}
        <div className="lg:col-span-2 space-y-5">
          {/* Before / After */}
          <Card>
            <CardHeader title="صور قبل / بعد" subtitle="مقارنة الحالة قبل وبعد المعالجة" icon={<Camera className="w-4 h-4" />} />
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="chip bg-danger-50 text-danger-600 dark:bg-danger-600/15 dark:text-danger-300 mb-2 inline-flex">{t('before')}</span>
                  <div className="aspect-video rounded-xl overflow-hidden bg-ink-100 dark:bg-ink-800 group relative">
                    <img src={spot.beforePhoto} alt="قبل" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                </div>
                <div>
                  <span className="chip bg-success-50 text-success-600 dark:bg-success-600/15 dark:text-success-300 mb-2 inline-flex">{t('after')}</span>
                  <div className="aspect-video rounded-xl overflow-hidden bg-ink-100 dark:bg-ink-800 group relative">
                    {spot.afterPhoto ? (
                      <img src={spot.afterPhoto} alt="بعد" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-ink-400 gap-2">
                        <Clock className="w-8 h-8" />
                        <p className="text-xs">بانتظار المعالجة</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Tabs */}
          <Card>
            <div className="flex items-center gap-1 px-4 pt-3 border-b border-ink-200/70 dark:border-ink-800/70 overflow-x-auto">
              {tabs.map((tb) => (
                <button key={tb.key} onClick={() => setTab(tb.key)}
                  className={cn('flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition whitespace-nowrap',
                    tab === tb.key ? 'border-brand-600 text-brand-700 dark:text-brand-300' : 'border-transparent text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-200')}>
                  {tb.icon}{tb.label}
                </button>
              ))}
            </div>
            <CardBody className="pt-4">
              {tab === 'timeline' && (
                <div className="relative pr-6">
                  <div className="absolute top-2 bottom-2 right-2.5 w-px bg-ink-200 dark:bg-ink-800" />
                  <div className="space-y-5">
                    {timeline.map((e, i) => (
                      <div key={i} className="relative flex gap-4">
                        <div className="absolute right-0 w-5 h-5 rounded-full bg-white dark:bg-ink-900 ring-2 ring-ink-200 dark:ring-ink-700 flex items-center justify-center">
                          <span className="scale-50">{iconMap[e.icon]}</span>
                        </div>
                        <div className="mr-8 flex-1">
                          <p className="text-xs text-ink-400">{e.date}</p>
                          <p className="text-sm font-semibold text-ink-800 dark:text-ink-100 mt-0.5">{e.title}</p>
                          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">{e.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {tab === 'photos' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-ink-100 dark:bg-ink-800 group">
                      <img src={`${spot.photo}?r=${i}`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition duration-300" loading="lazy" />
                    </div>
                  ))}
                </div>
              )}
              {tab === 'documents' && (
                <div className="space-y-2">
                  {['تقرير التفتيش.pdf', 'صور الموقع.zip', 'محضر المعالجة.docx', 'فاتورة التدخل.pdf'].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-ink-200 dark:border-ink-800 hover:bg-ink-50 dark:hover:bg-ink-800/40 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-600/15 text-brand-600 dark:text-brand-300 flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                        <span className="text-sm font-medium text-ink-800 dark:text-ink-100">{doc}</span>
                      </div>
                      <button className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"><Download className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}
              {tab === 'comments' && (
                <div className="space-y-3">
                  {comments.map((c, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl bg-ink-50 dark:bg-ink-800/40">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-success-500 text-white text-xs font-bold flex items-center justify-center shrink-0">{c.user[0]}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-ink-800 dark:text-ink-100">{c.user}</span>
                          <span className="chip bg-ink-100 dark:bg-ink-700 text-ink-500 dark:text-ink-300 text-[10px]">{c.role}</span>
                          <span className="text-xs text-ink-400 mr-auto">{c.time}</span>
                        </div>
                        <p className="text-sm text-ink-600 dark:text-ink-300 mt-1">{c.text}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <input className="input flex-1" placeholder="أضف تعليقاً..." />
                    <button className="btn-primary">{t('send')}</button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right: info + map */}
        <div className="space-y-5">
          <Card>
            <CardHeader title={t('details')} icon={<FileText className="w-4 h-4" />} />
            <CardBody className="space-y-3">
              {[
                { label: t('location'), value: spot.address, icon: <MapPin className="w-4 h-4 text-brand-500" /> },
                { label: t('municipality'), value: spot.municipality, icon: <MapPin className="w-4 h-4 text-warning-500" /> },
                { label: t('responsible'), value: spot.responsible, icon: <User className="w-4 h-4 text-success-500" /> },
                { label: 'تاريخ البلاغ', value: new Date(spot.reportedAt).toLocaleDateString('ar-DZ'), icon: <Calendar className="w-4 h-4 text-brand-500" /> },
                { label: 'عدد التفتيشات', value: `${spot.inspections}`, icon: <Camera className="w-4 h-4 text-danger-500" /> },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-ink-100 dark:border-ink-800/60 last:border-0">
                  <span className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400">{row.icon}{row.label}</span>
                  <span className="text-sm font-medium text-ink-800 dark:text-ink-100">{row.value}</span>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="الموقع على الخريطة" icon={<Navigation className="w-4 h-4" />} />
            <CardBody>
              <div className="h-56 rounded-xl overflow-hidden border border-ink-200 dark:border-ink-800">
                <MapContainer center={[spot.lat, spot.lng]} zoom={15} className="w-full h-full" zoomControl={false} attributionControl={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <CircleMarker center={[spot.lat, spot.lng]} radius={10} pathOptions={{ color: '#EF4444', fillOpacity: 0.6, weight: 2 }}>
                    <Popup><div className="text-right"><p className="font-bold text-sm">{spot.code}</p><p className="text-xs">{spot.titleAr}</p></div></Popup>
                  </CircleMarker>
                </MapContainer>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-ink-500 dark:text-ink-400">
                <span className="font-mono">{spot.lat.toFixed(5)}, {spot.lng.toFixed(5)}</span>
                <button className="flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline"><Navigation className="w-3.5 h-3.5" /> الاتجاهات</button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="ملاحظات التفتيش" icon={<FileText className="w-4 h-4" />} />
            <CardBody>
              <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed">{spot.description}</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
