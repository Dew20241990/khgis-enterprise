/**
 * Layer Manager — ArcGIS Enterprise style layer control panel.
 * Supports: visibility, opacity, labels, search, feature count, color,
 * grouping, legend, zoom-to, metadata, lock, export, filter, selection, attribute table.
 */

import { useState, useMemo } from 'react';
import {
  Eye, EyeOff, Lock, Unlock, Search, ChevronDown, ChevronRight, Download,
  Info, ZoomIn, Table2, Filter, Palette, Tag, Layers, Sliders, X, FileDown,
  Circle, Square as SquareIcon, Triangle, MapPin, AlertTriangle, Truck,
  Building2, Home, School, HeartPulse, Landmark, ShoppingBag, Trees, Factory,
  Waypoints, Trash2, Crosshair,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LAYER_CONFIGS, getLayer, getLayersByGroup, type LayerConfig, type GisLayer,
} from '@/lib/gisLoader';
import { cn } from '@/lib/cn';
import { useApp } from '@/store/appStore';

export interface LayerState {
  visible: boolean;
  opacity: number;
  showLabels: boolean;
  locked: boolean;
  selected: boolean;
}

interface LayerManagerProps {
  layerStates: Record<string, LayerState>;
  onToggleVisibility: (id: string) => void;
  onOpacityChange: (id: string, opacity: number) => void;
  onToggleLabels: (id: string) => void;
  onToggleLock: (id: string) => void;
  onZoomTo: (id: string) => void;
  onExport: (id: string) => void;
  onPrint: (id: string) => void;
  onFilter: (id: string) => void;
  onShowTable: (id: string) => void;
  onShowMetadata: (id: string) => void;
}

function getLayerIcon(id: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    commune_boundary: <MapPin className="w-4 h-4" />,
    zones: <SquareIcon className="w-4 h-4" />,
    neighborhoods: <Home className="w-4 h-4" />,
    routes: <Waypoints className="w-4 h-4" />,
    buildings: <Building2 className="w-4 h-4" />,
    schools: <School className="w-4 h-4" />,
    mosques: <Landmark className="w-4 h-4" />,
    hospitals: <HeartPulse className="w-4 h-4" />,
    administrations: <Building2 className="w-4 h-4" />,
    markets: <ShoppingBag className="w-4 h-4" />,
    parks: <Trees className="w-4 h-4" />,
    industrial: <Factory className="w-4 h-4" />,
    containers: <Trash2 className="w-4 h-4" />,
    blackspots: <AlertTriangle className="w-4 h-4" />,
    illegal_dumping: <AlertTriangle className="w-4 h-4" />,
    commercial: <ShoppingBag className="w-4 h-4" />,
    inspection_routes: <Crosshair className="w-4 h-4" />,
    vehicles: <Truck className="w-4 h-4" />,
    cet_centers: <Factory className="w-4 h-4" />,
  };
  return icons[id] ?? <Circle className="w-4 h-4" />;
}

function getGeometryIcon(type: string): React.ReactNode {
  switch (type) {
    case 'point': return <MapPin className="w-3 h-3" />;
    case 'line': return <Waypoints className="w-3 h-3" />;
    case 'polygon': return <SquareIcon className="w-3 h-3" />;
    default: return <Triangle className="w-3 h-3" />;
  }
}

export function LayerManager(props: LayerManagerProps) {
  const { t } = useApp();
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Administrative', 'Infrastructure', 'Environment', 'Fleet']));
  const [expandedLayer, setExpandedLayer] = useState<string | null>(null);

  const groups = useMemo(() => getLayersByGroup(), []);

  const filteredGroups = useMemo(() => {
    if (!search) return groups;
    const filtered = new Map<string, LayerConfig[]>();
    for (const [group, configs] of groups) {
      const matching = configs.filter(c =>
        c.labelAr.includes(search) || c.label.toLowerCase().includes(search.toLowerCase())
      );
      if (matching.length > 0) filtered.set(group, matching);
    }
    return filtered;
  }, [groups, search]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="p-3 border-b border-ink-200/70 dark:border-ink-800/70">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchLayers')}
            className="w-full bg-ink-50 dark:bg-ink-800/60 rounded-lg pl-8 pr-3 py-2 text-xs text-ink-800 dark:text-ink-100 placeholder-ink-400 outline-none focus:ring-2 ring-brand-500/30"
          />
        </div>
      </div>

      {/* Layer groups */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {Array.from(filteredGroups.entries()).map(([group, configs]) => (
          <div key={group}>
            <button
              onClick={() => toggleGroup(group)}
              className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800/60 transition"
            >
              {expandedGroups.has(group) ? <ChevronDown className="w-3.5 h-3.5 text-ink-400" /> : <ChevronRight className="w-3.5 h-3.5 text-ink-400" />}
              <span className="text-xs font-bold text-ink-700 dark:text-ink-200 flex-1 text-right">{configs[0]?.groupAr || group}</span>
              <span className="text-[10px] text-ink-400">{configs.length}</span>
            </button>

            <AnimatePresence>
              {expandedGroups.has(group) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {configs.map((cfg) => {
                    const state = props.layerStates[cfg.id] ?? { visible: true, opacity: 1, showLabels: false, locked: false, selected: false };
                    const layer = getLayer(cfg.id);
                    const featureCount = layer?.featureCount ?? 0;
                    const isExpanded = expandedLayer === cfg.id;

                    return (
                      <div key={cfg.id} className="mb-0.5">
                        <div
                          className={cn(
                            'flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition cursor-pointer',
                            state.selected ? 'bg-brand-50 dark:bg-brand-600/10' : 'hover:bg-ink-50 dark:hover:bg-ink-800/60'
                          )}
                          onClick={() => setExpandedLayer(isExpanded ? null : cfg.id)}
                        >
                          {/* Visibility toggle */}
                          <button
                            onClick={(e) => { e.stopPropagation(); props.onToggleVisibility(cfg.id); }}
                            className={cn('p-0.5 rounded transition', state.visible ? 'text-brand-600 dark:text-brand-400' : 'text-ink-300 dark:text-ink-600')}
                          >
                            {state.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          {/* Color indicator */}
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: cfg.color, opacity: state.visible ? state.opacity : 0.3 }}
                          />

                          {/* Icon */}
                          <span className="text-ink-500 dark:text-ink-400 shrink-0">{getLayerIcon(cfg.id)}</span>

                          {/* Name */}
                          <span className={cn('flex-1 text-xs text-right truncate', state.visible ? 'text-ink-800 dark:text-ink-100' : 'text-ink-400 dark:text-ink-500')}>
                            {cfg.labelAr}
                          </span>

                          {/* Feature count */}
                          <span className="text-[10px] font-medium text-ink-400 tabular-nums">{featureCount}</span>

                          {/* Geometry type icon */}
                          <span className="text-ink-300 dark:text-ink-600">{getGeometryIcon(cfg.geometryType)}</span>

                          {/* Lock */}
                          <button
                            onClick={(e) => { e.stopPropagation(); props.onToggleLock(cfg.id); }}
                            className={cn('p-0.5 rounded transition', state.locked ? 'text-danger-500' : 'text-ink-300 dark:text-ink-600 hover:text-ink-500')}
                          >
                            {state.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          </button>
                        </div>

                        {/* Expanded layer controls */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 py-2 space-y-2 bg-ink-50/50 dark:bg-ink-800/30 rounded-lg mx-1 mb-1">
                                {/* Opacity slider */}
                                <div className="flex items-center gap-2">
                                  <Sliders className="w-3 h-3 text-ink-400 shrink-0" />
                                  <span className="text-[10px] text-ink-500 dark:text-ink-400 w-8">{t('opacity')}</span>
                                  <input
                                    type="range" min={0} max={100} value={state.opacity * 100}
                                    onChange={(e) => props.onOpacityChange(cfg.id, Number(e.target.value) / 100)}
                                    className="flex-1 h-1 accent-brand-500 cursor-pointer"
                                  />
                                  <span className="text-[10px] font-mono text-ink-400 w-8 text-left">{Math.round(state.opacity * 100)}%</span>
                                </div>

                                {/* Labels toggle */}
                                <button
                                  onClick={() => props.onToggleLabels(cfg.id)}
                                  className={cn('w-full flex items-center gap-2 px-2 py-1 rounded text-[10px] transition', state.showLabels ? 'bg-brand-100 dark:bg-brand-600/20 text-brand-700 dark:text-brand-300' : 'text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800')}
                                >
                                  <Tag className="w-3 h-3" />
                                  <span>{t('showLabels')}</span>
                                </button>

                                {/* Action buttons */}
                                <div className="grid grid-cols-4 gap-1">
                                  <button onClick={() => props.onZoomTo(cfg.id)} title={t('zoomToLayer')} className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-ink-500 dark:text-ink-400 hover:bg-brand-50 dark:hover:bg-brand-600/10 hover:text-brand-600 transition">
                                    <ZoomIn className="w-3.5 h-3.5" />
                                    <span className="text-[9px]">{t('zoom')}</span>
                                  </button>
                                  <button onClick={() => props.onShowTable(cfg.id)} title={t('attributeTable')} className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-ink-500 dark:text-ink-400 hover:bg-brand-50 dark:hover:bg-brand-600/10 hover:text-brand-600 transition">
                                    <Table2 className="w-3.5 h-3.5" />
                                    <span className="text-[9px]">{t('table')}</span>
                                  </button>
                                  <button onClick={() => props.onFilter(cfg.id)} title={t('filter')} className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-ink-500 dark:text-ink-400 hover:bg-brand-50 dark:hover:bg-brand-600/10 hover:text-brand-600 transition">
                                    <Filter className="w-3.5 h-3.5" />
                                    <span className="text-[9px]">{t('filter')}</span>
                                  </button>
                                  <button onClick={() => props.onShowMetadata(cfg.id)} title={t('metadata')} className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-ink-500 dark:text-ink-400 hover:bg-brand-50 dark:hover:bg-brand-600/10 hover:text-brand-600 transition">
                                    <Info className="w-3.5 h-3.5" />
                                    <span className="text-[9px]">{t('info')}</span>
                                  </button>
                                  <button onClick={() => props.onExport(cfg.id)} title={t('exportLayer')} className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-ink-500 dark:text-ink-400 hover:bg-brand-50 dark:hover:bg-brand-600/10 hover:text-brand-600 transition">
                                    <FileDown className="w-3.5 h-3.5" />
                                    <span className="text-[9px]">{t('export')}</span>
                                  </button>
                                  <button onClick={() => props.onPrint(cfg.id)} title={t('printLayer')} className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-ink-500 dark:text-ink-400 hover:bg-brand-50 dark:hover:bg-brand-600/10 hover:text-brand-600 transition">
                                    <Download className="w-3.5 h-3.5" />
                                    <span className="text-[9px]">{t('print')}</span>
                                  </button>
                                </div>

                                {/* Legend swatch */}
                                <div className="flex items-center gap-2 pt-1 border-t border-ink-200/50 dark:border-ink-700/50">
                                  <span className="w-4 h-4 rounded shrink-0" style={{ background: cfg.color }} />
                                  <span className="text-[10px] text-ink-500 dark:text-ink-400">{cfg.label}</span>
                                  <span className="text-[10px] text-ink-300 dark:text-ink-600 ml-auto">{cfg.format.toUpperCase()}</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
