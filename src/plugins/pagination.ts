import { GenericBoringTable } from '../core';
import { BoringPlugin } from './base';

export class PaginationPlugin extends BoringPlugin {
  get name() {
    return 'pagination-plugin';
  }
  priority = 100;
  table?: GenericBoringTable;
  pageSize = 10;
  currentPage = 1;
  total = 0;
  totalPages = 0;
  private dataCopy: any[] = [];

  constructor(pageSize: number) {
    super();
    this.pageSize = pageSize;
    this.debug('Plugin initialized');
  }

  configure(table: GenericBoringTable) {
    this.table = table;
    this.dataCopy = table.data;
    this.total = this.table.data.length;
    this.totalPages = Math.ceil(this.total / this.pageSize);
    this.debug('Plugin configured');
    return {};
  }

  onChangeData(data: GenericBoringTable['data']) {
    this.dataCopy = data;
    this.total = data.length;
    this.totalPages = Math.ceil(this.total / this.pageSize);
    this.currentPage = 1;
  }

  beforeCreateBodyRows(): void {
    if (!this.table) return;
    this.total = this.dataCopy.length;
    this.totalPages = Math.ceil(this.total / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = this.currentPage * this.pageSize;
    this.table.data = this.dataCopy.slice(start, end);
  }

  afterCreateBodyRows(): void {
    if (!this.table) return;
    this.table.data = this.dataCopy;
    console.log('chamou');
  }

  setPage = (page: number) => {
    if (!this.table) return;
    this.currentPage = page;
    this.table.dispatch('create:body-rows');
  };

  nextPage = () => {
    if (!this.table) return;
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.table.dispatch('create:body-rows');
    }
  };

  prevPage = () => {
    if (!this.table) return;
    if (this.currentPage > 1) {
      this.currentPage--;
      this.table.dispatch('create:body-rows');
    }
  };

  extend() {
    return {
      setPage: this.setPage,
      nextPage: this.nextPage,
      prevPage: this.prevPage,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      totalItems: this.total,
      rawData: this.dataCopy,
    };
  }
}
