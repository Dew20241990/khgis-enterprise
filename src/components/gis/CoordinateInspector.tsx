/**
 * Coordinate Inspector — shows live mouse coordinates, CRS info, and measurement results.
 */

import { MapPin, Crosshair, Ruler, Square, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { formatCoordinates, formatDistance, formatArea } from '@/lib/spatialEngine';
import { cn } from '@/lib/cn';

interface CoordinateInspectorProps {
  lat: number | null;
  lng: number | null;
  measureMode: 'distance' | 'area' | null;
  measureValue: number | null;
  crs?: string;
}

export function CoordinateInspector({
  lat, lng, measureMode, measureValue, crs = 'EPSG:4326',
}: CoordinateInspectorProps) {
  const [copied, setCopied] = useState(false);

  const copyCoords = () => {
    if (lat == null || lng == null) return;
    navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="glass-strong rounded-xl shadow-lifted px-3 py-2 flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
        <Crosshair className="w-3.5 h-3.5" />
        <span className="font-mono font-semibold">{crs}</span>
      </div>
      <div className="w-px h-4 bg-ink-200 dark:bg-ink-700" />
      {lat != null && lng != null ? (
        <button onClick={copyCoords} className="flex items-center gap-1.5 text-ink-700 dark:text-ink-200 hover:text-brand-600 transition">
          <MapPin className="w-3.5 h-3.5 text-brand-500" />
          <span className="font-mono">{formatCoordinates(lat, lng)}</span>
          {copied ? <Check className="w-3 h-3 text-success-500" /> : <Copy className="w-3 h-3 text-ink-400" />}
        </button>
      ) : (
        <span className="text-ink-400 text-xs">حرك الماوس لعرض الإحداثيات</span>
      )}
      {measureMode && measureValue != null && (
        <>
          <div className="w-px h-4 bg-ink-200 dark:bg-ink-700" />
          <span className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-medium">
            {measureMode === 'distance' ? <Ruler className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            {measureMode === 'distance' ? formatDistance(measureValue) : formatArea(measureValue)}
          </span>
        </>
      )}
    </div>
  );
}
