import type { Except, Simplify, UnionToIntersection } from 'type-fest';
// adicionar memo para evitar re-render desnecessário
// referencia: https://github.com/TanStack/table/blob/main/packages/table-core/src/core/table.ts
// _getDefaultColumnDef: usa o memo para evitar re-render desnecessário

const types = {
  CONFIGURE: 'CONFIGURE',

  BEFORE_CREATE: 'BEFORE_CREATE',
  ON_CREATE: 'ON_CREATE',
  AFTER_CREATE: 'AFTER_CREATE',

  BEFORE_UPDATE: 'BEFORE_UPDATE',
  ON_UPDATE: 'ON_UPDATE',
  AFTER_UPDATE: 'AFTER_UPDATE',

  BEFORE_DESTROY: 'BEFORE_DESTROY',
  ON_DESTROY: 'ON_DESTROY',
  AFTER_DESTROY: 'AFTER_DESTROY',
};

// interface BoringPlugin {
//   name: string;
//   configure?: (arg: BoringTable) => any;
//   onMount?: (arg: BoringTable) => any;
//   beforeCreate?: (arg: any[]) => any;
//   onCreateHeadRow?: (arg: any) => any;
//   onCreateHeadCell?: (arg: any) => any;
// }

interface IBoringPlugin {
  name: string;
  configure?: (arg: BoringTable) => any;
  onMount?: (arg: BoringTable) => any;
  onReset?: (arg: BoringTable) => any;
  onCreateHeadRow?: (row: any) => any;
  onCreateHeadCell?: (cell: any) => any;
  onCreateBodyRow?: (row: any) => any;
  onCreateBodyCell?: (cell: any) => any;
  onCreateFooterRow?: (row: any) => any;
  onCreateFooterCell?: (cell: any) => any;
}
class BoringPlugin implements IBoringPlugin {
  name: string;
  configure(arg: BoringTable) {
    return {};
  }
  onMount(arg: BoringTable) {
    return {};
  }
  onReset(arg: BoringTable) {
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
}

type CellBase<TCellValue> = { id: string; value: TCellValue };
type Cell<TCellValue, TCellExtra extends Record<string, any>> = Simplify<
  CellBase<TCellValue> & Except<TCellExtra, keyof CellBase<TCellValue>>
>;

type RowBase<TCellValue, TCellExtra> = { id: string; index: number; cells: Cell<TCellValue, TCellExtra>[] };
type Row<TCellValue, TCellExtra, TRowExtra extends Record<string, any>> = Simplify<
  RowBase<TCellValue, TCellExtra> & Except<TRowExtra, keyof RowBase<TCellValue, TCellExtra>>
>;

type Column<TValue extends any, TPlugins extends IBoringPlugin[] = BoringPlugin[]> = {
  type?: string;
  getId: (arg: TValue) => string;
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
  head: ExtractRow<TColumn, TPlugins, 'head', 'onCreateHeadCell', 'onCreateHeadRow'>[];
  body: ExtractRow<TColumn, TPlugins, 'body', 'onCreateBodyCell', 'onCreateBodyRow'>[];
  footer: ExtractRow<TColumn, TPlugins, 'footer', 'onCreateFooterCell', 'onCreateFooterRow'>[];

  plugins: TPlugins = [] as unknown as TPlugins;
  config: any;
  actions: Set<string> = new Set();
  private hasScheduledUpdate = false;

  dispatch(action: string) {
    this.actions.add(action);
    if (!this.hasScheduledUpdate) {
      this.hasScheduledUpdate = true;
      setTimeout(() => {
        this.process();
        this.hasScheduledUpdate = false;
      }, 0);
    }
  }

  constructor({ data, columns, plugins }: { data: TData; columns: TColumn; plugins: TPlugins }) {
    this.data = data;
    this.columns = columns;
    this.plugins = plugins;
    this.configure();
  }
  configure() {
    this.config = this.plugins.reduce((acc, plugin) => ({ ...acc, ...plugin.configure(this) }), {});
  }

  // provavelmente não precisa
  // V
  createHeadRow(id: string, index: number, cells: any[]) {
    return { id, index, cells };
  }
  createHeadCell(id: string, value: any) {
    return { id, value };
  }
  createBodyRow(id: string, index: number, cells: any[]) {
    return { id, index, cells };
  }
  createBodyCell(id: string, value: any) {
    return { id, value };
  }
  createFooterRow(id: string, index: number, cells: any[]) {
    return { id, index, cells };
  }
  createFooterCell(id: string, value: any) {
    return { id, value };
  }
  // até aqui da pra fazer inline
  // ^
  createCells(item: TData[number]) {
    const { headCells, bodyCells, footerCells } = this.columns.reduce(
      (acc, column, index) => {
        console.log({ item });
        const id = `cell-${index}-${column.getId(item)}`;
        const { headCellExtra, bodyCellExtra, footerCellExtra } = this.plugins.reduce(
          (acc, plugin) => {
            const headCellExtra = plugin.onCreateHeadCell({ ...acc.headCellExtra, id });
            const bodyCellExtra = plugin.onCreateBodyCell({ ...acc.bodyCellExtra, id });
            const footerCellExtra = plugin.onCreateFooterCell({ ...acc.footerCellExtra, id });
            return {
              headCellExtra: { ...acc.headCellExtra, ...headCellExtra },
              bodyCellExtra: { ...acc.bodyCellExtra, ...bodyCellExtra },
              footerCellExtra: { ...acc.footerCellExtra, ...footerCellExtra },
            };
          },
          { headCellExtra: {}, bodyCellExtra: {}, footerCellExtra: {} }
        );
        const headCell = this.createHeadCell(id, column.head(item, { ...headCellExtra, id }, this));
        const bodyCell = this.createBodyCell(id, column.body(item, { ...bodyCellExtra, id }, this));
        const footerCell = column?.footer
          ? this.createFooterCell(id, column.footer(item, { ...footerCellExtra, id }, this))
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
    const id = `row-${index}`;
    const headRow = this.createHeadRow(id, index, headCells);
    const bodyRow = this.createBodyRow(id, index, bodyCells);
    const footerRow = this.createFooterRow(id, index, footerCells);
    const { headRowExtra, bodyRowExtra, footerRowExtra } = this.plugins.reduce(
      (acc, plugin) => {
        const headRowExtra = plugin.onCreateHeadRow({ ...headRow, ...acc.headRowExtra });
        const bodyRowExtra = plugin.onCreateBodyRow({ ...bodyRow, ...acc.bodyRowExtra });
        const footerRowExtra = plugin.onCreateFooterRow({ ...footerRow, ...acc.footerRowExtra });
        return {
          headRowExtra: { ...acc.headRowExtra, ...headRowExtra },
          bodyRowExtra: { ...acc.bodyRowExtra, ...bodyRowExtra },
          footerRowExtra: { ...acc.footerRowExtra, ...footerRowExtra },
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
    console.time();
    const rows = this.createRows();
    this.head = rows.headRows;
    this.body = rows.bodyRows;
    this.footer = rows.footerRows;
    console.timeEnd();
  }

  reset() {
    // this.head = [];
    // this.body = [];
    // this.footer = [];
    // this.actions = new Set();
    this.plugins.forEach((plugin) => plugin.onReset(this));
  }
}
type GenericBoringTable = BoringTable<any, IBoringPlugin[], Column<any>[]>;
class FilterPlugin extends BoringPlugin {
  table: BoringTable<{ name: string }[]>;

  constructor() {
    super();
  }
  configure(arg: GenericBoringTable) {
    this.table = arg;
    return {};
  }

  onCreateHeadCell(row: BoringTable['head'][number]['cell'][number]) {
    const filter = (value: string): void => {
      this.table.data = this.table.data.filter((item) => item.name.includes(value));
    };
    return { filter };
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
    if (!this.values.has(row.id)) this.values.set(row.id, { hidden: false });
    const hidden = this.values.get(row.id).hidden;
    this.table.dispatch('update:head-row');
    return { hidden, toggleHidden: (value?: boolean) => this.toggle(row.id, value) };
  }

  onCreateBodyRow(row: BoringTable['body'][number]) {
    if (!this.values.has(row.id)) this.values.set(row.id, { hidden: false });
    const hidden = this.values.get(row.id).hidden;
    this.table.dispatch('update:body-row');
    return { hidden, toggleHidden: (value?: boolean) => this.toggle(row.id, value) };
  }

  onCreateFooterRow(row: BoringTable['footer'][number]) {
    if (!this.values.has(row.id)) this.values.set(row.id, { hidden: false });
    const hidden = this.values.get(row.id).hidden;
    this.table.dispatch('update:footer-row');
    return { hidden, toggleHidden: (value?: boolean) => this.toggle(row.id, value) };
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
  };

  onCreateHeadRow(row: BoringTable['head'][number]) {
    if (!this.values.has(row.id)) this.values.set(row.id, { check: false });
    const check = this.values.get(row.id).check;
    this.table.dispatch('update:head-row');
    return { check, toggleCheck: (value?: boolean) => this.toggle(row.id, value) };
  }

  onCreateHeadCell(cell: BoringTable['head'][number]['cell'][number]) {
    if (!this.values.has(cell.id)) this.values.set(cell.id, { check: false });
    const check = this.values.get(cell.id).check;
    this.table.dispatch('update:head-cell');
    return { check, toggleCheck: (value?: boolean) => this.toggle(cell.id, value) };
  }

  onCreateBodyRow(row: BoringTable['body'][number]) {
    if (!this.values.has(row.id)) this.values.set(row.id, { check: false });
    const check = this.values.get(row.id).check;
    this.table.dispatch('update:body-row');
    return { check, toggleCheck: (value?: boolean) => this.toggle(row.id, value) };
  }

  onCreateBodyCell(cell: BoringTable['body'][number]['cell'][number]) {
    if (!this.values.has(cell.id)) this.values.set(cell.id, { check: false });
    const check = this.values.get(cell.id).check;
    this.table.dispatch('update:body-cell');
    return { check, toggleCheck: (value?: boolean) => this.toggle(cell.id, value) };
  }

  onCreateFooterRow(row: BoringTable['footer'][number]) {
    if (!this.values.has(row.id)) this.values.set(row.id, { check: false });
    const check = this.values.get(row.id).check;
    this.table.dispatch('update:footer-row');
    return { check, toggleCheck: (value?: boolean) => this.toggle(row.id, value) };
  }
  onCreateFooterCell(cell: BoringTable['footer'][number]['cell'][number]) {
    if (!this.values.has(cell.id)) this.values.set(cell.id, { check: false });
    const check = this.values.get(cell.id).check;
    this.table.dispatch('update:footer-cell');
    return { check, toggleCheck: (value?: boolean) => this.toggle(cell.id, value) };
  }

  onReset(arg: GenericBoringTable) {
    this.values = new Map();
    this.table.dispatch('update:head-row');
    this.table.dispatch('update:body-row');
    this.table.dispatch('update:footer-row');
    return {};
  }
}

class ChangePlugin extends BoringPlugin {
  table: BoringTable;
  initialData: any[];

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
  unwrapData<T>(data: T | ((prev: T) => T), prev: T) {
    if (typeof data !== 'function') return data;
    return (data as (prev: T) => T)(prev);
  }

  change<T>(row: BoringTable['body'][number]): (data: T) => void;
  change<T>(row: BoringTable['body'][number]): (setter: (prev: T) => T) => void;
  change<T>(row: BoringTable['body'][number]) {
    return (data: T | ((prev: T) => T)) =>
      this.changeData(row.index, this.unwrapData(data, this.table.data[row.index]));
  }
  onCreateBodyRow(row: BoringTable['body'][number]) {
    return { change: this.change(row) };
  }

  onReset(arg: GenericBoringTable) {
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
  columns: [
    {
      type: 'name1',
      getId: (arg) => arg.id,
      head: (arg, e, t) => arg.name,
      body: (arg, e) => (e.check ? arg.age : arg.name),
    },
    // {
    //   type: 'name2',
    //   getId: (arg) => arg.name,
    //   head: (arg) => arg.age,
    //   body: (arg) => arg,
    // },
    // {
    //   getId: (arg) => arg.name,
    //   head: (arg) => arg.age,
    //   body: (arg) => arg.age,
    // },
  ],
  plugins: [new HiddenPlugin(), new CheckPlugin(), new FilterPlugin(), new ChangePlugin()],
});
console.log('---');
// console.log('before', table);
console.log('---');
table.process();
// console.log('after', table);
// table.head[0].cells[0].filter('John');
table.body[0].cells[0].toggleCheck();
console.log(table.data);
table.body[0].change((prev) => ({ ...prev, age: 27 }));
table.reset();
setTimeout(() => {
  console.log(table.data);
  console.log('head', JSON.stringify(table.head, null, 2));
  console.log('body', JSON.stringify(table.body, null, 2));
  console.log('footer', JSON.stringify(table.footer, null, 2));
}, 1);
type HeadType = typeof table.head;
//   ^?
type BodyType = typeof table.body;
//   ^?
type FooterType = typeof table.footer;
//   ^?
