---
example_description: "Solución: handleEntries salta las entradas con isIntersecting: false (la primera llamada y las salidas), cuenta cada oferta una vez con un Set y la deja de observar con unobserve; el total de impresiones es seen.size"
example_tags: "javascript|intersectionobserver|isintersecting|unobserve|analitica|solucion"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Ofertas de la semana</h1>
  <p>Impresiones: <output id="impressions">0</output></p>
  <div id="promos" class="panel" tabindex="0" role="region" aria-label="Ofertas">
    <ul class="promos">
      <li>☕ Café de olla · 2 × $70</li>
      <li>🥐 Concha de vainilla · $18</li>
      <li>🍫 Chocolate de Oaxaca · $45</li>
      <li>🍹 Atole de guayaba · $35</li>
      <li>🌽 Pan de elote · $38</li>
      <li>🫔 Tamal de dulce · $25</li>
    </ul>
  </div>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin: 0 0 0.5rem;
}
.panel {
  height: 12rem;
  overflow-y: auto;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
}
.panel:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.promos {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0 0.5rem;
  list-style: none;
}
.promos li {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  height: 6rem;
  padding: 0 1rem;
  border-radius: 0.5rem;
  background: #fef3c7;
}
```

# JavaScript

```javascript
const panel = document.querySelector('#promos');
const output = document.querySelector('#impressions');
const seen = new Set(); // ofertas ya contadas
let impressions = 0;

function handleEntries(entries, observer) {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;     // ✅ la primera llamada y las salidas no cuentan
    if (seen.has(entry.target)) continue;    // ✅ cada oferta, una vez
    seen.add(entry.target);
    observer.unobserve(entry.target);        // ✅ contada: ya no hay nada que vigilar
  }
  impressions = seen.size;
  output.textContent = impressions;
  return impressions;
}

const promoObserver = new IntersectionObserver(handleEntries, { root: panel });
for (const promo of panel.querySelectorAll('li')) promoObserver.observe(promo);

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
// Llaman a handleEntries con entradas de prueba ({ target, isIntersecting })
// y un observer de prueba que apunta a quién se deja de observar.
function check(description, compute, expected) {
  let actual;
  try {
    actual = compute();
  } catch (error) {
    actual = `${error.name}: ${error.message}`;
  }
  if (Object.is(actual, expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
const promos = [...panel.querySelectorAll('li')];
const unobserved = [];
const fakeObserver = { unobserve: (target) => unobserved.push(target) };
const entry = (index, isIntersecting) => ({ target: promos[index], isIntersecting });
const reset = () => {
  seen.clear();
  impressions = 0;
  unobserved.length = 0;
};

check('primera llamada: 6 entradas, 2 a la vista → 2 impresiones', () => {
  reset();
  handleEntries([0, 1, 2, 3, 4, 5].map((index) => entry(index, index < 2)), fakeObserver);
  return output.textContent;
}, '2');
check('al bajar: salen la 1 y la 2, entran la 5 y la 6 → 4 impresiones', () => {
  handleEntries([entry(0, false), entry(1, false), entry(4, true), entry(5, true)], fakeObserver);
  return output.textContent;
}, '4');
check('una oferta que vuelve a entrar no cuenta otra vez → 4', () => {
  handleEntries([entry(0, true)], fakeObserver);
  return output.textContent;
}, '4');
check('se deja de observar cada oferta contada (y solo esas)', () => unobserved.map((target) => promos.indexOf(target) + 1).join(', '), '1, 2, 5, 6');
reset(); // y ahora, el observer de verdad empieza de cero
output.textContent = '0';
```
