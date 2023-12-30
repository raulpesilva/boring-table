import { BoringTable, GenericBoringTable } from '../core';
import { BoringPlugin } from './base';

export class FilterPlugin<T> extends BoringPlugin {
  table: BoringTable<T[]>;
  param: string;
  initialData: T[];
  filteredData: T[];
  userFilter: (param: string, value: T) => boolean;
  constructor(filter: (param: string, value: T) => boolean) {
    super();
    this.userFilter = filter;
  }

  configure(table: GenericBoringTable) {
    this.table = table;
    this.initialData = [...this.table.data];
    return {};
  }

  filter = (value: string) => {
    this.param = value;
    this.table.dispatch('update:data');
  };

  beforeCreate(): void {
    if (!this.param) {
      this.filteredData = this.initialData;
      this.table.data = this.initialData;
      return;
    }
    this.filteredData = this.initialData.filter((item) => this.userFilter(this.param, item));
    this.table.data = this.filteredData;
  }

  extend() {
    return { filter: this.filter };
  }
}
