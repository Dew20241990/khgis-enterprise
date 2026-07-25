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

export interface AuditEntry {
  entity_type: string;
  entity_id: string;
  action: 'create' | 'update' | 'delete' | 'archive' | 'restore' | 'duplicate' | 'bulk_delete' | 'bulk_update' | 'bulk_status_change';
  performed_by?: string;
  previous_value?: Record<string, any>;
  new_value?: Record<string, any>;
  changes?: Record<string, { from: any; to: any }>;
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

export async function getAuditHistory(entityType: string, entityId: string): Promise<any[]> {
  const sb = getClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from('audit_logs')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}

export function computeChanges(prev: Record<string, any>, next: Record<string, any>): Record<string, { from: any; to: any }> {
  const changes: Record<string, { from: any; to: any }> = {};
  const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  for (const key of allKeys) {
    if (key.startsWith('_')) continue;
    if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
      changes[key] = { from: prev[key] ?? null, to: next[key] ?? null };
    }
  }
  return changes;
}
