/**
 * GeoJSON geometry and coordinate-reference validation.
 *
 * GeoJSON (RFC 7946) is always WGS 84 longitude/latitude in decimal degrees. Files that use a
 * projected CRS (e.g. UTM metres) are detected here and rejected instead of being drawn in the
 * wrong place.
 */

import type { Feature, FeatureCollection, Geometry } from 'geojson';

export interface ValidationIssue {
  /** Feature index within the collection (0 for single objects). */
  index: number;
  message: string;
}

const GEOMETRY_TYPES = new Set([
  'Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection',
]);

/** CRS identifiers that are equivalent to WGS 84 lon/lat. */
const WGS84_CRS = /(CRS84|EPSG::?4326)$/i;

export function validatePosition(p: unknown): string | null {
  if (!Array.isArray(p) || p.length < 2 || p.length > 3) {
    return 'position must be [longitude, latitude] or [longitude, latitude, altitude]';
  }
  if (!p.every((n) => typeof n === 'number' && Number.isFinite(n))) return 'position contains a non-numeric or non-finite value';
  const [lon, lat] = p as number[];
  if (lon < -180 || lon > 180) return `longitude ${lon} is outside -180..180 (data may use a projected CRS)`;
  if (lat < -90 || lat > 90) return `latitude ${lat} is outside -90..90 (data may use a projected CRS)`;
  return null;
}

function validateLine(coords: unknown, minPositions: number, label: string): string | null {
  if (!Array.isArray(coords) || coords.length < minPositions) return `${label} needs at least ${minPositions} positions`;
  for (const p of coords) {
    const err = validatePosition(p);
    if (err) return err;
  }
  return null;
}

function validateRing(ring: unknown): string | null {
  const err = validateLine(ring, 4, 'polygon ring');
  if (err) return err;
  const r = ring as number[][];
  const first = r[0];
  const last = r[r.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) return 'polygon ring is not closed (first and last positions differ)';
  return null;
}

function validatePolygon(rings: unknown): string | null {
  if (!Array.isArray(rings) || rings.length === 0) return 'polygon needs at least one ring';
  for (const ring of rings) {
    const err = validateRing(ring);
    if (err) return err;
  }
  return null;
}

/** Returns `null` when the geometry is valid, otherwise a human-readable reason. */
export function validateGeometry(g: unknown): string | null {
  if (typeof g !== 'object' || g === null) return 'geometry must be an object';
  const geom = g as { type?: unknown; coordinates?: unknown; geometries?: unknown };
  if (typeof geom.type !== 'string' || !GEOMETRY_TYPES.has(geom.type)) return `unsupported geometry type "${String(geom.type)}"`;

  switch (geom.type) {
    case 'Point': return validatePosition(geom.coordinates);
    case 'MultiPoint':
      if (!Array.isArray(geom.coordinates)) return 'MultiPoint coordinates must be an array';
      for (const p of geom.coordinates) { const e = validatePosition(p); if (e) return e; }
      return null;
    case 'LineString': return validateLine(geom.coordinates, 2, 'LineString');
    case 'MultiLineString':
      if (!Array.isArray(geom.coordinates)) return 'MultiLineString coordinates must be an array';
      for (const l of geom.coordinates) { const e = validateLine(l, 2, 'LineString'); if (e) return e; }
      return null;
    case 'Polygon': return validatePolygon(geom.coordinates);
    case 'MultiPolygon':
      if (!Array.isArray(geom.coordinates)) return 'MultiPolygon coordinates must be an array';
      for (const poly of geom.coordinates) { const e = validatePolygon(poly); if (e) return e; }
      return null;
    case 'GeometryCollection':
      if (!Array.isArray(geom.geometries)) return 'GeometryCollection needs a geometries array';
      for (const sub of geom.geometries) { const e = validateGeometry(sub); if (e) return e; }
      return null;
    default: return 'unsupported geometry';
  }
}

/** Checks a legacy GeoJSON `crs` member; returns a reason when it is not WGS 84. */
export function validateCrs(data: unknown): string | null {
  if (typeof data !== 'object' || data === null || !('crs' in data)) return null;
  const crs = (data as { crs?: { properties?: { name?: unknown } } }).crs;
  const name = crs?.properties?.name;
  if (typeof name !== 'string') return 'unrecognised "crs" member; only WGS 84 (EPSG:4326) is supported';
  return WGS84_CRS.test(name.trim()) ? null : `unsupported CRS "${name}"; only WGS 84 (EPSG:4326) is supported`;
}

export interface FeatureValidation {
  features: Feature[];
  issues: ValidationIssue[];
}

/** Splits a parsed GeoJSON/KML feature list into valid features and per-feature issues. */
export function validateFeatures(features: unknown[]): FeatureValidation {
  const valid: Feature[] = [];
  const issues: ValidationIssue[] = [];
  features.forEach((f, index) => {
    if (typeof f !== 'object' || f === null || (f as { type?: unknown }).type !== 'Feature') {
      issues.push({ index, message: 'item is not a GeoJSON Feature' });
      return;
    }
    const feature = f as Feature;
    if (feature.geometry !== null && feature.geometry !== undefined) {
      const err = validateGeometry(feature.geometry);
      if (err) { issues.push({ index, message: err }); return; }
    }
    valid.push(feature);
  });
  return { features: valid, issues };
}

export function isFeatureCollection(data: unknown): data is FeatureCollection {
  return typeof data === 'object' && data !== null
    && (data as { type?: unknown }).type === 'FeatureCollection'
    && Array.isArray((data as { features?: unknown }).features);
}

export function geometryType(g: Geometry | null | undefined): string | undefined {
  return g?.type;
}
