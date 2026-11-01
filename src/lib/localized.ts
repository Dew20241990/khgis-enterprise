import type { Locale } from '@/i18n/translations';

/** Entities in the demo data carry up to three spellings of their name (English `name`, `nameAr`, `nameFr`). */
export interface LocalizedNames {
  name?: string | null;
  nameAr?: string | null;
  nameFr?: string | null;
}

const ORDER: Record<Locale, readonly (keyof LocalizedNames)[]> = {
  ar: ['nameAr', 'name', 'nameFr'],
  fr: ['nameFr', 'name', 'nameAr'],
  en: ['name', 'nameFr', 'nameAr'],
};

/**
 * The entity's name in the active language, falling back to another spelling when that one is empty so a record is
 * never rendered without a name. Official proper names and user-entered text are data, not translations.
 */
export function localizedName(locale: Locale, entity: LocalizedNames | null | undefined): string {
  if (!entity) return '';
  for (const field of ORDER[locale]) {
    const v = entity[field];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return '';
}
