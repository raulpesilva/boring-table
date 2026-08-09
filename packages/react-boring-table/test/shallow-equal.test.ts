import { describe, expect, test } from 'vitest';
import { shallowEqual } from '../src/utils';

describe('shallowEqual', () => {
  test('handles primitive edge cases and shallow object equality', () => {
    expect(shallowEqual(Number.NaN, Number.NaN)).toBe(true);
    expect(shallowEqual(0, -0)).toBe(false);
    expect(shallowEqual({ value: 1 }, { value: 1 })).toBe(true);
    expect(shallowEqual({ nested: {} }, { nested: {} })).toBe(false);
    expect(shallowEqual(null, {})).toBe(false);
  });
});
