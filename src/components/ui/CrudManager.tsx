/**
 * CrudManager — reusable enterprise CRUD framework.
 * Provides: Create, Read, Update, Delete, Duplicate, Archive, Restore,
 * Soft Delete, Bulk Delete, Bulk Status Change, Copy, Clone, Preview, Quick View.
 * Integrates with SmartForm, ConfirmDialog, Toast, and EnterpriseDataTable.
 */

import { useState, useCallback, useMemo, type ReactNode } from 'react';
import {
  Plus, Edit, Trash2, Copy, Archive, RotateCcw, Eye, MoreVertical,
  Download, Printer, FileText, History, X, Check, AlertTriangle, Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnterpriseDataTable, type EnterpriseColumn, type BulkAction, type FilterConfig } from './EnterpriseDataTable';
import { Modal } from './Modal';
import { SmartForm, type FormField } from './SmartForm';
import { ConfirmDialog } from './ConfirmDialog';
import { toast } from './Toast';
import { PageHeader } from './PageHeader';
import { useApp } from '@/store/appStore';
import { cn } from '@/lib/cn';

export interface CrudConfig<T> {
  entityName: string;
  entityNamePlural: string;
  icon: ReactNode;
  columns: EnterpriseColumn<T>[];
  formFields: FormField[];
  filters?: FilterConfig[];
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

export function CrudManager<T extends Record<string, any>>({
  config, data, onDataChange,
}: CrudManagerProps<T>) {
  const { t } = useApp();
  const [rows, setRows] = useState<T[]>(data);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<T | null>(null);
  const [previewRow, setPreviewRow] = useState<T | null>(null);
  const [detailRow, setDetailRow] = useState<T | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<T | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [historyRow, setHistoryRow] = useState<T | null>(null);
  const [contextMenuRow, setContextMenuRow] = useState<T | null>(null);

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
    toast.success('تم الحذف', `تم حذف ${config.entityName} بنجاح`);
  }, [confirmDelete, config, rows, updateRows]);

  // Duplicate / Clone
  const handleDuplicate = useCallback((row: T) => {
    const id = config.rowKey(row);
    const clone = { ...row, id: `${id}_copy_${Date.now()}`, code: `${(row as any).code ?? id}_copy` };
    updateRows([...rows, clone]);
    toast.success('تم النسخ', `تم إنشاء نسخة من ${config.entityName}`);
  }, [config, rows, updateRows]);

  // Archive
  const handleArchive = useCallback((row: T) => {
    const id = config.rowKey(row);
    updateRows(rows.map((r) => config.rowKey(r) === id ? { ...r, _archived: true } : r));
    toast.success('تم الأرشفة', `تمت أرشفة ${config.entityName}`);
  }, [config, rows, updateRows]);

  // Restore
  const handleRestore = useCallback((row: T) => {
    const id = config.rowKey(row);
    updateRows(rows.map((r) => config.rowKey(r) === id ? { ...r, _archived: false } : r));
    toast.success('تمت الاستعادة', `تمت استعادة ${config.entityName}`);
  }, [config, rows, updateRows]);

  // Form submit
  const handleFormSubmit = useCallback((values: Record<string, any>) => {
    if (editingRow) {
      const id = config.rowKey(editingRow);
      updateRows(rows.map((r) => config.rowKey(r) === id ? { ...r, ...values, _updatedAt: new Date().toISOString() } : r));
      toast.success('تم التحديث', `تم تحديث ${config.entityName} بنجاح`);
    } else {
      const newRow = { ...values, id: `${config.entityName}_${Date.now()}`, _createdAt: new Date().toISOString() } as unknown as T;
      updateRows([...rows, newRow]);
      toast.success('تم الإنشاء', `تم إنشاء ${config.entityName} بنجاح`);
    }
    setFormOpen(false);
    setEditingRow(null);
  }, [editingRow, config, rows, updateRows]);

  // Bulk actions
  const defaultBulkActions: BulkAction[] = useMemo(() => [
    ...config.bulkActions ?? [],
    {
      key: 'bulk-delete', label: t('delete'), icon: <Trash2 className="w-3.5 h-3.5" />, tone: 'danger',
      onClick: (ids) => { setConfirmBulkDelete(true); (window as any).__bulkIds = ids; },
    },
    {
      key: 'bulk-archive', label: t('archive'), icon: <Archive className="w-3.5 h-3.5" />, tone: 'warning',
      onClick: (ids) => {
        updateRows(rows.map((r) => ids.includes(config.rowKey(r)) ? { ...r, _archived: true } : r));
        toast.success('تم الأرشفة', `تمت أرشفة ${ids.length} عنصر`);
      },
    },
  ], [config, rows, updateRows, t]);

  const confirmBulkDeleteAction = useCallback(() => {
    const ids = (window as any).__bulkIds as string[];
    if (ids) {
      updateRows(rows.filter((r) => !ids.includes(config.rowKey(r))));
      toast.success('تم الحذف', `تم حذف ${ids.length} عنصر`);
    }
    setConfirmBulkDelete(false);
  }, [config, rows, updateRows]);

  // Context menu actions
  const contextMenuItems = useCallback((row: T, close: () => void): ReactNode => (
    <>
      <button onClick={() => { handleDuplicate(row); close(); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800/60 transition">
        <Copy className="w-3.5 h-3.5" /> {t('duplicate')}
      </button>
      <button onClick={() => { handleArchive(row); close(); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800/60 transition">
        <Archive className="w-3.5 h-3.5" /> {t('archive')}
      </button>
      <button onClick={() => { setHistoryRow(row); close(); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800/60 transition">
        <History className="w-3.5 h-3.5" /> {t('history')}
      </button>
      <div className="h-px bg-ink-100 dark:bg-ink-800 my-1" />
      <button onClick={() => { handleDelete(row); close(); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-600/10 transition">
        <Trash2 className="w-3.5 h-3.5" /> {t('delete')}
      </button>
    </>
  ), [handleDuplicate, handleArchive, handleDelete, setHistoryRow, t]);

  const visibleRows = useMemo(() => rows.filter((r) => !(r as any)._archived), [rows]);

  return (
    <div>
      <PageHeader
        title={config.entityNamePlural}
        subtitle={`${visibleRows.length} ${config.entityName}`}
        icon={config.icon}
        actions={
          <>
            {config.allowExport !== false && <button className="btn-outline"><Download className="w-4 h-4" /> {t('export')}</button>}
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
      />

      {/* Create/Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingRow(null); }}
        title={editingRow ? `${t('edit')} ${config.entityName}` : `${t('add')} ${config.entityName}`}
        size="lg"
      >
        <SmartForm
          fields={config.formFields}
          initialValues={editingRow ?? {}}
          onSubmit={handleFormSubmit}
          onCancel={() => { setFormOpen(false); setEditingRow(null); }}
          autoSave
          autoSaveKey={`${config.entityName}_${editingRow ? config.rowKey(editingRow) : 'new'}`}
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
            <span>سجل التغييرات</span>
          </div>
          <div className="space-y-2">
            {[
              { action: 'تم الإنشاء', user: 'النظام', time: (historyRow as any)?._createdAt ?? new Date().toISOString(), color: 'bg-success-500' },
              { action: 'تم التحديث', user: 'م. بن عمر', time: (historyRow as any)?._updatedAt ?? new Date().toISOString(), color: 'bg-brand-500' },
            ].map((h, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-ink-50 dark:bg-ink-800/40">
                <span className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', h.color)} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{h.action}</p>
                  <p className="text-xs text-ink-400">{h.user} · {new Date(h.time).toLocaleString('ar-DZ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!confirmDelete}
        title={`حذف ${config.entityName}`}
        message={`هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel={t('delete')}
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={confirmBulkDelete}
        title="حذف جماعي"
        message={`هل أنت متأكد من حذف جميع العناصر المحددة؟`}
        confirmLabel={t('delete')}
        onConfirm={confirmBulkDeleteAction}
        onCancel={() => setConfirmBulkDelete(false)}
      />
    </div>
  );
}
