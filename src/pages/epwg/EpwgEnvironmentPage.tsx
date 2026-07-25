import { motion } from 'framer-motion';
import { Droplets, Flame, Wind, ShieldCheck, AlertTriangle, ClipboardCheck, Gauge, Leaf } from 'lucide-react';
import {
  BarChart, Bar, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from '@/components/charts/ChartKit';
import { PageHeader, StatCard, Card, CardHeader, CardBody, Badge, EnterpriseDataTable, type EnterpriseColumn } from '@/components/ui';
import { epwgEnvMonitoring, epwgInspections, epwgFacilities, epwgAlerts, type EnvMonitoring } from '@/data/epwgData';
import { useApp } from '@/store/appStore';
import { cn } from '@/lib/cn';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const statusColor: Record<string, string> = { normal: '#16A34A', warning: '#F59E0B', critical: '#DC2626' };

const typeIcon: Record<string, React.ReactNode> = {
  groundwater: <Droplets className="w-4 h-4" />,
  leachate: <Droplets className="w-4 h-4" />,
  gas: <Wind className="w-4 h-4" />,
  'fire-risk': <Flame className="w-4 h-4" />,
  compliance: <ShieldCheck className="w-4 h-4" />,
};

const resultColor: Record<string, string> = { pass: '#16A34A', conditional: '#F59E0B', fail: '#DC2626' };

export function EpwgEnvironmentPage() {
  const { t, locale } = useApp();

  const facilityName = (id: string) => {
    const f = epwgFacilities.find((x) => x.id === id);
    return f ? (locale === 'ar' ? f.nameAr : f.nameFr) : id;
  };

  const stats = {
    normal: epwgEnvMonitoring.filter((e) => e.status === 'normal').length,
    warning: epwgEnvMonitoring.filter((e) => e.status === 'warning').length,
    critical: epwgEnvMonitoring.filter((e) => e.status === 'critical').length,
    inspections: epwgInspections.length,
    passed: epwgInspections.filter((i) => i.result === 'pass').length,
    failed: epwgInspections.filter((i) => i.result === 'fail').length,
  };

  // Aggregate by type
  const byType = ['groundwater', 'leachate', 'gas', 'fire-risk', 'compliance'].map((type) => {
    const records = epwgEnvMonitoring.filter((e) => e.type === type);
    return {
      type,
      typeAr: records[0]?.typeAr ?? type,
      normal: records.filter((r) => r.status === 'normal').length,
      warning: records.filter((r) => r.status === 'warning').length,
      critical: records.filter((r) => r.status === 'critical').length,
    };
  });

  const monitoringColumns: EnterpriseColumn<EnvMonitoring>[] = [
    { key: 'id', header: locale === 'ar' ? 'المعرّف' : 'ID', sortable: true, searchable: true, pinned: 'left', width: 90,
      render: (e) => <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">{e.id}</span> },
    { key: 'facilityId', header: t('epwgFacilities'), sortable: true, searchable: true, width: 160,
      render: (e) => <span className="text-xs">{facilityName(e.facilityId)}</span>,
      exportValue: (e) => facilityName(e.facilityId) },
    { key: 'typeAr', header: locale === 'ar' ? 'النوع' : 'Type', sortable: true, width: 140,
      render: (e) => (
        <div className="flex items-center gap-2">
          <span className="text-ink-400">{typeIcon[e.type]}</span>
          <span className="text-xs">{e.typeAr}</span>
        </div>
      ) },
    { key: 'value', header: locale === 'ar' ? 'القيمة' : 'Value', sortable: true, width: 120, align: 'left',
      render: (e) => <span className="text-sm font-semibold">{e.value} {e.unit}</span>,
      exportValue: (e) => e.value + ' ' + e.unit },
    { key: 'status', header: t('epwgOperationalStatus'), sortable: true, width: 120,
      render: (e) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{ background: `${statusColor[e.status]}20`, color: statusColor[e.status] }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor[e.status] }} />
          {e.status}
        </span>
      ) },
    { key: 'date', header: locale === 'ar' ? 'التاريخ' : 'Date', sortable: true, width: 120,
      render: (e) => <span className="text-xs text-ink-500">{e.date}</span> },
    { key: 'notesAr', header: locale === 'ar' ? 'ملاحظات' : 'Notes', searchable: true, width: 220,
      render: (e) => <span className="text-xs text-ink-400 truncate">{locale === 'ar' ? e.notesAr : e.notes}</span> },
  ];

  return (
    <div>
      <PageHeader title={t('epwgEnvironment')} subtitle={locale === 'ar' ? 'المراقبة البيئية لمنشآت EPWG' : 'Environmental monitoring of EPWG facilities'} icon={<Leaf className="w-5 h-5" />} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label={locale === 'ar' ? 'طبيعي' : 'Normal'} value={stats.normal} icon={<ShieldCheck className="w-5 h-5" />} tone="success" />
        <StatCard label={locale === 'ar' ? 'تحذير' : 'Warning'} value={stats.warning} icon={<AlertTriangle className="w-5 h-5" />} tone="warning" />
        <StatCard label={locale === 'ar' ? 'حرج' : 'Critical'} value={stats.critical} icon={<Flame className="w-5 h-5" />} tone="danger" />
        <StatCard label={t('epwgInspectionHistory')} value={stats.inspections} icon={<ClipboardCheck className="w-5 h-5" />} tone="brand" />
      </div>

      {/* Monitoring categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card>
          <CardHeader title={locale === 'ar' ? 'المراقبة حسب النوع' : 'Monitoring by Type'} icon={<Gauge className="w-4 h-4" />} />
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="typeAr" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="normal" stackId="a" fill="#16A34A" name={locale === 'ar' ? 'طبيعي' : 'Normal'} />
                <Bar dataKey="warning" stackId="a" fill="#F59E0B" name={locale === 'ar' ? 'تحذير' : 'Warning'} />
                <Bar dataKey="critical" stackId="a" fill="#DC2626" name={locale === 'ar' ? 'حرج' : 'Critical'} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t('epwgFireRisk')} icon={<Flame className="w-4 h-4" />} />
          <CardBody>
            <div className="space-y-3">
              {epwgFacilities.map((f, i) => {
                const fireRec = epwgEnvMonitoring.find((e) => e.facilityId === f.id && e.type === 'fire-risk');
                const level = fireRec?.valueNum ?? 1;
                const colors = ['#16A34A', '#16A34A', '#F59E0B', '#F97316', '#DC2626'];
                const labels = ['—', locale === 'ar' ? 'منخفض' : 'Low', locale === 'ar' ? 'متوسط' : 'Medium', locale === 'ar' ? 'عالي' : 'High', locale === 'ar' ? 'حرج' : 'Critical'];
                return (
                  <motion.div key={f.id} {...fadeUp} transition={{ duration: 0.2, delay: i * 0.03 }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-ink-700 dark:text-ink-200">{locale === 'ar' ? f.nameAr : f.nameFr}</span>
                      <span className="text-xs font-bold" style={{ color: colors[level] }}>{labels[level]}</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((seg) => (
                        <div key={seg} className="flex-1 h-2 rounded-full"
                          style={{ background: seg <= level ? colors[level] : '#e2e8f0', opacity: seg <= level ? 1 : 0.3 }} />
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Environmental placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {[
          { icon: <Droplets className="w-5 h-5" />, title: t('epwgGroundwater'), tone: 'brand', count: epwgEnvMonitoring.filter((e) => e.type === 'groundwater').length },
          { icon: <Droplets className="w-5 h-5" />, title: t('epwgLeachate'), tone: 'warning', count: epwgEnvMonitoring.filter((e) => e.type === 'leachate').length },
          { icon: <Wind className="w-5 h-5" />, title: t('epwgGas'), tone: 'success', count: epwgEnvMonitoring.filter((e) => e.type === 'gas').length },
        ].map((ph, i) => (
          <motion.div key={i} {...fadeUp} transition={{ duration: 0.25, delay: i * 0.05 }}>
            <Card hover>
              <CardBody>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br',
                    ph.tone === 'brand' ? 'from-brand-500/10 to-brand-500/5 text-brand-600 dark:text-brand-400'
                    : ph.tone === 'warning' ? 'from-warning-500/10 to-warning-500/5 text-warning-600 dark:text-warning-400'
                    : 'from-success-500/10 to-success-500/5 text-success-600 dark:text-success-400')}>
                    {ph.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink-900 dark:text-white">{ph.title}</p>
                    <p className="text-[11px] text-ink-400">{ph.count} {locale === 'ar' ? 'محطة' : 'stations'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl2 bg-ink-50 dark:bg-ink-800/40">
                  <span className="text-xs text-ink-500">{locale === 'ar' ? 'الحالة' : 'Status'}</span>
                  <Badge tone="success">{locale === 'ar' ? 'نشط' : 'Active'}</Badge>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Inspection history */}
      <Card className="mb-5">
        <CardHeader title={t('epwgInspectionHistory')} icon={<ClipboardCheck className="w-4 h-4" />} />
        <CardBody>
          <div className="space-y-2">
            {epwgInspections.map((insp, i) => (
              <motion.div key={insp.id} {...fadeUp} transition={{ duration: 0.2, delay: i * 0.02 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-ink-100 dark:border-ink-800/60 hover:bg-ink-50/50 dark:hover:bg-ink-800/30 transition">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: resultColor[insp.result] }}>
                  <ClipboardCheck className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink-800 dark:text-ink-100">{facilityName(insp.facilityId)}</p>
                  <p className="text-[11px] text-ink-500">{locale === 'ar' ? insp.findingsAr : insp.findings}</p>
                </div>
                <div className="text-left">
                  <span className="text-xs font-semibold" style={{ color: resultColor[insp.result] }}>{insp.result}</span>
                  <p className="text-[10px] text-ink-400">{insp.date} · {locale === 'ar' ? insp.inspectorAr : insp.inspector}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Monitoring table */}
      <Card>
        <CardHeader title={t('epwgEnvironment')} subtitle={locale === 'ar' ? 'سجلات المراقبة' : 'Monitoring records'} icon={<Gauge className="w-4 h-4" />} />
        <CardBody>
          <EnterpriseDataTable columns={monitoringColumns} rows={epwgEnvMonitoring} rowKey={(e) => e.id} pageSize={10} title={t('epwgEnvironment')} onPrint={() => window.print()} />
        </CardBody>
      </Card>
    </div>
  );
}
