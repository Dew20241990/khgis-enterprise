/**
 * SmartForm — reusable form framework with validation, auto-save, draft mode.
 * Supports: text, number, select, date, time, textarea, GPS coordinates,
 * image/video/file upload, autocomplete dropdown search.
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { MapPin, X, FileText, Image as ImageIcon, Video, File, Calendar, Clock, Search, Check, AlertCircle, Loader2, Save, RotateCcw, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { validatePosition } from '@/lib/geometry';
import { isEmptyValue, isGpsValue, type FormValues, type GpsValue } from '@/lib/formValues';

export type { FormValues } from '@/lib/formValues';

export type FieldType = 'text' | 'number' | 'select' | 'date' | 'time' | 'textarea' | 'gps' | 'image' | 'video' | 'file' | 'autocomplete' | 'checkbox' | 'color' | 'password';

export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: unknown;
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
  colSpan?: 1 | 2;
  visible?: (values: FormValues) => boolean;
  validate?: (value: unknown, values: FormValues) => string | null;
}

interface SmartFormProps {
  fields: FormField[];
  /** Any record-like object; it is only spread into the form state. */
  initialValues?: object;
  onSubmit: (values: FormValues) => void | Promise<void>;
  onCancel?: () => void;
  autoSave?: boolean;
  autoSaveKey?: string;
  submitLabel?: string;
  cancelLabel?: string;
  title?: string;
  layout?: 'grid' | 'stacked';
}

/** Field types whose values must never be written to the localStorage draft. */
const NON_DRAFTABLE: ReadonlySet<FieldType> = new Set<FieldType>(['password', 'image', 'video', 'file']);

function buildDefaults(fields: FormField[]): FormValues {
  const defaults: FormValues = {};
  fields.forEach((f) => { defaults[f.key] = f.defaultValue ?? ''; });
  return defaults;
}

/** Picks only the values that are safe to persist as a draft (no secrets, no File objects). */
function draftValues(fields: FormField[], values: FormValues): FormValues {
  const out: FormValues = {};
  for (const f of fields) {
    if (!NON_DRAFTABLE.has(f.type) && f.key in values) out[f.key] = values[f.key];
  }
  return out;
}

export function SmartForm({
  fields, initialValues = {}, onSubmit, onCancel,
  autoSave = false, autoSaveKey,
  submitLabel = 'حفظ', cancelLabel = 'إلغاء',
  title, layout = 'grid',
}: SmartFormProps) {
  const [values, setValues] = useState<FormValues>(() => ({ ...buildDefaults(fields), ...(initialValues as FormValues) }));
  const valuesRef = useRef<FormValues>(values);
  valuesRef.current = values;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [history, setHistory] = useState<FormValues[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Draft auto-save
  useEffect(() => {
    if (!autoSave || !autoSaveKey) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(`draft_${autoSaveKey}`, JSON.stringify(draftValues(fields, values)));
        setSavedAt(new Date());
      } catch { /* storage unavailable or full: skip the draft */ }
    }, 1000);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [values, fields, autoSave, autoSaveKey]);

  // Load draft on mount
  useEffect(() => {
    if (!autoSave || !autoSaveKey) return;
    let restored: FormValues = valuesRef.current;
    try {
      const draft = localStorage.getItem(`draft_${autoSaveKey}`);
      if (draft) {
        const parsed: unknown = JSON.parse(draft);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          restored = { ...restored, ...draftValues(fields, parsed as FormValues) };
          setValues(restored);
        }
      }
    } catch { /* corrupt draft: ignore */ }
    // Push initial state to history
    setHistory([restored]);
    setHistoryIndex(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = useCallback((key: string, value: unknown) => {
    const next = { ...valuesRef.current, [key]: value };
    valuesRef.current = next;
    setValues(next);
    // History for undo/redo (kept outside the state updater so StrictMode cannot double-record)
    setHistory((h) => [...h.slice(0, historyIndex + 1), next].slice(-50));
    setHistoryIndex(Math.min(historyIndex + 1, 49));
    // Clear error on change
    setErrors((prev) => { if (prev[key]) { const n = { ...prev }; delete n[key]; return n; } return prev; });
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((i) => i - 1);
      setValues(history[historyIndex - 1]);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((i) => i + 1);
      setValues(history[historyIndex + 1]);
    }
  }, [historyIndex, history]);

  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.visible && !f.visible(values)) return;
      const val = values[f.key];
      if (f.required && isEmptyValue(val)) { errs[f.key] = 'هذا الحقل مطلوب'; return; }
      if (f.type === 'gps' && isGpsValue(val) && val.lat !== '' && val.lng !== '') {
        const bad = validatePosition([val.lng, val.lat]);
        if (bad) { errs[f.key] = 'إحداثيات غير صالحة: ' + bad; return; }
      }
      if (f.validate) { const err = f.validate(val, values); if (err) errs[f.key] = err; }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [fields, values]);

  const handleSubmit = useCallback(async () => {
    setTouched(new Set(fields.map((f) => f.key)));
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(values);
      if (autoSaveKey) localStorage.removeItem(`draft_${autoSaveKey}`);
    } finally {
      setSubmitting(false);
    }
  }, [validate, values, onSubmit, fields, autoSaveKey]);

  const clearDraft = useCallback(() => {
    if (autoSaveKey) localStorage.removeItem(`draft_${autoSaveKey}`);
    setValues({ ...buildDefaults(fields), ...(initialValues as FormValues) });
    setSavedAt(null);
  }, [autoSaveKey, fields, initialValues]);

  const visibleFields = fields.filter((f) => !f.visible || f.visible(values));

  return (
    <div className="space-y-4">
      {title && <h3 className="text-sm font-semibold text-ink-900 dark:text-white">{title}</h3>}

      {/* Auto-save indicator + undo/redo */}
      <div className="flex items-center gap-2 text-xs">
        {savedAt && (
          <span className="flex items-center gap-1 text-success-600 dark:text-success-400">
            <Check className="w-3 h-3" /> تم الحفظ التلقائي
          </span>
        )}
        <div className="flex items-center gap-1 mr-auto">
          <button onClick={undo} disabled={historyIndex <= 0} className="p-1 rounded text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 disabled:opacity-30 transition" title="تراجع">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1 rounded text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 disabled:opacity-30 transition" title="إعادة">
            <RotateCcw className="w-3.5 h-3.5 scale-x-[-1]" />
          </button>
          {autoSave && (
            <button onClick={clearDraft} className="text-[10px] text-ink-400 hover:text-danger-500 transition">مسح المسودة</button>
          )}
        </div>
      </div>

      <div className={cn(layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4')}>
        {visibleFields.map((field) => (
          <FieldRenderer
            key={field.key}
            field={field}
            value={values[field.key]}
            error={errors[field.key]}
            touched={touched.has(field.key)}
            onChange={(v) => setField(field.key, v)}
            colSpan={field.colSpan}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-ink-200/70 dark:border-ink-800/70">
        {onCancel && <button onClick={onCancel} className="btn-ghost text-sm">{cancelLabel}</button>}
        <button onClick={handleSubmit} disabled={submitting} className="btn-primary text-sm disabled:opacity-50">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

function FieldRenderer({
  field, value, error, touched, onChange, colSpan = 1,
}: {
  field: FormField;
  value: unknown;
  error?: string;
  touched: boolean;
  onChange: (v: unknown) => void;
  colSpan?: 1 | 2;
}) {
  const showError = !!(error && touched);
  const text = typeof value === 'string' || typeof value === 'number' ? String(value) : '';

  return (
    <div className={cn('space-y-1.5', colSpan === 2 && 'sm:col-span-2')}>
      <label className="text-xs font-medium text-ink-600 dark:text-ink-300 flex items-center gap-1">
        {field.label}
        {field.required && <span className="text-danger-500">*</span>}
      </label>

      {field.type === 'text' && (
        <input
          type="text"
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={cn('input', showError && 'border-danger-400 ring-1 ring-danger-400/30')}
        />
      )}

      {field.type === 'number' && (
        <input
          type="number"
          value={text}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          step={field.step}
          className={cn('input', showError && 'border-danger-400 ring-1 ring-danger-400/30')}
        />
      )}

      {field.type === 'password' && (
        <input
          type="password"
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={cn('input', showError && 'border-danger-400 ring-1 ring-danger-400/30')}
        />
      )}

      {field.type === 'textarea' && (
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className={cn('input resize-y', showError && 'border-danger-400 ring-1 ring-danger-400/30')}
        />
      )}

      {field.type === 'select' && (
        <div className="relative">
          <select
            value={text}
            onChange={(e) => onChange(e.target.value)}
            className={cn('input appearance-none pr-8', showError && 'border-danger-400 ring-1 ring-danger-400/30')}
          >
            <option value="">— اختر —</option>
            {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="w-4 h-4 text-ink-400 absolute top-1/2 -translate-y-1/2 left-2.5 pointer-events-none" />
        </div>
      )}

      {field.type === 'autocomplete' && (
        <AutocompleteField field={field} value={text} onChange={onChange} error={showError} />
      )}

      {field.type === 'date' && (
        <div className="relative">
          <input
            type="date"
            value={text}
            onChange={(e) => onChange(e.target.value)}
            className={cn('input', showError && 'border-danger-400 ring-1 ring-danger-400/30')}
          />
          <Calendar className="w-4 h-4 text-ink-400 absolute top-1/2 -translate-y-1/2 left-2.5 pointer-events-none" />
        </div>
      )}

      {field.type === 'time' && (
        <div className="relative">
          <input
            type="time"
            value={text}
            onChange={(e) => onChange(e.target.value)}
            className={cn('input', showError && 'border-danger-400 ring-1 ring-danger-400/30')}
          />
          <Clock className="w-4 h-4 text-ink-400 absolute top-1/2 -translate-y-1/2 left-2.5 pointer-events-none" />
        </div>
      )}

      {field.type === 'checkbox' && (
        <label className="flex items-center gap-2 cursor-pointer py-2">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded border-ink-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
          />
          <span className="text-sm text-ink-700 dark:text-ink-200">{field.placeholder}</span>
        </label>
      )}

      {field.type === 'color' && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={text || '#0F4C81'}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg border border-ink-200 dark:border-ink-700 cursor-pointer"
          />
          <input
            type="text"
            value={text}
            onChange={(e) => onChange(e.target.value)}
            className="input flex-1"
          />
        </div>
      )}

      {field.type === 'gps' && (
        <GpsField value={isGpsValue(value) ? value : null} onChange={onChange} error={showError} />
      )}

      {(field.type === 'image' || field.type === 'video' || field.type === 'file') && (
        <FileUploadField field={field} value={value} onChange={onChange} error={showError} />
      )}

      {field.helpText && !showError && <p className="text-[10px] text-ink-400">{field.helpText}</p>}
      {showError && (
        <p className="text-[10px] text-danger-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

function AutocompleteField({ field, value, onChange, error }: { field: FormField; value: string; onChange: (v: unknown) => void; error?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    if (!field.options) return [];
    if (!query) return field.options;
    return field.options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));
  }, [field.options, query]);

  return (
    <div className="relative">
      <input
        type="text"
        value={field.options?.find((o) => o.value === value)?.label ?? value}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); onChange(e.target.value); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder={field.placeholder ?? 'بحث...'}
        className={cn('input pr-8', error && 'border-danger-400 ring-1 ring-danger-400/30')}
      />
      <Search className="w-4 h-4 text-ink-400 absolute top-1/2 -translate-y-1/2 left-2.5" />
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-1 left-0 right-0 z-50 glass-strong rounded-xl shadow-lifted max-h-48 overflow-y-auto p-1"
          >
            {filtered.map((o) => (
              <button
                key={o.value}
                onMouseDown={(e) => { e.preventDefault(); onChange(o.value); setQuery(''); setOpen(false); }}
                className="w-full text-right px-3 py-1.5 rounded-lg text-xs hover:bg-ink-50 dark:hover:bg-ink-800/60 text-ink-700 dark:text-ink-200 transition"
              >
                {o.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GpsField({ value, onChange, error }: { value: GpsValue | null; onChange: (v: unknown) => void; error?: boolean }) {
  const [loading, setLoading] = useState(false);
  const lat: number | '' = value?.lat ?? '';
  const lng: number | '' = value?.lng ?? '';
  const parse = (raw: string): number | '' => (raw === '' || !Number.isFinite(Number(raw)) ? '' : Number(raw));

  const useGps = useCallback(() => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLoading(false); },
      () => setLoading(false),
      { enableHighAccuracy: true },
    );
  }, [onChange]);

  return (
    <div className={cn('space-y-2', error && 'ring-1 ring-danger-400/30 rounded-lg p-2')}>
      <div className="flex gap-2">
        <input
          type="number"
          step="0.000001"
          value={lat}
          onChange={(e) => onChange({ lat: parse(e.target.value), lng })}
          placeholder="خط العرض"
          className="input flex-1"
        />
        <input
          type="number"
          step="0.000001"
          value={lng}
          onChange={(e) => onChange({ lat, lng: parse(e.target.value) })}
          placeholder="خط الطول"
          className="input flex-1"
        />
        <button onClick={useGps} disabled={loading} className="btn-outline px-3" title="استخدام GPS">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
        </button>
      </div>
      <p className="text-[10px] text-ink-400">أدخل الإحداثيات أو استخدم GPS للتحديد التلقائي</p>
    </div>
  );
}

function FileUploadField({ field, value, onChange, error }: { field: FormField; value: unknown; onChange: (v: unknown) => void; error?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const files = useMemo<File[]>(() => {
    const list = Array.isArray(value) ? value : value ? [value] : [];
    return list.filter((f): f is File => f instanceof File);
  }, [value]);

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles = Array.from(fileList);
    onChange([...files, ...newFiles]);
  }, [files, onChange]);

  const removeFile = useCallback((idx: number) => {
    onChange(files.filter((_, i) => i !== idx));
  }, [files, onChange]);

  const accept = field.type === 'image' ? 'image/*' : field.type === 'video' ? 'video/*' : '*/*';
  const Icon = field.type === 'image' ? ImageIcon : field.type === 'video' ? Video : FileText;

  return (
    <div className={cn('space-y-2', error && 'ring-1 ring-danger-400/30 rounded-lg p-2')}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        className={cn(
          'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition',
          dragOver ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-600/10' : 'border-ink-200 dark:border-ink-700 hover:border-brand-400'
        )}
      >
        <input ref={inputRef} type="file" accept={accept} multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        <Icon className="w-6 h-6 text-ink-400 mx-auto mb-1" />
        <p className="text-xs text-ink-500">{field.placeholder ?? 'اسحب الملفات هنا أو انقر للرفع'}</p>
      </div>
      {files.length > 0 && (
        <div className="space-y-1">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-ink-50 dark:bg-ink-800/60 text-xs">
              <File className="w-3.5 h-3.5 text-ink-400 shrink-0" />
              <span className="flex-1 truncate text-ink-700 dark:text-ink-200">{f.name}</span>
              <span className="text-[10px] text-ink-400">{(f.size / 1024).toFixed(0)} KB</span>
              <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="p-0.5 rounded text-ink-400 hover:text-danger-500 transition">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
