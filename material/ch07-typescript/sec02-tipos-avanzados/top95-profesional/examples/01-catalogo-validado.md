---
example_description: "El catálogo de una tienda que llega como JSON (assets/catalog.json): un esquema propio con ids y precios con marca valida cada producto desde unknown, los problemas se listan con su ruta en un panel desplegable, y los productos válidos se pintan y se filtran por existencias y etiqueta"
example_tags: "typescript|profesional|validacion|esquemas|infer|tipos-con-marca|fetch|json|dom|accesibilidad"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="app">
  <header class="top">
    <h1>La Casa del Mole · catálogo</h1>
    <p id="status" class="status" role="status">Cargando el catálogo…</p>
  </header>
  <section class="filters" aria-label="Filtros">
    <label class="check"><input id="in-stock" type="checkbox"> Solo con existencias</label>
    <label class="field">Etiqueta <select id="tag"><option value="">Todas</option></select></label>
  </section>
  <ul id="products" class="grid" aria-label="Productos"></ul>
  <details id="problems" class="problems" hidden>
    <summary id="problems-title">Productos con problemas</summary>
    <ul id="problem-list"></ul>
  </details>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #7b8794; --soft: #d9e2ec; --accent: #9a3412; --ok: #166534; --danger: #b91c1c; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #fff8f0; }
.app { max-width: 46rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.3rem; margin: 0; }
.status { margin: 0.25rem 0 0.75rem; color: var(--muted); }
.filters { display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem; align-items: center; margin-bottom: 0.75rem; }
.check, .field { display: inline-flex; gap: 0.4rem; align-items: center; }
select, input { font: inherit; }
select { padding: 0.25rem 0.4rem; border: 1px solid var(--line); border-radius: 0.4rem; background: #fff; color: var(--ink); }
.grid { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr)); }
.card { padding: 0.75rem 0.9rem; background: #fff; border: 1px solid var(--soft); border-radius: 0.75rem; }
.card h2 { font-size: 1rem; margin: 0 0 0.15rem; }
.meta { margin: 0; color: var(--muted); font-size: 0.85rem; }
.price { margin: 0.35rem 0; font-weight: 700; font-size: 1.1rem; }
.stock { display: inline-block; padding: 0.05rem 0.5rem; border-radius: 1rem; font-size: 0.8rem; font-weight: 600; color: var(--ok); background: #f0fdf4; }
.stock.out { color: var(--danger); background: #fef2f2; }
.tags { display: flex; flex-wrap: wrap; gap: 0.3rem; list-style: none; margin: 0.4rem 0 0; padding: 0; font-size: 0.8rem; color: var(--accent); }
.problems { margin-top: 1rem; padding: 0.5rem 0.9rem; border-left: 4px solid var(--danger); background: #fef2f2; color: var(--danger); }
.problems[hidden] { display: none; }
.problems ul { margin: 0.4rem 0 0; padding-left: 1.2rem; font-size: 0.9rem; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
```

# TypeScript

```typescript
// ── Un esquema pequeño: valida unknown y describe un tipo (lección 6) ─────
type Issue = { path: string; message: string };
type Schema<T> = { parse: (value: unknown, path: string, issues: Issue[]) => T | undefined; optional?: true };
type Infer<S> = S extends Schema<infer T> ? T : never;
type OptionalKeys<Shape> = { [K in keyof Shape]: Shape[K] extends { optional: true } ? K : never }[keyof Shape];
type InferObject<Shape> = { [K in keyof Shape as K extends OptionalKeys<Shape> ? never : K]: Infer<Shape[K]> } & { [K in OptionalKeys<Shape>]?: Infer<Shape[K]> };

function fail(issues: Issue[], path: string, message: string): undefined {
  issues.push({ path, message });
  return undefined;
}
const describe = (value: unknown): string => (value === undefined ? 'falta' : `llegó ${JSON.stringify(value)}`);

const s = {
  text: (): Schema<string> => ({ parse: (v, path, issues) => (typeof v === 'string' && v.trim() !== '' ? v : fail(issues, path, `debe ser texto (${describe(v)})`)) }),
  integer: (min: number): Schema<number> => ({
    parse: (v, path, issues) => (typeof v === 'number' && Number.isInteger(v) && v >= min ? v : fail(issues, path, `debe ser un entero ≥ ${min} (${describe(v)})`)),
  }),
  list: <T>(item: Schema<T>): Schema<T[]> => ({
    parse: (v, path, issues) => {
      if (!Array.isArray(v)) return fail(issues, path, `debe ser una lista (${describe(v)})`);
      const before = issues.length;
      const items = v.map((element: unknown, index) => item.parse(element, `${path}[${index}]`, issues));
      return issues.length === before ? items.filter((element) => element !== undefined) : undefined;
    },
  }),
  // Un esquema que, además de validar, pone una marca: el resultado es B, no T.
  brand: <T, B extends T>(base: Schema<T>, test: (value: T) => value is B, message: string): Schema<B> => ({
    parse: (v, path, issues) => {
      const value = base.parse(v, path, issues);
      if (value === undefined) return undefined;
      return test(value) ? value : fail(issues, path, `${message} (${describe(v)})`);
    },
  }),
  optional: <T>(schema: Schema<T>): Schema<T> & { optional: true } => ({ parse: (v, path, issues) => (v === undefined ? undefined : schema.parse(v, path, issues)), optional: true }),
  object: <Shape extends Record<string, Schema<unknown>>>(shape: Shape): Schema<InferObject<Shape>> => ({
    parse: (v, path, issues) => {
      if (typeof v !== 'object' || v === null) return fail(issues, path, 'debe ser un objeto');
      const before = issues.length;
      const result: Record<string, unknown> = {};
      for (const [key, schema] of Object.entries(shape)) {
        const parsed = schema.parse(Reflect.get(v, key), `${path}.${key}`, issues);
        if (parsed !== undefined) result[key] = parsed;
      }
      return issues.length === before ? (result as InferObject<Shape>) : undefined;
    },
  }),
};

// ── El modelo de la tienda: ids y precios con marca ───────────────────────
type Sku = string & { readonly __brand: 'Sku' };
type Pesos = number & { readonly __brand: 'Pesos' };
const isSku = (value: string): value is Sku => /^[A-Z]{3}-\d{2}$/.test(value);
const isPesos = (value: number): value is Pesos => value > 0 && value < 100_000;

const ProductSchema = s.object({
  sku: s.brand(s.text(), isSku, 'debe ser un código como MOL-01'),
  name: s.text(),
  origin: s.optional(s.text()),
  price: s.brand(s.integer(1), isPesos, 'debe ser un precio en pesos'),
  stock: s.integer(0),
  tags: s.list(s.text()),
});
type Product = Infer<typeof ProductSchema>;

// ── La interfaz ───────────────────────────────────────────────────────────
function byId<T extends HTMLElement>(id: string, type: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof type)) throw new Error(`Falta #${id} o no es del tipo esperado`);
  return element;
}
const statusText = byId('status', HTMLParagraphElement);
const inStockBox = byId('in-stock', HTMLInputElement);
const tagSelect = byId('tag', HTMLSelectElement);
const productList = byId('products', HTMLUListElement);
const problems = byId('problems', HTMLDetailsElement);
const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

// Rellena un elemento recién creado (createElement('li') ya devuelve un HTMLLIElement).
function fill<T extends HTMLElement>(node: T, text: string, className = ''): T {
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function productCard(product: Product): HTMLLIElement {
  const card = fill(document.createElement('li'), '', 'card');
  const tags = fill(document.createElement('ul'), '', 'tags');
  tags.setAttribute('aria-label', 'Etiquetas');
  tags.append(...product.tags.map((tag) => fill(document.createElement('li'), `#${tag}`)));
  const inStock = product.stock > 0;
  card.append(
    fill(document.createElement('h2'), product.name),
    fill(document.createElement('p'), `${product.sku} · ${product.origin ?? 'origen sin indicar'}`, 'meta'),
    fill(document.createElement('p'), pesos.format(product.price), 'price'),
    fill(document.createElement('span'), inStock ? `${product.stock} en existencia` : 'Agotado', inStock ? 'stock' : 'stock out'),
    tags,
  );
  return card;
}

let catalog: Product[] = [];

function render(origin: 'carga' | 'filtro'): void {
  const onlyInStock = inStockBox.checked;
  const tag = tagSelect.value;
  const visible = catalog.filter((product) => (!onlyInStock || product.stock > 0) && (tag === '' || product.tags.includes(tag)));
  productList.replaceChildren(...visible.map(productCard));
  const filters = [onlyInStock ? 'con existencias' : '', tag ? `etiqueta «${tag}»` : ''].filter((text) => text !== '');
  const summary = `${visible.length} de ${catalog.length} productos${filters.length ? ` · ${filters.join(' · ')}` : ''}`;
  statusText.textContent = summary;
  if (origin === 'filtro') console.log(`🔎 ${summary}`);
}

async function load(): Promise<void> {
  const response = await fetch('catalog.json');
  if (!response.ok) throw new Error(`El catálogo no se pudo descargar (${response.status})`);
  const data: unknown = await response.json(); // json() devuelve any: lo guardamos como unknown
  const rawItems: unknown = typeof data === 'object' && data !== null ? Reflect.get(data, 'items') : undefined;
  const items: unknown[] = Array.isArray(rawItems) ? rawItems : [];
  const issues: Issue[] = [];
  catalog = items.map((item, index) => ProductSchema.parse(item, `items[${index}]`, issues)).filter((product) => product !== undefined);

  const tags = [...new Set(catalog.flatMap((product) => product.tags))].sort((a, b) => a.localeCompare(b, 'es'));
  tagSelect.append(...tags.map((tag) => new Option(tag, tag)));
  console.log(`📦 ${catalog.length} de ${items.length} productos válidos`);
  if (issues.length > 0) {
    byId('problems-title', HTMLElement).textContent = `${items.length - catalog.length} productos no se pudieron cargar (${issues.length} problemas)`;
    byId('problem-list', HTMLUListElement).replaceChildren(...issues.map((issue) => fill(document.createElement('li'), `${issue.path}: ${issue.message}`)));
    problems.hidden = false;
    for (const issue of issues) console.log(`⚠️ ${issue.path}: ${issue.message}`);
  }
  render('carga');
}

inStockBox.addEventListener('change', () => render('filtro'));
tagSelect.addEventListener('change', () => render('filtro'));
try {
  await load();
  console.log('Listo: marca «Solo con existencias», elige una etiqueta o abre el panel de problemas');
} catch (error) {
  statusText.textContent = error instanceof Error ? error.message : String(error);
  console.warn('⚠️', statusText.textContent);
}
```
