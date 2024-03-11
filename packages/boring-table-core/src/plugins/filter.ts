import { BoringColumn, BoringTable } from '../core';
import { BoringPlugin, IBoringPlugin } from './base';

export class FilterPlugin<
  TData extends any[] = any,
  TCriteria extends any = any,
  const TPlugins extends IBoringPlugin[] = IBoringPlugin[],
  const TColumns extends BoringColumn<TData, TPlugins>[] = BoringColumn<TData, TPlugins>[]
> extends BoringPlugin {
  get name() {
    return 'filter-plugin';
  }
  priority = 0;
  table!: BoringTable;
  filterFn: (item: TData[number], criteria: TCriteria, row: any) => boolean;
  criteria: TCriteria;
  debounceTime: number;
  timeoutId: number | undefined;

  constructor(options: {
    initialValue: TCriteria;
    filter: (
      item: TData[number],
      criteria: TCriteria,
      row: BoringTable<TData, TPlugins, TColumns>['body'][number]
    ) => boolean;
    debounceTime?: number;
  }) {
    super();
    this.filterFn = options.filter;
    this.criteria = options.initialValue;
    this.debounceTime = options.debounceTime ?? 0;
  }

  configure(table: BoringTable) {
    this.table = table;
    return {};
  }

  afterCreateBodyRows() {
    this.table.dispatch('update:custom-body');
    return {};
  }

  onUpdateCustomBody() {
    this.table.customBody = this.table.customBody.filter((row) =>
      this.filterFn(this.table.data[row.index], this.criteria, row)
    );
  }

  onUpdateExtensions(extensions: BoringTable['extensions']): void {
    Object.assign(extensions, this.extend());
  }
  unwrapData(data: TCriteria | ((prev: TCriteria) => TCriteria), prev: TCriteria) {
    if (typeof data !== 'function') return data;
    return (data as (prev: TCriteria) => TCriteria)(prev);
  }

  filter(criteria: TCriteria | ((prev: TCriteria) => TCriteria)) {
    this.criteria = this.unwrapData(criteria, this.criteria);
    this.table.dispatch('update:extensions');
    const internal = () => this.table.dispatch('update:custom-body');
    if (this.debounceTime) {
      if (this.timeoutId) clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(internal, this.debounceTime);
      return;
    }
    internal();
  }

  extend() {
    return {
      filter: this.filter.bind(this),
      criteria: this.criteria,
    };
  }
}
