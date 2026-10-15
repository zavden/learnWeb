---
example_stage: final-solution
example_description: "Solución: --brand: #{$brand}, &:hover, math.div(24px, 2), @for … through y @if $cart-count > 0"
example_tags: "sass|solucion|depuracion|interpolacion|anidamiento|division|for|truthy"
console: true
---

# HTML

```html
<header class="site-header">
  <span class="logo">La Huerta</span>
  <a class="cart" href="/cesta">Cesta</a>
</header>

<nav class="toolbar" aria-label="Acciones del pedido">
  <button type="button" class="btn">Guardar</button>
  <button type="button" class="btn">Compartir</button>
</nav>

<ol class="steps" aria-label="Progreso de la compra">
  <li class="step step-1">Cesta</li>
  <li class="step step-2">Envío</li>
  <li class="step step-3">Pago</li>
  <li class="step step-4">Confirmación</li>
</ol>

<ul class="checklist">
  <li>1 · <code>--brand</code> llega al navegador como un color: <output id="check-brand">…</output></li>
  <li>2 · Existe la regla <code>.btn:hover</code>: <output id="check-hover">…</output></li>
  <li>3 · La barra separa los botones 12px: <output id="check-gap">…</output></li>
  <li>4 · Existe la regla <code>.step-4</code>: <output id="check-steps">…</output></li>
  <li>5 · Sin insignia con la cesta vacía: <output id="check-badge">…</output></li>
</ul>
```

# SCSS

```scss
@use "sass:math";

$brand: #15803d;
$brand-dark: #14532d;
$steps: 4;
$cart-count: 0;

// ✅ 1: sin #{}, la custom property recibía el texto «$brand» (lección 2).
:root {
  --brand: #{$brand};
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: var(--brand, #475569);
  color: #ffffff;
}

.logo {
  font-weight: bold;
}

.cart {
  color: #ffffff;
}

// ✅ 5: en Sass solo false y null son falsos; 0 es verdadero (lección 6).
@if $cart-count > 0 {
  .cart::after {
    content: "#{$cart-count}";
    margin-left: 6px;
    padding: 0 7px;
    border-radius: 999px;
    background: #fef3c7;
    color: #78350f;
    font-weight: bold;
  }
}

// ✅ 3: entre dos números escritos a mano, / es el separador de CSS (lección 5).
.toolbar {
  display: flex;
  gap: math.div(24px, 2);
  margin: 12px 0;
}

.btn {
  padding: 8px 14px;
  border: 0;
  border-radius: 6px;
  background: var(--brand, #475569);
  color: #ffffff;
  font: inherit;

  // ✅ 2: sin &, salía «.btn :hover» (un descendiente con hover) (lección 3).
  &:hover {
    background: $brand-dark;
  }
}

.steps {
  display: grid;
  gap: 4px;
  max-width: 24rem;
  padding: 0;
  list-style: none;
}

.step {
  padding: 4px 8px;
  border-radius: 4px;
  background: #dcfce7;
  color: #14532d;
}

// ✅ 4: «to» se detiene antes del final; «through» lo incluye (lección 6).
@for $i from 1 through $steps {
  .step-#{$i} {
    width: math.percentage(math.div($i, $steps));
  }
}

.checklist {
  padding-left: 1.2em;
  color: #475569;

  output {
    color: #1e293b;
    font-weight: bold;
  }
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script lee el CSS que ha
// generado tu Sass y los estilos que calcula el navegador, y escribe ✅ o ❌ en la
// lista y en la consola. No hace falta tocarlo: se vuelve a ejecutar con cada cambio.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

const rules = [];
function collect(list) {
  for (const rule of list) {
    if (rule.selectorText) rules.push(rule);
    if (rule.cssRules) collect(rule.cssRules);
  }
}
for (const sheet of document.styleSheets) {
  try { collect(sheet.cssRules); } catch { /* hoja de otro origen: se ignora */ }
}
const hasRule = (selector) => rules.some((rule) => rule.selectorText === selector);

const brand = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim();
check('check-brand', brand.toLowerCase() === '#15803d', `--brand vale «${brand || '(nada)'}»`);

const spaced = rules.find((rule) => rule.selectorText === '.btn :hover');
check('check-hover', hasRule('.btn:hover'),
  hasRule('.btn:hover') ? 'sí' : spaced ? 'hay «.btn :hover», con espacio' : 'no');

const gap = getComputedStyle(document.querySelector('.toolbar')).columnGap;
check('check-gap', gap === '12px', `gap calculado: ${gap}`);

check('check-steps', hasRule('.step-4'), hasRule('.step-4') ? 'sí' : 'no: solo hay hasta .step-3');

const badge = getComputedStyle(document.querySelector('.cart'), '::after').content;
check('check-badge', badge === 'none' || badge === 'normal', badge === 'none' || badge === 'normal' ? 'sin insignia' : `la insignia dice ${badge}`);
```
