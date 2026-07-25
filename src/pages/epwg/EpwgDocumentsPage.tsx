import { useState, useMemo } from 'react';
import { FolderArchive, FileText, FileCheck, FileWarning, BookOpen, Download, Search } from 'lucide-react';
import { PageHeader, Card, CardHeader, CardBody, Badge, EnterpriseDataTable, type EnterpriseColumn } from '@/components/ui';
import { epwgDocuments, epwgFacilities, type EpwgDocument } from '@/data/epwgData';
import { useApp } from '@/store/appStore';
import { cn } from '@/lib/cn';

const typeIcon: Record<string, React.ReactNode> = {
  report: <FileText className="w-4 h-4" />,
  permit: <FileCheck className="w-4 h-4" />,
  plan: <BookOpen className="w-4 h-4" />,
  protocol: <FileCheck className="w-4 h-4" />,
  manual: <BookOpen className="w-4 h-4" />,
};

const typeTone: Record<string, 'brand' | 'success' | 'warning' | 'neutral'> = {
  report: 'brand', permit: 'success', plan: 'warning', protocol: 'success', manual: 'neutral',
};

export function EpwgDocumentsPage() {
  const { t, locale } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const facilityName = (id: string | null) => {
    if (!id) return locale === 'ar' ? 'عام' : 'General';
    const f = epwgFacilities.find((x) => x.id === id);
    return f ? (locale === 'ar' ? f.nameAr : f.nameFr) : id;
  };

  const filtered = useMemo(() => epwgDocuments.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = !q || (locale === 'ar' ? d.titleAr : d.title).toLowerCase().includes(q) || d.id.toLowerCase().includes(q);
    const matchType = typeFilter === 'all' || d.type === typeFilter;
    return matchSearch && matchType;
  }), [search, typeFilter, locale]);

  const columns: EnterpriseColumn<EpwgDocument>[] = [
    { key: 'id', header: locale === 'ar' ? 'المعرّف' : 'ID', sortable: true, searchable: true, pinned: 'left', width: 90,
      render: (d) => <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">{d.id}</span> },
    { key: 'titleAr', header: locale === 'ar' ? 'العنوان' : 'Title', sortable: true, searchable: true, width: 300,
      render: (d) => (
        <div className="flex items-center gap-2">
          <span className="text-ink-400">{typeIcon[d.type]}</span>
          <span className="text-sm font-medium">{locale === 'ar' ? d.titleAr : d.title}</span>
        </div>
      ),
      exportValue: (d) => locale === 'ar' ? d.titleAr : d.title },
    { key: 'typeAr', header: locale === 'ar' ? 'النوع' : 'Type', sortable: true, width: 120,
      render: (d) => <Badge tone={typeTone[d.type]}>{d.typeAr}</Badge> },
    { key: 'facilityId', header: t('epwgFacilities'), sortable: true, width: 160,
      render: (d) => <span className="text-xs">{facilityName(d.facilityId)}</span>,
      exportValue: (d) => facilityName(d.facilityId) },
    { key: 'date', header: locale === 'ar' ? 'التاريخ' : 'Date', sortable: true, width: 120,
      render: (d) => <span className="text-xs text-ink-500">{d.date}</span> },
    { key: 'size', header: locale === 'ar' ? 'الحجم' : 'Size', sortable: true, width: 100, align: 'left',
      render: (d) => <span className="text-xs text-ink-500">{d.size}</span> },
    { key: 'author', header: locale === 'ar' ? 'المؤلف' : 'Author', sortable: true, searchable: true, width: 160,
      render: (d) => <span className="text-xs text-ink-500">{d.author}</span> },
    { key: 'actions', header: '', width: 80, pinned: 'right',
      render: (d) => (
        <button className="p-2 rounded-lg text-ink-400 hover:bg-brand-50 dark:hover:bg-brand-600/10 hover:text-brand-600 transition" title={t('export')}>
          <Download className="w-4 h-4" />
        </button>
      ) },
  ];

  return (
    <div>
      <PageHeader title={t('epwgDocuments')} subtitle={`${epwgDocuments.length} ${locale === 'ar' ? 'وثيقة' : 'documents'}`} icon={<FolderArchive className="w-5 h-5" />} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {([
          { type: 'report', label: locale === 'ar' ? 'تقارير' : 'Reports', icon: <FileText className="w-5 h-5" />, tone: 'brand' as const },
          { type: 'permit', label: locale === 'ar' ? 'رخص' : 'Permits', icon: <FileCheck className="w-5 h-5" />, tone: 'success' as const },
          { type: 'plan', label: locale === 'ar' ? 'مخططات' : 'Plans', icon: <BookOpen className="w-5 h-5" />, tone: 'warning' as const },
          { type: 'manual', label: locale === 'ar' ? 'أدلة' : 'Manuals', icon: <FileWarning className="w-5 h-5" />, tone: 'neutral' as const },
        ]).map((cat, i) => {
          const count = epwgDocuments.filter((d) => d.type === cat.type).length;
          return (
            <button key={cat.type} onClick={() => setTypeFilter(typeFilter === cat.type ? 'all' : cat.type)}
              className={cn('card card-hover p-4 text-right transition', typeFilter === cat.type && 'ring-2 ring-brand-500/40')}>
              <div className="flex items-center justify-between mb-2">
                <span className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br',
                  cat.tone === 'brand' ? 'from-brand-500/10 to-brand-500/5 text-brand-600 dark:text-brand-400'
                  : cat.tone === 'success' ? 'from-success-500/10 to-success-500/5 text-success-600 dark:text-success-400'
                  : cat.tone === 'warning' ? 'from-warning-500/10 to-warning-500/5 text-warning-600 dark:text-warning-400'
                  : 'from-ink-500/10 to-ink-500/5 text-ink-600 dark:text-ink-300')}>
                  {cat.icon}
                </span>
                <span className="text-2xl font-bold text-ink-900 dark:text-white">{count}</span>
              </div>
              <p className="text-xs font-medium text-ink-500 dark:text-ink-400">{cat.label}</p>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader title={t('epwgDocuments')} icon={<FolderArchive className="w-4 h-4" />} />
        <CardBody>
          <EnterpriseDataTable columns={columns} rows={filtered} rowKey={(d) => d.id} pageSize={10} title={t('epwgDocuments')} onPrint={() => window.print()} />
        </CardBody>
      </Card>
    </div>
  );
}
