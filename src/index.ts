import { BoringTable } from './core';
import { ChangePlugin, CheckPlugin, FilterPlugin, HiddenRowPlugin } from './plugins';
import { enableDebug } from './utils';
// adicionar memo para evitar re-render desnecessário
// referencia: https://github.com/TanStack/table/blob/main/packages/table-core/src/core/table.ts
// _getDefaultColumnDef: usa o memo para evitar re-render desnecessário

enableDebug(false);

type Data = { id: string; name: string; age: number };
const data: Data[] = [
  { id: '1', name: 'John', age: 30 },
  { id: '2', name: 'Mary', age: 20 },
];

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
  ],
});

setTimeout(async () => {
  table.process();
  // console.log('events', [...table.events.keys()]);
  await table.waitForUpdates();
  console.log('body', JSON.stringify(table.body, null, 2));
  // await table.body[0].change((prev) => ({ ...prev, age: 27 }));
  // table.reset();
  // table.extensions.filter('o');
  // table.body[0].toggleHidden();
  // console.log('events', [...table.events.keys()]);
  table.body[0]?.cells[0]?.toggleCheck();
  table.body[0]?.toggleCheck();
  await table.waitForUpdates();
  // for (const a of table.body) console.table(a.cells);
  // console.log('events', [...table.events.keys()]);
  console.log('body', JSON.stringify(table.body, null, 2));
  // console.log('head', JSON.stringify(table.head, null, 2));
  // console.log('body', JSON.stringify(table.body, null, 2));
  // console.log('footer', JSON.stringify(table.footer, null, 2));
}, 1);
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
