---
example_description: "Eventos propios tipados: declare global amplía HTMLElementEventMap y DocumentEventMap con 'cart:add' → CustomEvent<CartAdd>, y addEventListener('cart:add', …) da event.detail con su tipo. El mapa tipa a quien escucha, no a quien emite: dispatchEvent acepta cualquier CustomEvent, así que se emite con una función emit tipada"
example_tags: "typescript|dom|eventos-personalizados|customevent|declare-global|htmlelementeventmap|genericos|bug"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main>
  <header class="bar">
    <h1>Tienda de la sierra</h1>
    <p class="badge">🛒 <output id="count">0</output> · <output id="total">$0</output></p>
  </header>
  <ul class="products">
    <li data-sku="CAF-01" data-name="Café de Chiapas" data-price="210">Café de Chiapas · $210 <button type="button" aria-label="Añadir Café de Chiapas">Añadir</button></li>
    <li data-sku="VAI-05" data-name="Vainilla de Papantla" data-price="160">Vainilla de Papantla · $160 <button type="button" aria-label="Añadir Vainilla de Papantla">Añadir</button></li>
  </ul>
  <p><button type="button" id="broken">Simular un evento mal formado</button></p>
  <ol class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2933; background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
.bar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.5rem; }
h1 { font-size: 1.15rem; margin: 0; }
.badge { margin: 0; padding: 0.2rem 0.6rem; border-radius: 1rem; background: #1f2933; color: #fff; }
.products { list-style: none; margin: 0.75rem 0; padding: 0; display: grid; gap: 0.4rem; }
.products li { display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0.6rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; }
button { font: inherit; color: inherit; padding: 0.25rem 0.7rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: #fff; cursor: pointer; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; min-height: 1.2rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# TypeScript

```typescript
// ── Un solo sitio para los eventos de la tienda: nombre → datos (detail) ──
type ShopEvents = {
  'cart:add': { sku: string; name: string; price: number };
  'cart:clear': null;
};
type ShopEventMap = { [K in keyof ShopEvents]: CustomEvent<ShopEvents[K]> };

// declare global: amplía las interfaces del navegador (lib.dom.d.ts) desde este archivo.
declare global {
  interface HTMLElementEventMap extends ShopEventMap {} // elements.addEventListener
  interface DocumentEventMap extends ShopEventMap {} // document.addEventListener
}

// Emitir con tipos: el nombre fija K, y detail tiene que ser ShopEvents[K].
function emit<K extends keyof ShopEvents>(target: EventTarget, type: K, detail: ShopEvents[K]): void {
  target.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }));
}

// ── Quien escucha: event es CustomEvent<{ sku; name; price }>, sin anotar nada ──
const countOutput = document.getElementById('count'); // HTMLElement | null
const totalOutput = document.getElementById('total');
const logList = document.querySelector('ol');
let count = 0;
let total = 0;
const report = (text: string): void => {
  console.log(text);
  logList?.append(Object.assign(document.createElement('li'), { textContent: text }));
};

document.addEventListener('cart:add', (event) => {
  const { name, price } = event.detail; // string y number
  count += 1;
  total += price;
  if (countOutput) countOutput.textContent = String(count);
  if (totalOutput) totalOutput.textContent = `$${total}`;
  report(`🛒 ${event.type} · ${name} ($${price}) · ${count} en el carrito · total $${total}`);
});

// ── Quien emite: cada botón «Añadir» ──
document.querySelector('.products')?.addEventListener('click', (event) => {
  if (!(event.target instanceof HTMLButtonElement)) return;
  const item = event.target.closest('li');
  if (!item) return;
  const { sku = '', name = '', price = '' } = item.dataset; // dataset: string | undefined
  emit(event.target, 'cart:add', { sku, name, price: Number(price) });
  // emit(event.target, 'cart:add', { sku, name }) sería un error: falta price.
});

// 🐛 El mapa no protege a quien emite: dispatchEvent acepta cualquier Event.
document.querySelector('#broken')?.addEventListener('click', (event) => {
  event.target?.dispatchEvent(new CustomEvent('cart:add', { detail: { sku: 'CAF-01', qty: 'dos' }, bubbles: true }));
});
report('Listo: pulsa «Añadir» en un producto o «Simular un evento mal formado»');
```
