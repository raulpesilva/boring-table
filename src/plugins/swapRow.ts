import { BoringTable } from '../core';
import { BoringPlugin } from './base';

export class SwapRowPlugin extends BoringPlugin {
  get name() {
    return 'swap-row';
  }

  table?: BoringTable;

  configure(table: BoringTable) {
    this.table = table;
    return {};
  }

  onCreateBodyRow(row: BoringTable['body'][number]) {
    return {
      swap: (index: number) => {
        if (!this.table) return;
        const { body } = this.table;
        const target = body[index];
        const source = body[row.index];
        if (target) body[row.index] = target;
        if (source) body[index] = source;
        this.table.dispatch('update:body-rows');
        console.log('swap', index, row.index);
      },
    };
  }
}
