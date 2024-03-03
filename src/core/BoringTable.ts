import type { Except, Simplify, UnionToIntersection } from 'type-fest';
import { IBoringPlugin } from '../plugins/base';

if (!globalThis.queueMicrotask) globalThis.queueMicrotask = (cb: () => void) => Promise.resolve().then(cb);
const doNothing = () => ({});

// definir melhor os momentos e os eventos
// para cada momento definir evento para antes e depois
// e definir como trata-los

// TODO: criar header apenas passando pelas colunas
// hj ele passa por todas as linhas

const defaultUpdates = {
  updateRows: false,
  updateHeadRows: false,
  updateHeadRow: false,
  updateHeadCell: false,
  updateBodyRows: false,
  updateBodyRow: false,
  updateBodyCell: false,
  updateFooterRows: false,
  updateFooterRow: false,
  updateFooterCell: false,
  updateData: false,
  updateDataItem: false,
  updateColumns: false,
  updateColumn: false,
  updateEvents: false,
  updatePlugins: false,
  updateConfig: false,
  updateExtensions: false,
  updateAll: false,
};
interface UpdateEvents {
  'update:plugins': void;
  'update:config': void;
  'update:extensions': void;
  'update:all': void;
  'update:rows': void;
  'update:events': void;

  'update:data': void;
  'update:data-item': { position: number };

  'update:columns': void;
  'update:column': { position: number };

  'update:head-rows': void;
  'update:head-row': { position: number };
  'update:head-cell': { column: number; row: number };

  'update:body-rows': void;
  'update:body-row': { position: number };
  'update:body-cell': { column: number; row: number };

  'update:footer-rows': void;
  'update:footer-row': { position: number };
  'update:footer-cell': { column: number; row: number };
}

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

  events: MapEvents<UpdateEvents> = new Map();
  hasScheduledUpdate = false;

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
    this.data = data;
    this.columns = columns;
    this.getId = getId;
    if (plugins) this.plugins = plugins.sort((a, b) => b.priority - a.priority);
    this.configure();
    this.dispatch('update:all');
  }

  private compressEvents() {
    const updateRows = this.events.has('update:rows');

    const updateHeadRows = this.events.has('update:head-rows');
    const updateHeadRow = this.events.has('update:head-row');
    const updateHeadCell = this.events.has('update:head-cell');

    const updateBodyRows = this.events.has('update:body-rows');
    const updateBodyRow = this.events.has('update:body-row');
    const updateBodyCell = this.events.has('update:body-cell');

    const updateFooterRows = this.events.has('update:footer-rows');
    const updateFooterRow = this.events.has('update:footer-row');
    const updateFooterCell = this.events.has('update:footer-cell');

    const updateData = this.events.has('update:data');
    const updateDataItem = this.events.has('update:data-item');

    const updateColumns = this.events.has('update:columns');
    const updateColumn = this.events.has('update:column');

    const updateEvents = this.events.has('update:events');

    const updatePlugins = this.events.has('update:plugins');

    const updateConfig = this.events.has('update:config');

    const updateExtensions = this.events.has('update:extensions');

    const updateAll = this.events.has('update:all');

    const independentEvents = {
      updateExtensions,
      updateConfig,
    };

    if (updateAll || updateData || updatePlugins || updateColumns) {
      return { ...defaultUpdates, ...independentEvents, updateAll: true };
    }

    if (updateRows || (updateHeadRows && updateBodyRows && updateFooterRows)) {
      return { ...defaultUpdates, ...independentEvents, updateRows: true };
    }

    return {
      ...defaultUpdates,
      ...independentEvents,
      updateHeadRow,
      updateHeadCell,
      updateBodyRow,
      updateBodyCell,
      updateFooterRow,
      updateFooterCell,
      updateDataItem,
      updateColumn,
      updateEvents,
    };
  }

  upsetEvent<T extends keyof UpdateEvents>(event: T, payload?: UpdateEvents[T]) {
    if (this.events.has(event)) {
      this.events.get(event)?.push(payload);
      return;
    }
    this.events.set(event, [payload]);
  }

  dispatch<T extends keyof UpdateEvents>(event: T, payload?: UpdateEvents[T]) {
    this.upsetEvent(event, payload);
    if (!this.hasScheduledUpdate) {
      this.hasScheduledUpdate = true;
      queueMicrotask(() => {
        this.process();
        this.hasScheduledUpdate = false;
        this.events.clear();
      });
    }
  }

  configure() {
    this.config = this.plugins.reduce((acc, plugin) => ({ ...acc, ...plugin.configure(this) }), {} as any);
    this.extensions = this.plugins.reduce((acc, plugin) => ({ ...acc, ...plugin.extend() }), {} as any);
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
    if (column.body) cell.value = column.body(item, cell as any, this);

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

  updateData() {}
  updateRows() {
    this.body = this.createBodyRows();
  }

  updateHeadRows() {}
  updateBodyRows() {}
  updateFooterRows() {}

  updateHeadRow() {}
  updateBodyRow() {}
  updateFooterRow() {}

  updateHeadCell() {}
  updateBodyCell() {}
  updateFooterCell() {}

  process() {
    console.time('process');
    const when = this.compressEvents();
    console.log(Object.fromEntries(Object.entries(when).filter(([, v]) => v)));
    if (when.updateAll || when.updateData) this.updateData();
    if (when.updateAll || when.updateRows) this.updateRows();

    if (!when.updateRows && when.updateHeadRows) this.updateHeadRows();
    if (!when.updateRows && when.updateBodyRows) this.updateBodyRows();
    if (!when.updateRows && when.updateFooterRows) this.updateFooterRows();

    if (when.updateHeadRow) this.updateHeadRow();
    if (when.updateBodyRow) this.updateBodyRow();
    if (when.updateFooterRow) this.updateFooterRow();

    if (when.updateHeadCell) this.updateHeadCell();
    if (when.updateBodyCell) this.updateBodyCell();
    if (when.updateFooterCell) this.updateFooterCell();
    console.timeEnd('process');
    this.events.clear();
  }

  reset() {
    this.events.clear();
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

  onceUpdateFinish = (cb: () => void) => this.waitForUpdates().then(cb);
}

export type GenericBoringTable = BoringTable<any, IBoringPlugin[], Column<any>[]>;
