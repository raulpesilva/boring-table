<div align="center">
  <picture>
    <source srcset="./assets/boring-table-logo-dark.svg" media='(prefers-color-scheme: dark)' />
    <source srcset="./assets/boring-table-logo.svg" media='(prefers-color-scheme: light)' />
    <img src="./assets/boring-table-logo.svg" width="250"/>
  </picture>
  <br/>
  <picture>
    <source srcset="./assets/boring-table-type-dark.svg" media='(prefers-color-scheme: dark)' />
    <source srcset="./assets/boring-table-type.svg" media='(prefers-color-scheme: light)' />
    <img src="./assets/boring-table-type.svg" width="250"/>
  </picture>
</div>

# boring-table

A headless, framework-agnostic table library with a powerful plugin system. Build fully customizable tables and data grids with complete control over rendering.

## Features

- **Headless**: No UI opinions - you control the rendering
- **Framework Agnostic**: Core library works anywhere, with React bindings available
- **Plugin System**: Extend functionality with built-in or custom plugins
- **Type Safe**: Full TypeScript support with excellent type inference
- **Lightweight**: Zero dependencies in the core package

## Installation

```bash
# Core library
npm install boring-table

# React bindings
npm install react-boring-table
```

## Quick Start

### Basic Usage (Vanilla)

```typescript
import { createBoringTable } from 'boring-table';

type Person = { id: string; name: string; age: number };

const data: Person[] = [
  { id: '1', name: 'Alice', age: 30 },
  { id: '2', name: 'Bob', age: 25 },
];

const table = createBoringTable({
  data,
  getId: (item) => item.id,
  columns: [
    {
      head: () => 'Name',
      body: (item) => item.name,
    },
    {
      head: () => 'Age',
      body: (item) => item.age,
    },
  ],
});

// Access table data
console.log(table.head);   // Header rows
console.log(table.body);   // Body rows
console.log(table.footer); // Footer rows
```

### React Usage

```tsx
import { useTable } from 'react-boring-table';

function MyTable() {
  const table = useTable({
    data: [
      { id: '1', name: 'Alice', age: 30 },
      { id: '2', name: 'Bob', age: 25 },
    ],
    getId: (item) => item.id,
    columns: [
      {
        head: () => 'Name',
        body: (item) => item.name,
      },
      {
        head: () => 'Age',
        body: (item) => item.age,
      },
    ],
  });

  return (
    <table>
      <thead>
        {table.head.map((row) => (
          <tr key={row.id}>
            {row.cells.map((cell) => (
              <th key={cell.id}>{cell.value}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.body.map((row) => (
          <tr key={row.id}>
            {row.cells.map((cell) => (
              <td key={cell.id}>{cell.value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Columns

Columns define how data is transformed into table cells. Each column has three optional parts:

```typescript
const columns = [
  {
    head: (cell, table) => 'Header Value',           // Header cell
    body: (item, cell, table) => item.someProperty,  // Body cell (required)
    footer: (cell, table) => 'Footer Value',         // Footer cell
  },
];
```

### Multiple Header/Footer Rows

Use arrays to create multiple header or footer rows:

```typescript
const columns = [
  {
    head: [
      () => 'Group Header',  // First header row
      () => 'Column Header', // Second header row
    ],
    body: (item) => item.value,
    footer: [
      () => 'Subtotal',
      () => 'Total',
    ],
  },
];
```

## Plugins

Plugins extend table functionality. Pass them in the `plugins` array:

```typescript
import { createBoringTable, PaginationPlugin, RowSelectPlugin } from 'boring-table';

const table = createBoringTable({
  data,
  getId: (item) => item.id,
  columns,
  plugins: [
    new PaginationPlugin({ pageSize: 10 }),
    new RowSelectPlugin(),
  ],
});
```

### Built-in Plugins

#### PaginationPlugin

Adds pagination support:

```typescript
import { PaginationPlugin } from 'boring-table';

const pagination = new PaginationPlugin({ 
  page: 1,      // Initial page
  pageSize: 10  // Items per page
});

const table = createBoringTable({
  data,
  getId: (item) => item.id,
  columns,
  plugins: [pagination],
});

// Use pagination via extensions
table.extensions.nextPage();
table.extensions.prevPage();
table.extensions.setPage(5);
table.extensions.firstPage();
table.extensions.lastPage();
table.extensions.setPageSize(20);

// Access pagination state
table.extensions.page;       // Current page
table.extensions.pageSize;   // Items per page
table.extensions.totalPages; // Total number of pages
table.extensions.totalItems; // Total items count
```

#### RowSelectPlugin

Adds row selection capabilities:

```typescript
import { RowSelectPlugin } from 'boring-table';

const table = createBoringTable({
  data,
  getId: (item) => item.id,
  columns,
  plugins: [new RowSelectPlugin()],
});

// Row-level selection (available on each body row)
table.body[0].toggleSelect();     // Toggle selection
table.body[0].toggleSelect(true); // Select
table.body[0].selected;           // Check if selected

// Bulk operations via extensions
table.extensions.selectAll();
table.extensions.unselectAll();
table.extensions.selectAllVisible();
table.extensions.unselectAllVisible();

// Access selection state
table.extensions.selectedRows;        // Array of selected rows
table.extensions.selectedItems;       // Array of selected data items
table.extensions.hasSelectedRows;     // Boolean
table.extensions.isAllSelected;       // Boolean
table.extensions.isAllVisibleSelected; // Boolean
```

#### FilterPlugin

Adds filtering with optional debounce:

```typescript
import { FilterPlugin } from 'boring-table';

const filter = new FilterPlugin({
  initialValue: '',
  debounceTime: 300, // Optional debounce in ms
  filter: (item, criteria) => {
    return item.name.toLowerCase().includes(criteria.toLowerCase());
  },
});

const table = createBoringTable({
  data,
  getId: (item) => item.id,
  columns,
  plugins: [filter],
});

// Apply filter
table.extensions.filter('search term');

// Functional update
table.extensions.filter((prev) => prev + ' more');

// Access current criteria
table.extensions.criteria;
```

#### HiddenRowPlugin

Adds ability to hide/show rows:

```typescript
import { HiddenRowPlugin } from 'boring-table';

const table = createBoringTable({
  data,
  getId: (item) => item.id,
  columns,
  plugins: [new HiddenRowPlugin()],
});

// Row-level hiding
table.body[0].toggleHidden();     // Toggle visibility
table.body[0].toggleHidden(true); // Hide
table.body[0].hidden;             // Check if hidden

// Bulk operations
table.extensions.hiddenAll();
table.extensions.resetHidden();

// Access hidden state
table.extensions.hiddenRows; // Array of hidden rows
table.extensions.hasHidden;  // Boolean
table.extensions.isAllHidden; // Boolean
```

## Updating Data

### Setting New Data

```typescript
table.setData(newData);
```

### Updating Options

```typescript
table.setOptions({
  data: newData,
  columns: newColumns,
});
```

## Table Structure

The table exposes three main row collections:

- `table.head` - Header rows
- `table.body` - Body rows (original data order)
- `table.customBody` - Body rows after plugin transformations (filtering, pagination, etc.)
- `table.footer` - Footer rows

Each row contains:

```typescript
{
  id: string;      // Unique row identifier
  rawId: string;   // Original ID from getId()
  index: number;   // Row index
  cells: Cell[];   // Array of cells
}
```

Each cell contains:

```typescript
{
  id: string;       // Unique cell identifier
  rawId: string;    // Row's rawId
  index: number;    // Column index
  rowIndex: number; // Row index
  value: any;       // Cell value (return value from column function)
  getRow: () => Row; // Function to get parent row
}
```

## Subscribing to Changes

```typescript
const unsubscribe = table.subscribe(() => {
  console.log('Table updated!');
});

// Later, to unsubscribe
unsubscribe();
```

## Creating Custom Plugins

Extend the `BoringPlugin` class to create custom functionality:

```typescript
import { BoringPlugin, BoringTable } from 'boring-table';

class MyCustomPlugin extends BoringPlugin {
  get name() {
    return 'my-custom-plugin';
  }

  table!: BoringTable;

  configure(table: BoringTable) {
    this.table = table;
    return {};
  }

  // Add custom data to each body row
  onCreateBodyRow(row: BoringTable['body'][number]) {
    return {
      customProperty: 'value',
    };
  }

  // Expose methods via extensions
  extend() {
    return {
      myCustomMethod: () => {
        // Custom logic
        this.table.dispatch('update:body-rows');
      },
    };
  }
}
```

### Plugin Lifecycle Hooks

| Hook | Description |
|------|-------------|
| `onMount` | Called when table is initialized |
| `configure(table)` | Configure plugin with table reference |
| `extend()` | Return object to merge into `table.extensions` |
| `beforeCreateBodyRows(data)` | Before body rows are created |
| `onCreateBodyRow(row)` | Add properties to each body row |
| `onCreateBodyCell(cell)` | Add properties to each body cell |
| `afterCreateBodyRows(rows, data)` | After body rows are created |
| `onUpdateCustomBody(rows)` | Modify the customBody array |
| `onUpdateExtensions(extensions)` | Update extensions object |

## Packages

| Package | Description |
|---------|-------------|
| `boring-table` | Core headless table library |
| `react-boring-table` | React bindings with `useTable` hook |

## License

MIT