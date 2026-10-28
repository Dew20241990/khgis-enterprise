// Looks up existing translation keys by text, so new code reuses a key instead of defining a near-duplicate.
//   npm run i18n:find -- "الحالة"          (any language; substring, case-insensitive)
//   npm run i18n:find -- --exact "الحالة"  (whole value only)
import { dictionaries, type Locale } from '../src/i18n/translations';

const args = process.argv.slice(2);
const exact = args.includes('--exact');
const needles = args.filter((a) => !a.startsWith('--')).map((a) => a.trim().toLowerCase()).filter(Boolean);

if (needles.length === 0) {
  console.error('usage: npm run i18n:find -- [--exact] <text> [<text> ...]');
  process.exit(2);
}

const LOCALES: Locale[] = ['ar', 'fr', 'en'];
let misses = 0;
for (const needle of needles) {
  const hits = Object.keys(dictionaries.ar).filter((key) =>
    LOCALES.some((l) => {
      const v = (dictionaries[l][key] ?? '').toLowerCase();
      return exact ? v === needle : v.includes(needle);
    }) || (!exact && key.toLowerCase().includes(needle)),
  );
  console.log(`# ${needle}  (${hits.length} match${hits.length === 1 ? '' : 'es'})`);
  if (hits.length === 0) misses += 1;
  for (const key of hits.slice(0, 25)) {
    console.log(`  ${key}\n    ar: ${dictionaries.ar[key]}\n    fr: ${dictionaries.fr[key]}\n    en: ${dictionaries.en[key]}`);
  }
  if (hits.length > 25) console.log(`  ... ${hits.length - 25} more`);
}
process.exit(misses === needles.length ? 1 : 0);
