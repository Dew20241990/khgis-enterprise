import { useState } from 'react';
import {
  Settings, User, Bell, Globe, Moon, Sun, Shield, Database, Palette, Building2,
  MapPin, Check, CreditCard, MessageSquare, Truck,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Notice } from '@/components/ui/Notice';
import { useApp } from '@/store/appStore';
import { municipalities } from '@/data/mockData';
import { URGENT_FILL_PERCENT } from '@/lib/assistantEngine';
import { formatNumber } from '@/lib/format';
import { isSupabaseConfigured, isTelemetryConfigured } from '@/lib/integrations';
import { localizedName, pickByLocale } from '@/lib/localized';
import type { Locale, TranslationKey } from '@/i18n/translations';
import { cn } from '@/lib/cn';

/**
 * Settings for the demo build. Only what actually works is interactive: the theme and the language (both applied
 * immediately and remembered by the browser). Everything else is shown read-only or with its real status, because
 * this build has no server: nothing else can be saved, sent or connected, and the page must not pretend otherwise.
 */
type Tab = 'profile' | 'appearance' | 'notifications' | 'language' | 'security' | 'organization' | 'integrations';

const LANGUAGES = [
  { code: 'ar', name: 'العربية', flag: '🇩🇿' }, // i18n-ignore: a language is always shown by its own name
  { code: 'fr', name: 'Français', flag: '🇫🇷' }, // i18n-ignore: a language is always shown by its own name
  { code: 'en', name: 'English', flag: '🇬🇧' }, // i18n-ignore: a language is always shown by its own name
] as const satisfies readonly { code: Locale; name: string; flag: string }[];

const NOTIFICATION_ROWS = [
  { id: 'critical', title: 'settings.notifications.critical.title', desc: 'settings.notifications.critical.desc' },
  { id: 'fullContainers', title: 'settings.notifications.fullContainers.title', desc: 'settings.notifications.fullContainers.desc' },
  { id: 'weekly', title: 'settings.notifications.weekly.title', desc: 'settings.notifications.weekly.desc' },
  { id: 'maintenance', title: 'settings.notifications.maintenance.title', desc: 'settings.notifications.maintenance.desc' },
  { id: 'rounds', title: 'settings.notifications.rounds.title', desc: 'settings.notifications.rounds.desc' },
] as const satisfies readonly { id: string; title: TranslationKey; desc: TranslationKey }[];

type IntegrationStatus = 'notImplemented' | 'configured' | 'notConfigured';
const STATUS_LABEL: Record<IntegrationStatus, TranslationKey> = {
  notImplemented: 'settings.int.status.notImplemented',
  configured: 'settings.int.status.configured',
  notConfigured: 'settings.int.status.notConfigured',
};
const STATUS_TONE: Record<IntegrationStatus, BadgeTone> = { notImplemented: 'neutral', configured: 'info', notConfigured: 'neutral' };

function Field({ id, label, value, dir }: { id: string; label: string; value: string; dir?: 'ltr' }) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-ink-500 dark:text-ink-400 mb-1.5 block">{label}</label>
      <input id={id} className="input" readOnly value={value} dir={dir} />
    </div>
  );
}

function Row({ icon, title, desc, status }: { icon?: React.ReactNode; title: string; desc: string; status: { label: string; tone: BadgeTone } }) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 rounded-xl border border-ink-200 dark:border-ink-800">
      <div className="flex items-center gap-3 min-w-0">
        {icon && <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-600/15 text-brand-600 dark:text-brand-300 flex items-center justify-center shrink-0">{icon}</div>}
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{title}</p>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{desc}</p>
        </div>
      </div>
      <Badge tone={status.tone} className="shrink-0">{status.label}</Badge>
    </div>
  );
}

export function SettingsPage() {
  const { t, theme, setTheme, locale, setLocale, user } = useApp();
  const [tab, setTab] = useState<Tab>('profile');

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile', label: t('profile'), icon: <User className="w-4 h-4" /> },
    { key: 'appearance', label: t('settings.tab.appearance'), icon: <Palette className="w-4 h-4" /> },
    { key: 'notifications', label: t('notifications'), icon: <Bell className="w-4 h-4" /> },
    { key: 'language', label: t('language'), icon: <Globe className="w-4 h-4" /> },
    { key: 'security', label: t('settings.tab.security'), icon: <Shield className="w-4 h-4" /> },
    { key: 'organization', label: t('municipality'), icon: <Building2 className="w-4 h-4" /> },
    { key: 'integrations', label: t('settings.tab.integrations'), icon: <Database className="w-4 h-4" /> },
  ];

  const displayName = localizedName(locale, user);
  const roleLabel = user ? pickByLocale(locale, { ar: user.roleLabelAr, fr: user.roleLabelFr, en: user.roleLabel }) : '';
  const department = user ? pickByLocale(locale, { ar: user.departmentAr, fr: user.department, en: user.department }) : '';
  const capital = municipalities[0];

  const integrations: { id: string; icon: React.ReactNode; name: TranslationKey; desc: TranslationKey; status: IntegrationStatus }[] = [
    { id: 'gis', icon: <MapPin className="w-5 h-5" />, name: 'settings.int.gis.name', desc: 'settings.int.gis.desc', status: 'notImplemented' },
    { id: 'payment', icon: <CreditCard className="w-5 h-5" />, name: 'settings.int.payment.name', desc: 'settings.int.payment.desc', status: 'notImplemented' },
    { id: 'citizen', icon: <Bell className="w-5 h-5" />, name: 'settings.int.citizen.name', desc: 'settings.int.citizen.desc', status: 'notImplemented' },
    { id: 'sms', icon: <MessageSquare className="w-5 h-5" />, name: 'settings.int.sms.name', desc: 'settings.int.sms.desc', status: 'notImplemented' },
    { id: 'supabase', icon: <Database className="w-5 h-5" />, name: 'settings.int.supabase.name', desc: 'settings.int.supabase.desc', status: isSupabaseConfigured() ? 'configured' : 'notConfigured' },
    { id: 'telemetry', icon: <Truck className="w-5 h-5" />, name: 'settings.int.telemetry.name', desc: 'settings.int.telemetry.desc', status: isTelemetryConfigured() ? 'configured' : 'notConfigured' },
  ];

  return (
    <div>
      <PageHeader title={t('settings')} subtitle={t('settings.subtitle')} icon={<Settings className="w-5 h-5" />} />

      <Notice title={t('settings.demo.title')} className="mb-5">{t('settings.demo.body')}</Notice>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Tabs sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <CardBody className="p-2">
            {tabs.map((tb) => (
              <button key={tb.key} type="button" onClick={() => setTab(tb.key)} aria-current={tab === tb.key ? 'page' : undefined}
                className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-start',
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
                <p className="text-sm text-ink-500 dark:text-ink-400">{t('settings.profile.note')}</p>
                <div className="flex items-center gap-4">
                  <div className={cn('w-20 h-20 rounded-2xl bg-gradient-to-br text-white text-2xl font-bold flex items-center justify-center', user?.avatarColor ?? 'from-brand-500 to-success-500')}>{user?.initials ?? '?'}</div>
                  <div>
                    <p className="text-base font-semibold text-ink-900 dark:text-white">{displayName}</p>
                    <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{roleLabel}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field id="settings-name" label={t('settings.profile.fullName')} value={displayName} />
                  <Field id="settings-role" label={t('settings.profile.role')} value={roleLabel} />
                  <Field id="settings-username" label={t('username')} value={user?.username ?? ''} dir="ltr" />
                  <Field id="settings-email" label={t('email')} value={user?.email ?? ''} dir="ltr" />
                  <Field id="settings-department" label={t('settings.profile.department')} value={department} />
                  <Field id="settings-permissions" label={t('settings.profile.permissions')} value={formatNumber(locale, user?.permissions.length ?? 0)} dir="ltr" />
                </div>
              </div>
            )}

            {tab === 'appearance' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <p className="text-sm font-semibold text-ink-800 dark:text-ink-100 mb-3">{t('settings.appearance.theme')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {([['light', <Sun key="sun" className="w-5 h-5" />, t('lightMode')], ['dark', <Moon key="moon" className="w-5 h-5" />, t('darkMode')]] as const).map(([val, icon, label]) => (
                      <button key={val} type="button" onClick={() => setTheme(val)} aria-pressed={theme === val}
                        className={cn('flex items-center gap-3 p-4 rounded-xl2 border-2 transition', theme === val ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-600/10' : 'border-ink-200 dark:border-ink-700 hover:border-brand-300')}>
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', theme === val ? 'bg-brand-600 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-500')}>{icon}</div>
                        <span className="text-sm font-medium text-ink-800 dark:text-ink-100">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'notifications' && (
              <div className="space-y-4 max-w-2xl">
                <Notice tone="warning">{t('settings.notifications.notice')}</Notice>
                {NOTIFICATION_ROWS.map((n) => (
                  <Row key={n.id} title={t(n.title)} desc={t(n.desc, { threshold: URGENT_FILL_PERCENT })}
                    status={{ label: t(STATUS_LABEL.notImplemented), tone: STATUS_TONE.notImplemented }} />
                ))}
              </div>
            )}

            {tab === 'language' && (
              <div className="space-y-3 max-w-md">
                <p className="text-sm font-semibold text-ink-800 dark:text-ink-100 mb-2">{t('language')}</p>
                {LANGUAGES.map(({ code, name, flag }) => (
                  <button key={code} type="button" onClick={() => setLocale(code)} aria-pressed={locale === code}
                    className={cn('w-full flex items-center gap-3 p-4 rounded-xl2 border-2 transition', locale === code ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-600/10' : 'border-ink-200 dark:border-ink-700 hover:border-brand-300')}>
                    <span className="text-2xl">{flag}</span>
                    <span className="text-sm font-medium text-ink-800 dark:text-ink-100 flex-1 text-start">{name}</span>
                    {locale === code && <Check className="w-5 h-5 text-brand-600" />}
                  </button>
                ))}
              </div>
            )}

            {tab === 'security' && (
              <div className="space-y-4 max-w-2xl">
                <Notice tone="warning">{t('settings.security.demoGate')}</Notice>
                <Notice>{t('settings.security.needsServer')}</Notice>
              </div>
            )}

            {tab === 'organization' && (
              <div className="space-y-4 max-w-2xl">
                <Notice>{t('settings.org.note')}</Notice>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field id="org-name" label={t('municipality')} value={localizedName(locale, capital)} />
                  <Field id="org-code" label={t('settings.org.code')} value={capital.code} dir="ltr" />
                  <Field id="org-province" label={t('wilaya')} value={t('settings.org.provinceName')} />
                  <Field id="org-population" label={t('settings.org.population')} value={formatNumber(locale, capital.population)} dir="ltr" />
                </div>
              </div>
            )}

            {tab === 'integrations' && (
              <div className="space-y-3 max-w-2xl">
                <Notice>{t('settings.int.note')}</Notice>
                {integrations.map((it) => (
                  <Row key={it.id} icon={it.icon} title={t(it.name)} desc={t(it.desc)}
                    status={{ label: t(STATUS_LABEL[it.status]), tone: STATUS_TONE[it.status] }} />
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
