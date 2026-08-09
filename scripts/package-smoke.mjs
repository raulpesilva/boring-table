import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const coreEsm = await import('../packages/boring-table-core/dist/index.mjs');
const coreCjs = require('../packages/boring-table-core/dist/index.cjs');
const reactEsm = await import('../packages/react-boring-table/dist/index.mjs');
const reactCjs = require('../packages/react-boring-table/dist/index.cjs');

for (const module of [coreEsm, coreCjs]) {
  assert.equal(typeof module.createBoringTable, 'function');
  const table = module.createBoringTable({
    data: [{ id: 'smoke', value: 1 }],
    getId: (item) => item.id,
    columns: [{ body: (item) => item.value }],
  });

  assert.equal(table.body[0].cells[0].value, 1);
}

for (const module of [reactEsm, reactCjs]) {
  assert.equal(typeof module.useTable, 'function');
  assert.equal(typeof module.createBoringTable, 'function');
}

console.log('ESM and CJS package smoke tests passed.');
