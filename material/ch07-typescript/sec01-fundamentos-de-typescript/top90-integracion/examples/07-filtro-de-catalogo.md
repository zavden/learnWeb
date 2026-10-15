---
example_description: "Un catálogo filtrable: productos readonly con categoría literal, los valores de dos <select> convertidos en uniones con switch, comparadores como tipo de función y una lista que se vuelve a pintar; los elementos se obtienen con funciones que descartan null e instanceof"
example_tags: "typescript|integracion|dom|tipos-literales|estrechamiento|tipos-de-funcion|readonly|instanceof"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="shop">
  <h1>Tostadores del Sur</h1>
  <div class="filters">
    <label>Categoría
      <select id="category">
        <option value="all">Todo</option>
        <option value="coffee">Café</option>
        <option value="tea">Té</option>
        <option value="gear">Accesorios</option>
      </select>
    </label>
    <label>Ordenar
      <select id="sort">
        <option value="price-asc">Precio ↑</option>
        <option value="price-desc">Precio ↓</option>
        <option value="name">Nombre</option>
      </select>
    </label>
  </div>
  <p id="summary" aria-live="polite"></p>
  <ul id="products" class="products"></ul>
</main>
```

# CSS

```css
:root {
  color-scheme: light;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
.shop {
  max-width: 30rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.25rem;
  margin: 0 0 0.75rem;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
label {
  display: grid;
  gap: 0.2rem;
  font-size: 0.9rem;
}
select {
  font: inherit;
  padding: 0.3rem;
}
select:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.products {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.4rem;
}
.products li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: #fff;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
}
```

# TypeScript

```typescript
type Category = 'coffee' | 'tea' | 'gear';
type SortKey = 'price-asc' | 'price-desc' | 'name';
type Product = { readonly sku: string; readonly name: string; readonly priceCents: number; readonly category: Category };

const PRODUCTS: readonly Product[] = [
  { sku: 'CAF-CHI', name: 'Café de Chiapas 500 g', priceCents: 21000, category: 'coffee' },
  { sku: 'CAF-VER', name: 'Café de Veracruz 500 g', priceCents: 18500, category: 'coffee' },
  { sku: 'TE-LIM', name: 'Té de limón 50 g', priceCents: 6500, category: 'tea' },
  { sku: 'TE-HIB', name: 'Infusión de jamaica 100 g', priceCents: 7200, category: 'tea' },
  { sku: 'MOL-MAN', name: 'Molinillo manual', priceCents: 54900, category: 'gear' },
  { sku: 'PRE-FR', name: 'Prensa francesa 1 L', priceCents: 42000, category: 'gear' },
];

const CATEGORY_LABEL = { coffee: 'Café', tea: 'Té', gear: 'Accesorios' } as const;

const SORT_LABEL = { 'price-asc': 'precio ↑', 'price-desc': 'precio ↓', name: 'nombre' } as const;

// Un comparador es una función con este tipo (lección 6).
type Comparator = (a: Product, b: Product) => number;

function comparatorFor(key: SortKey): Comparator {
  switch (key) {
    case 'price-asc':
      return (a, b) => a.priceCents - b.priceCents; // a y b: Product, por el tipo de retorno
    case 'price-desc':
      return (a, b) => b.priceCents - a.priceCents;
    case 'name':
      return (a, b) => a.name.localeCompare(b.name, 'es');
  }
}

// Elementos obligatorios y de un tipo concreto (lecciones 2 y 4).
function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (element === null) throw new Error(`Falta el elemento #${id}`);
  return element;
}
function selectById(id: string): HTMLSelectElement {
  const element = byId(id);
  if (!(element instanceof HTMLSelectElement)) throw new Error(`#${id} no es un <select>`);
  return element;
}

// select.value es un string: se convierte en la unión, o en null si no encaja.
function toCategory(value: string): Category | 'all' | null {
  switch (value) {
    case 'all':
    case 'coffee':
    case 'tea':
    case 'gear':
      return value;
    default:
      return null;
  }
}
function toSortKey(value: string): SortKey | null {
  return value === 'price-asc' || value === 'price-desc' || value === 'name' ? value : null;
}

const categorySelect = selectById('category');
const sortSelect = selectById('sort');
const summary = byId('summary');
const list = byId('products');

function render(): void {
  const category = toCategory(categorySelect.value) ?? 'all';
  const sortKey = toSortKey(sortSelect.value) ?? 'price-asc';
  const visible = PRODUCTS.filter((product) => category === 'all' || product.category === category).toSorted(comparatorFor(sortKey));
  list.replaceChildren(
    ...visible.map((product) => {
      const item = document.createElement('li');
      const price = document.createElement('span');
      price.textContent = `$${(product.priceCents / 100).toFixed(2)}`;
      item.append(`${product.name} · ${CATEGORY_LABEL[product.category]}`, price);
      return item;
    }),
  );
  const label = category === 'all' ? 'todo' : CATEGORY_LABEL[category];
  summary.textContent = `${visible.length} productos (${label}, por ${SORT_LABEL[sortKey]})`;
  console.log(`🔎 ${label} · ${sortKey} → ${visible.map((product) => product.sku).join(', ')}`);
}

categorySelect.addEventListener('change', render);
sortSelect.addEventListener('change', render);
render();
console.log('Listo: cambia la categoría o el orden');
```
