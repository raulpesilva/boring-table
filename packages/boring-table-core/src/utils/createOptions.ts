import { BoringColumn, BoringTableOptions } from '../core/BoringTable';
import { IBoringPlugin } from '../plugins';

export const createOptions = <
  TData extends any[] = any,
  TPlugins extends IBoringPlugin[] = IBoringPlugin[],
  TColumn extends BoringColumn<TData, TPlugins>[] = BoringColumn<TData, TPlugins>[]
>({
  data: _,
  ...options
}: Omit<BoringTableOptions<TData, TPlugins, TColumn>, 'data'> & { data?: TData }): Omit<
  BoringTableOptions<TData, TPlugins, TColumn>,
  'data'
> => {
  return options;
};
