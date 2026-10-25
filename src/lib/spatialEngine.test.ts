import { describe, expect, it } from 'vitest';
import type { Feature, Polygon } from 'geojson';
import {
  calcBBox, calcCenter, calcDistance, calcInspectionCoverage, intersect, isPointInPolygon,
  isPolygonal, nearestFeature, spatialFilter, validateGeometry, validatePolygon,
} from './spatialEngine';

const square = (x: number, y: number, size: number): Feature<Polygon> => ({
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [[[x, y], [x + size, y], [x + size, y + size], [x, y + size], [x, y]]],
  },
});

const pt = (lng: number, lat: number): Feature => ({
  type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [lng, lat] },
});

describe('geometry helpers', () => {
  it('isPolygonal narrows polygon features only', () => {
    expect(isPolygonal(square(7, 35, 0.1))).toBe(true);
    expect(isPolygonal(pt(7, 35))).toBe(false);
    expect(isPolygonal(null)).toBe(false);
  });

  it('calcBBox/calcCenter return [lat, lng] order', () => {
    const s = square(7, 35, 0.2);
    expect(calcBBox(s)).toEqual([[35, 7], [35.2, 7.2]]);
    const [lat, lng] = calcCenter(s);
    expect(lat).toBeCloseTo(35.1, 5);
    expect(lng).toBeCloseTo(7.1, 5);
  });

  it('calcDistance is about 111 km per degree of latitude', () => {
    expect(calcDistance([35, 7], [36, 7])).toBeGreaterThan(110);
    expect(calcDistance([35, 7], [36, 7])).toBeLessThan(112);
  });
});

describe('intersect (Turf v7 FeatureCollection API)', () => {
  it('returns the overlapping area of two squares', () => {
    const r = intersect(square(0, 0, 2), square(1, 1, 2));
    expect(r).not.toBeNull();
    expect(calcBBox(r as Feature)).toEqual([[1, 1], [2, 2]]);
  });

  it('returns null for disjoint polygons', () => {
    expect(intersect(square(0, 0, 1), square(5, 5, 1))).toBeNull();
  });
});

describe('calcInspectionCoverage', () => {
  const boundary = square(7.0, 35.0, 0.1);

  it('is 0 with no routes or no boundary', () => {
    expect(calcInspectionCoverage([], boundary)).toBe(0);
    expect(calcInspectionCoverage([], null)).toBe(0);
  });

  it('is greater than 0 for a route inside the boundary (previously always 0)', () => {
    const route: Feature = {
      type: 'Feature', properties: {},
      geometry: { type: 'LineString', coordinates: [[7.01, 35.05], [7.09, 35.05]] },
    };
    const pct = calcInspectionCoverage([route], boundary);
    expect(pct).toBeGreaterThan(0);
    expect(pct).toBeLessThanOrEqual(100);
  });
});

describe('containment and filtering', () => {
  const area = square(7, 35, 0.1);

  it('isPointInPolygon takes [lat, lng]', () => {
    expect(isPointInPolygon([35.05, 7.05], area)).toBe(true);
    expect(isPointInPolygon([36, 8], area)).toBe(false);
  });

  it('spatialFilter keeps only features inside the polygon', () => {
    const kept = spatialFilter([pt(7.05, 35.05), pt(9, 36)], area);
    expect(kept).toHaveLength(1);
  });

  it('nearestFeature picks the closest by centroid', () => {
    const near = pt(7.01, 35.01);
    expect(nearestFeature([35, 7], [pt(8, 36), near, pt(9, 37)])).toBe(near);
    expect(nearestFeature([35, 7], [])).toBeNull();
  });
});

describe('validation', () => {
  it('accepts a normal polygon', () => {
    expect(validatePolygon(square(7, 35, 0.01)).valid).toBe(true);
  });

  it('flags an unclosed ring', () => {
    const open: Feature<Polygon> = {
      type: 'Feature', properties: {},
      geometry: { type: 'Polygon', coordinates: [[[7, 35], [7.1, 35], [7.1, 35.1], [7.2, 35.2]]] },
    };
    expect(validatePolygon(open).errors.join()).toMatch(/not closed/);
  });

  it('flags a self-intersecting bow-tie polygon', () => {
    const bow: Feature<Polygon> = {
      type: 'Feature', properties: {},
      geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 1], [1, 0], [0, 1], [0, 0]]] },
    };
    expect(validatePolygon(bow).errors.join()).toMatch(/self-intersecting/);
  });

  it('flags out-of-range points', () => {
    expect(validateGeometry({ type: 'Point', coordinates: [200, 10] }).valid).toBe(false);
    expect(validateGeometry({ type: 'Point', coordinates: [7, 35] }).valid).toBe(true);
  });
});
