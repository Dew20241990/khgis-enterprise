import { FolderArchive, FileText, File, FileCheck, Image, Download, Upload } from 'lucide-react';
import { CrudManager, type CrudConfig } from '@/components/ui/CrudManager';
import { Badge, StatCard } from '@/components/ui';
import { useApp } from '@/store/appStore';

export interface Doc {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  author: string;
  category: string;
}

export const docs: Doc[] = Array.from({ length: 24 }, (_, i) => ({
  id: `D-${i + 1}`,
  name: ['تقرير شهري جويلية 2026', 'محضر اجتماع المديرية', 'خطة التنظيف الفصلية', 'عقد مقاولة نظافة', 'تقرير تفتيش بلدي', 'دفتر شروط CET', 'محضر معاينة نقطة سوداء', 'تقرير أداء مقاول'][i % 8],
  type: ['pdf', 'doc', 'pdf', 'doc', 'pdf', 'xlsx', 'pdf', 'doc'][i % 8],
  size: `${(1 + (i % 5)).toFixed(1)} MB`,
  date: new Date(2026, 6, 1 + (i % 20)).toISOString(),
  author: ['س. بن عمر', 'م. خليفي', 'ف. بلقاسم', 'ل. حمداني'][i % 4],
  category: ['تقارير', 'محاضر', 'خطط', 'عقود', 'تفتيش', 'مواصفات'][i % 6],
}));

const typeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-4 h-4 text-danger-500" />,
  doc: <FileText className="w-4 h-4 text-brand-500" />,
  xlsx: <FileCheck className="w-4 h-4 text-success-500" />,
  img: <Image className="w-4 h-4 text-warning-500" />,
};

const categories = ['تقارير', 'محاضر', 'خطط', 'عقود', 'تفتيش', 'مواصفات'];

const config: CrudConfig<Doc> = {
  entityName: 'وثيقة',
  entityNamePlural: 'الوثائق',
  icon: <FolderArchive className="w-5 h-5" />,
  rowKey: (d) => d.id,
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  columns: [
    { key: 'name', header: 'الاسم', sortable: true, searchable: true, width: 280, pinned: 'left', render: (d) => (
      <div className="flex items-center gap-2">
        {typeIcons[d.type] ?? <File className="w-4 h-4 text-ink-400" />}
        <span className="font-medium text-ink-800 dark:text-ink-100">{d.name}</span>
      </div>
    ) },
    { key: 'category', header: 'التصنيف', sortable: true, searchable: true, width: 120, render: (d) => <Badge tone="neutral">{d.category}</Badge> },
    { key: 'type', header: 'النوع', sortable: true, width: 80, render: (d) => <span className="uppercase text-xs font-medium text-ink-500">{d.type}</span> },
    { key: 'size', header: 'الحجم', sortable: true, width: 80 },
    { key: 'author', header: 'المؤلف', sortable: true, searchable: true, width: 120 },
    { key: 'date', header: 'التاريخ', sortable: true, width: 120, exportValue: (d) => d.date, render: (d) => <span className="text-xs text-ink-500">{new Date(d.date).toLocaleDateString('ar-DZ')}</span> },
  ],
  formFields: [
    { key: 'name', label: 'اسم الوثيقة', type: 'text', required: true, placeholder: 'تقرير شهري' },
    { key: 'category', label: 'التصنيف', type: 'select', required: true, options: categories.map((c) => ({ value: c, label: c })) },
    { key: 'type', label: 'النوع', type: 'select', required: true, options: [
      { value: 'pdf', label: 'PDF' }, { value: 'doc', label: 'Word' }, { value: 'xlsx', label: 'Excel' }, { value: 'img', label: 'صورة' },
    ]},
    { key: 'author', label: 'المؤلف', type: 'text', required: true },
    { key: 'file', label: 'الملف', type: 'file', colSpan: 2 },
  ],
  filters: [
    { key: 'category', label: 'التصنيف', type: 'select', value: 'all', onChange: () => {}, options: categories.map((c) => ({ value: c, label: c })) },
    { key: 'type', label: 'النوع', type: 'select', value: 'all', onChange: () => {}, options: [
      { value: 'pdf', label: 'PDF' }, { value: 'doc', label: 'Word' }, { value: 'xlsx', label: 'Excel' },
    ]},
  ],
};

export function DocumentsPage() {
  const { t } = useApp();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {categories.map((cat, i) => (
          <div key={cat} className="card card-hover p-4 text-center cursor-pointer">
            <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-2 ${['bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-400', 'bg-success-50 text-success-600 dark:bg-success-600/15 dark:text-success-400', 'bg-warning-50 text-warning-600 dark:bg-warning-600/15 dark:text-warning-400', 'bg-danger-50 text-danger-600 dark:bg-danger-600/15 dark:text-danger-400', 'bg-sky-50 text-sky-600 dark:bg-sky-600/15 dark:text-sky-400', 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'][i]}`}>
              <FolderArchive className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{cat}</p>
            <p className="text-xs text-ink-400">{docs.filter((d) => d.category === cat).length} ملف</p>
          </div>
        ))}
      </div>
      <CrudManager config={config} data={docs} />
    </div>
  );
}
