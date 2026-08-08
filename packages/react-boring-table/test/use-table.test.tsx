import { act, renderHook } from '@testing-library/react';
import { describe, expect, expectTypeOf, test } from 'vitest';
import { useTable } from '../src';

const columns = [{ body: (item: { id: string; value: number }) => item.value }];
const getId = (item: { id: string }) => item.id;

describe('useTable', () => {
  test('keeps the table instance and applies new options', async () => {
    const initialData = [{ id: 'first', value: 1 }];
    const { result, rerender } = renderHook(
      ({ data }) =>
        useTable({
          data,
          columns,
          getId,
        }),
      { initialProps: { data: initialData } }
    );
    const initialTable = result.current;

    act(() => {
      rerender({ data: [{ id: 'second', value: 2 }] });
    });
    await act(async () => {
      await initialTable.waitForUpdates();
    });

    expect(result.current).toBe(initialTable);
    expect(result.current.body[0].rawId).toBe('second');
    expect(result.current.body[0].cells[0].value).toBe(2);
    expectTypeOf(result.current.body[0].cells[0].value).toEqualTypeOf<number>();
  });
});
