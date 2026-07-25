/**
 * Import/Export utilities — CSV, JSON, GeoJSON, KML support.
 * Import validates data, previews rows, and reports errors.
 */

import { kml } from '@tmcw/togeojson';

// --- Export functions ---

export function exportToCSV(rows: Record<string, any>[], filename: string, columns?: string[]): void {
  if (rows.length === 0) return;
  const cols = columns ?? Object.keys(rows[0]).filter((k) => !k.startsWith('_'));
  const headers = cols.join(',');
  const data = rows.map((r) =>
    cols.map((c) => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(',')
  );
  const csv = '\uFEFF' + [headers, ...data].join('\n');
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8');
}

export function exportToJSON(rows: Record<string, any>[], filename: string): void {
  const json = JSON.stringify(rows, null, 2);
  downloadFile(json, `${filename}.json`, 'application/json');
}

export function exportToGeoJSON(features: any[], filename: string): void {
  const fc = { type: 'FeatureCollection', features };
  downloadFile(JSON.stringify(fc, null, 2), `${filename}.geojson`, 'application/json');
}

export function exportToKML(geojson: any, filename: string): void {
  // Simple KML export from GeoJSON
  const placemarks = geojson.features?.map((f: any) => {
    const name = f.properties?.name || f.properties?.code || 'Feature';
    const desc = f.properties?.description || '';
    if (f.geometry?.type === 'Point') {
      const [lng, lat] = f.geometry.coordinates;
      return `<Placemark><name>${name}</name><description>${desc}</description><Point><coordinates>${lng},${lat},0</coordinates></Point></Placemark>`;
    } else if (f.geometry?.type === 'LineString') {
      const coords = f.geometry.coordinates.map((c: number[]) => `${c[0]},${c[1]},0`).join(' ');
      return `<Placemark><name>${name}</name><LineString><coordinates>${coords}</coordinates></LineString></Placemark>`;
    } else if (f.geometry?.type === 'Polygon') {
      const coords = f.geometry.coordinates[0].map((c: number[]) => `${c[0]},${c[1]},0`).join(' ');
      return `<Placemark><name>${name}</name><Polygon><outerBoundaryIs><LinearRing><coordinates>${coords}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`;
    }
    return '';
  }).join('\n') ?? '';
  const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n${placemarks}\n</Document>\n</kml>`;
  downloadFile(kmlContent, `${filename}.kml`, 'application/vnd.google-earth.kml+xml');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Import functions ---

export interface ImportResult {
  rows: Record<string, any>[];
  errors: { row: number; message: string }[];
  format: string;
  totalRows: number;
  validRows: number;
}

export function parseCSV(text: string): ImportResult {
  const errors: { row: number; message: string }[] = [];
  const lines = text.trim().split('\n');
  if (lines.length < 2) return { rows: [], errors: [{ row: 0, message: 'CSV must have a header row and at least one data row' }], format: 'csv', totalRows: 0, validRows: 0 };
  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, any>[] = [];
  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i]);
      if (values.length !== headers.length) {
        errors.push({ row: i, message: `Expected ${headers.length} columns, got ${values.length}` });
        continue;
      }
      const row: Record<string, any> = {};
      headers.forEach((h, j) => { row[h] = values[j]; });
      rows.push(row);
    } catch (err) {
      errors.push({ row: i, message: String(err) });
    }
  }
  return { rows, errors, format: 'csv', totalRows: lines.length - 1, validRows: rows.length };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseJSON(text: string): ImportResult {
  try {
    const data = JSON.parse(text);
    const rows = Array.isArray(data) ? data : [data];
    return { rows, errors: [], format: 'json', totalRows: rows.length, validRows: rows.length };
  } catch (err) {
    return { rows: [], errors: [{ row: 0, message: `Invalid JSON: ${err}` }], format: 'json', totalRows: 0, validRows: 0 };
  }
}

export function parseGeoJSON(text: string): ImportResult {
  try {
    const data = JSON.parse(text);
    if (data.type !== 'FeatureCollection') {
      return { rows: [], errors: [{ row: 0, message: 'Not a valid GeoJSON FeatureCollection' }], format: 'geojson', totalRows: 0, validRows: 0 };
    }
    const rows = (data.features || []).map((f: any) => ({
      ...f.properties,
      _geometry: f.geometry,
      _geometryType: f.geometry?.type,
    }));
    return { rows, errors: [], format: 'geojson', totalRows: rows.length, validRows: rows.length };
  } catch (err) {
    return { rows: [], errors: [{ row: 0, message: `Invalid GeoJSON: ${err}` }], format: 'geojson', totalRows: 0, validRows: 0 };
  }
}

export function parseKML(text: string): ImportResult {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/xml');
    const fc = kml(doc) as any;
    const rows = (fc.features || []).map((f: any) => ({
      ...f.properties,
      _geometry: f.geometry,
      _geometryType: f.geometry?.type,
    }));
    return { rows, errors: [], format: 'kml', totalRows: rows.length, validRows: rows.length };
  } catch (err) {
    return { rows: [], errors: [{ row: 0, message: `Invalid KML: ${err}` }], format: 'kml', totalRows: 0, validRows: 0 };
  }
}

export function parseFile(text: string, format: string): ImportResult {
  switch (format.toLowerCase()) {
    case 'csv': return parseCSV(text);
    case 'json': return parseJSON(text);
    case 'geojson': return parseGeoJSON(text);
    case 'kml': return parseKML(text);
    default: return { rows: [], errors: [{ row: 0, message: `Unsupported format: ${format}` }], format, totalRows: 0, validRows: 0 };
  }
}

export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
