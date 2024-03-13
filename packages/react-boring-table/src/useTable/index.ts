import { BoringColumn, BoringTableOptions, IBoringPlugin, createBoringTable } from 'boring-table';
import React from 'react';

export const useTable = <
  TData extends any[] = any,
  TPlugins extends IBoringPlugin[] = IBoringPlugin[],
  TColumn extends BoringColumn<TData, TPlugins>[] = BoringColumn<TData, TPlugins>[]
>(
  options: BoringTableOptions<TData, TPlugins, TColumn>
) => {
  const [prevData, setPrevData] = React.useState(options.data);
  const [table] = React.useState(() => createBoringTable(options));
  React.useSyncExternalStore(
    (e) => table?.setOnChange?.(e),
    () => table.numberOfUpdates,
    () => table.numberOfUpdates
  );
  // this solution is inspired by react docs
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (prevData !== options.data) {
    setPrevData(options.data);
    table.setData(options.data);
  }
  return table;
};
