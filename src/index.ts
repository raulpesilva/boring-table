import type { Except, Simplify, UnionToIntersection } from 'type-fest';
// adicionar memo para evitar re-render desnecessário
// referencia: https://github.com/TanStack/table/blob/main/packages/table-core/src/core/table.ts
// _getDefaultColumnDef: usa o memo para evitar re-render desnecessário

const actions = {
  'update-all:head-row': 'update-all:head-row',
  'update:head-row': 'update:head-row',
  'update:head-cell': 'update:head-cell',
  'update-all:body-row': 'update-all:body-row',
  'update:body-row': 'update:body-row',
  'update:body-cell': 'update:body-cell',
  'update-all:footer-row': 'update-all:footer-row',
  'update:footer-row': 'update:footer-row',
  'update:footer-cell': 'update:footer-cell',
} as const;

interface IBoringPlugin {
  name: string;
  configure?: (arg: BoringTable) => any;
  onMount?: () => any;
  onReset?: () => any;
  extend?: () => any;
  beforeCreate?: () => any;
  afterCreate?: () => any;
  onCreateHeadRow?: (row: any) => any;
  onCreateHeadCell?: (cell: any) => any;
  onCreateBodyRow?: (row: any) => any;
  onCreateBodyCell?: (cell: any) => any;
  onCreateFooterRow?: (row: any) => any;
  onCreateFooterCell?: (cell: any) => any;
}
class BoringPlugin implements IBoringPlugin {
  name: string;
  configure(table: BoringTable) {
    return {};
  }
  onMount() {
    return {};
  }
  onReset() {
    return {};
  }

  extend() {
    return {};
  }

  onCreateHeadRow(row: BoringTable['head'][number]) {
    return {};
  }
  onCreateHeadCell(row: BoringTable['head'][number]['cells'][number]) {
    return {};
  }

  onCreateBodyRow(row: BoringTable['body'][number]) {
    return {};
  }
  onCreateBodyCell(row: BoringTable['body'][number]['cells'][number]) {
    return {};
  }

  onCreateFooterRow(row: BoringTable['footer'][number]) {
    return {};
  }
  onCreateFooterCell(row: BoringTable['footer'][number]['cells'][number]) {
    return {};
  }

  beforeCreate() {}
  afterCreate() {}
}

type CellBase<TCellValue> = { id: string; rawId: string; value: TCellValue };
type Cell<TCellValue, TCellExtra extends Record<string, any>> = Simplify<
  CellBase<TCellValue> & Except<TCellExtra, keyof CellBase<TCellValue>>
>;

type RowBase<TCellValue, TCellExtra> = {
  id: string;
  rawId: string;
  index: number;
  cells: Cell<TCellValue, TCellExtra>[];
};
type Row<TCellValue, TCellExtra, TRowExtra extends Record<string, any>> = Simplify<
  RowBase<TCellValue, TCellExtra> & Except<TRowExtra, keyof RowBase<TCellValue, TCellExtra>>
>;

type Column<TValue extends any, TPlugins extends IBoringPlugin[] = BoringPlugin[]> = {
  type?: string;
  head: (
    arg: TValue,
    extra: Simplify<UnionToIntersection<ReturnType<TPlugins[number]['onCreateHeadCell']>> & { id: string }>,
    table: BoringTable<TValue[], TPlugins>
  ) => any;
  body: (
    arg: TValue,
    extra: Simplify<UnionToIntersection<ReturnType<TPlugins[number]['onCreateBodyCell']>> & { id: string }>,
    table: BoringTable<TValue[], TPlugins>
  ) => any;
  footer?: (
    arg: TValue,
    extra: Simplify<UnionToIntersection<ReturnType<TPlugins[number]['onCreateFooterCell']>> & { id: string }>,
    table: BoringTable<TValue[], TPlugins>
  ) => any;
};

// UnionToIntersection<ReturnType<TPlugins[number]['onCreateHeadRow']>>,
type ExtractRow<
  TColumn extends Record<string, any>[],
  TPlugins extends Record<string, any>[],
  K1 extends keyof TColumn[number],
  K2 extends keyof TPlugins[number],
  K3 extends keyof TPlugins[number]
> = Simplify<
  Row<
    ReturnType<TColumn[number][K1]>,
    UnionToIntersection<ReturnType<TPlugins[number][K2]>>,
    UnionToIntersection<ReturnType<TPlugins[number][K3]>>
  >
>;

class BoringTable<
  TData extends any[] = any,
  const TPlugins extends IBoringPlugin[] = IBoringPlugin[],
  const TColumn extends Column<TData[number], TPlugins>[] = Column<TData[number], TPlugins>[]
> {
  data: TData;
  columns: TColumn;
  getId: (arg: TData[number]) => string;
  head: ExtractRow<TColumn, TPlugins, 'head', 'onCreateHeadCell', 'onCreateHeadRow'>[];
  body: ExtractRow<TColumn, TPlugins, 'body', 'onCreateBodyCell', 'onCreateBodyRow'>[];
  footer: ExtractRow<TColumn, TPlugins, 'footer', 'onCreateFooterCell', 'onCreateFooterRow'>[];

  plugins: TPlugins = [] as unknown as TPlugins;
  config: UnionToIntersection<ReturnType<TPlugins[number]['configure']>>;
  events: Map<string, any> = new Map();
  hasScheduledUpdate = false;
  extensions: UnionToIntersection<ReturnType<TPlugins[number]['extend']>>;

  dispatch(event: string, payload?: any) {
    this.events.set(event, payload);
    if (!this.hasScheduledUpdate) {
      this.hasScheduledUpdate = true;
      setTimeout(() => {
        this.process();
        this.hasScheduledUpdate = false;
      }, 0);
    }
  }

  constructor({
    data,
    columns,
    plugins,
    getId,
  }: {
    data: TData;
    getId: (arg: TData[number]) => string;
    columns: TColumn;
    plugins?: TPlugins;
  }) {
    this.data = data;
    this.columns = columns;
    this.getId = getId;
    if (plugins) this.plugins = plugins;
    this.configure();
  }

  configure() {
    this.config = this.plugins.reduce((acc, plugin) => ({ ...acc, ...plugin.configure(this) }), {});
    this.extensions = this.plugins.reduce((acc, plugin) => ({ ...acc, ...plugin.extend() }), {});
  }

  createCells(item: TData[number]) {
    const rawId = this.getId(item);
    const { headCells, bodyCells, footerCells } = this.columns.reduce(
      (acc, column, index) => {
        const id = `cell-${index}-${rawId}`;
        const { headCellExtra, bodyCellExtra, footerCellExtra } = this.plugins.reduce(
          (acc, plugin) => {
            const headCellExtra = plugin.onCreateHeadCell({ ...acc.headCellExtra, id, rawId });
            const bodyCellExtra = plugin.onCreateBodyCell({ ...acc.bodyCellExtra, id, rawId });
            const footerCellExtra = plugin.onCreateFooterCell({ ...acc.footerCellExtra, id, rawId });
            return {
              headCellExtra: { ...acc.headCellExtra, ...headCellExtra },
              bodyCellExtra: { ...acc.bodyCellExtra, ...bodyCellExtra },
              footerCellExtra: { ...acc.footerCellExtra, ...footerCellExtra },
            };
          },
          { headCellExtra: {}, bodyCellExtra: {}, footerCellExtra: {} }
        );
        const headCell = { id, rawId, value: column.head(item, { ...headCellExtra, id, rawId }, this) };
        const bodyCell = { id, rawId, value: column.body(item, { ...bodyCellExtra, id, rawId }, this) };
        const footerCell = column?.footer
          ? { id, rawId, value: column.footer(item, { ...footerCellExtra, id, rawId }, this) }
          : null;
        const headCells = [...acc.headCells, { ...headCell, ...headCellExtra }];
        const bodyCells = [...acc.bodyCells, { ...bodyCell, ...bodyCellExtra }];
        const footerCells = [...acc.footerCells];
        if (footerCell) footerCells.push({ ...footerCell, ...footerCellExtra });
        return { headCells, bodyCells, footerCells };
      },
      { headCells: [], bodyCells: [], footerCells: [] }
    );
    return { headCells, bodyCells, footerCells };
  }

  createRow(item: TData[number], index: number) {
    const { headCells, bodyCells, footerCells } = this.createCells(item);
    const rawId = this.getId(item);
    const id = `row-${index}-${rawId}`;
    const headRow = { id, rawId, index, cells: headCells };
    const bodyRow = { id, rawId, index, cells: bodyCells };
    const footerRow = { id, rawId, index, cells: footerCells };
    const { headRowExtra, bodyRowExtra, footerRowExtra } = this.plugins.reduce(
      (acc, plugin) => {
        const headRowExtra = plugin.onCreateHeadRow({ ...headRow, ...acc.headRowExtra });
        const bodyRowExtra = plugin.onCreateBodyRow({ ...bodyRow, ...acc.bodyRowExtra });
        const footerRowExtra = plugin.onCreateFooterRow({ ...footerRow, ...acc.footerRowExtra });
        return {
          headRowExtra: { ...headRowExtra, ...acc.headRowExtra },
          bodyRowExtra: { ...bodyRowExtra, ...acc.bodyRowExtra },
          footerRowExtra: { ...footerRowExtra, ...acc.footerRowExtra },
        };
      },
      { headRowExtra: {}, bodyRowExtra: {}, footerRowExtra: {} }
    );
    return { headRow, bodyRow, footerRow, headRowExtra, bodyRowExtra, footerRowExtra };
  }

  createRows() {
    const rows = this.data.reduce(
      (acc, item, index) => {
        const { headRow, bodyRow, footerRow, headRowExtra, bodyRowExtra, footerRowExtra } = this.createRow(item, index);
        const headRows = [...acc.headRows, { ...headRow, ...headRowExtra }];
        const bodyRows = [...acc.bodyRows, { ...bodyRow, ...bodyRowExtra }];
        const footerRows = [...acc.footerRows];
        if (footerRow.cells.length) footerRows.push({ ...footerRow, ...footerRowExtra });
        return { headRows, bodyRows, footerRows };
      },
      { headRows: [], bodyRows: [], footerRows: [] }
    );
    return rows;
  }

  process() {
    console.time('process');
    this.plugins.forEach((plugin) => plugin.beforeCreate());
    const rows = this.createRows();
    this.plugins.forEach((plugin) => plugin.afterCreate());
    this.head = rows.headRows;
    this.body = rows.bodyRows;
    this.footer = rows.footerRows;
    console.timeEnd('process');
  }

  reset() {
    this.events = new Map();
    this.plugins.forEach((plugin) => plugin.onReset());
    this.process();
  }

  waitForUpdates() {
    return new Promise((resolve) => {
      const id = setInterval(() => {
        if (!this.hasScheduledUpdate) {
          clearInterval(id);
          resolve(undefined);
        }
      }, 0);
    });
  }
}
type GenericBoringTable = BoringTable<any, IBoringPlugin[], Column<any>[]>;
class FilterPlugin extends BoringPlugin {
  table: BoringTable<{ name: string }[]>;
  param: string;
  initialData: any[];
  constructor() {
    super();
  }

  configure(arg: GenericBoringTable) {
    this.table = arg;
    this.initialData = [...this.table.data];
    return {};
  }

  filter = (value: string) => {
    this.param = value;
    this.table.dispatch('update:head-row');
    this.table.dispatch('update:body-row');
    this.table.dispatch('update:footer-row');
  };

  beforeCreate(): void {
    if (!this.param) {
      this.table.data = this.initialData;
      return;
    }
    this.table.data = this.initialData.filter((item) => item.name.includes(this.param));
  }

  extend() {
    return { filter: this.filter };
  }
}

class HiddenPlugin extends BoringPlugin {
  name = 'HiddenPlugin';
  values: Map<string, { hidden: boolean }> = new Map();
  table: BoringTable;

  configure(arg: GenericBoringTable) {
    this.table = arg;
    return {};
  }

  private toggle = (id: string, value?: boolean) => {
    if (value !== undefined) {
      const storedValue = this.values.get(id);
      this.values.set(id, { ...storedValue, hidden: value });
      return;
    }
    const storedValue = this.values.get(id);
    this.values.set(id, { ...storedValue, hidden: !storedValue.hidden });
  };

  onCreateHeadRow(row: BoringTable['head'][number]) {
    if (!this.values.has(row.rawId)) this.values.set(row.rawId, { hidden: false });
    const hidden = this.values.get(row.rawId).hidden;
    this.table.dispatch('update:head-row');
    return { hidden, toggleHidden: (value?: boolean) => this.toggle(row.rawId, value) };
  }

  onCreateBodyRow(row: BoringTable['body'][number]) {
    if (!this.values.has(row.rawId)) this.values.set(row.rawId, { hidden: false });
    const hidden = this.values.get(row.rawId).hidden;
    this.table.dispatch('update:body-row');
    return { hidden, toggleHidden: (value?: boolean) => this.toggle(row.rawId, value) };
  }

  onCreateFooterRow(row: BoringTable['footer'][number]) {
    if (!this.values.has(row.rawId)) this.values.set(row.rawId, { hidden: false });
    const hidden = this.values.get(row.rawId).hidden;
    this.table.dispatch('update:footer-row');
    return { hidden, toggleHidden: (value?: boolean) => this.toggle(row.rawId, value) };
  }
}
class CheckPlugin extends BoringPlugin {
  name = 'CheckPlugin';
  values: Map<string, { check: boolean }> = new Map();
  table: BoringTable;

  configure(arg: GenericBoringTable) {
    this.table = arg;
    return {};
  }

  private toggle = (id: string, value?: boolean) => {
    if (value !== undefined) {
      const storedValue = this.values.get(id);
      this.values.set(id, { ...storedValue, check: value });
      return;
    }
    const storedValue = this.values.get(id);
    this.values.set(id, { ...storedValue, check: !storedValue.check });
    this.table.dispatch('update:head-row');
    this.table.dispatch('update:body-row');
    this.table.dispatch('update:footer-row');
  };

  onCreateHeadRow(row: BoringTable['head'][number]) {
    if (!this.values.has(row.rawId)) this.values.set(row.rawId, { check: false });
    const check = this.values.get(row.rawId).check;
    this.table.dispatch('update:head-row');
    return { check, toggleCheck: (value?: boolean) => this.toggle(row.rawId, value) };
  }

  onCreateHeadCell(cell: BoringTable['head'][number]['cell'][number]) {
    if (!this.values.has(cell.rawId)) this.values.set(cell.rawId, { check: false });
    const check = this.values.get(cell.rawId).check;
    this.table.dispatch('update:head-cell');
    return { check, toggleCheck: (value?: boolean) => this.toggle(cell.rawId, value) };
  }

  onCreateBodyRow(row: BoringTable['body'][number]) {
    if (!this.values.has(row.rawId)) this.values.set(row.rawId, { check: false });
    const check = this.values.get(row.rawId).check;
    this.table.dispatch('update:body-row');
    return { check, toggleCheck: (value?: boolean) => this.toggle(row.rawId, value) };
  }

  onCreateBodyCell(cell: BoringTable['body'][number]['cell'][number]) {
    const id = `cell-${cell.rawId}`;
    if (!this.values.has(id)) this.values.set(id, { check: false });
    const check = this.values.get(id).check;
    this.table.dispatch('update:body-cell');
    return { check, toggleCheck: (value?: boolean) => this.toggle(id, value) };
  }

  onCreateFooterRow(row: BoringTable['footer'][number]) {
    if (!this.values.has(row.rawId)) this.values.set(row.rawId, { check: false });
    const check = this.values.get(row.rawId).check;
    this.table.dispatch('update:footer-row');
    return { check, toggleCheck: (value?: boolean) => this.toggle(row.rawId, value) };
  }
  onCreateFooterCell(cell: BoringTable['footer'][number]['cell'][number]) {
    if (!this.values.has(cell.rawId)) this.values.set(cell.rawId, { check: false });
    const check = this.values.get(cell.rawId).check;
    this.table.dispatch('update:footer-cell');
    return { check, toggleCheck: (value?: boolean) => this.toggle(cell.rawId, value) };
  }

  onReset() {
    this.values = new Map();
    this.table.dispatch('update:head-row');
    this.table.dispatch('update:body-row');
    this.table.dispatch('update:footer-row');
    return {};
  }
}

class ChangePlugin<T> extends BoringPlugin {
  table: BoringTable;
  initialData: T[];

  constructor() {
    super();
    this.change = this.change.bind(this);
  }

  configure(arg: GenericBoringTable) {
    this.table = arg;
    this.initialData = [...arg.data];
    return {};
  }

  changeData(position: number, data: BoringTable['data'][number]) {
    this.table.data[position] = data;
    this.table.dispatch('update:head-row');
    this.table.dispatch('update:body-row');
    this.table.dispatch('update:footer-row');
  }

  unwrapData(data: T | ((prev: T) => T), prev: T) {
    if (typeof data !== 'function') return data;
    return (data as (prev: T) => T)(prev);
  }

  change(row: BoringTable['body'][number]) {
    return async (data: T | ((prev: T) => T)) => {
      this.changeData(row.index, this.unwrapData(data, this.table.data[row.index]));
      return await this.table.waitForUpdates();
    };
  }
  onCreateBodyRow(row: BoringTable['body'][number]) {
    return { change: this.change(row) };
  }

  onReset() {
    this.table.data = this.initialData;
    this.table.dispatch('update:head-row');
    this.table.dispatch('update:body-row');
    this.table.dispatch('update:footer-row');
    return {};
  }
}

const table = new BoringTable({
  data: [
    { id: '1', name: 'John', age: 30 },
    { id: '2', name: 'Mary', age: 20 },
  ],
  getId: (arg) => arg.id,
  columns: [
    {
      type: 'name1',
      head: (arg, e, t) => arg.name,
      body: (arg, e) => (e.check ? arg.age : arg.name),
    },
    {
      type: 'name2',
      head: (arg) => arg.age,
      body: (arg) => arg.name,
    },
    {
      head: (arg) => arg.age,
      body: (arg) => arg.age,
    },
  ],

  plugins: [
    new FilterPlugin(),
    new HiddenPlugin(),
    new CheckPlugin(),
    new ChangePlugin<{ id: string; name: string; age: number }>(),
  ],
});

table.process();
setTimeout(async () => {
  console.log(JSON.stringify(table.body, null, 2));
  await table.body[0].change((prev) => ({ ...prev, age: 27 }));
  // table.reset();
  // table.extensions.filter('o');
  table.body[0].cells[0].toggleCheck();
  await table.waitForUpdates();
  console.log(JSON.stringify(table.body, null, 2));
  // console.log('head', JSON.stringify(table.head, null, 2));
  // console.log('body', JSON.stringify(table.body, null, 2));
  // console.log('footer', JSON.stringify(table.footer, null, 2));
}, 1);
type Config = typeof table.config;
//   ^?
type Extensions = typeof table.extensions;
//   ^?
type HeadType = typeof table.head;
//   ^?
type BodyType = typeof table.body;
//   ^?
type FooterType = typeof table.footer;
//   ^?
