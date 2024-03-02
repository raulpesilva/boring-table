import { BoringTable } from './core';
import { ChangePlugin, CheckPlugin, FilterPlugin, HiddenRowPlugin, SwapRowPlugin } from './plugins';
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

const data: Data[] = Array.from({ length: 1_000_000 }, (_, i) => ({
  id: i.toString(),
  name: `Name ${i}`,
  age: i,
}));
const table = new BoringTable({
  data: data,
  getId: (arg) => arg.id,
  columns: [
    {
      type: 'name1',
      head: (arg, e, t) => arg.id,
      body: (arg, e) => arg.id,
    },
    {
      type: 'name2',
      head: (arg) => arg.name,
      body: (arg) => arg.name,
    },
    {
      head: (arg) => arg.age,
      body: (arg) => arg.age,
    },
  ],

  plugins: [
    new HiddenRowPlugin(),
    new CheckPlugin(),
    new ChangePlugin<Data>(),
    new FilterPlugin<Data>((param, value) => value.name.includes(param)),
    new SwapRowPlugin(),
  ],
});

const run = async () => {
  // console.log('events', [...table.events.keys()]);
  await table.waitForUpdates();
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
  table.body[table.body.length - 1]?.toggleCheck();
  await table.waitForUpdates();

  // console.log(table.body[table.body.length - 1]?.cells[0]);
  table.body[table.body.length - 1]?.cells[0]?.toggleCheck();
  await table.waitForUpdates();
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
  console.log('last body2', table.body[table.body.length - 1]);

  await table.waitForUpdates();

  console.time('time   ');
  for (let i = 0; i < 1; i++) {
    data.map((item) => [
      table.plugins.map(() => table.columns.map((i) => item.name)),
      table.plugins.map(() => table.columns.map((i) => item.name)),
      table.plugins.map(() => table.columns.map((i) => item.name)),
      table.plugins.map(() => table.columns.map((i) => item.name)),
    ]);
  }

  console.timeEnd('time   ');

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
