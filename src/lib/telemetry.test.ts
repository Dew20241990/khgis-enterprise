import { describe, expect, it, vi } from 'vitest';
import {
  fetchLiveTelemetry, freshness, parseTelemetryPayload, simulateDemoTelemetry, STALE_AFTER_MS,
} from './telemetry';

const now = Date.parse('2026-10-25T12:00:00Z');
const good = { vehicleId: 'V1', lat: 35.4, lng: 7.1, timestamp: '2026-10-25T11:59:30Z', speedKmh: 32, heading: 90 };

describe('freshness', () => {
  it('classifies by age', () => {
    expect(freshness('2026-10-25T11:59:00Z', now)).toBe('fresh');
    expect(freshness(new Date(now - STALE_AFTER_MS - 1).toISOString(), now)).toBe('stale');
    expect(freshness('garbage', now)).toBe('unknown');
  });
});

describe('parseTelemetryPayload', () => {
  it('accepts valid positions from an array or a {positions} wrapper', () => {
    expect(parseTelemetryPayload([good]).positions).toHaveLength(1);
    expect(parseTelemetryPayload({ positions: [good] }).positions).toHaveLength(1);
  });

  it('rejects out-of-range coordinates, missing ids and bad timestamps, and counts them', () => {
    const r = parseTelemetryPayload([
      good,
      { ...good, vehicleId: 'V2', lat: 95 },
      { ...good, vehicleId: '' },
      { ...good, vehicleId: 'V4', timestamp: 'nope' },
      null,
    ]);
    expect(r.positions.map((p) => p.vehicleId)).toEqual(['V1']);
    expect(r.rejected).toBe(4);
  });

  it('never invents speed or heading', () => {
    const p = parseTelemetryPayload([{ vehicleId: 'V1', lat: 35.4, lng: 7.1, timestamp: '2026-10-25T11:59:30Z' }]).positions[0];
    expect(p.speedKmh).toBeUndefined();
    expect(p.heading).toBeUndefined();
  });

  it('returns nothing for non-list payloads', () => {
    expect(parseTelemetryPayload('x')).toEqual({ positions: [], rejected: 0 });
  });
});

describe('fetchLiveTelemetry', () => {
  const ok = (body: unknown) => vi.fn(async () => new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch;

  it('returns a live snapshot for valid data', async () => {
    const s = await fetchLiveTelemetry('http://x', ok([good]), () => now);
    expect(s.source).toBe('live');
    expect(s.positions).toHaveLength(1);
  });

  it('reports "none" (not live) on HTTP errors, network errors and empty data', async () => {
    const http = vi.fn(async () => new Response('', { status: 503 })) as unknown as typeof fetch;
    expect((await fetchLiveTelemetry('http://x', http, () => now)).source).toBe('none');
    const boom = vi.fn(async () => { throw new Error('offline'); }) as unknown as typeof fetch;
    const s = await fetchLiveTelemetry('http://x', boom, () => now);
    expect(s.source).toBe('none');
    expect(s.error).toBe('offline');
    expect((await fetchLiveTelemetry('http://x', ok([]), () => now)).source).toBe('none');
  });
});

describe('simulateDemoTelemetry', () => {
  const vehicles = [
    { id: 'A', lat: 35.4, lng: 7.1, active: true },
    { id: 'B', lat: 35.5, lng: 7.2, active: false },
  ];

  it('is tagged demo and deterministic', () => {
    const a = simulateDemoTelemetry(vehicles, now);
    const b = simulateDemoTelemetry(vehicles, now);
    expect(a.source).toBe('demo');
    expect(a).toEqual(b);
  });

  it('moves only active vehicles and keeps positions valid', () => {
    const later = simulateDemoTelemetry(vehicles, now + 30_000);
    const first = simulateDemoTelemetry(vehicles, now);
    expect(later.positions[0]).not.toEqual(first.positions[0]);
    expect(later.positions[1].lat).toBe(35.5);
    expect(parseTelemetryPayload(later.positions).rejected).toBe(0);
  });
});
