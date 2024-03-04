import type { Except, Simplify, UnionToIntersection } from 'type-fest';
import { IBoringPlugin } from '../plugins/base';
import { BoringEvent, BoringEvents } from './BoringEvents';

if (!globalThis.queueMicrotask) globalThis.queueMicrotask = (cb: () => void) => Promise.resolve().then(cb);
const doNothing = () => ({});

// definir melhor os momentos e os eventos
// para cada momento definir evento para antes e depois
// e definir como trata-los

// TODO: criar header apenas passando pelas colunas
// hj ele passa por todas as linhas

type CellBase<TCellValue> = { id: string; rawId: string; index: number; rowIndex: number; value: TCellValue };
type Cell<TCellValue, TCellExtra extends Record<string, any>> = Simplify<
  CellBase<TCellValue> & Except<TCellExtra, keyof CellBase<TCellValue>>
>;

type RowBase<TCellValue, TCellExtra extends Record<string, any>> = {
  id: string;
  rawId: string;
  index: number;
  cells: Cell<TCellValue, TCellExtra>[];
};

type Row<TCellValue, TCellExtra extends Record<string, any>, TRowExtra extends Record<string, any>> = Simplify<
  RowBase<TCellValue, TCellExtra> & Except<TRowExtra, keyof RowBase<TCellValue, TCellExtra>>
>;

type Column<TValue extends any[], TPlugins extends IBoringPlugin[] = IBoringPlugin[]> = {
  type?: string;
  head:
    | ((
        extra: Simplify<UnionToIntersection<ReturnType<TPlugins[number]['onCreateHeadCell']>> & { id: string }>,
        table: BoringTable<TValue, TPlugins>
      ) => any)
    | ((
        extra: Simplify<UnionToIntersection<ReturnType<TPlugins[number]['onCreateHeadCell']>> & { id: string }>,
        table: BoringTable<TValue, TPlugins>
      ) => any)[];
  body: (
    arg: TValue,
    extra: Simplify<UnionToIntersection<ReturnType<TPlugins[number]['onCreateBodyCell']>> & { id: string }>,
    table: BoringTable<TValue, TPlugins>
  ) => any;
  footer?:
    | ((
        extra: Simplify<UnionToIntersection<ReturnType<TPlugins[number]['onCreateFooterCell']>> & { id: string }>,
        table: BoringTable<TValue, TPlugins>
      ) => any)
    | ((
        extra: Simplify<UnionToIntersection<ReturnType<TPlugins[number]['onCreateFooterCell']>> & { id: string }>,
        table: BoringTable<TValue, TPlugins>
      ) => any)[];
};

type ExtractColumn<
  TColumn extends Record<string, any>[],
  key extends keyof TColumn[number]
> = TColumn extends (infer T)[] ? (T extends Record<key, any> ? T : never) : never;

type ExtractRow<
  TColumn extends Record<string, any>[],
  TPlugins extends Record<string, any>[],
  KColumns extends keyof TColumn[number],
  KCell extends keyof TPlugins[number],
  KRow extends keyof TPlugins[number]
> = Simplify<
  Row<
    ReturnType<
      | Extract<ExtractColumn<TColumn, KColumns>[KColumns], Function>
      | Extract<ExtractColumn<TColumn, KColumns>[KColumns], Function[]>[number]
    >,
    UnionToIntersection<ReturnType<TPlugins[number][KCell]>>,
    UnionToIntersection<ReturnType<TPlugins[number][KRow]>>
  >
>;

type MapEvents<T extends Record<string, any>> = Map<keyof T, T[keyof T][] | undefined>;
export class BoringTable<
  TData extends any[] = any,
  const TPlugins extends IBoringPlugin[] = IBoringPlugin[],
  const TColumn extends Column<TData[number], TPlugins>[] = Column<TData[number], TPlugins>[]
> {
  data: TData;
  columns: TColumn;
  getId: (arg: TData[number]) => string;

  events: BoringEvents;

  plugins: IBoringPlugin[] = [];
  config: UnionToIntersection<ReturnType<TPlugins[number]['configure']>> = {} as any;
  extensions: UnionToIntersection<ReturnType<TPlugins[number]['extend']>> = {} as any;

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
    this.events = new BoringEvents({ process: this.process.bind(this) });
    this.data = data;
    this.columns = columns;
    this.getId = getId;
    if (plugins) this.plugins = plugins.sort((a, b) => b.priority - a.priority);
    this.configure();
    this.dispatch('event:mount');
    this.dispatch('create:all');
  }

  dispatch<T extends keyof BoringEvent>(event: T, payload?: BoringEvent[T]) {
    this.events.dispatch(event, payload);
  }

  configure() {
    this.config = this.plugins.reduce((acc, plugin) => ({ ...acc, ...plugin.configure(this) }), {} as any);
    this.extensions = this.plugins.reduce((acc, plugin) => ({ ...acc, ...plugin.extend() }), {} as any);
  }

  createAll() {
    // this.head = this.createHeadRows();
    this.body = this.createBodyRows();
    // this.footer = this.createFooterRows();
  }

  createBodyCell(item: TData[number], rowIndex: number, column: TColumn[number], index: number) {
    const rawId = this.getId(item);
    const id = `cell-${index}-${rawId}`;
    const baseCell = { id, rawId, index, rowIndex, value: undefined };
    const cell = { ...baseCell };

    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      if (!!column.body) Object.assign(cell, plugin.onCreateBodyCell.bind(plugin)(cell));
    }

    type value = (typeof this.body)[number]['cells'][number]['value'];
    if (column.body) cell.value = column.body(item, cell as value, this);

    return cell;
  }

  createBodyCells(item: TData[number], rowIndex: number) {
    type Cells = (typeof this.body)[number]['cells'];
    const cells: Cells = [];
    for (let index = 0; index < this.columns.length; index++) {
      const column = this.columns[index];
      const cell = this.createBodyCell(item, rowIndex, column, index);
      cells.push(cell);
    }
    return cells;
  }

  createBodyRow(item: TData[number], index: number) {
    const cells = this.createBodyCells(item, index);
    const rawId = this.getId(item);
    const id = `row-${index}-${rawId}`;
    type Row = (typeof this.body)[number];
    const row = { id, rawId, index, cells } as Row;

    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      if (row.cells.length > 0) Object.assign(row, plugin.onCreateBodyRow.bind(plugin)(row));
    }

    return row;
  }

  createBodyRows() {
    this.plugins.forEach((plugin) => plugin.beforeCreateBodyRows(this.data));
    const rows: typeof this.body = [];
    for (let index = 0; index < this.data.length; index++) {
      const item = this.data[index];
      const row = this.createBodyRow(item, index);
      if (row) rows.push(row);
    }
    this.plugins.forEach((plugin) => plugin.afterCreateBodyRows(this.data));

    return rows;
  }

  createHeadCell() {}
  createHeadCells() {}
  createHeadRow() {}
  createHeadRows() {
    this.plugins.forEach((plugin) => plugin.beforeCreateHeadRows(this.data));
    // implementation
    this.plugins.forEach((plugin) => plugin.afterCreateHeadRows(this.data));
  }

  createFooterCell() {}
  createFooterCells() {}
  createFooterRow() {}
  createFooterRows() {
    this.plugins.forEach((plugin) => plugin.beforeCreateFooterRows(this.data));
    // implementation
    this.plugins.forEach((plugin) => plugin.afterCreateFooterRows(this.data));
  }
  updateAll() {}
  updateData() {}
  updateRows() {}

  updateHeadCell() {
    // const cell = this.head[rowIndex].cells[column];
    // this.plugins.forEach((plugin) => plugin.onUpdateHeadCell(cell));
    // cell.value = this.columns[column].head(cell, this);
  }
  updateHeadRow() {}
  updateHeadRows() {}

  updateBodyCell(rowIndex: number, column: number) {
    const cell = this.body[rowIndex].cells[column];
    this.plugins.forEach((plugin) => plugin.onUpdateBodyCell(cell));
    cell.value = this.columns[column].body(this.data[rowIndex], cell, this);
  }
  updateBodyRow(rowIndex: number) {
    const row = this.body[rowIndex];
    this.plugins.forEach((plugin) => plugin.onUpdateBodyRow(row));
    for (let index = 0; index < row.cells.length; index++) this.updateBodyCell(rowIndex, index);
  }
  updateBodyRows() {
    this.plugins.forEach((plugin) => plugin.onUpdateBodyRows(this.body));
    for (let index = 0; index < this.body.length; index++) this.updateBodyRow(index);
  }

  updateFooterCell() {}
  updateFooterRow() {}
  updateFooterRows() {}

  process() {
    console.time('process');
    console.log(this.events.events);
    if (this.events.has('event:mount')) this.plugins.forEach((plugin) => plugin.onMount());

    if (this.events.has('create:all')) this.createAll();
    if (this.events.has('create:head-rows')) this.createHeadRows();
    if (this.events.has('create:body-rows')) this.createBodyRows();
    if (this.events.has('create:footer-rows')) this.createFooterRows();

    if (this.events.has('update:all')) this.updateAll();
    if (this.events.has('update:data')) this.updateData();
    if (this.events.has('update:rows')) this.updateRows();
    if (this.events.has('update:head-rows')) this.updateHeadRows();
    if (this.events.has('update:body-rows')) this.updateBodyRows();
    if (this.events.has('update:footer-rows')) this.updateFooterRows();
    if (this.events.has('update:head-row')) this.updateHeadRow();
    if (this.events.has('update:body-row')) this.updateBodyRow(1);
    if (this.events.has('update:footer-row')) this.updateFooterRow();
    if (this.events.has('update:head-cell')) this.updateHeadCell();
    if (this.events.has('update:body-cell')) this.updateBodyCell(1, 2);
    if (this.events.has('update:footer-cell')) this.updateFooterCell();
    console.timeEnd('process');
  }

  reset() {
    this.events.clear();
    this.plugins.forEach((plugin) => plugin.onReset());
    this.process();
  }

  waitForUpdates() {
    return new Promise((resolve) => {
      const id = setInterval(() => {
        if (!this.events.hasScheduledUpdate) {
          clearInterval(id);
          resolve(undefined);
        }
      }, 0);
    });
  }

  onceUpdateFinish = (cb: () => void) => this.waitForUpdates().then(cb);
}

export type GenericBoringTable = BoringTable<any, IBoringPlugin[], Column<any>[]>;
