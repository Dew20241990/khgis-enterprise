/*
# Create audit_logs table

1. New Tables
- `audit_logs`
  - `id` (uuid, primary key)
  - `entity_type` (text — e.g. 'black_spot', 'container', 'vehicle')
  - `entity_id` (text — the ID of the affected record)
  - `action` (text — 'create', 'update', 'delete', 'archive', 'restore', 'duplicate', 'bulk_delete', 'bulk_update')
  - `performed_by` (text — user name or 'system')
  - `previous_value` (jsonb — the record state before the change)
  - `new_value` (jsonb — the record state after the change)
  - `changes` (jsonb — diff of changed fields)
  - `ip_address` (text — request IP, if available)
  - `user_agent` (text — browser info)
  - `created_at` (timestamptz — when the action occurred)

2. Security
- Enable RLS on `audit_logs`.
- Allow anon + authenticated to read and insert — single-tenant public platform.
  Audit logs are administrative records accessible to all platform users.

3. Notes
- This table records every CRUD operation across all modules.
- The `previous_value` and `new_value` columns store full record snapshots.
- The `changes` column stores only the fields that changed (diff).
- Used by the History/Timeline/Audit Log features in the CRUD framework.
*/

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  action text NOT NULL,
  performed_by text NOT NULL DEFAULT 'system',
  previous_value jsonb,
  new_value jsonb,
  changes jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_audit_logs" ON audit_logs;
CREATE POLICY "anon_select_audit_logs" ON audit_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_audit_logs" ON audit_logs;
CREATE POLICY "anon_insert_audit_logs" ON audit_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_audit_logs" ON audit_logs;
CREATE POLICY "anon_update_audit_logs" ON audit_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_audit_logs" ON audit_logs;
CREATE POLICY "anon_delete_audit_logs" ON audit_logs FOR DELETE
  TO anon, authenticated USING (true);
