/**
 * Audit Log — records every CRUD operation to Supabase.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client = createClient(url, key);
  return client;
}

export type AuditRecord = Record<string, unknown>;
export type AuditChanges = Record<string, { from: unknown; to: unknown }>;

/** A row of the `audit_logs` table as returned by Supabase. */
export interface AuditRow {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  performed_by: string;
  previous_value: AuditRecord | null;
  new_value: AuditRecord | null;
  changes: AuditChanges | null;
  created_at: string;
}

export interface AuditEntry {
  entity_type: string;
  entity_id: string;
  action: 'create' | 'update' | 'delete' | 'archive' | 'restore' | 'duplicate' | 'bulk_delete' | 'bulk_update' | 'bulk_status_change';
  performed_by?: string;
  previous_value?: AuditRecord;
  new_value?: AuditRecord;
  changes?: AuditChanges;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  const sb = getClient();
  if (!sb) return;
  try {
    await sb.from('audit_logs').insert({
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      action: entry.action,
      performed_by: entry.performed_by ?? 'system',
      previous_value: entry.previous_value ?? null,
      new_value: entry.new_value ?? null,
      changes: entry.changes ?? null,
      ip_address: null,
      user_agent: navigator?.userAgent ?? null,
    });
  } catch (err) {
    console.error('Failed to log audit entry:', err);
  }
}

export async function getAuditHistory(entityType: string, entityId: string): Promise<AuditRow[]> {
  const sb = getClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from('audit_logs')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []) as AuditRow[];
}

export function computeChanges(prev: AuditRecord, next: AuditRecord): AuditChanges {
  const changes: AuditChanges = {};
  const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  for (const key of allKeys) {
    if (key.startsWith('_')) continue;
    if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
      changes[key] = { from: prev[key] ?? null, to: next[key] ?? null };
    }
  }
  return changes;
}
