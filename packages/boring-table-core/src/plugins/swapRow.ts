import { BoringTable } from '../core';
import { BoringPlugin } from './base';

export class SwapRowPlugin extends BoringPlugin {
  get name() {
    return 'swap-row';
  }

  table?: BoringTable;

  constructor() {
    super();
    throw new Error('Not implemented');
  }

  configure(table: BoringTable) {
    this.table = table;
    return {};
  }
}
