import type { BoringTable } from '../core';
import { isDebugEnabled } from '../utils';

// definir melhor os momentos e os eventos
// adicionar momentos antes e dps de uma iteração
// adicionar eventos para cada momento

const a = [
  'name',
  'priority',
  // lifecycle
  'onMount',
  'onUnmount',
  'beforeCreateRows',
  'afterCreateRows',
  'onScheduleUpdate',
  'afterScheduleUpdate',

  // 'data'
  'onChangeData',
  'onChangeDataItem',

  // 'columns'
  'onChangeColumns',
  'onChangeColumn',

  // 'events'
  'onChangeEvents',

  // 'plugins'
  'onChangePlugins',

  // 'config'
  'configure',
  'onChangeConfig',

  // 'extensions'
  'extend',
  'onChangeExtensions',

  // 'head'
  'onCreateHead',
  'onCreateHeadRow',
  'onCreateHeadCell',

  // 'body'
  'onCreateBody',
  'onCreateBodyRow',
  'onCreateBodyCell',

  // 'footer'
  'onCreateFooter',
  'onCreateFooterRow',
  'onCreateFooterCell',

  // 'reset'
  'onReset',
];
export interface IBoringPlugin {
  name: string;
  priority: number;
  // lifecycle
  onMount: () => void;
  onUnmount: () => void;
  beforeCreateRows: (data: any[]) => void;
  afterCreateRows: (data: any[]) => void;
  onScheduleUpdate: () => void;
  afterScheduleUpdate: () => void;

  // 'data'
  onChangeData: (data: any[]) => void;
  onChangeDataItem: (data: any) => void;

  // 'columns'
  onChangeColumns: (columns: BoringTable['columns']) => void;
  onChangeColumn: (column: BoringTable['columns'][number], index: number) => void;

  // 'events'
  onChangeEvents: (events: BoringTable['events']) => void;

  // 'plugins'
  onChangePlugins: (plugins: BoringPlugin[]) => void;

  // 'config'
  configure: (table: BoringTable) => any;
  onChangeConfig: (config: BoringTable['config']) => void;

  // 'extensions'
  extend: () => any;
  onChangeExtensions: (extensions: BoringTable['extensions']) => void;

  // 'head'
  onCreateHead: (rows: any[]) => void;
  onCreateHeadRow: (row: any) => any;
  onCreateHeadCell: (cell: any) => any;

  // 'body'
  onCreateBody: (rows: any[]) => void;
  onCreateBodyRow: (row: any) => any;
  onCreateBodyCell: (cell: any) => any;

  // 'footer'
  onCreateFooter: (rows: any[]) => void;
  onCreateFooterRow: (row: any) => any;
  onCreateFooterCell: (cell: any) => any;

  // 'reset'
  onReset: () => void;
}

export class BoringPlugin implements IBoringPlugin {
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
  beforeCreateRows(data: any[]) {}
  afterCreateRows(data: any[]) {}
  onScheduleUpdate() {}
  afterScheduleUpdate() {}

  // 'data'
  onChangeData(data: any[]) {}
  onChangeDataItem(data: any) {}

  // 'columns'
  onChangeColumns(columns: BoringTable['columns']) {}
  onChangeColumn(column: BoringTable['columns'][number], index: number) {}

  // 'events'
  onChangeEvents(events: BoringTable['events']) {}

  // 'plugins'
  onChangePlugins(plugins: BoringPlugin[]) {}

  // 'config'
  configure(table: BoringTable) {
    throw new Error('Plugin must override "configure"');
    return {};
  }
  onChangeConfig(config: BoringTable['config']) {}

  // 'extensions'
  extend() {
    return {};
  }
  onChangeExtensions(extensions: BoringTable['extensions']) {}

  // 'head'
  onCreateHead(rows: BoringTable['head']) {
    return {};
  }
  onCreateHeadRow(row: BoringTable['head'][number]) {
    return {};
  }
  onCreateHeadCell(cell: BoringTable['head'][number]['cells'][number]) {
    return {};
  }

  // 'body'
  onCreateBody(rows: BoringTable['body']) {
    return {};
  }
  onCreateBodyRow(row: BoringTable['body'][number]) {
    return {};
  }
  onCreateBodyCell(cell: BoringTable['body'][number]['cells'][number]) {
    return {};
  }

  // 'footer'
  onCreateFooter(rows: BoringTable['footer']) {
    return {};
  }
  onCreateFooterRow(row: BoringTable['footer'][number]) {
    return {};
  }
  onCreateFooterCell(cell: BoringTable['footer'][number]['cells'][number]) {
    return {};
  }

  // 'reset'
  onReset() {}
}
