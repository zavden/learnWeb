---
example_description: "Un bus de eventos sobre el EventTarget del navegador, con tipos: TypedEventTarget<M> envuelve CustomEvent para que on('cart:added', …) reciba el detail de ese evento y emit() exija los datos correctos; las bajas usan AbortSignal, como addEventListener. Cuatro piezas de una tienda (catálogo, contador, avisos y analítica) se comunican sin conocerse"
example_tags: "typescript|profesional|eventtarget|customevent|genericos|keyof|abortsignal|pub-sub|accesibilidad|dom"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<header class="bar">
  <h1>Discos de la colonia Roma</h1>
  <p class="badge" aria-live="polite">🛒 <span id="count">0</span> discos</p>
</header>
<main>
  <ul id="catalog" class="catalog"></ul>
  <p class="check"><input id="tracking" type="checkbox" checked><label for="tracking">Enviar estadísticas de uso</label></p>
  <p id="toast" class="toast" role="status"></p>
  <ol class="log" aria-label="Registro de estadísticas"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #cbd2d9; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #f5f7fa; }
.bar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; background: #fff; border-bottom: 1px solid var(--line); }
h1 { font-size: 1.1rem; margin: 0; }
.badge { margin: 0; padding: 0.2rem 0.7rem; border-radius: 1rem; background: #1f2933; color: #fff; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
.catalog { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.4rem; }
.catalog li { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; padding: 0.4rem 0.6rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; }
button { font: inherit; color: inherit; padding: 0.2rem 0.6rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: #fff; cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.55; }
.check { display: flex; align-items: center; gap: 0.4rem; }
.toast { min-height: 1.45em; font-weight: 600; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { margin: 0.5rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; color: var(--muted); }
```

# TypeScript

```typescript
// Bus de eventos tipado sobre EventTarget.
//
// Decisiones de diseño:
// - En vez de reinventar los oyentes, TypedEventTarget<M> extiende EventTarget: hereda el orden,
//   once, las bajas con AbortSignal y la protección ante un oyente que lanza. Lo que añade son
//   los tipos: M es un mapa «nombre → detail», y on/emit relacionan el nombre con sus datos
//   (K extends keyof M & string), como HTMLElementEventMap con addEventListener.
// - Dentro de on hay una comprobación instanceof CustomEvent: así no hace falta ningún as.
// - Las piezas no se conocen: el catálogo emite, y el contador, los avisos y la analítica
//   escuchan. Desactivar la analítica es abortar su señal.
//
// Alcance: todo el curso hasta el módulo «TypeScript en la práctica».

class TypedEventTarget<M extends Record<string, unknown>> extends EventTarget {
  on<K extends keyof M & string>(type: K, listener: (detail: M[K]) => void, options?: { signal?: AbortSignal; once?: boolean }): void {
    this.addEventListener(type, (event) => {
      if (event instanceof CustomEvent) listener(event.detail); // detail: any → se entrega como M[K]
    }, options);
  }
  emit<K extends keyof M & string>(type: K, detail: M[K]): boolean {
    return this.dispatchEvent(new CustomEvent(type, { detail }));
  }
}

// ── Los eventos de la tienda: nombre → datos ──────────────────────────────
type Album = { id: string; title: string; artist: string; stock: number };
type ShopEvents = {
  'cart:added': { album: Album; quantity: number };
  'stock:out': { album: Album };
};
const bus = new TypedEventTarget<ShopEvents>();
// bus.emit('cart:added', { album }) sería un error: falta quantity. bus.on('cart:add', …), otro.

// ── Pieza 1: el catálogo (solo emite) ─────────────────────────────────────
const ALBUMS: Album[] = [
  { id: 're', title: 'Re', artist: 'Café Tacvba', stock: 2 },
  { id: 'amor', title: 'Amor prohibido', artist: 'Selena', stock: 5 },
  { id: 'circo', title: 'El circo', artist: 'Maldita Vecindad', stock: 1 },
];
function $<T extends Element>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Falta «${selector}» o no es un ${type.name}`);
  return element;
}
const catalog = $('#catalog', HTMLUListElement);
catalog.replaceChildren(...ALBUMS.map((album) => {
  const item = Object.assign(document.createElement('li'), { textContent: `${album.title} · ${album.artist}` });
  const button = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Añadir' });
  button.dataset.id = album.id;
  button.setAttribute('aria-label', `Añadir ${album.title}`);
  item.append(button);
  return item;
}));
catalog.addEventListener('click', (event) => {
  const button = event.target instanceof Element ? event.target.closest('button') : null;
  const album = ALBUMS.find((item) => item.id === button?.dataset.id);
  if (!button || !album || album.stock === 0) return;
  album.stock -= 1;
  bus.emit('cart:added', { album, quantity: 1 });
  if (album.stock === 0) {
    button.disabled = true;
    bus.emit('stock:out', { album });
  }
});

// ── Pieza 2: el contador del carrito ──────────────────────────────────────
const countText = $('#count', HTMLSpanElement);
let inCart = 0;
bus.on('cart:added', ({ quantity }) => { // detail: { album: Album; quantity: number }
  inCart += quantity;
  countText.textContent = String(inCart);
});

// ── Pieza 3: los avisos ───────────────────────────────────────────────────
const toast = $('#toast', HTMLParagraphElement);
bus.on('cart:added', ({ album }) => { toast.textContent = `«${album.title}» está en tu carrito`; });
bus.on('stock:out', ({ album }) => { toast.textContent = `«${album.title}» se ha agotado`; });

// ── Pieza 4: la analítica, que se puede desactivar ────────────────────────
const logList = $('.log', HTMLOListElement);
const track = (text: string): void => {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
};
let analytics: AbortController | null = null;
function startAnalytics(): void {
  analytics = new AbortController();
  const { signal } = analytics;
  bus.on('cart:added', ({ album, quantity }) => track(`📈 cart:added · ${album.id} ×${quantity} · quedan ${album.stock}`), { signal });
  bus.on('stock:out', ({ album }) => track(`📉 stock:out · ${album.id}`), { signal });
}
$('#tracking', HTMLInputElement).addEventListener('change', (event) => {
  const enabled = event.currentTarget instanceof HTMLInputElement && event.currentTarget.checked;
  if (enabled) startAnalytics();
  else analytics?.abort(); // una sola llamada quita todos sus oyentes
  track(enabled ? '🔔 estadísticas activadas' : '🔕 estadísticas desactivadas');
});

startAnalytics();
track('Listo: añade discos (de «El circo» solo queda 1), desmarca las estadísticas y sigue añadiendo');
```
