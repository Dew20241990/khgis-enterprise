import { useEffect, useState } from 'react';
import {
  fetchLiveTelemetry, simulateDemoTelemetry, telemetryUrl,
  type DemoVehicle, type TelemetrySnapshot,
} from './telemetry';

export const TELEMETRY_POLL_MS = 5000;

/**
 * Polls the configured live telemetry endpoint, or runs the labelled demo simulation when none is configured.
 * `loading` is true until the first live response arrives.
 */
export function useTelemetry(demoVehicles: DemoVehicle[]): { snapshot: TelemetrySnapshot; loading: boolean; isConfigured: boolean } {
  const url = telemetryUrl();
  const [loading, setLoading] = useState(Boolean(url));
  const [snapshot, setSnapshot] = useState<TelemetrySnapshot>(() =>
    url
      ? { source: 'none', positions: [], fetchedAt: new Date().toISOString(), rejected: 0 }
      : simulateDemoTelemetry(demoVehicles, Date.now()),
  );

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (url) {
        const next = await fetchLiveTelemetry(url);
        if (!cancelled) { setSnapshot(next); setLoading(false); }
      } else if (!cancelled) {
        setSnapshot(simulateDemoTelemetry(demoVehicles, Date.now()));
      }
    };
    void tick();
    const id = setInterval(() => { void tick(); }, TELEMETRY_POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, [url, demoVehicles]);

  return { snapshot, loading, isConfigured: Boolean(url) };
}
