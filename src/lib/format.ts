import type { Locale } from '@/i18n/translations';

/** BCP-47 tag used for number/date formatting. Arabic uses Latin digits to match the rest of the UI. */
export function intlLocale(locale: Locale): string {
  return locale === 'ar' ? 'ar-DZ-u-nu-latn' : locale === 'fr' ? 'fr-DZ' : 'en-GB';
}

export function formatNumber(locale: Locale, value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(intlLocale(locale), options).format(value);
}

export function formatDate(locale: Locale, iso: string | number | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(intlLocale(locale), options ?? { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

export function formatTime(locale: Locale, iso: string | number | Date): string {
  return formatDate(locale, iso, { hour: '2-digit', minute: '2-digit' });
}
