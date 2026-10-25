/**
 * CSV helpers shared by every export/import path.
 *
 * Exports neutralise spreadsheet formula injection (OWASP "CSV Injection"): a text cell
 * that starts with `=`, `+`, `-`, `@`, TAB or CR would otherwise be executed as a formula
 * when the file is opened in Excel / Google Sheets / LibreOffice.
 */

const FORMULA_TRIGGER = /^[=+\-@\t\r]/;
const PLAIN_NUMBER = /^-?\d+(\.\d+)?$/;

/** Prefixes a text value with `'` when a spreadsheet could interpret it as a formula. */
export function neutralizeFormula(value: string): string {
  if (PLAIN_NUMBER.test(value)) return value; // a bare number cannot be a formula
  return FORMULA_TRIGGER.test(value) ? `'${value}` : value;
}

/** Serialises one value as a quoted, escaped, formula-safe CSV cell. */
export function csvCell(value: unknown): string {
  let text: string;
  if (value === null || value === undefined) text = '';
  else if (typeof value === 'string') text = neutralizeFormula(value);
  else if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') text = String(value);
  else if (value instanceof Date) text = Number.isNaN(value.getTime()) ? '' : value.toISOString();
  else text = neutralizeFormula(JSON.stringify(value) ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

/** Builds a complete CSV document (UTF-8 BOM so Excel detects Arabic text correctly). */
export function toCsv(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  const lines = [headers.map(csvCell).join(','), ...rows.map((r) => r.map(csvCell).join(','))];
  return '﻿' + lines.join('\r\n');
}

/**
 * RFC 4180-style tokenizer: handles quoted fields, escaped quotes (""), embedded commas and
 * newlines inside quotes, and both LF and CRLF record separators. Fully empty records are dropped.
 */
export function parseCsvRecords(input: string): string[][] {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  const records: string[][] = [];
  let field = '';
  let record: string[] = [];
  let inQuotes = false;

  const endField = () => { record.push(field); field = ''; };
  const endRecord = () => {
    endField();
    if (record.length > 1 || record[0].trim() !== '') records.push(record);
    record = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') endField();
    else if (ch === '\n') endRecord();
    else if (ch === '\r') { if (text[i + 1] === '\n') i++; endRecord(); }
    else field += ch;
  }
  if (inQuotes) throw new Error('Unterminated quoted field');
  if (field !== '' || record.length > 0) endRecord();
  return records;
}
