/**
 * Vehicle telemetry (GPS) abstraction.
 *
 * Three honest states, never mixed:
 *  - 'live'  : positions fetched from a configured telemetry endpoint (VITE_TELEMETRY_URL)
 *  - 'demo'  : deterministic simulation for demonstrations, clearly labelled in the UI
 *  - 'none'  : live source configured but unreachable / returned nothing usable
 *
 * A live position is additionally classified by age: 'fresh' or 'stale'.
 */

import { validatePosition } from './geometry';

export type TelemetrySource = 'live' | 'demo' | 'none';
export type Freshness = 'fresh' | 'stale' | 'unknown';

export interface VehiclePosition {
  vehicleId: string;
  lat: number;
  lng: number;
  /** Degrees clockwise from north, when reported. */
  heading?: number;
  /** Km/h, when reported by the device. Never invented. */
  speedKmh?: number;
  /** ISO-8601 time the device reported this fix. */
  timestamp: string;
}

export interface TelemetrySnapshot {
  source: TelemetrySource;
  positions: VehiclePosition[];
  /** When this snapshot was produced/fetched (ISO-8601). */
  fetchedAt: string;
  /** Entries dropped because they failed validation. */
  rejected: number;
  /** Human-readable problem, when source is 'none'. */
  error?: string;
}

/** A fix older than this is considered stale. */
export const STALE_AFTER_MS = 5 * 60 * 1000;

export function freshness(timestamp: string, now: number = Date.now(), staleAfterMs: number = STALE_AFTER_MS): Freshness {
  const t = Date.parse(timestamp);
  if (Number.isNaN(t)) return 'unknown';
  return now - t > staleAfterMs ? 'stale' : 'fresh';
}

/** Validates an untrusted telemetry payload; invalid items are dropped and counted. */
export function parseTelemetryPayload(payload: unknown): { positions: VehiclePosition[]; rejected: number } {
  const list = Array.isArray(payload)
    ? payload
    : typeof payload === 'object' && payload !== null && Array.isArray((payload as { positions?: unknown }).positions)
      ? (payload as { positions: unknown[] }).positions
      : null;
  if (!list) return { positions: [], rejected: 0 };

  const positions: VehiclePosition[] = [];
  let rejected = 0;
  for (const item of list) {
    if (typeof item !== 'object' || item === null) { rejected++; continue; }
    const r = item as Record<string, unknown>;
    const ok =
      typeof r.vehicleId === 'string' && r.vehicleId.length > 0 &&
      typeof r.lat === 'number' && typeof r.lng === 'number' &&
      validatePosition([r.lng, r.lat]) === null &&
      typeof r.timestamp === 'string' && !Number.isNaN(Date.parse(r.timestamp));
    if (!ok) { rejected++; continue; }
    positions.push({
      vehicleId: r.vehicleId as string,
      lat: r.lat as number,
      lng: r.lng as number,
      heading: typeof r.heading === 'number' && Number.isFinite(r.heading) ? r.heading : undefined,
      speedKmh: typeof r.speedKmh === 'number' && Number.isFinite(r.speedKmh) && r.speedKmh >= 0 ? r.speedKmh : undefined,
      timestamp: r.timestamp as string,
    });
  }
  return { positions, rejected };
}

/** Fetches live positions. Never throws: failures become a 'none' snapshot with an error message. */
export async function fetchLiveTelemetry(url: string, fetchImpl: typeof fetch = fetch, now: () => number = Date.now): Promise<TelemetrySnapshot> {
  const fetchedAt = new Date(now()).toISOString();
  try {
    const res = await fetchImpl(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return { source: 'none', positions: [], fetchedAt, rejected: 0, error: `HTTP ${res.status}` };
    const { positions, rejected } = parseTelemetryPayload(await res.json());
    if (positions.length === 0) return { source: 'none', positions, fetchedAt, rejected, error: 'No valid positions returned' };
    return { source: 'live', positions, fetchedAt, rejected };
  } catch (err) {
    return { source: 'none', positions: [], fetchedAt, rejected: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

export interface DemoVehicle { id: string; lat: number; lng: number; active: boolean }

/**
 * Deterministic simulation: the same inputs always give the same positions (no randomness),
 * so demos are reproducible. Only vehicles marked active move; every record is tagged 'demo' by the snapshot.
 */
export function simulateDemoTelemetry(vehicles: DemoVehicle[], now: number): TelemetrySnapshot {
  const t = now / 1000;
  const positions: VehiclePosition[] = vehicles.map((v, i) => {
    if (!v.active) return { vehicleId: v.id, lat: v.lat, lng: v.lng, timestamp: new Date(now).toISOString() };
    const phase = t / 60 + i;
    const lat = v.lat + Math.sin(phase) * 0.008;
    const lng = v.lng + Math.cos(phase) * 0.008;
    const heading = ((Math.atan2(-Math.sin(phase), Math.cos(phase)) * 180) / Math.PI + 360 + 90) % 360;
    return { vehicleId: v.id, lat, lng, heading, speedKmh: 20 + ((i * 7) % 25), timestamp: new Date(now).toISOString() };
  });
  return { source: 'demo', positions, fetchedAt: new Date(now).toISOString(), rejected: 0 };
}

/** Telemetry endpoint from configuration; `undefined` means demo mode. */
export function telemetryUrl(): string | undefined {
  const url = import.meta.env.VITE_TELEMETRY_URL;
  return typeof url === 'string' && url.trim() !== '' ? url.trim() : undefined;
}
