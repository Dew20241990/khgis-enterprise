/**
 * Deterministic pseudo-random numbers for demo fixtures.
 * The same (tag, index) always yields the same value in [0, 1), so demo datasets are identical on every load
 * and across machines. Not for security or for real operational data.
 */
export function seededUnit(tag: string, index: number): number {
  // FNV-1a over the key, then a mulberry32 scramble for good distribution.
  const key = `${tag}:${index}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  let t = (h + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Integer in [min, max] inclusive. */
export function seededInt(tag: string, index: number, min: number, max: number): number {
  return min + Math.floor(seededUnit(tag, index) * (max - min + 1));
}
