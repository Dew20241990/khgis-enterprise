// @vitest-environment node
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { containers, municipalities, neighborhoods, vehicles } from './mockData';
import { validateFeatures } from '../lib/geometry';

const DIR = join(process.cwd(), 'assets', 'gis');
const load = (f: string) => JSON.parse(readFileSync(join(DIR, f), 'utf8')) as { features: { geometry: { type: string; coordinates: number[] }; properties: Record<string, unknown> }[] };
const GENERATED = readdirSync(DIR).filter((f) => f.endsWith('.geojson'));
const AR_NAMES = new Set(municipalities.map((m) => m.nameAr));

describe('municipality dataset', () => {
  it('has exactly 21 unique municipalities', () => {
    expect(municipalities).toHaveLength(21);
    for (const key of ['id', 'code', 'name', 'nameAr', 'nameFr'] as const) {
      expect(new Set(municipalities.map((m) => m[key])).size).toBe(21);
    }
  });
  it('every neighborhood, container and vehicle references an existing municipality', () => {
    const ids = new Set(municipalities.map((m) => m.id));
    expect(neighborhoods.every((n) => ids.has(n.municipalityId))).toBe(true);
    expect(containers.every((c) => ids.has(c.municipalityId))).toBe(true);
    expect(vehicles.every((v) => AR_NAMES.has(v.municipality))).toBe(true);
  });
});

describe('assets/gis GeoJSON matches the current dataset', () => {
  it('Containers.geojson mirrors the containers dataset exactly (ids and coordinates)', () => {
    const fc = load('Containers.geojson');
    expect(fc.features).toHaveLength(containers.length);
    const byId = new Map(containers.map((c) => [c.id, c]));
    for (const f of fc.features) {
      const c = byId.get(String(f.properties.uuid));
      expect(c, String(f.properties.uuid)).toBeDefined();
      expect(f.geometry.coordinates[0]).toBeCloseTo(c!.lng, 9);
      expect(f.geometry.coordinates[1]).toBeCloseTo(c!.lat, 9);
    }
  });
  it('Neighborhoods.geojson has one polygon per neighborhood', () => {
    expect(load('Neighborhoods.geojson').features).toHaveLength(neighborhoods.length);
  });
  it.each(GENERATED)('%s: only valid WGS84 geometries, municipalities limited to the 21', (file) => {
    const { features } = load(file);
    const result = validateFeatures(features);
    expect(result.issues, JSON.stringify(result.issues.slice(0, 3))).toEqual([]);
    for (const f of features) {
      const m = f.properties.municipality;
      if (typeof m === 'string' && m) expect(AR_NAMES.has(m), `${file}: unknown municipality "${m}"`).toBe(true);
    }
  });
});
