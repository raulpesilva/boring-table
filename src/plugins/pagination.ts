import { GenericBoringTable } from '../core';
import { BoringPlugin } from './base';

export class PaginationPlugin extends BoringPlugin {
  get name() {
    return 'pagination-plugin';
  }
  priority = 100;
  table!: GenericBoringTable;
  pageSize = 10;
  currentPage = 1;
  total = 0;
  totalPages = 0;
  page: GenericBoringTable['body'] = [];

  constructor(pageSize: number) {
    super();
    this.pageSize = pageSize;
    this.debug('Plugin initialized');
  }

  configure(table: GenericBoringTable) {
    if (!table) throw new Error('Table is required');
    this.table = table;
    this.total = this.table.data.length;
    this.totalPages = Math.ceil(this.total / this.pageSize);
    this.debug('Plugin configured');
    return {};
  }

  onUpdateData(data: GenericBoringTable['data']) {
    this.total = data.length;
    this.totalPages = Math.ceil(this.total / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = 1;
    this.updatePage();
  }

  updatePage(rows?: GenericBoringTable['body']) {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = this.currentPage * this.pageSize;
    this.page = (rows ?? this.table.body).slice(start, end);
    this.table.dispatch('update:extensions');
  }

  afterCreateBodyRows(rows: GenericBoringTable['body']): void {
    this.total = this.table.body.length;
    this.totalPages = Math.ceil(this.total / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = this.currentPage * this.pageSize;
    this.page = (rows ?? this.table.body).slice(start, end);
    this.table.dispatch('update:extensions');
  }

  onUpdateBodyRows() {
    this.table.dispatch('update:extensions');
  }

  onUpdateBodyRow() {
    this.table.dispatch('update:extensions');
  }

  onUpdateBodyCell() {
    this.table.dispatch('update:extensions');
  }

  setPage = (page: number) => {
    this.currentPage = page;
    this.updatePage();
    this.table.dispatch('update:extensions');
  };

  nextPage = () => {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePage();
      this.table.dispatch('update:extensions');
    }
  };

  prevPage = () => {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePage();
      this.table.dispatch('update:extensions');
    }
  };

  onUpdateExtensions(extensions: GenericBoringTable['extensions']) {
    Object.assign(extensions, {
      setPage: this.setPage,
      nextPage: this.nextPage,
      prevPage: this.prevPage,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      totalItems: this.total,
      pageSize: this.pageSize,
      page: this.page,
    });
  }

  extend() {
    return {
      setPage: this.setPage,
      nextPage: this.nextPage,
      prevPage: this.prevPage,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      totalItems: this.total,
      pageSize: this.pageSize,
      page: this.page,
    };
  }
}
