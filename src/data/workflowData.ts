// Government Inspection & Work Order Workflow — data model + mock data
// Frontend-only, structured for future Laravel + PostgreSQL/PostGIS integration.

import { municipalities, neighborhoods, KHENCHELA_CENTER, contractors, cetCenters } from './mockData';

export type ResponsibleEntity = 'municipality' | 'cet' | 'contractor' | 'environment';
export type ObservationType =
  | 'waste_accumulation' | 'broken_container' | 'illegal_dumping' | 'drain_blockage'
  | 'construction_debris' | 'random_dumping' | 'overflowing_container' | 'animal_waste'
  | 'green_waste' | 'hazardous_waste';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';
export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type ObservationStatus =
  | 'open' | 'assigned' | 'inProgress' | 'completed' | 'verified' | 'closed' | 'rejected' | 'rework';
export type WorkOrderStatus =
  | 'created' | 'assigned' | 'inProgress' | 'completed' | 'verified' | 'closed' | 'rejected' | 'rework';
export type VerificationResult = 'accepted' | 'rejected' | 'rework';

export interface TimelineEvent {
  id: string;
  type: 'created' | 'assigned' | 'started' | 'completed' | 'verified' | 'closed' | 'rejected' | 'rework' | 'note';
  label: string;
  labelFr: string;
  labelEn: string;
  date: string;
  actor: string;
  note?: string;
}

export interface Observation {
  id: string;
  number: string;
  inspectionNumber: string;
  municipality: string;
  municipalityId: string;
  operationalZone: string;
  neighborhood: string;
  sector: string;
  street: string;
  type: ObservationType;
  typeLabel: string;
  typeLabelFr: string;
  typeLabelEn: string;
  description: string;
  priority: Priority;
  riskLevel: RiskLevel;
  lat: number;
  lng: number;
  googleMapsLink: string;
  responsibleEntity: ResponsibleEntity;
  responsibleEntityLabel: string;
  beforePhotos: string[];
  inspectorNotes: string;
  status: ObservationStatus;
  workOrderId: string | null;
  createdAt: string;
  timeline: TimelineEvent[];
}

export interface WorkOrder {
  id: string;
  number: string;
  createdAt: string;
  responsibleOrganization: ResponsibleEntity;
  responsibleOrganizationLabel: string;
  municipality: string;
  municipalityId: string;
  operationalZone: string;
  observationRef: string;
  observationId: string;
  deadline: string;
  priority: Priority;
  status: WorkOrderStatus;
  assignedTeam: string;
  estimatedDurationHours: number;
  workStartedAt: string | null;
  workCompletedAt: string | null;
  completionDate: string | null;
  afterPhotos: string[];
  executionNotes: string;
  verificationDate: string | null;
  verificationResult: VerificationResult | null;
  inspectorNotes: string;
  closedAt: string | null;
  archived: boolean;
  timeline: TimelineEvent[];
}

export interface WorkflowInspection {
  id: string;
  number: string;
  inspector: string;
  municipality: string;
  municipalityId: string;
  date: string;
  observations: Observation[];
  gps: { lat: number; lng: number };
  notes: string;
}

export const observationTypeData: Record<ObservationType, { ar: string; fr: string; en: string }> = {
  waste_accumulation: { ar: 'تراكم النفايات', fr: 'Accumulation de déchets', en: 'Waste Accumulation' },
  broken_container: { ar: 'حاوية مكسورة', fr: 'Conteneur cassé', en: 'Broken Container' },
  illegal_dumping: { ar: 'تفريغ غير قانوني', fr: 'Dépôt illégal', en: 'Illegal Dumping' },
  drain_blockage: { ar: 'انسداد المجاري', fr: 'Canalisation bouchée', en: 'Drain Blockage' },
  construction_debris: { ar: 'حطام البناء', fr: 'Débris de construction', en: 'Construction Debris' },
  random_dumping: { ar: 'رمي عشوائي', fr: 'Dépôt aléatoire', en: 'Random Dumping' },
  overflowing_container: { ar: 'حاوية ممتلئة', fr: 'Conteneur débordant', en: 'Overflowing Container' },
  animal_waste: { ar: 'نفايات حيوانية', fr: 'Déchets animaux', en: 'Animal Waste' },
  green_waste: { ar: 'نفايات خضراء', fr: 'Déchets verts', en: 'Green Waste' },
  hazardous_waste: { ar: 'نفايات خطرة', fr: 'Déchets dangereux', en: 'Hazardous Waste' },
};

export const responsibleEntityLabels: Record<ResponsibleEntity, { ar: string; fr: string; en: string }> = {
  municipality: { ar: 'البلدية', fr: 'Commune', en: 'Municipality' },
  cet: { ar: 'مركز الطرح التقني', fr: 'CET', en: 'Technical Landfill Center' },
  contractor: { ar: 'مقاول خاص', fr: 'Prestataire privé', en: 'Private Contractor' },
  environment: { ar: 'مديرية البيئة', fr: "Direction de l'environnement", en: 'Environment Directorate' },
};

export const statusColors: Record<string, string> = {
  open: '#EF4444', created: '#EF4444',
  assigned: '#F97316',
  inProgress: '#3B82F6',
  completed: '#16A34A',
  verified: '#14B8A6',
  closed: '#94A3B8',
  rejected: '#DC2626',
  rework: '#F59E0B',
};

export const statusLabels: Record<string, { ar: string; fr: string; en: string }> = {
  open: { ar: 'مفتوح', fr: 'Ouvert', en: 'Open' },
  created: { ar: 'منشأ', fr: 'Créé', en: 'Created' },
  assigned: { ar: 'مُسند', fr: 'Assigné', en: 'Assigned' },
  inProgress: { ar: 'قيد التنفيذ', fr: 'En cours', en: 'In Progress' },
  completed: { ar: 'مكتمل', fr: 'Terminé', en: 'Completed' },
  verified: { ar: 'مُتحقق', fr: 'Vérifié', en: 'Verified' },
  closed: { ar: 'مغلق', fr: 'Clôturé', en: 'Closed' },
  rejected: { ar: 'مرفوض', fr: 'Rejeté', en: 'Rejected' },
  rework: { ar: 'إعادة العمل', fr: 'Reprise', en: 'Rework' },
};

export const priorityLabels: Record<string, { ar: string; fr: string; en: string }> = {
  critical: { ar: 'حرج', fr: 'Critique', en: 'Critical' },
  high: { ar: 'عالي', fr: 'Élevé', en: 'High' },
  medium: { ar: 'متوسط', fr: 'Moyen', en: 'Medium' },
  low: { ar: 'منخفض', fr: 'Bas', en: 'Low' },
};

export const riskLabels: Record<string, { ar: string; fr: string; en: string }> = {
  critical: { ar: 'حرج', fr: 'Critique', en: 'Critical' },
  high: { ar: 'عالي', fr: 'Élevé', en: 'High' },
  medium: { ar: 'متوسط', fr: 'Moyen', en: 'Medium' },
  low: { ar: 'منخفض', fr: 'Bas', en: 'Low' },
};

// --- Mock data generation ---

const priorities: Priority[] = ['critical', 'high', 'medium', 'low'];
const riskLevels: RiskLevel[] = ['critical', 'high', 'medium', 'low'];
const observationTypes = Object.keys(observationTypeData) as ObservationType[];
const responsibleEntities: ResponsibleEntity[] = ['municipality', 'cet', 'contractor', 'environment'];

const operationalZones = ['المنطقة الشمالية', 'المنطقة الجنوبية', 'المنطقة الشرقية', 'المنطقة الغربية', 'المنطقة المركزية'];
const sectors = ['القطاع 1', 'القطاع 2', 'القطاع 3', 'القطاع 4'];
const streets = ['شارع الاستقلال', 'شارع الأمير عبد القادر', 'شارع 1 نوفمبر', 'شارع الشهداء', 'شارع الأمل', 'شارع النصر'];

const pexelsPhotos = [
  'https://images.pexels.com/photos/4601395/pexels-photo-4601395.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2770/pexels-photo-2770.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2682566/pexels-photo-2682566.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/280232/pexels-photo-280232.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/105683/pexels-photo-105683.jpeg?auto=compress&cs=tinysrgb&w=600',
];

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }

function makeTimeline(
  status: ObservationStatus,
  createdAt: string,
  inspector: string,
  team: string,
): TimelineEvent[] {
  const events: TimelineEvent[] = [{
    id: 'ev-1', type: 'created',
    label: 'إنشاء الملاحظة', labelFr: 'Observation créée', labelEn: 'Observation Created',
    date: createdAt, actor: inspector,
  }];

  const statusOrder: ObservationStatus[] = ['assigned', 'inProgress', 'completed', 'verified', 'closed'];
  const statusIdx = statusOrder.indexOf(status);
  if (statusIdx === -1 && status === 'rejected') {
    events.push({
      id: 'ev-2', type: 'rejected',
      label: 'رفض العمل', labelFr: 'Travail rejeté', labelEn: 'Work Rejected',
      date: new Date(new Date(createdAt).getTime() + 3 * 86400000).toISOString(),
      actor: inspector, note: 'العمل لا يطابق المواصفات',
    });
    return events;
  }
  if (statusIdx === -1 && status === 'rework') {
    events.push({
      id: 'ev-2', type: 'rework',
      label: 'إعادة العمل', labelFr: 'Reprise nécessaire', labelEn: 'Rework Required',
      date: new Date(new Date(createdAt).getTime() + 3 * 86400000).toISOString(),
      actor: inspector, note: 'يحتاج تحسينات',
    });
    return events;
  }

  const baseDate = new Date(createdAt);
  const labels: Record<string, { ar: string; fr: string; en: string; actor: string }> = {
    assigned: { ar: 'إسناد أمر الشغل', fr: 'Ordre de travail assigné', en: 'Work Order Assigned', actor: team },
    inProgress: { ar: 'بدء التنفيذ', fr: 'Travail commencé', en: 'Work Started', actor: team },
    completed: { ar: 'إكمال العمل', fr: 'Travail terminé', en: 'Work Completed', actor: team },
    verified: { ar: 'التحقق من التنفيذ', fr: 'Vérification effectuée', en: 'Verification Done', actor: inspector },
    closed: { ar: 'إغلاق وأرشفة', fr: 'Clôturé et archivé', en: 'Closed & Archived', actor: inspector },
  };

  for (let i = 0; i <= statusIdx; i++) {
    const s = statusOrder[i];
    const l = labels[s];
    events.push({
      id: `ev-${i + 2}`, type: s as any,
      label: l.ar, labelFr: l.fr, labelEn: l.en,
      date: new Date(baseDate.getTime() + (i + 1) * 86400000 * 2).toISOString(),
      actor: l.actor,
    });
  }
  return events;
}

const inspectionCount = 24;
const observationsPerInspection = 2;

export const workflowInspections: WorkflowInspection[] = Array.from({ length: inspectionCount }, (_, ii) => {
  const m = municipalities[ii % municipalities.length];
  const n = neighborhoods[ii % neighborhoods.length];
  const inspector = m.inspector;
  const inspDate = new Date(2026, 6, 1 + (ii % 21)).toISOString();
  const inspNumber = `INS-${7001 + ii}`;

  const observations: Observation[] = Array.from({ length: observationsPerInspection }, (_, oi) => {
    const oIdx = ii * observationsPerInspection + oi;
    const type = pick(observationTypes, oIdx);
    const priority = pick(priorities, oIdx);
    const risk = pick(riskLevels, oIdx);
    const respEntity = pick(responsibleEntities, oIdx);
    const lat = m.center[0] + (Math.random() - 0.5) * 0.02;
    const lng = m.center[1] + (Math.random() - 0.5) * 0.02;
    const obsNumber = `OBS-${10001 + oIdx}`;
    const requiresIntervention = priority === 'critical' || priority === 'high' || (oIdx % 3 !== 2);

    const statusOptions: ObservationStatus[] = requiresIntervention
      ? ['open', 'assigned', 'inProgress', 'completed', 'verified', 'closed']
      : ['open', 'closed'];
    const obsStatus = pick(statusOptions, oIdx);

    const woNumber = requiresIntervention ? `WO-${20001 + oIdx}` : null;
    const team = `فريق ${pick(['البلدية', 'CET', 'المقاول'], oIdx)} ${1 + (oIdx % 3)}`;
    const timeline = makeTimeline(obsStatus, inspDate, inspector, team);

    return {
      id: `OBS-${10001 + oIdx}`,
      number: obsNumber,
      inspectionNumber: inspNumber,
      municipality: m.nameAr,
      municipalityId: m.id,
      operationalZone: pick(operationalZones, oIdx),
      neighborhood: n.nameAr,
      sector: pick(sectors, oIdx),
      street: pick(streets, oIdx),
      type,
      typeLabel: observationTypeData[type].ar,
      typeLabelFr: observationTypeData[type].fr,
      typeLabelEn: observationTypeData[type].en,
      description: `تم رصد ${observationTypeData[type].ar} في ${pick(streets, oIdx)} ببلدية ${m.nameAr} يتطلب تدخلاً.`,
      priority,
      riskLevel: risk,
      lat, lng,
      googleMapsLink: `https://www.google.com/maps?q=${lat},${lng}`,
      responsibleEntity: respEntity,
      responsibleEntityLabel: responsibleEntityLabels[respEntity].ar,
      beforePhotos: [pick(pexelsPhotos, oIdx), pick(pexelsPhotos, oIdx + 1)],
      inspectorNotes: 'تم توثيق الحالة ميدانياً مع التقاط الصور وتسجيل الإحداثيات.',
      status: obsStatus,
      workOrderId: woNumber,
      createdAt: inspDate,
      timeline,
    };
  });

  return {
    id: `INSP-${7001 + ii}`,
    number: inspNumber,
    inspector,
    municipality: m.nameAr,
    municipalityId: m.id,
    date: inspDate,
    observations,
    gps: { lat: m.center[0], lng: m.center[1] },
    notes: 'جولة تفتيش ميدانية شاملة للمنطقة.',
  };
});

export const workflowObservations: Observation[] = workflowInspections.flatMap((i) => i.observations);

export const workflowWorkOrders: WorkOrder[] = workflowObservations
  .filter((o) => o.workOrderId)
  .map((o, i) => {
    const woStatus: WorkOrderStatus = o.status === 'open' ? 'created'
      : o.status === 'assigned' ? 'assigned'
      : o.status === 'inProgress' ? 'inProgress'
      : o.status === 'completed' ? 'completed'
      : o.status === 'verified' ? 'verified'
      : o.status === 'closed' ? 'closed' : 'created';

    const team = `فريق ${o.responsibleEntityLabel} ${1 + (i % 3)}`;
    const deadline = new Date(new Date(o.createdAt).getTime() + 7 * 86400000).toISOString();
    const completed = woStatus === 'completed' || woStatus === 'verified' || woStatus === 'closed';
    const verified = woStatus === 'verified' || woStatus === 'closed';
    const closed = woStatus === 'closed';

    return {
      id: `WO-${20001 + i}`,
      number: o.workOrderId!,
      createdAt: o.createdAt,
      responsibleOrganization: o.responsibleEntity,
      responsibleOrganizationLabel: o.responsibleEntityLabel,
      municipality: o.municipality,
      municipalityId: o.municipalityId,
      operationalZone: o.operationalZone,
      observationRef: o.number,
      observationId: o.id,
      deadline,
      priority: o.priority,
      status: woStatus,
      assignedTeam: team,
      estimatedDurationHours: 4 + (i % 8) * 2,
      workStartedAt: woStatus === 'created' || woStatus === 'assigned' ? null
        : new Date(new Date(o.createdAt).getTime() + 2 * 86400000).toISOString(),
      workCompletedAt: completed ? new Date(new Date(o.createdAt).getTime() + 5 * 86400000).toISOString() : null,
      completionDate: completed ? new Date(new Date(o.createdAt).getTime() + 5 * 86400000).toISOString() : null,
      afterPhotos: completed ? [pick(pexelsPhotos, i + 2), pick(pexelsPhotos, i + 3)] : [],
      executionNotes: completed ? 'تم تنفيذ الأعمال المطلوبة وتنظيف الموقع بالكامل.' : '',
      verificationDate: verified ? new Date(new Date(o.createdAt).getTime() + 6 * 86400000).toISOString() : null,
      verificationResult: verified ? 'accepted' : null,
      inspectorNotes: verified ? 'تم التحقق من جودة العمل ومطابقته للمواصفات.' : '',
      closedAt: closed ? new Date(new Date(o.createdAt).getTime() + 7 * 86400000).toISOString() : null,
      archived: closed,
      timeline: makeTimeline(o.status, o.createdAt, 'المفتش', team),
    };
  });

export { KHENCHELA_CENTER, contractors, cetCenters };
