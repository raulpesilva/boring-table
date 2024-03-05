import { BoringTable } from './core';
import { ChangePlugin, CheckPlugin, PaginationPlugin } from './plugins';
import { enableDebug } from './utils';
export { BoringTable } from './core';
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
      head: [(_e, _t) => 1, () => 'head 1'],
      body: (arg, _e) => arg.id,
      footer: (_arg, _e) => 'footer 1',
    },
    {
      type: 'name2',
      head: (_arg) => 'head 2',
      body: (arg) => arg.name,
      footer: [(_e, _t) => 'footer 2', () => 'footer 3'],
    },
    {
      head: () => 'head 3',
      body: (arg) => arg.age,
      footer: [(_e, _t) => 'footer 4', () => 'footer 5'],
    },
  ],

  plugins: [
    // new HiddenRowPlugin(),
    new CheckPlugin(),
    new ChangePlugin<Data>(),
    // new FilterPlugin<Data>((param, value) => value.name.includes(param)),
    // new SwapRowPlugin(),
    new PaginationPlugin(4),
  ],
});

const run = async () => {
  console.log('\x1B[35m-----------##-----------', '\x1b[0m');
  await table.waitForUpdates();
  // console.log('last footer', JSON.stringify(table.footer, null, 2));
  // console.log('last head', JSON.stringify(table.head, null, 2));
  //   console.log('\x1B[35m-----------##-----------', '\x1b[0m');
  // console.log('head right     :', table.head[0].cells[0].value !== table.head[1].cells[0].value);
  // console.log('footer right     :', table.footer[0].cells[0].value !== table.footer[1].cells[0].value);
  // console.log('events', [...table.events.keys()]);
  // await table.waitForUpdates();
  // console.log('body', JSON.stringify(table.body, null, 2));
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
  // console.log('\x1B[35m-----------##-----------', '\x1b[0m');
  // console.log('check', table.body[table.body.length - 1]?.check);
  // table.body[table.body.length - 1]?.toggleCheck();
  // table.body[table.body.length - 1]?.toggleCheck();
  // await table.waitForUpdates();
  // console.log('\x1B[35m-----------##-----------', '\x1b[0m');
  // console.log('check', table.body[table.body.length - 1]?.check);
  // table.body[table.body.length - 1]?.toggleCheck();
  // await table.waitForUpdates();
  // console.log('check', table.body[table.body.length - 1]?.check);
  // console.log('\x1B[35m-----------##-----------', '\x1b[0m');
  // // table.extensions.nextPage();
  // await table.waitForUpdates();
  // console.log('check', table.body[table.body.length - 1]?.check);
  // console.log('\x1B[35m-----------##-----------', '\x1b[0m');

  // console.log(`\x1B[32m[name]\x1b[34m`, table.body[table.body.length - 1]?.cells[1].value, '\x1b[0m');
  // await table.body[table.body.length - 1].change((prev) => ({ ...prev, name: 'Raullll' }));
  // console.log(`\x1B[32m[name]\x1b[34m`, table.body[table.body.length - 1]?.cells[1].value, '\x1b[0m');
  // console.log('\x1B[35m-----------##-----------', '\x1b[0m');
  // table.extensions.resetCheck();
  // await table.waitForUpdates();

  // table.dispatch('update:all');
  // await table.waitForUpdates();
  // console.log('\x1B[35m-----------##-----------', '\x1b[0m');
  // await table.waitForUpdates();
  console.log('\x1B[35m-----------##-----------', '\x1b[0m');
  console.log('head length     :', table.head.length);
  console.log('head row length :', table.head[0]?.cells.length);
  console.log('body row length :', table.body.length);

  console.log('\x1B[35m-----------##-----------', '\x1b[0m');
  console.log('extensions page:', table.extensions);
  console.log('page length     :', table.extensions.page.length);
  console.log('page row length :', table.extensions.page[0]?.cells.length);
  console.log('\x1B[35m-----------##-----------', '\x1b[0m');
  // console.log('\x1B[35m-----------##-----------', '\x1b[0m');
  // console.log('\x1B[35m-----------##-----------', '\x1b[0m');
  // console.log('\x1B[35m-----------##-----------', '\x1b[0m');
  // table.extensions.nextPage();
  // table.extensions.nextPage();
  // await table.waitForUpdates();
  // console.log('\x1B[35m-----------##-----------', '\x1b[0m');
  // console.log('extensions page:', table.extensions);
  // console.log('page length     :', table.extensions.page.length);
  // console.log('page row length :', table.extensions.page[0]?.cells.length);
  // console.log('\x1B[35m-----------##-----------', '\x1b[0m');
  // table.extensions.nextPage();
  // await table.waitForUpdates();
  // console.log('\x1B[35m-----------##-----------', '\x1b[0m');
  // console.log('extensions page:', table.extensions);
  // console.log('page length     :', table.extensions.page.length);
  // console.log('page row length :', table.extensions.page[0]?.cells.length);
  // console.log('footer length   :', table.footer.length);
  // console.log('footer row length :', table.footer[0]?.cells.length);
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

// type ATable = typeof table;
// type Config = TConfig<ATable>;
// type Plugins = TPlugins<ATable>;
// //   ^?
// type Extensions = TExtensions<ATable>;
// //   ^?
// type HeadType = THead<ATable>;
// //   ^?
// type BodyType = TBody<ATable>;
// //   ^?
// type FooterType = TFooter<ATable>;
// //   ^?
// type headValue = THeadValue<ATable>;
// //   ^?
// type bodyValue = TBodyValue<ATable>;
// //   ^?
// type footerValue = TFooterValue<ATable>;
// //   ^?
// class A {
//   test() {
//     return { a: 1 };
//   }
// }

// class B {
//   test() {}
// }

// class C {}

// type Classes = A | B | C;
// type a = Exclude<ReturnType<Extract<Classes, { test: () => any }>['test']>, void>;
// //   ^?
