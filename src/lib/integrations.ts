import { telemetryUrl } from '@/lib/telemetry';

/**
 * Which optional integrations have been configured through environment variables.
 * "Configured" only means the variables are present: nothing here contacts the service or proves it works.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

export function isTelemetryConfigured(): boolean {
  return Boolean(telemetryUrl());
}
