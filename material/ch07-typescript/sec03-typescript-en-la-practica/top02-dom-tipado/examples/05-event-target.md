---
example_description: "En un listener delegado, event.target es EventTarget | null (TS18047 y TS2339 al leer dataset): puede ser cualquier nodo, como el icono dentro de un botón, y entonces data-action no está. instanceof + closest('button') resuelve el tipo y el bug a la vez"
example_tags: "typescript|dom|eventos|delegacion|event-target|closest|ts18047|ts2339|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Tu carrito</h1>
  <ul id="cart" class="cart">
    <li data-sku="CAF-01" data-price="210">Café de Chiapas · $210
      <button type="button" data-action="remove" aria-label="Quitar Café de Chiapas"><span class="icon" aria-hidden="true">🗑️</span> Quitar</button></li>
    <li data-sku="CAC-03" data-price="145">Cacao de Tabasco · $145
      <button type="button" data-action="remove" aria-label="Quitar Cacao de Tabasco"><span class="icon" aria-hidden="true">🗑️</span> Quitar</button></li>
    <li data-sku="VAI-05" data-price="160">Vainilla de Papantla · $160
      <button type="button" data-action="remove" aria-label="Quitar Vainilla de Papantla"><span class="icon" aria-hidden="true">🗑️</span> Quitar</button></li>
  </ul>
  <p>Total: <output id="total">$515</output></p>
  <ol class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2933; background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.15rem; margin: 0 0 0.5rem; }
.cart { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.4rem; }
.cart li { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; padding: 0.4rem 0.6rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; }
button { font: inherit; color: inherit; padding: 0.25rem 0.6rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: #fff; cursor: pointer; }
.icon { font-size: 1.3rem; vertical-align: middle; }
output { font-weight: 700; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; min-height: 1.2rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# TypeScript

```typescript
const cart = document.querySelector('ul');
const totalOutput = document.querySelector('output');
const logList = document.querySelector('ol');
if (!cart || !totalOutput || !logList) throw new Error('Falta un elemento de la página');

const report = (text: string): void => {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
};

// Un solo listener para todos los botones (delegación, capítulo 6).
cart.addEventListener('click', (event) => {
  // 🐛 target es el elemento EXACTO que se pulsó: el botón… o el <span> del icono.
  report(`🐛 target.dataset.action → ${event.target.dataset.action}`); // ❌ Error TS18047 y TS2339 a propósito

  // ✅ instanceof descarta el null y los nodos que no son elementos; closest sube hasta el botón.
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest('button'); // HTMLButtonElement | null: closest también usa el mapa
  const line = button?.closest('li');
  if (!button || !line || button.dataset.action !== 'remove') return;

  line.remove();
  const total = [...cart.querySelectorAll('li')].reduce((sum, item) => sum + Number(item.dataset.price), 0);
  totalOutput.value = `$${total}`;
  report(`✅ ${event.target.localName} → closest('button') → quitar ${line.dataset.sku} · total ${totalOutput.value}`);
});
// event.currentTarget también es EventTarget | null: para el elemento que escucha,
// usa la variable (cart) o this en una function.
report('Listo: pulsa «Quitar» en una línea; prueba también sobre el icono 🗑️');
```
