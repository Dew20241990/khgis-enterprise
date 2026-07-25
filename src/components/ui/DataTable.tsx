import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selected?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  emptyText?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns, rows, rowKey, onRowClick, selectable, selected = [], onToggleSelect, onToggleSelectAll, emptyText = 'لا توجد بيانات',
}: DataTableProps<T>) {
  const allSelected = rows.length > 0 && rows.every((r) => selected.includes(rowKey(r)));
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-200 dark:border-ink-800">
            {selectable && (
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={onToggleSelectAll} className="rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
              </th>
            )}
            {columns.map((c) => (
              <th key={c.key} className={cn('text-right px-4 py-3 text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide whitespace-nowrap', c.className)}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center text-ink-400 dark:text-ink-500">{emptyText}</td>
            </tr>
          ) : (
            rows.map((row) => {
              const id = rowKey(row);
              const isSel = selected.includes(id);
              return (
                <tr
                  key={id}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-ink-100 dark:border-ink-800/60 transition-colors',
                    onRowClick && 'cursor-pointer',
                    isSel ? 'bg-brand-50/60 dark:bg-brand-600/10' : 'hover:bg-ink-50 dark:hover:bg-ink-800/40',
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={isSel} onChange={() => onToggleSelect?.(id)} className="rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className={cn('px-4 py-3 text-ink-700 dark:text-ink-200 whitespace-nowrap', c.className)}>
                      {c.render ? c.render(row) : (row as any)[c.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
