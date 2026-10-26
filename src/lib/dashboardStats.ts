/** Pure helpers that derive dashboard figures from entity lists, so no number on the dashboard is hard-coded. */

export interface RateSource { containers: number; collectionRate: number }
export interface CountSource { id: string; containers: number }

/** Collection rate averaged over municipalities, weighted by container count. Returns 0 for no data. */
export function weightedCollectionRate(items: RateSource[]): number {
  const total = items.reduce((s, m) => s + m.containers, 0);
  if (total === 0) return 0;
  return Math.round(items.reduce((s, m) => s + m.collectionRate * m.containers, 0) / total);
}

export interface Bar { id: string; value: number; isOthers: boolean }

/** The `n` largest entries by container count, plus one "others" bar summing the rest (omitted when empty). */
export function topWithOthers(items: CountSource[], n: number): Bar[] {
  const sorted = [...items].sort((a, b) => b.containers - a.containers || a.id.localeCompare(b.id));
  const bars: Bar[] = sorted.slice(0, n).map((m) => ({ id: m.id, value: m.containers, isOthers: false }));
  const rest = sorted.slice(n).reduce((s, m) => s + m.containers, 0);
  if (rest > 0) bars.push({ id: 'others', value: rest, isOthers: true });
  return bars;
}

export interface Slice { key: string; count: number; percent: number }

/** Counts per key with percentages that always sum to 100 (largest-remainder rounding). */
export function distribution(keys: string[], order: string[]): Slice[] {
  const counts = new Map<string, number>(order.map((k) => [k, 0]));
  for (const k of keys) counts.set(k, (counts.get(k) ?? 0) + 1);
  const total = keys.length;
  const rows = [...counts.entries()].map(([key, count]) => ({ key, count, exact: total ? (count / total) * 100 : 0 }));
  const base = rows.map((r) => ({ ...r, percent: Math.floor(r.exact) }));
  let left = total ? 100 - base.reduce((s, r) => s + r.percent, 0) : 0;
  [...base].sort((a, b) => (b.exact - b.percent) - (a.exact - a.percent)).forEach((r) => { if (left > 0) { r.percent += 1; left -= 1; } });
  return base.map(({ key, count, percent }) => ({ key, count, percent }));
}

/** CSS conic-gradient for a donut; colors cycle if there are more slices than colors. */
export function conicGradient(slices: Slice[], colors: string[]): string {
  const total = slices.reduce((s, x) => s + x.count, 0);
  if (total === 0) return 'conic-gradient(#CBD5E1 0 100%)';
  let acc = 0;
  const stops = slices.map((s, i) => {
    const from = acc; acc += (s.count / total) * 100;
    return `${colors[i % colors.length]} ${from.toFixed(2)}% ${acc.toFixed(2)}%`;
  });
  return `conic-gradient(${stops.join(', ')})`;
}
