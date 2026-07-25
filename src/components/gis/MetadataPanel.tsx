/**
 * Metadata Panel — shows layer metadata in an ArcGIS-style info dialog.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Database, Calendar, User, Hash, Map as MapIcon, Layers } from 'lucide-react';
import { getLayer, getLayerConfig } from '@/lib/gisLoader';
import { calcArea, calcCenter, calcBBox } from '@/lib/spatialEngine';
import { useApp } from '@/store/appStore';

interface MetadataPanelProps {
  layerId: string | null;
  onClose: () => void;
}

export function MetadataPanel({ layerId, onClose }: MetadataPanelProps) {
  const { t } = useApp();
  if (!layerId) return null;
  const layer = getLayer(layerId);
  const config = getLayerConfig(layerId);
  if (!layer || !config) return null;

  const features = layer.geojson.features;
  const firstFeature = features[0];
  let extentStr = '—';
  let centerStr = '—';
  let areaStr = '—';

  if (firstFeature?.geometry?.type === 'Polygon') {
    try {
      const bbox = calcBBox(firstFeature as any);
      extentStr = `[${bbox[0][0].toFixed(4)}, ${bbox[0][1].toFixed(4)}] → [${bbox[1][0].toFixed(4)}, ${bbox[1][1].toFixed(4)}]`;
      const center = calcCenter(firstFeature as any);
      centerStr = `${center[0].toFixed(6)}, ${center[1].toFixed(6)}`;
      const area = calcArea(firstFeature as any);
      areaStr = `${(area / 1000000).toFixed(4)} km²`;
    } catch { /* ignore */ }
  } else if (firstFeature?.geometry?.type === 'Point') {
    const coords = (firstFeature.geometry as any).coordinates;
    centerStr = `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`;
  }

  const metadata = [
    { icon: <Hash className="w-3.5 h-3.5" />, label: 'Layer ID', value: config.id },
    { icon: <FileText className="w-3.5 h-3.5" />, label: 'Source File', value: config.file },
    { icon: <Database className="w-3.5 h-3.5" />, label: 'Format', value: config.format.toUpperCase() },
    { icon: <Layers className="w-3.5 h-3.5" />, label: 'Geometry Type', value: config.geometryType },
    { icon: <MapIcon className="w-3.5 h-3.5" />, label: 'Feature Count', value: String(layer.featureCount) },
    { icon: <MapIcon className="w-3.5 h-3.5" />, label: 'Extent', value: extentStr },
    { icon: <MapIcon className="w-3.5 h-3.5" />, label: 'Center', value: centerStr },
    { icon: <MapIcon className="w-3.5 h-3.5" />, label: 'Area', value: areaStr },
    { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Loaded At', value: new Date(layer.loadedAt).toLocaleString('ar') },
    { icon: <User className="w-3.5 h-3.5" />, label: 'Category', value: config.category },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-ink-950/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong rounded-2xl shadow-lifted w-full max-w-md mx-4 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-ink-200/70 dark:border-ink-800/70">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: config.color }} />
              <span className="text-sm font-semibold text-ink-900 dark:text-white">{config.labelAr}</span>
              <span className="text-xs text-ink-400">— {t('metadata')}</span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-3">
            <div className="text-xs text-ink-500 dark:text-ink-400 leading-relaxed">
              {config.label} — {config.category} layer from {config.file}
            </div>
            <div className="space-y-1.5">
              {metadata.map((m, i) => (
                <div key={i} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800/40 transition">
                  <span className="text-ink-400 shrink-0">{m.icon}</span>
                  <span className="text-xs text-ink-500 dark:text-ink-400 w-28 shrink-0">{m.label}</span>
                  <span className="text-xs font-mono text-ink-800 dark:text-ink-100 flex-1 text-left truncate">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

