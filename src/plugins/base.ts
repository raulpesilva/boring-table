import type { BoringTable } from '../core';

export interface IBoringPlugin {
  name: string;
  configure: (table: BoringTable) => any;
  onUpdateData: () => any;
  onMount: () => any;
  onReset: () => any;
  extend: () => any;
  beforeCreate: () => any;
  afterCreate: () => any;
  onCreateHeadRow: (row: any) => any;
  onCreateHeadCell: (cell: any) => any;
  onCreateBodyRow: (row: any) => any;
  onCreateBodyCell: (cell: any) => any;
  onCreateFooterRow: (row: any) => any;
  onCreateFooterCell: (cell: any) => any;
}

export class BoringPlugin implements IBoringPlugin {
  name: string;
  configure(table: BoringTable) {
    return {};
  }

  onUpdateData() {}
  onMount() {
    return {};
  }
  onReset() {
    return {};
  }

  extend() {
    return {};
  }

  onCreateHeadRow(row: BoringTable['head'][number]) {
    return {};
  }
  onCreateHeadCell(row: BoringTable['head'][number]['cells'][number]) {
    return {};
  }

  onCreateBodyRow(row: BoringTable['body'][number]) {
    return {};
  }
  onCreateBodyCell(row: BoringTable['body'][number]['cells'][number]) {
    return {};
  }

  onCreateFooterRow(row: BoringTable['footer'][number]) {
    return {};
  }
  onCreateFooterCell(row: BoringTable['footer'][number]['cells'][number]) {
    return {};
  }

  beforeCreate() {}
  afterCreate() {}
}
