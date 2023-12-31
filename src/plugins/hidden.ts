import { BoringTable, GenericBoringTable } from '../core';
import { BoringPlugin } from './base';

export class HiddenRowPlugin extends BoringPlugin {
  get name() {
    return 'hidden-row-plugin';
  }
  values: Map<string, { hidden: boolean }> = new Map();
  table: BoringTable;

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
      this.values.set(id, { ...storedValue, hidden: value });
      return;
    }
    const storedValue = this.values.get(id);
    this.values.set(id, { ...storedValue, hidden: !storedValue.hidden });
  };

  private toggleHead = (position: number, id: string, value?: boolean) => {
    this.toggle(id, value);
    this.table.dispatch('update:head-row', { position });
  };

  private toggleBody = (position: number, id: string, value?: boolean) => {
    this.toggle(id, value);
    this.table.dispatch('update:body-row', { position });
  };

  private toggleFooter = (position: number, id: string, value?: boolean) => {
    this.toggle(id, value);
    this.table.dispatch('update:footer-row', { position });
  };

  onCreateHeadRow(row: BoringTable['head'][number]) {
    if (!this.values.has(row.rawId)) this.values.set(row.rawId, { hidden: false });
    const hidden = this.values.get(row.rawId).hidden;
    return { hidden, toggleHidden: (value?: boolean) => this.toggleHead(row.index, row.rawId, value) };
  }

  onCreateBodyRow(row: BoringTable['body'][number]) {
    if (!this.values.has(row.rawId)) this.values.set(row.rawId, { hidden: false });
    const hidden = this.values.get(row.rawId).hidden;
    return { hidden, toggleHidden: (value?: boolean) => this.toggleBody(row.index, row.rawId, value) };
  }

  onCreateFooterRow(row: BoringTable['footer'][number]) {
    if (!this.values.has(row.rawId)) this.values.set(row.rawId, { hidden: false });
    const hidden = this.values.get(row.rawId).hidden;
    return { hidden, toggleHidden: (value?: boolean) => this.toggleFooter(row.index, row.rawId, value) };
  }
}
