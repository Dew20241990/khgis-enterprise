import type { TranslationKey } from './translations';

/**
 * Domain values (statuses, categories, types) are stored as stable codes or legacy source strings and are
 * translated only when displayed. A table maps each stored value to a translation key; unknown values fall
 * back to the raw text so user-entered data is never altered or hidden.
 */
export type DomainTable = Readonly<Record<string, TranslationKey>>;

export function domainLabel(t: (key: TranslationKey) => string, table: DomainTable, value: string | null | undefined): string {
  if (value == null || value === '') return '';
  const key = table[value];
  return key ? t(key) : value;
}
