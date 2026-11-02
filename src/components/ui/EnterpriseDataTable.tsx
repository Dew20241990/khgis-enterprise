/**
 * EnterpriseDataTable — data table with pagination, sorting, global and per-column search, column visibility,
 * working filters, selection, bulk actions, density, fullscreen, CSV/JSON export and a context menu.
 *
 * Behaviour notes
 *  - Columns, filters and rows come from props on every render; the table only owns view state (sort, page, search,
 *    hidden columns, filter values, selection). Switching language therefore relabels headers immediately.
 *  - `exportValue` is the plain-text value of a cell and is used for search, sorting and export. Give every column
 *    that renders a translated label an `exportValue` returning that label.
 *  - Alignment and pinning are logical (`start` / `end`), so the table mirrors correctly in RTL and LTR.
 */

import { useState, useMemo, useRef, useCallback, useEffect, type ReactNode } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, ArrowUpDown, Download, RefreshCw, Maximize2, Minimize2, Columns3, Rows3, Rows4, SlidersHorizontal, Printer, X, Eye, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useApp } from '@/store/appStore';
import { toCsv } from '@/lib/csv';
import { downloadFile } from '@/lib/importExport';
import { intlLocale } from '@/lib/format';

/** Reads a column value from a row without resorting to `any`. */
function cell(row: object, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

export type Density = 'compact' | 'comfortable' | 'spacious';

export interface EnterpriseColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  width?: number;
  /** Alignment along the reading direction: `start` (default), `end` (typically numbers) or `center`. */
  align?: 'start' | 'end' | 'center';
  /** Keeps the column at the start or end edge while scrolling horizontally. */
  pinned?: 'start' | 'end' | null;
  /** `false` hides the column initially (the user can show it from the columns menu). */
  visible?: boolean;
  /** Plain-text/number value used for search, sorting and export (defaults to the row field named `key`). */
  exportValue?: (row: T) => string | number;
}

export interface BulkAction {
  key: string;
  label: string;
  icon: ReactNode;
  tone?: 'default' | 'danger' | 'warning' | 'success';
  onClick: (selectedIds: string[]) => void;
}

export interface FilterConfig<T = object> {
  key: string;
  label: string;
  type: 'select' | 'text';
  options?: { value: string; label: string }[];
  /** Initial value (`'all'` for selects). The table keeps the live value itself. */
  value?: string;
  /** Optional notification when the user changes the filter. */
  onChange?: (value: string) => void;
  /** Custom predicate; by default the row field named `key` is compared with the chosen value. */
  match?: (row: T, value: string) => boolean;
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
  filters?: FilterConfig<T>[];
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'json') => void;
  onPrint?: () => void;
  onQuickView?: (row: T) => void;
  onEdit?: (row: T) => void;
  emptyText?: string;
  loading?: boolean;
  contextMenu?: (row: T, close: () => void) => ReactNode;
  /** Base file name (without extension) for CSV/JSON export. */
  exportName?: string;
  /** `false` removes the export menu. */
  allowExport?: boolean;
}

const ALIGN_TEXT = { start: 'text-start', end: 'text-end', center: 'text-center' } as const;
const ALIGN_FLEX = { start: 'justify-start', end: 'justify-end', center: 'justify-center' } as const;
const DEFAULT_FILTER: Record<'select' | 'text', string> = { select: 'all', text: '' };

function plainValue<T extends object>(row: T, col: EnterpriseColumn<T>): unknown {
  return col.exportValue ? col.exportValue(row) : cell(row, col.key);
}

function matchesFilter<T extends object>(row: T, f: FilterConfig<T>, value: string): boolean {
  if (value === '' || (f.type === 'select' && value === 'all')) return true;
  if (f.match) return f.match(row, value);
  const v = String(cell(row, f.key) ?? '');
  return f.type === 'text' ? v.toLowerCase().includes(value.toLowerCase()) : v === value;
}

export function EnterpriseDataTable<T extends object>({
  columns,
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
  emptyText,
  loading = false,
  contextMenu,
  exportName,
  allowExport = true,
}: EnterpriseDataTableProps<T>) {
  const { t, locale } = useApp();
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => new Set(columns.filter((c) => c.visible === false).map((c) => c.key)));
  const [globalSearch, setGlobalSearch] = useState('');
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [density, setDensity] = useState<Density>('comfortable');
  const [fullscreen, setFullscreen] = useState(false);
  const [openMenu, setOpenMenu] = useState<'columns' | 'export' | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [contextMenuState, setContextMenuState] = useState<{ x: number; y: number; row: T | null }>({ x: 0, y: 0, row: null });
  const tableRef = useRef<HTMLDivElement>(null);

  // Column visibility
  const visibleColumns = useMemo(() => columns.filter((c) => !hiddenColumns.has(c.key)), [columns, hiddenColumns]);
  const pinnedStart = useMemo(() => visibleColumns.filter((c) => c.pinned === 'start'), [visibleColumns]);
  const pinnedEnd = useMemo(() => visibleColumns.filter((c) => c.pinned === 'end'), [visibleColumns]);
  const normalColumns = useMemo(() => visibleColumns.filter((c) => !c.pinned), [visibleColumns]);

  const filterValue = useCallback((f: FilterConfig<T>) => filterValues[f.key] ?? f.value ?? DEFAULT_FILTER[f.type], [filterValues]);
  const activeFilterCount = filters.filter((f) => filterValue(f) !== DEFAULT_FILTER[f.type]).length;

  // Filters + global search + column search, all on the plain-text value shown to the user
  const searchedRows = useMemo(() => {
    let result = rows;
    for (const f of filters) {
      const v = filterValues[f.key] ?? f.value ?? DEFAULT_FILTER[f.type];
      result = result.filter((r) => matchesFilter(r, f, v));
    }
    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      result = result.filter((r) => visibleColumns.some((c) => String(plainValue(r, c) ?? '').toLowerCase().includes(q)));
    }
    for (const [key, query] of Object.entries(columnSearch)) {
      const col = columns.find((c) => c.key === key);
      if (query && col) result = result.filter((r) => String(plainValue(r, col) ?? '').toLowerCase().includes(query.toLowerCase()));
    }
    return result;
  }, [rows, filters, filterValues, globalSearch, columnSearch, visibleColumns, columns]);

  // Sorting (numbers numerically, text with the active language's collation)
  const sortedRows = useMemo(() => {
    if (!sortKey) return searchedRows;
    const col = columns.find((c) => c.key === sortKey);
    const collator = new Intl.Collator(intlLocale(locale), { numeric: true, sensitivity: 'base' });
    const get = (r: T) => (col ? plainValue(r, col) : cell(r, sortKey));
    return [...searchedRows].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : collator.compare(String(av), String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [searchedRows, sortKey, sortDir, columns, locale]);

  // Pagination
  const totalPages = Math.ceil(sortedRows.length / pageSize);
  const pagedRows = useMemo(() => sortedRows.slice(page * pageSize, (page + 1) * pageSize), [sortedRows, page, pageSize]);

  // Selection (ids that no longer exist are ignored)
  const selectedArray = useMemo(() => rows.map(rowKey).filter((id) => selected.has(id)), [rows, rowKey, selected]);
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

  const handleSort = useCallback((key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }, [sortKey, sortDir]);

  const toggleColumnVisibility = useCallback((key: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Export the selected rows, or everything that matches the current filters/search, in the current order.
  // CSV cells are formula-injection-safe and the file carries a UTF-8 BOM (see lib/csv.ts).
  const handleExport = useCallback((format: 'csv' | 'json') => {
    setOpenMenu(null);
    if (onExport) { onExport(format); return; }
    const exportRows = selectedArray.length > 0 ? sortedRows.filter((r) => selected.has(rowKey(r))) : sortedRows;
    const base = exportName ?? title ?? 'export';
    if (format === 'json') {
      downloadFile(JSON.stringify(exportRows, null, 2), `${base}.json`, 'application/json');
    } else {
      const csv = toCsv(
        visibleColumns.filter((c) => c.header).map((c) => c.header),
        exportRows.map((r) => visibleColumns.filter((c) => c.header).map((c) => plainValue(r, c))),
      );
      downloadFile(csv, `${base}.csv`, 'text/csv;charset=utf-8');
    }
  }, [onExport, selectedArray, sortedRows, selected, rowKey, visibleColumns, exportName, title]);

  const handleContextMenu = useCallback((e: React.MouseEvent, row: T) => {
    e.preventDefault();
    setContextMenuState({ x: e.clientX, y: e.clientY, row });
  }, []);

  // Close menus on outside click / Escape (listeners are removed on unmount)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      setContextMenuState((s) => (s.row ? { ...s, row: null } : s));
      if (!(e.target as Element | null)?.closest?.('[data-table-menu]')) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpenMenu(null);
      setFullscreen(false);
      setContextMenuState((s) => (s.row ? { ...s, row: null } : s));
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); };
  }, []);

  // Keep the current page valid when rows are removed or filtered away
  useEffect(() => {
    if (page > 0 && page >= totalPages) setPage(Math.max(totalPages - 1, 0));
  }, [page, totalPages]);

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

  const stickyClass = (side: 'start' | 'end' | null, z: string, bg: string) => side && cn('sticky', side === 'start' ? 'start-0' : 'end-0', z, bg);

  const renderColumn = (col: EnterpriseColumn<T>, side: 'start' | 'end' | null = null) => {
    const isSorted = sortKey === col.key;
    const align = col.align ?? 'start';
    return (
      <th
        key={col.key}
        onClick={() => handleSort(col.key, col.sortable)}
        aria-sort={isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
        className={cn(
          'font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide whitespace-nowrap select-none',
          headerDensityClasses[density],
          ALIGN_TEXT[align],
          col.sortable && 'cursor-pointer hover:text-ink-700 dark:hover:text-ink-200',
          stickyClass(side, 'z-20', 'bg-ink-50 dark:bg-ink-800/90 backdrop-blur'),
        )}
        style={{ width: col.width, minWidth: col.width ?? 80 }}
      >
        <div className={cn('flex items-center gap-1', ALIGN_FLEX[align])}>
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
            onChange={(e) => { setColumnSearch((prev) => ({ ...prev, [col.key]: e.target.value })); setPage(0); }}
            placeholder={t('ui.table.searchColumn')}
            aria-label={`${t('ui.table.searchColumn')} ${col.header}`}
            className="w-full mt-1.5 px-2 py-1 text-[10px] font-normal normal-case rounded-md bg-ink-100/60 dark:bg-ink-900/60 border border-ink-200/50 dark:border-ink-700/50 outline-none focus:ring-1 ring-brand-500/30 text-ink-700 dark:text-ink-200"
          />
        )}
      </th>
    );
  };

  const renderCell = (row: T, col: EnterpriseColumn<T>, side: 'start' | 'end' | null = null) => (
    <td
      key={col.key}
      className={cn(
        densityClasses[density],
        'text-ink-700 dark:text-ink-200 whitespace-nowrap',
        ALIGN_TEXT[col.align ?? 'start'],
        stickyClass(side, 'z-10', 'bg-white dark:bg-ink-900'),
      )}
      style={{ width: col.width, minWidth: col.width ?? 80 }}
    >
      {col.render ? col.render(row) : String(cell(row, col.key) ?? '—')}
    </td>
  );

  const containerClass = cn(
    'relative flex flex-col',
    fullscreen ? 'fixed inset-0 z-[200] bg-white dark:bg-ink-950 p-4' : '',
  );

  const densityLabel: Record<Density, string> = {
    compact: t('ui.table.density.compact'),
    comfortable: t('ui.table.density.comfortable'),
    spacious: t('ui.table.density.spacious'),
  };
  const rangeFrom = sortedRows.length === 0 ? 0 : page * pageSize + 1;
  const rangeTo = Math.min((page + 1) * pageSize, sortedRows.length);
  const menuItem = 'w-full text-start px-3 py-1.5 rounded-lg text-xs hover:bg-ink-50 dark:hover:bg-ink-800/60 text-ink-700 dark:text-ink-200';
  const pagerButton = 'p-1.5 rounded-lg text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 disabled:opacity-30 transition';
  const lastPage = Math.max(totalPages - 1, 0);

  return (
    <div className={containerClass}>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {title && (
            <div className="flex items-center gap-2 me-auto">
              <h3 className="text-sm font-semibold text-ink-900 dark:text-white">{title}</h3>
              {subtitle && <span className="text-xs text-ink-400">{subtitle}</span>}
            </div>
          )}
          {/* Global search */}
          <div className="relative">
            <Search className="w-4 h-4 text-ink-400 absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
            <input
              type="search"
              value={globalSearch}
              onChange={(e) => { setGlobalSearch(e.target.value); setPage(0); }}
              placeholder={t('search')}
              aria-label={t('search')}
              className="input ps-10 w-48 sm:w-64"
            />
          </div>
          {/* Filters toggle */}
          {filters.length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              className={cn('btn-outline', showFilters && 'bg-brand-50 dark:bg-brand-600/10 border-brand-300 dark:border-brand-600/40 text-brand-700 dark:text-brand-300')}
            >
              <SlidersHorizontal className="w-4 h-4" /> {t('filters')}{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
          )}
          {/* Column visibility */}
          <div className="relative" data-table-menu>
            <button onClick={() => setOpenMenu(openMenu === 'columns' ? null : 'columns')} aria-expanded={openMenu === 'columns'} className="btn-outline">
              <Columns3 className="w-4 h-4" /> <span className="hidden sm:inline">{t('columns')}</span>
            </button>
            <AnimatePresence>
              {openMenu === 'columns' && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full mt-1 end-0 z-50 glass-strong rounded-xl shadow-lifted p-2 w-48 max-h-64 overflow-y-auto"
                >
                  <p className="text-[10px] font-bold uppercase text-ink-400 px-2 py-1">{t('columnVisibility')}</p>
                  {columns.filter((c) => c.header).map((c) => (
                    <label key={c.key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800/60 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!hiddenColumns.has(c.key)}
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
          <div className="flex items-center gap-0.5 glass-strong rounded-lg p-0.5" role="group" aria-label={densityLabel[density]}>
            {(['compact', 'comfortable', 'spacious'] as Density[]).map((d) => (
              <button
                key={d}
                onClick={() => setDensity(d)}
                aria-pressed={density === d}
                className={cn('p-1.5 rounded-md transition', density === d ? 'bg-brand-500 text-white' : 'text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800')}
                title={densityLabel[d]}
                aria-label={densityLabel[d]}
              >
                {d === 'compact' ? <Rows3 className="w-3.5 h-3.5" /> : d === 'comfortable' ? <Rows4 className="w-3.5 h-3.5" /> : <Rows3 className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
          {/* Export */}
          {allowExport && (
            <div className="relative" data-table-menu>
              <button onClick={() => setOpenMenu(openMenu === 'export' ? null : 'export')} aria-expanded={openMenu === 'export'} aria-haspopup="menu" className="btn-outline">
                <Download className="w-4 h-4" /> <span className="hidden sm:inline">{t('export')}</span>
              </button>
              <AnimatePresence>
                {openMenu === 'export' && (
                  <motion.div
                    role="menu" aria-label={t('ui.table.exportAs')}
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full mt-1 end-0 z-50 glass-strong rounded-xl shadow-lifted p-1.5 w-36"
                  >
                    <button role="menuitem" onClick={() => handleExport('csv')} className={menuItem}>CSV (Excel)</button>{/* i18n-ignore: file format name */}
                    <button role="menuitem" onClick={() => handleExport('json')} className={menuItem}>JSON</button>{/* i18n-ignore: file format name */}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          {/* Print */}
          {onPrint && <button onClick={onPrint} className="btn-outline" title={t('ui.table.print')} aria-label={t('ui.table.print')}><Printer className="w-4 h-4" /></button>}
          {/* Refresh */}
          {onRefresh && <button onClick={onRefresh} className="btn-outline" title={t('ui.table.refresh')} aria-label={t('ui.table.refresh')}><RefreshCw className="w-4 h-4" /></button>}
          {/* Fullscreen */}
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="btn-outline"
            title={fullscreen ? t('ui.table.exitFullscreen') : t('ui.table.fullscreen')}
            aria-label={fullscreen ? t('ui.table.exitFullscreen') : t('ui.table.fullscreen')}
          >
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
                {filters.map((f) => {
                  const change = (value: string) => { setFilterValues((prev) => ({ ...prev, [f.key]: value })); f.onChange?.(value); setPage(0); };
                  const id = `filter-${f.key}`;
                  return (
                    <div key={f.key}>
                      <label htmlFor={id} className="text-xs font-medium text-ink-500 dark:text-ink-400 mb-1.5 block">{f.label}</label>
                      {f.type === 'select' ? (
                        <select id={id} value={filterValue(f)} onChange={(e) => change(e.target.value)} className="input">
                          <option value="all">{t('all')}</option>
                          {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : (
                        <input id={id} value={filterValue(f)} onChange={(e) => change(e.target.value)} className="input" />
                      )}
                    </div>
                  );
                })}
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
        <table className="w-full" data-testid="data-table">
          <thead className="sticky top-0 z-30">
            <tr className="bg-ink-50 dark:bg-ink-800/90 backdrop-blur border-b border-ink-200 dark:border-ink-800">
              {selectable && (
                <th className={cn('w-10 px-3', headerDensityClasses[density], 'sticky start-0 z-30 bg-ink-50 dark:bg-ink-800/90')}>
                  <input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectAll} aria-label={t('ui.table.selectAll')} className="rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
                </th>
              )}
              {pinnedStart.map((c) => renderColumn(c, 'start'))}
              {normalColumns.map((c) => renderColumn(c))}
              {pinnedEnd.map((c) => renderColumn(c, 'end'))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0)} className="py-20 text-center">
                  <RefreshCw className="w-6 h-6 text-ink-300 animate-spin mx-auto" />
                  <p className="text-sm text-ink-400 mt-2">{t('loading')}</p>
                </td>
              </tr>
            ) : pagedRows.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0)} className="py-16 text-center text-ink-400 dark:text-ink-500">
                  {emptyText ?? (rows.length > 0 ? t('noResults') : t('noData'))}
                </td>
              </tr>
            ) : (
              pagedRows.map((row) => {
                const id = rowKey(row);
                const isSel = selected.has(id);
                return (
                  <tr
                    key={id}
                    data-row-id={id}
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
                      <td className={cn('w-10 px-3', densityClasses[density], 'sticky start-0 z-10 bg-white dark:bg-ink-900')} onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={isSel} onChange={() => toggleSelect(id)} aria-label={t('ui.table.selectRow')} className="rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
                      </td>
                    )}
                    {pinnedStart.map((c) => renderCell(row, c, 'start'))}
                    {normalColumns.map((c) => renderCell(row, c))}
                    {pinnedEnd.map((c) => renderCell(row, c, 'end'))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (icons mirror in RTL) */}
      <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-500 dark:text-ink-400">
            {t('showing')} {rangeFrom}–{rangeTo} {t('of')} {sortedRows.length}
          </span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
            aria-label={t('ui.table.perPage', { n: pageSize })}
            className="text-xs bg-ink-50 dark:bg-ink-800 rounded-lg px-2 py-1 outline-none border border-ink-200 dark:border-ink-700"
          >
            {[10, 25, 50, 100].map((s) => <option key={s} value={s}>{t('ui.table.perPage', { n: s })}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <button disabled={page === 0} onClick={() => setPage(0)} className={pagerButton} title={t('ui.table.firstPage')} aria-label={t('ui.table.firstPage')}>
            <ChevronsLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className={pagerButton} title={t('ui.table.prevPage')} aria-label={t('ui.table.prevPage')}>
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const pageNum = totalPages <= 7 ? i : page < 4 ? i : page > totalPages - 5 ? totalPages - 7 + i : page - 3 + i;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                aria-current={page === pageNum ? 'page' : undefined}
                className={cn('w-8 h-8 rounded-lg text-xs font-medium transition', page === pageNum ? 'bg-brand-600 text-white' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800')}
              >
                {pageNum + 1}
              </button>
            );
          })}
          <button disabled={(page + 1) * pageSize >= sortedRows.length} onClick={() => setPage((p) => p + 1)} className={pagerButton} title={t('ui.table.nextPage')} aria-label={t('ui.table.nextPage')}>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
          <button disabled={(page + 1) * pageSize >= sortedRows.length} onClick={() => setPage(lastPage)} className={pagerButton} title={t('ui.table.lastPage')} aria-label={t('ui.table.lastPage')}>
            <ChevronsRight className="w-4 h-4 rtl:rotate-180" />
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
              style={{ top: contextMenuState.y, left: contextMenuState.x }} // physical: viewport coordinates of the pointer
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
