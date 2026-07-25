/**
 * Attribute Table — shows feature properties for a GIS layer in a sortable table.
 */

import { useState, useMemo } from 'react';
import { X, Search, ArrowUpDown, Download } from 'lucide-react';
import { getLayer } from '@/lib/gisLoader';
import { cn } from '@/lib/cn';

interface AttributeTableProps {
  layerId: string;
  onClose: () => void;
}

export function AttributeTable({ layerId, onClose }: AttributeTableProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const layer = getLayer(layerId);
  const features = layer?.geojson.features ?? [];

  // Extract all property keys
  const columns = useMemo(() => {
    const keys = new Set<string>();
    features.forEach((f) => {
      if (f.properties) Object.keys(f.properties).forEach((k) => keys.add(k));
    });
    return Array.from(keys).slice(0, 12);
  }, [features]);

  const filteredFeatures = useMemo(() => {
    let result = features;
    if (search) {
      result = result.filter((f) => {
        const props = f.properties || {};
        return Object.values(props).some((v) => String(v).toLowerCase().includes(search.toLowerCase()));
      });
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const av = a.properties?.[sortKey];
        const bv = b.properties?.[sortKey];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
        return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }
    return result;
  }, [features, search, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const exportCSV = () => {
    const headers = columns.join(',');
    const rows = filteredFeatures.map((f) => {
      const props = f.properties || {};
      return columns.map((c) => `"${String(props[c] ?? '').replace(/"/g, '""')}"`).join(',');
    });
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${layerId}_attributes.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!layer) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[600] h-72 glass-strong border-t border-ink-200 dark:border-ink-800 shadow-lifted flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-ink-200/70 dark:border-ink-800/70">
        <span className="text-sm font-semibold text-ink-900 dark:text-white">{layerId} — Attribute Table</span>
        <span className="text-xs text-ink-400">{filteredFeatures.length} / {features.length} features</span>
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter..."
            className="bg-ink-50 dark:bg-ink-800/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-ink-800 dark:text-ink-100 outline-none w-48"
          />
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
        <button onClick={onClose} className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-ink-50 dark:bg-ink-800/80 backdrop-blur">
            <tr>
              <th className="px-2 py-2 text-left text-[10px] font-bold text-ink-400 w-8">#</th>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => toggleSort(col)}
                  className="px-3 py-2 text-right cursor-pointer hover:bg-ink-100 dark:hover:bg-ink-700/50 transition whitespace-nowrap"
                >
                  <span className="flex items-center gap-1 justify-end">
                    {col}
                    <ArrowUpDown className={cn('w-2.5 h-2.5', sortKey === col ? 'text-brand-500' : 'text-ink-300')} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredFeatures.slice(0, 200).map((f, i) => (
              <tr
                key={i}
                onClick={() => setSelectedRow(selectedRow === i ? null : i)}
                className={cn(
                  'border-t border-ink-100 dark:border-ink-800/50 cursor-pointer transition',
                  selectedRow === i ? 'bg-brand-50 dark:bg-brand-600/10' : 'hover:bg-ink-50 dark:hover:bg-ink-800/40'
                )}
              >
                <td className="px-2 py-1.5 text-[10px] text-ink-400 tabular-nums">{i + 1}</td>
                {columns.map((col) => {
                  const val = f.properties?.[col];
                  return (
                    <td key={col} className="px-3 py-1.5 text-right text-ink-700 dark:text-ink-200 whitespace-nowrap max-w-[200px] truncate">
                      {val == null ? '—' : typeof val === 'object' ? JSON.stringify(val).slice(0, 30) : String(val)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
