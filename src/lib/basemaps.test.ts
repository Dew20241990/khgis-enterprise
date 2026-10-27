import { describe, expect, it } from 'vitest';
import { BASEMAPS, DEFAULT_BASEMAP, SIMPLE_LAYER_TO_BASEMAP, isBasemapId, resolveBasemap } from './basemaps';

describe('basemap configuration', () => {
  it.each(Object.entries(BASEMAPS))('%s has a valid https tile template, attribution and zoom', (_id, b) => {
    expect(b.url).toMatch(/^https:\/\//);
    for (const token of ['{z}', '{x}', '{y}']) expect(b.url).toContain(token);
    expect(b.attribution.trim().length).toBeGreaterThan(10);
    expect(b.maxZoom).toBeGreaterThan(5);
  });
  it('never uses Google tile endpoints (not licensed outside the Maps API)', () => {
    for (const b of Object.values(BASEMAPS)) expect(b.url).not.toMatch(/google/i);
  });
  it('every simple layer name maps to a defined base map', () => {
    for (const id of Object.values(SIMPLE_LAYER_TO_BASEMAP)) expect(isBasemapId(id)).toBe(true);
  });
  it('falls back to OpenStreetMap for unknown, empty or prototype keys', () => {
    for (const bad of ['nope', '', undefined, null, 42, 'toString', '__proto__']) {
      const r = resolveBasemap(bad);
      expect(r.id).toBe(DEFAULT_BASEMAP);
      expect(r.fellBack).toBe(true);
      expect(r.source.url).toBe(BASEMAPS[DEFAULT_BASEMAP].url);
    }
    expect(resolveBasemap('carto_dark').fellBack).toBe(false);
  });
});
