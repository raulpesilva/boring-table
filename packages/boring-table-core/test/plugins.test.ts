import { describe, expect, test } from 'vitest';
import {
  ChangePlugin,
  FetchPlugin,
  FilterPlugin,
  HiddenRowPlugin,
  PaginationPlugin,
  RowSelectPlugin,
  createBoringTable,
  createOptions,
} from '../src';
import { vi } from 'vitest';

const data = [
  { id: 'one', value: 1 },
  { id: 'two', value: 2 },
  { id: 'three', value: 3 },
  { id: 'four', value: 4 },
];

function createPluginTable() {
  const filter = new FilterPlugin({
    initialValue: 0,
    filter: (item, minimum: number) => item.value >= minimum,
  });

  return createBoringTable(
    createOptions({
      data,
      getId: (item) => item.id,
      columns: [{ body: (item) => item.value }],
      plugins: [filter, new HiddenRowPlugin(), new RowSelectPlugin(), new PaginationPlugin({ pageSize: 2 })],
    })
  );
}

describe('built-in plugins', () => {
  test('filters and paginates the custom body', async () => {
    const table = createPluginTable();
    await table.waitForUpdates();

    expect(table.extensions.totalItems).toBe(4);
    expect(table.customBody.map((row) => row.rawId)).toEqual(['one', 'two']);

    table.extensions.nextPage();
    await table.waitForUpdates();
    expect(table.customBody.map((row) => row.rawId)).toEqual(['three', 'four']);

    table.extensions.filter(3);
    await table.waitForUpdates();
    expect(table.extensions.criteria).toBe(3);
    expect(table.customBody.map((row) => row.rawId)).toEqual(['three', 'four']);
  });

  test('tracks selected and hidden rows in extensions', async () => {
    const table = createPluginTable();
    await table.waitForUpdates();

    table.body[0].toggleSelect();
    table.body[1].toggleHidden();
    await table.waitForUpdates();

    expect(table.extensions.selectedItems).toEqual([data[0]]);
    expect(table.extensions.hasSelectedRows).toBe(true);
    expect(table.extensions.hiddenRows.map((row) => row.rawId)).toEqual(['two']);
    expect(table.extensions.hasHidden).toBe(true);
  });

  test('changes a row and rebuilds its cells', async () => {
    const changeableData = [{ id: 'one', value: 1 }];
    const table = createBoringTable(
      createOptions({
        data: changeableData,
        getId: (item) => item.id,
        columns: [{ body: (item) => item.value }],
        plugins: [new ChangePlugin<(typeof changeableData)[number]>()],
      })
    );

    await table.body[0].change((item) => ({ ...item, value: 2 }));

    expect(table.data[0].value).toBe(2);
    expect(table.body[0].cells[0].value).toBe(2);
  });

  test('fetches data from normalized query parameters and exposes response extensions', async () => {
    const queryParams = {
      search: { value: 'boring table', requestOnChange: false },
      empty: { value: null, requestOnChange: false },
    };
    const fetchFn = vi.fn(async (_queryString: string, _queryParams: typeof queryParams) => ({
      data: [{ id: 'remote', value: 10 }],
      extensions: { resultCount: 1 },
    }));
    const fetchPlugin = new FetchPlugin({
      fetchOnMount: false,
      fetchFn,
      queryParams,
      initialValues: { resultCount: 0 },
    });
    const table = createBoringTable(
      createOptions({
        data: [],
        getId: (item: { id: string }) => item.id,
        columns: [{ body: (item: { value: number }) => item.value }],
        plugins: [fetchPlugin],
      })
    );

    await table.extensions.fetch();
    await table.waitForUpdates();

    expect(fetchFn).toHaveBeenCalledWith('search=boring+table', fetchPlugin.queryParams);
    expect(table.body[0].rawId).toBe('remote');
    expect(table.extensions.resultCount).toBe(1);
    expect(table.extensions.loading).toBe(false);
  });
});
