import { BoringTable } from '../core';
import { BASE_PRIORITIES, BoringPlugin } from './base';

export class RowSelectPlugin extends BoringPlugin {
  get name() {
    return 'row-select-plugin';
  }
  priority = BASE_PRIORITIES.SHOULD_BE_LAST;
  table?: BoringTable;

  selectedRows: Map<string, BoringTable['body'][number]> = new Map();
  isAllSelected = false;
  isAllVisibleSelected = false;
  hasSelectedRows = false;

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
    if (this.hasSelectedRows !== this.selectedRows.size > 0) {
      this.hasSelectedRows = this.selectedRows.size > 0;
      if (!ignoreEvent) this.table?.dispatch('update:head-rows');
    }
    if (this.isAllSelected !== (this.selectedRows.size >= (this.table?.body.length ?? 0) && this.hasSelectedRows)) {
      this.isAllSelected = this.selectedRows.size >= (this.table?.body.length ?? 0) && this.hasSelectedRows;
      if (!ignoreEvent) this.table?.dispatch('update:head-rows');
    }
    const isAllVisibleSelected = !!this.table?.customBody.every((item) => item.selected);
    if (isAllVisibleSelected !== this.isAllVisibleSelected) this.table?.dispatch('update:head-rows');
    this.isAllVisibleSelected = isAllVisibleSelected;
  }

  toggleBody = (row: BoringTable['body'][number], value?: boolean, ignoreEvent?: boolean) => {
    row.selected = value ?? !row.selected;
    if (row.selected) this.selectedRows.set(row.rawId, row);
    if (!row.selected) this.selectedRows.delete(row.rawId);
    if (!ignoreEvent) this.table?.dispatch('update:body-row', { rowIndex: row.index });
    this.updateUtils(ignoreEvent);
    if (!ignoreEvent) this.table?.dispatch('update:extensions');
  };

  resetSelections() {
    this.selectedRows.clear();
    this.table?.body.forEach((row) => (row.selected = false));
    this.updateUtils(true);
    this.table?.dispatch('update:body-rows');
    this.table?.dispatch('update:head-rows');
    this.table?.dispatch('update:extensions');
  }

  resetVisibleSelections() {
    this.table?.customBody.forEach((row) => {
      this.selectedRows.delete(row.rawId);
      row.selected = false;
    });
    this.updateUtils(true);
    this.table?.dispatch('update:body-rows');
    this.table?.dispatch('update:head-rows');
    this.table?.dispatch('update:extensions');
  }

  selectAll() {
    this.table?.body.forEach((row) => this.toggleBody(row, true, true));
    this.table?.dispatch('update:body-rows');
    this.table?.dispatch('update:head-rows');
    this.table?.dispatch('update:extensions');
  }

  allVisibleSelect() {
    this.table?.customBody.forEach((row) => this.toggleBody(row, true, true));
    this.table?.dispatch('update:body-rows');
    this.table?.dispatch('update:head-rows');
    this.table?.dispatch('update:extensions');
  }

  onCreateHeadRow() {
    return {
      isAllSelected: this.isAllSelected,
      isAllVisibleSelected: this.isAllVisibleSelected,
      hasSelectedRows: this.hasSelectedRows,
      resetSelections: this.resetSelections.bind(this),
      resetVisibleSelections: this.resetVisibleSelections.bind(this),
      selectAll: this.selectAll.bind(this),
      allVisibleSelect: this.allVisibleSelect.bind(this),
    };
  }

  afterCreateBodyRows(rows: BoringTable['body']) {
    const selectedRows = new Map(this.selectedRows);
    this.selectedRows.clear();
    rows.forEach((row) => this.toggleBody(row, selectedRows.has(row.rawId), true));
    this.updateUtils(true);
    this.table?.dispatch('update:body-rows');
    this.table?.dispatch('update:head-rows');
    this.table?.dispatch('update:extensions');
  }

  onUpdateHeadRows(rows: BoringTable['head']) {
    rows.forEach((row) => {
      row.isAllSelected = this.isAllSelected;
      row.isAllVisibleSelected = this.isAllVisibleSelected;
      row.hasSelectedRows = this.hasSelectedRows;
    });
  }

  onCreateBodyRow(row: BoringTable['body'][number]) {
    row.selected = this.selectedRows.has(row.rawId);
    return { selected: !!row.selected, toggleSelect: (value?: boolean) => this.toggleBody(row, value) };
  }

  onUpdateBodyRows(): void {
    this.updateUtils(true);
    this.table?.dispatch('update:head-rows');
    this.table?.dispatch('update:extensions');
  }

  onUpdateCustomBody(): void {
    this.updateUtils(true);
    this.table?.dispatch('update:head-rows');
    this.table?.dispatch('update:extensions');
  }

  onUpdateExtensions(extensions: BoringTable['extensions']): void {
    Object.assign(extensions, this.extend());
  }

  extend() {
    const body = this.table?.body ?? [];
    const selectedRows = body.filter((i) => this.selectedRows.has(i.rawId));
    return {
      resetSelections: this.resetSelections.bind(this),
      resetVisibleSelections: this.resetVisibleSelections.bind(this),
      selectAll: this.selectAll.bind(this),
      allVisibleSelect: this.allVisibleSelect.bind(this),
      selectedRows: selectedRows,
      hasSelectedRows: this.hasSelectedRows,
      isAllSelected: this.isAllSelected,
      isAllVisibleSelected: this.isAllVisibleSelected,
    };
  }
}
