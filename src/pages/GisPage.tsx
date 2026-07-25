import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, GeoJSON as LeafletGeoJSON, CircleMarker, Popup,
  ScaleControl, useMap, useMapEvents, Polygon as LeafletPolygon, Circle as LeafletCircle,
  Polyline, Marker, Tooltip as LeafletTooltip,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Layers, Ruler, Search, MapPin, Crosshair, Maximize2, Minimize2,
  Navigation, Eye, Flame, Satellite, Waypoints, Image as ImageIcon,
  ChevronLeft, Map as MapIcon, Trash2, AlertTriangle,
  Compass, PenTool, Circle as CircleIcon, Square, MapPin as PinIcon, Share2, Download,
  Sun, Moon, ZoomIn, ShieldCheck, Printer, Bookmark, SplitSquareHorizontal,
  Clock, X, Info, MousePointerClick, Layers2, Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/store/appStore';
import {
  LAYER_CONFIGS, getLayer, getLayersByGroup, getCommuneBoundary,
  subscribeLayers, type GisLayer, type LayerConfig,
} from '@/lib/gisLoader';
import {
  calcBBox, calcArea, calcLength, formatCoordinates, formatDistance, formatArea,
} from '@/lib/spatialEngine';
import { LayerManager, type LayerState } from '@/components/gis/LayerManager';
import { AttributeTable } from '@/components/gis/AttributeTable';
import { CoordinateInspector } from '@/components/gis/CoordinateInspector';
import { MetadataPanel } from '@/components/gis/MetadataPanel';
import { KHENCHELA_CENTER } from '@/data/mockData';
import { cn } from '@/lib/cn';

type Basemap = 'osm' | 'google_sat' | 'esri_sat' | 'carto_light' | 'carto_dark' | 'terrain';
type DrawTool = 'polygon' | 'circle' | 'rectangle' | 'marker' | 'polyline' | null;
type MeasureMode = 'distance' | 'area' | null;
type PanelTab = 'layers' | 'search' | 'bookmarks' | 'analysis';
type CursorMode = 'pan' | 'draw' | 'measure' | 'identify';

const basemapUrls: Record<Basemap, { url: string; attribution: string; maxZoom: number; subdomains?: string[] }> = {
  osm: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: 'OSM', maxZoom: 19 },
  google_sat: { url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', attribution: 'Google', maxZoom: 21, subdomains: ['0', '1', '2', '3'] },
  esri_sat: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: 'Esri', maxZoom: 19 },
  carto_light: { url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', attribution: 'Carto', maxZoom: 20 },
  carto_dark: { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attribution: 'Carto', maxZoom: 20 },
  terrain: { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attribution: 'OpenTopoMap', maxZoom: 17 },
};

// --- Map helper components ---

function MapBoundsController({ maxBounds }: { maxBounds: L.LatLngBounds | null }) {
  const map = useMap();
  useEffect(() => {
    if (maxBounds) map.setMaxBounds(maxBounds);
  }, [map, maxBounds]);
  return null;
}

function MouseTracker({ onMove }: { onMove: (lat: number, lng: number) => void }) {
  useMapEvents({ mousemove: (e) => onMove(e.latlng.lat, e.latlng.lng) });
  return null;
}

function MapClickHandler({
  cursorMode, drawTool, onMapClick, onDrawComplete,
}: {
  cursorMode: CursorMode;
  drawTool: DrawTool;
  onMapClick: (lat: number, lng: number) => void;
  onDrawComplete: (feature: GeoJSON.Feature) => void;
}) {
  const map = useMap();
  const drawPointsRef = useRef<[number, number][]>([]);
  const [drawing, setDrawing] = useState(false);

  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;

      if (cursorMode === 'identify') {
        onMapClick(lat, lng);
        return;
      }

      if (cursorMode === 'draw' && drawTool) {
        if (drawTool === 'marker') {
          onDrawComplete({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [lng, lat] },
            properties: { name: `نقطة ${Date.now()}`, drawn: true },
          });
          drawPointsRef.current = [];
          return;
        }

        if (drawTool === 'circle') {
          if (!drawing) {
            drawPointsRef.current = [[lat, lng]];
            setDrawing(true);
          } else {
            const center = drawPointsRef.current[0];
            const radius = map.distance(center, [lat, lng]);
            onDrawComplete({
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [createCirclePolygon(center, radius).map(([la, ln]) => [ln, la])],
              },
              properties: { name: `دائرة ${Date.now()}`, radius, drawn: true },
            });
            drawPointsRef.current = [];
            setDrawing(false);
          }
          return;
        }

        if (drawTool === 'rectangle') {
          if (!drawing) {
            drawPointsRef.current = [[lat, lng]];
            setDrawing(true);
          } else {
            const start = drawPointsRef.current[0];
            onDrawComplete({
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [start[1], start[0]], [lng, start[0]], [lng, lat], [start[1], lat], [start[1], start[0]],
                ]],
              },
              properties: { name: `مستطيل ${Date.now()}`, drawn: true },
            });
            drawPointsRef.current = [];
            setDrawing(false);
          }
          return;
        }

        if (drawTool === 'polygon' || drawTool === 'polyline') {
          drawPointsRef.current.push([lat, lng]);
          if (drawTool === 'polyline' && drawPointsRef.current.length >= 2) {
            // Live preview via state would need parent — keep collecting
          }
        }
      }

      if (cursorMode === 'measure') {
        drawPointsRef.current.push([lat, lng]);
        onMapClick(lat, lng); // trigger measure update
      }
    },
    dblclick: (e) => {
      if (cursorMode === 'draw' && drawTool === 'polygon' && drawPointsRef.current.length >= 3) {
        const pts = drawPointsRef.current;
        onDrawComplete({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[...pts.map(([la, ln]) => [ln, la]), [pts[0][1], pts[0][0]]]],
          },
          properties: { name: `مضلع ${Date.now()}`, drawn: true },
        });
        drawPointsRef.current = [];
      } else if (cursorMode === 'draw' && drawTool === 'polyline' && drawPointsRef.current.length >= 2) {
        const pts = drawPointsRef.current;
        onDrawComplete({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: pts.map(([la, ln]) => [ln, la]) },
          properties: { name: `خط ${Date.now()}`, drawn: true },
        });
        drawPointsRef.current = [];
      } else if (cursorMode === 'measure') {
        // Finalize measurement
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return null;
}

function createCirclePolygon(center: [number, number], radiusM: number): [number, number][] {
  const points: [number, number][] = [];
  const R = 6378137;
  const lat = (center[0] * Math.PI) / 180;
  const lng = (center[1] * Math.PI) / 180;
  for (let i = 0; i <= 64; i++) {
    const bearing = (i * 2 * Math.PI) / 64;
    const lat2 = Math.asin(Math.sin(lat) * Math.cos(radiusM / R) + Math.cos(lat) * Math.sin(radiusM / R) * Math.cos(bearing));
    const lng2 = lng + Math.atan2(Math.sin(bearing) * Math.sin(radiusM / R) * Math.cos(lat), Math.cos(radiusM / R) - Math.sin(lat) * Math.sin(lat2));
    points.push([(lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI]);
  }
  return points;
}

// --- Style helpers ---

function getGeoJSONStyle(config: LayerConfig, opacity: number): L.PathOptions {
  const styles: Record<string, Partial<L.PathOptions>> = {
    commune_boundary: { color: '#0F4C81', weight: 3, dashArray: '8 4', fillOpacity: 0.04 * opacity },
    zones: { color: '#F59E0B', weight: 2, fillOpacity: 0.08 * opacity },
    neighborhoods: { color: '#14B8A6', weight: 1, fillOpacity: 0.06 * opacity },
    routes: { color: '#16A34A', weight: 2.5, opacity: 0.7 * opacity },
    buildings: { color: '#64748B', weight: 1, fillOpacity: 0.3 * opacity },
    parks: { color: '#22C55E', weight: 1, fillOpacity: 0.2 * opacity },
    industrial: { color: '#F97316', weight: 1, fillOpacity: 0.15 * opacity },
  };
  const base = styles[config.id] ?? { color: config.color, weight: 2, fillOpacity: 0.2 * opacity };
  return { ...base, opacity: (base.opacity ?? 1) * opacity } as L.PathOptions;
}

function pointToLayer(config: LayerConfig, opacity: number) {
  return (_geoJSONPoint: any, latlng: L.LatLng) => {
    const color = config.color;
    return L.circleMarker(latlng, {
      radius: 5, fillColor: color, color, weight: 1.5, fillOpacity: 0.7 * opacity, opacity,
    });
  };
}

// --- Search result type ---
interface SearchResult {
  layerId: string;
  layerLabel: string;
  feature: GeoJSON.Feature;
  name: string;
  lat: number;
  lng: number;
}

// --- Main component ---

export function GisPage() {
  const { t } = useApp();
  const mapRef = useRef<L.Map | null>(null);
  const [basemap, setBasemap] = useState<Basemap>('osm');
  const [gisLayers, setGisLayers] = useState<Map<string, GisLayer>>(new Map());
  const [layerStates, setLayerStates] = useState<Record<string, LayerState>>({});
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [activePanel, setActivePanel] = useState<PanelTab>('layers');
  const [panelOpen, setPanelOpen] = useState(true);
  const [legendOpen, setLegendOpen] = useState(true);
  const [drawPanelOpen, setDrawPanelOpen] = useState(false);
  const [activeDrawTool, setActiveDrawTool] = useState<DrawTool>(null);
  const [measureMode, setMeasureMode] = useState<MeasureMode>(null);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measureValue, setMeasureValue] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [compass] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [heatmap, setHeatmap] = useState(false);
  const [liveGps, setLiveGps] = useState(false);
  const [snapping, setSnapping] = useState(false);
  const [tableLayerId, setTableLayerId] = useState<string | null>(null);
  const [metadataLayerId, setMetadataLayerId] = useState<string | null>(null);
  const [maxBounds, setMaxBounds] = useState<L.LatLngBounds | null>(null);
  const [bookmarks, setBookmarks] = useState<{ name: string; lat: number; lng: number; zoom: number }[]>([]);
  const [drawnFeatures, setDrawnFeatures] = useState<GeoJSON.Feature[]>([]);
  const [identifyResult, setIdentifyResult] = useState<{ lat: number; lng: number; features: { layer: string; props: Record<string, any> }[] } | null>(null);
  const [selectedSearchResult, setSelectedSearchResult] = useState<SearchResult | null>(null);
  const [cursorMode, setCursorMode] = useState<CursorMode>('pan');

  // Derived cursor mode
  useEffect(() => {
    if (activeDrawTool) setCursorMode('draw');
    else if (measureMode) setCursorMode('measure');
    else setCursorMode('pan');
  }, [activeDrawTool, measureMode]);

  // Initialize default layer states
  useEffect(() => {
    const states: Record<string, LayerState> = {};
    LAYER_CONFIGS.forEach((cfg) => {
      states[cfg.id] = { visible: cfg.id === 'commune_boundary' || cfg.id === 'routes', opacity: 1, showLabels: false, locked: false, selected: false };
    });
    setLayerStates(states);
  }, []);

  // Subscribe to GIS layer updates
  useEffect(() => {
    const unsub = subscribeLayers((layers) => setGisLayers(new Map(layers)));
    const layers = new Map<string, GisLayer>();
    LAYER_CONFIGS.forEach((cfg) => {
      const l = getLayer(cfg.id);
      if (l) layers.set(cfg.id, l);
    });
    setGisLayers(layers);
    return unsub;
  }, []);

  // Fit to commune boundary on load
  useEffect(() => {
    const boundary = getCommuneBoundary();
    if (boundary && mapRef.current) {
      try {
        const bbox = calcBBox(boundary as any);
        const bounds = L.latLngBounds(bbox[0], bbox[1]);
        mapRef.current.fitBounds(bounds, { padding: [30, 30] });
        setMaxBounds(bounds.pad(0.3));
      } catch { /* ignore */ }
    }
  }, [gisLayers]);

  // Live search across all visible layers
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    const q = search.toLowerCase();
    const results: SearchResult[] = [];
    for (const cfg of LAYER_CONFIGS) {
      const layer = gisLayers.get(cfg.id);
      if (!layer) continue;
      for (const f of layer.geojson.features) {
        const props = f.properties || {};
        const name = String(props.name || props.code || props.uuid || props.label || '');
        if (name.toLowerCase().includes(q) || cfg.labelAr.includes(q) || cfg.label.toLowerCase().includes(q)) {
          let lat = 0, lng = 0;
          if (f.geometry.type === 'Point') {
            const c = (f.geometry as any).coordinates;
            lat = c[1]; lng = c[0];
          } else {
            try {
              const bbox = calcBBox(f as any);
              lat = (bbox[0][0] + bbox[1][0]) / 2;
              lng = (bbox[0][1] + bbox[1][1]) / 2;
            } catch { continue; }
          }
          results.push({ layerId: cfg.id, layerLabel: cfg.labelAr, feature: f, name: name || cfg.labelAr, lat, lng });
          if (results.length >= 30) break;
        }
      }
      if (results.length >= 30) break;
    }
    setSearchResults(results);
  }, [search, gisLayers]);

  // Measurement calculation
  useEffect(() => {
    if (measureMode === 'distance' && measurePoints.length >= 2) {
      let total = 0;
      for (let i = 1; i < measurePoints.length; i++) {
        const from = L.latLng(measurePoints[i - 1][0], measurePoints[i - 1][1]);
        const to = L.latLng(measurePoints[i][0], measurePoints[i][1]);
        total += mapRef.current?.distance(from, to) ?? 0;
      }
      setMeasureValue(total / 1000); // km
    } else if (measureMode === 'area' && measurePoints.length >= 3) {
      const pts = measurePoints.map(([la, ln]) => [ln, la]) as [number, number][];
      const ring = [...pts, pts[0]];
      const feat: GeoJSON.Feature = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] }, properties: {} };
      try {
        const area = calcArea(feat as any);
        setMeasureValue(area);
      } catch { /* ignore */ }
    } else {
      setMeasureValue(null);
    }
  }, [measurePoints, measureMode]);

  // Layer state handlers
  const toggleVisibility = useCallback((id: string) => {
    setLayerStates((prev) => ({ ...prev, [id]: { ...prev[id], visible: !prev[id]?.visible } }));
  }, []);
  const onOpacityChange = useCallback((id: string, opacity: number) => {
    setLayerStates((prev) => ({ ...prev, [id]: { ...prev[id], opacity } }));
  }, []);
  const onToggleLabels = useCallback((id: string) => {
    setLayerStates((prev) => ({ ...prev, [id]: { ...prev[id], showLabels: !prev[id]?.showLabels } }));
  }, []);
  const onToggleLock = useCallback((id: string) => {
    setLayerStates((prev) => ({ ...prev, [id]: { ...prev[id], locked: !prev[id]?.locked } }));
  }, []);

  const onZoomTo = useCallback((id: string) => {
    const layer = getLayer(id);
    if (!layer || !mapRef.current) return;
    try {
      const bbox = calcBBox(layer.geojson as any);
      mapRef.current.fitBounds(L.latLngBounds(bbox[0], bbox[1]), { padding: [30, 30] });
    } catch { /* ignore */ }
  }, []);

  const onExport = useCallback((id: string) => {
    const layer = getLayer(id);
    if (!layer) return;
    const blob = new Blob([JSON.stringify(layer.geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${id}.geojson`; a.click();
    URL.revokeObjectURL(url);
  }, []);

  const onPrint = useCallback(() => window.print(), []);
  const onFilter = useCallback((id: string) => setTableLayerId(id), []);
  const onShowTable = useCallback((id: string) => setTableLayerId(id), []);
  const onShowMetadata = useCallback((id: string) => setMetadataLayerId(id), []);

  const zoomIn = useCallback(() => mapRef.current?.zoomIn(), []);
  const zoomOut = useCallback(() => mapRef.current?.zoomOut(), []);
  const recenter = useCallback(() => mapRef.current?.setView(KHENCHELA_CENTER, 13), []);

  const addBookmark = useCallback(() => {
    if (!mapRef.current) return;
    const c = mapRef.current.getCenter();
    const z = mapRef.current.getZoom();
    setBookmarks((prev) => [...prev, { name: `إشارة ${prev.length + 1}`, lat: c.lat, lng: c.lng, zoom: z }]);
  }, []);

  const gotoBookmark = useCallback((bm: typeof bookmarks[0]) => {
    mapRef.current?.setView([bm.lat, bm.lng], bm.zoom);
  }, []);

  const gotoSearchResult = useCallback((r: SearchResult) => {
    setSelectedSearchResult(r);
    mapRef.current?.setView([r.lat, r.lng], 16);
  }, []);

  // Draw complete handler
  const handleDrawComplete = useCallback((feature: GeoJSON.Feature) => {
    setDrawnFeatures((prev) => [...prev, feature]);
    setActiveDrawTool(null);
  }, []);

  // Map click handler for identify + measure
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (cursorMode === 'identify') {
      const results: { layer: string; props: Record<string, any> }[] = [];
      for (const cfg of LAYER_CONFIGS) {
        if (!layerStates[cfg.id]?.visible) continue;
        const layer = gisLayers.get(cfg.id);
        if (!layer) continue;
        for (const f of layer.geojson.features) {
          if (f.geometry.type === 'Point') {
            const c = (f.geometry as any).coordinates;
            const dist = Math.sqrt((c[1] - lat) ** 2 + (c[0] - lng) ** 2);
            if (dist < 0.005) {
              results.push({ layer: cfg.labelAr, props: f.properties || {} });
            }
          }
        }
      }
      setIdentifyResult({ lat, lng, features: results });
    } else if (cursorMode === 'measure') {
      setMeasurePoints((prev) => [...prev, [lat, lng]]);
    }
  }, [cursorMode, gisLayers, layerStates]);

  // Reset measure when mode changes
  useEffect(() => {
    if (!measureMode) setMeasurePoints([]);
  }, [measureMode]);

  const basemapButtons: [Basemap, React.ReactNode, string][] = [
    ['osm', <Waypoints className="w-4 h-4" />, t('osm')],
    ['google_sat', <Satellite className="w-4 h-4" />, t('googleSatellite')],
    ['esri_sat', <Satellite className="w-4 h-4" />, t('esriSatellite')],
    ['carto_light', <Sun className="w-4 h-4" />, t('cartoLight')],
    ['carto_dark', <Moon className="w-4 h-4" />, t('cartoDark')],
    ['terrain', <ImageIcon className="w-4 h-4" />, t('terrain')],
  ];

  const drawTools: { tool: DrawTool; icon: React.ReactNode; label: string }[] = [
    { tool: 'polygon', icon: <PenTool className="w-4 h-4" />, label: t('polygon') },
    { tool: 'circle', icon: <CircleIcon className="w-4 h-4" />, label: t('circle') },
    { tool: 'rectangle', icon: <Square className="w-4 h-4" />, label: t('rectangle') },
    { tool: 'marker', icon: <PinIcon className="w-4 h-4" />, label: t('marker') },
    { tool: 'polyline', icon: <Share2 className="w-4 h-4" />, label: t('polyline') },
  ];

  const totalGisFeatures = useMemo(() =>
    Array.from(gisLayers.values()).reduce((a, l) => a + l.featureCount, 0), [gisLayers]);

  const visibleLayerConfigs = useMemo(() =>
    LAYER_CONFIGS.filter((cfg) => layerStates[cfg.id]?.visible && gisLayers.has(cfg.id)),
    [layerStates, gisLayers]);

  // Heatmap points from blackspots + illegal dumping
  const heatmapPoints = useMemo(() => {
    const pts: { lat: number; lng: number; intensity: number }[] = [];
    for (const id of ['blackspots', 'illegal_dumping']) {
      const layer = gisLayers.get(id);
      if (!layer) continue;
      for (const f of layer.geojson.features) {
        if (f.geometry.type === 'Point') {
          const c = (f.geometry as any).coordinates;
          pts.push({ lat: c[1], lng: c[0], intensity: id === 'blackspots' ? 1 : 0.7 });
        }
      }
    }
    return pts;
  }, [gisLayers]);

  const mapCursorClass = cursorMode === 'draw' ? 'cursor-crosshair' : cursorMode === 'measure' ? 'cursor-crosshair' : cursorMode === 'identify' ? 'cursor-help' : '';

  return (
    <div className={cn('relative', fullscreen ? 'fixed inset-0 z-[90] -m-4 lg:-m-6' : 'h-[calc(100vh-8rem)]')}>
      <div className="relative w-full h-full rounded-xl2 overflow-hidden border border-ink-200 dark:border-ink-800 shadow-card bg-ink-100 dark:bg-ink-900">
        <div className={cn('absolute inset-0 z-[400]', mapCursorClass)}>
          <MapContainer
            center={KHENCHELA_CENTER}
            zoom={13}
            className="w-full h-full"
            zoomControl={false}
            attributionControl={false}
            ref={(m) => { if (m) mapRef.current = m; }}
            doubleClickZoom={false}
          >
            <TileLayer
              key={basemap}
              url={basemapUrls[basemap].url}
              maxZoom={basemapUrls[basemap].maxZoom}
              subdomains={basemapUrls[basemap].subdomains ?? 'abc'}
            />
            {basemap === 'google_sat' && (
              <TileLayer url="https://mt{s}.google.com/vt/lyrs=h&x={x}&y={y}&z={z}" subdomains={['0', '1', '2', '3']} maxZoom={21} />
            )}
            <ScaleControl position="bottomleft" />
            <MapBoundsController maxBounds={maxBounds} />
            <MouseTracker onMove={(lat, lng) => setMouseCoords({ lat, lng })} />
            <MapClickHandler
              cursorMode={cursorMode}
              drawTool={activeDrawTool}
              onMapClick={handleMapClick}
              onDrawComplete={handleDrawComplete}
            />

            {/* GIS Layers */}
            {visibleLayerConfigs.map((cfg) => {
              const layer = gisLayers.get(cfg.id);
              if (!layer) return null;
              const state = layerStates[cfg.id];
              const opacity = state?.opacity ?? 1;
              return (
                <LeafletGeoJSON
                  key={`${cfg.id}-${layer.loadedAt}`}
                  data={layer.geojson as any}
                  style={() => getGeoJSONStyle(cfg, opacity)}
                  pointToLayer={pointToLayer(cfg, opacity) as any}
                  onEachFeature={(feature, lyr) => {
                    const props = feature.properties || {};
                    const name = props.name || props.code || props.uuid || cfg.labelAr;
                    const desc = props.description || props.address || props.category || '';
                    lyr.bindPopup(
                      `<div style="text-align:right;min-width:180px"><p style="font-weight:bold;font-size:14px">${name}</p>${desc ? `<p style="font-size:11px;color:#64748b;margin-top:2px">${desc}</p>` : ''}<div style="margin-top:6px;padding-top:6px;border-top:1px solid #e2e8f0"><p style="font-size:10px;color:#94a3b8">${cfg.label} · ${cfg.format.toUpperCase()} · ${cfg.geometryType}</p></div></div>`
                    );
                    if (state?.showLabels) {
                      lyr.bindTooltip(name, { permanent: true, direction: 'center', className: 'text-[10px]' });
                    }
                  }}
                />
              );
            })}

            {/* Heatmap overlay circles */}
            {heatmap && heatmapPoints.map((p, i) => (
              <LeafletCircle
                key={`heat-${i}`}
                center={[p.lat, p.lng]}
                radius={120}
                pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.15 * p.intensity, weight: 0 }}
              />
            ))}

            {/* Drawn features */}
            {drawnFeatures.map((f, i) => {
              if (f.geometry.type === 'Point') {
                const c = (f.geometry as any).coordinates;
                return (
                  <Marker key={`drawn-${i}`} position={[c[1], c[0]]}>
                    <Popup><div style={{ textAlign: 'right' }}><p style={{ fontWeight: 'bold', fontSize: '14px' }}>{(f.properties as any)?.name || 'معلم مرسوم'}</p></div></Popup>
                  </Marker>
                );
              }
              if (f.geometry.type === 'Polygon') {
                const ring = (f.geometry as any).coordinates[0].map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
                return <LeafletPolygon key={`drawn-${i}`} positions={ring} pathOptions={{ color: '#0F4C81', weight: 2, dashArray: '5 5', fillOpacity: 0.1 }} />;
              }
              if (f.geometry.type === 'LineString') {
                const pts = (f.geometry as any).coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
                return <Polyline key={`drawn-${i}`} positions={pts} pathOptions={{ color: '#0F4C81', weight: 2, dashArray: '5 5' }} />;
              }
              return null;
            })}

            {/* Measurement rendering */}
            {measureMode === 'distance' && measurePoints.length >= 2 && (
              <Polyline positions={measurePoints} pathOptions={{ color: '#F59E0B', weight: 3, dashArray: '6 4' }} />
            )}
            {measureMode === 'area' && measurePoints.length >= 3 && (
              <LeafletPolygon
                positions={[...measurePoints, measurePoints[0]]}
                pathOptions={{ color: '#F59E0B', weight: 2, fillColor: '#F59E0B', fillOpacity: 0.15, dashArray: '6 4' }}
              />
            )}
            {measurePoints.map((p, i) => (
              <CircleMarker key={`mpt-${i}`} center={p} radius={4} pathOptions={{ color: '#F59E0B', fillColor: '#F59E0B', fillOpacity: 1, weight: 2 }} />
            ))}

            {/* Search result marker */}
            {selectedSearchResult && (
              <CircleMarker
                center={[selectedSearchResult.lat, selectedSearchResult.lng]}
                radius={10}
                pathOptions={{ color: '#0F4C81', fillColor: '#0F4C81', fillOpacity: 0.3, weight: 3 }}
              >
                <Popup>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{selectedSearchResult.name}</p>
                    <p style={{ fontSize: '11px', color: '#64748b' }}>{selectedSearchResult.layerLabel}</p>
                  </div>
                </Popup>
              </CircleMarker>
            )}

            {/* Identify result markers */}
            {identifyResult && (
              <CircleMarker
                center={[identifyResult.lat, identifyResult.lng]}
                radius={8}
                pathOptions={{ color: '#8B5CF6', fillColor: '#8B5CF6', fillOpacity: 0.4, weight: 3 }}
              />
            )}
          </MapContainer>
        </div>

        {/* Top toolbar */}
        <div className="absolute top-3 left-3 right-3 z-[500] flex items-center gap-2 flex-wrap">
          <div className="glass-strong rounded-xl shadow-lifted px-2 py-1.5 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-ink-400 mx-1.5" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('searchPlaceholder')}
              className="bg-transparent outline-none text-sm w-44 text-ink-800 dark:text-ink-100 placeholder-ink-400" />
            {search && searchResults.length > 0 && (
              <span className="text-xs text-brand-600 dark:text-brand-400 font-medium px-1">{searchResults.length}</span>
            )}
          </div>
          <div className="glass-strong rounded-xl shadow-lifted p-1 flex items-center gap-0.5">
            {basemapButtons.map(([key, icon, label]) => (
              <button key={key} onClick={() => setBasemap(key)} title={label}
                className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition', basemap === key ? 'bg-brand-500 text-white shadow-soft' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800')}>
                {icon}<span className="hidden xl:inline">{label}</span>
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="glass-strong rounded-xl shadow-lifted p-1 flex items-center gap-0.5">
            {/* Identify tool */}
            <button onClick={() => { setCursorMode(cursorMode === 'identify' ? 'pan' : 'identify'); setActiveDrawTool(null); setMeasureMode(null); }}
              title="تعريف المعالم"
              className={cn('p-2 rounded-lg transition', cursorMode === 'identify' ? 'bg-brand-50 dark:bg-brand-600/15 text-brand-600 dark:text-brand-400' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800')}>
              <MousePointerClick className="w-4 h-4" />
            </button>
            <button onClick={() => setDrawPanelOpen(!drawPanelOpen)} title={t('draw')}
              className={cn('p-2 rounded-lg transition', drawPanelOpen ? 'bg-brand-50 dark:bg-brand-600/15 text-brand-600 dark:text-brand-400' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800')}>
              <PenTool className="w-4 h-4" />
            </button>
            <button onClick={() => { setMeasureMode(measureMode === 'distance' ? null : 'distance'); setActiveDrawTool(null); }} title={t('measureDistance')}
              className={cn('p-2 rounded-lg transition', measureMode === 'distance' ? 'bg-brand-50 dark:bg-brand-600/15 text-brand-600 dark:text-brand-400' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800')}>
              <Ruler className="w-4 h-4" />
            </button>
            <button onClick={() => { setMeasureMode(measureMode === 'area' ? null : 'area'); setActiveDrawTool(null); }} title={t('measureArea')}
              className={cn('p-2 rounded-lg transition', measureMode === 'area' ? 'bg-brand-50 dark:bg-brand-600/15 text-brand-600 dark:text-brand-400' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800')}>
              <Square className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-ink-200 dark:bg-ink-700 mx-0.5" />
            <button onClick={() => setHeatmap(!heatmap)} title={t('heatmap')}
              className={cn('p-2 rounded-lg transition', heatmap ? 'bg-danger-100 text-danger-600 dark:bg-danger-600/20 dark:text-danger-300' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800')}>
              <Flame className="w-4 h-4" />
            </button>
            <button onClick={() => setSnapping(!snapping)} title={t('snapping')}
              className={cn('p-2 rounded-lg transition', snapping ? 'bg-success-100 text-success-600 dark:bg-success-600/20 dark:text-success-300' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800')}>
              <Crosshair className="w-4 h-4" />
            </button>
            <button onClick={() => setLiveGps(!liveGps)} title={t('liveGps')}
              className={cn('p-2 rounded-lg transition', liveGps ? 'bg-success-100 text-success-600 dark:bg-success-600/20 dark:text-success-300' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800')}>
              <Navigation className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-ink-200 dark:bg-ink-700 mx-0.5" />
            <button onClick={onPrint} title={t('printMap')}
              className="p-2 rounded-lg text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={() => onExport('commune_boundary')} title={t('exportMap')}
              className="p-2 rounded-lg text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={() => setFullscreen(!fullscreen)} title={t('fullscreen')}
              className="p-2 rounded-lg text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Zoom controls */}
        <div className="absolute right-3 top-20 z-[500] flex flex-col gap-1">
          <button onClick={zoomIn} className="glass-strong w-10 h-10 rounded-xl shadow-lifted flex items-center justify-center text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={zoomOut} className="glass-strong w-10 h-10 rounded-xl shadow-lifted flex items-center justify-center text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition text-lg font-bold">−</button>
          <button onClick={recenter} className="glass-strong w-10 h-10 rounded-xl shadow-lifted flex items-center justify-center text-brand-600 dark:text-brand-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
            <Crosshair className="w-4 h-4" />
          </button>
        </div>

        {/* Search results dropdown */}
        <AnimatePresence>
          {search && searchResults.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="absolute top-16 left-3 z-[550] w-80 glass-strong rounded-xl shadow-lifted overflow-hidden max-h-96 flex flex-col">
              <div className="px-3 py-2 border-b border-ink-200/70 dark:border-ink-800/70 flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-700 dark:text-ink-200">{searchResults.length} نتيجة</span>
                <button onClick={() => setSearch('')} className="p-0.5 text-ink-400 hover:text-ink-600"><X className="w-3.5 h-3.5" /></button>
              </div>
              <div className="overflow-y-auto flex-1">
                {searchResults.map((r, i) => (
                  <button key={i} onClick={() => gotoSearchResult(r)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-ink-50 dark:hover:bg-ink-800/60 transition text-right border-b border-ink-100/50 dark:border-ink-800/40">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: LAYER_CONFIGS.find((c) => c.id === r.layerId)?.color ?? '#0F4C81' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink-800 dark:text-ink-100 truncate">{r.name}</p>
                      <p className="text-[10px] text-ink-400">{r.layerLabel}</p>
                    </div>
                    <MapPin className="w-3 h-3 text-ink-300" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search no results */}
        <AnimatePresence>
          {search && searchResults.length === 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="absolute top-16 left-3 z-[550] w-80 glass-strong rounded-xl shadow-lifted px-3 py-4 text-center">
              <p className="text-xs text-ink-400">{t('noResults')}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drawing tools panel */}
        <AnimatePresence>
          {drawPanelOpen && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-[500] glass-strong rounded-xl shadow-lifted p-1.5 flex items-center gap-1">
              {drawTools.map((dt) => (
                <button key={dt.tool} onClick={() => { setActiveDrawTool(activeDrawTool === dt.tool ? null : dt.tool); setMeasureMode(null); setCursorMode('draw'); }} title={dt.label}
                  className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition', activeDrawTool === dt.tool ? 'bg-brand-500 text-white' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800')}>
                  {dt.icon}<span className="hidden md:inline">{dt.label}</span>
                </button>
              ))}
              <div className="w-px h-6 bg-ink-200 dark:bg-ink-700 mx-0.5" />
              <button onClick={() => setDrawnFeatures([])} className="p-2 rounded-lg text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-600/10 transition" title={t('delete')}>
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drawing instruction toast */}
        <AnimatePresence>
          {activeDrawTool && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="absolute top-28 left-1/2 -translate-x-1/2 z-[550] bg-brand-500 text-white rounded-xl shadow-lifted px-4 py-2 flex items-center gap-2 text-xs">
              <Info className="w-3.5 h-3.5" />
              <span>
                {activeDrawTool === 'polygon' && 'انقر لإضافة نقاط، انقر مرتين لإنهاء المضلع'}
                {activeDrawTool === 'polyline' && 'انقر لإضافة نقاط، انقر مرتين لإنهاء الخط'}
                {activeDrawTool === 'circle' && 'انقر لتحديد المركز، انقر مرة أخرى لتحديد نصف القطر'}
                {activeDrawTool === 'rectangle' && 'انقر لتحديد الزاوية الأولى، انقر مرة أخرى للزاوية المقابلة'}
                {activeDrawTool === 'marker' && 'انقر على الخريطة لإضافة نقطة'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Measurement instruction toast */}
        <AnimatePresence>
          {measureMode && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="absolute top-28 left-1/2 -translate-x-1/2 z-[550] bg-warning-500 text-white rounded-xl shadow-lifted px-4 py-2 flex items-center gap-2 text-xs">
              <Ruler className="w-3.5 h-3.5" />
              <span>
                {measureMode === 'distance' ? 'انقر لإضافة نقاط قياس المسافة' : 'انقر لإضافة 3 نقاط على الأقل لقياس المساحة'}
              </span>
              {measurePoints.length > 0 && (
                <button onClick={() => setMeasurePoints([])} className="mr-1 px-2 py-0.5 bg-white/20 rounded text-[10px]">مسح</button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Identify result panel */}
        <AnimatePresence>
          {identifyResult && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="absolute top-20 right-3 z-[550] w-72 glass-strong rounded-xl2 shadow-lifted overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-ink-200/70 dark:border-ink-800/70">
                <div className="flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span className="text-sm font-semibold text-ink-900 dark:text-white">تعريف المعالم</span>
                </div>
                <button onClick={() => setIdentifyResult(null)} className="p-1 rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-3 space-y-2">
                <div className="text-xs text-ink-500 dark:text-ink-400 font-mono">
                  {formatCoordinates(identifyResult.lat, identifyResult.lng)}
                </div>
                {identifyResult.features.length === 0 ? (
                  <p className="text-xs text-ink-400 text-center py-4">لا توجد معالم في هذا الموقع</p>
                ) : (
                  identifyResult.features.map((f, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-ink-50 dark:bg-ink-800/40 space-y-1">
                      <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">{f.layer}</p>
                      {Object.entries(f.props).slice(0, 6).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-[10px]">
                          <span className="text-ink-400">{k}</span>
                          <span className="text-ink-700 dark:text-ink-200 font-mono truncate max-w-[140px]">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Left panel: Layer Manager / Search / Bookmarks / Analysis */}
        <AnimatePresence>
          {panelOpen && (
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
              className="absolute top-20 left-3 z-[500] w-72 glass-strong rounded-xl2 shadow-lifted overflow-hidden flex flex-col"
              style={{ maxHeight: 'calc(100% - 6rem)' }}>
              <div className="flex items-center border-b border-ink-200/70 dark:border-ink-800/70">
                {([
                  ['layers', <Layers className="w-3.5 h-3.5" />, t('layers')],
                  ['search', <Search className="w-3.5 h-3.5" />, t('advancedSearch')],
                  ['bookmarks', <Bookmark className="w-3.5 h-3.5" />, t('bookmarks')],
                  ['analysis', <Layers2 className="w-3.5 h-3.5" />, 'تحليل'],
                ] as [PanelTab, React.ReactNode, string][]).map(([tab, icon, label]) => (
                  <button key={tab} onClick={() => setActivePanel(tab)}
                    className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition', activePanel === tab ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-500' : 'text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-200')}>
                    {icon}<span className="hidden lg:inline">{label}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-hidden">
                {activePanel === 'layers' && (
                  <LayerManager
                    layerStates={layerStates}
                    onToggleVisibility={toggleVisibility}
                    onOpacityChange={onOpacityChange}
                    onToggleLabels={onToggleLabels}
                    onToggleLock={onToggleLock}
                    onZoomTo={onZoomTo}
                    onExport={onExport}
                    onPrint={onPrint}
                    onFilter={onFilter}
                    onShowTable={onShowTable}
                    onShowMetadata={onShowMetadata}
                  />
                )}
                {activePanel === 'search' && (
                  <div className="p-4 space-y-3">
                    <p className="text-xs font-semibold text-ink-700 dark:text-ink-200">{t('advancedSearch')}</p>
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('searchPlaceholder')}
                      className="w-full bg-ink-50 dark:bg-ink-800/60 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 ring-brand-500/30" />
                    <select className="w-full bg-ink-50 dark:bg-ink-800/60 rounded-lg px-3 py-2 text-xs outline-none">
                      <option>كل الطبقات</option>
                      {LAYER_CONFIGS.map((c) => <option key={c.id} value={c.id}>{c.labelAr}</option>)}
                    </select>
                    {searchResults.length > 0 && (
                      <div className="space-y-1 max-h-64 overflow-y-auto">
                        {searchResults.map((r, i) => (
                          <button key={i} onClick={() => gotoSearchResult(r)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800/60 transition text-right">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: LAYER_CONFIGS.find((c) => c.id === r.layerId)?.color }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-ink-800 dark:text-ink-100 truncate">{r.name}</p>
                              <p className="text-[10px] text-ink-400">{r.layerLabel}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {activePanel === 'bookmarks' && (
                  <div className="p-4 space-y-2">
                    <button onClick={addBookmark} className="w-full flex items-center justify-center gap-2 bg-brand-500 text-white rounded-lg py-2 text-xs font-medium hover:bg-brand-600 transition">
                      <Bookmark className="w-3.5 h-3.5" /> إضافة إشارة
                    </button>
                    {bookmarks.length === 0 && <p className="text-xs text-ink-400 text-center py-4">لا توجد إشارات محفوظة</p>}
                    {bookmarks.map((bm, i) => (
                      <button key={i} onClick={() => gotoBookmark(bm)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800/60 transition">
                        <MapPin className="w-3.5 h-3.5 text-brand-500" />
                        <span className="flex-1 text-right">{bm.name}</span>
                        <span className="text-[10px] text-ink-400">{bm.zoom}x</span>
                      </button>
                    ))}
                  </div>
                )}
                {activePanel === 'analysis' && (
                  <div className="p-4 space-y-3">
                    <p className="text-xs font-semibold text-ink-700 dark:text-ink-200">أدوات التحليل المكاني</p>
                    <div className="space-y-1.5">
                      {[
                        { icon: <Flame className="w-3.5 h-3.5" />, label: 'خريطة حرارية للنقاط السوداء', active: heatmap, onClick: () => setHeatmap(!heatmap) },
                        { icon: <Ruler className="w-3.5 h-3.5" />, label: 'قياس مسافة', active: measureMode === 'distance', onClick: () => { setMeasureMode(measureMode === 'distance' ? null : 'distance'); setActiveDrawTool(null); } },
                        { icon: <Square className="w-3.5 h-3.5" />, label: 'قياس مساحة', active: measureMode === 'area', onClick: () => { setMeasureMode(measureMode === 'area' ? null : 'area'); setActiveDrawTool(null); } },
                        { icon: <MousePointerClick className="w-3.5 h-3.5" />, label: 'تعريف المعالم', active: cursorMode === 'identify', onClick: () => { setCursorMode(cursorMode === 'identify' ? 'pan' : 'identify'); setActiveDrawTool(null); setMeasureMode(null); } },
                      ].map((tool, i) => (
                        <button key={i} onClick={tool.onClick}
                          className={cn('w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition', tool.active ? 'bg-brand-50 dark:bg-brand-600/15 text-brand-600 dark:text-brand-400' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800/60')}>
                          {tool.icon}
                          <span className="flex-1 text-right">{tool.label}</span>
                          {tool.active && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                        </button>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-ink-200/50 dark:border-ink-700/50">
                      <p className="text-[10px] text-ink-400 mb-2">إحصائيات الطبقات المرئية</p>
                      <div className="space-y-1">
                        {visibleLayerConfigs.map((cfg) => (
                          <div key={cfg.id} className="flex items-center gap-2 text-[10px]">
                            <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                            <span className="flex-1 text-right text-ink-600 dark:text-ink-300">{cfg.labelAr}</span>
                            <span className="text-ink-400 tabular-nums">{gisLayers.get(cfg.id)?.featureCount ?? 0}</span>
                          </div>
                        ))}
                        {visibleLayerConfigs.length === 0 && <p className="text-[10px] text-ink-400">لا توجد طبقات مرئية</p>}
                      </div>
                    </div>
                    {drawnFeatures.length > 0 && (
                      <div className="pt-3 border-t border-ink-200/50 dark:border-ink-700/50">
                        <p className="text-[10px] text-ink-400 mb-2">المعالم المرسومة ({drawnFeatures.length})</p>
                        {drawnFeatures.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-[10px] py-1">
                            <PenTool className="w-3 h-3 text-brand-500" />
                            <span className="flex-1 text-right text-ink-600 dark:text-ink-300">{(f.properties as any)?.name || `معلم ${i + 1}`}</span>
                            <span className="text-ink-400">{f.geometry.type}</span>
                          </div>
                        ))}
                        <button onClick={() => setDrawnFeatures([])} className="w-full mt-1 text-[10px] text-danger-500 hover:underline">مسح الكل</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="px-3 py-2 border-t border-ink-200/70 dark:border-ink-800/70 flex items-center justify-between text-[10px] text-ink-400">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-brand-500" /> {totalGisFeatures} معالم</span>
                <span>{gisLayers.size}/{LAYER_CONFIGS.length} طبقات</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!panelOpen && (
          <button onClick={() => setPanelOpen(true)} className="absolute top-20 left-3 z-[500] glass-strong rounded-xl shadow-lifted p-2.5 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
            <Layers className="w-4 h-4" />
          </button>
        )}

        {/* Right: Legend */}
        <AnimatePresence>
          {legendOpen && !identifyResult && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}
              className="absolute top-20 right-3 z-[500] w-56 glass-strong rounded-xl2 shadow-lifted overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-ink-200/70 dark:border-ink-800/70">
                <span className="text-sm font-semibold text-ink-900 dark:text-white">{t('legend')}</span>
                <button onClick={() => setLegendOpen(false)} className="p-1 rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"><ChevronLeft className="w-4 h-4" /></button>
              </div>
              <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
                {LAYER_CONFIGS.filter((c) => layerStates[c.id]?.visible).map((cfg) => (
                  <div key={cfg.id} className="flex items-center gap-2 text-xs text-ink-600 dark:text-ink-300">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: cfg.color }} />
                    <span className="flex-1 text-right">{cfg.labelAr}</span>
                    <span className="text-[10px] text-ink-400">{gisLayers.get(cfg.id)?.featureCount ?? 0}</span>
                  </div>
                ))}
                {LAYER_CONFIGS.filter((c) => layerStates[c.id]?.visible).length === 0 && (
                  <p className="text-xs text-ink-400 text-center py-2">لا توجد طبقات مرئية</p>
                )}
                {heatmap && (
                  <div className="pt-2 mt-2 border-t border-ink-200/50 dark:border-ink-700/50">
                    <div className="flex items-center gap-2 text-xs text-ink-600 dark:text-ink-300">
                      <span className="w-3 h-3 rounded-full bg-danger-500/40" />
                      <span>خريطة حرارية</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!legendOpen && !identifyResult && (
          <button onClick={() => setLegendOpen(true)} className="absolute top-20 right-3 z-[500] glass-strong rounded-xl shadow-lifted p-2.5 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
            <Eye className="w-4 h-4" />
          </button>
        )}

        {/* Compass */}
        <div className="absolute bottom-24 left-3 z-[500] glass-strong rounded-xl shadow-lifted w-12 h-12 flex items-center justify-center">
          <Compass className="w-6 h-6 text-brand-600 dark:text-brand-400" style={{ transform: `rotate(${compass}deg)`, transition: 'transform 0.3s' }} />
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-3 left-3 z-[500] flex items-center gap-2">
          <CoordinateInspector
            lat={mouseCoords?.lat ?? null}
            lng={mouseCoords?.lng ?? null}
            measureMode={measureMode}
            measureValue={measureValue}
          />
          {liveGps && (
            <div className="glass-strong rounded-xl shadow-lifted px-3 py-2 flex items-center gap-1.5 text-xs text-success-600 dark:text-success-400">
              <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" /> GPS
            </div>
          )}
          {snapping && (
            <div className="glass-strong rounded-xl shadow-lifted px-3 py-2 flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400">
              <Crosshair className="w-3 h-3" /> {t('snapping')}
            </div>
          )}
          {heatmap && (
            <div className="glass-strong rounded-xl shadow-lifted px-3 py-2 flex items-center gap-1.5 text-xs text-danger-600 dark:text-danger-400">
              <Flame className="w-3 h-3" /> {t('heatmap')}
            </div>
          )}
        </div>

        {/* Bottom right: minimap */}
        <div className="absolute bottom-3 right-3 z-[500] flex items-center gap-2">
          <div className="glass-strong rounded-xl shadow-lifted w-28 h-20 overflow-hidden border border-ink-200/60 dark:border-ink-800/60 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-200 to-success-200 dark:from-brand-900 dark:to-success-900 opacity-40" />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-ink-600 dark:text-ink-300">{t('minimap')}</div>
          </div>
        </div>
      </div>

      {/* Attribute Table */}
      <AnimatePresence>
        {tableLayerId && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
            <AttributeTable layerId={tableLayerId} onClose={() => setTableLayerId(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metadata Panel */}
      <MetadataPanel layerId={metadataLayerId} onClose={() => setMetadataLayerId(null)} />
    </div>
  );
}
