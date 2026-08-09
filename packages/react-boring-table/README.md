<div align="center">
  <picture>
    <source srcset="assets/boring-table-logo-dark.svg" media='(prefers-color-scheme: dark)' />
    <source srcset="assets/boring-table-logo.svg" media='(prefers-color-scheme: light)' />
    <img src="assets/boring-table-logo.svg" width="250"/>
  </picture>
  <br/>
  <picture>
    <source srcset="assets/boring-table-type-dark.svg" media='(prefers-color-scheme: dark)' />
    <source srcset="assets/boring-table-type.svg" media='(prefers-color-scheme: light)' />
    <img src="assets/boring-table-type.svg" width="250"/>
  </picture>
</div>

## O que é o react-boring-table?

Uma tabela headless para React focada em composição via plugins. Você define colunas como funções (head, body, footer), conecta plugins (seleção, filtro, paginação, etc.) e renderiza com total controle do HTML/JSX.

Este guia mostra como começar usando o exemplo real de `src/example/App.js`.

## Instalação

Instale apenas o pacote React:

```powershell
pnpm add react-boring-table
```

React 16.8 ou mais recente é suportado. O pacote inclui `use-sync-external-store`: em versões recentes do React, o
shim usa a implementação nativa; em versões anteriores ao React 18, ele fornece o fallback compatível.

Observação: `react-boring-table` reexporta a API do core (`boring-table`). Você pode importar tudo direto de `react-boring-table`.

## Conceitos rápidos

- options: criado com `createOptions({ data, getId, columns, plugins })`.
- useTable: hook que cria e sincroniza a tabela com React.
- columns: cada coluna define funções para `head`, `body` e `footer`.
- plugins: adicionam comportamento (seleção, ocultar linhas, edição, filtro, paginação...). Exponham utilitários em `table.extensions`.
- head/body/footer: arrays de linhas com `cells`. Você renderiza mapeando para JSX.
- customBody: corpo processado por plugins (ex.: filtrado e paginado). Use este para renderizar o tbody.

## Exemplo completo (baseado no App.js)

```jsx
import { useState } from 'react';
import {
  useTable,
  createOptions,
  RowSelectPlugin,
  HiddenRowPlugin,
  ChangePlugin,
  FilterPlugin,
  PaginationPlugin,
} from 'react-boring-table';

const list = [
  { firstName: 'Desmond1', lastName: 'Sawayn', age: 4, visits: 168, progress: 60, status: 'relationship' },
  { firstName: 'Uriah2', lastName: 'Dickinson', age: 36, visits: 288, progress: 83, status: 'single' },
  // ...demais itens
];

const AgeBody = ({ age, change }) => {
  const [agePlus, setAge] = useState(0);
  return (
    <td>
      {age + agePlus}
      <button onClick={() => setAge((prev) => prev + Math.floor(Math.random() * 10) + 1)}>+</button>
      <button onClick={change}>+</button>
    </td>
  );
};

const options = createOptions({
  data: list,
  getId: (item) => item.firstName, // id único por linha
  columns: [
    // Coluna de seleção de linhas
    {
      head: (extra, table) => (
        <th key={extra.id}>
          <input
            type='checkbox'
            checked={!!extra.getRow()?.isAllSelected}
            onChange={
              extra.getRow()?.isAllSelected || extra.getRow()?.hasSelectedRows
                ? table.extensions.unselectAll
                : table.extensions.selectAll
            }
          />
        </th>
      ),
      body: (_item, extra) => (
        <td key={extra.id}>
          <input
            type='checkbox'
            checked={!!extra.getRow()?.selected}
            onChange={() => extra.getRow().toggleSelect?.()}
          />
        </td>
      ),
      footer: (e) => <th key={e.id}>select</th>,
    },
    // Demais colunas de dados
    {
      head: (e) => <th key={e.id}>firstName</th>,
      body: (item, e) => <td key={e.id}>{item.firstName}</td>,
      footer: (e) => <th key={e.id}>firstName</th>,
    },
    {
      head: (e) => <th key={e.id}>Last Name</th>,
      body: (item, e) => <td key={e.id}>{item.lastName}</td>,
      footer: (e) => <th key={e.id}>lastName</th>,
    },
    {
      head: (e) => <th key={e.id}>Age</th>,
      body: (item, extra) => (
        <AgeBody
          key={extra.id}
          age={item.age}
          change={() =>
            extra.getRow().change?.((prev) => ({ ...prev, age: prev.age + Math.floor(Math.random() * 10) + 1 }))
          }
        />
      ),
      footer: (e) => <th key={e.id}>age</th>,
    },
    {
      head: (e) => <th key={e.id}>Visits</th>,
      body: (item, e) => <td key={e.id}>{item.visits}</td>,
      footer: (e) => <th key={e.id}>visits</th>,
    },
    {
      head: (e) => <th key={e.id}>Status</th>,
      body: (item, e) => <td key={e.id}>{item.status}</td>,
      footer: (e) => <th key={e.id}>status</th>,
    },
    {
      head: (e) => <th key={e.id}>Profile Progress</th>,
      body: (item, e) => <td key={e.id}>{item.progress}</td>,
      footer: (e) => <th key={e.id}>progress</th>,
    },
  ],
  plugins: [
    new RowSelectPlugin(),
    new HiddenRowPlugin(),
    new ChangePlugin(),
    new FilterPlugin({
      initialValue: { age: 0, selected: false },
      debounceTime: 100,
      filter: (item, criteria, row) => {
        if (item.age < criteria.age) return false;
        if (criteria.selected && !row.selected) return false;
        return true;
      },
    }),
    new PaginationPlugin({ pageSize: 10 }),
  ],
});

export default function App() {
  const [data, setData] = useState(() => list);
  const table = useTable({ data, ...options });

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Mutação externa dos dados */}
        <button onClick={() => setData((prev) => prev.slice(1))}>- first</button>
        <button onClick={() => setData((prev) => [...prev])}>+ last (no-op)</button>

        {/* Paginação */}
        <span>
          page {table.extensions.page} / {table.extensions.totalPages}
        </span>
        <button onClick={table.extensions.prevPage}>prev</button>
        <button onClick={table.extensions.nextPage}>next</button>

        {/* Filtro por idade */}
        <input
          type='number'
          value={table.extensions.criteria.age}
          onChange={(e) => table.extensions.filter((prev) => ({ ...prev, age: Number(e.target.value) }))}
          style={{ width: 64 }}
        />
        {/* Filtro: apenas selecionados */}
        <label>
          <input
            type='checkbox'
            checked={table.extensions.criteria.selected ?? false}
            onChange={() => table.extensions.filter((prev) => ({ ...prev, selected: !prev.selected }))}
          />
          only selected
        </label>

        {/* Contador de selecionados */}
        <span>selected: {table.extensions.selectedRows.length}</span>
      </div>

      <table>
        <thead>
          {table.head.map((row, i) => (
            <tr key={i}>{row.cells.map((c) => c.value)}</tr>
          ))}
        </thead>
        <tbody>
          {table.customBody.map((row, i) => (
            <tr key={i}>{row.cells.map((c) => c.value)}</tr>
          ))}
        </tbody>
        <tfoot>
          {table.footer.map((row, i) => (
            <tr key={i}>{row.cells.map((c) => c.value)}</tr>
          ))}
        </tfoot>
      </table>
    </div>
  );
}
```

### Por que `customBody` no tbody?

`customBody` é o corpo já processado pelos plugins (ex.: filtrado e paginado). Use-o para renderizar o `<tbody>` quando utilizar `FilterPlugin` e/ou `PaginationPlugin`.

## API essencial

Imports mais comuns:

```ts
import {
  useTable,
  createOptions,
  // Plugins
  RowSelectPlugin,
  HiddenRowPlugin,
  ChangePlugin,
  FilterPlugin,
  PaginationPlugin,
} from 'react-boring-table';
```

- createOptions(options): retorna as opções (auxilia tipagem genérica).
- useTable(options): cria/assina a tabela. Retorna um objeto com:
  - head, body, footer: linhas e células para renderizar.
  - customBody: corpo pós-plugins.
  - extensions: utilitários expostos pelos plugins (ex.: `filter`, `criteria`, `page`, `nextPage`, `selectedRows`, etc.).

### Plugins inclusos (núcleo)

- RowSelectPlugin: seleção de linhas (toggle individual, selecionar todos, selecionados visíveis).
- HiddenRowPlugin: esconder/mostrar linhas e resetar.
- ChangePlugin: muta um item de dados por linha via `row.change(updater)`.
- FilterPlugin: filtra o `customBody` com `criteria` e `filter` fornecidos.
- PaginationPlugin: pagina `customBody` e expõe `page`, `totalPages`, `nextPage`, `prevPage`, etc.

Os plugins possuem prioridades internas para compor corretamente (por exemplo, filtro antes de paginação). A ordem no array normalmente pode seguir a preferência do exemplo acima.

## Dicas e boas práticas

- Sempre forneça `getId` estável e único por item.
- Renderize `table.customBody` no `<tbody>` quando usar filtros/paginação.
- Prefira atualizar critérios com função: `table.extensions.filter(prev => ({ ...prev, age: 10 }))`.
- Para checkboxes no header, use `extra.getRow()` para acessar utilitários do plugin de seleção.
- Tipos: `createOptions` e `useTable` aceitam genéricos para inferir dados e plugins no TypeScript.

## Executando o exemplo local (opcional)

Este repositório já contém `src/example/App.js` semelhante ao código acima. Você pode integrar no seu projeto React como desejar; o pacote não impõe estilos.

—

Licença: MIT
