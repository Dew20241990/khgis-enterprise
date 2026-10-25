import { describe, expect, it } from 'vitest';
import { applyCoords, isEmptyValue, num, oneOf, str, withCoordsField } from './formValues';

describe('value narrowing helpers', () => {
  it('str / num fall back on missing or invalid input', () => {
    expect(str('x')).toBe('x');
    expect(str(12)).toBe('12');
    expect(str(undefined, 'fb')).toBe('fb');
    expect(num('42')).toBe(42);
    expect(num('')).toBe(0);
    expect(num('abc', 7)).toBe(7);
    expect(num(NaN, 3)).toBe(3);
    expect(num(0, 9)).toBe(0);
  });

  it('oneOf only accepts allowed values', () => {
    expect(oneOf('b', ['a', 'b'] as const, 'a')).toBe('b');
    expect(oneOf('zzz', ['a', 'b'] as const, 'a')).toBe('a');
    expect(oneOf(5, ['a', 'b'] as const, 'a')).toBe('a');
  });
});

describe('isEmptyValue (required-field check)', () => {
  it('treats 0 and false as real answers', () => {
    expect(isEmptyValue(0)).toBe(false);
    expect(isEmptyValue(false)).toBe(false);
  });

  it('rejects blank text, nullish, empty lists and incomplete GPS', () => {
    expect(isEmptyValue('')).toBe(true);
    expect(isEmptyValue('   ')).toBe(true);
    expect(isEmptyValue(null)).toBe(true);
    expect(isEmptyValue(undefined)).toBe(true);
    expect(isEmptyValue([])).toBe(true);
    expect(isEmptyValue({ lat: '', lng: 7 })).toBe(true);
    expect(isEmptyValue({ lat: 35, lng: 7 })).toBe(false);
  });
});

describe('coords <-> lat/lng mapping', () => {
  it('applyCoords writes lat/lng and removes the helper field', () => {
    expect(applyCoords({ name: 'A', coords: { lat: 35.4, lng: 7.1 } })).toEqual({ name: 'A', lat: 35.4, lng: 7.1 });
  });

  it('applyCoords ignores incomplete coords and keeps existing lat/lng out of the way', () => {
    expect(applyCoords({ name: 'A', coords: { lat: '', lng: 7.1 } })).toEqual({ name: 'A' });
    expect(applyCoords({ name: 'A' })).toEqual({ name: 'A' });
  });

  it('withCoordsField exposes lat/lng as coords for editing', () => {
    expect(withCoordsField({ id: 'x', lat: 35.4, lng: 7.1 })).toEqual({ id: 'x', lat: 35.4, lng: 7.1, coords: { lat: 35.4, lng: 7.1 } });
    expect(withCoordsField({ id: 'x' })).toEqual({ id: 'x' });
    expect(withCoordsField(null)).toEqual({});
  });
});
