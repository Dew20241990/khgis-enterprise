// EPWG-CET — Public Wilaya Establishment for the Management of Technical Landfill Centers
// Wilaya of Khenchela
// Realistic but fictional mock data for demonstration purposes.

export const EPWG_CENTER: [number, number] = [35.4236, 7.1453];

export type FacilityType = 'cet' | 'controlled' | 'forest' | 'special';
export type FacilityStatus = 'operational' | 'near-capacity' | 'maintenance' | 'planned' | 'decommissioned';
export type EnvStatus = 'excellent' | 'good' | 'average' | 'poor' | 'critical';

export interface EpwgFacility {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  nameFr: string;
  type: FacilityType;
  typeAr: string;
  municipality: string;
  municipalityAr: string;
  district: string;
  districtAr: string;
  location: string;
  locationAr: string;
  lat: number;
  lng: number;
  serviceArea: string[];
  serviceAreaAr: string[];
  status: FacilityStatus;
  envStatus: EnvStatus;
  manager: string;
  managerAr: string;
  capacityTpd: number;
  currentLoadTpd: number;
  capacityTotalTons: number;
  usedCapacityTons: number;
  dailyWaste: number;
  monthlyWaste: number;
  annualWaste: number;
  hasSorting: boolean;
  hasRecycling: boolean;
  hasComposting: boolean;
  equipmentCount: number;
  vehicleCount: number;
  envNotes: string;
  envNotesAr: string;
  openedYear: number;
}

export const epwgFacilities: EpwgFacility[] = [
  {
    id: 'EPWG-001', code: 'CET-BEG', name: 'CET Beggai', nameAr: 'مركز الردم التقني بقاية', nameFr: 'CET Beggai',
    type: 'cet', typeAr: 'مركز الردم التقني',
    municipality: 'Beggai', municipalityAr: 'بقاية', district: 'Khenchela', districtAr: 'خنشلة',
    location: 'Beggai', locationAr: 'بقاية',
    lat: 35.36, lng: 7.18,
    serviceArea: ['Khenchela', 'El Hamma', 'Ensigha', 'Beggai'],
    serviceAreaAr: ['خنشلة', 'الحمامة', 'عنسيغة', 'بقاية'],
    status: 'operational', envStatus: 'good',
    manager: 'K. Othmani', managerAr: 'ك. عثماني',
    capacityTpd: 600, currentLoadTpd: 420,
    capacityTotalTons: 540000, usedCapacityTons: 312000,
    dailyWaste: 420, monthlyWaste: 12600, annualWaste: 153300,
    hasSorting: true, hasRecycling: true, hasComposting: false,
    equipmentCount: 8, vehicleCount: 6,
    envNotes: 'Groundwater monitoring active. Leachate collection system operational.',
    envNotesAr: 'مراقبة المياه الجوفية مفعّلة. نظام جمع الرشاحة تشغيلي.',
    openedYear: 2019,
  },
  {
    id: 'EPWG-002', code: 'CET-TAZ', name: 'CET Taouzient', nameAr: 'مركز الردم التقني تاوزيانت', nameFr: 'CET Taouzient',
    type: 'cet', typeAr: 'مركز الردم التقني',
    municipality: 'Taouzient', municipalityAr: 'تاوزيانت', district: 'Kais', districtAr: 'قايس',
    location: 'Draa Baassis', locationAr: 'دراع باسيس',
    lat: 35.44, lng: 7.22,
    serviceArea: ['Kais', 'Taouzient', 'Remila'],
    serviceAreaAr: ['قايس', 'تاوزيانت', 'رميلة'],
    status: 'operational', envStatus: 'average',
    manager: 'S. Laroussi', managerAr: 'س. لعروسي',
    capacityTpd: 450, currentLoadTpd: 380,
    capacityTotalTons: 405000, usedCapacityTons: 286000,
    dailyWaste: 380, monthlyWaste: 11400, annualWaste: 138700,
    hasSorting: true, hasRecycling: false, hasComposting: true,
    equipmentCount: 6, vehicleCount: 5,
    envNotes: 'Gas extraction system installed. Leachate levels within limits.',
    envNotesAr: 'نظام استخراج الغاز مركّب. مستويات الرشاحة ضمن الحدود.',
    openedYear: 2020,
  },
  {
    id: 'EPWG-003', code: 'CL-OLR', name: 'Oulad Rechache', nameAr: 'مردم مراقب أولاد رشاش', nameFr: 'Ouled Rechache',
    type: 'controlled', typeAr: 'مردم مراقب',
    municipality: 'Ouled Rechache', municipalityAr: 'أولاد رشاش', district: 'Ouled Rechache', districtAr: 'أولاد رشاش',
    location: 'Ouled Rechache', locationAr: 'أولاد رشاش',
    lat: 35.31, lng: 7.06,
    serviceArea: ['Ouled Rechache', 'Ain Touila'],
    serviceAreaAr: ['أولاد رشاش', 'عين التوية'],
    status: 'operational', envStatus: 'good',
    manager: 'M. Kaous', managerAr: 'م. قاووس',
    capacityTpd: 180, currentLoadTpd: 120,
    capacityTotalTons: 162000, usedCapacityTons: 78000,
    dailyWaste: 120, monthlyWaste: 3600, annualWaste: 43800,
    hasSorting: false, hasRecycling: false, hasComposting: false,
    equipmentCount: 3, vehicleCount: 2,
    envNotes: 'Basin liner intact. Periodic groundwater sampling.',
    envNotesAr: 'بطانة الحوض سليمة. أخذ عينات دوري من المياه الجوفية.',
    openedYear: 2021,
  },
  {
    id: 'EPWG-004', code: 'CL-CHC', name: 'Chechar', nameAr: 'مردم مراقب شرشار', nameFr: 'Chechar',
    type: 'controlled', typeAr: 'مردم مراقب',
    municipality: 'Chechar', municipalityAr: 'شرشار', district: 'Chechar', districtAr: 'شرشار',
    location: 'Chechar District', locationAr: 'دائرة شرشار',
    lat: 35.45, lng: 7.08,
    serviceArea: ['Chechar District'],
    serviceAreaAr: ['دائرة شرشار'],
    status: 'operational', envStatus: 'good',
    manager: 'L. Hamdani', managerAr: 'ل. حمداني',
    capacityTpd: 140, currentLoadTpd: 95,
    capacityTotalTons: 126000, usedCapacityTons: 54000,
    dailyWaste: 95, monthlyWaste: 2850, annualWaste: 34675,
    hasSorting: false, hasRecycling: false, hasComposting: false,
    equipmentCount: 2, vehicleCount: 2,
    envNotes: 'Cover material available on-site. No leachate breakthrough detected.',
    envNotesAr: 'مادة التغطية متوفرة بالموقع. لا تسرب للرشاحة.',
    openedYear: 2022,
  },
  {
    id: 'EPWG-005', code: 'CL-BAB', name: 'Babar', nameAr: 'مردم مراقب بابار', nameFr: 'Babar',
    type: 'controlled', typeAr: 'مردم مراقب',
    municipality: 'Babar', municipalityAr: 'بابار', district: 'Babar', districtAr: 'بابار',
    location: 'Babar', locationAr: 'بابار',
    lat: 35.30, lng: 7.20,
    serviceArea: ['Babar', 'Steppe Areas'],
    serviceAreaAr: ['بابار', 'المناطق السهبية'],
    status: 'operational', envStatus: 'average',
    manager: 'S. Laroussi', managerAr: 'س. لعروسي',
    capacityTpd: 110, currentLoadTpd: 70,
    capacityTotalTons: 99000, usedCapacityTons: 38000,
    dailyWaste: 70, monthlyWaste: 2100, annualWaste: 25550,
    hasSorting: false, hasRecycling: false, hasComposting: false,
    equipmentCount: 2, vehicleCount: 1,
    envNotes: 'Steppe environment — wind-blown litter control in place.',
    envNotesAr: 'بيئة سهبية — مكافحة تطاير النفايات مفعّلة.',
    openedYear: 2022,
  },
  {
    id: 'EPWG-006', code: 'CL-MAH', name: 'El Mahmel', nameAr: 'مردم مراقب المحمل', nameFr: 'El Mahmel',
    type: 'controlled', typeAr: 'مردم مراقب',
    municipality: 'El Mahmel', municipalityAr: 'المحمل', district: 'El Mahmel', districtAr: 'المحمل',
    location: 'El Mahmel', locationAr: 'المحمل',
    lat: 35.48, lng: 7.12,
    serviceArea: ['El Mahmel'],
    serviceAreaAr: ['المحمل'],
    status: 'operational', envStatus: 'good',
    manager: 'K. Othmani', managerAr: 'ك. عثماني',
    capacityTpd: 90, currentLoadTpd: 55,
    capacityTotalTons: 81000, usedCapacityTons: 28000,
    dailyWaste: 55, monthlyWaste: 1650, annualWaste: 20075,
    hasSorting: false, hasRecycling: false, hasComposting: false,
    equipmentCount: 2, vehicleCount: 1,
    envNotes: 'Small-scale facility. Routine cover applied daily.',
    envNotesAr: 'منشأة صغيرة الحجم. تغطية يومية منتظمة.',
    openedYear: 2023,
  },
  {
    id: 'EPWG-007', code: 'CL-BHM', name: 'Bouhmama', nameAr: 'مردم مراقب بوحمامة', nameFr: 'Bouhmama',
    type: 'forest', typeAr: 'مردم مراقب ومراقبة غابية',
    municipality: 'Bouhmama', municipalityAr: 'بوحمامة', district: 'Bouhmama', districtAr: 'بوحمامة',
    location: 'Bouhmama Forest Zone', locationAr: 'منطقة غابة بوحمامة',
    lat: 35.38, lng: 7.22,
    serviceArea: ['Bouhmama'],
    serviceAreaAr: ['بوحمامة'],
    status: 'operational', envStatus: 'good',
    manager: 'M. Khelifi', managerAr: 'م. خليفي',
    capacityTpd: 60, currentLoadTpd: 35,
    capacityTotalTons: 54000, usedCapacityTons: 18000,
    dailyWaste: 35, monthlyWaste: 1050, annualWaste: 12775,
    hasSorting: false, hasRecycling: false, hasComposting: false,
    equipmentCount: 1, vehicleCount: 1,
    envNotes: 'Forest fire risk monitoring active. Coordination with forest service.',
    envNotesAr: 'مراقبة مخاطر حرائق الغابة مفعّلة. تنسيق مع مصالح الغابات.',
    openedYear: 2023,
  },
  {
    id: 'EPWG-008', code: 'CL-YAB', name: 'Yabous', nameAr: 'مردم مراقب يابوس', nameFr: 'Yabous',
    type: 'forest', typeAr: 'مردم مراقب ومراقبة غابية',
    municipality: 'Yabous', municipalityAr: 'يابوس', district: 'Yabous', districtAr: 'يابوس',
    location: 'Yabous Forest Zone', locationAr: 'منطقة غابة يابوس',
    lat: 35.52, lng: 7.05,
    serviceArea: ['Yabous'],
    serviceAreaAr: ['يابوس'],
    status: 'operational', envStatus: 'good',
    manager: 'M. Kaous', managerAr: 'م. قاووس',
    capacityTpd: 50, currentLoadTpd: 28,
    capacityTotalTons: 45000, usedCapacityTons: 14000,
    dailyWaste: 28, monthlyWaste: 840, annualWaste: 10220,
    hasSorting: false, hasRecycling: false, hasComposting: false,
    equipmentCount: 1, vehicleCount: 1,
    envNotes: 'Forest zone — fire watch tower coordination. Low fire risk currently.',
    envNotesAr: 'منطقة غابية — تنسيق مع برج المراقبة. خطر حرائق منخفض حالياً.',
    openedYear: 2024,
  },
  {
    id: 'EPWG-009', code: 'CL-CHL', name: 'Chelia', nameAr: 'مردم مراقب الشليعة', nameFr: 'Chelia',
    type: 'forest', typeAr: 'مردم مراقب ومراقبة غابية',
    municipality: 'Chelia', municipalityAr: 'الشليعة', district: 'Chelia', districtAr: 'الشليعة',
    location: 'Chelia Forest Zone', locationAr: 'منطقة غابة الشليعة',
    lat: 35.55, lng: 7.25,
    serviceArea: ['Chelia'],
    serviceAreaAr: ['الشليعة'],
    status: 'operational', envStatus: 'good',
    manager: 'L. Hamdani', managerAr: 'ل. حمداني',
    capacityTpd: 45, currentLoadTpd: 22,
    capacityTotalTons: 40500, usedCapacityTons: 11000,
    dailyWaste: 22, monthlyWaste: 660, annualWaste: 8030,
    hasSorting: false, hasRecycling: false, hasComposting: false,
    equipmentCount: 1, vehicleCount: 1,
    envNotes: 'High-altitude forest zone. Seasonal fire risk monitoring.',
    envNotesAr: 'منطقة غابية مرتفعة. مراقبة موسمية لمخاطر الحرائق.',
    openedYear: 2024,
  },
  {
    id: 'EPWG-010', code: 'SC-KML', name: 'Kimel', nameAr: 'منطقة كيميل للتنسيق العابر للحدود', nameFr: 'Kimel',
    type: 'special', typeAr: 'منطقة تنسيق عابر للحدود',
    municipality: 'Kimel', municipalityAr: 'كيميل', district: 'Khenchela', districtAr: 'خنشلة',
    location: 'Kimel Border Area', locationAr: 'منطقة كيميل الحدودية',
    lat: 35.24, lng: 7.08,
    serviceArea: ['Khirane', 'Tazeghrout'],
    serviceAreaAr: ['خيران', 'تازغروت'],
    status: 'operational', envStatus: 'good',
    manager: 'A. Marzouki', managerAr: 'ع. مرزوق',
    capacityTpd: 70, currentLoadTpd: 40,
    capacityTotalTons: 63000, usedCapacityTons: 21000,
    dailyWaste: 40, monthlyWaste: 1200, annualWaste: 14600,
    hasSorting: true, hasRecycling: false, hasComposting: false,
    equipmentCount: 2, vehicleCount: 2,
    envNotes: 'Cross-border coordination with neighboring wilaya facilities.',
    envNotesAr: 'تنسيق عابر للحدود مع منشآت الولايات المجاورة.',
    openedYear: 2023,
  },
];

// Service areas (polygons approximated around facility clusters)
export interface ServiceArea {
  id: string;
  facilityId: string;
  name: string;
  nameAr: string;
  municipalities: string[];
  municipalitiesAr: string[];
  polygon: [number, number][];
  population: number;
  dailyTonnage: number;
}

export const epwgServiceAreas: ServiceArea[] = [
  {
    id: 'SA-001', facilityId: 'EPWG-001', name: 'Greater Khenchela', nameAr: 'خنشلة الكبرى',
    municipalities: ['Khenchela', 'El Hamma', 'Ensigha', 'Beggai'],
    municipalitiesAr: ['خنشلة', 'الحمامة', 'عنسيغة', 'بقاية'],
    polygon: [[35.42, 7.10], [35.40, 7.22], [35.34, 7.20], [35.33, 7.12], [35.38, 7.06]],
    population: 171800, dailyTonnage: 420,
  },
  {
    id: 'SA-002', facilityId: 'EPWG-002', name: 'Kais-Taouzient', nameAr: 'قايس-تاوزيانت',
    municipalities: ['Kais', 'Taouzient', 'Remila'],
    municipalitiesAr: ['قايس', 'تاوزيانت', 'رميلة'],
    polygon: [[35.48, 7.18], [35.47, 7.28], [35.40, 7.26], [35.39, 7.16]],
    population: 62000, dailyTonnage: 380,
  },
  {
    id: 'SA-003', facilityId: 'EPWG-003', name: 'Ouled Rechache-Ain Touila', nameAr: 'أولاد رشاش-عين التوية',
    municipalities: ['Ouled Rechache', 'Ain Touila'],
    municipalitiesAr: ['أولاد رشاش', 'عين التوية'],
    polygon: [[35.34, 7.02], [35.35, 7.12], [35.29, 7.13], [35.28, 7.04]],
    population: 24000, dailyTonnage: 120,
  },
  {
    id: 'SA-004', facilityId: 'EPWG-004', name: 'Chechar District', nameAr: 'دائرة شرشار',
    municipalities: ['Chechar'],
    municipalitiesAr: ['شرشار'],
    polygon: [[35.47, 7.04], [35.48, 7.12], [35.43, 7.13], [35.42, 7.05]],
    population: 13000, dailyTonnage: 95,
  },
  {
    id: 'SA-005', facilityId: 'EPWG-005', name: 'Babar-Steppe', nameAr: 'بابار-السهب',
    municipalities: ['Babar', 'Steppe Areas'],
    municipalitiesAr: ['بابار', 'المناطق السهبية'],
    polygon: [[35.32, 7.16], [35.33, 7.24], [35.28, 7.25], [35.27, 7.17]],
    population: 12000, dailyTonnage: 70,
  },
];

// Collection routes linking municipalities to facilities
export interface CollectionRoute {
  id: string;
  code: string;
  facilityId: string;
  fromMunicipality: string;
  fromMunicipalityAr: string;
  distanceKm: number;
  dailyTrips: number;
  dailyTonnage: number;
  status: 'active' | 'delayed' | 'suspended';
  path: [number, number][];
}

export const epwgCollectionRoutes: CollectionRoute[] = [
  { id: 'CR-001', code: 'R-KH-01', facilityId: 'EPWG-001', fromMunicipality: 'Khenchela', fromMunicipalityAr: 'خنشلة', distanceKm: 8, dailyTrips: 14, dailyTonnage: 180, status: 'active', path: [[35.4236, 7.1453], [35.40, 7.16], [35.36, 7.18]] },
  { id: 'CR-002', code: 'R-HM-01', facilityId: 'EPWG-001', fromMunicipality: 'El Hamma', fromMunicipalityAr: 'الحمامة', distanceKm: 12, dailyTrips: 8, dailyTonnage: 90, status: 'active', path: [[35.39, 7.08], [35.38, 7.12], [35.36, 7.18]] },
  { id: 'CR-003', code: 'R-EN-01', facilityId: 'EPWG-001', fromMunicipality: 'Ensigha', fromMunicipalityAr: 'عنسيغة', distanceKm: 18, dailyTrips: 5, dailyTonnage: 60, status: 'active', path: [[35.18, 7.10], [35.28, 7.14], [35.36, 7.18]] },
  { id: 'CR-004', code: 'R-BG-01', facilityId: 'EPWG-001', fromMunicipality: 'Beggai', fromMunicipalityAr: 'بقاية', distanceKm: 4, dailyTrips: 6, dailyTonnage: 90, status: 'active', path: [[35.36, 7.18]] },
  { id: 'CR-005', code: 'R-KS-01', facilityId: 'EPWG-002', fromMunicipality: 'Kais', fromMunicipalityAr: 'قايس', distanceKm: 10, dailyTrips: 10, dailyTonnage: 150, status: 'active', path: [[35.44, 7.22], [35.44, 7.22]] },
  { id: 'CR-006', code: 'R-TZ-01', facilityId: 'EPWG-002', fromMunicipality: 'Taouzient', fromMunicipalityAr: 'تاوزيانت', distanceKm: 6, dailyTrips: 8, dailyTonnage: 120, status: 'active', path: [[35.42, 7.24], [35.44, 7.22]] },
  { id: 'CR-007', code: 'R-RM-01', facilityId: 'EPWG-002', fromMunicipality: 'Remila', fromMunicipalityAr: 'رميلة', distanceKm: 14, dailyTrips: 6, dailyTonnage: 110, status: 'delayed', path: [[35.41, 7.06], [35.43, 7.14], [35.44, 7.22]] },
  { id: 'CR-008', code: 'R-OLR-01', facilityId: 'EPWG-003', fromMunicipality: 'Ouled Rechache', fromMunicipalityAr: 'أولاد رشاش', distanceKm: 3, dailyTrips: 5, dailyTonnage: 70, status: 'active', path: [[35.31, 7.06]] },
  { id: 'CR-009', code: 'R-AT-01', facilityId: 'EPWG-003', fromMunicipality: 'Ain Touila', fromMunicipalityAr: 'عين التوية', distanceKm: 11, dailyTrips: 4, dailyTonnage: 50, status: 'active', path: [[35.35, 7.10], [35.33, 7.08], [35.31, 7.06]] },
  { id: 'CR-010', code: 'R-CHC-01', facilityId: 'EPWG-004', fromMunicipality: 'Chechar', fromMunicipalityAr: 'شرشار', distanceKm: 5, dailyTrips: 4, dailyTonnage: 95, status: 'active', path: [[35.45, 7.08]] },
  { id: 'CR-011', code: 'R-BAB-01', facilityId: 'EPWG-005', fromMunicipality: 'Babar', fromMunicipalityAr: 'بابار', distanceKm: 4, dailyTrips: 3, dailyTonnage: 70, status: 'active', path: [[35.30, 7.20]] },
  { id: 'CR-012', code: 'R-MAH-01', facilityId: 'EPWG-006', fromMunicipality: 'El Mahmel', fromMunicipalityAr: 'المحمل', distanceKm: 3, dailyTrips: 2, dailyTonnage: 55, status: 'active', path: [[35.48, 7.12]] },
  { id: 'CR-013', code: 'R-BHM-01', facilityId: 'EPWG-007', fromMunicipality: 'Bouhmama', fromMunicipalityAr: 'بوحمامة', distanceKm: 3, dailyTrips: 2, dailyTonnage: 35, status: 'active', path: [[35.38, 7.22]] },
  { id: 'CR-014', code: 'R-YAB-01', facilityId: 'EPWG-008', fromMunicipality: 'Yabous', fromMunicipalityAr: 'يابوس', distanceKm: 3, dailyTrips: 2, dailyTonnage: 28, status: 'active', path: [[35.52, 7.05]] },
  { id: 'CR-015', code: 'R-CHL-01', facilityId: 'EPWG-009', fromMunicipality: 'Chelia', fromMunicipalityAr: 'الشليعة', distanceKm: 4, dailyTrips: 1, dailyTonnage: 22, status: 'active', path: [[35.55, 7.25]] },
  { id: 'CR-016', code: 'R-KML-01', facilityId: 'EPWG-010', fromMunicipality: 'Kimel', fromMunicipalityAr: 'كيميل', distanceKm: 5, dailyTrips: 3, dailyTonnage: 40, status: 'active', path: [[35.24, 7.08]] },
];

// Equipment at facilities
export type EquipmentType = 'compactor' | 'weighbridge' | 'loader' | 'fence' | 'leachate-plant' | 'gas-extraction' | 'monitoring-station';
export type EquipmentStatus = 'operational' | 'maintenance' | 'broken' | 'planned';

export interface EpwgEquipment {
  id: string;
  facilityId: string;
  name: string;
  nameAr: string;
  type: EquipmentType;
  typeAr: string;
  status: EquipmentStatus;
  lastService: string;
  nextService: string;
  notes: string;
}

export const epwgEquipment: EpwgEquipment[] = [
  { id: 'EQ-001', facilityId: 'EPWG-001', name: 'Compactor A-1', nameAr: 'ضاغط A-1', type: 'compactor', typeAr: 'ضاغط', status: 'operational', lastService: '2026-06-15', nextService: '2026-09-15', notes: 'Daily operation 06:00-18:00' },
  { id: 'EQ-002', facilityId: 'EPWG-001', name: 'Weighbridge Main', nameAr: 'ميزان رئيسي', type: 'weighbridge', typeAr: 'ميزان', status: 'operational', lastService: '2026-07-01', nextService: '2026-10-01', notes: 'Calibrated' },
  { id: 'EQ-003', facilityId: 'EPWG-001', name: 'Front Loader L-2', nameAr: 'محمل أمامي L-2', type: 'loader', typeAr: 'محمل', status: 'maintenance', lastService: '2026-07-10', nextService: '2026-07-28', notes: 'Hydraulic repair' },
  { id: 'EQ-004', facilityId: 'EPWG-001', name: 'Leachate Plant', nameAr: 'وحدة معالجة الرشاحة', type: 'leachate-plant', typeAr: 'وحدة الرشاحة', status: 'operational', lastService: '2026-06-20', nextService: '2026-09-20', notes: 'pH within range' },
  { id: 'EQ-005', facilityId: 'EPWG-001', name: 'GW Monitoring Station', nameAr: 'محطة مراقبة المياه الجوفية', type: 'monitoring-station', typeAr: 'محطة مراقبة', status: 'operational', lastService: '2026-07-05', nextService: '2026-10-05', notes: '4 piezometers active' },
  { id: 'EQ-006', facilityId: 'EPWG-001', name: 'Perimeter Fence', nameAr: 'سياج محيط', type: 'fence', typeAr: 'سياج', status: 'operational', lastService: '2026-05-01', nextService: '2026-11-01', notes: '2km perimeter' },
  { id: 'EQ-007', facilityId: 'EPWG-001', name: 'Sorting Line S-1', nameAr: 'خط الفرز S-1', type: 'compactor', typeAr: 'خط فرز', status: 'operational', lastService: '2026-06-28', nextService: '2026-09-28', notes: '12 t/h capacity' },
  { id: 'EQ-008', facilityId: 'EPWG-001', name: 'Recycling Unit R-1', nameAr: 'وحدة إعادة التدوير R-1', type: 'compactor', typeAr: 'وحدة تدوير', status: 'operational', lastService: '2026-07-02', nextService: '2026-10-02', notes: 'Plastic + metal' },
  { id: 'EQ-009', facilityId: 'EPWG-002', name: 'Compactor B-1', nameAr: 'ضاغط B-1', type: 'compactor', typeAr: 'ضاغط', status: 'operational', lastService: '2026-06-10', nextService: '2026-09-10', notes: 'Daily operation' },
  { id: 'EQ-010', facilityId: 'EPWG-002', name: 'Weighbridge North', nameAr: 'ميزان شمالي', type: 'weighbridge', typeAr: 'ميزان', status: 'operational', lastService: '2026-07-03', nextService: '2026-10-03', notes: 'Calibrated' },
  { id: 'EQ-011', facilityId: 'EPWG-002', name: 'Gas Extraction System', nameAr: 'نظام استخراج الغاز', type: 'gas-extraction', typeAr: 'نظام غاز', status: 'operational', lastService: '2026-06-25', nextService: '2026-09-25', notes: '12 wells active' },
  { id: 'EQ-012', facilityId: 'EPWG-002', name: 'Composting Unit C-1', nameAr: 'وحدة التسميد C-1', type: 'compactor', typeAr: 'وحدة تسميد', status: 'maintenance', lastService: '2026-07-08', nextService: '2026-07-30', notes: 'Aeration system repair' },
  { id: 'EQ-013', facilityId: 'EPWG-002', name: 'Front Loader L-3', nameAr: 'محمل أمامي L-3', type: 'loader', typeAr: 'محمل', status: 'operational', lastService: '2026-06-18', nextService: '2026-09-18', notes: 'Daily operation' },
  { id: 'EQ-014', facilityId: 'EPWG-002', name: 'Sorting Line S-2', nameAr: 'خط الفرز S-2', type: 'compactor', typeAr: 'خط فرز', status: 'operational', lastService: '2026-07-01', nextService: '2026-10-01', notes: '8 t/h capacity' },
  { id: 'EQ-015', facilityId: 'EPWG-003', name: 'Compactor C-1', nameAr: 'ضاغط C-1', type: 'compactor', typeAr: 'ضاغط', status: 'operational', lastService: '2026-06-05', nextService: '2026-09-05', notes: 'Daily operation' },
  { id: 'EQ-016', facilityId: 'EPWG-003', name: 'Weighbridge South', nameAr: 'ميزان جنوبي', type: 'weighbridge', typeAr: 'ميزان', status: 'broken', lastService: '2026-05-20', nextService: '2026-07-25', notes: 'Load cell replacement pending' },
  { id: 'EQ-017', facilityId: 'EPWG-003', name: 'Perimeter Fence', nameAr: 'سياج محيط', type: 'fence', typeAr: 'سياج', status: 'operational', lastService: '2026-04-15', nextService: '2026-10-15', notes: '1.2km perimeter' },
  { id: 'EQ-018', facilityId: 'EPWG-004', name: 'Compactor D-1', nameAr: 'ضاغط D-1', type: 'compactor', typeAr: 'ضاغط', status: 'operational', lastService: '2026-06-12', nextService: '2026-09-12', notes: 'Daily operation' },
  { id: 'EQ-019', facilityId: 'EPWG-004', name: 'Loader L-4', nameAr: 'محمل L-4', type: 'loader', typeAr: 'محمل', status: 'operational', lastService: '2026-06-22', nextService: '2026-09-22', notes: 'Daily operation' },
  { id: 'EQ-020', facilityId: 'EPWG-005', name: 'Compactor E-1', nameAr: 'ضاغط E-1', type: 'compactor', typeAr: 'ضاغط', status: 'maintenance', lastService: '2026-07-12', nextService: '2026-08-01', notes: 'Engine overhaul' },
  { id: 'EQ-021', facilityId: 'EPWG-005', name: 'Perimeter Fence', nameAr: 'سياج محيط', type: 'fence', typeAr: 'سياج', status: 'operational', lastService: '2026-04-10', nextService: '2026-10-10', notes: '0.8km perimeter' },
  { id: 'EQ-022', facilityId: 'EPWG-006', name: 'Compactor F-1', nameAr: 'ضاغط F-1', type: 'compactor', typeAr: 'ضاغط', status: 'operational', lastService: '2026-06-08', nextService: '2026-09-08', notes: 'Daily operation' },
  { id: 'EQ-023', facilityId: 'EPWG-006', name: 'Loader L-5', nameAr: 'محمل L-5', type: 'loader', typeAr: 'محمل', status: 'operational', lastService: '2026-06-28', nextService: '2026-09-28', notes: 'Daily operation' },
  { id: 'EQ-024', facilityId: 'EPWG-007', name: 'Compactor G-1', nameAr: 'ضاغط G-1', type: 'compactor', typeAr: 'ضاغط', status: 'operational', lastService: '2026-06-15', nextService: '2026-09-15', notes: 'Shared with forest patrol' },
  { id: 'EQ-025', facilityId: 'EPWG-008', name: 'Compactor H-1', nameAr: 'ضاغط H-1', type: 'compactor', typeAr: 'ضاغط', status: 'operational', lastService: '2026-06-20', nextService: '2026-09-20', notes: 'Daily operation' },
  { id: 'EQ-026', facilityId: 'EPWG-009', name: 'Compactor I-1', nameAr: 'ضاغط I-1', type: 'compactor', typeAr: 'ضاغط', status: 'operational', lastService: '2026-06-18', nextService: '2026-09-18', notes: 'Seasonal operation' },
  { id: 'EQ-027', facilityId: 'EPWG-010', name: 'Compactor J-1', nameAr: 'ضاغط J-1', type: 'compactor', typeAr: 'ضاغط', status: 'operational', lastService: '2026-06-22', nextService: '2026-09-22', notes: 'Daily operation' },
  { id: 'EQ-028', facilityId: 'EPWG-010', name: 'Sorting Line S-3', nameAr: 'خط الفرز S-3', type: 'compactor', typeAr: 'خط فرز', status: 'operational', lastService: '2026-07-05', nextService: '2026-10-05', notes: 'Cross-border waste sorting' },
];

// Vehicles assigned to EPWG
export type VehicleType = 'roll-off' | 'tipper' | 'hook-loader' | 'sweeper' | 'wheel-loader' | 'water-tanker';
export type VehicleStatus = 'active' | 'maintenance' | 'idle' | 'broken';

export interface EpwgVehicle {
  id: string;
  plate: string;
  type: VehicleType;
  typeAr: string;
  facilityId: string;
  capacityTons: number;
  status: VehicleStatus;
  driver: string;
  driverAr: string;
  odometer: number;
  lastMaintenance: string;
}

export const epwgVehicles: EpwgVehicle[] = [
  { id: 'EV-001', plate: '40-1023-23', type: 'roll-off', typeAr: 'شاحنة قلابة', facilityId: 'EPWG-001', capacityTons: 18, status: 'active', driver: 'B. Ahmed', driverAr: 'ب. أحمد', odometer: 142000, lastMaintenance: '2026-06-20' },
  { id: 'EV-002', plate: '40-1024-24', type: 'tipper', typeAr: 'مقطورة', facilityId: 'EPWG-001', capacityTons: 12, status: 'active', driver: 'K. Said', driverAr: 'ك. سعيد', odometer: 98000, lastMaintenance: '2026-07-01' },
  { id: 'EV-003', plate: '40-1025-25', type: 'hook-loader', typeAr: 'شاحنة بحامل خطاف', facilityId: 'EPWG-001', capacityTons: 16, status: 'maintenance', driver: 'M. Ali', driverAr: 'م. علي', odometer: 156000, lastMaintenance: '2026-07-15' },
  { id: 'EV-004', plate: '40-1026-26', type: 'wheel-loader', typeAr: 'محمل عجلات', facilityId: 'EPWG-001', capacityTons: 0, status: 'active', driver: 'S. Omar', driverAr: 'س. عمر', odometer: 88000, lastMaintenance: '2026-06-10' },
  { id: 'EV-005', plate: '40-1027-27', type: 'water-tanker', typeAr: 'صهريج ماء', facilityId: 'EPWG-001', capacityTons: 8, status: 'active', driver: 'L. Karim', driverAr: 'ل. كريم', odometer: 67000, lastMaintenance: '2026-06-25' },
  { id: 'EV-006', plate: '40-1028-28', type: 'sweeper', typeAr: 'مكنسة', facilityId: 'EPWG-001', capacityTons: 5, status: 'idle', driver: '—', driverAr: '—', odometer: 45000, lastMaintenance: '2026-07-05' },
  { id: 'EV-007', plate: '40-2001-31', type: 'roll-off', typeAr: 'شاحنة قلابة', facilityId: 'EPWG-002', capacityTons: 18, status: 'active', driver: 'R. Nabil', driverAr: 'ر. نبيل', odometer: 134000, lastMaintenance: '2026-06-18' },
  { id: 'EV-008', plate: '40-2002-32', type: 'tipper', typeAr: 'مقطورة', facilityId: 'EPWG-002', capacityTons: 12, status: 'active', driver: 'F. Hakim', driverAr: 'ف. حكيم', odometer: 102000, lastMaintenance: '2026-07-02' },
  { id: 'EV-009', plate: '40-2003-33', type: 'wheel-loader', typeAr: 'محمل عجلات', facilityId: 'EPWG-002', capacityTons: 0, status: 'active', driver: 'A. Toufiq', driverAr: 'ع. توفيق', odometer: 78000, lastMaintenance: '2026-06-15' },
  { id: 'EV-010', plate: '40-2004-34', type: 'hook-loader', typeAr: 'شاحنة بحامل خطاف', facilityId: 'EPWG-002', capacityTons: 16, status: 'maintenance', driver: '—', driverAr: '—', odometer: 161000, lastMaintenance: '2026-07-18' },
  { id: 'EV-011', plate: '40-2005-35', type: 'water-tanker', typeAr: 'صهريج ماء', facilityId: 'EPWG-002', capacityTons: 8, status: 'active', driver: 'H. Sami', driverAr: 'ه. سامي', odometer: 54000, lastMaintenance: '2026-06-28' },
  { id: 'EV-012', plate: '40-3001-41', type: 'tipper', typeAr: 'مقطورة', facilityId: 'EPWG-003', capacityTons: 10, status: 'active', driver: 'D. Walid', driverAr: 'د. وليد', odometer: 72000, lastMaintenance: '2026-06-22' },
  { id: 'EV-013', plate: '40-3002-42', type: 'roll-off', typeAr: 'شاحنة قلابة', facilityId: 'EPWG-003', capacityTons: 14, status: 'active', driver: 'N. Riad', driverAr: 'ن. رياض', odometer: 89000, lastMaintenance: '2026-07-08' },
  { id: 'EV-014', plate: '40-4001-51', type: 'tipper', typeAr: 'مقطورة', facilityId: 'EPWG-004', capacityTons: 10, status: 'active', driver: 'Z. Bashir', driverAr: 'ز. بشير', odometer: 65000, lastMaintenance: '2026-06-12' },
  { id: 'EV-015', plate: '40-4002-52', type: 'wheel-loader', typeAr: 'محمل عجلات', facilityId: 'EPWG-004', capacityTons: 0, status: 'active', driver: 'T. Issam', driverAr: 'ت. عصام', odometer: 42000, lastMaintenance: '2026-06-20' },
  { id: 'EV-016', plate: '40-5001-61', type: 'tipper', typeAr: 'مقطورة', facilityId: 'EPWG-005', capacityTons: 8, status: 'active', driver: 'Q. Monir', driverAr: 'ق. منير', odometer: 58000, lastMaintenance: '2026-06-08' },
  { id: 'EV-017', plate: '40-6001-71', type: 'tipper', typeAr: 'مقطورة', facilityId: 'EPWG-006', capacityTons: 8, status: 'active', driver: 'V. Adel', driverAr: 'ف. عادل', odometer: 38000, lastMaintenance: '2026-06-28' },
  { id: 'EV-018', plate: '40-7001-81', type: 'tipper', typeAr: 'مقطورة', facilityId: 'EPWG-007', capacityTons: 6, status: 'active', driver: 'X. Farouk', driverAr: 'ف. فاروق', odometer: 31000, lastMaintenance: '2026-06-15' },
  { id: 'EV-019', plate: '40-8001-91', type: 'tipper', typeAr: 'مقطورة', facilityId: 'EPWG-008', capacityTons: 6, status: 'active', driver: 'Y. Nour', driverAr: 'ن. نور', odometer: 24000, lastMaintenance: '2026-06-20' },
  { id: 'EV-020', plate: '40-9001-01', type: 'tipper', typeAr: 'مقطورة', facilityId: 'EPWG-009', capacityTons: 6, status: 'idle', driver: '—', driverAr: '—', odometer: 18000, lastMaintenance: '2026-06-18' },
  { id: 'EV-021', plate: '40-9002-02', type: 'roll-off', typeAr: 'شاحنة قلابة', facilityId: 'EPWG-010', capacityTons: 14, status: 'active', driver: 'W. Jamal', driverAr: 'ج. جمال', odometer: 47000, lastMaintenance: '2026-07-05' },
  { id: 'EV-022', plate: '40-9003-03', type: 'tipper', typeAr: 'مقطورة', facilityId: 'EPWG-010', capacityTons: 10, status: 'active', driver: 'U. Bilal', driverAr: 'ب. بلال', odometer: 39000, lastMaintenance: '2026-06-30' },
];

// Environmental monitoring records
export interface EnvMonitoring {
  id: string;
  facilityId: string;
  type: 'groundwater' | 'leachate' | 'gas' | 'fire-risk' | 'compliance';
  typeAr: string;
  value: string;
  valueNum: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  date: string;
  notes: string;
  notesAr: string;
}

export const epwgEnvMonitoring: EnvMonitoring[] = [
  { id: 'EM-001', facilityId: 'EPWG-001', type: 'groundwater', typeAr: 'المياه الجوفية', value: '6.8', valueNum: 6.8, unit: 'pH', status: 'normal', date: '2026-07-20', notes: 'Downgradient piezometer PZ-1', notesAr: 'بئر مراقبة منخفض PZ-1' },
  { id: 'EM-002', facilityId: 'EPWG-001', type: 'leachate', typeAr: 'الرشاحة', value: '120', valueNum: 120, unit: 'm³/day', status: 'normal', date: '2026-07-20', notes: 'Collection rate 95%', notesAr: 'نسبة الجمع 95%' },
  { id: 'EM-003', facilityId: 'EPWG-001', type: 'gas', typeAr: 'الغاز', value: '42', valueNum: 42, unit: '% CH4', status: 'normal', date: '2026-07-18', notes: 'Extraction well W-3', notesAr: 'بئر استخراج W-3' },
  { id: 'EM-004', facilityId: 'EPWG-001', type: 'fire-risk', typeAr: 'خطر الحرائق', value: 'Low', valueNum: 2, unit: 'level', status: 'normal', date: '2026-07-22', notes: 'Daily thermal scan', notesAr: 'مسح حراري يومي' },
  { id: 'EM-005', facilityId: 'EPWG-001', type: 'compliance', typeAr: 'الامتثال', value: 'Compliant', valueNum: 1, unit: '', status: 'normal', date: '2026-07-15', notes: 'Quarterly audit passed', notesAr: 'تدقيق ربعي ناجح' },
  { id: 'EM-006', facilityId: 'EPWG-002', type: 'groundwater', typeAr: 'المياه الجوفية', value: '7.1', valueNum: 7.1, unit: 'pH', status: 'normal', date: '2026-07-19', notes: 'PZ-2 baseline comparison', notesAr: 'مقارنة بـ PZ-2' },
  { id: 'EM-007', facilityId: 'EPWG-002', type: 'leachate', typeAr: 'الرشاحة', value: '95', valueNum: 95, unit: 'm³/day', status: 'normal', date: '2026-07-19', notes: 'Collection rate 88%', notesAr: 'نسبة الجمع 88%' },
  { id: 'EM-008', facilityId: 'EPWG-002', type: 'gas', typeAr: 'الغاز', value: '55', valueNum: 55, unit: '% CH4', status: 'normal', date: '2026-07-17', notes: '12 extraction wells', notesAr: '12 بئر استخراج' },
  { id: 'EM-009', facilityId: 'EPWG-002', type: 'fire-risk', typeAr: 'خطر الحرائق', value: 'Medium', valueNum: 3, unit: 'level', status: 'warning', date: '2026-07-22', notes: 'Hot spot detected sector 3', notesAr: 'نقطة ساخنة في القطاع 3' },
  { id: 'EM-010', facilityId: 'EPWG-002', type: 'compliance', typeAr: 'الامتثال', value: 'Minor issues', valueNum: 2, unit: '', status: 'warning', date: '2026-07-10', notes: 'Cover material shortage', notesAr: 'نقص مادة التغطية' },
  { id: 'EM-011', facilityId: 'EPWG-003', type: 'groundwater', typeAr: 'المياه الجوفية', value: '7.0', valueNum: 7.0, unit: 'pH', status: 'normal', date: '2026-07-18', notes: 'Single piezometer', notesAr: 'بئر واحد' },
  { id: 'EM-012', facilityId: 'EPWG-003', type: 'leachate', typeAr: 'الرشاحة', value: '35', valueNum: 35, unit: 'm³/day', status: 'normal', date: '2026-07-18', notes: 'Tank storage', notesAr: 'تخزين في خزان' },
  { id: 'EM-013', facilityId: 'EPWG-003', type: 'fire-risk', typeAr: 'خطر الحرائق', value: 'Low', valueNum: 2, unit: 'level', status: 'normal', date: '2026-07-22', notes: 'Wind-blown litter minimal', notesAr: 'تطاير النفايات ضئيل' },
  { id: 'EM-014', facilityId: 'EPWG-004', type: 'fire-risk', typeAr: 'خطر الحرائق', value: 'Low', valueNum: 2, unit: 'level', status: 'normal', date: '2026-07-22', notes: 'Daily cover applied', notesAr: 'تغطية يومية مطبقة' },
  { id: 'EM-015', facilityId: 'EPWG-005', type: 'fire-risk', typeAr: 'خطر الحرائق', value: 'High', valueNum: 4, unit: 'level', status: 'critical', date: '2026-07-22', notes: 'Steppe dry conditions — alert issued', notesAr: 'ظروف جفاف سهبية — تنبيه صادر' },
  { id: 'EM-016', facilityId: 'EPWG-005', type: 'compliance', typeAr: 'الامتثال', value: 'Non-compliant', valueNum: 3, unit: '', status: 'critical', date: '2026-07-12', notes: 'Fence breach reported', notesAr: 'ثقب في السياج مبلغ عنه' },
  { id: 'EM-017', facilityId: 'EPWG-007', type: 'fire-risk', typeAr: 'خطر الحرائق', value: 'Medium', valueNum: 3, unit: 'level', status: 'warning', date: '2026-07-22', notes: 'Forest proximity — watch active', notesAr: 'قرب غابي — مراقبة مفعّلة' },
  { id: 'EM-018', facilityId: 'EPWG-008', type: 'fire-risk', typeAr: 'خطر الحرائق', value: 'Low', valueNum: 2, unit: 'level', status: 'normal', date: '2026-07-22', notes: 'Forest watch tower coordinated', notesAr: 'تنسيق برج المراقبة' },
  { id: 'EM-019', facilityId: 'EPWG-009', type: 'fire-risk', typeAr: 'خطر الحرائق', value: 'Low', valueNum: 2, unit: 'level', status: 'normal', date: '2026-07-22', notes: 'High altitude — low risk', notesAr: 'ارتفاع عالٍ — خطر منخفض' },
  { id: 'EM-020', facilityId: 'EPWG-010', type: 'compliance', typeAr: 'الامتثال', value: 'Compliant', valueNum: 1, unit: '', status: 'normal', date: '2026-07-14', notes: 'Cross-border protocol active', notesAr: 'بروتوكول عابر للحدود مفعّل' },
];

// Environmental inspections
export interface EnvInspection {
  id: string;
  facilityId: string;
  date: string;
  inspector: string;
  inspectorAr: string;
  result: 'pass' | 'conditional' | 'fail';
  findings: string;
  findingsAr: string;
}

export const epwgInspections: EnvInspection[] = [
  { id: 'EI-001', facilityId: 'EPWG-001', date: '2026-07-15', inspector: 'D. Bureau', inspectorAr: 'م. الديوان', result: 'pass', findings: 'All systems operational', findingsAr: 'كل الأنظمة تشغيلية' },
  { id: 'EI-002', facilityId: 'EPWG-001', date: '2026-04-10', inspector: 'D. Bureau', inspectorAr: 'م. الديوان', result: 'pass', findings: 'Routine quarterly check', findingsAr: 'فحص ربعي دوري' },
  { id: 'EI-003', facilityId: 'EPWG-002', date: '2026-07-10', inspector: 'D. Bureau', inspectorAr: 'م. الديوان', result: 'conditional', findings: 'Cover material shortage noted', findingsAr: 'نقص في مادة التغطية' },
  { id: 'EI-004', facilityId: 'EPWG-002', date: '2026-04-05', inspector: 'D. Bureau', inspectorAr: 'م. الديوان', result: 'pass', findings: 'Gas system performing well', findingsAr: 'نظام الغاز يعمل جيداً' },
  { id: 'EI-005', facilityId: 'EPWG-003', date: '2026-07-12', inspector: 'D. Bureau', inspectorAr: 'م. الديوان', result: 'conditional', findings: 'Weighbridge needs repair', findingsAr: 'الميزان يحتاج إصلاح' },
  { id: 'EI-006', facilityId: 'EPWG-004', date: '2026-07-08', inspector: 'D. Bureau', inspectorAr: 'م. الديوان', result: 'pass', findings: 'Good condition', findingsAr: 'حالة جيدة' },
  { id: 'EI-007', facilityId: 'EPWG-005', date: '2026-07-12', inspector: 'D. Bureau', inspectorAr: 'م. الديوان', result: 'fail', findings: 'Fence breach + fire risk', findingsAr: 'ثقب السياج + خطر حرائق' },
  { id: 'EI-008', facilityId: 'EPWG-006', date: '2026-07-05', inspector: 'D. Bureau', inspectorAr: 'م. الديوان', result: 'pass', findings: 'Small facility well managed', findingsAr: 'منشأة صغيرة مدارة جيداً' },
  { id: 'EI-009', facilityId: 'EPWG-007', date: '2026-07-06', inspector: 'Forest Service', inspectorAr: 'مصالح الغابات', result: 'conditional', findings: 'Forest fire watch needed', findingsAr: 'مراقبة حرائق الغابات ضرورية' },
  { id: 'EI-010', facilityId: 'EPWG-008', date: '2026-07-07', inspector: 'Forest Service', inspectorAr: 'مصالح الغابات', result: 'pass', findings: 'Low risk', findingsAr: 'خطر منخفض' },
  { id: 'EI-011', facilityId: 'EPWG-009', date: '2026-07-07', inspector: 'Forest Service', inspectorAr: 'مصالح الغابات', result: 'pass', findings: 'High altitude safe', findingsAr: 'ارتفاع آمن' },
  { id: 'EI-012', facilityId: 'EPWG-010', date: '2026-07-14', inspector: 'D. Bureau', inspectorAr: 'م. الديوان', result: 'pass', findings: 'Cross-border protocol compliant', findingsAr: 'بروتوكول عابر للحدود ممتثل' },
];

// Work orders for EPWG
export interface EpwgWorkOrder {
  id: string;
  code: string;
  facilityId: string;
  title: string;
  titleAr: string;
  type: 'maintenance' | 'repair' | 'construction' | 'environmental' | 'equipment';
  typeAr: string;
  status: 'open' | 'assigned' | 'inProgress' | 'completed' | 'cancelled';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignee: string;
  assigneeAr: string;
  createdAt: string;
  dueDate: string;
  estimatedCost: number;
  progress: number;
}

export const epwgWorkOrders: EpwgWorkOrder[] = [
  { id: 'EWO-001', code: 'EWO-9001', facilityId: 'EPWG-001', title: 'Hydraulic repair — Loader L-2', titleAr: 'إصلاح هيدروليكي — محمل L-2', type: 'repair', typeAr: 'إصلاح', status: 'inProgress', priority: 'high', assignee: 'Workshop 1', assigneeAr: 'ورشة 1', createdAt: '2026-07-10', dueDate: '2026-07-28', estimatedCost: 85000, progress: 60 },
  { id: 'EWO-002', code: 'EWO-9002', facilityId: 'EPWG-001', title: 'Leachate plant filter replacement', titleAr: 'استبدال فلتر وحدة الرشاحة', type: 'maintenance', typeAr: 'صيانة', status: 'open', priority: 'medium', assignee: 'Workshop 2', assigneeAr: 'ورشة 2', createdAt: '2026-07-18', dueDate: '2026-08-15', estimatedCost: 42000, progress: 0 },
  { id: 'EWO-003', code: 'EWO-9003', facilityId: 'EPWG-002', title: 'Composting aeration repair', titleAr: 'إصلاح تهوية وحدة التسميد', type: 'repair', typeAr: 'إصلاح', status: 'inProgress', priority: 'medium', assignee: 'Workshop 1', assigneeAr: 'ورشة 1', createdAt: '2026-07-08', dueDate: '2026-07-30', estimatedCost: 38000, progress: 45 },
  { id: 'EWO-004', code: 'EWO-9004', facilityId: 'EPWG-002', title: 'Cover material procurement', titleAr: 'توفير مادة التغطية', type: 'environmental', typeAr: 'بيئي', status: 'assigned', priority: 'high', assignee: 'Procurement', assigneeAr: 'المشتريات', createdAt: '2026-07-12', dueDate: '2026-08-01', estimatedCost: 120000, progress: 20 },
  { id: 'EWO-005', code: 'EWO-9005', facilityId: 'EPWG-002', title: 'Hot spot investigation — sector 3', titleAr: 'تحقيق نقطة ساخنة — القطاع 3', type: 'environmental', typeAr: 'بيئي', status: 'open', priority: 'critical', assignee: 'Env. Team', assigneeAr: 'الفريق البيئي', createdAt: '2026-07-22', dueDate: '2026-07-25', estimatedCost: 15000, progress: 0 },
  { id: 'EWO-006', code: 'EWO-9006', facilityId: 'EPWG-003', title: 'Weighbridge load cell replacement', titleAr: 'استبدال خلية وزن الميزان', type: 'equipment', typeAr: 'معدّات', status: 'assigned', priority: 'high', assignee: 'Workshop 3', assigneeAr: 'ورشة 3', createdAt: '2026-07-15', dueDate: '2026-07-25', estimatedCost: 65000, progress: 10 },
  { id: 'EWO-007', code: 'EWO-9007', facilityId: 'EPWG-005', title: 'Fence breach repair', titleAr: 'إصلاح ثقب السياج', type: 'repair', typeAr: 'إصلاح', status: 'open', priority: 'critical', assignee: 'Workshop 2', assigneeAr: 'ورشة 2', createdAt: '2026-07-20', dueDate: '2026-07-24', estimatedCost: 28000, progress: 0 },
  { id: 'EWO-008', code: 'EWO-9008', facilityId: 'EPWG-005', title: 'Fire risk mitigation — steppe zone', titleAr: 'تخفيف خطر الحرائق — منطقة سهبية', type: 'environmental', typeAr: 'بيئي', status: 'inProgress', priority: 'critical', assignee: 'Env. Team', assigneeAr: 'الفريق البيئي', createdAt: '2026-07-22', dueDate: '2026-07-26', estimatedCost: 45000, progress: 30 },
  { id: 'EWO-009', code: 'EWO-9009', facilityId: 'EPWG-001', title: 'Sorting line conveyor belt service', titleAr: 'صيانة ناقل خط الفرز', type: 'maintenance', typeAr: 'صيانة', status: 'completed', priority: 'medium', assignee: 'Workshop 1', assigneeAr: 'ورشة 1', createdAt: '2026-06-20', dueDate: '2026-07-05', estimatedCost: 22000, progress: 100 },
  { id: 'EWO-010', code: 'EWO-9010', facilityId: 'EPWG-002', title: 'Gas well W-7 valve replacement', titleAr: 'استبدال صمام بئر الغاز W-7', type: 'equipment', typeAr: 'معدّات', status: 'completed', priority: 'medium', assignee: 'Workshop 1', assigneeAr: 'ورشة 1', createdAt: '2026-06-15', dueDate: '2026-06-30', estimatedCost: 18000, progress: 100 },
  { id: 'EWO-011', code: 'EWO-9011', facilityId: 'EPWG-004', title: 'Access road grading', titleAr: 'تسوية طريق الوصول', type: 'construction', typeAr: 'أشغال', status: 'open', priority: 'low', assignee: 'Workshop 2', assigneeAr: 'ورشة 2', createdAt: '2026-07-19', dueDate: '2026-08-20', estimatedCost: 35000, progress: 0 },
  { id: 'EWO-012', code: 'EWO-9012', facilityId: 'EPWG-007', title: 'Forest fire watch coordination', titleAr: 'تنسيق مراقبة حرائق الغابة', type: 'environmental', typeAr: 'بيئي', status: 'inProgress', priority: 'high', assignee: 'Forest Service', assigneeAr: 'مصالح الغابات', createdAt: '2026-07-06', dueDate: '2026-09-30', estimatedCost: 12000, progress: 50 },
  { id: 'EWO-013', code: 'EWO-9013', facilityId: 'EPWG-001', title: 'New recycling bay construction', titleAr: 'بناء خليج إعادة التدوير الجديد', type: 'construction', typeAr: 'أشغال', status: 'assigned', priority: 'medium', assignee: 'Contractor A', assigneeAr: 'مقاول أ', createdAt: '2026-07-01', dueDate: '2026-10-15', estimatedCost: 280000, progress: 5 },
  { id: 'EWO-014', code: 'EWO-9014', facilityId: 'EPWG-010', title: 'Cross-border sorting line upgrade', titleAr: 'ترقية خط الفرز العابر للحدود', type: 'construction', typeAr: 'أشغال', status: 'open', priority: 'medium', assignee: 'Contractor B', assigneeAr: 'مقاول ب', createdAt: '2026-07-20', dueDate: '2026-11-30', estimatedCost: 195000, progress: 0 },
];

// Sorting & Recycling data
export interface SortingRecord {
  id: string;
  facilityId: string;
  date: string;
  inputTons: number;
  sortedTons: number;
  recycledTons: number;
  compostedTons: number;
  rejectedTons: number;
  recoveryRate: number;
}

export const epwgSortingRecords: SortingRecord[] = epwgFacilities
  .filter((f) => f.hasSorting || f.hasRecycling || f.hasComposting)
  .flatMap((f, fi) =>
    Array.from({ length: 6 }, (_, mi) => {
      const months = ['فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية'];
      const base = f.dailyWaste * 30;
      const input = Math.round(base * (0.85 + mi * 0.02));
      const sorted = Math.round(input * (f.hasSorting ? 0.35 + mi * 0.01 : 0));
      const recycled = Math.round(sorted * (f.hasRecycling ? 0.55 : 0));
      const composted = Math.round(sorted * (f.hasComposting ? 0.30 : 0));
      const rejected = Math.round(input - sorted);
      const recovery = Math.round(((recycled + composted) / input) * 100);
      return {
        id: `SR-${f.id}-${mi}`,
        facilityId: f.id,
        date: months[mi],
        inputTons: input,
        sortedTons: sorted,
        recycledTons: recycled,
        compostedTons: composted,
        rejectedTons: rejected,
        recoveryRate: recovery,
      };
    }),
  );

// Collection statistics
export const epwgMonthlyCollection = [
  { month: 'فيفري', tons: 4200, trips: 380 },
  { month: 'مارس', tons: 4350, trips: 395 },
  { month: 'أفريل', tons: 4100, trips: 372 },
  { month: 'ماي', tons: 4600, trips: 410 },
  { month: 'جوان', tons: 4450, trips: 402 },
  { month: 'جويلية', tons: 4780, trips: 428 },
];

export const epwgDailyCollection = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1} جويلية`,
  tons: 140 + Math.round(Math.sin(i / 3) * 20 + (i % 7) * 5),
  trips: 12 + ((i % 5) + (i % 3)),
}));

export const epwgWasteByFacility = epwgFacilities.map((f) => ({
  name: f.nameAr,
  nameFr: f.nameFr,
  daily: f.dailyWaste,
  monthly: f.monthlyWaste,
  annual: f.annualWaste,
}));

export const epwgWasteByMunicipality = [
  { name: 'خنشلة', nameFr: 'Khenchela', tons: 180 },
  { name: 'قايس', nameFr: 'Kais', tons: 150 },
  { name: 'الحمامة', nameFr: 'El Hamma', tons: 90 },
  { name: 'بقاية', nameFr: 'Beggai', tons: 90 },
  { name: 'تاوزيانت', nameFr: 'Taouzient', tons: 120 },
  { name: 'رميلة', nameFr: 'Remila', tons: 110 },
  { name: 'أولاد رشاش', nameFr: 'Ouled Rechache', tons: 70 },
  { name: 'عين التوية', nameFr: 'Ain Touila', tons: 50 },
  { name: 'شرشار', nameFr: 'Chechar', tons: 95 },
  { name: 'بابار', nameFr: 'Babar', tons: 70 },
  { name: 'المحمل', nameFr: 'El Mahmel', tons: 55 },
  { name: 'بوحمامة', nameFr: 'Bouhmama', tons: 35 },
  { name: 'يابوس', nameFr: 'Yabous', tons: 28 },
  { name: 'الشليعة', nameFr: 'Chelia', tons: 22 },
  { name: 'كيميل', nameFr: 'Kimel', tons: 40 },
];

export const epwgFacilityUtilization = epwgFacilities.map((f) => ({
  name: f.nameAr,
  utilization: Math.round((f.currentLoadTpd / f.capacityTpd) * 100),
  remaining: Math.round(((f.capacityTpd - f.currentLoadTpd) / f.capacityTpd) * 100),
}));

export const epwgCapacityData = epwgFacilities.map((f) => ({
  name: f.nameAr,
  used: Math.round((f.usedCapacityTons / f.capacityTotalTons) * 100),
  remaining: Math.round(((f.capacityTotalTons - f.usedCapacityTons) / f.capacityTotalTons) * 100),
}));

export const epwgRecyclingRate = [
  { name: 'بلاستيك', value: 32, color: '#0F4C81' },
  { name: 'ورق', value: 24, color: '#16A34A' },
  { name: 'معادن', value: 18, color: '#F59E0B' },
  { name: 'زجاج', value: 14, color: '#14B8A6' },
  { name: 'عضوي', value: 12, color: '#8B5CF6' },
];

// Environmental alerts
export interface EpwgAlert {
  id: string;
  facilityId: string;
  level: 'critical' | 'warning' | 'info';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  time: string;
}

export const epwgAlerts: EpwgAlert[] = [
  { id: 'EA-001', facilityId: 'EPWG-005', level: 'critical', title: 'Fire risk — Babar steppe', titleAr: 'خطر حرائق — بابار السهبية', message: 'High fire risk detected. Mitigation team dispatched.', messageAr: 'خطر حرائق مرتفع. تم إرسال فريق التخفيف.', time: 'قبل 15 دقيقة' },
  { id: 'EA-002', facilityId: 'EPWG-005', level: 'critical', title: 'Fence breach — Babar', titleAr: 'ثقب السياج — بابار', message: 'Perimeter fence breach reported. Repair work order issued.', messageAr: 'ثقب في السياج مبلغ عنه. صدر أمر شغل إصلاح.', time: 'قبل ساعة' },
  { id: 'EA-003', facilityId: 'EPWG-002', level: 'warning', title: 'Hot spot — CET Taouzient sector 3', titleAr: 'نقطة ساخنة — القطاع 3 تاوزيانت', message: 'Thermal anomaly detected. Investigation in progress.', messageAr: 'شذوذ حراري مكتشف. التحقيق جارٍ.', time: 'قبل ساعتين' },
  { id: 'EA-004', facilityId: 'EPWG-002', level: 'warning', title: 'Cover material shortage', titleAr: 'نقص مادة التغطية', message: 'Daily cover material running low at CET Taouzient.', messageAr: 'مادة التغطية اليومية تنفد في تاوزيانت.', time: 'قبل 4 ساعات' },
  { id: 'EA-005', facilityId: 'EPWG-003', level: 'warning', title: 'Weighbridge broken', titleAr: 'الميزان معطوب', message: 'Load cell failure. Manual weighing in use.', messageAr: 'عطل خلية الوزن. استخدام وزن يدوي.', time: 'قبل 6 ساعات' },
  { id: 'EA-006', facilityId: 'EPWG-001', level: 'info', title: 'Quarterly audit passed', titleAr: 'تدقيق ربعي ناجح', message: 'CET Beggai passed environmental compliance audit.', messageAr: 'بقاية اجتازت تدقيق الامتثال البيئي.', time: 'قبل يوم' },
  { id: 'EA-007', facilityId: 'EPWG-007', level: 'warning', title: 'Forest fire watch active', titleAr: 'مراقبة حرائق الغابة مفعّلة', message: 'Bouhmama forest zone — coordinated watch with forest service.', messageAr: 'منطقة غابة بوحمامة — مراقبة منسقة مع مصالح الغابات.', time: 'قبل يومين' },
];

// Documents
export interface EpwgDocument {
  id: string;
  title: string;
  titleAr: string;
  type: 'report' | 'permit' | 'plan' | 'protocol' | 'manual';
  typeAr: string;
  facilityId: string | null;
  date: string;
  size: string;
  author: string;
}

export const epwgDocuments: EpwgDocument[] = [
  { id: 'ED-001', title: 'Annual Environmental Report 2026', titleAr: 'التقرير البيئي السنوي 2026', type: 'report', typeAr: 'تقرير', facilityId: null, date: '2026-07-01', size: '4.2 MB', author: 'Env. Directorate' },
  { id: 'ED-002', title: 'CET Beggai Operating Permit', titleAr: 'رخصة تشغيل بقاية', type: 'permit', typeAr: 'رخصة', facilityId: 'EPWG-001', date: '2019-03-15', size: '1.8 MB', author: 'Ministry of Environment' },
  { id: 'ED-003', title: 'CET Taouzient Operating Permit', titleAr: 'رخصة تشغيل تاوزيانت', type: 'permit', typeAr: 'رخصة', facilityId: 'EPWG-002', date: '2020-06-20', size: '1.6 MB', author: 'Ministry of Environment' },
  { id: 'ED-004', title: 'Leachate Management Plan', titleAr: 'مخطط إدارة الرشاحة', type: 'plan', typeAr: 'مخطط', facilityId: null, date: '2026-01-10', size: '3.1 MB', author: 'EPWG Engineering' },
  { id: 'ED-005', title: 'Gas Extraction Protocol', titleAr: 'بروتوكول استخراج الغاز', type: 'protocol', typeAr: 'بروتوكول', facilityId: 'EPWG-002', date: '2026-02-05', size: '2.4 MB', author: 'EPWG Operations' },
  { id: 'ED-006', title: 'Fire Risk Management Manual', titleAr: 'دليل إدارة مخاطر الحرائق', type: 'manual', typeAr: 'دليل', facilityId: null, date: '2026-03-12', size: '5.7 MB', author: 'Civil Protection' },
  { id: 'ED-007', title: 'Groundwater Monitoring Q2 2026', titleAr: 'مراقبة المياه الجوفية ر2 2026', type: 'report', typeAr: 'تقرير', facilityId: null, date: '2026-06-30', size: '2.9 MB', author: 'Env. Lab' },
  { id: 'ED-008', title: 'Cross-Border Coordination Protocol', titleAr: 'بروتوكول التنسيق العابر للحدود', type: 'protocol', typeAr: 'بروتوكول', facilityId: 'EPWG-010', date: '2023-05-18', size: '1.2 MB', author: 'Wilaya Coordination' },
  { id: 'ED-009', title: 'Sorting & Recycling Procedure', titleAr: 'إجراء الفرز وإعادة التدوير', type: 'manual', typeAr: 'دليل', facilityId: null, date: '2026-04-22', size: '3.8 MB', author: 'EPWG Operations' },
  { id: 'ED-010', title: 'Forest Zone Monitoring Plan', titleAr: 'مخطط مراقبة المناطق الغابية', type: 'plan', typeAr: 'مخطط', facilityId: null, date: '2026-05-10', size: '2.1 MB', author: 'Forest Service' },
  { id: 'ED-011', title: 'Equipment Maintenance Schedule', titleAr: 'جدول صيانة المعدّات', type: 'plan', typeAr: 'مخطط', facilityId: null, date: '2026-01-15', size: '1.5 MB', author: 'EPWG Maintenance' },
  { id: 'ED-012', title: 'Compliance Audit Q2 2026', titleAr: 'تدقيق الامتثال ر2 2026', type: 'report', typeAr: 'تقرير', facilityId: null, date: '2026-06-15', size: '4.5 MB', author: 'Audit Bureau' },
];

// Helper: KPI aggregation
export const epwgStats = {
  totalFacilities: epwgFacilities.length,
  cetCount: epwgFacilities.filter((f) => f.type === 'cet').length,
  controlledCount: epwgFacilities.filter((f) => f.type === 'controlled').length,
  forestCount: epwgFacilities.filter((f) => f.type === 'forest').length,
  specialCount: epwgFacilities.filter((f) => f.type === 'special').length,
  sortingFacilities: epwgFacilities.filter((f) => f.hasSorting).length,
  recyclingFacilities: epwgFacilities.filter((f) => f.hasRecycling).length,
  compostingFacilities: epwgFacilities.filter((f) => f.hasComposting).length,
  municipalitiesCovered: new Set(epwgFacilities.flatMap((f) => f.serviceArea)).size,
  currentWasteVolume: epwgFacilities.reduce((s, f) => s + f.currentLoadTpd, 0),
  totalCapacity: epwgFacilities.reduce((s, f) => s + f.capacityTpd, 0),
  remainingCapacity: epwgFacilities.reduce((s, f) => s + (f.capacityTpd - f.currentLoadTpd), 0),
  dailyCollection: epwgFacilities.reduce((s, f) => s + f.dailyWaste, 0),
  monthlyCollection: epwgFacilities.reduce((s, f) => s + f.monthlyWaste, 0),
  annualCollection: epwgFacilities.reduce((s, f) => s + f.annualWaste, 0),
  activeWorkOrders: epwgWorkOrders.filter((w) => w.status === 'open' || w.status === 'assigned' || w.status === 'inProgress').length,
  criticalAlerts: epwgAlerts.filter((a) => a.level === 'critical').length,
  totalEquipment: epwgEquipment.length,
  totalVehicles: epwgVehicles.length,
  recyclingRate: Math.round(
    (epwgFacilities.filter((f) => f.hasRecycling).reduce((s, f) => s + f.dailyWaste, 0) /
      epwgFacilities.reduce((s, f) => s + f.dailyWaste, 0)) * 100,
  ),
};
