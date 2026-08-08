import { describe, expect, expectTypeOf, test, vi } from 'vitest';
import { createBoringTable, createOptions } from '../src';

const data = [
  { id: 'ada', name: 'Ada' },
  { id: 'grace', name: 'Grace' },
];

function createTable() {
  return createBoringTable(
    createOptions({
      data,
      getId: (item) => item.id,
      columns: [
        {
          head: (cell) => `Name ${cell.index}`,
          body: (item) => item.name,
          footer: (cell) => `Total ${cell.index}`,
        },
      ],
    })
  );
}

describe('BoringTable', () => {
  test('creates head, body and footer rows with stable identifiers', () => {
    const table = createTable();

    expect(table.head[0].cells[0]).toMatchObject({ id: 'cell-0-0', value: 'Name 0' });
    expect(table.body.map((row) => row.id)).toEqual(['row-0-ada', 'row-1-grace']);
    expect(table.body.map((row) => row.cells[0].value)).toEqual(['Ada', 'Grace']);
    expect(table.footer[0].cells[0]).toMatchObject({ id: 'cell-0-0', value: 'Total 0' });
    expectTypeOf(table.body[0].cells[0].value).toEqualTypeOf<string>();
  });

  test('updates data asynchronously and notifies subscribers once', async () => {
    const table = createTable();
    const listener = vi.fn();
    const unsubscribe = table.subscribe(listener);

    table.setData([{ id: 'linus', name: 'Linus' }]);
    await table.waitForUpdates();

    expect(table.body).toHaveLength(1);
    expect(table.body[0].cells[0].value).toBe('Linus');
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  test('recomposes columns when options change', async () => {
    const table = createTable();

    table.setOptions({
      columns: [
        {
          head: () => 'Identifier',
          body: (item) => item.id,
          footer: () => 'Identifier',
        },
      ],
    });
    await table.waitForUpdates();

    expect(table.head[0].cells[0].value).toBe('Identifier');
    expect(table.body.map((row) => row.cells[0].value)).toEqual(['ada', 'grace']);
    expect(table.footer[0].cells[0].value).toBe('Identifier');
  });
});
