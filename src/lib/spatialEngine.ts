/**
 * Spatial Engine — Turf.js-powered spatial calculations for the GIS platform.
 * Provides area, length, center, bbox, distance, nearest, intersection, buffer,
 * union, difference, containment, point-in-polygon, validation, and more.
 *
 * Conventions: public helpers take/return Leaflet-style `[lat, lng]` tuples;
 * GeoJSON features always use `[lng, lat]` internally.
 * Turf v7 note: intersect/union/difference take a FeatureCollection of polygons.
 */

import * as turf from '@turf/turf';
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Point, Polygon } from 'geojson';

export type PolygonalFeature = Feature<Polygon | MultiPolygon>;

export function isPolygonal(f: Feature | null | undefined): f is PolygonalFeature {
  const t = f?.geometry?.type;
  return t === 'Polygon' || t === 'MultiPolygon';
}

// --- Basic measurements ---

export function calcArea(feature: PolygonalFeature): number {
  return turf.area(feature);
}

export function calcLength(feature: Feature): number {
  return turf.length(feature, { units: 'kilometers' });
}

export function calcCenter(feature: Feature): [number, number] {
  const coords = turf.centroid(feature).geometry.coordinates;
  return [coords[1], coords[0]];
}

export function calcBBox(feature: Feature | FeatureCollection): [[number, number], [number, number]] {
  const bbox = turf.bbox(feature);
  return [[bbox[1], bbox[0]], [bbox[3], bbox[2]]];
}

export function calcDistance(from: [number, number], to: [number, number], units: 'kilometers' | 'meters' = 'kilometers'): number {
  return turf.distance(turf.point([from[1], from[0]]), turf.point([to[1], to[0]]), { units });
}

// --- Spatial queries ---

/** Nearest feature to `target` (by distance to each feature's centroid). */
export function nearestFeature(target: [number, number], features: Feature[]): Feature | null {
  let best: Feature | null = null;
  let bestDist = Infinity;
  for (const f of features) {
    if (!f.geometry) continue;
    const d = calcDistance(target, calcCenter(f));
    if (d < bestDist) { bestDist = d; best = f; }
  }
  return best;
}

export function intersect(feat1: PolygonalFeature, feat2: PolygonalFeature): Feature<Polygon | MultiPolygon> | null {
  try {
    return turf.intersect(turf.featureCollection([feat1, feat2]));
  } catch {
    return null;
  }
}

export function buffer(feature: Feature, radiusKm: number): Feature<Polygon | MultiPolygon> | null {
  try {
    return turf.buffer(feature, radiusKm, { units: 'kilometers' }) ?? null;
  } catch {
    return null;
  }
}

export function union(features: PolygonalFeature[]): Feature<Polygon | MultiPolygon> | null {
  try {
    if (features.length < 2) return features[0] ?? null;
    return turf.union(turf.featureCollection(features));
  } catch {
    return null;
  }
}

export function difference(feat1: PolygonalFeature, feat2: PolygonalFeature): Feature<Polygon | MultiPolygon> | null {
  try {
    return turf.difference(turf.featureCollection([feat1, feat2]));
  } catch {
    return null;
  }
}

// --- Containment & validation ---

export function isPointInPolygon(point: [number, number], polygon: PolygonalFeature): boolean {
  try {
    return turf.booleanPointInPolygon(turf.point([point[1], point[0]]), polygon);
  } catch {
    return false;
  }
}

export function isWithinBoundary(point: [number, number], boundary: PolygonalFeature | null): boolean {
  if (!boundary) return true;
  return isPointInPolygon(point, boundary);
}

function validateRings(rings: number[][][], errors: string[]): void {
  if (rings.length === 0) { errors.push('Polygon has no coordinates'); return; }
  for (const ring of rings) {
    if (ring.length < 4) errors.push('Polygon ring must have at least 4 coordinates (3 vertices + closing)');
    if (ring.length > 0) {
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        errors.push('Polygon ring is not closed (first and last coordinates must match)');
      }
    }
  }
}

export function validatePolygon(feature: PolygonalFeature): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const geom = feature.geometry;
  if (!geom) return { valid: false, errors: ['Feature has no geometry'] };

  const polygons = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  polygons.forEach((rings) => validateRings(rings, errors));

  try {
    const area = turf.area(feature);
    if (area <= 0) errors.push('Polygon has zero or negative area');
    if (area > 1_000_000_000) errors.push('Polygon area exceeds 1000 km² — verify coordinates');
  } catch {
    errors.push('Failed to calculate polygon area');
  }
  try {
    if (turf.kinks(feature).features.length > 0) errors.push('Polygon is self-intersecting');
  } catch {
    // kinks only supports simple polygons; ignore for unsupported shapes
  }
  return { valid: errors.length === 0, errors };
}

export function validateGeometry(geometry: Geometry): { valid: boolean; errors: string[] } {
  if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
    return validatePolygon({ type: 'Feature', geometry, properties: {} });
  }
  if (geometry.type === 'Point') {
    const coords = (geometry as Point).coordinates;
    if (coords.length < 2) return { valid: false, errors: ['Point must have at least 2 coordinates'] };
    if (coords[0] < -180 || coords[0] > 180) return { valid: false, errors: ['Longitude out of range [-180, 180]'] };
    if (coords[1] < -90 || coords[1] > 90) return { valid: false, errors: ['Latitude out of range [-90, 90]'] };
  }
  return { valid: true, errors: [] };
}

// --- Route & coverage calculations ---

export function calcRouteLength(features: Feature[]): number {
  return features.reduce((sum, f) => sum + calcLength(f), 0);
}

export function calcInspectionCoverage(
  inspectionRoutes: Feature[],
  boundary: PolygonalFeature | null,
): number {
  if (!boundary) return 0;
  const routeBuffers = inspectionRoutes
    .map((r) => buffer(r, 0.05))
    .filter((b): b is Feature<Polygon | MultiPolygon> => b !== null);
  if (routeBuffers.length === 0) return 0;
  const merged = union(routeBuffers);
  if (!merged) return 0;
  const boundaryArea = turf.area(boundary);
  if (boundaryArea === 0) return 0;
  const overlap = intersect(merged, boundary);
  if (!overlap) return 0;
  return Math.min(100, (turf.area(overlap) / boundaryArea) * 100);
}

// --- Spatial filtering ---

export function spatialFilter(features: Feature[], filterPolygon: PolygonalFeature): Feature[] {
  return features.filter((f) => {
    if (f.geometry?.type === 'Point') {
      const coords = f.geometry.coordinates;
      return isPointInPolygon([coords[1], coords[0]], filterPolygon);
    }
    try {
      return turf.booleanIntersects(f, filterPolygon);
    } catch {
      return false;
    }
  });
}

export function attributeFilter(
  features: Feature[],
  predicate: (props: Record<string, unknown>) => boolean,
): Feature[] {
  return features.filter((f) => (f.properties ? predicate(f.properties) : false));
}

// --- Bounding box helpers ---

export function fitToBoundary(boundary: Feature): { center: [number, number]; bounds: [[number, number], [number, number]] } {
  return { center: calcCenter(boundary), bounds: calcBBox(boundary) };
}

// --- Coordinate formatting ---

export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lng).toFixed(6)}°${lngDir}`;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${(km * 1000).toFixed(0)} م`;
  return `${km.toFixed(2)} كم`;
}

export function formatArea(sqMeters: number): string {
  if (sqMeters < 10000) return `${sqMeters.toFixed(0)} م²`;
  return `${(sqMeters / 1000000).toFixed(3)} كم²`;
}
