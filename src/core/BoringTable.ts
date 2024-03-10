import { BoringEvent, BoringEvents } from './BoringEvents';

export type UnionToIntersection<Union> = (Union extends unknown ? (distributedUnion: Union) => void : never) extends (
  mergedIntersection: infer Intersection
) => void
  ? Intersection & Union
  : never;
export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

interface BaseCell {
  id: string;
  rawId: string;
  index: number;
  rowIndex: number;
}

interface Cell<TData> extends BaseCell {
  value: TData;
}

interface BaseRow<TData extends any, TExtra extends Record<string, any>> {
  id: string;
  rawId: string;
  index: number;
  cells: Simplify<UnionToIntersection<Cell<TData> | TExtra>>[];
}

export type ArrayOrFunction<T> = T | T[];
export type UnwrapArray<T> = T extends (infer U)[] ? U : T;
export type ExtractMethod<T extends any[], K extends keyof T[number]> = UnwrapArray<
  Extract<T[number], Record<K, any>>[K]
>;
export type ReturnMethodValue<T extends any[], K extends keyof T[number]> = Simplify<ReturnType<ExtractMethod<T, K>>>;
export type ExtractExtra<T extends any[], K extends keyof T[number]> = UnionToIntersection<
  ReturnMethodValue<T, K> | BaseCell
>;

type CreateBodyCell<TData extends any[], TPlugins extends any[] = any[]> = (
  item: TData[number],
  extra: Simplify<UnionToIntersection<ReturnMethodValue<TPlugins, 'onCreateBodyCell'> | BaseCell>>,
  table: BoringTable<TData, TPlugins, any>
) => any;

type CreateHeadCell<TData extends any[], TPlugins extends any[] = any[]> = ArrayOrFunction<
  (extra: Simplify<ExtractExtra<TPlugins, 'onCreateHeadCell'>>, table: BoringTable<TData, TPlugins, any>) => any
>;

type CreateFooterCell<TData extends any[], TPlugins extends any[] = any[]> = ArrayOrFunction<
  (extra: Simplify<ExtractExtra<TPlugins, 'onCreateFooterCell'>>, table: BoringTable<TData, TPlugins, any>) => any
>;

export type BoringColumn<TData extends any[], TPlugins extends any[] = any[]> = {
  type?: string;
  head: CreateHeadCell<TData, TPlugins>;
  body: CreateBodyCell<TData, TPlugins>;
  footer?: CreateFooterCell<TData, TPlugins>;
};

export type BoringHead<TColumns extends any[], TPlugins extends any[] = any[]> = Simplify<
  UnionToIntersection<
    | BaseRow<ReturnMethodValue<TColumns, 'head'>, ReturnMethodValue<TPlugins, 'onCreateHeadCell'>>
    | ReturnMethodValue<TPlugins, 'onCreateHeadRow'>
  >
>;

export type BoringBody<TColumns extends any[], TPlugins extends any[] = any[]> = Simplify<
  UnionToIntersection<
    | BaseRow<ReturnMethodValue<TColumns, 'body'>, ReturnMethodValue<TPlugins, 'onCreateBodyCell'>>
    | ReturnMethodValue<TPlugins, 'onCreateBodyRow'>
  >
>;

export type BoringFooter<TColumns extends any[], TPlugins extends any[] = any[]> = Simplify<
  UnionToIntersection<
    | BaseRow<ReturnMethodValue<TColumns, 'footer'>, ReturnMethodValue<TPlugins, 'onCreateFooterCell'>>
    | ReturnMethodValue<TPlugins, 'onCreateFooterRow'>
  >
>;

type ExtractColumnKey<T extends any[], K extends keyof T[number]> =
  | Extract<T[number][K], Function>
  | Extract<T[number][K], Function[]>[number];

export type HeaderColumn<T extends any[]> = { type?: string; head: ExtractColumnKey<T, 'head'> };
export type FooterColumn<T extends any[]> = { type?: string; footer: ExtractColumnKey<T, 'footer'> };

export interface BoringTableOptions<
  TData extends any[],
  TPlugins extends any[] = any[],
  TColumns extends BoringColumn<TData, TPlugins>[] = BoringColumn<TData, TPlugins>[]
> {
  data: TData;
  columns: TColumns;
  plugins?: TPlugins;
  getId: (arg: TData[number]) => string;
}

export class BoringTable<
  TData extends any[] = any,
  TPlugins extends any[] = any[],
  TColumns extends BoringColumn<TData, TPlugins>[] = BoringColumn<TData, TPlugins>[]
> {
  numberOfUpdates = 0;
  onChange: () => void = () => {};
  getId: (arg: TData[number]) => string;

  data: TData = [] as unknown as TData;
  columns: TColumns;
  headColumns: HeaderColumn<TColumns>[][] = [];
  footerColumns: FooterColumn<TColumns>[][] = [];

  plugins: TPlugins = [] as unknown as TPlugins;
  config!: ReturnMethodValue<TPlugins, 'configure'>;
  extensions!: ReturnMethodValue<TPlugins, 'extend'>;
  events: BoringEvents;

  head: BoringHead<TColumns, TPlugins>[] = [];
  body: BoringBody<TColumns, TPlugins>[] = [];
  footer: BoringFooter<TColumns, TPlugins>[] = [];

  constructor(options: BoringTableOptions<TData, TPlugins, TColumns>) {
    this.data = options.data;
    this.getId = options.getId;
    this.columns = options.columns;
    this.events = new BoringEvents({
      process: this.process.bind(this),
      initialEvents: [
        ['event:mount', undefined],
        ['create:all', undefined],
      ],
    });
    if (options.plugins) this.plugins = options.plugins.sort((a, b) => b.priority - a.priority);
    this.composeColumns();
    this.configure();
    this.process();
    this.events.clear();
  }

  setOnChange(cb: () => void) {
    this.onChange = cb;
    return () => {
      this.onChange = () => {};
    };
  }
  dispatch<T extends keyof BoringEvent>(event: T, payload?: BoringEvent[T]) {
    this.events.dispatch(event, payload);
  }
  setData(data: TData) {
    this.data = data;
    this.dispatch('update:data');
    this.dispatch('create:body-rows');
  }
  setOptions(options: Partial<BoringTableOptions<TData, TPlugins, TColumns>>) {
    if (options.data) this.data = options.data;
    if (options.getId) this.getId = options.getId;
    if (options.columns) this.columns = options.columns;
    if (options.plugins) this.plugins = options.plugins;
    this.dispatch('create:all');
    this.composeColumns();
    this.configure();
    this.process();
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
  configure() {
    this.config = this.plugins.reduce((acc, plugin) => ({ ...acc, ...plugin.configure(this) }), this.config);
    this.extensions = this.plugins.reduce((acc, plugin) => ({ ...acc, ...plugin.extend() }), this.extensions);
  }
  process() {
    console.time('\x1B[34mprocess');
    console.log(...this.events.events.entries());
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
    this.numberOfUpdates++;
    this.onChange?.();
    console.timeEnd('\x1B[34mprocess');
    console.log('numberOfUpdates', this.numberOfUpdates);
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

  createBodyCell(
    item: TData[number],
    rowIndex: number,
    column: TColumns[number],
    index: number
  ): BoringBody<TColumns, TPlugins>['cells'][number] {
    const rawId = this.getId(item);
    const id = `cell-${index}-${rawId}`;
    const cell: BoringBody<TColumns, TPlugins>['cells'][number] = { id, rawId, index, rowIndex, value: undefined };

    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      if (!!column.body) Object.assign(cell, plugin.onCreateBodyCell.bind(plugin)(cell));
    }

    if (column.body) cell.value = column.body(item, cell, this);

    return cell;
  }
  createBodyCells(item: TData[number], rowIndex: number): BoringBody<TColumns, TPlugins>['cells'] {
    const cells = [] as BoringBody<TColumns, TPlugins>['cells'];
    for (let index = 0; index < this.columns.length; index++) {
      const column = this.columns[index];
      const cell = this.createBodyCell(item, rowIndex, column, index);
      cells.push(cell);
    }
    return cells;
  }
  createBodyRow(item: TData[number], index: number): BoringBody<TColumns, TPlugins> {
    const cells = this.createBodyCells(item, index);
    const rawId = this.getId(item);
    const id = `row-${index}-${rawId}`;
    const row = { id, rawId, index, cells } as BoringBody<TColumns, TPlugins>;

    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      if (row.cells.length > 0) Object.assign(row, plugin.onCreateBodyRow.bind(plugin)(row));
    }

    return row;
  }
  createBodyRows(): BoringBody<TColumns, TPlugins>[] {
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

  createHeadCell(
    rowIndex: number,
    column: HeaderColumn<TColumns>,
    index: number
  ): BoringHead<TColumns, TPlugins>['cells'][number] {
    const rawId = `${index}`;
    const id = `cell-${rowIndex}-${index}`;
    const cell: BoringHead<TColumns, TPlugins>['cells'][number] = { id, rawId, index, rowIndex, value: undefined };
    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      if (!!column) Object.assign(cell, plugin.onCreateHeadCell.bind(plugin)(cell));
    }
    if (column) cell.value = column.head(cell, this);

    return cell;
  }
  createHeadCells(rowIndex: number): BoringHead<TColumns, TPlugins>['cells'] {
    const columns = this.headColumns[rowIndex];
    const cells = [] as BoringHead<TColumns, TPlugins>['cells'];
    for (let index = 0; index < columns.length; index++) {
      const column = columns[index];
      const cell = this.createHeadCell(rowIndex, column, index);
      cells.push(cell);
    }
    return cells;
  }
  createHeadRow(rowIndex: number): BoringHead<TColumns, TPlugins> {
    const cells = this.createHeadCells(rowIndex);
    const rawId = `${rowIndex}`;
    const id = `row-${rowIndex}`;
    const row = { id, rawId, index: rowIndex, cells } as BoringHead<TColumns, TPlugins>;

    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      if (row.cells.length > 0) Object.assign(row, plugin.onCreateHeadRow.bind(plugin)(row));
    }

    return row;
  }
  createHeadRows(): BoringHead<TColumns, TPlugins>[] {
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

  createFooterCell(
    rowIndex: number,
    column: FooterColumn<TColumns>,
    index: number
  ): BoringFooter<TColumns, TPlugins>['cells'][number] {
    const rawId = `${index}`;
    const id = `cell-${rowIndex}-${index}`;
    const cell: BoringFooter<TColumns, TPlugins>['cells'][number] = { id, rawId, index, rowIndex, value: undefined };
    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      if (!!column) Object.assign(cell, plugin.onCreateFooterCell.bind(plugin)(cell));
    }
    if (column) cell.value = column.footer(cell, this);

    return cell;
  }
  createFooterCells(rowIndex: number): BoringFooter<TColumns, TPlugins>['cells'] {
    const cells = [] as BoringFooter<TColumns, TPlugins>['cells'];
    const columns = this.footerColumns[rowIndex];
    for (let index = 0; index < columns.length; index++) {
      const column = columns[index];
      const cell = this.createFooterCell(rowIndex, column, index);
      cells.push(cell);
    }

    return cells;
  }
  createFooterRow(rowIndex: number): BoringFooter<TColumns, TPlugins> {
    const cells = this.createFooterCells(rowIndex);
    const rawId = `${rowIndex}`;
    const id = `row-${rowIndex}`;
    const row = { id, rawId, index: rowIndex, cells } as BoringFooter<TColumns, TPlugins>;

    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      if (row.cells.length > 0) Object.assign(row, plugin.onCreateFooterRow.bind(plugin)(row));
    }

    return row;
  }
  createFooterRows(): BoringFooter<TColumns, TPlugins>[] {
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
}
