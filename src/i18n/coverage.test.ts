// @vitest-environment node
import { readFileSync } from 'fs';
import { describe, expect, it } from 'vitest';
import { scanHardcodedArabic } from '../../scripts/i18nScan';
import { MODULES } from './modules';
import { coreDictionaries, dictionaries, translate, type Locale } from './translations';

const LOCALES: Locale[] = ['ar', 'fr', 'en'];
const ARABIC = /[؀-ۿ]/;
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('feature modules', () => {
  const entries = Object.entries(MODULES) as [string, Record<Locale, Record<string, string>>][];

  it.each(entries)('%s: ar/fr/en have identical keys', (_name, m) => {
    const ar = Object.keys(m.ar).sort();
    expect(Object.keys(m.fr).sort()).toEqual(ar);
    expect(Object.keys(m.en).sort()).toEqual(ar);
  });

  it('no key is defined twice across modules or in the core dictionary', () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const k of Object.keys(coreDictionaries.ar)) seen.set(k, 'core');
    for (const [name, m] of entries) {
      for (const k of Object.keys(m.ar)) {
        if (seen.has(k)) dupes.push(`${k} (${seen.get(k)} + ${name})`);
        seen.set(k, name);
      }
    }
    expect(dupes).toEqual([]);
  });
});

describe('merged dictionaries', () => {
  it('have identical key sets in every language', () => {
    const ar = Object.keys(dictionaries.ar).sort();
    for (const l of ['fr', 'en'] as Locale[]) expect(Object.keys(dictionaries[l]).sort(), l).toEqual(ar);
  });
  it('contain no empty values and no Arabic text in French or English', () => {
    for (const l of LOCALES) {
      expect(Object.entries(dictionaries[l]).filter(([, v]) => !v.trim()).map(([k]) => k), `empty in ${l}`).toEqual([]);
    }
    for (const l of ['fr', 'en'] as Locale[]) {
      expect(Object.entries(dictionaries[l]).filter(([, v]) => ARABIC.test(v)).map(([k]) => k), `Arabic in ${l}`).toEqual([]);
    }
  });
  it('use the same {placeholders} in every language', () => {
    const bad: string[] = [];
    for (const k of Object.keys(dictionaries.ar)) {
      const a = placeholders(dictionaries.ar[k]).join();
      if (placeholders(dictionaries.fr[k]).join() !== a || placeholders(dictionaries.en[k]).join() !== a) bad.push(k);
    }
    expect(bad).toEqual([]);
  });
  it('translate() switches language and interpolates parameters', () => {
    const key = Object.keys(dictionaries.en).find((k) => /\{n\}/.test(dictionaries.en[k]));
    if (key) {
      expect(translate('en', key, { n: 7 })).toContain('7');
      expect(translate('fr', key, { n: 7 })).toContain('7');
    }
    expect(translate('fr', 'shared.viewList')).toBe('Liste');
    expect(translate('en', 'shared.viewList')).toBe('List');
    expect(translate('ar', 'shared.viewList')).toBe('قائمة');
    expect(translate('en', 'no.such.key')).toBe('no.such.key');
  });
});

describe('hard-coded Arabic in application source (ratchet)', () => {
  const baseline = JSON.parse(readFileSync('src/i18n/hardcoded-arabic.baseline.json', 'utf8')) as Record<string, number>;
  const now = scanHardcodedArabic();

  it('never grows: no file may have more hard-coded Arabic lines than the baseline, new files must have none', () => {
    const regressions = Object.entries(now).filter(([f, n]) => n > (baseline[f] ?? 0)).map(([f, n]) => `${f}: ${n} > ${baseline[f] ?? 0}`);
    expect(regressions).toEqual([]);
  });
  it('baseline only lists files that still contain hard-coded Arabic (shrink it as pages are converted)', () => {
    const stale = Object.keys(baseline).filter((f) => !(f in now) || now[f] < baseline[f]);
    expect(stale, 'run `npm run i18n:audit -- --write-baseline` to lock in progress').toEqual([]);
  });
});
