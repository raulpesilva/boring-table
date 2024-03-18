import type { BoringTable } from '../core';
import { BoringPlugin } from './base';

type ReturnExtension<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R>
  ? R extends { extensions: infer E }
    ? E
    : undefined
  : undefined;

interface PluginOptions<QueryParams, FetchFn> {
  fetchOnMount?: boolean;
  fetchFn: FetchFn;
  queryParams: QueryParams;
}

export class FetchPlugin<
  QueryParams extends Record<string, { value: string | number | null | undefined; requestOnChange: boolean }>,
  FetchFn extends (queryString: string, queryParams: QueryParams) => Promise<{ data: any; extensions?: any }>
> extends BoringPlugin {
  get name() {
    return 'fetch-plugin';
  }
  table?: BoringTable;

  queryParams: QueryParams;
  fetchFn: FetchFn;
  fetchOnMount: boolean;
  loading = false;
  extensions: ReturnExtension<FetchFn> extends undefined ? {} : ReturnExtension<FetchFn> = {};

  constructor(
    options: PluginOptions<QueryParams, FetchFn> &
      (ReturnExtension<FetchFn> extends undefined ? {} : { initialValues: ReturnExtension<FetchFn> })
  ) {
    super();
    this.fetchFn = options.fetchFn;
    this.queryParams = options.queryParams;
    this.fetchOnMount = options.fetchOnMount ?? true;
    if ('initialValues' in options) this.extensions = options.initialValues as any;
  }

  configure(table: BoringTable) {
    this.table = table;
    return {};
  }

  onMount(): void {
    if (this.fetchOnMount) this.fetch();
  }

  setQueryParams(params: QueryParams) {
    this.queryParams = params;
  }

  unwrapValue<T>(value: T | ((prev: T) => T), prev: T) {
    if (typeof value !== 'function') return value;
    return (value as (prev: T) => T)(prev);
  }

  setQueryParam<T extends keyof QueryParams>(
    key: T,
    value: QueryParams[T]['value'] | ((prev: QueryParams[T]['value']) => QueryParams[T]['value'])
  ) {
    this.queryParams[key].value = this.unwrapValue(value, this.queryParams[key].value);
    this.table?.dispatch('update:extensions');
    if (this.queryParams[key].requestOnChange) this.fetch();
  }

  getQueryParams() {
    const entries = Object.entries(this.queryParams);
    type Params = { [K in keyof QueryParams]: QueryParams[K]['value'] };
    const queryParams = entries.reduce((acc, [key, { value }]) => ({ ...acc, [key]: value }), {}) as Params;
    return queryParams;
  }

  normalizeQueryParams() {
    const entries = Object.entries(this.getQueryParams());
    const queryParams = entries.reduce((acc, [key, value]) => {
      if (value === null || value === undefined || String(value) === '') return acc;
      return { ...acc, [key]: String(value) };
    }, {});
    return new URLSearchParams(queryParams).toString();
  }

  async fetch() {
    const queryString = this.normalizeQueryParams();
    this.loading = true;
    this.table?.dispatch('update:extensions');
    const result = await this.fetchFn(queryString, this.queryParams);
    this.loading = false;
    if ('extensions' in result) this.extensions = result.extensions;
    this.table?.setData(result.data);
  }

  onUpdateExtensions(extensions: BoringTable['extensions']): void {
    Object.assign(extensions, this.extend());
  }

  extend() {
    const queryParams = this.getQueryParams();
    return {
      queryParams,
      loading: this.loading,
      fetch: this.fetch.bind(this),
      setQueryParams: this.setQueryParams.bind(this),
      setQueryParam: this.setQueryParam.bind(this),
      ...this.extensions,
    };
  }
}
