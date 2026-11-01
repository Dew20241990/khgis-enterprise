// Finds user-visible text that bypasses the translation function, in application source (outside the
// dictionaries in src/i18n and the demo data in src/data). Used by the i18n coverage test (a ratchet that can
// only shrink) and by `npm run i18n:audit`.
//
// Three categories, all counted as distinct source lines per file:
//   arabic  - Arabic text in string literals, template literals or JSX text
//   ternary - `locale === 'ar' ? ... : ...` style text selection (a competing mini translation system)
//   latin   - Latin UI text in JSX text, UI-related attributes/properties and toast calls
// A line that legitimately needs such text (a language's own name, a brand, a file format) carries
// `// i18n-ignore: <reason>`.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join, relative, sep } from 'path';
import ts from 'typescript';

export type ScanCategory = 'arabic' | 'ternary' | 'latin';
export type ScanResult = Record<ScanCategory, Record<string, number>>;

export const BASELINE_PATH = 'src/i18n/hardcoded-text.baseline.json';
const ARABIC = /[؀-ۿ]/;
const LATIN_WORD = /[A-Za-zÀ-ÿ]{3,}/;
const EXCLUDED_DIRS = ['src/i18n', 'src/data'];
const UI_ATTRIBUTES = new Set(['title', 'placeholder', 'aria-label', 'alt', 'label', 'header', 'subtitle', 'description', 'message', 'helperText', 'confirmLabel', 'emptyText', 'tooltip']);
const UI_PROPERTIES = new Set(['label', 'header', 'title', 'subtitle', 'description', 'placeholder', 'message', 'tooltip', 'confirmLabel', 'emptyText', 'helperText', 'entityName', 'entityNamePlural']);
const NOTIFY_CALL = /^(toast\.(success|error|warning|info)|notify|alert|confirm)$/;

function walk(dir: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name) && !name.endsWith('.d.ts')) out.push(p);
  }
}

/** True for strings that are identifiers, enum-like tokens or Tailwind class lists rather than prose. */
function looksLikeToken(s: string): boolean {
  const t = s.trim();
  if (!t) return true;
  if (!/\s/.test(t) && /^[a-z][A-Za-z0-9_.:\-/]*$/.test(t)) return true; // idToken, kebab-case, css class
  return t.split(/\s+/).every((w) => /^[a-z0-9\-:/[\].#%!_]+$/.test(w)); // class list: "text-sm dark:text-white"
}

function languageTest(cond: ts.Expression): boolean {
  if (!ts.isBinaryExpression(cond)) return false;
  const k = cond.operatorToken.kind;
  if (k !== ts.SyntaxKind.EqualsEqualsEqualsToken && k !== ts.SyntaxKind.EqualsEqualsToken && k !== ts.SyntaxKind.ExclamationEqualsEqualsToken) return false;
  const { left, right } = cond;
  return ts.isIdentifier(left) && ['locale', 'lang', 'language'].includes(left.text) && ts.isStringLiteral(right) && ['ar', 'fr', 'en'].includes(right.text);
}

function hasText(n: ts.Node): boolean {
  let found = false;
  const visit = (x: ts.Node): void => {
    if (found) return;
    if (ts.isStringLiteral(x) || ts.isNoSubstitutionTemplateLiteral(x) || ts.isTemplateHead(x) || ts.isTemplateMiddle(x) || ts.isTemplateTail(x) || ts.isJsxText(x)) {
      if (/[A-Za-z؀-ۿ]/.test((x as ts.StringLiteral).text ?? '')) found = true;
    }
    ts.forEachChild(x, visit);
  };
  visit(n);
  return found;
}

export function scanSource(source: string, fileName = 'file.tsx'): Record<ScanCategory, Set<number>> {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, fileName.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const lines = source.split('\n');
  const found: Record<ScanCategory, Set<number>> = { arabic: new Set(), ternary: new Set(), latin: new Set() };
  const add = (cat: ScanCategory, node: ts.Node): void => {
    const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line;
    if (lines[line]?.includes('i18n-ignore')) return;
    found[cat].add(line + 1);
  };

  const visit = (node: ts.Node): void => {
    const isStringy = ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node);
    if (isStringy && ARABIC.test(node.text)) {
      if (!ts.isImportDeclaration(node.parent) && !ts.isExportDeclaration(node.parent)) add('arabic', node);
    } else if (ts.isJsxText(node)) {
      const text = node.getText(sf).replace(/\s+/g, ' ').trim();
      if (ARABIC.test(text)) add('arabic', node);
      else if (text && LATIN_WORD.test(text) && !/^[\W\d_]+$/.test(text)) add('latin', node);
    }

    if (ts.isConditionalExpression(node) && languageTest(node.condition) && (hasText(node.whenTrue) || hasText(node.whenFalse))) add('ternary', node);

    if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer)) {
      const name = node.name.getText(sf);
      if (UI_ATTRIBUTES.has(name) && LATIN_WORD.test(node.initializer.text) && !looksLikeToken(node.initializer.text)) add('latin', node);
    }
    if (ts.isPropertyAssignment(node) && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) && UI_PROPERTIES.has(node.name.text) && (ts.isStringLiteral(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer))) {
      const v = node.initializer.text;
      if (LATIN_WORD.test(v) && !looksLikeToken(v)) add('latin', node);
    }
    if (ts.isCallExpression(node) && NOTIFY_CALL.test(node.expression.getText(sf))) {
      for (const a of node.arguments) if ((ts.isStringLiteral(a) || ts.isNoSubstitutionTemplateLiteral(a)) && LATIN_WORD.test(a.text)) add('latin', a);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}

/** Map of repo-relative file path -> number of offending source lines, per category. */
export function scanHardcodedText(root: string = process.cwd()): ScanResult {
  const files: string[] = [];
  walk(join(root, 'src'), files);
  const result: ScanResult = { arabic: {}, ternary: {}, latin: {} };
  for (const f of files) {
    const rel = relative(root, f).split(sep).join('/');
    if (EXCLUDED_DIRS.some((d) => rel.startsWith(d + '/'))) continue;
    const found = scanSource(readFileSync(f, 'utf8'), f);
    for (const cat of Object.keys(found) as ScanCategory[]) if (found[cat].size > 0) result[cat][rel] = found[cat].size;
  }
  return result;
}

if (process.argv[1] && process.argv[1].endsWith('i18nScan.ts')) {
  const r = scanHardcodedText();
  const limit = Number(process.argv.find((a) => a.startsWith('--top='))?.slice(6) ?? 25);
  for (const cat of Object.keys(r) as ScanCategory[]) {
    const entries = Object.entries(r[cat]).sort((a, b) => b[1] - a[1]);
    console.log(`\n== ${cat}: ${entries.reduce((s, [, n]) => s + n, 0)} lines in ${entries.length} files`);
    for (const [f, n] of entries.slice(0, limit)) console.log(String(n).padStart(5), f);
    if (entries.length > limit) console.log(`       … and ${entries.length - limit} more files`);
  }
  if (process.argv.includes('--write-baseline')) {
    const sorted = Object.fromEntries((Object.keys(r) as ScanCategory[]).map((c) => [c, Object.fromEntries(Object.entries(r[c]).sort(([a], [b]) => a.localeCompare(b)))]));
    writeFileSync(BASELINE_PATH, JSON.stringify(sorted, null, 2) + '\n');
    console.log(`\nbaseline written to ${BASELINE_PATH}`);
  }
}
