import type { Except, Simplify, UnionToIntersection } from 'type-fest';
import { BoringPlugin, IBoringPlugin } from '../plugins/base';

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

export type GenericBoringTable = BoringTable<any, IBoringPlugin[], Column<any>[]>;
