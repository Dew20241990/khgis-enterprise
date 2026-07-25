/**
 * EnterpriseDataTable — production-grade data table with:
 * Server-ready pagination, sorting, column search, global search,
 * column visibility, sticky header, selection, bulk actions,
 * filters, density selector, fullscreen, refresh, export, print.
 */

import { useState, useMemo, useRef, useCallback, type ReactNode } from 'react';
import {
  Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowUp, ArrowDown, ArrowUpDown, Download, RefreshCw, Maximize2, Minimize2,
  Columns3, Rows3, Rows4, SlidersHorizontal, Printer, X, CheckSquare,
  Trash2, Copy, Archive, RotateCcw, MoreHorizontal, Eye, Edit, Pencil,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useApp } from '@/store/appStore';

export type Density = 'compact' | 'comfortable' | 'spacious';

export interface EnterpriseColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  width?: number;
  align?: 'right' | 'left' | 'center';
  pinned?: 'left' | 'right' | null;
  visible?: boolean;
  exportValue?: (row: T) => string | number;
}

export interface BulkAction {
  key: string;
  label: string;
  icon: ReactNode;
  tone?: 'default' | 'danger' | 'warning' | 'success';
  onClick: (selectedIds: string[]) => void;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date-range';
  options?: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

interface EnterpriseDataTableProps<T> {
  columns: EnterpriseColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;
  selectable?: boolean;
  pageSize?: number;
  title?: string;
  subtitle?: string;
  bulkActions?: BulkAction[];
  filters?: FilterConfig[];
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'json' | 'xlsx') => void;
  onPrint?: () => void;
  onQuickView?: (row: T) => void;
  onEdit?: (row: T) => void;
  emptyText?: string;
  loading?: boolean;
  contextMenu?: (row: T, close: () => void) => ReactNode;
}

export function EnterpriseDataTable<T extends Record<string, any>>({
  columns: defaultColumns,
  rows,
  rowKey,
  onRowClick,
  onRowDoubleClick,
  selectable = true,
  pageSize: defaultPageSize = 10,
  title,
  subtitle,
  bulkActions = [],
  filters = [],
  onRefresh,
  onExport,
  onPrint,
  onQuickView,
  onEdit,
  emptyText = 'لا توجد بيانات',
  loading = false,
  contextMenu,
}: EnterpriseDataTableProps<T>) {
  const { t } = useApp();
  const [columns, setColumns] = useState<EnterpriseColumn<T>[]>(defaultColumns);
  const [globalSearch, setGlobalSearch] = useState('');
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [density, setDensity] = useState<Density>('comfortable');
  const [fullscreen, setFullscreen] = useState(false);
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkBar, setShowBulkBar] = useState(false);
  const [contextMenuState, setContextMenuState] = useState<{ x: number; y: number; row: T | null }>({ x: 0, y: 0, row: null });
  const tableRef = useRef<HTMLDivElement>(null);

  // Column visibility
  const visibleColumns = useMemo(() => columns.filter((c) => c.visible !== false), [columns]);
  const pinnedLeft = useMemo(() => visibleColumns.filter((c) => c.pinned === 'left'), [visibleColumns]);
  const pinnedRight = useMemo(() => visibleColumns.filter((c) => c.pinned === 'right'), [visibleColumns]);
  const normalColumns = useMemo(() => visibleColumns.filter((c) => !c.pinned), [visibleColumns]);

  // Global + column search filtering
  const searchedRows = useMemo(() => {
    let result = rows;
    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      result = result.filter((r) =>
        visibleColumns.some((c) => {
          const val = c.exportValue ? c.exportValue(r) : (r as any)[c.key];
          return String(val ?? '').toLowerCase().includes(q);
        })
      );
    }
    for (const [key, query] of Object.entries(columnSearch)) {
      if (query) {
        result = result.filter((r) => String((r as any)[key] ?? '').toLowerCase().includes(query.toLowerCase()));
      }
    }
    return result;
  }, [rows, globalSearch, columnSearch, visibleColumns]);

  // Sorting
  const sortedRows = useMemo(() => {
    if (!sortKey) return searchedRows;
    return [...searchedRows].sort((a, b) => {
      const av = (a as any)[sortKey];
      const bv = (b as any)[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [searchedRows, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.ceil(sortedRows.length / pageSize);
  const pagedRows = useMemo(() => sortedRows.slice(page * pageSize, (page + 1) * pageSize), [sortedRows, page, pageSize]);

  // Selection
  const allOnPageSelected = pagedRows.length > 0 && pagedRows.every((r) => selected.has(rowKey(r)));
  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) pagedRows.forEach((r) => next.delete(rowKey(r)));
      else pagedRows.forEach((r) => next.add(rowKey(r)));
      return next;
    });
  }, [allOnPageSelected, pagedRows, rowKey]);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectedArray = useMemo(() => Array.from(selected), [selected]);

  // Sort handler
  const handleSort = useCallback((key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }, [sortKey, sortDir]);

  // Column visibility toggle
  const toggleColumnVisibility = useCallback((key: string) => {
    setColumns((prev) => prev.map((c) => c.key === key ? { ...c, visible: c.visible === false ? true : false } : c));
  }, []);

  // Export
  const handleExport = useCallback((format: 'csv' | 'json' | 'xlsx') => {
    if (onExport) { onExport(format); return; }
    // Built-in CSV/JSON export
    const exportRows = selectedArray.length > 0
      ? sortedRows.filter((r) => selected.has(rowKey(r)))
      : sortedRows;
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportRows, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${title ?? 'export'}.json`; a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = visibleColumns.map((c) => c.header).join(',');
      const data = exportRows.map((r) =>
        visibleColumns.map((c) => {
          const val = c.exportValue ? c.exportValue(r) : (r as any)[c.key];
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        }).join(',')
      );
      const csv = [headers, ...data].join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${title ?? 'export'}.csv`; a.click();
      URL.revokeObjectURL(url);
    }
  }, [onExport, selectedArray, sortedRows, selected, rowKey, visibleColumns, title]);

  // Context menu
  const handleContextMenu = useCallback((e: React.MouseEvent, row: T) => {
    e.preventDefault();
    setContextMenuState({ x: e.clientX, y: e.clientY, row });
  }, []);

  // Close context menu on click
  useState(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('click', () => setContextMenuState((s) => ({ ...s, row: null })));
    }
  });

  const densityClasses: Record<Density, string> = {
    compact: 'py-1.5 text-xs',
    comfortable: 'py-2.5 text-sm',
    spacious: 'py-4 text-sm',
  };

  const headerDensityClasses: Record<Density, string> = {
    compact: 'py-2 text-[10px]',
    comfortable: 'py-3 text-xs',
    spacious: 'py-3.5 text-xs',
  };

  const renderColumn = (col: EnterpriseColumn<T>, isSticky = false, stickySide: 'left' | 'right' | null = null) => {
    const isSorted = sortKey === col.key;
    return (
      <th
        key={col.key}
        onClick={() => handleSort(col.key, col.sortable)}
        className={cn(
          'font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide whitespace-nowrap select-none',
          headerDensityClasses[density],
          col.align === 'left' ? 'text-left' : col.align === 'center' ? 'text-center' : 'text-right',
          col.sortable && 'cursor-pointer hover:text-ink-700 dark:hover:text-ink-200',
          isSticky && stickySide === 'left' && 'sticky left-0 z-20 bg-ink-50 dark:bg-ink-800/90 backdrop-blur',
          isSticky && stickySide === 'right' && 'sticky right-0 z-20 bg-ink-50 dark:bg-ink-800/90 backdrop-blur',
        )}
        style={{ width: col.width, minWidth: col.width ?? 80 }}
      >
        <div className={cn('flex items-center gap-1', col.align === 'left' ? 'justify-start' : col.align === 'center' ? 'justify-center' : 'justify-end')}>
          {col.sortable && (
            isSorted ? (sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-brand-500" /> : <ArrowDown className="w-3 h-3 text-brand-500" />)
            : <ArrowUpDown className="w-3 h-3 text-ink-300 opacity-50" />
          )}
          <span>{col.header}</span>
        </div>
        {/* Column search */}
        {col.searchable && (
          <input
            onClick={(e) => e.stopPropagation()}
            value={columnSearch[col.key] ?? ''}
            onChange={(e) => setColumnSearch((prev) => ({ ...prev, [col.key]: e.target.value }))}
            placeholder="بحث..."
            className="w-full mt-1.5 px-2 py-1 text-[10px] font-normal normal-case rounded-md bg-ink-100/60 dark:bg-ink-900/60 border border-ink-200/50 dark:border-ink-700/50 outline-none focus:ring-1 ring-brand-500/30 text-ink-700 dark:text-ink-200"
          />
        )}
      </th>
    );
  };

  const renderCell = (row: T, col: EnterpriseColumn<T>, isSticky = false, stickySide: 'left' | 'right' | null = null) => {
    return (
      <td
        key={col.key}
        className={cn(
          densityClasses[density],
          'text-ink-700 dark:text-ink-200 whitespace-nowrap',
          col.align === 'left' ? 'text-left' : col.align === 'center' ? 'text-center' : 'text-right',
          isSticky && stickySide === 'left' && 'sticky left-0 z-10 bg-white dark:bg-ink-900',
          isSticky && stickySide === 'right' && 'sticky right-0 z-10 bg-white dark:bg-ink-900',
        )}
        style={{ width: col.width, minWidth: col.width ?? 80 }}
      >
        {col.render ? col.render(row) : String((row as any)[col.key] ?? '—')}
      </td>
    );
  };

  const containerClass = cn(
    'relative flex flex-col',
    fullscreen ? 'fixed inset-0 z-[200] bg-white dark:bg-ink-950 p-4' : '',
  );

  return (
    <div className={containerClass}>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {title && (
            <div className="flex items-center gap-2 mr-auto">
              <h3 className="text-sm font-semibold text-ink-900 dark:text-white">{title}</h3>
              {subtitle && <span className="text-xs text-ink-400">{subtitle}</span>}
            </div>
          )}
          {/* Global search */}
          <div className="relative">
            <Search className="w-4 h-4 text-ink-400 absolute top-1/2 -translate-y-1/2 right-3" />
            <input
              value={globalSearch}
              onChange={(e) => { setGlobalSearch(e.target.value); setPage(0); }}
              placeholder={t('search')}
              className="input pr-10 w-48 sm:w-64"
            />
          </div>
          {/* Filters toggle */}
          {filters.length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn('btn-outline', showFilters && 'bg-brand-50 dark:bg-brand-600/10 border-brand-300 dark:border-brand-600/40 text-brand-700 dark:text-brand-300')}
            >
              <SlidersHorizontal className="w-4 h-4" /> {t('filters')}
            </button>
          )}
          {/* Column visibility */}
          <div className="relative">
            <button onClick={() => setShowColumnPanel(!showColumnPanel)} className="btn-outline">
              <Columns3 className="w-4 h-4" /> <span className="hidden sm:inline">{t('columns')}</span>
            </button>
            <AnimatePresence>
              {showColumnPanel && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full mt-1 left-0 z-50 glass-strong rounded-xl shadow-lifted p-2 w-48 max-h-64 overflow-y-auto"
                >
                  <p className="text-[10px] font-bold uppercase text-ink-400 px-2 py-1">{t('columnVisibility')}</p>
                  {columns.map((c) => (
                    <label key={c.key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800/60 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={c.visible !== false}
                        onChange={() => toggleColumnVisibility(c.key)}
                        className="rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-xs text-ink-700 dark:text-ink-200">{c.header}</span>
                    </label>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Density */}
          <div className="flex items-center gap-0.5 glass-strong rounded-lg p-0.5">
            {(['compact', 'comfortable', 'spacious'] as Density[]).map((d) => (
              <button
                key={d}
                onClick={() => setDensity(d)}
                className={cn('p-1.5 rounded-md transition', density === d ? 'bg-brand-500 text-white' : 'text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800')}
                title={d}
              >
                {d === 'compact' ? <Rows3 className="w-3.5 h-3.5" /> : d === 'comfortable' ? <Rows4 className="w-3.5 h-3.5" /> : <Rows3 className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
          {/* Export */}
          <div className="relative group">
            <button className="btn-outline"><Download className="w-4 h-4" /> <span className="hidden sm:inline">{t('export')}</span></button>
            <div className="absolute top-full mt-1 left-0 z-50 hidden group-hover:block glass-strong rounded-xl shadow-lifted p-1.5 w-32">
              <button onClick={() => handleExport('csv')} className="w-full text-right px-3 py-1.5 rounded-lg text-xs hover:bg-ink-50 dark:hover:bg-ink-800/60 text-ink-700 dark:text-ink-200">CSV</button>
              <button onClick={() => handleExport('json')} className="w-full text-right px-3 py-1.5 rounded-lg text-xs hover:bg-ink-50 dark:hover:bg-ink-800/60 text-ink-700 dark:text-ink-200">JSON</button>
              <button onClick={() => handleExport('xlsx')} className="w-full text-right px-3 py-1.5 rounded-lg text-xs hover:bg-ink-50 dark:hover:bg-ink-800/60 text-ink-700 dark:text-ink-200">Excel</button>
            </div>
          </div>
          {/* Print */}
          {onPrint && <button onClick={onPrint} className="btn-outline"><Printer className="w-4 h-4" /></button>}
          {/* Refresh */}
          {onRefresh && <button onClick={onRefresh} className="btn-outline"><RefreshCw className="w-4 h-4" /></button>}
          {/* Fullscreen */}
          <button onClick={() => setFullscreen(!fullscreen)} className="btn-outline">
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && filters.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 glass-strong rounded-xl">
                {filters.map((f) => (
                  <div key={f.key}>
                    <label className="text-xs font-medium text-ink-500 dark:text-ink-400 mb-1.5 block">{f.label}</label>
                    {f.type === 'select' ? (
                      <select value={f.value} onChange={(e) => { f.onChange(e.target.value); setPage(0); }} className="input">
                        <option value="all">الكل</option>
                        {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : f.type === 'text' ? (
                      <input value={f.value} onChange={(e) => { f.onChange(e.target.value); setPage(0); }} className="input" />
                    ) : (
                      <div className="flex gap-2">
                        <input type="date" className="input flex-1" onChange={(e) => f.onChange(e.target.value)} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk actions bar */}
        <AnimatePresence>
          {selectedArray.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-600/10 border border-brand-200 dark:border-brand-600/30"
            >
              <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
                {selectedArray.length} {t('selected')}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {bulkActions.map((action) => (
                  <button
                    key={action.key}
                    onClick={() => action.onClick(selectedArray)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition',
                      action.tone === 'danger' ? 'bg-danger-50 text-danger-600 dark:bg-danger-600/15 dark:text-danger-300 hover:bg-danger-100'
                      : action.tone === 'warning' ? 'bg-warning-50 text-warning-600 dark:bg-warning-600/15 dark:text-warning-300 hover:bg-warning-100'
                      : action.tone === 'success' ? 'bg-success-50 text-success-600 dark:bg-success-600/15 dark:text-success-300 hover:bg-success-100'
                      : 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200 hover:bg-ink-200 dark:hover:bg-ink-700'
                    )}
                  >
                    {action.icon} {action.label}
                  </button>
                ))}
                <button onClick={() => setSelected(new Set())} className="btn-ghost text-xs">
                  <X className="w-3.5 h-3.5" /> {t('cancel')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div ref={tableRef} className="flex-1 overflow-auto rounded-xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900">
        <table className="w-full">
          <thead className="sticky top-0 z-30">
            <tr className="bg-ink-50 dark:bg-ink-800/90 backdrop-blur border-b border-ink-200 dark:border-ink-800">
              {selectable && (
                <th className={cn('w-10 px-3', headerDensityClasses[density], 'sticky left-0 z-30 bg-ink-50 dark:bg-ink-800/90')}>
                  <input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectAll} className="rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
                </th>
              )}
              {pinnedLeft.map((c) => renderColumn(c, true, 'left'))}
              {normalColumns.map((c) => renderColumn(c))}
              {pinnedRight.map((c) => renderColumn(c, true, 'right'))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={visibleColumns.length + 1} className="py-20 text-center">
                  <RefreshCw className="w-6 h-6 text-ink-300 animate-spin mx-auto" />
                  <p className="text-sm text-ink-400 mt-2">{t('loading')}</p>
                </td>
              </tr>
            ) : pagedRows.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0)} className="py-16 text-center text-ink-400 dark:text-ink-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              pagedRows.map((row) => {
                const id = rowKey(row);
                const isSel = selected.has(id);
                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick?.(row)}
                    onDoubleClick={() => onRowDoubleClick?.(row)}
                    onContextMenu={(e) => handleContextMenu(e, row)}
                    className={cn(
                      'border-b border-ink-100 dark:border-ink-800/60 transition-colors',
                      onRowClick && 'cursor-pointer',
                      isSel ? 'bg-brand-50/60 dark:bg-brand-600/10' : 'hover:bg-ink-50 dark:hover:bg-ink-800/40',
                    )}
                  >
                    {selectable && (
                      <td className={cn('w-10 px-3', densityClasses[density], 'sticky left-0 z-10 bg-white dark:bg-ink-900')} onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={isSel} onChange={() => toggleSelect(id)} className="rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
                      </td>
                    )}
                    {pinnedLeft.map((c) => renderCell(row, c, true, 'left'))}
                    {normalColumns.map((c) => renderCell(row, c))}
                    {pinnedRight.map((c) => renderCell(row, c, true, 'right'))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-500 dark:text-ink-400">
            {t('showing')} {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sortedRows.length)} {t('of')} {sortedRows.length}
          </span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
            className="text-xs bg-ink-50 dark:bg-ink-800 rounded-lg px-2 py-1 outline-none border border-ink-200 dark:border-ink-700"
          >
            {[10, 25, 50, 100].map((s) => <option key={s} value={s}>{s} / صفحة</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button disabled={page === 0} onClick={() => setPage(0)} className="p-1.5 rounded-lg text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 disabled:opacity-30 transition">
            <ChevronsRight className="w-4 h-4" />
          </button>
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="p-1.5 rounded-lg text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 disabled:opacity-30 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const pageNum = totalPages <= 7 ? i : page < 4 ? i : page > totalPages - 5 ? totalPages - 7 + i : page - 3 + i;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={cn('w-8 h-8 rounded-lg text-xs font-medium transition', page === pageNum ? 'bg-brand-600 text-white' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800')}
              >
                {pageNum + 1}
              </button>
            );
          })}
          <button disabled={(page + 1) * pageSize >= sortedRows.length} onClick={() => setPage((p) => p + 1)} className="p-1.5 rounded-lg text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 disabled:opacity-30 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button disabled={(page + 1) * pageSize >= sortedRows.length} onClick={() => setPage(totalPages - 1)} className="p-1.5 rounded-lg text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 disabled:opacity-30 transition">
            <ChevronsLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenuState.row && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setContextMenuState((s) => ({ ...s, row: null }))} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-[101] glass-strong rounded-xl shadow-lifted p-1.5 w-48"
              style={{ top: contextMenuState.y, left: contextMenuState.x }}
            >
              {onQuickView && (
                <button onClick={() => { onQuickView(contextMenuState.row!); setContextMenuState((s) => ({ ...s, row: null })); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800/60 transition">
                  <Eye className="w-3.5 h-3.5" /> {t('quickView')}
                </button>
              )}
              {onEdit && (
                <button onClick={() => { onEdit(contextMenuState.row!); setContextMenuState((s) => ({ ...s, row: null })); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800/60 transition">
                  <Edit className="w-3.5 h-3.5" /> {t('edit')}
                </button>
              )}
              {contextMenu && contextMenu(contextMenuState.row!, () => setContextMenuState((s) => ({ ...s, row: null })))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
