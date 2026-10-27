import { describe, expect, it } from 'vitest';
import { blackSpots, calendarInspections, complaints, containers, illegalDumps, municipalities, shops, vehicles } from './mockData';
import { workflowInspections } from './workflowData';

// Snapshot-style guards: demo fixtures must not change between loads (no Math.random at module load).
describe('deterministic demo fixtures', () => {
  it('produces the same container status counts every time (pinned values)', () => {
    const count = (s: string) => containers.filter((c) => c.status === s).length;
    expect({ ok: count('ok'), full: count('full'), damaged: count('damaged'), maintenance: count('maintenance') })
      .toMatchInlineSnapshot(`
        {
          "damaged": 9,
          "full": 12,
          "maintenance": 6,
          "ok": 133,
        }
      `);
  });
  it('keeps coordinates stable and close to their municipality centre', () => {
    const c = containers[0];
    const m = municipalities[0];
    expect(Math.abs(c.lat - m.center[0])).toBeLessThanOrEqual(0.015);
    expect(Math.abs(c.lng - m.center[1])).toBeLessThanOrEqual(0.015);
    expect([containers[0].lat, containers[0].lng, vehicles[0].fuel, blackSpots[0].lat]).toMatchInlineSnapshot(`
      [
        35.424092879613305,
        7.150942615456599,
        35,
        35.42128965455587,
      ]
    `);
  });
  it('has stable entity counts', () => {
    expect({ municipalities: municipalities.length, containers: containers.length, blackSpots: blackSpots.length, vehicles: vehicles.length, complaints: complaints.length, shops: shops.length, dumps: illegalDumps.length, days: Object.keys(calendarInspections).length, inspections: workflowInspections.length })
      .toMatchInlineSnapshot(`
        {
          "blackSpots": 64,
          "complaints": 36,
          "containers": 160,
          "days": 31,
          "dumps": 28,
          "inspections": 24,
          "municipalities": 21,
          "shops": 80,
          "vehicles": 32,
        }
      `);
  });
});
