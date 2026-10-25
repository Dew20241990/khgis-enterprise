import { describe, expect, it } from 'vitest';
import { validateCrs, validateFeatures, validateGeometry, validatePosition } from './geometry';

const ring = [[7.1, 35.4], [7.2, 35.4], [7.2, 35.5], [7.1, 35.4]];

describe('validatePosition', () => {
  it('accepts lon/lat and lon/lat/alt', () => {
    expect(validatePosition([7.14, 35.42])).toBeNull();
    expect(validatePosition([7.14, 35.42, 1020])).toBeNull();
  });

  it('rejects out-of-range values, e.g. projected UTM metres', () => {
    expect(validatePosition([545000, 3925000])).toMatch(/projected CRS/);
    expect(validatePosition([7, 95])).toMatch(/latitude/);
  });

  it('rejects malformed positions', () => {
    expect(validatePosition([7])).toMatch(/position must be/);
    expect(validatePosition(['7', '35'])).toMatch(/non-numeric/);
    expect(validatePosition([NaN, 35])).toMatch(/non-numeric/);
    expect(validatePosition('7,35')).toMatch(/position must be/);
  });
});

describe('validateGeometry', () => {
  it('accepts valid geometries of every kind', () => {
    expect(validateGeometry({ type: 'Point', coordinates: [7.1, 35.4] })).toBeNull();
    expect(validateGeometry({ type: 'LineString', coordinates: [[7.1, 35.4], [7.2, 35.5]] })).toBeNull();
    expect(validateGeometry({ type: 'Polygon', coordinates: [ring] })).toBeNull();
    expect(validateGeometry({ type: 'MultiPolygon', coordinates: [[ring], [ring]] })).toBeNull();
    expect(validateGeometry({ type: 'GeometryCollection', geometries: [{ type: 'Point', coordinates: [7, 35] }] })).toBeNull();
  });

  it('rejects an unclosed polygon ring', () => {
    const open = [[7.1, 35.4], [7.2, 35.4], [7.2, 35.5], [7.3, 35.6]];
    expect(validateGeometry({ type: 'Polygon', coordinates: [open] })).toMatch(/not closed/);
  });

  it('rejects too-short lines and rings', () => {
    expect(validateGeometry({ type: 'LineString', coordinates: [[7, 35]] })).toMatch(/at least 2/);
    expect(validateGeometry({ type: 'Polygon', coordinates: [[[7, 35], [8, 35], [7, 35]]] })).toMatch(/at least 4/);
  });

  it('rejects unknown types and non-objects', () => {
    expect(validateGeometry({ type: 'Circle', coordinates: [] })).toMatch(/unsupported geometry type/);
    expect(validateGeometry(null)).toMatch(/must be an object/);
  });
});

describe('validateCrs', () => {
  it('passes when there is no crs member or it is WGS 84', () => {
    expect(validateCrs({ type: 'FeatureCollection', features: [] })).toBeNull();
    expect(validateCrs({ crs: { properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } } })).toBeNull();
    expect(validateCrs({ crs: { properties: { name: 'EPSG:4326' } } })).toBeNull();
  });

  it('rejects projected or unrecognised CRS declarations', () => {
    expect(validateCrs({ crs: { properties: { name: 'EPSG:32632' } } })).toMatch(/unsupported CRS/);
    expect(validateCrs({ crs: {} })).toMatch(/unrecognised/);
  });
});

describe('validateFeatures', () => {
  it('splits valid features from invalid ones with their indices', () => {
    const good = { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [7, 35] } };
    const badGeom = { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [700, 35] } };
    const notFeature = { type: 'Thing' };
    const unlocated = { type: 'Feature', properties: { a: 1 }, geometry: null };
    const { features, issues } = validateFeatures([good, badGeom, notFeature, unlocated]);
    expect(features).toHaveLength(2);
    expect(issues.map((i) => i.index)).toEqual([1, 2]);
  });
});
