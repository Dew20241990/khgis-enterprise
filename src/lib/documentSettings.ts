import type { Locale } from '@/i18n/translations';

export type ThemeMode = 'light' | 'dark';

/** Text direction for a locale: Arabic is right-to-left, French and English are left-to-right. */
export function directionFor(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

/** Applies theme, language and direction to the <html> element. Safe to call repeatedly. */
export function applyDocumentSettings(html: HTMLElement, locale: Locale, theme: ThemeMode): void {
  html.classList.toggle('dark', theme === 'dark');
  html.setAttribute('dir', directionFor(locale));
  html.setAttribute('lang', locale);
}
