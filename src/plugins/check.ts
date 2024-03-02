import { BoringTable, GenericBoringTable } from '../core';
import { BoringPlugin } from './base';

export class CheckPlugin extends BoringPlugin {
  get name() {
    return 'check-plugin';
  }

  rows: { check: boolean }[] = [];
  columns: { check: boolean }[][] = [[]];
  table?: BoringTable;

  constructor() {
    super();
    this.debug('Plugin initialized');
  }

  configure(table: GenericBoringTable) {
    this.table = table;
    this.debug('Plugin configured');
    return {};
  }

  toggleCheckRow = (row: number, where: Parameters<BoringTable['dispatch']>[0]) => {
    if (this.rows[row] === undefined) this.rows[row] = { check: false };
    this.rows[row].check = !this.rows[row].check;
    this.table?.dispatch(where, { position: row });
  };

  toggleCheckCell = (row: number, column: number, where: Parameters<BoringTable['dispatch']>[0]) => {
    if (this.columns[row] === undefined) this.columns[row] = [];
    if (this.columns[row][column] === undefined) this.columns[row][column] = { check: false };
    this.columns[row][column].check = !this.columns[row][column].check;
    this.table?.dispatch(where, { column, row });
  };

  onCreateHeadRow(row: BoringTable['head'][number]) {
    return { check: !!this.rows[row.index], toggleCheck: () => this.toggleCheckRow(row.index, 'update:head-row') };
  }
  onCreateBodyRow(row: BoringTable['body'][number]) {
    return { check: !!this.rows[row.index], toggleCheck: () => this.toggleCheckRow(row.index, 'update:body-row') };
  }

  onCreateFooterRow(row: BoringTable['footer'][number]) {
    return { check: !!this.rows[row.index], toggleCheck: () => this.toggleCheckRow(row.index, 'update:footer-row') };
  }

  // onCreateHeadCell(cell: BoringTable['head'][number]['cells'][number]) {
  //   return {
  //     check: this.cells?.[cell.rowIndex]?.[cell.index],
  //     toggleCheck: () => this.toggleCheckCell(cell.rowIndex, cell.index),
  //   };
  // }

  onCreateBodyCell(cell: BoringTable['body'][number]['cells'][number]) {
    return {
      check: !!this.columns?.[cell.rowIndex]?.[cell.index],
      toggleCheck: () => this.toggleCheckCell(cell.rowIndex, cell.index, 'update:body-cell'),
    };
  }

  // onCreateFooterCell(cell: BoringTable['footer'][number]['cells'][number]) {
  //   return {
  //     check: this.cells?.[cell.rowIndex]?.[cell.index],
  //     toggleCheck: () => this.toggleCheckCell(cell.rowIndex, cell.index),
  //   };
  // }
}
