import { sharedModule } from './shared';
import { dashboardModule } from './dashboard';
import { adminModule } from './admin';
import { territoryModule } from './territory';
import { operationsModule } from './operations';
import { epwgModule } from './epwg';
import type { Locale } from '../translations';

/** Every feature module. Add new modules here; keys must be unique across all modules and the core dictionary. */
export const MODULES = {
  shared: sharedModule,
  dashboard: dashboardModule,
  admin: adminModule,
  territory: territoryModule,
  operations: operationsModule,
  epwg: epwgModule,
} as const;

export type ModuleKey = {
  [N in keyof typeof MODULES]: keyof (typeof MODULES)[N]['ar'];
}[keyof typeof MODULES] & string;

export function mergeModules(locale: Locale): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of Object.values(MODULES)) Object.assign(out, (m as Record<Locale, Record<string, string>>)[locale]);
  return out;
}
