/**
 * Helpers for reading values out of an untyped form submission.
 * Form values arrive as `unknown`; these narrow them without resorting to `any` or blind casts.
 */

export type FormValues = Record<string, unknown>;

/** A GPS field value. Parts may be `''` while the user is still typing. */
export interface GpsValue {
  lat: number | '';
  lng: number | '';
}

export function isGpsValue(v: unknown): v is GpsValue {
  if (typeof v !== 'object' || v === null) return false;
  const { lat, lng } = v as Record<string, unknown>;
  const ok = (n: unknown) => n === '' || (typeof n === 'number' && Number.isFinite(n));
  return ok(lat) && ok(lng);
}

/** String value, or `fallback` when the field is missing / not text / a number. */
export function str(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return fallback;
}

/** Finite number, or `fallback` when the field is missing, empty or not numeric. */
export function num(v: unknown, fallback = 0): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : fallback;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

/** Returns `v` when it is one of `allowed`, otherwise `fallback`. */
export function oneOf<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}

/** `true` for values a "required" field must reject. `0` and `false` are legitimate answers. */
export function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (isGpsValue(v)) return v.lat === '' || v.lng === '';
  return false;
}

/**
 * Entities store `lat`/`lng`, while forms edit a single GPS field named `coords`.
 * `applyCoords` converts a submitted form into entity fields (and drops the helper field);
 * an incomplete `coords` value leaves any existing lat/lng untouched.
 */
export function applyCoords(values: FormValues): FormValues {
  const { coords, ...rest } = values;
  if (isGpsValue(coords) && coords.lat !== '' && coords.lng !== '') {
    return { ...rest, lat: coords.lat, lng: coords.lng };
  }
  return rest;
}

/** Builds form initial values from an entity, exposing its lat/lng as the `coords` GPS field. */
export function withCoordsField(row: object | null): FormValues {
  if (!row) return {};
  const r = row as FormValues;
  if (typeof r.lat === 'number' && typeof r.lng === 'number' && r.coords === undefined) {
    return { ...r, coords: { lat: r.lat, lng: r.lng } };
  }
  return { ...r };
}
