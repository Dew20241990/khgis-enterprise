// Finds user-visible hard-coded Arabic in application source (outside dictionaries and demo data).
// Used by the i18n coverage test and by `npm run i18n:audit`.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join, relative, sep } from 'path';

const ARABIC = /[؀-ۿ]/;
const EXCLUDED_DIRS = ['src/i18n', 'src/data'];

function stripComments(line: string): string {
  if (line.includes('i18n-ignore')) return ''; // e.g. a language's own name, which must not be translated
  const t = line.trim();
  if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) return '';
  return line.replace(/\{\/\*.*?\*\/\}/g, '').replace(/\s\/\/\s.*$/, '').replace(/\/\*.*?\*\//g, '');
}

function walk(dir: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name)) out.push(p);
  }
}

/** Map of repo-relative file path -> number of source lines containing Arabic text. */
export function scanHardcodedArabic(root: string = process.cwd()): Record<string, number> {
  const files: string[] = [];
  walk(join(root, 'src'), files);
  const result: Record<string, number> = {};
  for (const f of files) {
    const rel = relative(root, f).split(sep).join('/');
    if (EXCLUDED_DIRS.some((d) => rel.startsWith(d + '/'))) continue;
    const n = readFileSync(f, 'utf8').split('\n').filter((l) => ARABIC.test(stripComments(l))).length;
    if (n > 0) result[rel] = n;
  }
  return result;
}

if (process.argv[1] && process.argv[1].endsWith('i18nScan.ts')) {
  const r = scanHardcodedArabic();
  const entries = Object.entries(r).sort((a, b) => b[1] - a[1]);
  for (const [f, n] of entries) console.log(String(n).padStart(4), f);
  console.log(`total ${entries.reduce((s, [, n]) => s + n, 0)} lines in ${entries.length} files`);
  if (process.argv.includes('--write-baseline')) {
    writeFileSync('src/i18n/hardcoded-arabic.baseline.json', JSON.stringify(r, Object.keys(r).sort(), 2) + '\n');
  }
}
