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
  onScheduleUpdate: () => void;
  afterScheduleUpdate: () => void;

  // 'data'
  onUpdateData: (data: any[]) => void;
  onUpdateDataItem: (data: any) => void;

  // 'columns'
  onUpdateColumns: (columns: BoringTable['columns']) => void;
  onUpdateColumn: (column: BoringTable['columns'][number], index: number) => void;

  // 'events'
  onUpdateEvents: (events: BoringTable['events']) => void;

  // 'plugins'
  onUpdatePlugins: (plugins: BoringPlugin[]) => void;

  // 'config'
  configure: (table: BoringTable) => any;
  onUpdateConfig: (config: BoringTable['config']) => void;

  // 'extensions'
  extend: () => any;
  onUpdateExtensions: (extensions: BoringTable['extensions']) => void;

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
  onScheduleUpdate() {}
  afterScheduleUpdate() {}

  // 'data'
  onUpdateData(data: any[]) {}
  onUpdateDataItem(data: any) {}

  // 'columns'
  onUpdateColumns(columns: BoringTable['columns']) {}
  onUpdateColumn(column: BoringTable['columns'][number], index: number) {}

  // 'events'
  onUpdateEvents(events: BoringTable['events']) {}

  // 'plugins'
  onUpdatePlugins(plugins: BoringPlugin[]) {}

  // 'config'
  configure(table: BoringTable) {
    throw new Error('Plugin must override "configure"');
    return {};
  }
  onUpdateConfig(config: BoringTable['config']) {}

  // 'extensions'
  extend() {
    return {};
  }
  onUpdateExtensions(extensions: BoringTable['extensions']) {}

  // 'head'
  beforeCreateHeadRows(data: any[]) {}
  onCreateHead(rows: BoringTable['head']) {
    return {};
  }
  onCreateHeadRow(row: BoringTable['head'][number]) {
    return {};
  }
  onCreateHeadCell(cell: BoringTable['head'][number]['cells'][number]) {
    return {};
  }
  afterCreateHeadRows(data: any[]) {}

  // 'body'
  beforeCreateBodyRows(data: any[]) {}
  onCreateBody(rows: BoringTable['body']) {
    return {};
  }
  onCreateBodyRow(row: BoringTable['body'][number]) {
    return {};
  }
  onCreateBodyCell(cell: BoringTable['body'][number]['cells'][number]) {
    return {};
  }
  afterCreateBodyRows(data: any[]) {}

  // 'footer'
  beforeCreateFooterRows(data: any[]) {}
  onCreateFooter(rows: BoringTable['footer']) {
    return {};
  }
  onCreateFooterRow(row: BoringTable['footer'][number]) {
    return {};
  }
  onCreateFooterCell(cell: BoringTable['footer'][number]['cells'][number]) {
    return {};
  }
  afterCreateFooterRows(data: any[]) {}
  // 'reset'
  onReset() {}

  // update
  onUpdateBodyRows(rows: BoringTable['body']) {}
  onUpdateBodyRow(row: BoringTable['body'][number]) {}
  onUpdateBodyCell(cell: BoringTable['body'][number]['cells'][number]) {}
  onUpdateHeadRows(rows: BoringTable['head']) {}
  onUpdateHeadRow(row: BoringTable['head'][number]) {}
  onUpdateHeadCell(cell: BoringTable['head'][number]['cells'][number]) {}
  onUpdateFooterRows(rows: BoringTable['footer']) {}
  onUpdateFooterRow(row: BoringTable['footer'][number]) {}
  onUpdateFooterCell(cell: BoringTable['footer'][number]['cells'][number]) {}
}
