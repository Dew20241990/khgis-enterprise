import { describe, expect, it } from 'vitest';
import { resolveObservationLocation } from './observationLocation';

const CENTRE = [35.4236, 7.1453] as const;

describe('resolveObservationLocation', () => {
  it('uses the municipality centre, flagged as such, when no coordinates are typed', () => {
    expect(resolveObservationLocation({ lat: '', lng: '' }, CENTRE)).toEqual({
      ok: true, lat: 35.4236, lng: 7.1453, source: 'municipality-centre',
    });
    expect(resolveObservationLocation({ lat: '  ', lng: '\t' }, CENTRE)).toMatchObject({ ok: true, source: 'municipality-centre' });
  });

  it('is deterministic: the centre is never jittered', () => {
    const first = resolveObservationLocation({ lat: '', lng: '' }, CENTRE);
    const second = resolveObservationLocation({ lat: '', lng: '' }, CENTRE);
    expect(second).toEqual(first);
  });

  it('keeps typed coordinates exactly and marks them as entered', () => {
    expect(resolveObservationLocation({ lat: '35.431', lng: '7.151' }, CENTRE)).toEqual({ ok: true, lat: 35.431, lng: 7.151, source: 'entered' });
    expect(resolveObservationLocation({ lat: ' -3.5 ', lng: '+7' }, CENTRE)).toMatchObject({ ok: true, lat: -3.5, lng: 7, source: 'entered' });
  });

  it('accepts a decimal comma', () => {
    expect(resolveObservationLocation({ lat: '35,431', lng: '7,151' }, CENTRE)).toMatchObject({ ok: true, lat: 35.431, lng: 7.151 });
  });

  it('rejects a single coordinate as incomplete', () => {
    expect(resolveObservationLocation({ lat: '35.4', lng: '' }, CENTRE)).toEqual({ ok: false, error: 'incomplete' });
    expect(resolveObservationLocation({ lat: '', lng: '7.1' }, CENTRE)).toEqual({ ok: false, error: 'incomplete' });
  });

  it('rejects anything that is not a plain in-range number', () => {
    for (const [lat, lng] of [['abc', '7'], ['35', 'x'], ['91', '7'], ['35', '181'], ['-91', '0'], ['0x10', '7'], ['1e2', '7'], ['35.4.1', '7'], ['Infinity', '7']]) {
      expect(resolveObservationLocation({ lat, lng }, CENTRE)).toEqual({ ok: false, error: 'invalid' });
    }
  });
});
