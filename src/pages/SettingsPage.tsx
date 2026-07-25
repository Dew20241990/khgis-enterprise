import { useState } from 'react';
import {
  Settings, User, Bell, Globe, Moon, Sun, Shield, Database, Palette, Building2,
  MapPin, Save, Check,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useApp } from '@/store/appStore';
import type { Locale } from '@/i18n/translations';
import { cn } from '@/lib/cn';

type Tab = 'profile' | 'appearance' | 'notifications' | 'language' | 'security' | 'organization' | 'integrations';

export function SettingsPage() {
  const { t, theme, setTheme, locale, setLocale } = useApp();
  const [tab, setTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile', label: t('profile'), icon: <User className="w-4 h-4" /> },
    { key: 'appearance', label: 'المظهر', icon: <Palette className="w-4 h-4" /> },
    { key: 'notifications', label: t('notifications'), icon: <Bell className="w-4 h-4" /> },
    { key: 'language', label: t('language'), icon: <Globe className="w-4 h-4" /> },
    { key: 'security', label: 'الأمان', icon: <Shield className="w-4 h-4" /> },
    { key: 'organization', label: t('municipality'), icon: <Building2 className="w-4 h-4" /> },
    { key: 'integrations', label: 'التكاملات', icon: <Database className="w-4 h-4" /> },
  ];

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div>
      <PageHeader
        title={t('settings')} subtitle="إدارة إعدادات النظام والحساب"
        icon={<Settings className="w-5 h-5" />}
        actions={<button onClick={save} className="btn-primary">{saved ? <><Check className="w-4 h-4" /> تم الحفظ</> : <><Save className="w-4 h-4" /> {t('save')}</>}</button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Tabs sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <CardBody className="p-2">
            {tabs.map((tb) => (
              <button key={tb.key} onClick={() => setTab(tb.key)}
                className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition',
                  tab === tb.key ? 'bg-brand-50 dark:bg-brand-600/15 text-brand-700 dark:text-brand-300' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800')}>
                {tb.icon} {tb.label}
              </button>
            ))}
          </CardBody>
        </Card>

        {/* Content */}
        <Card className="lg:col-span-3">
          <CardBody className="p-6">
            {tab === 'profile' && (
              <div className="space-y-5 max-w-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-success-500 text-white text-2xl font-bold flex items-center justify-center">س</div>
                  <div>
                    <button className="btn-outline text-sm">تغيير الصورة</button>
                    <p className="text-xs text-ink-400 mt-1.5">JPG, PNG. حد أقصى 2MB</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-xs font-medium text-ink-500 dark:text-ink-400 mb-1.5 block">الاسم الكامل</label><input className="input" defaultValue="سفيان بن عمر" /></div>
                  <div><label className="text-xs font-medium text-ink-500 dark:text-ink-400 mb-1.5 block">المنصب</label><input className="input" defaultValue="مدير النظافة" /></div>
                  <div><label className="text-xs font-medium text-ink-500 dark:text-ink-400 mb-1.5 block">{t('email')}</label><input className="input" dir="ltr" defaultValue="s.benomar@khenchela.dz" /></div>
                  <div><label className="text-xs font-medium text-ink-500 dark:text-ink-400 mb-1.5 block">{t('phone')}</label><input className="input" dir="ltr" defaultValue="0550 12 34 56" /></div>
                </div>
              </div>
            )}

            {tab === 'appearance' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="text-sm font-semibold text-ink-800 dark:text-ink-100 mb-3 block">السمة</label>
                  <div className="grid grid-cols-2 gap-3">
                    {([['light', <Sun className="w-5 h-5" />, t('lightMode')], ['dark', <Moon className="w-5 h-5" />, t('darkMode')]] as const).map(([val, icon, label]) => (
                      <button key={val} onClick={() => setTheme(val as 'light' | 'dark')}
                        className={cn('flex items-center gap-3 p-4 rounded-xl2 border-2 transition', theme === val ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-600/10' : 'border-ink-200 dark:border-ink-700 hover:border-brand-300')}>
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', theme === val ? 'bg-brand-600 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-500')}>{icon}</div>
                        <span className="text-sm font-medium text-ink-800 dark:text-ink-100">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-ink-800 dark:text-ink-100 mb-3 block">اللون الأساسي</label>
                  <div className="flex gap-2">
                    {['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#0EA5E9'].map(c => (
                      <button key={c} className={cn('w-10 h-10 rounded-xl ring-2 ring-offset-2 dark:ring-offset-ink-900 transition', c === '#2563EB' ? 'ring-brand-500' : 'ring-transparent hover:ring-ink-300')} style={{ background: c }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'notifications' && (
              <div className="space-y-4 max-w-2xl">
                {[
                  { title: 'تنبيهات النقاط الحرجة', desc: 'إشعار فوري عند رصد نقطة سوداء حرجة', on: true },
                  { title: 'حاويات ممتلئة', desc: 'إشعار عند تجاوز امتلاء حاوية 90%', on: true },
                  { title: 'تقارير دورية', desc: 'ملخص أسبوعي للأداء', on: true },
                  { title: 'صيانة المركبات', desc: 'إشعار عند دخول مركبة في الصيانة', on: false },
                  { title: 'تذكيرات الجولات', desc: 'تذكير قبل موعد الجولة المخططة', on: true },
                ].map((n, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-ink-200 dark:border-ink-800">
                    <div>
                      <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{n.title}</p>
                      <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{n.desc}</p>
                    </div>
                    <Toggle defaultOn={n.on} />
                  </div>
                ))}
              </div>
            )}

            {tab === 'language' && (
              <div className="space-y-3 max-w-md">
                <label className="text-sm font-semibold text-ink-800 dark:text-ink-100 mb-2 block">{t('language')}</label>
                {([['ar', 'العربية', '🇩🇿'], ['fr', 'Français', '🇫🇷'], ['en', 'English', '🇬🇧']] as const).map(([code, label, flag]) => (
                  <button key={code} onClick={() => setLocale(code as Locale)}
                    className={cn('w-full flex items-center gap-3 p-4 rounded-xl2 border-2 transition', locale === code ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-600/10' : 'border-ink-200 dark:border-ink-700 hover:border-brand-300')}>
                    <span className="text-2xl">{flag}</span>
                    <span className="text-sm font-medium text-ink-800 dark:text-ink-100 flex-1 text-right">{label}</span>
                    {locale === code && <Check className="w-5 h-5 text-brand-600" />}
                  </button>
                ))}
              </div>
            )}

            {tab === 'security' && (
              <div className="space-y-4 max-w-md">
                <div><label className="text-xs font-medium text-ink-500 mb-1.5 block">كلمة المرور الحالية</label><input type="password" className="input" defaultValue="********" /></div>
                <div><label className="text-xs font-medium text-ink-500 mb-1.5 block">كلمة المرور الجديدة</label><input type="password" className="input" placeholder="••••••••" /></div>
                <div><label className="text-xs font-medium text-ink-500 mb-1.5 block">تأكيد كلمة المرور</label><input type="password" className="input" placeholder="••••••••" /></div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-ink-200 dark:border-ink-800 mt-4">
                  <div><p className="text-sm font-medium text-ink-800 dark:text-ink-100">المصادقة الثنائية</p><p className="text-xs text-ink-500 mt-0.5">طبقة أمان إضافية لحسابك</p></div>
                  <Toggle defaultOn={false} />
                </div>
              </div>
            )}

            {tab === 'organization' && (
              <div className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-xs font-medium text-ink-500 mb-1.5 block">اسم البلدية</label><input className="input" defaultValue="بلدية خنشلة" /></div>
                  <div><label className="text-xs font-medium text-ink-500 mb-1.5 block">رمز البلدية</label><input className="input" defaultValue="4001" /></div>
                  <div><label className="text-xs font-medium text-ink-500 mb-1.5 block">الولاية</label><input className="input" defaultValue="خنشلة" /></div>
                  <div><label className="text-xs font-medium text-ink-500 mb-1.5 block">عدد السكان</label><input className="input" defaultValue="118,000" /></div>
                  <div className="sm:col-span-2"><label className="text-xs font-medium text-ink-500 mb-1.5 block">{t('address')}</label><input className="input" defaultValue="1 شارع 1 نوفمبر، خنشلة" /></div>
                </div>
              </div>
            )}

            {tab === 'integrations' && (
              <div className="space-y-3 max-w-2xl">
                {[
                  { name: 'نظام GIS', desc: 'تكامل مع ArcGIS / QGIS', on: true, icon: <MapPin className="w-5 h-5" /> },
                  { name: 'بوابة الدفع', desc: 'حسابات المحلات التجارية', on: false, icon: <Building2 className="w-5 h-5" /> },
                  { name: 'تطبيق المواطن', desc: 'بلاغات مباشرة من المواطنين', on: true, icon: <Bell className="w-5 h-5" /> },
                  { name: 'خدمة الرسائل SMS', desc: 'إشعارات SMS للسائقين والمفتشين', on: true, icon: <Bell className="w-5 h-5" /> },
                ].map((it, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-ink-200 dark:border-ink-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-600/15 text-brand-600 dark:text-brand-300 flex items-center justify-center">{it.icon}</div>
                      <div><p className="text-sm font-medium text-ink-800 dark:text-ink-100">{it.name}</p><p className="text-xs text-ink-500 mt-0.5">{it.desc}</p></div>
                    </div>
                    <Toggle defaultOn={it.on} />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Toggle({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} className={cn('w-11 h-6 rounded-full transition relative shrink-0', on ? 'bg-brand-600' : 'bg-ink-200 dark:bg-ink-700')}>
      <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-soft transition-all', on ? 'left-0.5' : 'left-5')} />
    </button>
  );
}
