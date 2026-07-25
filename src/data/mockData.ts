// Official Smart GIS Platform — Wilaya of Khenchela
// All data is realistic but fictional for demonstration purposes.

// Khenchela city center coordinates
export const KHENCHELA_CENTER: [number, number] = [35.4236, 7.1453];

// Wilaya boundary (approximate polygon around Khenchela wilaya)
export const WILAYA_BOUNDARY: [number, number][] = [
  [35.62, 6.92], [35.58, 7.02], [35.60, 7.15], [35.55, 7.28],
  [35.48, 7.35], [35.40, 7.38], [35.30, 7.35], [35.22, 7.30],
  [35.18, 7.18], [35.20, 7.05], [35.25, 6.95], [35.32, 6.88],
  [35.42, 6.85], [35.55, 6.88],
];

export interface Municipality {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  nameFr: string;
  population: number;
  areaKm2: number;
  households: number;
  containers: number;
  openSpots: number;
  resolvedSpots: number;
  fillRate: number;
  collectionRate: number;
  inspector: string;
  center: [number, number];
  polygon: [number, number][];
}

// 26 municipalities of Khenchela wilaya
export const municipalities: Municipality[] = [
  { id: 'M-01', code: '4001', name: 'Khenchela', nameAr: 'خنشلة', nameFr: 'Khenchela', population: 118000, areaKm2: 51.0, households: 28500, containers: 612, openSpots: 18, resolvedSpots: 52, fillRate: 82, collectionRate: 88, inspector: 'س. بن عمر', center: [35.4236, 7.1453], polygon: [[35.45,7.12],[35.46,7.18],[35.43,7.19],[35.40,7.16],[35.39,7.13]] },
  { id: 'M-02', code: '4002', name: 'Bouhmama', nameAr: 'بوحمامة', nameFr: 'Bouhmama', population: 21000, areaKm2: 82.0, households: 4800, containers: 98, openSpots: 4, resolvedSpots: 12, fillRate: 71, collectionRate: 79, inspector: 'م. خليفي', center: [35.38, 7.22], polygon: [[35.40,7.19],[35.41,7.25],[35.37,7.26],[35.36,7.21]] },
  { id: 'M-03', code: '4003', name: 'El Hamma', nameAr: 'الحمامة', nameFr: 'El Hamma', population: 18000, areaKm2: 67.5, households: 4100, containers: 84, openSpots: 3, resolvedSpots: 9, fillRate: 68, collectionRate: 75, inspector: 'ع. مرزوق', center: [35.39, 7.08], polygon: [[35.41,7.05],[35.42,7.11],[35.38,7.12],[35.37,7.07]] },
  { id: 'M-04', code: '4004', name: 'Baghai', nameAr: 'بقاية', nameFr: 'Baghai', population: 24000, areaKm2: 94.0, households: 5500, containers: 112, openSpots: 6, resolvedSpots: 15, fillRate: 74, collectionRate: 81, inspector: 'ف. بلقاسم', center: [35.36, 7.18], polygon: [[35.38,7.15],[35.39,7.21],[35.35,7.22],[35.34,7.16]] },
  { id: 'M-05', code: '4005', name: 'Kais', nameAr: 'قايس', nameFr: 'Kais', population: 32000, areaKm2: 110.0, households: 7400, containers: 156, openSpots: 8, resolvedSpots: 22, fillRate: 79, collectionRate: 85, inspector: 'ل. حمداني', center: [35.44, 7.22], polygon: [[35.46,7.19],[35.47,7.25],[35.43,7.26],[35.42,7.20]] },
  { id: 'M-06', code: '4006', name: 'Remila', nameAr: 'رميلة', nameFr: 'Remila', population: 16000, areaKm2: 58.0, households: 3700, containers: 72, openSpots: 2, resolvedSpots: 7, fillRate: 65, collectionRate: 72, inspector: 'ر. سعدي', center: [35.41, 7.06], polygon: [[35.43,7.03],[35.44,7.09],[35.40,7.10],[35.39,7.04]] },
  { id: 'M-07', code: '4007', name: 'Ain Touila', nameAr: 'عين التوية', nameFr: 'Aïn Touila', population: 14000, areaKm2: 72.0, households: 3200, containers: 64, openSpots: 3, resolvedSpots: 8, fillRate: 63, collectionRate: 70, inspector: 'ك. عثماني', center: [35.35, 7.10], polygon: [[35.37,7.07],[35.38,7.13],[35.34,7.14],[35.33,7.08]] },
  { id: 'M-08', code: '4008', name: 'Babar', nameAr: 'بابار', nameFr: 'Babar', population: 12000, areaKm2: 88.0, households: 2800, containers: 54, openSpots: 2, resolvedSpots: 6, fillRate: 60, collectionRate: 68, inspector: 'س. لعروسي', center: [35.30, 7.20], polygon: [[35.32,7.17],[35.33,7.23],[35.29,7.24],[35.28,7.18]] },
  { id: 'M-09', code: '4009', name: 'Tamza', nameAr: 'تامزة', nameFr: 'Tamza', population: 9000, areaKm2: 65.0, households: 2100, containers: 42, openSpots: 1, resolvedSpots: 4, fillRate: 58, collectionRate: 65, inspector: 'م. قاووس', center: [35.33, 7.25], polygon: [[35.35,7.22],[35.36,7.28],[35.32,7.29],[35.31,7.23]] },
  { id: 'M-10', code: '4010', name: 'El Oueldja', nameAr: 'الولجة', nameFr: 'El Oueldja', population: 11000, areaKm2: 54.0, households: 2500, containers: 48, openSpots: 2, resolvedSpots: 5, fillRate: 62, collectionRate: 69, inspector: 'ع. مرزوق', center: [35.38, 7.28], polygon: [[35.40,7.25],[35.41,7.31],[35.37,7.32],[35.36,7.26]] },
  { id: 'M-11', code: '4011', name: 'Bouzina', nameAr: 'بوزينة', nameFr: 'Bouzina', population: 8000, areaKm2: 47.0, households: 1800, containers: 36, openSpots: 1, resolvedSpots: 3, fillRate: 55, collectionRate: 63, inspector: 'ف. بلقاسم', center: [35.28, 7.15], polygon: [[35.30,7.12],[35.31,7.18],[35.27,7.19],[35.26,7.13]] },
  { id: 'M-12', code: '4012', name: 'Cherchar', nameAr: 'شرشار', nameFr: 'Cherchar', population: 13000, areaKm2: 76.0, households: 3000, containers: 58, openSpots: 3, resolvedSpots: 7, fillRate: 64, collectionRate: 71, inspector: 'ل. حمداني', center: [35.45, 7.08], polygon: [[35.47,7.05],[35.48,7.11],[35.44,7.12],[35.43,7.06]] },
  { id: 'M-13', code: '4013', name: 'Djellal', nameAr: 'جلال', nameFr: 'Djellal', population: 7000, areaKm2: 43.0, households: 1600, containers: 32, openSpots: 1, resolvedSpots: 3, fillRate: 57, collectionRate: 64, inspector: 'ر. سعدي', center: [35.26, 7.22], polygon: [[35.28,7.19],[35.29,7.25],[35.25,7.26],[35.24,7.20]] },
  { id: 'M-14', code: '4014', name: 'El Mahmal', nameAr: 'المحمل', nameFr: 'El Mahmal', population: 6000, areaKm2: 39.0, households: 1400, containers: 28, openSpots: 1, resolvedSpots: 2, fillRate: 54, collectionRate: 61, inspector: 'ك. عثماني', center: [35.48, 7.12], polygon: [[35.50,7.09],[35.51,7.15],[35.47,7.16],[35.46,7.10]] },
  { id: 'M-15', code: '4015', name: 'Msara', nameAr: 'المسارة', nameFr: 'Msara', population: 5000, areaKm2: 35.0, households: 1200, containers: 24, openSpots: 1, resolvedSpots: 2, fillRate: 52, collectionRate: 59, inspector: 'س. لعروسي', center: [35.50, 7.20], polygon: [[35.52,7.17],[35.53,7.23],[35.49,7.24],[35.48,7.18]] },
  { id: 'M-16', code: '4016', name: 'Yabous', nameAr: 'يابوس', nameFr: 'Yabous', population: 5500, areaKm2: 41.0, households: 1300, containers: 26, openSpots: 1, resolvedSpots: 2, fillRate: 53, collectionRate: 60, inspector: 'م. قاووس', center: [35.52, 7.05], polygon: [[35.54,7.02],[35.55,7.08],[35.51,7.09],[35.50,7.03]] },
  { id: 'M-17', code: '4017', name: 'Khirane', nameAr: 'خيران', nameFr: 'Khirane', population: 4500, areaKm2: 33.0, households: 1100, containers: 22, openSpots: 0, resolvedSpots: 1, fillRate: 50, collectionRate: 57, inspector: 'ع. مرزوق', center: [35.24, 7.08], polygon: [[35.26,7.05],[35.27,7.11],[35.23,7.12],[35.22,7.06]] },
  { id: 'M-18', code: '4018', name: 'Tazeghrout', nameAr: 'تازغروت', nameFr: 'Tazeghrout', population: 4000, areaKm2: 30.0, households: 950, containers: 20, openSpots: 0, resolvedSpots: 1, fillRate: 49, collectionRate: 56, inspector: 'ف. بلقاسم', center: [35.22, 7.18], polygon: [[35.24,7.15],[35.25,7.21],[35.21,7.22],[35.20,7.16]] },
  { id: 'M-19', code: '4019', name: 'Télisnes', nameAr: 'تليسنة', nameFr: 'Télisnes', population: 3500, areaKm2: 28.0, households: 850, containers: 18, openSpots: 0, resolvedSpots: 1, fillRate: 48, collectionRate: 55, inspector: 'ل. حمداني', center: [35.55, 7.25], polygon: [[35.57,7.22],[35.58,7.28],[35.54,7.29],[35.53,7.23]] },
  { id: 'M-20', code: '4020', name: 'Sidi Okba', nameAr: 'سيدي عقبة', nameFr: 'Sidi Okba', population: 15000, areaKm2: 80.0, households: 3500, containers: 68, openSpots: 2, resolvedSpots: 6, fillRate: 66, collectionRate: 73, inspector: 'ر. سعدي', center: [35.46, 7.28], polygon: [[35.48,7.25],[35.49,7.31],[35.45,7.32],[35.44,7.26]] },
  { id: 'M-21', code: '4021', name: 'Msara', nameAr: 'المسارة الشرقية', nameFr: "M'Sara", population: 3800, areaKm2: 26.0, households: 900, containers: 18, openSpots: 0, resolvedSpots: 1, fillRate: 47, collectionRate: 54, inspector: 'ك. عثماني', center: [35.58, 7.15], polygon: [[35.60,7.12],[35.61,7.18],[35.57,7.19],[35.56,7.13]] },
  { id: 'M-22', code: '4022', name: 'Ouled Rechache', nameAr: 'أولاد رشاش', nameFr: 'Ouled Rechache', population: 10000, areaKm2: 62.0, households: 2300, containers: 46, openSpots: 1, resolvedSpots: 4, fillRate: 59, collectionRate: 66, inspector: 'س. لعروسي', center: [35.31, 7.06], polygon: [[35.33,7.03],[35.34,7.09],[35.30,7.10],[35.29,7.04]] },
  { id: 'M-23', code: '4023', name: 'Lemcene', nameAr: 'لمسين', nameFr: 'Lemcene', population: 4200, areaKm2: 29.0, households: 1000, containers: 20, openSpots: 0, resolvedSpots: 1, fillRate: 51, collectionRate: 58, inspector: 'م. قاووس', center: [35.20, 7.25], polygon: [[35.22,7.22],[35.23,7.28],[35.19,7.29],[35.18,7.23]] },
  { id: 'M-24', code: '4024', name: 'El Belala', nameAr: 'البلالة', nameFr: 'El Belala', population: 3200, areaKm2: 25.0, households: 780, containers: 16, openSpots: 0, resolvedSpots: 1, fillRate: 46, collectionRate: 53, inspector: 'ع. مرزوق', center: [35.60, 7.05], polygon: [[35.62,7.02],[35.63,7.08],[35.59,7.09],[35.58,7.03]] },
  { id: 'M-25', code: '4025', name: 'Ensigha', nameAr: 'عنسيغة', nameFr: 'Ensigha', population: 2800, areaKm2: 22.0, households: 680, containers: 14, openSpots: 0, resolvedSpots: 0, fillRate: 45, collectionRate: 52, inspector: 'ف. بلقاسم', center: [35.18, 7.10], polygon: [[35.20,7.07],[35.21,7.13],[35.17,7.14],[35.16,7.08]] },
  { id: 'M-26', code: '4026', name: 'Kais Ouled Yahia', nameAr: 'قايس أولاد يحيى', nameFr: 'Kais Ouled Yahia', population: 5200, areaKm2: 38.0, households: 1250, containers: 24, openSpots: 1, resolvedSpots: 2, fillRate: 56, collectionRate: 63, inspector: 'ل. حمداني', center: [35.43, 7.30], polygon: [[35.45,7.27],[35.46,7.33],[35.42,7.34],[35.41,7.28]] },
];

// Backward-compat alias
export const districts = municipalities;
export const ALGIERS_CENTER = KHENCHELA_CENTER;

// Neighborhoods within municipalities
export interface Neighborhood {
  id: string;
  name: string;
  nameAr: string;
  municipalityId: string;
  municipality: string;
  population: number;
  containers: number;
  openSpots: number;
  fillRate: number;
  lat: number;
  lng: number;
}

const neighborhoodNames = [
  'الوسط', 'النصر', 'السلام', 'النور', 'الأمل', 'البركة', 'الوحدة', 'الفتح',
  'القدس', 'الورود', 'الزهور', 'الريان', 'النهضة', 'الإخاء', 'الفردوس',
  'البرج', 'الصباح', 'الغابة', 'الحدائق', 'النخيل', 'الأطلس', 'الشريف',
];

export const neighborhoods: Neighborhood[] = municipalities.flatMap((m, mi) =>
  Array.from({ length: 2 + (mi % 3) }, (_, ni) => {
    const n = neighborhoodNames[(mi * 3 + ni) % neighborhoodNames.length];
    const off = (ni + 1) * 0.008;
    return {
      id: `N-${m.id}-${ni + 1}`,
      name: n,
      nameAr: n,
      municipalityId: m.id,
      municipality: m.nameAr,
      population: Math.floor(m.population / (2 + (mi % 3)) * (0.8 + ni * 0.2)),
      containers: Math.floor(m.containers / (2 + (mi % 3)) * (0.8 + ni * 0.2)),
      openSpots: Math.max(0, Math.floor(m.openSpots / (2 + (mi % 3)) * (ni + 1))),
      fillRate: m.fillRate - ni * 3,
      lat: m.center[0] + (ni % 2 === 0 ? off : -off),
      lng: m.center[1] + (ni % 2 === 0 ? off : -off * 1.2),
    };
  }),
);

// Points of Interest (POIs)
export type POIType = 'school' | 'mosque' | 'hospital' | 'healthCenter' | 'admin' | 'market' | 'industrial' | 'park';
export interface POI {
  id: string;
  type: POIType;
  name: string;
  nameAr: string;
  municipalityId: string;
  municipality: string;
  lat: number;
  lng: number;
}

const poiTypeData: Record<POIType, { names: string[]; icon: string }> = {
  school: { names: ['مدرسة ابتدائية', 'متوسطة', 'ثانوية'], icon: 'school' },
  mosque: { names: ['مسجد النور', 'مسجد السلام', 'مسجد الفرقان', 'مسجد التقوى'], icon: 'mosque' },
  hospital: { names: ['مستشفى خنشلة', 'مستشفى قايس'], icon: 'hospital' },
  healthCenter: { names: ['مركز صحي', 'عيادة متعددة الخدمات', 'مركز الأمومة'], icon: 'health' },
  admin: { names: ['دائرة خنشلة', 'بلدية خنشلة', 'مديرية البيئة', 'محكمة'], icon: 'admin' },
  market: { names: ['سوق البلدية', 'سوق الجملة', 'السوق الأسبوعي'], icon: 'market' },
  industrial: { names: ['المنطقة الصناعية', 'المنطقة الصناعية قايس'], icon: 'industrial' },
  park: { names: ['الحديقة العمومية', 'منتزه الترفيه', 'الغابة البلدية'], icon: 'park' },
};

export const pois: POI[] = municipalities.flatMap((m, mi) => {
  const types = Object.keys(poiTypeData) as POIType[];
  return types.flatMap((type, ti) =>
    Array.from({ length: type === 'mosque' ? 3 : type === 'school' ? 2 : 1 }, (_, pi) => {
      const names = poiTypeData[type].names;
      const name = names[(mi + ti + pi) % names.length];
      const off = (pi + 1) * 0.005 * (ti + 1);
      return {
        id: `POI-${m.id}-${type}-${pi}`,
        type,
        name,
        nameAr: name,
        municipalityId: m.id,
        municipality: m.nameAr,
        lat: m.center[0] + (pi % 2 === 0 ? off : -off),
        lng: m.center[1] + (pi % 2 === 0 ? off * 1.1 : -off * 1.1),
      };
    }),
  );
});

// Black spots
export type BlackSpotStatus = 'open' | 'inProgress' | 'resolved' | 'closed';
export type BlackSpotPriority = 'critical' | 'high' | 'medium' | 'low';

export interface BlackSpot {
  id: string;
  code: string;
  title: string;
  titleAr: string;
  municipality: string;
  municipalityId: string;
  neighborhood: string;
  street: string;
  address: string;
  lat: number;
  lng: number;
  status: BlackSpotStatus;
  priority: BlackSpotPriority;
  category: string;
  riskLevel: 'high' | 'medium' | 'low';
  reportedAt: string;
  resolvedAt: string | null;
  resolutionDeadline: string;
  responsible: string;
  inspectionDate: string;
  photo: string;
  beforePhoto: string;
  afterPhoto: string | null;
  inspections: number;
  description: string;
}

const spotCategories = ['تراكم النفايات', 'حاوية مكسورة', 'تفريغ غير قانوني', 'انسداد مجاري', 'حطام بناء', 'رمي عشوائي'];
const priorities: BlackSpotPriority[] = ['critical', 'high', 'medium', 'low'];
const statuses: BlackSpotStatus[] = ['open', 'inProgress', 'resolved', 'closed'];
const riskLevels: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];

export const blackSpots: BlackSpot[] = Array.from({ length: 64 }, (_, i) => {
  const m = municipalities[i % municipalities.length];
  const n = neighborhoods[i % neighborhoods.length];
  const status = statuses[i % statuses.length];
  const priority = priorities[i % priorities.length];
  const lat = m.center[0] + (Math.random() - 0.5) * 0.025;
  const lng = m.center[1] + (Math.random() - 0.5) * 0.025;
  const reported = new Date(2026, 6, 1 + (i % 20));
  const resolved = status === 'resolved' || status === 'closed'
    ? new Date(2026, 6, 5 + (i % 15)).toISOString()
    : null;
  return {
    id: `BS-${String(1001 + i)}`,
    code: `BS-${String(1001 + i)}`,
    title: spotCategories[i % spotCategories.length],
    titleAr: spotCategories[i % spotCategories.length],
    municipality: m.nameAr,
    municipalityId: m.id,
    neighborhood: n.nameAr,
    street: `شارع ${i + 1}`,
    address: `شارع ${i + 1}، ${n.nameAr}، ${m.nameAr}`,
    lat, lng,
    status,
    priority,
    category: spotCategories[i % spotCategories.length],
    riskLevel: riskLevels[i % 3],
    reportedAt: reported.toISOString(),
    resolvedAt: resolved,
    resolutionDeadline: new Date(2026, 6, 25 + (i % 10)).toISOString(),
    responsible: m.inspector,
    inspectionDate: reported.toISOString(),
    photo: `https://images.pexels.com/photos/${4601395 + (i % 8)}/pexels-photo-${4601395 + (i % 8)}.jpeg?auto=compress&cs=tinysrgb&w=600`,
    beforePhoto: `https://images.pexels.com/photos/${4601395 + (i % 8)}/pexels-photo-${4601395 + (i % 8)}.jpeg?auto=compress&cs=tinysrgb&w=600`,
    afterPhoto: status === 'resolved' || status === 'closed'
      ? `https://images.pexels.com/photos/${2770 + (i % 5)}/pexels-photo-${2770 + (i % 5)}.jpeg?auto=compress&cs=tinysrgb&w=600`
      : null,
    inspections: 1 + (i % 5),
    description: 'تم رصد تراكم للنفايات في الموقع يتطلب تدخلاً عاجلاً من المصالح المختصة لتنظيف المنطقة ووضع حاويات إضافية.',
  };
});

// Illegal dumping sites
export interface IllegalDump {
  id: string;
  code: string;
  municipality: string;
  municipalityId: string;
  location: string;
  volume: number;
  type: 'construction' | 'household' | 'industrial' | 'mixed';
  status: 'reported' | 'scheduled' | 'cleared';
  reportedAt: string;
  lat: number;
  lng: number;
  photo: string;
}

export const illegalDumps: IllegalDump[] = Array.from({ length: 28 }, (_, i) => {
  const m = municipalities[i % municipalities.length];
  const types: IllegalDump['type'][] = ['construction', 'household', 'industrial', 'mixed'];
  const st: IllegalDump['status'][] = ['reported', 'scheduled', 'cleared'];
  return {
    id: `ID-${5001 + i}`,
    code: `ID-${5001 + i}`,
    municipality: m.nameAr,
    municipalityId: m.id,
    location: `منطقة ${i + 1}، ${m.nameAr}`,
    volume: 2 + (i % 15),
    type: types[i % 4],
    status: st[i % 3],
    reportedAt: new Date(2026, 6, 1 + (i % 20)).toISOString(),
    lat: m.center[0] + (Math.random() - 0.5) * 0.02,
    lng: m.center[1] + (Math.random() - 0.5) * 0.02,
    photo: `https://images.pexels.com/photos/${2770 + (i % 5)}/pexels-photo-${2770 + (i % 5)}.jpeg?auto=compress&cs=tinysrgb&w=400`,
  };
});

// Commercial violations
export interface CommercialViolation {
  id: string;
  shop: string;
  municipality: string;
  type: 'noContract' | 'overflowing' | 'illegalDumping' | 'noContainer';
  fine: number;
  status: 'pending' | 'paid' | 'contested';
  date: string;
  inspector: string;
}

export const commercialViolations: CommercialViolation[] = Array.from({ length: 32 }, (_, i) => {
  const m = municipalities[i % municipalities.length];
  const types: CommercialViolation['type'][] = ['noContract', 'overflowing', 'illegalDumping', 'noContainer'];
  const st: CommercialViolation['status'][] = ['pending', 'paid', 'contested'];
  return {
    id: `CV-${6001 + i}`,
    shop: `محل تجاري ${i + 1} - ${m.nameAr}`,
    municipality: m.nameAr,
    type: types[i % 4],
    fine: 5000 + (i % 10) * 2000,
    status: st[i % 3],
    date: new Date(2026, 6, 1 + (i % 22)).toISOString(),
    inspector: m.inspector,
  };
});

// Waste containers
export interface Container {
  id: string;
  code: string;
  municipality: string;
  municipalityId: string;
  type: 'standard' | 'underground' | 'recycling' | 'organic';
  capacity: number;
  fillLevel: number;
  status: 'ok' | 'full' | 'damaged' | 'maintenance';
  lat: number;
  lng: number;
  lastEmptied: string;
}

export const containers: Container[] = Array.from({ length: 160 }, (_, i) => {
  const m = municipalities[i % municipalities.length];
  const types: Container['type'][] = ['standard', 'underground', 'recycling', 'organic'];
  const fill = Math.floor(Math.random() * 100);
  let status: Container['status'] = 'ok';
  if (fill > 90) status = 'full';
  else if (i % 17 === 0) status = 'damaged';
  else if (i % 23 === 0) status = 'maintenance';
  return {
    id: `C-${2001 + i}`,
    code: `CTN-${2001 + i}`,
    municipality: m.nameAr,
    municipalityId: m.id,
    type: types[i % types.length],
    capacity: [240, 660, 1100, 3300][i % 4],
    fillLevel: fill,
    status,
    lat: m.center[0] + (Math.random() - 0.5) * 0.03,
    lng: m.center[1] + (Math.random() - 0.5) * 0.03,
    lastEmptied: new Date(2026, 6, 20 - (i % 18)).toISOString(),
  };
});

// Commercial shops
export interface Shop {
  id: string;
  name: string;
  municipality: string;
  category: string;
  contractStatus: 'active' | 'expired' | 'pending';
  feePaid: boolean;
  containers: number;
  inspections: number;
  lastInspection: string;
  lat: number;
  lng: number;
}

export const shops: Shop[] = Array.from({ length: 80 }, (_, i) => {
  const m = municipalities[i % municipalities.length];
  const cats = ['مطعم', 'مقهى', 'سوبر ماركت', 'ملحمة', 'خباز', 'صيدلية', 'ملابس'];
  const st: Shop['contractStatus'][] = ['active', 'expired', 'pending'];
  return {
    id: `S-${3001 + i}`,
    name: `محل ${i + 1} - ${m.nameAr}`,
    municipality: m.nameAr,
    category: cats[i % cats.length],
    contractStatus: st[i % 3],
    feePaid: i % 4 !== 0,
    containers: 1 + (i % 4),
    inspections: i % 6,
    lastInspection: new Date(2026, 6, 1 + (i % 25)).toISOString(),
    lat: m.center[0] + (Math.random() - 0.5) * 0.02,
    lng: m.center[1] + (Math.random() - 0.5) * 0.02,
  };
});

// Vehicles
export interface Vehicle {
  id: string;
  plate: string;
  type: 'truck' | 'compactor' | 'sweeper' | 'van';
  capacity: number;
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  driver: string;
  municipality: string;
  fuel: number;
  mileage: number;
  lastService: string;
  lat: number;
  lng: number;
}

export const vehicles: Vehicle[] = Array.from({ length: 32 }, (_, i) => {
  const m = municipalities[i % municipalities.length];
  const types: Vehicle['type'][] = ['truck', 'compactor', 'sweeper', 'van'];
  const st: Vehicle['status'][] = ['active', 'idle', 'maintenance', 'offline'];
  return {
    id: `V-${4001 + i}`,
    plate: `${40}-${(1000 + i).toString().padStart(4, '0')}-${23}`,
    type: types[i % 4],
    capacity: [6, 12, 8, 3][i % 4],
    status: st[i % 4],
    driver: `السائق ${i + 1}`,
    municipality: m.nameAr,
    fuel: Math.floor(Math.random() * 100),
    mileage: 45000 + i * 1234,
    lastService: new Date(2026, 5, 1 + (i % 28)).toISOString(),
    lat: m.center[0] + (Math.random() - 0.5) * 0.02,
    lng: m.center[1] + (Math.random() - 0.5) * 0.02,
  };
});

// Drivers
export interface Driver {
  id: string;
  name: string;
  phone: string;
  license: string;
  vehicle: string;
  status: 'on-duty' | 'off-duty' | 'leave';
  rating: number;
  tours: number;
  hoursThisWeek: number;
}

export const drivers: Driver[] = Array.from({ length: 32 }, (_, i) => ({
  id: `DR-${5001 + i}`,
  name: `السائق ${i + 1}`,
  phone: `0550 ${100000 + i * 7}`,
  license: `B-${2018 + (i % 6)}-${i}`,
  vehicle: vehicles[i].plate,
  status: (['on-duty', 'off-duty', 'leave'] as Driver['status'][])[i % 3],
  rating: 3.5 + (i % 5) * 0.3,
  tours: 120 + i * 8,
  hoursThisWeek: 20 + (i % 30),
}));

// Cleaning routes
export interface Route {
  id: string;
  code: string;
  name: string;
  municipality: string;
  vehicle: string;
  driver: string;
  stops: number;
  distanceKm: number;
  durationMin: number;
  status: 'planned' | 'active' | 'completed' | 'delayed';
  progress: number;
}

export const routes: Route[] = Array.from({ length: 24 }, (_, i) => {
  const m = municipalities[i % municipalities.length];
  const st: Route['status'][] = ['planned', 'active', 'completed', 'delayed'];
  return {
    id: `R-${6001 + i}`,
    code: `RT-${6001 + i}`,
    name: `مسار ${m.nameAr} ${i + 1}`,
    municipality: m.nameAr,
    vehicle: vehicles[i % vehicles.length].plate,
    driver: drivers[i % drivers.length].name,
    stops: 12 + (i % 20),
    distanceKm: 8 + (i % 15),
    durationMin: 90 + (i % 60),
    status: st[i % 4],
    progress: [0, 45, 100, 30][i % 4],
  };
});

// Inspections
export interface Inspection {
  id: string;
  code: string;
  spot: string;
  municipality: string;
  inspector: string;
  date: string;
  status: 'completed' | 'pending' | 'scheduled' | 'flagged';
  score: number;
  photos: number;
  notes: string;
}

export const inspections: Inspection[] = Array.from({ length: 48 }, (_, i) => {
  const m = municipalities[i % municipalities.length];
  const st: Inspection['status'][] = ['completed', 'pending', 'scheduled', 'flagged'];
  return {
    id: `IN-${7001 + i}`,
    code: `INS-${7001 + i}`,
    spot: blackSpots[i % blackSpots.length].code,
    municipality: m.nameAr,
    inspector: m.inspector,
    date: new Date(2026, 6, 1 + (i % 21)).toISOString(),
    status: st[i % 4],
    score: 50 + (i * 7) % 50,
    photos: i % 6,
    notes: 'تم رصد الموقع وتوثيق الحالة بالصور.',
  };
});

// CET centers
export interface CetCenter {
  id: string;
  name: string;
  city: string;
  capacityTpd: number;
  currentLoadTpd: number;
  status: 'operational' | 'near-capacity' | 'maintenance';
  lat: number;
  lng: number;
  manager: string;
}

export const cetCenters: CetCenter[] = [
  { id: 'CET-1', name: 'مركز الطرح التقني خنشلة', city: 'خنشلة', capacityTpd: 800, currentLoadTpd: 620, status: 'operational', lat: 35.38, lng: 7.08, manager: 'ك. عثماني' },
  { id: 'CET-2', name: 'مركز الطرح قايس', city: 'قايس', capacityTpd: 500, currentLoadTpd: 470, status: 'near-capacity', lat: 35.44, lng: 7.22, manager: 'س. لعروسي' },
  { id: 'CET-3', name: 'مركز الطرح بقاية', city: 'بقاية', capacityTpd: 350, currentLoadTpd: 180, status: 'operational', lat: 35.36, lng: 7.18, manager: 'م. قاووس' },
];

// Contractors
export interface Contractor {
  id: string;
  name: string;
  zone: string;
  contractValue: number;
  status: 'active' | 'suspended' | 'expired';
  rating: number;
  vehicles: number;
  employees: number;
  startDate: string;
  endDate: string;
}

export const contractors: Contractor[] = [
  { id: 'PC-1', name: 'مؤسسة النظافة الذهبية', zone: 'شمال خنشلة', contractValue: 45000000, status: 'active', rating: 4.2, vehicles: 12, employees: 48, startDate: '2026-01-01', endDate: '2026-12-31' },
  { id: 'PC-2', name: 'شركة البيئة الخضراء', zone: 'جنوب خنشلة', contractValue: 32000000, status: 'active', rating: 3.8, vehicles: 8, employees: 31, startDate: '2026-02-01', endDate: '2027-01-31' },
  { id: 'PC-3', name: 'مقاولة الأمل للنظافة', zone: 'شرق خنشلة', contractValue: 28000000, status: 'suspended', rating: 2.9, vehicles: 6, employees: 22, startDate: '2025-09-01', endDate: '2026-08-31' },
  { id: 'PC-4', name: 'مجموعة النقاء', zone: 'غرب خنشلة', contractValue: 38000000, status: 'active', rating: 4.5, vehicles: 10, employees: 40, startDate: '2026-03-01', endDate: '2027-02-28' },
];

// Public complaints
export interface Complaint {
  id: string;
  code: string;
  citizen: string;
  municipality: string;
  category: string;
  description: string;
  status: 'new' | 'reviewing' | 'assigned' | 'resolved';
  priority: BlackSpotPriority;
  date: string;
  lat: number;
  lng: number;
}

export const complaints: Complaint[] = Array.from({ length: 36 }, (_, i) => {
  const m = municipalities[i % municipalities.length];
  const st: Complaint['status'][] = ['new', 'reviewing', 'assigned', 'resolved'];
  const pr: BlackSpotPriority[] = ['critical', 'high', 'medium', 'low'];
  const cats = ['تراكم نفايات', 'حاوية مكسورة', 'روائح كريهة', 'تفريغ عشوائي', 'عدم جمع النفايات'];
  return {
    id: `CM-${8001 + i}`,
    code: `CM-${8001 + i}`,
    citizen: `المواطن ${i + 1}`,
    municipality: m.nameAr,
    category: cats[i % cats.length],
    description: 'تم الإبلاغ عن مشكلة في منطقة السكن تتطلب تدخلاً من البلدية.',
    status: st[i % 4],
    priority: pr[i % 4],
    date: new Date(2026, 6, 1 + (i % 22)).toISOString(),
    lat: m.center[0] + (Math.random() - 0.5) * 0.02,
    lng: m.center[1] + (Math.random() - 0.5) * 0.02,
  };
});

// Tasks
export interface Task {
  id: string;
  title: string;
  assignee: string;
  municipality: string;
  priority: BlackSpotPriority;
  status: 'pending' | 'assigned' | 'inProgress' | 'completed';
  dueDate: string;
  type: string;
}

export const tasks: Task[] = Array.from({ length: 36 }, (_, i) => {
  const m = municipalities[i % municipalities.length];
  const st: Task['status'][] = ['pending', 'assigned', 'inProgress', 'completed'];
  const pr: BlackSpotPriority[] = ['critical', 'high', 'medium', 'low'];
  const types = ['تنظيف', 'إصلاح حاوية', 'تفريغ', 'تفتيش', 'متابعة'];
  return {
    id: `T-${9001 + i}`,
    title: `${types[i % types.length]} - ${m.nameAr}`,
    assignee: m.inspector,
    municipality: m.nameAr,
    priority: pr[i % 4],
    status: st[i % 4],
    dueDate: new Date(2026, 6, 22 + (i % 10)).toISOString(),
    type: types[i % types.length],
  };
});

// Work orders
export interface WorkOrder {
  id: string;
  code: string;
  title: string;
  asset: string;
  municipality: string;
  status: 'open' | 'assigned' | 'inProgress' | 'completed' | 'cancelled';
  priority: BlackSpotPriority;
  assignee: string;
  createdAt: string;
  estimatedCost: number;
}

export const workOrders: WorkOrder[] = Array.from({ length: 28 }, (_, i) => {
  const m = municipalities[i % municipalities.length];
  const st: WorkOrder['status'][] = ['open', 'assigned', 'inProgress', 'completed', 'cancelled'];
  const pr: BlackSpotPriority[] = ['critical', 'high', 'medium', 'low'];
  return {
    id: `WO-${9001 + i}`,
    code: `WO-${9001 + i}`,
    title: `إصلاح ${['ضاغط', 'مكنسة', 'حاوية', 'مضخة'][i % 4]}`,
    asset: vehicles[i % vehicles.length].plate,
    municipality: m.nameAr,
    status: st[i % 5],
    priority: pr[i % 4],
    assignee: `ورشة الصيانة ${1 + (i % 3)}`,
    createdAt: new Date(2026, 6, 1 + (i % 20)).toISOString(),
    estimatedCost: 15000 + (i * 3500) % 180000,
  };
});

// Alerts
export interface Alert {
  id: string;
  level: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const alerts: Alert[] = [
  { id: 'A1', level: 'critical', title: 'حاوية ممتلئة تجاوزت 95%', message: 'خنشلة - حي النصر: حاوية CTN-2043 تحتاج تفريغ فوري.', time: 'قبل 12 دقيقة', read: false },
  { id: 'A2', level: 'critical', title: 'نقطة سوداء حرجة جديدة', message: 'قايس: تراكم نفايات خطير تم رصده BS-1024.', time: 'قبل 35 دقيقة', read: false },
  { id: 'A3', level: 'warning', title: 'مركبة متوقفة عن العمل', message: 'ضاغط 40-1023-23 في صيانة طارئة منذ ساعتين.', time: 'قبل ساعة', read: false },
  { id: 'A4', level: 'warning', title: 'مركز CET يقترب من الطاقة القصوى', message: 'مركز الطرح قايس على 94% من طاقته الاستيعابية.', time: 'قبل ساعتين', read: false },
  { id: 'A5', level: 'info', title: 'تم إنجاز جولة تفتيش', message: 'المفتش س. بن عمر أنهى جولة في خنشلة المركز.', time: 'قبل 3 ساعات', read: true },
  { id: 'A6', level: 'info', title: 'تقرير شهري جاهز', message: 'تقرير جويلية 2026 متاح للمراجعة والتصدير.', time: 'قبل 5 ساعات', read: true },
];

// Chart data
export const blackSpotTrend = [
  { month: 'فيفري', open: 42, resolved: 28 },
  { month: 'مارس', open: 38, resolved: 35 },
  { month: 'أفريل', open: 45, resolved: 40 },
  { month: 'ماي', open: 51, resolved: 44 },
  { month: 'جوان', open: 48, resolved: 52 },
  { month: 'جويلية', open: 39, resolved: 58 },
];

export const fillRateByMunicipality = municipalities.slice(0, 10).map((m) => ({ name: m.nameAr, rate: m.fillRate }));
export const fillRateByDistrict = fillRateByMunicipality;

export const inspectionsByDay = Array.from({ length: 14 }, (_, i) => ({
  day: `${i + 8} جويلية`,
  count: 3 + ((i * 3) % 12),
}));

export const wasteCollected = [
  { month: 'فيفري', tons: 3200 },
  { month: 'مارس', tons: 3350 },
  { month: 'أفريل', tons: 3100 },
  { month: 'ماي', tons: 3600 },
  { month: 'جوان', tons: 3450 },
  { month: 'جويلية', tons: 3780 },
];

export const containerTypeDist = [
  { name: 'قياسية', value: 812, color: '#0F4C81' },
  { name: 'تحت أرضية', value: 188, color: '#16A34A' },
  { name: 'إعادة تدوير', value: 142, color: '#14B8A6' },
  { name: 'عضوية', value: 69, color: '#F59E0B' },
];

export const responseTimeTrend = [
  { week: 'س1', hours: 48 }, { week: 'س2', hours: 42 }, { week: 'س3', hours: 38 },
  { week: 'س4', hours: 35 }, { week: 'س5', hours: 31 }, { week: 'س6', hours: 28 },
];

export const performanceIndicators = [
  { name: 'كفاءة الجمع', value: 87, target: 90 },
  { name: 'رضا المواطنين', value: 72, target: 80 },
  { name: 'التغطية', value: 94, target: 95 },
  { name: 'الانتظام', value: 81, target: 85 },
  { name: 'سرعة الاستجابة', value: 76, target: 80 },
];

export const municipalityRanking = municipalities
  .map((m) => ({
    name: m.nameAr,
    score: Math.round(m.collectionRate * 0.4 + m.fillRate * 0.3 + (m.resolvedSpots / (m.openSpots + m.resolvedSpots + 1)) * 100 * 0.3),
    population: m.population,
    containers: m.containers,
  }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 10);

export const calendarInspections: Record<string, number> = {};
for (let day = 1; day <= 31; day++) {
  calendarInspections[`2026-07-${String(day).padStart(2, '0')}`] = Math.floor(Math.random() * 6) + 1;
}
