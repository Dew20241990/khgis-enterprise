import { describe, expect, it } from 'vitest';
import { conicGradient, distribution, topWithOthers, weightedCollectionRate } from './dashboardStats';

describe('weightedCollectionRate', () => {
  it('weights by container count', () => {
    expect(weightedCollectionRate([{ containers: 100, collectionRate: 90 }, { containers: 300, collectionRate: 50 }])).toBe(60);
  });
  it('is 0 without data', () => {
    expect(weightedCollectionRate([])).toBe(0);
    expect(weightedCollectionRate([{ containers: 0, collectionRate: 80 }])).toBe(0);
  });
});

describe('topWithOthers', () => {
  const items = [{ id: 'a', containers: 5 }, { id: 'b', containers: 50 }, { id: 'c', containers: 20 }, { id: 'd', containers: 1 }];
  it('keeps the n largest and sums the rest', () => {
    expect(topWithOthers(items, 2)).toEqual([
      { id: 'b', value: 50, isOthers: false }, { id: 'c', value: 20, isOthers: false }, { id: 'others', value: 6, isOthers: true },
    ]);
  });
  it('omits the others bar when everything fits', () => {
    expect(topWithOthers(items, 10).some((b) => b.isOthers)).toBe(false);
  });
});

describe('distribution', () => {
  it('percentages sum to exactly 100', () => {
    const d = distribution(['x', 'x', 'y', 'z', 'z', 'z', 'z'], ['x', 'y', 'z', 'w']);
    expect(d.reduce((s, r) => s + r.percent, 0)).toBe(100);
    expect(d.find((r) => r.key === 'w')).toEqual({ key: 'w', count: 0, percent: 0 });
  });
  it('is all zero for empty input', () => {
    expect(distribution([], ['a', 'b']).every((r) => r.percent === 0)).toBe(true);
  });
});

describe('conicGradient', () => {
  it('builds contiguous stops', () => {
    expect(conicGradient([{ key: 'a', count: 1, percent: 50 }, { key: 'b', count: 1, percent: 50 }], ['#111', '#222']))
      .toBe('conic-gradient(#111 0.00% 50.00%, #222 50.00% 100.00%)');
  });
  it('falls back to a neutral ring with no data', () => {
    expect(conicGradient([], ['#111'])).toContain('#CBD5E1');
  });
});
