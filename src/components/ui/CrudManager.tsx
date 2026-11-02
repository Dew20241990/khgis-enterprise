/**
 * CrudManager — reusable enterprise CRUD framework.
 * Provides: Create, Read, Update, Delete, Duplicate, Archive, Restore,
 * Soft Delete, Bulk Delete, Bulk Status Change, Copy, Clone, Preview, Quick View.
 * Integrates with SmartForm, ConfirmDialog, Toast, and EnterpriseDataTable.
 */

import { useState, useCallback, useMemo, type ReactNode } from 'react';
import { Plus, Trash2, Copy, Archive, RotateCcw, History, Clock } from 'lucide-react';
import { EnterpriseDataTable, type EnterpriseColumn, type BulkAction, type FilterConfig } from './EnterpriseDataTable';
import { Modal } from './Modal';
import { SmartForm, type FormField, type FormValues } from './SmartForm';
import { applyCoords, withCoordsField } from '@/lib/formValues';
import { ConfirmDialog } from './ConfirmDialog';
import { toast } from './toastStore';
import { PageHeader } from './PageHeader';
import { useApp } from '@/store/appStore';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';

export interface CrudConfig<T> {
  /** Stable id of the resource (e.g. `vehicles`): used for export file names, draft keys and generated record ids. */
  resource?: string;
  /** Singular, translated name of one record (used in messages such as "{entity} deleted"). */
  entityName: string;
  entityNamePlural: string;
  icon: ReactNode;
  columns: EnterpriseColumn<T>[];
  formFields: FormField[];
  filters?: FilterConfig<T>[];
  bulkActions?: BulkAction[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  detailView?: (row: T) => ReactNode;
  quickView?: (row: T) => ReactNode;
  stats?: ReactNode;
  allowCreate?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowDuplicate?: boolean;
  allowArchive?: boolean;
  allowExport?: boolean;
}

interface CrudManagerProps<T> {
  config: CrudConfig<T>;
  data: T[];
  onDataChange?: (data: T[]) => void;
}

/** Reads an optional string metadata field (e.g. `_createdAt`) from a row. */
function meta(row: object | null, key: string): string | undefined {
  const v = row ? (row as Record<string, unknown>)[key] : undefined;
  return typeof v === 'string' && v ? v : undefined;
}

export function CrudManager<T extends object>({
  config, data, onDataChange,
}: CrudManagerProps<T>) {
  const { t, locale, user } = useApp();
  const resourceId = config.resource ?? 'record';
  const actor = user?.username;
  const [rows, setRows] = useState<T[]>(data);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<T | null>(null);
  const [previewRow, setPreviewRow] = useState<T | null>(null);
  const [detailRow, setDetailRow] = useState<T | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<T | null>(null);
  const [pendingBulkIds, setPendingBulkIds] = useState<string[] | null>(null);
  const [historyRow, setHistoryRow] = useState<T | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const updateRows = useCallback((newRows: T[]) => {
    setRows(newRows);
    onDataChange?.(newRows);
  }, [onDataChange]);

  // Create
  const handleCreate = useCallback(() => {
    setEditingRow(null);
    setFormOpen(true);
  }, []);

  // Edit
  const handleEdit = useCallback((row: T) => {
    setEditingRow(row);
    setFormOpen(true);
  }, []);

  // Delete (soft)
  const handleDelete = useCallback((row: T) => {
    setConfirmDelete(row);
  }, []);

  const confirmDeleteAction = useCallback(() => {
    if (!confirmDelete) return;
    const id = config.rowKey(confirmDelete);
    updateRows(rows.filter((r) => config.rowKey(r) !== id));
    setConfirmDelete(null);
    toast.success(t('ui.crud.deletedTitle'), t('ui.crud.deletedMsg', { entity: config.entityName }));
  }, [confirmDelete, config, rows, updateRows, t]);

  // Duplicate / Clone
  const handleDuplicate = useCallback((row: T) => {
    const id = config.rowKey(row);
    const source = row as Record<string, unknown>;
    const clone: Record<string, unknown> = { ...source, id: `${id}_copy_${Date.now()}` };
    if (typeof source.code === 'string') clone.code = `${source.code}_copy`;
    updateRows([...rows, clone as unknown as T]);
    toast.success(t('ui.crud.duplicatedTitle'), t('ui.crud.duplicatedMsg', { entity: config.entityName }));
  }, [config, rows, updateRows, t]);

  // Archive
  const handleArchive = useCallback((row: T) => {
    const id = config.rowKey(row);
    updateRows(rows.map((r) => config.rowKey(r) === id ? { ...r, _archived: true } : r));
    toast.success(t('ui.crud.archivedTitle'), t('ui.crud.archivedMsg', { entity: config.entityName }));
  }, [config, rows, updateRows, t]);

  // Restore
  const handleRestore = useCallback((row: T) => {
    const id = config.rowKey(row);
    updateRows(rows.map((r) => config.rowKey(r) === id ? { ...r, _archived: false } : r));
    toast.success(t('ui.crud.restoredTitle'), t('ui.crud.restoredMsg', { entity: config.entityName }));
  }, [config, rows, updateRows, t]);

  // Form submit
  const handleFormSubmit = useCallback((submitted: FormValues) => {
    const values = applyCoords(submitted);
    if (editingRow) {
      const id = config.rowKey(editingRow);
      updateRows(rows.map((r) => config.rowKey(r) === id ? { ...r, ...values, _updatedAt: new Date().toISOString(), _updatedBy: actor } : r));
      toast.success(t('ui.crud.updatedTitle'), t('ui.crud.updatedMsg', { entity: config.entityName }));
    } else {
      const newRow = { ...values, id: `${resourceId}-${Date.now()}`, _createdAt: new Date().toISOString(), _createdBy: actor } as unknown as T;
      updateRows([...rows, newRow]);
      toast.success(t('ui.crud.createdTitle'), t('ui.crud.createdMsg', { entity: config.entityName }));
    }
    setFormOpen(false);
    setEditingRow(null);
  }, [editingRow, config, rows, updateRows, t, resourceId, actor]);

  // Bulk actions
  const defaultBulkActions: BulkAction[] = useMemo(() => [
    ...config.bulkActions ?? [],
    {
      key: 'bulk-delete', label: t('delete'), icon: <Trash2 className="w-3.5 h-3.5" />, tone: 'danger',
      onClick: (ids) => { setPendingBulkIds(ids); },
    },
    {
      key: 'bulk-archive', label: t('archive'), icon: <Archive className="w-3.5 h-3.5" />, tone: 'warning',
      onClick: (ids) => {
        updateRows(rows.map((r) => ids.includes(config.rowKey(r)) ? { ...r, _archived: true } : r));
        toast.success(t('ui.crud.archivedTitle'), t('ui.crud.bulkArchivedMsg', { n: ids.length }));
      },
    },
  ], [config, rows, updateRows, t]);

  const confirmBulkDeleteAction = useCallback(() => {
    const ids = pendingBulkIds;
    if (ids) {
      updateRows(rows.filter((r) => !ids.includes(config.rowKey(r))));
      toast.success(t('ui.crud.deletedTitle'), t('ui.crud.bulkDeletedMsg', { n: ids.length }));
    }
    setPendingBulkIds(null);
  }, [config, rows, updateRows, pendingBulkIds, t]);

  // Context menu actions
  const contextMenuItems = useCallback((row: T, close: () => void): ReactNode => (
    <>
      <button onClick={() => { handleDuplicate(row); close(); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800/60 transition">
        <Copy className="w-3.5 h-3.5" /> {t('duplicate')}
      </button>
      {(row as Record<string, unknown>)._archived ? (
        <button onClick={() => { handleRestore(row); close(); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800/60 transition">
          <RotateCcw className="w-3.5 h-3.5" /> {t('restore')}
        </button>
      ) : (
        <button onClick={() => { handleArchive(row); close(); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800/60 transition">
          <Archive className="w-3.5 h-3.5" /> {t('archive')}
        </button>
      )}
      <button onClick={() => { setHistoryRow(row); close(); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800/60 transition">
        <History className="w-3.5 h-3.5" /> {t('history')}
      </button>
      <div className="h-px bg-ink-100 dark:bg-ink-800 my-1" />
      <button onClick={() => { handleDelete(row); close(); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-600/10 transition">
        <Trash2 className="w-3.5 h-3.5" /> {t('delete')}
      </button>
    </>
  ), [handleDuplicate, handleArchive, handleRestore, handleDelete, setHistoryRow, t]);

  const historyEntries = useMemo(() => {
    const entries: { key: string; action: string; user?: string; time: string; color: string }[] = [];
    const created = meta(historyRow, '_createdAt');
    const updated = meta(historyRow, '_updatedAt');
    if (created) entries.push({ key: 'created', action: t('ui.crud.historyCreated'), user: meta(historyRow, '_createdBy'), time: created, color: 'bg-success-500' });
    if (updated) entries.push({ key: 'updated', action: t('ui.crud.historyUpdated'), user: meta(historyRow, '_updatedBy'), time: updated, color: 'bg-brand-500' });
    return entries;
  }, [historyRow, t]);

  const archivedCount = useMemo(() => rows.filter((r) => (r as Record<string, unknown>)._archived).length, [rows]);
  const visibleRows = useMemo(
    () => rows.filter((r) => Boolean((r as Record<string, unknown>)._archived) === showArchived),
    [rows, showArchived],
  );

  return (
    <div>
      <PageHeader
        title={config.entityNamePlural}
        subtitle={visibleRows.length === 1 ? t('ui.crud.recordOne') : t('ui.crud.recordCount', { n: visibleRows.length })}
        icon={config.icon}
        actions={
          <>
            {archivedCount > 0 || showArchived ? (
              <button onClick={() => setShowArchived((v) => !v)} className="btn-outline" aria-pressed={showArchived}>
                <Archive className="w-4 h-4" /> {t('archived')} ({archivedCount})
              </button>
            ) : null}
            {config.allowCreate !== false && (
              <button onClick={handleCreate} className="btn-primary"><Plus className="w-4 h-4" /> {t('add')}</button>
            )}
          </>
        }
      />

      {config.stats}

      <EnterpriseDataTable
        columns={config.columns}
        rows={visibleRows}
        rowKey={config.rowKey}
        onRowClick={config.onRowClick ?? (config.detailView ? (r) => setDetailRow(r) : undefined)}
        selectable
        bulkActions={defaultBulkActions}
        filters={config.filters}
        onQuickView={config.quickView ? (r) => setPreviewRow(r) : undefined}
        onEdit={config.allowEdit !== false ? handleEdit : undefined}
        contextMenu={contextMenuItems}
        exportName={config.resource}
        allowExport={config.allowExport !== false}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingRow(null); }}
        title={editingRow ? t('ui.crud.editTitle', { entity: config.entityName }) : t('ui.crud.addTitle', { entity: config.entityName })}
        size="lg"
      >
        <SmartForm
          fields={config.formFields}
          initialValues={withCoordsField(editingRow)}
          onSubmit={handleFormSubmit}
          onCancel={() => { setFormOpen(false); setEditingRow(null); }}
          autoSave
          autoSaveKey={`${resourceId}:${editingRow ? config.rowKey(editingRow) : 'new'}`}
        />
      </Modal>

      {/* Quick View Modal */}
      <Modal
        open={!!previewRow}
        onClose={() => setPreviewRow(null)}
        title={`${t('quickView')} — ${config.entityName}`}
        size="lg"
      >
        {previewRow && config.quickView?.(previewRow)}
      </Modal>

      {/* Detail View Modal */}
      <Modal
        open={!!detailRow}
        onClose={() => setDetailRow(null)}
        title={`${config.entityName} — ${config.rowKey(detailRow ?? {} as T)}`}
        size="xl"
      >
        {detailRow && config.detailView?.(detailRow)}
      </Modal>

      {/* History Modal */}
      <Modal
        open={!!historyRow}
        onClose={() => setHistoryRow(null)}
        title={t('history')}
        subtitle={config.rowKey(historyRow ?? {} as T)}
        size="md"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300">
            <Clock className="w-4 h-4 text-brand-500" />
            <span>{t('ui.crud.changeLog')}</span>
          </div>
          <div className="space-y-2">
            {historyEntries.length === 0 && <p className="text-sm text-ink-500 dark:text-ink-400">{t('ui.crud.noHistory')}</p>}
            {historyEntries.map((h) => (
              <div key={h.key} className="flex items-start gap-3 p-3 rounded-lg bg-ink-50 dark:bg-ink-800/40">
                <span className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', h.color)} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{h.action}</p>
                  <p className="text-xs text-ink-400">
                    {h.user ? `${t('ui.crud.historyBy', { user: h.user })} · ` : ''}{formatDate(locale, h.time, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!confirmDelete}
        title={t('ui.crud.deleteTitle', { entity: config.entityName })}
        message={t('ui.crud.deleteMessage')}
        confirmLabel={t('delete')}
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={pendingBulkIds !== null}
        title={t('ui.crud.bulkDeleteTitle')}
        message={t('ui.crud.bulkDeleteMessage')}
        confirmLabel={t('delete')}
        onConfirm={confirmBulkDeleteAction}
        onCancel={() => setPendingBulkIds(null)}
      />
    </div>
  );
}
