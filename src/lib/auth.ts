export type Role = 'admin' | 'environment' | 'municipality' | 'cet' | 'contractor' | 'wali';

export interface MockUser {
  username: string;
  password: string;
  name: string;
  nameAr: string;
  nameFr: string;
  role: Role;
  roleLabel: string;
  roleLabelAr: string;
  roleLabelFr: string;
  email: string;
  department: string;
  departmentAr: string;
  avatarColor: string;
  initials: string;
  permissions: Permission[];
  readonly: boolean;
}

export type Permission =
  | 'dashboard'
  | 'gis'
  | 'municipalities'
  | 'neighborhoods'
  | 'black-spots'
  | 'illegal-dumping'
  | 'containers'
  | 'shops'
  | 'inspections'
  | 'routes'
  | 'work-orders'
  | 'vehicles'
  | 'drivers'
  | 'truck-tracking'
  | 'cet-centers'
  | 'contractors'
  | 'complaints'
  | 'reports'
  | 'analytics'
  | 'statistics'
  | 'documents'
  | 'users'
  | 'roles'
  | 'permissions'
  | 'audit-logs'
  | 'ai-assistant'
  | 'settings'
  // Executive permissions (Wali-exclusive)
  | 'exec-dashboard'
  | 'exec-gis'
  | 'exec-analytics'
  | 'exec-reports'
  | 'exec-statistics'
  | 'exec-rankings'
  | 'exec-decisions'
  | 'exec-alerts'
  // EPWG — Public Wilaya Establishment for Technical Landfill Centers
  | 'epwg'
  | 'epwg-facilities'
  | 'epwg-gis'
  | 'epwg-service-areas'
  | 'epwg-work-orders'
  | 'epwg-collection'
  | 'epwg-sorting'
  | 'epwg-equipment'
  | 'epwg-vehicles'
  | 'epwg-environment'
  | 'epwg-reports'
  | 'epwg-documents';

const EPWG_PERMISSIONS: Permission[] = [
  'epwg', 'epwg-facilities', 'epwg-gis', 'epwg-service-areas',
  'epwg-work-orders', 'epwg-collection', 'epwg-sorting', 'epwg-equipment',
  'epwg-vehicles', 'epwg-environment', 'epwg-reports', 'epwg-documents',
];

const ALL_PERMISSIONS: Permission[] = [
  'dashboard', 'gis', 'municipalities', 'neighborhoods', 'black-spots',
  'illegal-dumping', 'containers', 'shops', 'inspections', 'routes',
  'work-orders', 'vehicles', 'drivers', 'truck-tracking', 'cet-centers',
  'contractors', 'complaints', 'reports', 'analytics', 'statistics',
  'documents', 'users', 'roles', 'permissions', 'audit-logs',
  'ai-assistant', 'settings',
  'exec-dashboard', 'exec-gis', 'exec-analytics', 'exec-reports',
  'exec-statistics', 'exec-rankings', 'exec-decisions', 'exec-alerts',
  ...EPWG_PERMISSIONS,
];

const EXEC_PERMISSIONS: Permission[] = [
  'exec-dashboard', 'exec-gis', 'exec-analytics', 'exec-reports',
  'exec-statistics', 'exec-rankings', 'exec-decisions', 'exec-alerts',
  'reports', 'documents',
  ...EPWG_PERMISSIONS,
];

export const MOCK_USERS: MockUser[] = [
  {
    username: 'admin', password: 'admin',
    name: 'System Administrator', nameAr: 'مدير النظام', nameFr: 'Administrateur Système',
    role: 'admin', roleLabel: 'System Administrator', roleLabelAr: 'مدير النظام', roleLabelFr: 'Administrateur Système',
    email: 'admin@khenchela-gov.dz',
    department: 'Information Technology', departmentAr: 'تقنيات الإعلام الآلي',
    avatarColor: 'from-brand-500 to-brand-700', initials: 'AD',
    permissions: ALL_PERMISSIONS, readonly: false,
  },
  {
    username: 'wali', password: 'admin',
    name: 'Governor', nameAr: 'الوالي', nameFr: 'Gouverneur',
    role: 'wali', roleLabel: 'Governor', roleLabelAr: 'الوالي', roleLabelFr: 'Gouverneur',
    email: 'wali@khenchela-gov.dz',
    department: 'Wilaya Executive', departmentAr: 'التنفيذية للولاية',
    avatarColor: 'from-brand-600 to-brand-900', initials: 'WA',
    permissions: EXEC_PERMISSIONS, readonly: true,
  },
  {
    username: 'environment', password: 'admin',
    name: 'Environment Directorate', nameAr: 'مديرية البيئة', nameFr: 'Direction de l\'Environnement',
    role: 'environment', roleLabel: 'Environment Directorate', roleLabelAr: 'مديرية البيئة', roleLabelFr: 'Direction de l\'Environnement',
    email: 'environment@khenchela-gov.dz',
    department: 'Environment Directorate', departmentAr: 'مديرية البيئة',
    avatarColor: 'from-success-500 to-accent-600', initials: 'EN',
    permissions: [
      'dashboard', 'gis', 'black-spots', 'illegal-dumping', 'containers',
      'shops', 'inspections', 'routes', 'work-orders', 'reports',
      'statistics', 'documents', 'ai-assistant', 'settings',
      ...EPWG_PERMISSIONS,
    ],
    readonly: false,
  },
  {
    username: 'municipality', password: 'admin',
    name: 'Municipality Office', nameAr: 'بلدية خنشلة', nameFr: 'Commune de Khenchela',
    role: 'municipality', roleLabel: 'Municipality', roleLabelAr: 'البلدية', roleLabelFr: 'Commune',
    email: 'municipality@khenchela-gov.dz',
    department: 'Municipality', departmentAr: 'البلدية',
    avatarColor: 'from-accent-500 to-accent-700', initials: 'MU',
    permissions: [
      'dashboard', 'gis', 'routes', 'containers', 'complaints',
      'black-spots', 'work-orders', 'municipalities', 'neighborhoods',
      'reports', 'statistics', 'documents',
      'epwg', 'epwg-facilities', 'epwg-gis', 'epwg-service-areas',
      'epwg-collection', 'epwg-reports', 'epwg-documents',
    ],
    readonly: false,
  },
  {
    username: 'cet', password: 'admin',
    name: 'CET Manager', nameAr: 'مدير مركز الطرح', nameFr: 'Gestionnaire CET',
    role: 'cet', roleLabel: 'CET Manager', roleLabelAr: 'مدير مركز الطرح', roleLabelFr: 'Gestionnaire CET',
    email: 'cet@khenchela-gov.dz',
    department: 'Technical Landfill Center', departmentAr: 'مركز الطرح التقني',
    avatarColor: 'from-warning-500 to-warning-700', initials: 'CE',
    permissions: [
      'dashboard', 'gis', 'routes', 'vehicles', 'work-orders',
      'cet-centers', 'drivers', 'reports', 'statistics', 'documents',
      ...EPWG_PERMISSIONS,
    ],
    readonly: false,
  },
  {
    username: 'contractor', password: 'admin',
    name: 'Private Contractor', nameAr: 'المقاول الخاص', nameFr: 'Prestataire Privé',
    role: 'contractor', roleLabel: 'Private Contractor', roleLabelAr: 'المقاول الخاص', roleLabelFr: 'Prestataire Privé',
    email: 'contractor@khenchela-gov.dz',
    department: 'Private Contractor', departmentAr: 'المقاول الخاص',
    avatarColor: 'from-warning-600 to-danger-600', initials: 'PC',
    permissions: [
      'dashboard', 'work-orders', 'black-spots', 'routes',
      'reports', 'documents',
    ],
    readonly: false,
  },
];

export function authenticate(username: string, password: string): MockUser | null {
  const user = MOCK_USERS.find((u) => u.username === username && u.password === password);
  return user ?? null;
}

export function hasPermission(user: MockUser | null, perm: Permission): boolean {
  if (!user) return false;
  return user.permissions.includes(perm);
}

export function canEdit(user: MockUser | null): boolean {
  return user !== null && !user.readonly;
}
