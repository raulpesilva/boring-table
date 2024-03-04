import { BoringTable, GenericBoringTable } from '../core';
import { BoringPlugin } from './base';

export class CheckPlugin extends BoringPlugin {
  get name() {
    return 'check-plugin';
  }
  rows: Set<any> = new Set();
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

  toggleCheck(row: BoringTable['head'][number], event: Parameters<BoringTable['dispatch']>[0]) {
    this.rows.add(row);
    row.check = !row.check;
    this.table?.dispatch(event);
  }

  toggleHead = (row: BoringTable['head'][number]) => this.toggleCheck(row, 'update:head-rows');
  toggleBody = (row: BoringTable['body'][number]) => this.toggleCheck(row, 'update:body-rows');
  toggleFooter = (row: BoringTable['footer'][number]) => this.toggleCheck(row, 'update:footer-rows');

  onCreateHeadRow(row: BoringTable['head'][number]) {
    row.check = !!row.check;
    row.toggleCheck = () => this.toggleHead(row);
    return {} as { check: boolean; toggleCheck: () => void };
  }
  onCreateBodyRow(row: BoringTable['body'][number]) {
    row.check = !!row.check;
    row.toggleCheck = () => this.toggleBody(row);
    return {} as { check: boolean; toggleCheck: () => void };
  }

  onCreateFooterRow(row: BoringTable['footer'][number]) {
    row.check = !!row.check;
    row.toggleCheck = () => this.toggleFooter(row);
    return {} as { check: boolean; toggleCheck: () => void };
  }

  // onCreateHeadCell(cell: BoringTable['head'][number]['cells'][number]) {
  //   return {
  //     check: this.cells?.[cell.rowIndex]?.[cell.index],
  //     toggleCheck: () => this.toggleCheckCell(cell.rowIndex, cell.index),
  //   };
  // }

  // onCreateBodyCell(cell: BoringTable['body'][number]['cells'][number]) {
  //   cell.check = !!this.columns?.[cell.rowIndex]?.[cell.index];

  //   // cell.toggleCheck = () => this.toggleCheckCell(cell.rowIndex, cell.index, 'update:body-cell');
  //   return {
  //     // check: !!this.columns?.[cell.rowIndex]?.[cell.index],
  //     // toggleCheck: this.toggleCheckCell.bind(this),
  //   };
  // }

  // onCreateFooterCell(cell: BoringTable['footer'][number]['cells'][number]) {
  //   return {
  //     check: this.cells?.[cell.rowIndex]?.[cell.index],
  //     toggleCheck: () => this.toggleCheckCell(cell.rowIndex, cell.index),
  //   };
  // }

  resetCheck() {
    this.rows.forEach((i) => (i.check = false));
    this.table?.dispatch('update:all');
  }
  extend() {
    return { resetCheck: () => this.resetCheck() };
  }
}
