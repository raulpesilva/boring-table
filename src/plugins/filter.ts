import { BoringTable, GenericBoringTable } from '../core';
import { memo } from '../utils';
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

  configure(table: GenericBoringTable) {
    this.table = table;
    this.initialData = [...this.table.data];
    this.debug('Plugin configured');
    return {};
  }

  filter = (value: string) => {
    this.param = value;
    this.table?.dispatch('update:data');
  };

  action = () => {
    if (!this.param) {
      this.filteredData = this.initialData;
      if (this.table) this.table.data = this.initialData;
      return;
    }
    this.filteredData = this.initialData.filter((item) => this.userFilter(this.param, item));
    if (this.table) this.table.data = this.filteredData;
  };

  _beforeCreate = memo(this.action, [this.param]);

  extend() {
    return { filter: this.filter };
  }
}
