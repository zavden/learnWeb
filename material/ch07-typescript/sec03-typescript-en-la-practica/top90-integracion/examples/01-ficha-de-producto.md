---
example_description: "La ficha de un producto con las cuatro lecciones juntas: el producto llega de producto.json y se valida desde unknown, la página se busca con un $ que comprueba, «Añadir» emite un cart:add tipado con declare global, una clase Cart con parameter properties y #líneas lo recoge, y «Pagar» envía el pedido a /api/demo/echo y recibe un Result"
example_tags: "typescript|integracion|clases|parameter-properties|dom|customevent|declare-global|fetch|validacion|result"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <article class="product" aria-busy="true">
    <h1 id="name">Cargando…</h1>
    <p id="description"></p>
    <p class="buy">
      <strong id="price"></strong>
      <label for="qty">Frascos</label>
      <select id="qty"><option>1</option><option>2</option><option>3</option></select>
      <button type="button" id="add" disabled>Añadir al carrito</button>
    </p>
  </article>
  <section class="cart" aria-labelledby="cart-title">
    <h2 id="cart-title">Carrito</h2>
    <p id="summary">Vacío</p>
    <button type="button" id="pay" disabled>Pagar</button>
  </section>
  <ol class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2933; background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; display: grid; gap: 0.75rem; }
.product, .cart { padding: 0.5rem 1rem; border: 1px solid #cbd2d9; border-radius: 0.75rem; background: #fff; }
h1 { font-size: 1.15rem; margin: 0.25rem 0; }
h2 { font-size: 1rem; margin: 0.25rem 0; }
.buy { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
select, button { font: inherit; color: inherit; padding: 0.25rem 0.6rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: #fff; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.6; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { margin: 0; padding: 0.5rem 0.5rem 0.5rem 2rem; min-height: 1.2rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# TypeScript

```typescript
// ── Tipos y validación (módulo 2, lección 3) ──────────────────────────────
type Product = { sku: string; name: string; description: string; cents: number; stock: number };
type CartAdd = { sku: string; name: string; cents: number; qty: number };
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
function isProduct(value: unknown): value is Product {
  return isRecord(value) && typeof value.sku === 'string' && typeof value.name === 'string' &&
    typeof value.description === 'string' && Number.isInteger(value.cents) && Number.isInteger(value.stock);
}

// ── Los eventos de la tienda, en el mapa del navegador (lección 2) ────────
declare global {
  interface DocumentEventMap {
    'cart:add': CustomEvent<CartAdd>;
  }
}

// ── El carrito: estado con reglas, así que una clase (lección 1) ──────────
class Cart {
  #lines = new Map<string, CartAdd>();

  constructor(private readonly maxPerProduct: number) {}

  add(line: CartAdd): string | null {
    const current = this.#lines.get(line.sku)?.qty ?? 0;
    if (current + line.qty > this.maxPerProduct) return `el máximo es ${this.maxPerProduct} frascos (ya tienes ${current})`;
    this.#lines.set(line.sku, { ...line, qty: current + line.qty });
    return null;
  }
  get count(): number {
    return [...this.#lines.values()].reduce((sum, line) => sum + line.qty, 0);
  }
  get totalCents(): number {
    return [...this.#lines.values()].reduce((sum, line) => sum + line.qty * line.cents, 0);
  }
  lines(): CartAdd[] {
    return [...this.#lines.values()].map((line) => ({ ...line }));
  }
}

// ── La página ─────────────────────────────────────────────────────────────
function $<T extends Element>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Falta «${selector}» o no es un ${type.name}`);
  return element;
}
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const logList = $('.log', HTMLOListElement);
const report = (text: string): void => {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
};

async function loadProduct(url: string): Promise<Result<Product>> {
  try {
    const response = await fetch(url);
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    const data: unknown = await response.json();
    return isProduct(data) ? { ok: true, value: data } : { ok: false, error: 'el producto no tiene la forma esperada' };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function sendOrder(lines: CartAdd[]): Promise<Result<number>> {
  try {
    const response = await fetch('/api/demo/echo?status=201', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines }),
    });
    const data: unknown = await response.json();
    // El servidor de prueba devuelve lo que recibe: se comprueba igual que si fuera de otro.
    const echoed = isRecord(data) && isRecord(data.body) && Array.isArray(data.body.lines) ? data.body.lines.length : null;
    if (!response.ok || echoed === null) return { ok: false, error: `respuesta inesperada (${response.status})` };
    return { ok: true, value: response.status };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

const loaded = await loadProduct('producto.json');
if (!loaded.ok) {
  report(`⚠️ no se pudo cargar el producto: ${loaded.error}`);
} else {
  const product = loaded.value;
  const cart = new Cart(product.stock);
  const addButton = $('#add', HTMLButtonElement);
  const payButton = $('#pay', HTMLButtonElement);
  const qty = $('#qty', HTMLSelectElement);

  $('#name', HTMLHeadingElement).textContent = product.name;
  $('#description', HTMLParagraphElement).textContent = product.description;
  $('#price', HTMLElement).textContent = money.format(product.cents / 100);
  $('.product', HTMLElement).setAttribute('aria-busy', 'false');
  addButton.disabled = false;

  // Quien emite: el detail se comprueba contra CartAdd al escribirlo.
  addButton.addEventListener('click', () => {
    const detail: CartAdd = { sku: product.sku, name: product.name, cents: product.cents, qty: Number(qty.value) };
    document.dispatchEvent(new CustomEvent('cart:add', { detail }));
  });

  // Quien escucha: event.detail es un CartAdd sin anotar nada.
  document.addEventListener('cart:add', (event) => {
    const problem = cart.add(event.detail);
    if (problem) return report(`⚠️ ${event.detail.name}: ${problem}`);
    $('#summary', HTMLParagraphElement).textContent = `${cart.count} frasco(s) · ${money.format(cart.totalCents / 100)}`;
    payButton.disabled = false;
    report(`🛒 +${event.detail.qty} ${event.detail.name} → ${cart.count} en el carrito`);
  });

  payButton.addEventListener('click', async () => {
    payButton.disabled = true;
    const result = await sendOrder(cart.lines());
    report(result.ok ? `✅ ${result.value} · pedido enviado: ${money.format(cart.totalCents / 100)}` : `⚠️ ${result.error}`);
    payButton.disabled = false;
  });
  report(`Listo: ${product.name} (${product.stock} en almacén). Elige los frascos, pulsa «Añadir al carrito» y «Pagar»`);
}
```
