import type { Except, Simplify, UnionToIntersection } from 'type-fest';
// adicionar memo para evitar re-render desnecessário
// referencia: https://github.com/TanStack/table/blob/main/packages/table-core/src/core/table.ts
// _getDefaultColumnDef: usa o memo para evitar re-render desnecessário

const events = {
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

interface Events {
  'update:head-rows': void;
  'update:head-row': any;
  'update:head-cell': any;

  'update:body-rows': void;
  'update:body-row': any;
  'update:body-cell': any;

  'update:footer-rows': void;
  'update:footer-row': any;
  'update:footer-cell': any;

  'update:data': void;
  'update:rows': void;
  'update:all': void;

  'reset:all': void;
  'reset:rows': void;

  'change:data': void;
  'add:data': void;
}

interface IBoringPlugin {
  name: string;
  configure?: (table: BoringTable) => any;
  onUpdateData?: () => any;
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

  onUpdateData() {}
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

type CellBase<TCellValue> = { id: string; rawId: string; index: number; rowIndex: number; value: TCellValue };
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

  events: Map<keyof Events, any> = new Map();
  hasScheduledUpdate = false;

  plugins: IBoringPlugin[] = [];
  config: UnionToIntersection<ReturnType<TPlugins[number]['configure']>>;
  extensions: UnionToIntersection<ReturnType<TPlugins[number]['extend']>>;

  head: ExtractRow<TColumn, TPlugins, 'head', 'onCreateHeadCell', 'onCreateHeadRow'>[] = [];
  body: ExtractRow<TColumn, TPlugins, 'body', 'onCreateBodyCell', 'onCreateBodyRow'>[] = [];
  footer: ExtractRow<TColumn, TPlugins, 'footer', 'onCreateFooterCell', 'onCreateFooterRow'>[] = [];

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
    this.dispatch('update:all');
  }

  compressEvents() {
    const shouldUpdateAll = this.events.has('update:all');
    const shouldUpdateData = this.events.has('update:data') || shouldUpdateAll;
    const shouldUpdateRows = this.events.has('update:rows') || shouldUpdateAll;

    const shouldUpdateHeadRows = this.events.has('update:head-rows') && !shouldUpdateRows;
    const shouldUpdateHeadRow = this.events.has('update:head-row') && !shouldUpdateRows;
    const shouldUpdateHeadCell = this.events.has('update:head-cell') && !shouldUpdateRows;

    const shouldUpdateBodyRows = this.events.has('update:body-rows') && !shouldUpdateRows;
    const shouldUpdateBodyRow = this.events.has('update:body-row') && !shouldUpdateRows;
    const shouldUpdateBodyCell = this.events.has('update:body-cell') && !shouldUpdateRows;

    const shouldUpdateFooterRows = this.events.has('update:footer-rows') && !shouldUpdateRows;
    const shouldUpdateFooterRow = this.events.has('update:footer-row') && !shouldUpdateRows;
    const shouldUpdateFooterCell = this.events.has('update:footer-cell') && !shouldUpdateRows;
    return {
      shouldUpdateAll,
      shouldUpdateData,
      shouldUpdateRows: shouldUpdateRows || (shouldUpdateHeadRows && shouldUpdateBodyRows && shouldUpdateFooterRows),
      shouldUpdateHeadRows,
      shouldUpdateBodyRows,
      shouldUpdateFooterRows,
      shouldUpdateHeadRow,
      shouldUpdateHeadCell,
      shouldUpdateBodyRow,
      shouldUpdateBodyCell,
      shouldUpdateFooterRow,
      shouldUpdateFooterCell,
    };
  }

  upsetEvent(event: keyof Events, payload?: Events[keyof Events]) {
    if (this.events.has(event)) {
      this.events.get(event).push(payload);
      return;
    }
    this.events.set(event, [payload]);
  }

  dispatch<T extends keyof Events>(event: T, payload?: Events[T]) {
    this.upsetEvent(event, payload);
    if (!this.hasScheduledUpdate) {
      this.hasScheduledUpdate = true;
      setTimeout(() => {
        this.process();
        this.hasScheduledUpdate = false;
        this.events.clear();
      }, 0);
    }
  }

  configure() {
    this.config = this.plugins.reduce((acc, plugin) => ({ ...acc, ...plugin.configure(this) }), {});
    this.extensions = this.plugins.reduce((acc, plugin) => ({ ...acc, ...plugin.extend() }), {});
  }

  createCells(item: TData[number], rowIndex: number, from?: 'head' | 'body' | 'footer') {
    const rawId = this.getId(item);
    const { headCells, bodyCells, footerCells } = this.columns.reduce(
      (acc, column, index) => {
        const id = `cell-${index}-${rawId}`;
        const baseCell = { id, rawId, index, rowIndex };
        const { headCellExtra, bodyCellExtra, footerCellExtra } = this.plugins.reduce(
          (acc, plugin) => {
            const callAll = from === undefined;
            const onCreateHeadCell = callAll || from === 'head' ? plugin.onCreateHeadCell.bind(plugin) : () => ({});
            const onCreateBodyCell = callAll || from === 'body' ? plugin.onCreateBodyCell.bind(plugin) : () => ({});
            const onCreateFooterCell =
              callAll || from === 'footer' ? plugin.onCreateFooterCell.bind(plugin) : () => ({});
            const headCellExtra = onCreateHeadCell({ ...acc.headCellExtra, ...baseCell });
            const bodyCellExtra = onCreateBodyCell({ ...acc.bodyCellExtra, ...baseCell });
            const footerCellExtra = onCreateFooterCell({ ...acc.footerCellExtra, ...baseCell });
            return {
              headCellExtra: { ...acc.headCellExtra, ...headCellExtra },
              bodyCellExtra: { ...acc.bodyCellExtra, ...bodyCellExtra },
              footerCellExtra: { ...acc.footerCellExtra, ...footerCellExtra },
            };
          },
          { headCellExtra: {}, bodyCellExtra: {}, footerCellExtra: {} }
        );

        const headCell = { ...baseCell, value: column.head(item, { ...headCellExtra, ...baseCell }, this) };
        const bodyCell = { ...baseCell, value: column.body(item, { ...bodyCellExtra, ...baseCell }, this) };
        const footerCell = column?.footer
          ? { ...baseCell, value: column.footer(item, { ...footerCellExtra, ...baseCell }, this) }
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

  createRow(item: TData[number], index: number, from?: 'head' | 'body' | 'footer') {
    const { headCells, bodyCells, footerCells } = this.createCells(item, index);
    const rawId = this.getId(item);
    const id = `row-${index}-${rawId}`;
    const headRow = { id, rawId, index, cells: headCells };
    const bodyRow = { id, rawId, index, cells: bodyCells };
    const footerRow = { id, rawId, index, cells: footerCells };
    const { headRowExtra, bodyRowExtra, footerRowExtra } = this.plugins.reduce(
      (acc, plugin) => {
        const callAll = from === undefined;
        const onCreateHeadRow = callAll || from === 'head' ? plugin.onCreateHeadRow.bind(plugin) : () => ({});
        const onCreateBodyRow = callAll || from === 'body' ? plugin.onCreateBodyRow.bind(plugin) : () => ({});
        const onCreateFooterRow = callAll || from === 'footer' ? plugin.onCreateFooterRow.bind(plugin) : () => ({});
        const headRowExtra = onCreateHeadRow({ ...headRow, ...acc.headRowExtra });
        const bodyRowExtra = onCreateBodyRow({ ...bodyRow, ...acc.bodyRowExtra });
        const footerRowExtra = onCreateFooterRow({ ...footerRow, ...acc.footerRowExtra });
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

  createRows(from?: 'head' | 'body' | 'footer') {
    const rows = this.data.reduce(
      (acc, item, index) => {
        const { headRow, bodyRow, footerRow, headRowExtra, bodyRowExtra, footerRowExtra } = this.createRow(
          item,
          index,
          from
        );
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

  updateData() {
    // this.plugins.forEach((plugin) => plugin.onUpdateData());
  }
  updateRows() {
    const rows = this.createRows();
    this.head = rows.headRows;
    this.body = rows.bodyRows;
    this.footer = rows.footerRows;
  }
  updateHeadRows() {
    const rows = this.createRows('head');
    this.head = rows.headRows;
  }
  updateBodyRows() {
    const rows = this.createRows('body');
    this.body = rows.bodyRows;
  }
  updateFooterRows() {
    const rows = this.createRows('footer');
    this.footer = rows.footerRows;
  }

  updateHeadRow() {
    const eventDatas = this.events.get('update:head-row');
    if (!eventDatas) return;
    for (const eventData of eventDatas) {
      const { position } = eventData;
      const row = this.head[position];
      if (!row) return;
      const { headRow, headRowExtra } = this.createRow(this.data[row.index], row.index, 'head');
      this.head[row.index] = { ...headRow, ...headRowExtra };
    }
  }
  updateBodyRow() {
    const eventDatas = this.events.get('update:body-row');
    if (!eventDatas) return;
    for (const eventData of eventDatas) {
      const { position } = eventData;
      const row = this.body[position];
      if (!row) return;
      const { bodyRow, bodyRowExtra } = this.createRow(this.data[row.index], row.index, 'body');
      this.body[row.index] = { ...bodyRow, ...bodyRowExtra };
    }
  }
  updateFooterRow() {
    const eventDatas = this.events.get('update:footer-row');
    if (!eventDatas) return;
    for (const eventData of eventDatas) {
      const { position } = eventData;
      const row = this.footer[position];
      if (!row) return;
      const { footerRow, footerRowExtra } = this.createRow(this.data[row.index], row.index, 'footer');
      this.footer[row.index] = { ...footerRow, ...footerRowExtra };
    }
  }

  updateHeadCell() {}
  updateBodyCell() {}
  updateFooterCell() {}

  process() {
    console.time('process');
    this.plugins.forEach((plugin) => plugin.beforeCreate());
    const when = this.compressEvents();
    if (when.shouldUpdateData) this.updateData();
    if (when.shouldUpdateRows) this.updateRows();

    if (!when.shouldUpdateRows && when.shouldUpdateHeadRows) this.updateHeadRows();
    if (!when.shouldUpdateRows && when.shouldUpdateBodyRows) this.updateBodyRows();
    if (!when.shouldUpdateRows && when.shouldUpdateFooterRows) this.updateFooterRows();

    if (when.shouldUpdateHeadRow) this.updateHeadRow();
    if (when.shouldUpdateBodyRow) this.updateBodyRow();
    if (when.shouldUpdateFooterRow) this.updateFooterRow();

    if (when.shouldUpdateHeadCell) this.updateHeadCell();
    if (when.shouldUpdateBodyCell) this.updateBodyCell();
    if (when.shouldUpdateFooterCell) this.updateFooterCell();
    this.plugins.forEach((plugin) => plugin.afterCreate());
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
class FilterPlugin<T> extends BoringPlugin {
  table: BoringTable<T[]>;
  param: string;
  initialData: T[];
  filteredData: T[];
  userFilter: (param: string, value: T) => boolean;
  constructor(filter: (param: string, value: T) => boolean) {
    super();
    this.userFilter = filter;
  }

  configure(table: GenericBoringTable) {
    this.table = table;
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
      this.filteredData = this.initialData;
      this.table.data = this.initialData;
      return;
    }
    this.filteredData = this.initialData.filter((item) => this.userFilter(this.param, item));
    this.table.data = this.filteredData;
  }

  extend() {
    return { filter: this.filter };
  }
}

class HiddenRowPlugin extends BoringPlugin {
  name = 'HiddenPlugin';
  values: Map<string, { hidden: boolean }> = new Map();
  table: BoringTable;

  configure(table: GenericBoringTable) {
    this.table = table;
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

  private toggleHead = (position: number, id: string, value?: boolean) => {
    this.toggle(id, value);
    this.table.dispatch('update:head-row', { position });
  };

  private toggleBody = (position: number, id: string, value?: boolean) => {
    this.toggle(id, value);
    this.table.dispatch('update:body-row', { position });
  };

  private toggleFooter = (position: number, id: string, value?: boolean) => {
    this.toggle(id, value);
    this.table.dispatch('update:footer-row', { position });
  };

  onCreateHeadRow(row: BoringTable['head'][number]) {
    if (!this.values.has(row.rawId)) this.values.set(row.rawId, { hidden: false });
    const hidden = this.values.get(row.rawId).hidden;
    return { hidden, toggleHidden: (value?: boolean) => this.toggleHead(row.index, row.rawId, value) };
  }

  onCreateBodyRow(row: BoringTable['body'][number]) {
    if (!this.values.has(row.rawId)) this.values.set(row.rawId, { hidden: false });
    const hidden = this.values.get(row.rawId).hidden;
    return { hidden, toggleHidden: (value?: boolean) => this.toggleBody(row.index, row.rawId, value) };
  }

  onCreateFooterRow(row: BoringTable['footer'][number]) {
    if (!this.values.has(row.rawId)) this.values.set(row.rawId, { hidden: false });
    const hidden = this.values.get(row.rawId).hidden;
    return { hidden, toggleHidden: (value?: boolean) => this.toggleFooter(row.index, row.rawId, value) };
  }
}
class CheckPlugin extends BoringPlugin {
  name = 'CheckPlugin';
  values: Map<string, { check: boolean }> = new Map();
  table: BoringTable;

  configure(table: GenericBoringTable) {
    this.table = table;
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
  };

  private toggleHead = (position: number, id: string, value?: boolean) => {
    this.toggle(id, value);
    this.table.dispatch('update:head-row', { position });
  };

  private toggleBody = (position: number, id: string, value?: boolean) => {
    this.toggle(id, value);
    this.table.dispatch('update:body-row', { position });
  };

  private toggleFooter = (position: number, id: string, value?: boolean) => {
    this.toggle(id, value);
    this.table.dispatch('update:footer-row', { position });
  };

  onCreateHeadRow(row: BoringTable['head'][number]) {
    if (!this.values.has(row.rawId)) this.values.set(row.rawId, { check: false });
    const check = this.values.get(row.rawId).check;
    return { check, toggleCheck: (value?: boolean) => this.toggleHead(row.index, row.rawId, value) };
  }
  onCreateHeadCell(cell: BoringTable['head'][number]['cells'][number]) {
    const id = `cell-${cell.index}-${cell.rawId}`;
    if (!this.values.has(id)) this.values.set(id, { check: false });
    const check = this.values.get(id).check;
    return { check, toggleCheck: (value?: boolean) => this.toggleHead(cell.rowIndex, id, value) };
  }

  onCreateBodyRow(row: BoringTable['body'][number]) {
    // console.log('onCreateBodyRow', row);
    if (!this.values.has(row.rawId)) this.values.set(row.rawId, { check: false });
    const check = this.values.get(row.rawId).check;
    return { check, toggleCheck: (value?: boolean) => this.toggleBody(row.index, row.rawId, value) };
  }
  onCreateBodyCell(cell: BoringTable['body'][number]['cells'][number]) {
    const id = `cell-${cell.index}-${cell.rawId}`;
    // console.log('onCreateBodyCell', cell);
    if (!this.values.has(id)) this.values.set(id, { check: false });
    const check = this.values.get(id).check;
    return { check, toggleCheck: (value?: boolean) => this.toggleBody(cell.rowIndex, id, value) };
  }

  onCreateFooterRow(row: BoringTable['footer'][number]) {
    if (!this.values.has(row.rawId)) this.values.set(row.rawId, { check: false });
    const check = this.values.get(row.rawId).check;
    return { check, toggleCheck: (value?: boolean) => this.toggleFooter(row.index, row.rawId, value) };
  }
  onCreateFooterCell(cell: BoringTable['footer'][number]['cells'][number]) {
    const id = `cell-${cell.index}-${cell.rawId}`;
    if (!this.values.has(id)) this.values.set(id, { check: false });
    const check = this.values.get(id).check;
    return { check, toggleCheck: (value?: boolean) => this.toggleFooter(cell.rowIndex, id, value) };
  }

  onReset() {
    this.values = new Map();
    this.table.dispatch('update:rows');
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

  configure(table: GenericBoringTable) {
    this.table = table;
    this.initialData = [...table.data];
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

type Data = { id: string; name: string; age: number };
const data: Data[] = [
  { id: '1', name: 'John', age: 30 },
  { id: '2', name: 'Mary', age: 20 },
];

const table = new BoringTable({
  data: data,
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
    new FilterPlugin<Data>((param, value) => value.name.includes(param)),
    new HiddenRowPlugin(),
    new CheckPlugin(),
    new ChangePlugin<Data>(),
  ],
});

setTimeout(async () => {
  table.process();
  // console.log('events', [...table.events.keys()]);
  await table.waitForUpdates();
  console.log('body', JSON.stringify(table.body, null, 2));
  // await table.body[0].change((prev) => ({ ...prev, age: 27 }));
  // table.reset();
  // table.extensions.filter('o');
  // table.body[0].toggleHidden();
  // console.log('events', [...table.events.keys()]);
  table.body[0].cells[0].toggleCheck();
  table.body[0].toggleCheck();
  await table.waitForUpdates();
  // console.log('events', [...table.events.keys()]);
  console.log('body', JSON.stringify(table.body, null, 2));
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
