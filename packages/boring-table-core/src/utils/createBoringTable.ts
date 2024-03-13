import { BoringColumn, BoringTable, BoringTableOptions } from "../core";
import { IBoringPlugin } from "../plugins";

export const createBoringTable = <
  TData extends any[] = any,
  TPlugins extends IBoringPlugin[] = IBoringPlugin[],
  TColumn extends BoringColumn<TData, TPlugins>[] = BoringColumn<TData, TPlugins>[]
>(
  options: BoringTableOptions<TData, TPlugins, TColumn>
) => {
  return new BoringTable(options);
};