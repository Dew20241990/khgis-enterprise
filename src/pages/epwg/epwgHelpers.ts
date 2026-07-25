import type { FacilityType, FacilityStatus, EnvStatus, EquipmentStatus, VehicleStatus } from '@/data/epwgData';
import type { Locale } from '@/i18n/translations';

export const facilityTypeIcon: Record<FacilityType, string> = {
  cet: '🏭',
  controlled: '🗑️',
  forest: '🌲',
  special: '🔗',
};

export const facilityTypeColor: Record<FacilityType, string> = {
  cet: '#0F4C81',
  controlled: '#F59E0B',
  forest: '#16A34A',
  special: '#8B5CF6',
};

export const facilityTypeTone: Record<FacilityType, 'brand' | 'warning' | 'success' | 'neutral'> = {
  cet: 'brand',
  controlled: 'warning',
  forest: 'success',
  special: 'neutral',
};

export const statusColor: Record<FacilityStatus, string> = {
  operational: '#16A34A',
  'near-capacity': '#F59E0B',
  maintenance: '#F97316',
  planned: '#0F4C81',
  decommissioned: '#94A3B8',
};

export const envStatusColor: Record<EnvStatus, string> = {
  excellent: '#16A34A',
  good: '#0F4C81',
  average: '#F59E0B',
  poor: '#F97316',
  critical: '#DC2626',
};

export const equipmentStatusColor: Record<EquipmentStatus, string> = {
  operational: '#16A34A',
  maintenance: '#F59E0B',
  broken: '#DC2626',
  planned: '#0F4C81',
};

export const vehicleStatusColor: Record<VehicleStatus, string> = {
  active: '#16A34A',
  maintenance: '#F59E0B',
  idle: '#94A3B8',
  broken: '#DC2626',
};

export function localizedField<T>(locale: Locale, ar: T, fr: T, en: T): T {
  if (locale === 'ar') return ar;
  if (locale === 'fr') return fr;
  return en;
}

export function fillRateColor(rate: number): string {
  if (rate > 90) return '#DC2626';
  if (rate > 75) return '#F59E0B';
  if (rate > 50) return '#0F4C81';
  return '#16A34A';
}

export function statusLabel(status: FacilityStatus, locale: Locale): string {
  const map: Record<FacilityStatus, { ar: string; fr: string; en: string }> = {
    operational: { ar: 'تشغيلي', fr: 'Opérationnel', en: 'Operational' },
    'near-capacity': { ar: 'قرب الامتلاء', fr: 'Presque plein', en: 'Near Capacity' },
    maintenance: { ar: 'صيانة', fr: 'Maintenance', en: 'Maintenance' },
    planned: { ar: 'مخطط', fr: 'Planifié', en: 'Planned' },
    decommissioned: { ar: 'متوقف', fr: 'Désaffecté', en: 'Decommissioned' },
  };
  return map[status][locale];
}

export function envStatusLabel(status: EnvStatus, locale: Locale): string {
  const map: Record<EnvStatus, { ar: string; fr: string; en: string }> = {
    excellent: { ar: 'ممتاز', fr: 'Excellent', en: 'Excellent' },
    good: { ar: 'جيد', fr: 'Bon', en: 'Good' },
    average: { ar: 'متوسط', fr: 'Moyen', en: 'Average' },
    poor: { ar: 'ضعيف', fr: 'Faible', en: 'Poor' },
    critical: { ar: 'حرج', fr: 'Critique', en: 'Critical' },
  };
  return map[status][locale];
}

export function equipmentStatusLabel(status: EquipmentStatus, locale: Locale): string {
  const map: Record<EquipmentStatus, { ar: string; fr: string; en: string }> = {
    operational: { ar: 'تشغيلي', fr: 'Opérationnel', en: 'Operational' },
    maintenance: { ar: 'صيانة', fr: 'Maintenance', en: 'Maintenance' },
    broken: { ar: 'معطل', fr: 'En panne', en: 'Broken' },
    planned: { ar: 'مخطط', fr: 'Planifié', en: 'Planned' },
  };
  return map[status][locale];
}

export function vehicleStatusLabel(status: VehicleStatus, locale: Locale): string {
  const map: Record<VehicleStatus, { ar: string; fr: string; en: string }> = {
    active: { ar: 'نشطة', fr: 'Actif', en: 'Active' },
    maintenance: { ar: 'صيانة', fr: 'Maintenance', en: 'Maintenance' },
    idle: { ar: 'خاملة', fr: 'Inactif', en: 'Idle' },
    broken: { ar: 'معطلة', fr: 'En panne', en: 'Broken' },
  };
  return map[status][locale];
}
