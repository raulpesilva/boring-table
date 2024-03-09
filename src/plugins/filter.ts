import { BoringTable } from '../core';
import { BoringPlugin } from './base';

export class FilterPlugin<T> extends BoringPlugin {
  get name() {
    return 'filter-plugin';
  }
  priority = 1;
  table?: BoringTable<T[]>;
  param: string = '';
  initialData: T[] = [];
  filteredData: T[] = [];
  userFilter: (param: string, value: T) => boolean;

  constructor(filter: (param: string, value: T) => boolean) {
    super();
    this.userFilter = filter;
    this.debug('Plugin initialized');
  }

  configure(table: BoringTable) {
    this.table = table;
    this.initialData = [...this.table.data];
    this.debug('Plugin configured');
    return {};
  }

  filter = (value: string) => {
    this.param = value;
    this.table?.dispatch('update:data');
  };

  extend() {
    return { filter: this.filter };
  }
}
