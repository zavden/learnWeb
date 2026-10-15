---
example_description: "El carrito de una tienda de discos conectado con un bus de eventos tipado: los nombres llevan espacio de nombres ('cart:added', 'stock:low'), onNamespace('cart') recibe una unión discriminada de todos los eventos del carrito (infer y Extract sobre plantillas), y cada parte de la interfaz se suscribe por su cuenta y puede darse de baja"
example_tags: "typescript|profesional|eventos|genericos|template-literal-types|infer|uniones-discriminadas|tipos-con-marca|dom|accesibilidad"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="app">
  <header class="top">
    <h1>Discos Tlacuache</h1>
    <p class="badge">Carrito: <strong id="badge">0</strong> discos</p>
  </header>
  <section aria-labelledby="catalog-title">
    <h2 id="catalog-title">Novedades</h2>
    <ul id="catalog" class="catalog"></ul>
  </section>
  <section class="card" aria-labelledby="cart-title">
    <h2 id="cart-title" tabindex="-1">Tu carrito</h2>
    <ul id="lines" class="lines"></ul>
    <p class="total">Total: <strong id="total">$0.00</strong></p>
    <button type="button" id="clear">Vaciar carrito</button>
  </section>
  <p id="alert" class="alert" role="status"></p>
  <p><label class="check"><input id="logging" type="checkbox" checked> Registrar la actividad del carrito</label></p>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #7b8794; --soft: #d9e2ec; --accent: #1d4ed8; --warn: #9a3412; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #f5f7fa; }
.app { max-width: 34rem; margin: 0 auto; padding: 1rem; }
.top { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 0.5rem; }
h1 { font-size: 1.3rem; margin: 0; }
h2 { font-size: 1rem; margin: 0.75rem 0 0.4rem; }
.badge { margin: 0; }
.catalog, .lines { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.4rem; }
.catalog li, .lines li { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; padding: 0.4rem 0.6rem; background: #fff; border: 1px solid var(--soft); border-radius: 0.5rem; }
.card { margin-top: 0.75rem; padding: 0.25rem 0.9rem 0.75rem; background: #fff; border: 1px solid var(--line); border-radius: 0.75rem; }
.lines li { border-style: dashed; }
.total { margin: 0.5rem 0; }
button { font: inherit; padding: 0.3rem 0.75rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; color: var(--ink); cursor: pointer; }
button:disabled { color: #616e7c; cursor: not-allowed; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.alert { min-height: 1.45em; margin: 0.5rem 0 0; color: var(--warn); font-weight: 600; }
.check { display: inline-flex; gap: 0.4rem; align-items: center; }
.log { font-size: 0.85rem; color: var(--muted); }
```

# TypeScript

```typescript
// ── Un bus de eventos con espacios de nombres ─────────────────────────────
type Unsubscribe = () => void;
type Namespace<Name> = Name extends `${infer N}:${string}` ? N : never; // 'cart:added' → 'cart'
type EventsIn<Events, N extends string> = Extract<keyof Events, `${N}:${string}`>;
// Un «sobre» por evento: { type, payload }, una unión discriminada por type.
type Envelope<Events, N extends string> = { [E in EventsIn<Events, N>]: { type: E; payload: Events[E] } }[EventsIn<Events, N>];
type AnyListener = (payload: unknown) => void;

class EventBus<Events extends Record<`${string}:${string}`, unknown>> {
  #listeners = new Map<keyof Events, Set<AnyListener>>();
  #namespaces = new Map<string, Set<(envelope: { type: keyof Events; payload: unknown }) => void>>();

  on<E extends keyof Events>(event: E, listener: (payload: Events[E]) => void): Unsubscribe {
    const set = this.#listeners.get(event) ?? new Set<AnyListener>();
    this.#listeners.set(event, set);
    const stored = listener as AnyListener; // guardados sin tipo; emit los llama con su payload
    set.add(stored);
    return () => set.delete(stored);
  }

  onNamespace<N extends Namespace<keyof Events>>(namespace: N, listener: (envelope: Envelope<Events, N>) => void): Unsubscribe {
    const set = this.#namespaces.get(namespace) ?? new Set();
    this.#namespaces.set(namespace, set);
    const stored = listener as (envelope: { type: keyof Events; payload: unknown }) => void;
    set.add(stored);
    return () => set.delete(stored);
  }

  emit<E extends keyof Events>(event: E, payload: Events[E]): void {
    for (const listener of this.#listeners.get(event) ?? []) listener(payload);
    const namespace = String(event).split(':')[0] ?? '';
    for (const listener of this.#namespaces.get(namespace) ?? []) listener({ type: event, payload });
  }
}

// ── La tienda ─────────────────────────────────────────────────────────────
type Sku = string & { readonly __brand: 'Sku' };
type Album = { sku: Sku; title: string; price: number; stock: number };
type ShopEvents = {
  'cart:added': { album: Album; qty: number };
  'cart:removed': { album: Album };
  'cart:cleared': { lines: number };
  'stock:low': { album: Album; left: number };
};

const sku = (code: string): Sku => code as Sku; // datos escritos a mano: el único sitio con as
const ALBUMS: readonly Album[] = [
  { sku: sku('LP-101'), title: 'Amor prohibido', price: 649, stock: 3 },
  { sku: sku('LP-102'), title: 'Re', price: 699, stock: 2 },
  { sku: sku('CD-103'), title: 'Sones de Veracruz', price: 259, stock: 5 },
];
const bus = new EventBus<ShopEvents>();
const cart = new Map<Sku, number>();
const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

function byId<T extends HTMLElement>(id: string, type: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof type)) throw new Error(`Falta #${id} o no es del tipo esperado`);
  return element;
}
function fill<T extends HTMLElement>(node: T, text: string): T {
  node.textContent = text;
  return node;
}
function makeButton(label: string, accessibleName: string, onClick: () => void): HTMLButtonElement {
  const control = fill(document.createElement('button'), label);
  control.type = 'button';
  control.setAttribute('aria-label', accessibleName);
  control.addEventListener('click', onClick);
  return control;
}
const left = (album: Album): number => album.stock - (cart.get(album.sku) ?? 0);

// ── Las acciones solo cambian el estado y emiten: no saben quién escucha ───
function addToCart(album: Album): void {
  if (left(album) === 0) return;
  cart.set(album.sku, (cart.get(album.sku) ?? 0) + 1);
  bus.emit('cart:added', { album, qty: 1 });
  if (left(album) <= 1) bus.emit('stock:low', { album, left: left(album) });
}
function removeFromCart(album: Album): void {
  if (cart.delete(album.sku)) bus.emit('cart:removed', { album });
}
function clearCart(): void {
  const lines = cart.size;
  cart.clear();
  if (lines > 0) bus.emit('cart:cleared', { lines });
}

// ── Cada parte de la interfaz se suscribe por su cuenta ───────────────────
const catalogList = byId('catalog', HTMLUListElement);
const cartTitle = byId('cart-title', HTMLHeadingElement);
function renderCatalog(): void {
  // Volver a pintar destruye el botón pulsado: se recuerda cuál tenía el foco para devolvérselo.
  const focused = document.activeElement instanceof HTMLElement ? document.activeElement.dataset.sku : undefined;
  catalogList.replaceChildren(...ALBUMS.map((album) => {
    const item = fill(document.createElement('li'), `${album.title} · ${pesos.format(album.price)} `);
    const control = makeButton('Añadir', `Añadir ${album.title} (quedan ${left(album)})`, () => addToCart(album));
    control.dataset.sku = album.sku;
    control.disabled = left(album) === 0;
    item.append(control);
    return item;
  }));
  if (focused === undefined) return;
  const again = catalogList.querySelector(`button[data-sku="${focused}"]`);
  if (again instanceof HTMLButtonElement && !again.disabled) again.focus();
  else cartTitle.focus(); // agotado: el foco pasa al carrito
}
function renderCart(): void {
  const lines = ALBUMS.filter((album) => cart.has(album.sku)).map((album) => {
    const qty = cart.get(album.sku) ?? 0;
    const item = fill(document.createElement('li'), `${album.title} ×${qty} · ${pesos.format(album.price * qty)} `);
    item.append(makeButton('Quitar', `Quitar ${album.title}`, () => {
      removeFromCart(album);
      cartTitle.focus(); // la línea (y su botón) ya no existe
    }));
    return item;
  });
  byId('lines', HTMLUListElement).replaceChildren(...lines);
  const total = ALBUMS.reduce((sum, album) => sum + album.price * (cart.get(album.sku) ?? 0), 0);
  byId('total', HTMLElement).textContent = pesos.format(total);
  byId('badge', HTMLElement).textContent = String([...cart.values()].reduce((sum, qty) => sum + qty, 0));
}
const logList = byId('log', HTMLOListElement);
function report(message: string): void {
  console.log(message);
  logList.append(fill(document.createElement('li'), message));
}

bus.onNamespace('cart', () => {
  renderCatalog();
  renderCart();
});
bus.on('stock:low', ({ album, left: remaining }) => {
  const message = remaining === 0 ? `${album.title}: agotado` : `${album.title}: queda ${remaining}`;
  byId('alert', HTMLParagraphElement).textContent = `⚠️ ${message}`;
  report(`⚠️ stock:low · ${message}`);
});

// El registro escucha TODO el espacio 'cart' con un solo oyente: envelope es una unión discriminada.
function logCart(envelope: Envelope<ShopEvents, 'cart'>): void {
  switch (envelope.type) {
    case 'cart:added':
      return report(`🛒 cart:added · ${envelope.payload.album.title} (+${envelope.payload.qty})`);
    case 'cart:removed':
      return report(`🛒 cart:removed · ${envelope.payload.album.title}`);
    case 'cart:cleared':
      return report(`🛒 cart:cleared · ${envelope.payload.lines} línea(s)`);
  }
}
let stopLogging: Unsubscribe | null = bus.onNamespace('cart', logCart);
byId('logging', HTMLInputElement).addEventListener('change', (event) => {
  if (!(event.currentTarget instanceof HTMLInputElement)) return;
  if (event.currentTarget.checked && stopLogging === null) {
    stopLogging = bus.onNamespace('cart', logCart);
    report('🔔 registro del carrito activado');
  } else if (!event.currentTarget.checked && stopLogging !== null) {
    stopLogging();
    stopLogging = null;
    report('🔕 registro del carrito desactivado');
  }
});
byId('clear', HTMLButtonElement).addEventListener('click', clearCart);

renderCatalog();
renderCart();
console.log('Listo: añade discos (Re solo tiene 2), quita una línea, vacía el carrito o desactiva el registro');
```
