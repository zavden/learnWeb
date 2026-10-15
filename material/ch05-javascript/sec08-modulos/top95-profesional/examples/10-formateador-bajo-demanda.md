---
example_description: "Code splitting de un formateador pesado: el importe con letra de una factura (MIL CIENTO SETENTA Y NUEVE PESOS 00/100 M.N.) se carga con import() solo al usarlo, se precarga cuando el puntero o el teclado llegan al botón y se reintenta si falla"
example_tags: "javascript|profesional|modulos|import-dinamico|code-splitting|precarga|facturas"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="invoice" aria-labelledby="invoice-title">
  <h1 id="invoice-title">Factura F-2026-0412</h1>
  <dl class="summary">
    <div><dt>Cliente</dt><dd>Mariana Gómez</dd></div>
    <div><dt>Subtotal</dt><dd id="subtotal"></dd></div>
    <div><dt>IVA (16 %)</dt><dd id="vat"></dd></div>
    <div class="grand"><dt>Total</dt><dd id="total"></dd></div>
  </dl>
  <button type="button" id="in-words">Escribir el importe con letra</button>
  <p id="words" class="words" aria-live="polite"></p>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #0f172a; background: #f1f5f9; line-height: 1.5; }
.invoice { max-width: 30rem; margin: 1.5rem auto; padding: 1.25rem 1.5rem; border-radius: 0.75rem; background: #fff; box-shadow: 0 1px 3px rgb(0 0 0 / 0.15); }
.invoice h1 { margin: 0 0 0.75rem; font-size: 1.25rem; }
.summary { margin: 0 0 1rem; }
.summary div { display: flex; justify-content: space-between; gap: 1rem; padding: 0.3rem 0; border-bottom: 1px solid #e2e8f0; }
.summary dt { color: #475569; }
.summary dd { margin: 0; font-variant-numeric: tabular-nums; }
.grand { font-weight: 700; }
button { font: inherit; padding: 0.55rem 1rem; border: 0; border-radius: 0.5rem; background: #0f766e; color: #fff; cursor: pointer; }
button:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }
.words { min-height: 3em; margin: 0.75rem 0 0; font-family: Menlo, Consolas, monospace; font-size: 0.9rem; letter-spacing: 0.02em; }
```

# JavaScript

```javascript
// UN FORMATEADOR PESADO, CARGADO SOLO CUANDO HACE FALTA.
//
// Archivos (assets/10-factura/):
//   amount-in-words.js → amountInWords(centavos): el importe con letra
//   lazy.js            → lazy(loader): load(), prefetch(), loaded
//
// Decisiones:
// - El importe con letra solo se usa al facturar: no viaja con la página.
//   Con un empaquetador, este import() sería un archivo aparte.
// - Precarga: cuando el puntero entra en el botón o el teclado llega a él,
//   la descarga empieza; cuando llega el clic, el módulo suele estar listo.
// - lazy() guarda la PROMESA: precarga y clic comparten una sola descarga.
//   Si la carga falla (red caída, despliegue nuevo), se olvida y el siguiente
//   clic lo reintenta, con un mensaje claro mientras tanto.
//
// Alcance: módulos 1-8. querySelector, textContent y addEventListener son
// del capítulo 6.
import { lazy } from './10-factura/lazy.js';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const subtotalCents = 101638;
const vatCents = Math.round(subtotalCents * 0.16);
const totalCents = subtotalCents + vatCents;

document.querySelector('#subtotal').textContent = money.format(subtotalCents / 100);
document.querySelector('#vat').textContent = money.format(vatCents / 100);
document.querySelector('#total').textContent = money.format(totalCents / 100);

let downloads = 0;
const words = lazy(() => {
  downloads += 1;
  return import('./10-factura/amount-in-words.js');
});

const button = document.querySelector('#in-words');
const output = document.querySelector('#words');

async function showInWords() {
  output.textContent = 'Preparando…';
  try {
    const { amountInWords } = await words.load();
    output.textContent = amountInWords(totalCents);
  } catch {
    output.textContent = 'No se pudo preparar el importe con letra. Vuelve a intentarlo.';
  }
  return output.textContent;
}

button.addEventListener('pointerenter', words.prefetch);
button.addEventListener('focus', words.prefetch);
button.addEventListener('click', showInWords);

// ── Demostración ─────────────────────────────────────────────────────────
console.log('total de la factura →', money.format(totalCents / 100));
console.log('al abrir la página, ¿módulo pedido? →', words.loaded);
words.prefetch(); // el puntero llega al botón
console.log('tras la precarga, ¿módulo pedido? →', words.loaded);
console.log('clic →', await showInWords());
console.log('otro clic →', await showInWords());
console.log('descargas →', downloads, '(precarga y clics comparten una)');

console.group('▶ el mismo módulo, con otros importes');
const { amountInWords } = await words.load();
for (const cents of [100, 2100, 10100, 2100000, 100000000, 250000050]) {
  console.log(money.format(cents / 100).padStart(15), '→', amountInWords(cents));
}
console.groupEnd();
```
