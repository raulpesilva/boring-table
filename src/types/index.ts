import {
  BoringBody,
  BoringColumn,
  BoringFooter,
  BoringHead,
  BoringTable,
  BoringTableOptions,
  FooterColumn,
  HeaderColumn,
  ReturnMethodValue,
} from '../core';
import { BoringEvent, BoringEvents } from '../core/BoringEvents';

// TODO: criar extrator para headColumns e footerColumns
// TODO: arrumar outros tipos e retornos

export interface BoringTableType<
  TData extends any[],
  TPlugins extends any[] = any[],
  TColumns extends BoringColumn<TData, TPlugins>[] = BoringColumn<TData, TPlugins>[]
> {
  onChange: (table: BoringTable<TData, TPlugins, TColumns>) => void;
  getId: (arg: TData[number]) => string;

  columns: TColumns;
  headColumns: HeaderColumn<TColumns>[][];
  footerColumns: FooterColumn<TColumns>[][];

  plugins: TPlugins;
  config: ReturnMethodValue<TPlugins, 'configure'>;
  extensions: ReturnMethodValue<TPlugins, 'extend'>;
  events: BoringEvents;

  head: BoringHead<TColumns, TPlugins>[];
  body: BoringBody<TColumns, TPlugins>[];
  footer: BoringFooter<TColumns, TPlugins>[];

  new (options: BoringTableOptions<TData, TPlugins, TColumns>): this;

  setOnChange(cb: (table: BoringTable<TData, TPlugins, TColumns>) => void): void;
  dispatch<T extends keyof BoringEvent>(event: T, payload?: BoringEvent[T]): void;

  composeColumns: () => void;
  configure: () => void;
  process: () => void;
  reset: () => void;
  waitForUpdates: () => Promise<void>;
  onceUpdateFinish: (cb: () => void) => void;

  createBodyCell(
    item: TData[number],
    rowIndex: number,
    column: TColumns[number],
    index: number
  ): BoringBody<TColumns, TPlugins>['cells'][number];
  createBodyCells(item: TData[number], rowIndex: number): BoringBody<TColumns, TPlugins>['cells'];
  createBodyRow(item: TData[number], index: number): BoringBody<TColumns, TPlugins>;
  createBodyRows(): BoringBody<TColumns, TPlugins>[];

  createHeadCell(
    rowIndex: number,
    column: HeaderColumn<TColumns>,
    index: number
  ): BoringHead<TColumns, TPlugins>['cells'][number];
  createHeadCells(rowIndex: number): BoringHead<TColumns, TPlugins>['cells'];
  createHeadRow(rowIndex: number): BoringHead<TColumns, TPlugins>;
  createHeadRows(): BoringHead<TColumns, TPlugins>[];

  createFooterCell(
    rowIndex: number,
    column: FooterColumn<TColumns>,
    index: number
  ): BoringFooter<TColumns, TPlugins>['cells'][number];
  createFooterCells(rowIndex: number): BoringFooter<TColumns, TPlugins>['cells'];
  createFooterRow(rowIndex: number): BoringFooter<TColumns, TPlugins>;
  createFooterRows(): BoringFooter<TColumns, TPlugins>[];

  createAll: () => void;
  updatePlugins: () => void;
  updateConfig: () => void;
  updateExtensions: () => void;
  updateEvents: () => void;
  updateAll: () => void;
  updateData: () => void;
  updateRows: () => void;
  updateHeadCell: () => void;
  updateHeadRow: () => void;
  updateHeadRows: () => void;
  updateBodyCell: () => void;
  updateBodyRow: () => void;
  updateBodyRows: () => void;
  updateFooterCell: () => void;
  updateFooterRow: () => void;
  updateFooterRows: () => void;
}

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
