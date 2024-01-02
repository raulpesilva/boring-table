import { BoringTable, GenericBoringTable } from '../core';
import { BoringPlugin } from './base';

export class CheckPlugin extends BoringPlugin {
  get name() {
    return 'check-plugin';
  }
  values: Map<string, { check: boolean }> = new Map();
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

  private toggle = (id: string, value?: boolean) => {
    if (value !== undefined) {
      const storedValue = this.values.get(id);
      this.values.set(id, { ...storedValue, check: value });
      return;
    }
    const storedValue = this.values.get(id);
    this.values.set(id, { ...storedValue, check: !storedValue?.check });
  };

  private toggleHead = (position: number, id: string, value?: boolean) => {
    this.toggle(id, value);
    this.table?.dispatch('update:head-row', { position });
  };

  private toggleBody = (position: number, id: string, value?: boolean) => {
    this.toggle(id, value);
    this.table?.dispatch('update:body-row', { position });
  };

  private toggleFooter = (position: number, id: string, value?: boolean) => {
    this.toggle(id, value);
    this.table?.dispatch('update:footer-row', { position });
  };

  onCreateHeadRow(row: BoringTable['head'][number]) {
    if (!this.values.has(row.rawId)) this.values.set(row.rawId, { check: false });
    const check = this.values.get(row.rawId)?.check;
    return { check, toggleCheck: (value?: boolean) => this.toggleHead(row.index, row.rawId, value) };
  }
  onCreateHeadCell(cell: BoringTable['head'][number]['cells'][number]) {
    const id = `cell-${cell.index}-${cell.rawId}`;
    if (!this.values.has(id)) this.values.set(id, { check: false });
    const check = this.values.get(id)?.check;
    return { check, toggleCheck: (value?: boolean) => this.toggleHead(cell.rowIndex, id, value) };
  }

  onCreateBodyRow(row: BoringTable['body'][number]) {
    // console.log('onCreateBodyRow', row);
    if (!this.values.has(row.rawId)) this.values.set(row.rawId, { check: false });
    const check = this.values.get(row.rawId)?.check;
    return { check, toggleCheck: (value?: boolean) => this.toggleBody(row.index, row.rawId, value) };
  }
  onCreateBodyCell(cell: BoringTable['body'][number]['cells'][number]) {
    const id = `cell-${cell.index}-${cell.rawId}`;
    // console.log('onCreateBodyCell', cell);
    if (!this.values.has(id)) this.values.set(id, { check: false });
    const check = this.values.get(id)?.check;
    return { check, toggleCheck: (value?: boolean) => this.toggleBody(cell.rowIndex, id, value) };
  }

  onCreateFooterRow(row: BoringTable['footer'][number]) {
    if (!this.values.has(row.rawId)) this.values.set(row.rawId, { check: false });
    const check = this.values.get(row.rawId)?.check;
    return { check, toggleCheck: (value?: boolean) => this.toggleFooter(row.index, row.rawId, value) };
  }
  onCreateFooterCell(cell: BoringTable['footer'][number]['cells'][number]) {
    const id = `cell-${cell.index}-${cell.rawId}`;
    if (!this.values.has(id)) this.values.set(id, { check: false });
    const check = this.values.get(id)?.check;
    return { check, toggleCheck: (value?: boolean) => this.toggleFooter(cell.rowIndex, id, value) };
  }

  onReset() {
    this.values = new Map();
    this.table?.dispatch('update:rows');
    return {};
  }
}
