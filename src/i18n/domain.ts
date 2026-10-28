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

/** Operational status codes used by vehicles, drivers, containers, facilities, contracts, work orders and observations. */
export const STATUS_KEYS = {
  open: 'open',
  inProgress: 'inProgress',
  resolved: 'resolved',
  closed: 'closed',
  active: 'active',
  idle: 'shared.status.idle',
  maintenance: 'shared.status.maintenance',
  offline: 'offline',
  pending: 'pending',
  scheduled: 'shared.status.scheduled',
  completed: 'completed',
  flagged: 'shared.status.flagged',
  assigned: 'assigned',
  planned: 'shared.status.planned',
  delayed: 'shared.status.delayed',
  operational: 'shared.status.operational',
  'near-capacity': 'shared.status.nearCapacity',
  suspended: 'shared.status.suspended',
  expired: 'shared.status.expired',
  'on-duty': 'shared.status.onDuty',
  'off-duty': 'shared.status.offDuty',
  leave: 'shared.status.leave',
  ok: 'shared.status.ok',
  full: 'shared.status.full',
  damaged: 'shared.status.damaged',
  created: 'shared.status.created',
  verified: 'shared.status.verified',
  rejected: 'shared.status.rejected',
  rework: 'shared.status.rework',
} as const satisfies DomainTable;

/** Priority / risk codes. */
export const PRIORITY_KEYS = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
} as const satisfies DomainTable;
