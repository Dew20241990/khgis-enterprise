import { describe, expect, it } from 'vitest';
import { csvCell, neutralizeFormula, parseCsvRecords, toCsv } from './csv';

describe('neutralizeFormula', () => {
  it.each(['=1+1', '+SUM(A1)', '-2+3', '@cmd', '\tTAB', '\rCR'])('prefixes %j', (v) => {
    expect(neutralizeFormula(v)).toBe(`'${v}`);
  });

  it('leaves ordinary text and plain numbers alone', () => {
    expect(neutralizeFormula('Khenchela')).toBe('Khenchela');
    expect(neutralizeFormula('-42')).toBe('-42');
    expect(neutralizeFormula('3.14')).toBe('3.14');
    expect(neutralizeFormula('خنشلة')).toBe('خنشلة');
  });
});

describe('csvCell', () => {
  it('quotes and escapes embedded quotes', () => {
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
  });

  it('neutralises formulas in strings but not numbers', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvCell(-5)).toBe('"-5"');
  });

  it('renders null/undefined as empty and serialises objects', () => {
    expect(csvCell(null)).toBe('""');
    expect(csvCell(undefined)).toBe('""');
    expect(csvCell({ a: 1 })).toBe('"{""a"":1}"');
  });
});

describe('toCsv', () => {
  it('starts with a BOM and uses CRLF separators', () => {
    const out = toCsv(['a', 'b'], [[1, 'x']]);
    expect(out.startsWith('﻿')).toBe(true);
    expect(out).toBe('﻿"a","b"\r\n"1","x"');
  });
});

describe('parseCsvRecords', () => {
  it('parses simple rows with LF and CRLF', () => {
    expect(parseCsvRecords('a,b\n1,2\r\n3,4')).toEqual([['a', 'b'], ['1', '2'], ['3', '4']]);
  });

  it('handles quoted commas, quotes and newlines', () => {
    expect(parseCsvRecords('a,b\n"x,1","line1\nline2"\n"he said ""hi""",z')).toEqual([
      ['a', 'b'], ['x,1', 'line1\nline2'], ['he said "hi"', 'z'],
    ]);
  });

  it('strips a UTF-8 BOM and drops blank lines', () => {
    expect(parseCsvRecords('﻿a,b\n\n1,2\n')).toEqual([['a', 'b'], ['1', '2']]);
  });

  it('round-trips what toCsv produces', () => {
    const rows = [['a "b"', 'c,d'], ['multi\nline', 'ok']];
    const parsed = parseCsvRecords(toCsv(['h1', 'h2'], rows));
    expect(parsed).toEqual([['h1', 'h2'], ...rows]);
  });

  it('rejects an unterminated quote', () => {
    expect(() => parseCsvRecords('a,b\n"oops,1')).toThrow(/Unterminated/);
  });
});
