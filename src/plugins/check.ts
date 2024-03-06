import { BoringTable, GenericBoringTable } from '../core';
import { BoringPlugin } from './base';

export class CheckPlugin extends BoringPlugin {
  get name() {
    return 'check-plugin';
  }

  hadRows: Set<any> = new Set();
  bodyRows: Set<any> = new Set();
  footerRows: Set<any> = new Set();

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
    row.check = !row.check;
    this.table?.dispatch(event, { rowIndex: row.index });
  }

  toggleHead = (row: BoringTable['head'][number]) => {
    this.hadRows.add(row);
    this.toggleCheck(row, 'update:head-row');
  };
  toggleBody = (row: BoringTable['body'][number]) => {
    this.bodyRows.add(row);
    this.toggleCheck(row, 'update:body-row');
  };
  toggleFooter = (row: BoringTable['footer'][number]) => {
    this.footerRows.add(row);
    this.toggleCheck(row, 'update:footer-row');
  };

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

  onCreateHeadCell(cell: BoringTable['head'][number]['cells'][number]) {
    return {
      check: !!cell.check,
      toggleCheck: () => {},
    };
  }

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
    this.hadRows.forEach((i) => {
      i.check = false;
      this.table?.dispatch('update:head-row', { rowIndex: i.index });
    });
    this.bodyRows.forEach((i) => {
      i.check = false;
      this.table?.dispatch('update:body-row', { rowIndex: i.index });
    });
    this.footerRows.forEach((i) => {
      i.check = false;
      this.table?.dispatch('update:footer-row', { rowIndex: i.index });
    });
  }
  extend() {
    return { resetCheck: () => this.resetCheck() };
  }
}
