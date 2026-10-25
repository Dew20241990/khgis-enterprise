/**
 * Import/Export utilities — CSV, JSON, GeoJSON, KML.
 *
 * Exports are formula-injection-safe (CSV) and XML-escaped (KML).
 * Imports validate their input and report per-row problems instead of silently accepting bad data;
 * GeoJSON/KML geometries are checked for structure and WGS 84 coordinate ranges.
 */

import { kml } from '@tmcw/togeojson';
import type { Feature, FeatureCollection, Geometry, Position } from 'geojson';
import { parseCsvRecords, toCsv } from './csv';
import { isFeatureCollection, validateCrs, validateFeatures } from './geometry';

export type Row = Record<string, unknown>;

// --- Download ---

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  // Revoking synchronously can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// --- Export functions ---

export function exportToCSV(rows: Row[], filename: string, columns?: string[]): void {
  if (rows.length === 0) return;
  const cols = columns ?? Object.keys(rows[0]).filter((k) => !k.startsWith('_'));
  downloadFile(toCsv(cols, rows.map((r) => cols.map((c) => r[c]))), `${filename}.csv`, 'text/csv;charset=utf-8');
}

export function exportToJSON(rows: Row[], filename: string): void {
  downloadFile(JSON.stringify(rows, null, 2), `${filename}.json`, 'application/json');
}

export function exportToGeoJSON(features: Feature[], filename: string): void {
  const fc: FeatureCollection = { type: 'FeatureCollection', features };
  downloadFile(JSON.stringify(fc, null, 2), `${filename}.geojson`, 'application/geo+json');
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function kmlCoords(positions: Position[]): string {
  return positions.map(([lng, lat, alt]) => `${lng},${lat},${alt ?? 0}`).join(' ');
}

function kmlPolygon(rings: Position[][]): string {
  const [outer, ...inner] = rings;
  const inners = inner.map((r) => `<innerBoundaryIs><LinearRing><coordinates>${kmlCoords(r)}</coordinates></LinearRing></innerBoundaryIs>`).join('');
  return `<Polygon><outerBoundaryIs><LinearRing><coordinates>${kmlCoords(outer)}</coordinates></LinearRing></outerBoundaryIs>${inners}</Polygon>`;
}

function geometryToKml(g: Geometry): string {
  switch (g.type) {
    case 'Point': return `<Point><coordinates>${kmlCoords([g.coordinates])}</coordinates></Point>`;
    case 'LineString': return `<LineString><coordinates>${kmlCoords(g.coordinates)}</coordinates></LineString>`;
    case 'Polygon': return kmlPolygon(g.coordinates);
    case 'MultiPoint': return `<MultiGeometry>${g.coordinates.map((c) => geometryToKml({ type: 'Point', coordinates: c })).join('')}</MultiGeometry>`;
    case 'MultiLineString': return `<MultiGeometry>${g.coordinates.map((c) => geometryToKml({ type: 'LineString', coordinates: c })).join('')}</MultiGeometry>`;
    case 'MultiPolygon': return `<MultiGeometry>${g.coordinates.map(kmlPolygon).join('')}</MultiGeometry>`;
    case 'GeometryCollection': return `<MultiGeometry>${g.geometries.map(geometryToKml).join('')}</MultiGeometry>`;
  }
}

export function exportToKML(geojson: FeatureCollection, filename: string): void {
  const placemarks = geojson.features
    .filter((f) => f.geometry)
    .map((f) => {
      const props = (f.properties ?? {}) as Row;
      const name = escapeXml(String(props.name ?? props.code ?? 'Feature'));
      const desc = props.description ? `<description>${escapeXml(String(props.description))}</description>` : '';
      return `<Placemark><name>${name}</name>${desc}${geometryToKml(f.geometry)}</Placemark>`;
    })
    .join('\n');
  const content = `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n${placemarks}\n</Document>\n</kml>`;
  downloadFile(content, `${filename}.kml`, 'application/vnd.google-earth.kml+xml');
}

// --- Import functions ---

export interface ImportIssue {
  row: number;
  message: string;
}

export interface ImportResult {
  rows: Row[];
  errors: ImportIssue[];
  format: string;
  totalRows: number;
  validRows: number;
}

function failed(format: string, message: string): ImportResult {
  return { rows: [], errors: [{ row: 0, message }], format, totalRows: 0, validRows: 0 };
}

function errorText(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function parseCSV(text: string): ImportResult {
  let records: string[][];
  try {
    records = parseCsvRecords(text);
  } catch (err) {
    return failed('csv', `Invalid CSV: ${errorText(err)}`);
  }
  if (records.length < 2) return failed('csv', 'CSV must have a header row and at least one data row');

  const headers = records[0].map((h) => h.trim());
  const errors: ImportIssue[] = [];
  const rows: Row[] = [];
  for (let i = 1; i < records.length; i++) {
    const values = records[i];
    if (values.length !== headers.length) {
      errors.push({ row: i, message: `Expected ${headers.length} columns, got ${values.length}` });
      continue;
    }
    const row: Row = {};
    headers.forEach((h, j) => { row[h] = values[j].trim(); });
    rows.push(row);
  }
  return { rows, errors, format: 'csv', totalRows: records.length - 1, validRows: rows.length };
}

export function parseJSON(text: string): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (err) {
    return failed('json', `Invalid JSON: ${errorText(err)}`);
  }
  const items = Array.isArray(data) ? data : [data];
  const rows: Row[] = [];
  const errors: ImportIssue[] = [];
  items.forEach((item, i) => {
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) rows.push(item as Row);
    else errors.push({ row: i + 1, message: 'Each JSON item must be an object' });
  });
  return { rows, errors, format: 'json', totalRows: items.length, validRows: rows.length };
}

function featureRows(features: unknown[], format: string): ImportResult {
  const { features: valid, issues } = validateFeatures(features);
  const rows: Row[] = valid.map((f) => ({
    ...(f.properties ?? {}),
    _geometry: f.geometry,
    _geometryType: f.geometry?.type,
  }));
  return {
    rows,
    errors: issues.map((i) => ({ row: i.index + 1, message: i.message })),
    format,
    totalRows: features.length,
    validRows: rows.length,
  };
}

export function parseGeoJSON(text: string): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (err) {
    return failed('geojson', `Invalid GeoJSON: ${errorText(err)}`);
  }
  const crsIssue = validateCrs(data);
  if (crsIssue) return failed('geojson', crsIssue);
  if (typeof data === 'object' && data !== null && (data as { type?: unknown }).type === 'Feature') {
    return featureRows([data], 'geojson');
  }
  if (!isFeatureCollection(data)) return failed('geojson', 'Not a valid GeoJSON FeatureCollection');
  return featureRows(data.features, 'geojson');
}

export function parseKML(text: string): ImportResult {
  const doc = new DOMParser().parseFromString(text, 'text/xml');
  if (doc.querySelector('parsererror')) return failed('kml', 'Invalid KML: the file is not well-formed XML');
  try {
    const fc = kml(doc);
    return featureRows(fc.features, 'kml');
  } catch (err) {
    return failed('kml', `Invalid KML: ${errorText(err)}`);
  }
}

export function parseFile(text: string, format: string): ImportResult {
  switch (format.toLowerCase()) {
    case 'csv': return parseCSV(text);
    case 'json': return parseJSON(text);
    case 'geojson': return parseGeoJSON(text);
    case 'kml': return parseKML(text);
    default: return failed(format, `Unsupported format: ${format}`);
  }
}

export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'));
    reader.readAsText(file);
  });
}
