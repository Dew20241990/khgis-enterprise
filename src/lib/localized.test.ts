import { describe, expect, it } from 'vitest';
import { localizedName } from './localized';

describe('localizedName', () => {
  const e = { name: 'Khenchela', nameAr: 'خنشلة', nameFr: 'Khenchela (FR)' };
  it('picks the spelling of the active language', () => {
    expect(localizedName('ar', e)).toBe('خنشلة');
    expect(localizedName('fr', e)).toBe('Khenchela (FR)');
    expect(localizedName('en', e)).toBe('Khenchela');
  });
  it('falls back to another spelling instead of rendering nothing', () => {
    expect(localizedName('ar', { name: 'Babar' })).toBe('Babar');
    expect(localizedName('en', { nameAr: 'بابار' })).toBe('بابار');
    expect(localizedName('fr', { name: '  ', nameAr: 'بابار' })).toBe('بابار');
  });
  it('is empty for a missing entity', () => {
    expect(localizedName('en', undefined)).toBe('');
    expect(localizedName('en', null)).toBe('');
    expect(localizedName('fr', {})).toBe('');
  });
});
