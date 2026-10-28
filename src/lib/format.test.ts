import { describe, expect, it } from 'vitest';
import { formatDate, formatNumber } from './format';

describe('locale formatting', () => {
  it('formats numbers per locale and keeps Latin digits in Arabic', () => {
    expect(formatNumber('en', 1234.5)).toBe('1,234.5');
    expect(formatNumber('ar', 1234)).toMatch(/^[0-9٬,.\s]+$/);
    expect(formatNumber('ar', 1234)).not.toMatch(/[٠-٩]/);
    expect(formatNumber('fr', 1234)).toMatch(/1\s?234/);
  });
  it('formats dates and returns empty text for invalid input', () => {
    expect(formatDate('en', '2026-07-05T00:00:00Z', { timeZone: 'UTC' })).toBe('05/07/2026');
    expect(formatDate('fr', 'garbage')).toBe('');
  });
});
