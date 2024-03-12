import type { BoringTable } from '../core';
import { BoringEvents } from '../core/BoringEvents';
import { isDebugEnabled } from '../utils';

// definir melhor os momentos e os eventos
// adicionar momentos antes e dps de uma iteração
// adicionar eventos para cada momento
// deixar todos os métodos como opcionais

export interface IBoringPlugin {
  name: string;
  priority: number;
  // lifecycle
  onMount: () => void;
  onUnmount: () => void;
  onScheduleUpdate: () => void;
  afterScheduleUpdate: () => void;

  // 'data'
  onUpdateData: (data: any[]) => void;
  onUpdateDataItem: (data: any) => void;

  // 'columns'
  onUpdateColumns: (columns: any[]) => void;
  onUpdateColumn: (column: any, index: number) => void;

  // 'events'
  onUpdateEvents: (events: BoringEvents) => void;

  // 'plugins'
  onUpdatePlugins: (plugins: any[]) => void;

  // 'config'
  configure: (table: any) => any;
  onUpdateConfig: (config: Record<string, any>) => void;

  // 'extensions'
  extend: () => any;
  onUpdateExtensions: (extensions: Record<string, any>) => void;

  // 'head'
  beforeCreateHeadRows: (data: any[]) => void;
  onCreateHead: (rows: any[]) => void;
  onCreateHeadRow: (row: any) => any;
  onCreateHeadCell: (cell: any) => any;
  afterCreateHeadRows: (data: any[]) => void;

  // 'body'
  beforeCreateBodyRows: (data: any[]) => void;
  onCreateBody: (rows: any[]) => void;
  onCreateBodyRow: (row: any) => any;
  onCreateBodyCell: (cell: any) => any;
  afterCreateBodyRows: (rows: any[], data: any[]) => void;

  // 'footer'
  beforeCreateFooterRows: (data: any[]) => void;
  onCreateFooter: (rows: any[]) => void;
  onCreateFooterRow: (row: any) => any;
  onCreateFooterCell: (cell: any) => any;
  afterCreateFooterRows: (data: any[]) => void;

  // 'reset'
  onReset: () => void;

  // update
  onUpdateCustomBody(rows: any): void;
  onUpdateBodyRows: (rows: any[]) => void;
  onUpdateBodyRow: (row: any) => any;
  onUpdateBodyCell: (cell: any) => any;
  onUpdateHeadRows: (rows: any[]) => void;
  onUpdateHeadRow: (row: any) => any;
  onUpdateHeadCell: (cell: any) => any;
  onUpdateFooterRows: (rows: any[]) => void;
  onUpdateFooterRow: (row: any) => any;
  onUpdateFooterCell: (cell: any) => any;
}

export abstract class BoringPlugin implements IBoringPlugin {
  get name(): string {
    throw new Error('Plugin must override "name"');
  }
  priority = 0;
  showDebug = false;

  debug(...args: any[]) {
    if (isDebugEnabled() && this.showDebug) {
      const [first, ...rest] = args;
      console.log(`\x1B[32m[${this.name}]\x1b[34m`, first, '\x1b[0m', ...rest);
    }
  }

  // lifecycle
  onMount() {}
  onUnmount() {}
  onScheduleUpdate() {}
  afterScheduleUpdate() {}

  // 'data'
  onUpdateData(_data: any[]) {}
  onUpdateDataItem(_data: any) {}

  // 'columns'
  onUpdateColumns(_columns: BoringTable['columns']) {}
  onUpdateColumn(_column: BoringTable['columns'][number], _index: number) {}

  // 'events'
  onUpdateEvents(_events: BoringTable['events']) {}

  // 'plugins'
  onUpdatePlugins(_plugins: BoringPlugin[]) {}

  // 'config'
  configure(_table: any) {
    throw new Error('Plugin must override "configure"');
    return {};
  }
  onUpdateConfig(_config: BoringTable['config']) {}

  // 'extensions'
  extend() {
    return {};
  }
  onUpdateExtensions(_extensions: BoringTable['extensions']) {}

  // 'head'
  beforeCreateHeadRows(_data: any[]) {}
  onCreateHead(_rows: BoringTable['head']) {
    return {};
  }
  onCreateHeadRow(_row: BoringTable['head'][number]) {
    return {};
  }
  onCreateHeadCell(_cell: BoringTable['head'][number]['cells'][number]) {
    return {};
  }
  afterCreateHeadRows(_data: any[]) {}

  // 'body'
  beforeCreateBodyRows(_data: any[]) {}
  onCreateBody(_rows: BoringTable['body']) {
    return {};
  }
  onCreateBodyRow(_row: BoringTable['body'][number]) {
    return {};
  }
  onCreateBodyCell(_cell: BoringTable['body'][number]['cells'][number]) {
    return {};
  }
  afterCreateBodyRows(_data: any[]) {}

  // 'footer'
  beforeCreateFooterRows(_data: any[]) {}
  onCreateFooter(_rows: BoringTable['footer']) {
    return {};
  }
  onCreateFooterRow(_row: BoringTable['footer'][number]) {
    return {};
  }
  onCreateFooterCell(_cell: BoringTable['footer'][number]['cells'][number]) {
    return {};
  }
  afterCreateFooterRows(_data: any[]) {}
  // 'reset'
  onReset() {}

  // update
  onUpdateCustomBody(_rows: BoringTable['customBody']) {}
  onUpdateBodyRows(_rows: BoringTable['body']) {}
  onUpdateBodyRow(_row: BoringTable['body'][number]) {}
  onUpdateBodyCell(_cell: BoringTable['body'][number]['cells'][number]) {}
  onUpdateHeadRows(_rows: BoringTable['head']) {}
  onUpdateHeadRow(_row: BoringTable['head'][number]) {}
  onUpdateHeadCell(_cell: BoringTable['head'][number]['cells'][number]) {}
  onUpdateFooterRows(_rows: BoringTable['footer']) {}
  onUpdateFooterRow(_row: BoringTable['footer'][number]) {}
  onUpdateFooterCell(_cell: BoringTable['footer'][number]['cells'][number]) {}
}

export const BASE_PRIORITIES = {
  SHOULD_BE_FIRST: 0,
  HIGHEST: 10,
  DEFAULT: 100,
  LOWEST: 1000,
  SHOULD_BE_LAST: 10000,
} as const;
