import { defineModule } from '../define';

/** Strings shared across several feature areas (view toggles, generic column labels, statuses). */
export const sharedModule = defineModule({
  ar: {
    'shared.complaints': 'الشكاوى',
    'shared.zone': 'المنطقة',
    'shared.neighborhood': 'الحي',
    'shared.viewList': 'قائمة',
    'shared.viewMap': 'خريطة',
  },
  fr: {
    'shared.complaints': 'Signalements',
    'shared.zone': 'Zone',
    'shared.neighborhood': 'Quartier',
    'shared.viewList': 'Liste',
    'shared.viewMap': 'Carte',
  },
  en: {
    'shared.complaints': 'Complaints',
    'shared.zone': 'Zone',
    'shared.neighborhood': 'Neighborhood',
    'shared.viewList': 'List',
    'shared.viewMap': 'Map',
  },
});
