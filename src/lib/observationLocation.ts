import { validatePosition } from '@/lib/geometry';

/**
 * Where an observation's position came from. Positions are never invented: they are either typed by the user or
 * the municipality centre, which the UI labels as approximate.
 */
export type LocationSource = 'entered' | 'municipality-centre';

export type ResolvedLocation =
  | { ok: true; lat: number; lng: number; source: LocationSource }
  | { ok: false; error: 'incomplete' | 'invalid' };

/** Plain decimal numbers only (a comma is accepted as the decimal mark); rejects hex, exponents and words. */
const DECIMAL = /^[+-]?(\d+\.?\d*|\.\d+)$/;

function parseDecimal(text: string): number {
  return DECIMAL.test(text) ? Number(text.replace(',', '.')) : Number.NaN;
}

/**
 * Resolves the optional latitude/longitude fields of the "new observation" form.
 * Both empty -> the municipality centre (approximate); one empty -> incomplete; out of WGS 84 range or not a number -> invalid.
 */
export function resolveObservationLocation(
  input: { lat: string; lng: string },
  centre: readonly [number, number],
): ResolvedLocation {
  const latText = input.lat.trim().replace(',', '.');
  const lngText = input.lng.trim().replace(',', '.');
  if (!latText && !lngText) return { ok: true, lat: centre[0], lng: centre[1], source: 'municipality-centre' };
  if (!latText || !lngText) return { ok: false, error: 'incomplete' };
  const lat = parseDecimal(latText);
  const lng = parseDecimal(lngText);
  if (validatePosition([lng, lat]) !== null) return { ok: false, error: 'invalid' };
  return { ok: true, lat, lng, source: 'entered' };
}
