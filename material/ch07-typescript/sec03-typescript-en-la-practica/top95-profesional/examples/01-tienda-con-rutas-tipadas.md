---
example_description: "Una tienda de una sola página con un router tipado: las rutas son patrones con parámetros (/producto/:sku) de los que salen, con tipos de plantilla e infer, los parámetros de cada vista y los enlaces; la navegación usa el fragmento (#/…), hashchange y el historial, con el foco y el título al día y un aviso si la tarjeta aislada no deja guardar el historial"
example_tags: "typescript|profesional|router|template-literal-types|infer|hashchange|history|accesibilidad|dom"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<header class="bar">
  <p class="brand">Tienda de la sierra</p>
  <nav aria-label="Principal">
    <a href="#/">Inicio</a>
    <a href="#/categoria/despensa">Despensa</a>
    <a href="#/categoria/bebidas">Bebidas</a>
    <a href="#/carrito">Carrito (<span id="cart-count">0</span>)</a>
  </nav>
</header>
<main>
  <p class="tools"><button type="button" id="back" disabled>← Atrás</button></p>
  <h1 id="view-title" tabindex="-1">Cargando…</h1>
  <div id="view-body" class="view"></div>
  <p id="note" class="note" hidden></p>
  <ol class="log" aria-label="Registro de navegación"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #cbd2d9; --accent: #9a3412; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #f5f7fa; }
.bar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; background: #fff; border-bottom: 1px solid var(--line); }
.brand { margin: 0; font-weight: 700; }
nav { display: flex; flex-wrap: wrap; gap: 0.75rem; }
nav a { color: var(--accent); text-underline-offset: 0.2em; }
nav a[aria-current="page"] { color: var(--ink); font-weight: 700; text-decoration: none; }
main { max-width: 34rem; margin: 0 auto; padding: 0.5rem 1rem 1rem; }
h1 { font-size: 1.25rem; margin: 0.25rem 0 0.5rem; }
h1:focus { outline: none; }
.view { display: grid; gap: 0.5rem; }
.card { padding: 0.5rem 0.75rem; border: 1px solid var(--line); border-radius: 0.6rem; background: #fff; }
.card a { color: var(--accent); }
button { font: inherit; color: inherit; padding: 0.3rem 0.8rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: #fff; cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.55; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.note { padding: 0.4rem 0.6rem; border-radius: 0.5rem; background: #fef3c7; }
.note[hidden] { display: none; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; color: var(--muted); }
```

# TypeScript

```typescript
// Tienda con rutas tipadas.
//
// Decisiones de diseño:
// - Las rutas se escriben UNA vez, como patrones. De cada patrón salen, con tipos de
//   plantilla e infer (módulo 2), los parámetros de su vista y la firma de href(): un enlace
//   a /producto/:sku sin sku no compila.
// - Rutas con fragmento (#/producto/MOL-01): funcionan al recargar y en la tarjeta aislada.
//   El historial guarda la profundidad para que «← Atrás» no saque al usuario de la página;
//   en la tarjeta (origen null) replaceState lanza SecurityError y se avisa en la página.
// - Cada vista se pinta con textContent (los parámetros vienen de la URL), mueve el foco al
//   título y actualiza document.title y aria-current.
//
// Alcance: todo el curso hasta el módulo «TypeScript en la práctica».

// ── Rutas y tipos ─────────────────────────────────────────────────────────
const ROUTES = {
  home: '/',
  category: '/categoria/:slug',
  product: '/producto/:sku',
  cart: '/carrito',
} as const satisfies Record<string, `/${string}`>;
type RouteName = keyof typeof ROUTES;
type ParamNames<P extends string> =
  P extends `${string}:${infer Name}/${infer Rest}` ? Name | ParamNames<`/${Rest}`>
  : P extends `${string}:${infer Name}` ? Name : never;
type Params<P extends string> = { [K in ParamNames<P>]: string };
type View = { title: string; body: Node[] };
type Views = { [R in RouteName]: (params: Params<(typeof ROUTES)[R]>) => View };

function match<P extends string>(pattern: P, path: string): Params<P> | null {
  const names: string[] = [];
  const source = pattern.replace(/:(\w+)/g, (_whole, name: string) => {
    names.push(name);
    return '([^/]+)';
  });
  const found = new RegExp(`^${source}$`).exec(path);
  if (!found) return null;
  const params: Record<string, string> = {};
  names.forEach((name, index) => { params[name] = decodeURIComponent(found[index + 1] ?? ''); });
  return params as Params<P>; // las claves salen del mismo patrón que el tipo
}

// Sin parámetros, href(ROUTES.cart); con ellos, href(ROUTES.product, { sku }) es obligatorio.
function href<P extends string>(pattern: P, ...args: ParamNames<P> extends never ? [] : [Params<P>]): string {
  const values: Partial<Record<string, string>> = args[0] ?? {};
  return `#${pattern.replace(/:(\w+)/g, (_whole, name: string) => encodeURIComponent(values[name] ?? ''))}`;
}

// ── Datos ─────────────────────────────────────────────────────────────────
const CATEGORIES = { despensa: 'Despensa', bebidas: 'Bebidas' } as const;
type CategorySlug = keyof typeof CATEGORIES;
type Product = { sku: string; name: string; cents: number; category: CategorySlug };
const PRODUCTS: readonly Product[] = [
  { sku: 'MOL-01', name: 'Mole negro', cents: 16500, category: 'despensa' },
  { sku: 'VAI-05', name: 'Vainilla de Papantla', cents: 16000, category: 'despensa' },
  { sku: 'CAF-02', name: 'Café de Chiapas', cents: 21000, category: 'bebidas' },
  { sku: 'MEZ-04', name: 'Mezcal espadín', cents: 54000, category: 'bebidas' },
];
const cart = new Map<string, number>();
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const isCategory = (value: string): value is CategorySlug => Object.hasOwn(CATEGORIES, value);

// ── DOM ───────────────────────────────────────────────────────────────────
function $<T extends Element>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Falta «${selector}» o no es un ${type.name}`);
  return element;
}
const titleHeading = $('#view-title', HTMLHeadingElement);
const viewBody = $('#view-body', HTMLDivElement);
const backButton = $('#back', HTMLButtonElement);
const cartCount = $('#cart-count', HTMLSpanElement);
const note = $('#note', HTMLParagraphElement);
const logList = $('.log', HTMLOListElement);
const report = (text: string): void => {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
};
function el<K extends keyof HTMLElementTagNameMap>(tag: K, text = '', className = ''): HTMLElementTagNameMap[K] {
  return Object.assign(document.createElement(tag), { textContent: text, className });
}
function link(text: string, to: string): HTMLAnchorElement {
  return Object.assign(document.createElement('a'), { textContent: text, href: to });
}
function productCard(product: Product): HTMLElement {
  const card = el('article', '', 'card');
  card.append(link(product.name, href(ROUTES.product, { sku: product.sku })), ` · ${money.format(product.cents / 100)}`);
  return card;
}
const notFound = (what: string): View => ({ title: 'No encontrado', body: [el('p', `No encontramos ${what}.`), link('Volver al inicio', href(ROUTES.home))] });

// ── Vistas: cada una recibe SUS parámetros, ya tipados ────────────────────
const VIEWS: Views = {
  home: () => ({ title: 'Inicio', body: PRODUCTS.map(productCard) }),
  category: ({ slug }) => isCategory(slug)
    ? { title: CATEGORIES[slug], body: PRODUCTS.filter((product) => product.category === slug).map(productCard) }
    : notFound(`la categoría «${slug}»`),
  product: ({ sku }) => {
    const product = PRODUCTS.find((item) => item.sku === sku);
    if (!product) return notFound(`el producto «${sku}»`);
    const add = el('button', 'Añadir al carrito');
    add.type = 'button';
    add.addEventListener('click', () => {
      cart.set(product.sku, (cart.get(product.sku) ?? 0) + 1);
      cartCount.textContent = String([...cart.values()].reduce((sum, qty) => sum + qty, 0));
      report(`🛒 ${product.name} → ${cartCount.textContent} en el carrito`);
    });
    return { title: product.name, body: [el('p', `${money.format(product.cents / 100)} · ${CATEGORIES[product.category]}`), add] };
  },
  cart: () => {
    const lines = [...cart].flatMap(([sku, qty]) => {
      const product = PRODUCTS.find((item) => item.sku === sku);
      return product ? [el('p', `${qty} × ${product.name} · ${money.format((qty * product.cents) / 100)}`, 'card')] : [];
    });
    return { title: `Carrito (${cartCount.textContent})`, body: lines.length > 0 ? lines : [el('p', 'Tu carrito está vacío.')] };
  },
};

function renderRoute<R extends RouteName>(name: R, params: Params<(typeof ROUTES)[R]>): View {
  return VIEWS[name](params);
}
function resolve(path: string): View {
  for (const name of Object.keys(ROUTES) as RouteName[]) { // Object.keys da string[]: módulo 2
    const params = match(ROUTES[name], path);
    if (params) return renderRoute(name, params);
  }
  return notFound(`la página «${path}»`);
}

// ── Navegación ────────────────────────────────────────────────────────────
function currentDepth(): number {
  const state: unknown = history.state; // history.state es any: lo que guardó cualquiera
  return typeof state === 'object' && state !== null && 'depth' in state && typeof state.depth === 'number' ? state.depth : 0;
}
let shownDepth = 0;

function render({ focus }: { focus: boolean }): void {
  const path = location.hash.slice(1) || '/';
  const view = resolve(path);
  titleHeading.textContent = view.title;
  viewBody.replaceChildren(...view.body);
  document.title = `${view.title} · Tienda de la sierra`;
  for (const anchor of document.querySelectorAll('nav a')) {
    if (anchor.getAttribute('href') === `#${path}`) anchor.setAttribute('aria-current', 'page');
    else anchor.removeAttribute('aria-current');
  }
  backButton.disabled = currentDepth() === 0;
  if (focus) titleHeading.focus(); // el lector de pantalla anuncia la vista nueva
  report(`🧭 #${path} → ${view.title}`);
}

window.addEventListener('hashchange', () => {
  try {
    if (history.state === null) history.replaceState({ depth: shownDepth + 1 }, ''); // un enlace: entrada nueva
    shownDepth = currentDepth();
  } catch {
    // tarjeta aislada: ya se avisó al cargar
  }
  render({ focus: true });
});
backButton.addEventListener('click', () => history.back());

try {
  history.replaceState({ depth: 0 }, '');
} catch (error) {
  note.hidden = false;
  note.textContent = `Esta tarjeta es un iframe aislado (origen null) y no guarda el historial (${error instanceof Error ? error.name : 'error'}): ábrela con ▶ o en el editor para usar «← Atrás».`;
}
render({ focus: false });
report('Listo: abre «Mole negro», añádelo al carrito, ve a «Carrito» y vuelve con «← Atrás»');
```
