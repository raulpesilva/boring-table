import { BoringTable } from './core';
import { ChangePlugin, CheckPlugin, FilterPlugin, HiddenRowPlugin, PaginationPlugin, SwapRowPlugin } from './plugins';
import { enableDebug } from './utils';
// adicionar memo para evitar re-render desnecessário
// referencia: https://github.com/TanStack/table/blob/main/packages/table-core/src/core/table.ts
// _getDefaultColumnDef: usa o memo para evitar re-render desnecessário

enableDebug(true);

type Data = { id: string; name: string; age: number };
// const data: Data[] = [
//   { id: '1', name: 'John', age: 30 },
//   { id: '2', name: 'Mary', age: 20 },
// ];

const data: Data[] = Array.from({ length: 4_000_000 }, (_, i) => ({
  id: `id-${i.toString()}`,
  name: `Name ${i}`,
  age: i,
  other: 'other',
  other2: 'other2',
}));

const table = new BoringTable({
  data: data,
  getId: (arg) => arg.id,
  columns: [
    {
      type: 'name1',
      head: [(e, t) => false],
      body: (arg, e) => arg.id,
      footer: (arg, e) => arg.id,
    },
    {
      type: 'name2',
      head: (arg) => 'head 1',
      body: (arg) => arg.name,
    },
    {
      head: () => 'head 2',
      body: (arg) => arg.age,
      footer: [(e, t) => false],
    },
  ],

  plugins: [
    new HiddenRowPlugin(),
    new CheckPlugin(),
    new ChangePlugin<Data>(),
    new FilterPlugin<Data>((param, value) => value.name.includes(param)),
    new SwapRowPlugin(),
    new PaginationPlugin(2_000_000),
  ],
});

const run = async () => {
  console.log('-----------##-----------')
  await table.waitForUpdates();
  // console.log('events', [...table.events.keys()]);
  // await table.waitForUpdates();
  // console.log('body', JSON.stringify(table.body, null, 2));
  // await table.body[0].change((prev) => ({ ...prev, age: 27 }));
  // table.reset();
  // table.extensions.filter('o');
  // table.body[0].toggleHidden();
  // console.log('events', [...table.events.keys()]);
  // table.body[0]?.swap(1);
  // console.log('last body1', table.body[table.body.length - 1]);

  // table.body[table.body.length - 1]?.toggleCheck();
  // await table.waitForUpdates();
  // table.body[table.body.length - 1]?.toggleCheck();
  // await table.waitForUpdates();
  // table.body[table.body.length - 1]?.toggleCheck();
  // await table.waitForUpdates();
  // table.body[table.body.length - 1]?.toggleCheck();
  // await table.waitForUpdates();
  // table.body[table.body.length - 1]?.toggleCheck();
  // await table.waitForUpdates();
  // table.body[table.body.length - 1]?.toggleCheck();
  // await table.waitForUpdates();

  // console.log(table.body[table.body.length - 1]?.cells[0]);
  // table.body[table.body.length - 1]?.cells[0]?.toggleCheck();
  // await table.waitForUpdates();
  // table.body[table.body.length - 1]?.cells[0]?.toggleCheck();
  // await table.waitForUpdates();
  // table.body[table.body.length - 1]?.cells[0]?.toggleCheck();
  // await table.waitForUpdates();
  // table.body[table.body.length - 1]?.cells[0]?.toggleCheck();
  // await table.waitForUpdates();
  // table.body[table.body.length - 1]?.cells[0]?.toggleCheck();
  // await table.waitForUpdates();
  // await table.waitForUpdates();
  // table.onceUpdateFinish(() => console.log('finish'));
  // table.dispatch('update:all');
  // await table.waitForUpdates();
  // table.dispatch('update:all');
  // await table.waitForUpdates();
  // table.dispatch('update:all');
  // await table.waitForUpdates();
  // console.log(table.body[table.body.length - 1]?.cells[0]);
  console.log('-----------##-----------')
  console.log('last body2', table.body[table.body.length - 1]?.check);
  table.body[table.body.length - 1]?.toggleCheck();
  await table.waitForUpdates();
  console.log('-----------##-----------')
  console.log('last body2', table.body[table.body.length - 1]?.check);
  table.body[table.body.length - 1]?.toggleCheck();
  await table.waitForUpdates();
  console.log('-----------##-----------')
  // table.extensions.nextPage();
  // await table.waitForUpdates();
  // table.dispatch('update:all');
  // await table.waitForUpdates();
  console.log('-----------##-----------')
  console.log('last body2', table.body[table.body.length - 1]?.check);
  console.log('head length   :', table.head.length);
  console.log('body length   :', table.body.length);
  console.log('footer length :', table.footer.length);
  // table.extensions.resetCheck();
  // await table.waitForUpdates();

  // console.time('time   ');
  // for (let i = 0; i < 1; i++) {
  //   table.plugins.map((p) => p.name);
  //   table.events.forEach((v, k) => k);
  //   data.map((item) => [table.columns.map(() => [table.plugins.map((p) => p.name)]), table.plugins.map((p) => p.name)]);
  //   table.plugins.map((p) => p.name);
  // }
  // console.timeEnd('time   ');

  // console.log('last body2', table.body[table.body.length - 1]);
  // for (const a of table.body) console.table(a.cells);
  // console.log('events', [...table.events.keys()]);
  // console.log('body', JSON.stringify(table.body, null, 2));
  // console.log('head', JSON.stringify(table.head, null, 2));
  // console.log('body', JSON.stringify(table.body, null, 2));
  // console.log('footer', JSON.stringify(table.footer, null, 2));
};
run();
type Config = typeof table.config;
//   ^?
type Extensions = typeof table.extensions;
//   ^?
type HeadType = typeof table.head;
//   ^?
type BodyType = typeof table.body;
//   ^?
type FooterType = typeof table.footer;
//   ^?
type HeadValue = HeadType[number]['cells'][number]['value'];
//   ^?
type BodyValue = BodyType[number]['cells'][number]['value'];
//   ^?
type FooterValue = FooterType[number]['cells'][number]['value'];
//   ^?

type ColumnsType = typeof table.columns;
// type column = (ColumnsType extends (infer T)[] ? (T extends { head: any } ? T : never) : never)['head'];
type argA<T extends keyof ColumnsType[number]> = ColumnsType extends (infer R)[] ? R : never;

type a = (() => 'a') | [() => 2] | [() => 1];
type b = Extract<a, Function> | Extract<a, any[]>[number];
