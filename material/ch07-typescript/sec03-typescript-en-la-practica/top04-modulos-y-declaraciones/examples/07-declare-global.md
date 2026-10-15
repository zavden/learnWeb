---
example_description: "declare global amplía los tipos globales desde un módulo: con interface Window { dataLayer: …; __SHOP_STATE__: … }, window.dataLayer.push (el patrón de las herramientas de analítica) y el estado que deja el servidor en la página quedan tipados. Sin la ampliación, window.dataLayer es TS2339"
example_tags: "typescript|declare-global|window|globales|fusion-de-declaraciones|analitica"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Lo que escribe el servidor en la página, antes de cualquier otro script. -->
<script>
  window.dataLayer = window.dataLayer || [];
  window.__SHOP_STATE__ = { customer: { name: 'Lucía Méndez', tier: 'gold' }, cartCount: 2 };
</script>
<main>
  <h1>Hola, <span id="customer">…</span></h1>
  <p><button type="button" id="buy">Comprar ahora</button></p>
  <ol class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2933; background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.15rem; margin: 0 0 0.5rem; }
button { font: inherit; color: #fff; padding: 0.35rem 0.9rem; border: 1px solid #9a3412; border-radius: 0.5rem; background: #9a3412; cursor: pointer; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; min-height: 1.2rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# TypeScript

```typescript
type AnalyticsEvent = { event: 'page_view' | 'purchase'; value?: number };
type ShopState = { customer: { name: string; tier: 'basic' | 'gold' }; cartCount: number };

// Window es una interfaz de lib.dom.d.ts: estas líneas se FUSIONAN con ella (módulo 1).
// Sin ellas, window.dataLayer sería TS2339: «Property 'dataLayer' does not exist on
// type 'Window & typeof globalThis'».
declare global {
  interface Window {
    dataLayer: AnalyticsEvent[];
    __SHOP_STATE__: ShopState;
  }
}

const logList = document.querySelector('ol');
const report = (text: string): void => {
  console.log(text);
  logList?.append(Object.assign(document.createElement('li'), { textContent: text }));
};

const state = window.__SHOP_STATE__; // ShopState
const customerName = document.getElementById('customer');
if (customerName) customerName.textContent = state.customer.name;
window.dataLayer.push({ event: 'page_view' }); // { event: 'pageview' } sería un error
report(`👤 ${state.customer.name} (${state.customer.tier}) · ${state.cartCount} en el carrito · eventos: ${window.dataLayer.length}`);

document.getElementById('buy')?.addEventListener('click', () => {
  window.dataLayer.push({ event: 'purchase', value: 1089 });
  report(`📊 ${JSON.stringify(window.dataLayer.at(-1))} · eventos: ${window.dataLayer.length}`);
});
report('Listo: pulsa «Comprar ahora»');
```
