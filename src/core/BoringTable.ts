import type { Except, Simplify, UnionToIntersection } from 'type-fest';
import { IBoringPlugin } from '../plugins/base';

// definir melhor os momentos e os eventos
// para cada momento definir evento para antes e depois
// e definir como trata-los

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
interface Events {
  'update:rows': void;

  'update:head-rows': void;
  'update:head-row': { position: number };
  'update:head-cell': { column: number; row: number };

  'update:body-rows': void;
  'update:body-row': { position: number };
  'update:body-cell': { column: number; row: number };

  'update:footer-rows': void;
  'update:footer-row': { position: number };
  'update:footer-cell': { column: number; row: number };

  'update:data': void;
  'update:data-item': { position: number };

  'update:columns': void;
  'update:column': { position: number };

  'update:events': void;

  'update:plugins': void;

  'update:config': void;

  'update:extensions': void;

  'update:all': void;
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

type Column<TValue extends any, TPlugins extends IBoringPlugin[] = IBoringPlugin[]> = {
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

export class BoringTable<
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
    this.config = this.plugins.reduce((acc, plugin) => ({ ...acc, ...plugin.configure(this) }), {} as any);
    this.extensions = this.plugins.reduce((acc, plugin) => ({ ...acc, ...plugin.extend() }), {} as any);
  }

  createCell(
    item: TData[number],
    rowIndex: number,
    column: TColumn[number],
    index: number,
    from?: 'head' | 'body' | 'footer'
  ) {
    const rawId = this.getId(item);
    const id = `cell-${index}-${rawId}`;
    const baseCell = { id, rawId, index, rowIndex };

    const { headCellExtra, bodyCellExtra, footerCellExtra } = this.plugins.reduce(
      (acc, plugin) => {
        const callAll = from === undefined;
        const onCreateHeadCell = callAll || from === 'head' ? plugin.onCreateHeadCell.bind(plugin) : () => ({});
        const onCreateBodyCell = callAll || from === 'body' ? plugin.onCreateBodyCell.bind(plugin) : () => ({});
        const onCreateFooterCell = callAll || from === 'footer' ? plugin.onCreateFooterCell.bind(plugin) : () => ({});
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

    let headCell = null;
    if (column.head) {
      const value = column.head(item, { ...headCellExtra, ...baseCell } as any, this);
      headCell = { ...baseCell, value, ...headCellExtra };
    }

    let bodyCell = null;
    if (column.body) {
      const value = column.body(item, { ...bodyCellExtra, ...baseCell } as any, this);
      bodyCell = { ...baseCell, value, ...bodyCellExtra };
    }

    let footerCell = null;
    if (column.footer) {
      const value = column.footer(item, { ...footerCellExtra, ...baseCell } as any, this);
      footerCell = { ...baseCell, value, ...footerCellExtra };
    }

    return { headCell, bodyCell, footerCell };
  }

  createCells(item: TData[number], rowIndex: number, from?: 'head' | 'body' | 'footer') {
    const { headCells, bodyCells, footerCells } = this.columns.reduce(
      (acc: Record<string, any>, column, index) => {
        const { bodyCell, footerCell, headCell } = this.createCell(item, rowIndex, column, index, from);
        const headCells = [...acc.headCells];
        const bodyCells = [...acc.bodyCells];
        const footerCells = [...acc.footerCells];
        if (headCell) headCells.push(headCell);
        if (bodyCell) bodyCells.push(bodyCell);
        if (footerCell) footerCells.push(footerCell);
        return { headCells, bodyCells, footerCells };
      },
      { headCells: [], bodyCells: [], footerCells: [] }
    );
    return { headCells, bodyCells, footerCells };
  }

  createRow(item: TData[number], index: number, from?: 'head' | 'body' | 'footer') {
    const { headCells, bodyCells, footerCells } = this.createCells(item, index, from);
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
      type Row = ExtractRow<TColumn, TPlugins, 'head', 'onCreateFooterCell', 'onCreateFooterRow'>;
      if (this.head[row.index]) this.head[row.index] = { ...headRow, ...headRowExtra } as Row;
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
      type Row = ExtractRow<TColumn, TPlugins, 'body', 'onCreateFooterCell', 'onCreateFooterRow'>;
      if (this.body[row.index]) this.body[row.index] = { ...bodyRow, ...bodyRowExtra } as Row;
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
      type Row = ExtractRow<TColumn, TPlugins, 'footer', 'onCreateFooterCell', 'onCreateFooterRow'>;
      if (this.footer[row.index]) this.footer[row.index] = { ...footerRow, ...footerRowExtra } as Row;
    }
  }

  updateHeadCell() {
    const eventDatas = this.events.get('update:head-cell');
    if (!eventDatas) return;
    for (const eventData of eventDatas) {
      const column = this.columns[eventData.column];
      if (!column) return;
      const headRow = this.head[eventData.row];
      if (!headRow) return;
      if (!this.head[eventData.row]?.cells[eventData.column]) return;
      const cells = this.createCell(this.data[eventData.row], eventData.row, column, eventData.column, 'head');
      if (cells.headCell) headRow.cells[eventData.column] = cells.headCell;
    }
  }

  updateBodyCell() {
    const eventDatas = this.events.get('update:body-cell');
    if (!eventDatas) return;
    for (const eventData of eventDatas) {
      const column = this.columns[eventData.column];
      if (!column) return;
      const bodyRow = this.body[eventData.row];
      if (!bodyRow) return;
      if (!this.body[eventData.row]?.cells[eventData.column]) return;
      const cells = this.createCell(this.data[eventData.row], eventData.row, column, eventData.column, 'body');
      if (cells.bodyCell) bodyRow.cells[eventData.column] = cells.bodyCell;
    }
  }

  updateFooterCell() {
    const eventDatas = this.events.get('update:footer-cell');
    if (!eventDatas) return;
    for (const eventData of eventDatas) {
      const column = this.columns[eventData.column];
      if (!column) return;
      const footerRow = this.footer[eventData.row];
      if (!footerRow) return;
      if (!this.footer[eventData.row]?.cells[eventData.column]) return;
      const cells = this.createCell(this.data[eventData.row], eventData.row, column, eventData.column, 'footer');
      if (cells.footerCell) footerRow.cells[eventData.column] = cells.footerCell;
    }
  }

  process() {
    console.time('process');
    this.plugins.forEach((plugin) => plugin.beforeCreateRows(this.data));
    const when = this.compressEvents();
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
    this.plugins.forEach((plugin) => plugin.afterCreateRows(this.data));
    console.timeEnd('process');
    this.events.clear();
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

  syncAwait() {
    while (this.hasScheduledUpdate) {
      // do nothing
    }
  }
}

export type GenericBoringTable = BoringTable<any, IBoringPlugin[], Column<any>[]>;
