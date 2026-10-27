import { describe, expect, it } from 'vitest';
import { seededInt, seededUnit } from './seededRandom';

describe('seededRandom', () => {
  it('is deterministic', () => {
    expect(seededUnit('a', 1)).toBe(seededUnit('a', 1));
    expect(seededUnit('a', 1)).not.toBe(seededUnit('a', 2));
    expect(seededUnit('a', 1)).not.toBe(seededUnit('b', 1));
  });
  it('stays within [0, 1) and is roughly uniform', () => {
    let sum = 0;
    for (let i = 0; i < 2000; i++) { const v = seededUnit('u', i); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1); sum += v; }
    expect(sum / 2000).toBeGreaterThan(0.45);
    expect(sum / 2000).toBeLessThan(0.55);
  });
  it('seededInt covers the inclusive range', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) seen.add(seededInt('r', i, 1, 6));
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
