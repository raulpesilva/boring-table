import type { Except, Simplify, UnionToIntersection } from 'type-fest';
import { IBoringPlugin } from '../plugins/base';
import { BoringEvent, BoringEvents } from './BoringEvents';

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

type ExtractPluginMethod<T extends IBoringPlugin[], K extends keyof T[number]> = Extract<T[number], Record<K, any>>[K];
type ComposePluginMethod<T extends IBoringPlugin[], K extends keyof T[number]> = Simplify<
  UnionToIntersection<ReturnType<ExtractPluginMethod<T, K>> | { id: string }>
>;

export type Column<TValue extends any[], TPlugins extends IBoringPlugin[] = IBoringPlugin[]> = {
  type?: string;
  head:
    | ((extra: ComposePluginMethod<TPlugins, 'onCreateHeadCell'>, table: BoringTable<TValue, TPlugins>) => any)
    | ((extra: ComposePluginMethod<TPlugins, 'onCreateHeadCell'>, table: BoringTable<TValue, TPlugins>) => any)[];
  body: (
    arg: TValue,
    extra: ComposePluginMethod<TPlugins, 'onCreateBodyCell'>,
    table: BoringTable<TValue, TPlugins>
  ) => any;
  footer?:
    | ((extra: ComposePluginMethod<TPlugins, 'onCreateFooterCell'>, table: BoringTable<TValue, TPlugins>) => any)
    | ((extra: ComposePluginMethod<TPlugins, 'onCreateFooterCell'>, table: BoringTable<TValue, TPlugins>) => any)[];
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
    TPlugins extends never[] ? {} : UnionToIntersection<ReturnType<TPlugins[number][KCell]>>,
    TPlugins extends never[] ? {} : UnionToIntersection<ReturnType<TPlugins[number][KRow]>>
  >
>;

type ExtractColumnKey<TColumn extends Column<any, any>[], K extends keyof TColumn[number]> =
  | Extract<TColumn[number][K], Function>
  | Extract<TColumn[number][K], Function[]>[number];

export class BoringTable<
  TData extends any[] = any,
  const TPlugins extends IBoringPlugin[] = IBoringPlugin[],
  const TColumn extends Column<TData[number], TPlugins>[] = Column<TData[number], TPlugins>[]
> {
  data: TData;
  footerColumns: { type?: string; footer: ExtractColumnKey<TColumn, 'footer'> }[][] = [];
  headColumns: { type?: string; head: ExtractColumnKey<TColumn, 'head'> }[][] = [];
  columns: TColumn;
  getId: (arg: TData[number]) => string;

  events: BoringEvents;

  plugins: TPlugins = [] as any;
  config!: UnionToIntersection<ReturnType<TPlugins[number]['configure']>>;
  extensions!: UnionToIntersection<ReturnType<TPlugins[number]['extend']>>;

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
    this.composeColumns();
    this.configure();
    this.dispatch('event:mount');
    this.dispatch('create:all');
  }

  composeColumns() {
    for (let columnIndex = 0; columnIndex < this.columns.length; columnIndex++) {
      const column = this.columns[columnIndex];
      const { body: _, head, footer, ...rest } = column;

      if (!Array.isArray(footer) && !!footer) {
        if (!this.footerColumns[0]) this.footerColumns[0] = [];
        this.footerColumns[0].push({ ...rest, footer });
      }

      if (Array.isArray(footer)) {
        for (let i = 0; i < (footer.length ?? 0); i++) {
          if (!this.footerColumns[i]) this.footerColumns[i] = [];
          if (footer[i]) this.footerColumns[i].push({ ...rest, footer: footer[i] });
        }
      }

      if (!Array.isArray(head) && !!head) {
        if (!this.headColumns[0]) this.headColumns[0] = [];
        this.headColumns[0].push({ ...rest, head });
      }

      if (Array.isArray(head)) {
        for (let i = 0; i < (head.length ?? 0); i++) {
          if (!this.headColumns[i]) this.headColumns[i] = [];
          if (head[i]) this.headColumns[i].push({ ...rest, head: head[i] });
        }
      }
    }
  }

  dispatch<T extends keyof BoringEvent>(event: T, payload?: BoringEvent[T]) {
    this.events.dispatch(event, payload);
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
    this.body = rows;
    this.plugins.forEach((plugin) => plugin.afterCreateBodyRows(rows, this.data));
    return rows;
  }

  createHeadCell(rowIndex: number, column: (typeof this.headColumns)[number][number], columnIndex: number) {
    const rawId = `${columnIndex}`;
    const id = `cell-${rowIndex}-${columnIndex}`;
    const baseCell = { id, rawId, index: columnIndex, rowIndex, value: undefined };
    const cell = { ...baseCell };
    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      if (!!column) Object.assign(cell, plugin.onCreateHeadCell.bind(plugin)(cell));
    }
    type Value = (typeof this.head)[number]['cells'][number]['value'];
    if (column) cell.value = column.head(cell as Value, this);

    return cell;
  }
  createHeadCells(rowIndex: number) {
    const columns = this.headColumns[rowIndex];
    const cells: (typeof this.head)[number]['cells'] = [];
    for (let index = 0; index < columns.length; index++) {
      const column = columns[index];
      const cell = this.createHeadCell(rowIndex, column, index);
      cells.push(cell);
    }
    return cells;
  }
  createHeadRow(rowIndex: number) {
    const cells = this.createHeadCells(rowIndex);
    const rawId = `${rowIndex}`;
    const id = `row-${rowIndex}`;
    type Row = (typeof this.head)[number];
    const row = { id, rawId, index: rowIndex, cells } as Row;

    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      if (row.cells.length > 0) Object.assign(row, plugin.onCreateHeadRow.bind(plugin)(row));
    }

    return row;
  }
  createHeadRows() {
    this.plugins.forEach((plugin) => plugin.beforeCreateHeadRows(this.data));
    const rows: typeof this.head = [];

    for (let index = 0; index < this.headColumns.length; index++) {
      const row = this.createHeadRow(index);
      rows.push(row);
    }
    this.head = rows;
    this.plugins.forEach((plugin) => plugin.afterCreateHeadRows(this.data));
    return rows;
  }

  createFooterCell(rowIndex: number, column: (typeof this.footerColumns)[number][number], columnIndex: number) {
    const rawId = `${columnIndex}`;
    const id = `cell-${rowIndex}-${columnIndex}`;
    const baseCell = { id, rawId, index: columnIndex, rowIndex, value: undefined };
    const cell = { ...baseCell };
    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      if (!!column) Object.assign(cell, plugin.onCreateFooterCell.bind(plugin)(cell));
    }
    type Value = (typeof this.footer)[number]['cells'][number]['value'];
    if (column) cell.value = column.footer(cell as Value, this);

    return cell;
  }
  createFooterCells(rowIndex: number) {
    const cells: (typeof this.footer)[number]['cells'] = [];
    const columns = this.footerColumns[rowIndex];
    for (let index = 0; index < columns.length; index++) {
      const column = columns[index];
      const cell = this.createFooterCell(rowIndex, column, index);
      cells.push(cell);
    }

    return cells;
  }
  createFooterRow(rowIndex: number) {
    const cells = this.createFooterCells(rowIndex);
    const rawId = `${rowIndex}`;
    const id = `row-${rowIndex}`;
    type Row = (typeof this.footer)[number];
    const row = { id, rawId, index: rowIndex, cells } as Row;

    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      if (row.cells.length > 0) Object.assign(row, plugin.onCreateFooterRow.bind(plugin)(row));
    }

    return row;
  }
  createFooterRows() {
    this.plugins.forEach((plugin) => plugin.beforeCreateFooterRows(this.data));
    const rows: typeof this.footer = [];

    for (let index = 0; index < this.footerColumns.length; index++) {
      const row = this.createFooterRow(index);
      rows.push(row);
    }
    this.footer = rows;
    this.plugins.forEach((plugin) => plugin.afterCreateFooterRows(this.data));
    return rows;
  }

  configure() {
    this.config = this.plugins.reduce((acc, plugin) => ({ ...acc, ...plugin.configure(this) }), this.config);
    this.extensions = this.plugins.reduce((acc, plugin) => ({ ...acc, ...plugin.extend() }), this.extensions);
  }

  createAll() {
    this.createHeadRows();
    this.createBodyRows();
    this.createFooterRows();
  }

  updatePlugins() {
    this.plugins.forEach((plugin) => plugin.onUpdatePlugins(this.plugins));
  }
  updateConfig() {
    this.plugins.forEach((plugin) => plugin.onUpdateConfig(this.config));
  }
  updateExtensions() {
    this.plugins.forEach((plugin) => plugin.onUpdateExtensions(this.extensions));
  }
  updateEvents() {
    this.plugins.forEach((plugin) => plugin.onUpdateEvents(this.events));
  }

  updateAll() {
    this.updateData();
    this.updateRows();
  }
  updateData() {
    this.plugins.forEach((plugin) => plugin.onUpdateData(this.data));
    this.updateRows();
  }
  updateRows() {
    this.updateHeadRows();
    this.updateBodyRows();
    this.updateFooterRows();
  }

  updateHeadCell(rowIndex: number, column: number) {
    const cell = this.head[rowIndex].cells[column];
    this.plugins.forEach((plugin) => plugin.onUpdateHeadCell(cell));
    cell.value = this.headColumns[rowIndex][column].head(cell, this);
  }
  updateHeadRow(rowIndex: number) {
    const row = this.head[rowIndex];
    this.plugins.forEach((plugin) => plugin.onUpdateHeadRow(row));
    for (let index = 0; index < row.cells.length; index++) this.updateHeadCell(rowIndex, index);
  }
  updateHeadRows() {
    this.plugins.forEach((plugin) => plugin.onUpdateHeadRows(this.head));
    for (let index = 0; index < this.head.length; index++) this.updateHeadRow(index);
  }

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

  updateFooterCell(rowIndex: number, column: number) {
    const cell = this.footer[rowIndex].cells[column];
    this.plugins.forEach((plugin) => plugin.onUpdateFooterCell(cell));
    cell.value = this.footerColumns[rowIndex][column].footer(cell, this);
  }
  updateFooterRow(rowIndex: number) {
    const row = this.footer[rowIndex];
    this.plugins.forEach((plugin) => plugin.onUpdateFooterRow(row));
    for (let index = 0; index < row.cells.length; index++) this.updateFooterCell(rowIndex, index);
  }
  updateFooterRows() {
    this.plugins.forEach((plugin) => plugin.onUpdateFooterRows(this.footer));
    for (let index = 0; index < this.footer.length; index++) this.updateFooterRow(index);
  }

  process() {
    console.time('\x1B[34mprocess');
    console.log(this.events.events);
    if (this.events.has('event:mount')) this.plugins.forEach((plugin) => plugin.onMount());

    // TODO: adicionar os parâmetros de cada evento

    if (this.events.has('create:all')) this.createAll();

    if (this.events.has('create:head-rows')) this.createHeadRows();
    if (this.events.has('create:head-row')) {
      const events = this.events.get('create:head-row');
      events.forEach(({ rowIndex }) => this.createHeadRow(rowIndex));
    }
    if (this.events.has('create:head-cell')) {
      const events = this.events.get('create:head-cell');
      events.forEach(({ rowIndex, columnIndex }) =>
        this.createHeadCell(rowIndex, this.headColumns[rowIndex][columnIndex], columnIndex)
      );
    }
    if (this.events.has('create:body-rows')) this.createBodyRows();
    if (this.events.has('create:body-row')) {
      const events = this.events.get('create:body-row');
      events.forEach(({ rowIndex }) => this.createBodyRow(this.data[rowIndex], rowIndex));
    }
    if (this.events.has('create:body-cell')) {
      const events = this.events.get('create:body-cell');
      events.forEach(({ rowIndex, columnIndex }) =>
        this.createBodyCell(this.data[rowIndex], rowIndex, this.columns[columnIndex], columnIndex)
      );
    }

    if (this.events.has('create:footer-rows')) this.createFooterRows();
    if (this.events.has('create:footer-row')) {
      const events = this.events.get('create:footer-row');
      events.forEach(({ rowIndex }) => this.createFooterRow(rowIndex));
    }
    if (this.events.has('create:footer-cell')) {
      const events = this.events.get('create:footer-cell');
      events.forEach(({ rowIndex, columnIndex }) =>
        this.createFooterCell(rowIndex, this.footerColumns[rowIndex][columnIndex], columnIndex)
      );
    }

    if (this.events.has('update:plugins')) this.updatePlugins();
    if (this.events.has('update:all')) this.updateAll();
    if (this.events.has('update:data')) this.updateData();
    if (this.events.has('update:rows')) this.updateRows();

    if (this.events.has('update:head-rows')) this.updateHeadRows();
    if (this.events.has('update:head-row')) {
      const events = this.events.get('update:head-row');
      events.forEach(({ rowIndex }) => this.updateHeadRow(rowIndex));
    }
    if (this.events.has('update:head-cell')) {
      const events = this.events.get('update:head-cell');
      events.forEach(({ rowIndex, columnIndex }) => this.updateHeadCell(rowIndex, columnIndex));
    }

    if (this.events.has('update:body-rows')) this.updateBodyRows();
    if (this.events.has('update:body-row')) {
      const events = this.events.get('update:body-row');
      events.forEach(({ rowIndex }) => this.updateBodyRow(rowIndex));
    }
    if (this.events.has('update:body-cell')) {
      const events = this.events.get('update:body-cell');
      events.forEach(({ rowIndex, columnIndex }) => this.updateBodyCell(rowIndex, columnIndex));
    }

    if (this.events.has('update:footer-rows')) this.updateFooterRows();
    if (this.events.has('update:footer-row')) {
      const events = this.events.get('update:footer-row');
      events.forEach(({ rowIndex }) => this.updateFooterRow(rowIndex));
    }
    if (this.events.has('update:footer-cell')) {
      const events = this.events.get('update:footer-cell');
      events.forEach(({ rowIndex, columnIndex }) => this.updateFooterCell(rowIndex, columnIndex));
    }

    if (this.events.has('update:config')) this.updateConfig();
    if (this.events.has('update:extensions')) this.updateExtensions();
    if (this.events.has('update:events')) this.updateEvents();
    console.timeEnd('\x1B[34mprocess');
  }

  reset() {
    this.events.clear();
    this.plugins.forEach((plugin) => plugin.onReset());
    this.dispatch('create:all');
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
export type THead<T extends { head: any[] }> = T['head'];
export type TBody<T extends { body: any[] }> = T['body'];
export type TFooter<T extends { footer: any[] }> = T['footer'];

type TValues<T extends { cells: { value: any }[] }[]> = T[number]['cells'][number]['value'];

export type THeadValue<T extends { head: { cells: { value: any }[] }[] }> = TValues<T['head']>;
export type TBodyValue<T extends { body: { cells: { value: any }[] }[] }> = TValues<T['body']>;
export type TFooterValue<T extends { footer: { cells: { value: any }[] }[] }> = TValues<T['footer']>;

export type TConfig<T extends { config: any }> = T['config'];
export type TExtensions<T extends { extensions: any }> = T['extensions'];
export type TColumns<T extends { columns: any }> = T['columns'];
export type TData<T extends { data: any }> = T['data'];
export type TPlugins<T extends { plugins: any }> = T['plugins'];
