/**
 * GIS Loader — auto-discovers and converts KML/KMZ/GeoJSON/GPX/WKT files to GeoJSON at startup.
 * Caches converted layers in Supabase for fast subsequent loads.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { kml } from '@tmcw/togeojson';
import * as wellknown from 'wellknown';

export type LayerFormat = 'kml' | 'kmz' | 'geojson' | 'gpx' | 'wkt';
export type LayerCategory = 'administrative' | 'infrastructure' | 'amenity' | 'environment' | 'fleet' | 'monitoring';

export interface GisLayerMeta {
  id: string;
  sourceFile: string;
  format: LayerFormat;
  featureCount: number;
  loadedAt: string;
}

export interface GisLayer extends GisLayerMeta {
  geojson: GeoJSON.FeatureCollection;
}

export interface LayerConfig {
  id: string;
  file: string;
  format: LayerFormat;
  label: string;
  labelAr: string;
  category: LayerCategory;
  color: string;
  geometryType: 'point' | 'line' | 'polygon' | 'mixed';
  group: string;
  groupAr: string;
}

// Complete layer registry — all GIS layers in /assets/gis/
export const LAYER_CONFIGS: LayerConfig[] = [
  // Administrative
  { id: 'commune_boundary', file: 'Commune_Boundary.kml', format: 'kml', label: 'Commune Boundary', labelAr: 'حدود البلدية', category: 'administrative', color: '#0F4C81', geometryType: 'polygon', group: 'Administrative', groupAr: 'إداري' },
  { id: 'zones', file: 'Zones.geojson', format: 'geojson', label: 'Operational Zones', labelAr: 'مناطق التشغيل', category: 'administrative', color: '#F59E0B', geometryType: 'polygon', group: 'Administrative', groupAr: 'إداري' },
  { id: 'neighborhoods', file: 'Neighborhoods.geojson', format: 'geojson', label: 'Neighborhoods', labelAr: 'الأحياء', category: 'administrative', color: '#14B8A6', geometryType: 'polygon', group: 'Administrative', groupAr: 'إداري' },
  // Infrastructure
  { id: 'routes', file: 'Routes_Khenchela.kml', format: 'kml', label: 'Road Network', labelAr: 'شبكة الطرقات', category: 'infrastructure', color: '#16A34A', geometryType: 'line', group: 'Infrastructure', groupAr: 'البنية التحتية' },
  { id: 'buildings', file: 'Buildings.geojson', format: 'geojson', label: 'Buildings', labelAr: 'المباني', category: 'infrastructure', color: '#64748B', geometryType: 'polygon', group: 'Infrastructure', groupAr: 'البنية التحتية' },
  { id: 'schools', file: 'Schools.kml', format: 'kml', label: 'Schools', labelAr: 'المدارس', category: 'amenity', color: '#8B5CF6', geometryType: 'point', group: 'Infrastructure', groupAr: 'البنية التحتية' },
  { id: 'mosques', file: 'Mosques.kml', format: 'kml', label: 'Mosques', labelAr: 'المساجد', category: 'amenity', color: '#16A34A', geometryType: 'point', group: 'Infrastructure', groupAr: 'البنية التحتية' },
  { id: 'hospitals', file: 'Hospitals.kml', format: 'kml', label: 'Health Facilities', labelAr: 'المرافق الصحية', category: 'amenity', color: '#DC2626', geometryType: 'point', group: 'Infrastructure', groupAr: 'البنية التحتية' },
  { id: 'administrations', file: 'Administrations.kml', format: 'kml', label: 'Public Administrations', labelAr: 'الإدارات العمومية', category: 'administrative', color: '#0F4C81', geometryType: 'point', group: 'Infrastructure', groupAr: 'البنية التحتية' },
  { id: 'markets', file: 'Markets.kml', format: 'kml', label: 'Markets', labelAr: 'الأسواق', category: 'amenity', color: '#14B8A6', geometryType: 'point', group: 'Infrastructure', groupAr: 'البنية التحتية' },
  { id: 'parks', file: 'Parks.geojson', format: 'geojson', label: 'Public Parks', labelAr: 'الحدائق العمومية', category: 'amenity', color: '#22C55E', geometryType: 'polygon', group: 'Infrastructure', groupAr: 'البنية التحتية' },
  { id: 'industrial', file: 'IndustrialZones.geojson', format: 'geojson', label: 'Industrial Zones', labelAr: 'المناطق الصناعية', category: 'infrastructure', color: '#F97316', geometryType: 'polygon', group: 'Infrastructure', groupAr: 'البنية التحتية' },
  // Environment
  { id: 'containers', file: 'Containers.geojson', format: 'geojson', label: 'Waste Containers', labelAr: 'حاويات النفايات', category: 'environment', color: '#0F4C81', geometryType: 'point', group: 'Environment', groupAr: 'البيئة' },
  { id: 'blackspots', file: 'BlackSpots.geojson', format: 'geojson', label: 'Black Spots', labelAr: 'النقاط السوداء', category: 'environment', color: '#DC2626', geometryType: 'point', group: 'Environment', groupAr: 'البيئة' },
  { id: 'illegal_dumping', file: 'IllegalDumping.geojson', format: 'geojson', label: 'Illegal Dumping Sites', labelAr: 'مواقع التفريغ العشوائي', category: 'environment', color: '#F59E0B', geometryType: 'point', group: 'Environment', groupAr: 'البيئة' },
  { id: 'commercial', file: 'Commercial.geojson', format: 'geojson', label: 'Commercial Shops', labelAr: 'المحلات التجارية', category: 'environment', color: '#14B8A6', geometryType: 'point', group: 'Environment', groupAr: 'البيئة' },
  { id: 'inspection_routes', file: 'Inspection.geojson', format: 'geojson', label: 'Inspection Routes', labelAr: 'مسارات التفتيش', category: 'environment', color: '#F59E0B', geometryType: 'line', group: 'Environment', groupAr: 'البيئة' },
  // Fleet
  { id: 'vehicles', file: 'Vehicles.geojson', format: 'geojson', label: 'Vehicles', labelAr: 'المركبات', category: 'fleet', color: '#16A34A', geometryType: 'point', group: 'Fleet', groupAr: 'الأسطول' },
  { id: 'cet_centers', file: 'CETCenters.geojson', format: 'geojson', label: 'CET Centers', labelAr: 'مراكز الطرح التقني', category: 'fleet', color: '#8B5CF6', geometryType: 'point', group: 'Fleet', groupAr: 'الأسطول' },
];

// Auto-discover any additional GIS files not in the registry
const kmlModules = import.meta.glob('/assets/gis/*.kml', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const geojsonModules = import.meta.glob('/assets/gis/*.geojson', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const gpxModules = import.meta.glob('/assets/gis/*.gpx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const wktModules = import.meta.glob('/assets/gis/*.wkt', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

// --- Conversion functions ---

function parseKml(xmlText: string): GeoJSON.FeatureCollection {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  return kml(doc) as GeoJSON.FeatureCollection;
}

function parseGeoJSON(text: string): GeoJSON.FeatureCollection {
  const parsed = JSON.parse(text);
  if (parsed.type === 'FeatureCollection') return parsed;
  if (parsed.type === 'Feature') return { type: 'FeatureCollection', features: [parsed] };
  return { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: parsed, properties: {} }] };
}

function parseGpx(text: string): GeoJSON.FeatureCollection {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');
  return kml(doc) as GeoJSON.FeatureCollection;
}

function parseWkt(text: string): GeoJSON.FeatureCollection {
  const lines = text.trim().split('\n').filter((l) => l.trim());
  const features: GeoJSON.Feature[] = [];
  for (const line of lines) {
    const geom = (wellknown as any).parse(line.trim());
    if (geom) features.push({ type: 'Feature', geometry: geom, properties: {} });
  }
  return { type: 'FeatureCollection', features };
}

function convertLayer(format: LayerFormat, raw: string): GeoJSON.FeatureCollection {
  switch (format) {
    case 'kml': return parseKml(raw);
    case 'geojson': return parseGeoJSON(raw);
    case 'gpx': return parseGpx(raw);
    case 'wkt': return parseWkt(raw);
    case 'kmz':
      throw new Error('KMZ requires decompression — please provide unzipped KML');
    default: throw new Error(`Unsupported format: ${format}`);
  }
}

// --- File resolution ---

function getRawFile(fileName: string, format: LayerFormat): string | null {
  const modules =
    format === 'kml' ? kmlModules :
    format === 'geojson' ? geojsonModules :
    format === 'gpx' ? gpxModules :
    format === 'wkt' ? wktModules : {};
  const key = Object.keys(modules).find((k) => k.endsWith(`/${fileName}`));
  return key ? modules[key] : null;
}

// --- Checksum for change detection ---

async function checksum(text: string): Promise<string> {
  if (crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return h.toString(16);
}

// --- Main loader ---

let supabase: SupabaseClient | null = null;
const layerCache = new Map<string, GisLayer>();
const listeners = new Set<(layers: Map<string, GisLayer>) => void>();

function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  supabase = createClient(url, key);
  return supabase;
}

export function subscribeLayers(cb: (layers: Map<string, GisLayer>) => void): () => void {
  listeners.add(cb);
  cb(new Map(layerCache));
  return () => listeners.delete(cb);
}

function notifyListeners() {
  const snapshot = new Map(layerCache);
  listeners.forEach((cb) => cb(snapshot));
}

/**
 * Load all GIS layers from /assets/gis/, convert to GeoJSON, and cache in Supabase.
 * Auto-discovers any GIS files not in the registry.
 */
function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

export async function loadAllGisLayers(): Promise<Map<string, GisLayer>> {
  const sb = getSupabase();

  // Load cached layers from Supabase (with timeout so app doesn't hang)
  const cachedLayers = new Map<string, GisLayer & { checksum?: string }>();
  if (sb) {
    try {
      const { data: cached } = await withTimeout(
        sb.from('gis_layers').select('*'),
        5000,
      );
      if (cached) {
        for (const row of cached) {
          cachedLayers.set(row.id, {
            id: row.id,
            sourceFile: row.source_file,
            format: row.source_format as LayerFormat,
            featureCount: row.feature_count,
            loadedAt: row.loaded_at,
            geojson: row.geojson,
            checksum: row.checksum,
          });
        }
      }
    } catch {
      // Supabase unavailable or timeout — proceed without cache
    }
  }

  // Process each registered layer
  for (const config of LAYER_CONFIGS) {
    const raw = getRawFile(config.file, config.format);
    if (!raw) {
      if (cachedLayers.has(config.id)) {
        const c = cachedLayers.get(config.id)!;
        layerCache.set(config.id, { id: c.id, sourceFile: c.sourceFile, format: c.format, featureCount: c.featureCount, loadedAt: c.loadedAt, geojson: c.geojson });
      }
      continue;
    }

    const cs = await checksum(raw);
    const cached = cachedLayers.get(config.id);

    if (cached && cached.checksum === cs) {
      layerCache.set(config.id, { id: cached.id, sourceFile: cached.sourceFile, format: cached.format, featureCount: cached.featureCount, loadedAt: cached.loadedAt, geojson: cached.geojson });
      continue;
    }

    try {
      const geojson = convertLayer(config.format, raw);
      const layer: GisLayer = {
        id: config.id, sourceFile: config.file, format: config.format,
        featureCount: geojson.features.length, loadedAt: new Date().toISOString(), geojson,
      };
      layerCache.set(config.id, layer);
      if (sb) {
        try {
          await withTimeout(
            sb.from('gis_layers').upsert({
              id: config.id, source_file: config.file, source_format: config.format,
              geojson: geojson as any, feature_count: geojson.features.length,
              loaded_at: new Date().toISOString(), checksum: cs,
            }),
            5000,
          );
        } catch {
          // Cache write failed or timed out — non-critical
        }
      }
    } catch (err) {
      console.error(`Failed to convert layer ${config.id}:`, err);
      if (cached) layerCache.set(config.id, { id: cached.id, sourceFile: cached.sourceFile, format: cached.format, featureCount: cached.featureCount, loadedAt: cached.loadedAt, geojson: cached.geojson });
    }
  }

  notifyListeners();
  return new Map(layerCache);
}

export function getLayer(id: string): GisLayer | undefined {
  return layerCache.get(id);
}

export function getAllLayers(): Map<string, GisLayer> {
  return new Map(layerCache);
}

export function getLayerConfig(id: string): LayerConfig | undefined {
  return LAYER_CONFIGS.find((c) => c.id === id);
}

export function getLayersByGroup(): Map<string, LayerConfig[]> {
  const groups = new Map<string, LayerConfig[]>();
  for (const cfg of LAYER_CONFIGS) {
    if (!groups.has(cfg.group)) groups.set(cfg.group, []);
    groups.get(cfg.group)!.push(cfg);
  }
  return groups;
}

export function getCommuneBoundary(): GeoJSON.Feature | null {
  const layer = layerCache.get('commune_boundary');
  if (!layer || layer.geojson.features.length === 0) return null;
  return layer.geojson.features[0];
}
