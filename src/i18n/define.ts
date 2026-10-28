/**
 * Typed translation modules.
 *
 * A module groups the strings of one feature area. `defineModule` enforces at compile time that the
 * French and English dictionaries have exactly the same keys as the Arabic one, so a missing or extra
 * key is a type error rather than a runtime surprise. Keys must be globally unique (checked by tests);
 * prefix them with the module name, e.g. `workOrders.title`.
 */
export interface ModuleDict<K extends string = string> {
  ar: Record<K, string>;
  fr: Record<K, string>;
  en: Record<K, string>;
}

export function defineModule<const AR extends Record<string, string>>(m: {
  ar: AR;
  fr: Record<keyof AR, string>;
  en: Record<keyof AR, string>;
}): { ar: AR; fr: Record<keyof AR, string>; en: Record<keyof AR, string> } {
  return m;
}
