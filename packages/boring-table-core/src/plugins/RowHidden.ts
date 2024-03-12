import { BoringTable } from '../core';
import { BASE_PRIORITIES, BoringPlugin } from './base';

export class HiddenRowPlugin extends BoringPlugin {
  get name() {
    return 'hidden-row-plugin';
  }
  priority = BASE_PRIORITIES.DEFAULT;
  table?: BoringTable;

  hiddenRows: Map<string, BoringTable['body'][number]> = new Map();
  isAllHidden = false;
  hasHidden = false;

  constructor() {
    super();
    this.debug('Plugin initialized');
  }

  configure(table: BoringTable) {
    this.table = table;
    this.debug('Plugin configured');
    return {};
  }

  updateUtils(ignoreEvent?: boolean) {
    if (this.hasHidden !== this.hiddenRows.size > 0) {
      this.hasHidden = this.hiddenRows.size > 0;
      if (!ignoreEvent) this.table?.dispatch('update:head-rows');
    }
    if (this.isAllHidden !== (this.hiddenRows.size >= (this.table?.body.length ?? 0) && this.hasHidden)) {
      this.isAllHidden = this.hiddenRows.size >= (this.table?.body.length ?? 0) && this.hasHidden;
      if (!ignoreEvent) this.table?.dispatch('update:head-rows');
    }
  }

  toggleBody = (row: BoringTable['body'][number], value?: boolean, ignoreEvent?: boolean) => {
    row.hidden = value ?? !row.hidden;
    if (row.hidden) this.hiddenRows.set(row.rawId, row);
    if (!row.hidden) this.hiddenRows.delete(row.rawId);
    if (!ignoreEvent) this.table?.dispatch('update:body-row', { rowIndex: row.index });
    this.updateUtils(ignoreEvent);
    if (!ignoreEvent) this.table?.dispatch('update:extensions');
  };

  afterCreateBodyRows(rows: BoringTable['body']) {
    const hiddenRows = new Map(this.hiddenRows);
    this.hiddenRows.clear();
    rows.forEach((row) => this.toggleBody(row, hiddenRows.has(row.rawId), true));
    this.updateUtils(true);
    this.table?.dispatch('update:body-rows');
    this.table?.dispatch('update:head-rows');
    this.table?.dispatch('update:extensions');
  }

  resetHidden() {
    this.hiddenRows.clear();
    this.table?.body.forEach((row) => (row.hidden = false));
    this.updateUtils(true);
    this.table?.dispatch('update:body-rows');
    this.table?.dispatch('update:head-rows');
    this.table?.dispatch('update:extensions');
  }

  hiddenAll() {
    this.table?.body.forEach((row) => this.toggleBody(row, true, true));
    this.table?.dispatch('update:body-rows');
    this.table?.dispatch('update:head-rows');
    this.table?.dispatch('update:extensions');
  }

  onCreateHeadRow() {
    return {
      isAllHidden: this.isAllHidden,
      hasHidden: this.hasHidden,
      resetHidden: this.resetHidden.bind(this),
      hiddenAll: this.hiddenAll.bind(this),
    };
  }

  onCreateBodyRow(row: BoringTable['body'][number]) {
    row.hidden = this.hiddenRows.has(row.rawId);
    return { hidden: !!row.hidden, toggleHidden: (value?: boolean) => this.toggleBody(row, value) };
  }

  onUpdateHeadRows(rows: BoringTable['head']) {
    rows.forEach((row) => {
      row.isAllHidden = this.isAllHidden;
      row.hasHidden = this.hasHidden;
    });
  }

  onUpdateExtensions(extensions: BoringTable['extensions']): void {
    Object.assign(extensions, this.extend());
  }

  extend() {
    const body = this.table?.body ?? [];
    const hiddenRows = body.filter((i) => this.hiddenRows.has(i.rawId));
    return {
      resetHidden: this.resetHidden.bind(this),
      hiddenAll: this.hiddenAll.bind(this),
      hiddenRows: hiddenRows,
      hasHidden: this.hasHidden,
      isAllHidden: this.isAllHidden,
    };
  }
}
