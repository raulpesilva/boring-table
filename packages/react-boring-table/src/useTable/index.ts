import { BoringColumn, BoringTableOptions, IBoringPlugin, createBoringTable } from 'boring-table';
import React from 'react';
import useSyncExternalStoreExports from 'use-sync-external-store/shim';
import { shallowEqual } from '../utils';

const { useSyncExternalStore } = useSyncExternalStoreExports;

export const useTable = <
  TData extends any[] = any,
  TPlugins extends IBoringPlugin[] = IBoringPlugin[],
  TColumn extends BoringColumn<TData, TPlugins>[] = BoringColumn<TData, TPlugins>[]
>(
  options: BoringTableOptions<TData, TPlugins, TColumn>
) => {
  const [prevOptions, setPrevOptions] = React.useState(() => options);
  const [table] = React.useState(() => createBoringTable(options));
  useSyncExternalStore(
    table.subscribe,
    () => table.numberOfUpdates,
    () => table.numberOfUpdates
  );
  // this solution is inspired by react docs
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (!shallowEqual(prevOptions, options)) {
    setPrevOptions(options);
    table.setOptions(options);
  }

  return table;
};
