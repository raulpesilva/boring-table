import { BoringColumn, BoringTable } from '../core';
import { BASE_PRIORITIES, BoringPlugin, IBoringPlugin } from './base';

export class PaginationPlugin<
  TData extends any[] = any,
  TPlugins extends IBoringPlugin[] = IBoringPlugin[],
  TColumns extends BoringColumn<TData, TPlugins>[] = BoringColumn<TData, TPlugins>[]
> extends BoringPlugin {
  get name() {
    return 'pagination-plugin';
  }
  priority = BASE_PRIORITIES.SHOULD_BE_LAST;
  table!: BoringTable<TData, TPlugins, TColumns>;
  page = 1;
  pageSize = 0;
  totalPages = 0;
  totalItems = 0;

  constructor(options: { page?: number; pageSize?: number }) {
    super();
    if (options.page) this.page = options.page;
    if (options.pageSize) this.pageSize = options.pageSize;
    this.debug('Plugin initialized');
  }

  configure(table: BoringTable<TData, TPlugins, TColumns>) {
    this.table = table;
    this.debug('Plugin configured');
    return {};
  }

  nextPage() {
    if (this.page >= this.totalPages) return;
    this.page++;
    this.table.dispatch('update:custom-body');
    this.table.dispatch('update:extensions');
  }

  prevPage() {
    if (this.page <= 1) return;
    this.page--;
    this.table.dispatch('update:custom-body');
    this.table.dispatch('update:extensions');
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.page = page;
    this.table.dispatch('update:custom-body');
    this.table.dispatch('update:extensions');
  }

  fistPage() {
    this.setPage(1);
  }

  lastPage() {
    this.setPage(this.totalPages);
  }

  afterCreateBodyRows() {
    if (this.pageSize === 0) this.pageSize = this.table.customBody.length;
    if (this.table.customBody.length !== this.totalItems) this.page = 1;
    this.totalItems = this.table.customBody.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.table.dispatch('update:extensions');
    this.table.dispatch('update:custom-body');
    return {};
  }

  onUpdateCustomBody() {
    if (this.table.customBody.length !== this.totalItems) this.page = 1;
    this.totalItems = this.table.customBody.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.table.customBody = this.table.customBody.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
    this.table.dispatch('update:extensions');
  }

  onUpdateExtensions(extensions: BoringTable<TData, TPlugins, TColumns>['extensions']): void {
    Object.assign(extensions, this.extend());
  }

  extend() {
    return {
      page: this.page,
      pageSize: this.pageSize,
      totalItems: this.totalItems,
      totalPages: this.totalPages,
      nextPage: this.nextPage.bind(this),
      prevPage: this.prevPage.bind(this),
      setPage: this.setPage.bind(this),
      fistPage: this.fistPage.bind(this),
      lastPage: this.lastPage.bind(this),
    };
  }
}
