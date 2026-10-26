import { describe, expect, it } from 'vitest';
import { applyDocumentSettings, directionFor } from './documentSettings';

describe('directionFor', () => {
  it('uses RTL for Arabic and LTR for French/English', () => {
    expect(directionFor('ar')).toBe('rtl');
    expect(directionFor('fr')).toBe('ltr');
    expect(directionFor('en')).toBe('ltr');
  });
});

describe('applyDocumentSettings', () => {
  it('sets dir, lang and the dark class, and can switch back', () => {
    const html = document.createElement('html');
    applyDocumentSettings(html, 'ar', 'dark');
    expect(html.getAttribute('dir')).toBe('rtl');
    expect(html.getAttribute('lang')).toBe('ar');
    expect(html.classList.contains('dark')).toBe(true);
    applyDocumentSettings(html, 'fr', 'light');
    expect(html.getAttribute('dir')).toBe('ltr');
    expect(html.getAttribute('lang')).toBe('fr');
    expect(html.classList.contains('dark')).toBe(false);
  });
});
