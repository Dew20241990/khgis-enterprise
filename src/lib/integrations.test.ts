import { afterEach, describe, expect, it, vi } from 'vitest';
import { isSupabaseConfigured, isTelemetryConfigured } from './integrations';

afterEach(() => vi.unstubAllEnvs());

describe('integration configuration flags', () => {
  it('Supabase needs both the URL and the anon key', () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    expect(isSupabaseConfigured()).toBe(false);
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.invalid');
    expect(isSupabaseConfigured()).toBe(false);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'placeholder');
    expect(isSupabaseConfigured()).toBe(true);
  });

  it('telemetry is configured only by a non-blank URL', () => {
    vi.stubEnv('VITE_TELEMETRY_URL', '');
    expect(isTelemetryConfigured()).toBe(false);
    vi.stubEnv('VITE_TELEMETRY_URL', '   ');
    expect(isTelemetryConfigured()).toBe(false);
    vi.stubEnv('VITE_TELEMETRY_URL', 'https://example.invalid/feed.json');
    expect(isTelemetryConfigured()).toBe(true);
  });
});
