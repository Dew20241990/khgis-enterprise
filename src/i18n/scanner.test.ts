// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { scanSource } from '../../scripts/i18nScan';

const lines = (src: string, cat: 'arabic' | 'ternary' | 'latin') => [...scanSource(src, 'x.tsx')[cat]];

describe('i18n scanner', () => {
  it('finds Arabic in string literals, templates and JSX text, ignoring comments', () => {
    const src = [
      "// تعليق عربي",
      "const a = 'نص';",
      "const b = `قيمة ${x}`;",
      "const c = <p>مرحبا</p>;",
      "/* تعليق */ const d = 1;",
    ].join('\n');
    expect(lines(src, 'arabic')).toEqual([2, 3, 4]);
  });

  it('flags language ternaries that select text, but not unrelated ternaries', () => {
    const src = [
      "const a = locale === 'ar' ? 'مرحبا' : 'Hello';",
      "const b = locale === 'fr' ? 'Bonjour' : 'Hello';",
      "const c = n > 1 ? 'many' : 'one';",
      "const d = locale === 'ar' ? 1 : 2;",
    ].join('\n');
    expect(lines(src, 'ternary')).toEqual([1, 2]);
  });

  it('flags Latin UI text in JSX, UI attributes and notify calls but not tokens or class lists', () => {
    const src = [
      "const a = <button title=\"Save the record\">Save</button>;",
      "const b = <div className=\"text-sm dark:text-white\" data-x=\"ok\" />;",
      "const c = { label: 'Total vehicles', icon: 'truck', color: 'text-danger-600 dark:text-danger-400' };",
      "toast.success('Saved');",
      "const d = <i>{count}</i>;",
    ].join('\n');
    expect(lines(src, 'latin')).toEqual([1, 3, 4]);
  });

  it('honours the i18n-ignore pragma on the offending line', () => {
    const src = [
      "const a = { label: 'Français' }; // i18n-ignore: language name",
      "const b = 'عربي'; // i18n-ignore: language name",
      "const c = <span>CSV</span>; // i18n-ignore: file format",
    ].join('\n');
    expect(lines(src, 'latin')).toEqual([]);
    expect(lines(src, 'arabic')).toEqual([]);
  });
});
