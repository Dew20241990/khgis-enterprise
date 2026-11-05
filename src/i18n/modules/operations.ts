import { defineModule } from '../define';

export const operationsModule = defineModule({
  ar: {
    'inspections.form.locationHint': 'اختياري: أدخل إحداثيات الملاحظة. إن تُركت فارغة يُستخدم مركز البلدية (موقع تقريبي).',
    'inspections.form.locationIncomplete': 'أدخل خط العرض وخط الطول معاً، أو اتركهما فارغين',
    'inspections.location.approximate': 'موقع تقريبي: مركز البلدية، وليس قياساً ميدانياً',
  },
  fr: {
    'inspections.form.locationHint': 'Facultatif : saisissez les coordonnées de l’observation. Laissées vides, le centre de la commune est utilisé (position approximative).',
    'inspections.form.locationIncomplete': 'Saisissez la latitude et la longitude ensemble, ou laissez les deux vides',
    'inspections.location.approximate': 'Position approximative : centre de la commune, et non une mesure de terrain',
  },
  en: {
    'inspections.form.locationHint': 'Optional: enter the observation’s coordinates. If left empty, the municipality centre is used (approximate position).',
    'inspections.form.locationIncomplete': 'Enter both latitude and longitude, or leave both empty',
    'inspections.location.approximate': 'Approximate position: municipality centre, not a field measurement',
  },
});
