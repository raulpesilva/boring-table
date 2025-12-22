import { useState } from 'react';
import {
  ChangePlugin,
  FilterPlugin,
  HiddenRowPlugin,
  PaginationPlugin,
  RowSelectPlugin,
  createOptions,
  useTable,
} from 'react-boring-table';
import './App.css';
const list = [
  {
    firstName: 'Desmond1',
    lastName: 'Sawayn',
    age: 4,
    visits: 168,
    progress: 60,
    status: 'relationship',
  },
  {
    firstName: 'Uriah2',
    lastName: 'Dickinson',
    age: 36,
    visits: 288,
    progress: 83,
    status: 'single',
  },
  {
    firstName: 'Aimee3',
    lastName: 'Ondricka',
    age: 29,
    visits: 856,
    progress: 29,
    status: 'single',
  },
  {
    firstName: 'Luther4',
    lastName: 'Schmidt',
    age: 17,
    visits: 553,
    progress: 46,
    status: 'complicated',
  },
  {
    firstName: 'Rosemarie5',
    lastName: 'Prosacco',
    age: 2,
    visits: 856,
    progress: 78,
    status: 'complicated',
  },
  {
    firstName: 'Maximus6',
    lastName: 'Durgan',
    age: 21,
    visits: 960,
    progress: 53,
    status: 'relationship',
  },
  {
    firstName: 'Hulda7',
    lastName: 'Bradtke',
    age: 9,
    visits: 523,
    progress: 69,
    status: 'single',
  },
  {
    firstName: 'Desiree8',
    lastName: 'Lind',
    age: 32,
    visits: 549,
    progress: 33,
    status: 'relationship',
  },
  {
    firstName: 'Herbert9',
    lastName: 'Hegmann',
    age: 17,
    visits: 119,
    progress: 28,
    status: 'complicated',
  },
  {
    firstName: 'Kelsi0',
    lastName: 'Schmeler',
    age: 15,
    visits: 743,
    progress: 92,
    status: 'complicated',
  },
  {
    firstName: 'Maxwell0',
    lastName: 'Cronin',
    age: 28,
    visits: 182,
    progress: 59,
    status: 'relationship',
  },
  {
    firstName: 'Remington0',
    lastName: 'Breitenberg',
    age: 11,
    visits: 69,
    progress: 43,
    status: 'relationship',
  },
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
  getId: (item) => item.firstName,
  columns: [
    {
      head: (extra, table) => (
        <th key={extra.id}>
          <input
            type="checkbox"
            checked={!!extra.getRow()?.isAllSelected}
            onChange={
              extra.getRow()?.isAllSelected || extra.getRow()?.hasSelectedRows
                ? table.extensions.resetSelections
                : table.extensions.selectAll
            }
          />
        </th>
      ),
      body: (_item, extra) => (
        <td key={extra.id}>
          <input
            className="mx-auto"
            type="checkbox"
            checked={!!extra.getRow()?.selected}
            onChange={() => extra.getRow().toggleSelect?.()}
          />
        </td>
      ),
      footer: (e) => <th key={e.id}>select</th>,
    },
    {
      head: (e) => <th key={e.id}>firstName</th>,
      body: (item, extra) => <td key={extra.id}>{item.firstName}</td>,
      footer: (e) => <th key={e.id}>firstName</th>,
    },
    {
      head: (e) => <th key={e.id}>Last Name</th>,
      body: (item, extra) => <td key={extra.id}>{item.lastName}</td>,
      footer: (e) => <th key={e.id}>lastName</th>,
    },
    {
      head: (e) => <th key={e.id}>Age</th>,
      body: (item, extra) => {
        return (
          <AgeBody
            key={extra.id}
            age={item.age}
            change={() =>
              extra.getRow().change?.((prev) => ({ ...prev, age: prev.age + Math.floor(Math.random() * 10) + 1 }))
            }
          />
        );
      },
      footer: (e) => <th key={e.id}>age</th>,
    },
    {
      head: (e) => <th key={e.id}>Visits</th>,
      body: (item, extra) => <td key={extra.id}>{item.visits}</td>,
      footer: (e) => <th key={e.id}>visits</th>,
    },
    {
      head: (e) => <th key={e.id}>Status</th>,
      body: (item, extra) => <td key={extra.id}>{item.status}</td>,
      footer: (e) => <th key={e.id}>status</th>,
    },
    {
      head: (e) => <th key={e.id}>Profile Progress</th>,
      body: (item, extra) => <td key={extra.id}>{item.progress}</td>,
      footer: (e) => <th key={e.id}>progress</th>,
    },
  ],
  plugins: [
    new RowSelectPlugin(),
    new HiddenRowPlugin(),
    new ChangePlugin(),
    new FilterPlugin({
      filter: (item, criteria, row) => {
        if (item.age < criteria.age) return false;
        if (criteria.selected && !row.selected) return false;
        return true;
      },
      initialValue: { age: 0, selected: false },
      debounceTime: 100,
    }),
    new PaginationPlugin({ pageSize: 10 }),
  ],
});

function App() {
  const [data, setData] = useState(() => list);
  const table = useTable({ data, ...options });
  return (
    <div className="App">
      <div style={{ display: 'flex' }}>
        <button onClick={() => setData(([_, ...rest]) => rest)} className="border p-2">
          - first
        </button>
        <button onClick={() => setData((prev) => [...prev])} className="border p-2">
          + last
        </button>
        <div className="border p-2">{table.extensions.page}</div>
        <div className="border p-2">{table.extensions.lastPage}</div>
        <button onClick={table.extensions.prevPage} className="border p-2">
          prev
        </button>
        <button onClick={table.extensions.nextPage} className="border p-2">
          next
        </button>
        <input
          type="number"
          value={table.extensions.criteria.age}
          onChange={(e) => table.extensions.filter((prev) => ({ ...prev, age: Number(e.target.value) }))}
          className="border p-2 min-w-0 w-16"
        />
        <div className="border p-2">
          <input
            type="checkbox"
            checked={table.extensions.criteria.selected ?? false}
            onChange={() => table.extensions.filter((prev) => ({ ...prev, selected: !prev.selected }))}
            className="border p-2"
          />
        </div>
        <div className="border p-2">{table.extensions.selectedRows.length}</div>
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

export default App;
