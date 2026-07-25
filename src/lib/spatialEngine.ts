/**
 * Spatial Engine — Turf.js-powered spatial calculations for the GIS platform.
 * Provides area, length, center, bbox, distance, nearest, intersection, buffer,
 * union, difference, containment, point-in-polygon, validation, and more.
 */

import * as turf from '@turf/turf';
import type { Feature, FeatureCollection, Geometry, Point, Polygon } from 'geojson';

// --- Basic measurements ---

export function calcArea(feature: Feature<Polygon>): number {
  return turf.area(feature);
}

export function calcLength(feature: Feature): number {
  const length = turf.length(feature, { units: 'kilometers' });
  return length;
}

export function calcCenter(feature: Feature): [number, number] {
  const centroid = turf.centroid(feature);
  const coords = centroid.geometry!.coordinates;
  return [coords[1], coords[0]];
}

export function calcBBox(feature: Feature | FeatureCollection): [[number, number], [number, number]] {
  const bbox = turf.bbox(feature as any);
  return [[bbox[1], bbox[0]], [bbox[3], bbox[2]]];
}

export function calcDistance(from: [number, number], to: [number, number], units: 'kilometers' | 'meters' = 'kilometers'): number {
  const fromPt = turf.point([from[1], from[0]]);
  const toPt = turf.point([to[1], to[0]]);
  return turf.distance(fromPt, toPt, { units });
}

// --- Spatial queries ---

export function nearestFeature(target: [number, number], features: Feature[]): Feature | null {
  if (features.length === 0) return null;
  const targetPt = turf.point([target[1], target[0]]);
  const fc = turf.featureCollection(features as any[]);
  const nearest = turf.nearestPoint(targetPt, fc as any);
  return (nearest.properties?.featureIndex !== undefined ? features[nearest.properties.featureIndex] : null);
}

export function intersect(feat1: Feature, feat2: Feature): Feature | null {
  try {
    const result = turf.intersect(feat1 as any, feat2 as any);
    return result as Feature || null;
  } catch {
    return null;
  }
}

export function buffer(feature: Feature, radiusKm: number): Feature<Polygon> | null {
  try {
    return turf.buffer(feature as any, radiusKm, { units: 'kilometers' }) as Feature<Polygon>;
  } catch {
    return null;
  }
}

export function union(features: Feature[]): Feature | null {
  try {
    if (features.length < 2) return features[0] ?? null;
    return turf.union(turf.featureCollection(features as any[]) as any) as Feature;
  } catch {
    return null;
  }
}

export function difference(feat1: Feature, feat2: Feature): Feature | null {
  try {
    return turf.difference(turf.featureCollection([feat1 as any, feat2 as any]) as any) as Feature;
  } catch {
    return null;
  }
}

// --- Containment & validation ---

export function isPointInPolygon(point: [number, number], polygon: Feature<Polygon>): boolean {
  const pt = turf.point([point[1], point[0]]);
  try {
    return turf.booleanPointInPolygon(pt, polygon as any);
  } catch {
    return false;
  }
}

export function isWithinBoundary(point: [number, number], boundary: Feature<Polygon> | null): boolean {
  if (!boundary) return true;
  return isPointInPolygon(point, boundary);
}

export function validatePolygon(feature: Feature<Polygon>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  try {
    const coords = feature.geometry?.coordinates;
    if (!coords || coords.length === 0) {
      errors.push('Polygon has no coordinates');
      return { valid: false, errors };
    }
    const ring = coords[0];
    if (ring.length < 4) {
      errors.push('Polygon ring must have at least 4 coordinates (3 vertices + closing)');
    }
    if (ring.length > 0) {
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        errors.push('Polygon ring is not closed (first and last coordinates must match)');
      }
    }
    try {
      const area = turf.area(feature as any);
      if (area <= 0) errors.push('Polygon has zero or negative area');
      if (area > 1000000) errors.push('Polygon area exceeds 1000 km² — verify coordinates');
    } catch {
      errors.push('Failed to calculate polygon area');
    }
    try {
      turf.kinks(feature as any);
    } catch {
      // kinks check
    }
  } catch (err) {
    errors.push(`Validation error: ${err}`);
  }
  return { valid: errors.length === 0, errors };
}

export function validateGeometry(geometry: Geometry): { valid: boolean; errors: string[] } {
  const feature: Feature = { type: 'Feature', geometry, properties: {} };
  if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
    return validatePolygon(feature as Feature<Polygon>);
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
  boundary: Feature<Polygon> | null
): number {
  if (!boundary) return 0;
  const routeBuffers = inspectionRoutes
    .map((r) => buffer(r, 0.05))
    .filter((b): b is Feature<Polygon> => b !== null);
  if (routeBuffers.length === 0) return 0;
  const merged = union(routeBuffers);
  if (!merged) return 0;
  const boundaryArea = turf.area(boundary as any);
  if (boundaryArea === 0) return 0;
  const intersectArea = intersect(merged, boundary);
  if (!intersectArea) return 0;
  const coveredArea = turf.area(intersectArea as any);
  return Math.min(100, (coveredArea / boundaryArea) * 100);
}

// --- Spatial filtering ---

export function spatialFilter(
  features: Feature[],
  filterPolygon: Feature<Polygon>
): Feature[] {
  return features.filter((f) => {
    if (f.geometry?.type === 'Point') {
      const coords = (f.geometry as Point).coordinates;
      return isPointInPolygon([coords[1], coords[0]], filterPolygon);
    }
    try {
      return turf.booleanIntersects(f as any, filterPolygon as any);
    } catch {
      return false;
    }
  });
}

export function attributeFilter(
  features: Feature[],
  predicate: (props: Record<string, any>) => boolean
): Feature[] {
  return features.filter((f) => f.properties ? predicate(f.properties) : false);
}

// --- Bounding box helpers ---

export function fitToBoundary(boundary: Feature<Polygon>): { center: [number, number]; bounds: [[number, number], [number, number]] } {
  const center = calcCenter(boundary);
  const bounds = calcBBox(boundary);
  return { center, bounds };
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
