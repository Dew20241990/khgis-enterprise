import { describe, expect, it } from 'vitest';
import { dictionaries, translate, type Locale } from './translations';

const LOCALES: Locale[] = ['ar', 'fr', 'en'];
const keys = (l: Locale) => Object.keys(dictionaries[l]);

describe('translation dictionaries', () => {
  it('French and English contain every Arabic key', () => {
    for (const l of ['fr', 'en'] as Locale[]) {
      expect(keys('ar').filter((k) => !(k in dictionaries[l])), `missing in ${l}`).toEqual([]);
    }
  });

  it('Arabic contains every key defined in French or English', () => {
    for (const l of ['fr', 'en'] as Locale[]) {
      expect(keys(l).filter((k) => !(k in dictionaries.ar)), `extra in ${l}`).toEqual([]);
    }
  });

  it('no translation is an empty string', () => {
    for (const l of LOCALES) {
      expect(Object.entries(dictionaries[l]).filter(([, v]) => v.trim() === '').map(([k]) => k), l).toEqual([]);
    }
  });

  it('French and English differ from the Arabic text', () => {
    for (const l of ['fr', 'en'] as Locale[]) {
      const arabic = /[؀-ۿ]/;
      const leaked = Object.entries(dictionaries[l]).filter(([, v]) => arabic.test(v)).map(([k]) => k);
      expect(leaked, `Arabic text inside ${l}`).toEqual([]);
    }
  });

  it('translate returns the right language and falls back to the key', () => {
    expect(translate('fr', 'edit')).toBe('Modifier');
    expect(translate('en', 'delete')).toBe('Delete');
    expect(translate('fr', 'definitelyNotAKey')).toBe('definitelyNotAKey');
  });
});
