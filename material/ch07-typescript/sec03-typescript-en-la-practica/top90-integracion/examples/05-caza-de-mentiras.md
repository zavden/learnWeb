---
example_description: "Cuatro mentiras clásicas de TypeScript en el navegador, sin un solo error de tipos, cada una junto a su versión honrada: querySelector<T> sobre un <select>, json() as Product, event.target leído sin comprobar y una promesa flotante (el rechazo llega a unhandledrejection). La página las ejecuta al cargar y marca cada resultado"
example_tags: "typescript|integracion|bug|queryselector|json|event-target|promesa-flotante|unhandledrejection|asercion"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Caza de mentiras</h1>
  <p><label for="qty">Frascos de mole ($165)</label> <select id="qty"><option>1</option><option selected>2</option><option>3</option></select></p>
  <p><button type="button" id="remove"><span class="icon" aria-hidden="true">🗑️</span> Quitar del carrito</button></p>
  <ol class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2933; background: #f5f7fa; }
main { max-width: 34rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.15rem; margin: 0 0 0.5rem; }
select, button { font: inherit; color: inherit; padding: 0.2rem 0.6rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: #fff; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# TypeScript

```typescript
// Usa assets/catalog-v1.json: precios en texto.
type Product = { sku: string; name: string; price: number };
const logList = document.querySelector('ol');
const report = (text: string): void => {
  console.log(text);
  logList?.append(Object.assign(document.createElement('li'), { textContent: text }));
};

// ── 1. querySelector<T>: una aserción con otra sintaxis (lección 2) ───────
const lyingQty = document.querySelector<HTMLInputElement>('#qty'); // el HTML tiene un <select>
report(`🐛 1 · <HTMLInputElement> → total ${lyingQty ? lyingQty.valueAsNumber * 165 : 0}`);
const realQty = document.querySelector('#qty');
report(`✅ 1 · instanceof → total ${realQty instanceof HTMLSelectElement ? Number(realQty.value) * 165 : 0}`);

// ── 2. json() as Product[]: nadie lo comprueba (lección 3) ────────────────
const response = await fetch('catalog-v1.json');
const lyingProducts = (await response.json()) as Product[];
report(`🐛 2 · as Product[] → total ${lyingProducts.reduce((sum, product) => sum + product.price, 0)}`);
const data: unknown = await (await fetch('catalog-v1.json')).json();
const valid = Array.isArray(data) ? data.filter((item: unknown): item is Product =>
  typeof item === 'object' && item !== null && 'price' in item && typeof item.price === 'number') : [];
report(`✅ 2 · unknown + predicado → ${valid.length} productos válidos de ${Array.isArray(data) ? data.length : 0}`);

// ── 3. event.target sin comprobar (lección 2) ─────────────────────────────
const removeButton = document.querySelector('button'); // HTMLButtonElement | null
if (removeButton) {
  removeButton.addEventListener('click', (event) => {
    const lyingTarget = event.target as HTMLButtonElement; // «seguro que es el botón»
    lyingTarget.disabled = true; // en un <span> solo crea una propiedad suelta
    report(`🐛 3 · as HTMLButtonElement → target <${lyingTarget.localName}> · ¿botón desactivado? ${removeButton.disabled}`);
    const button = event.target instanceof Element ? event.target.closest('button') : null;
    if (button) button.disabled = true;
    report(`✅ 3 · closest('button') → ¿botón desactivado? ${removeButton.disabled}`);
  });
  document.querySelector('#remove .icon')?.dispatchEvent(new MouseEvent('click', { bubbles: true })); // un clic sobre el icono
}

// ── 4. Una promesa flotante (lección 3) ───────────────────────────────────
const escaped = new Promise<void>((resolve) => {
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault(); // la página lo registra; así no sale además como «Uncaught»
    report(`🐛 4 · sin await → el error escapó del try: ${String(event.reason)}`);
    resolve();
  }, { once: true });
});
async function saveCart(): Promise<void> {
  const saved = await fetch('/api/demo/echo?status=500', { method: 'POST' });
  if (!saved.ok) throw new Error(`HTTP ${saved.status} al guardar el carrito`);
}
try {
  saveCart(); // sin await: el try termina antes de que falle
} catch {
  report('nunca llega aquí');
}
await escaped; // espera a que el rechazo sin dueño llegue a unhandledrejection
try {
  await saveCart();
} catch (error) {
  report(`✅ 4 · con await → el catch lo recibe: ${String(error)}`);
}
```
