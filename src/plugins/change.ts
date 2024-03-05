import type { BoringTable, GenericBoringTable } from '../core';
import { BoringPlugin } from './base';

export class ChangePlugin<T> extends BoringPlugin {
  get name() {
    return 'change-plugin';
  }
  table?: BoringTable;
  initialData: T[] = [];

  constructor() {
    super();
    this.debug('Plugin initialized');
  }

  configure(table: GenericBoringTable) {
    this.table = table;
    this.initialData = [...table.data];
    this.debug('Plugin configured');
    return {};
  }

  changeData(position: number, data: BoringTable['data'][number]) {
    if (this.table) this.table.data[position] = data;
    this.table?.dispatch('update:data');
  }

  unwrapData(data: T | ((prev: T) => T), prev: T) {
    if (typeof data !== 'function') return data;
    return (data as (prev: T) => T)(prev);
  }

  change = (row: BoringTable['body'][number]) => {
    return async (data: T | ((prev: T) => T)) => {
      this.changeData(row.index, this.unwrapData(data, this.table?.data[row.index]));
      return await this.table?.waitForUpdates();
    };
  };
  onCreateBodyRow(row: BoringTable['body'][number]) {
    return { change: this.change(row) };
  }

  onReset() {
    if (this.table) this.table.data = this.initialData;
    this.table?.dispatch('update:data');
    return {};
  }
}
