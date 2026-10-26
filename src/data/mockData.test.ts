import { describe, expect, it } from 'vitest';
import { municipalities } from './mockData';

describe('municipalities', () => {
  it('has exactly the 21 municipalities of Khenchela wilaya', () => {
    expect(municipalities).toHaveLength(21);
  });
  it('has unique ids, codes and names in every language', () => {
    for (const key of ['id', 'code', 'name', 'nameAr', 'nameFr'] as const) {
      expect(new Set(municipalities.map((m) => m[key])).size).toBe(21);
    }
  });
});
