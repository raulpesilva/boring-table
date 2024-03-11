import { BoringTable } from '../core';
import { BoringPlugin } from './base';

// TODO: disparar evento para atualizar a extensão
export class RowSelectPlugin extends BoringPlugin {
  get name() {
    return 'row-select-plugin';
  }

  hadRows: Set<any> = new Set();
  bodyRows: Set<any> = new Set();
  footerRows: Set<any> = new Set();

  table?: BoringTable;

  get selectedRows(): BoringTable['body'] {
    return [...this.bodyRows].filter((i) => i.selected) ?? [];
  }

  constructor() {
    super();
    this.debug('Plugin initialized');
  }

  configure(table: BoringTable) {
    this.table = table;
    this.debug('Plugin configured');
    return {};
  }

  afterCreateBodyRows() {
    this.table?.dispatch('update:extensions');
  }

  toggleSelect(row: BoringTable['head' | 'body' | 'footer'][number], event: Parameters<BoringTable['dispatch']>[0]) {
    row.selected = !row.selected;
    this.table?.dispatch(event, { rowIndex: row.index });
  }

  toggleHead = (row: BoringTable['head'][number]) => {
    this.hadRows.add(row);
    this.toggleSelect(row, 'update:head-row');
  };
  toggleBody = (row: BoringTable['body'][number]) => {
    this.bodyRows.add(row);
    this.toggleSelect(row, 'update:body-row');
  };
  toggleFooter = (row: BoringTable['footer'][number]) => {
    this.footerRows.add(row);
    this.toggleSelect(row, 'update:footer-row');
  };

  onCreateHeadRow(row: BoringTable['head'][number]) {
    return { selected: !!row.selected, toggleSelect: () => this.toggleHead(row) };
  }
  onCreateBodyRow(row: BoringTable['body'][number]) {
    return { selected: !!row.selected, toggleSelect: () => this.toggleBody(row) };
  }
  onCreateFooterRow(row: BoringTable['footer'][number]) {
    return { selected: !!row.selected, toggleSelect: () => this.toggleFooter(row) };
  }

  resetSelections() {
    this.hadRows.forEach((i) => {
      i.selected = false;
      this.table?.dispatch('update:head-row', { rowIndex: i.index });
    });
    this.bodyRows.forEach((i) => {
      i.selected = false;
      this.table?.dispatch('update:body-row', { rowIndex: i.index });
    });
    this.footerRows.forEach((i) => {
      i.selected = false;
      this.table?.dispatch('update:footer-row', { rowIndex: i.index });
    });
  }

  onUpdateBodyRows() {
    this.table?.dispatch('update:extensions');
  }

  onUpdateExtensions(extensions: BoringTable['extensions']): void {
    Object.assign(extensions, this.extend());
  }

  extend() {
    return {
      resetSelections: () => this.resetSelections(),
      selectedRows: this.selectedRows,
      hasSelectedRows: this.bodyRows.size > 0,
      isAllSelected: this.table?.body.length === this.bodyRows.size && this.table?.body.length > 0,
    };
  }
}
