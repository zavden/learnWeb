---
example_description: "Un MutationObserver que escribe en lo que observa se llama a sí mismo: cada cambio del callback genera un registro nuevo y otra llamada, en microtareas sin fin que congelan la página (aquí, frenado a las 5 vueltas); takeRecords() descarta los registros propios y corta el bucle"
example_tags: "javascript|mutationobserver|bucle|takerecords|microtareas|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Precios del día</h1>
  <dl class="prices">
    <dt>Café de Chiapas 500 g (🐛)</dt>
    <dd id="price-buggy">—</dd>
    <dt>Cacao de Tabasco 250 g (✅)</dt>
    <dd id="price-fixed">—</dd>
  </dl>
  <button id="new-price" type="button">Llega un precio nuevo para el cacao</button>
  <ol id="log" class="log" aria-live="polite"></ol>
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
.prices {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.4rem 1rem;
  margin: 0 0 0.75rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
.prices dd {
  margin: 0;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const buggyPrice = document.querySelector('#price-buggy');
const fixedPrice = document.querySelector('#price-fixed');
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
const watchText = { childList: true, characterData: true, subtree: true };

// 🐛 «Cuando llegue un precio, ponle el signo de pesos». Pero escribir en el
//    nodo observado genera un registro nuevo → otra llamada → otro '$'…
let rounds = 0;
const buggyObserver = new MutationObserver(() => {
  rounds += 1;
  if (rounds > 5) {
    buggyObserver.disconnect(); // freno de seguridad
    logLine('🐛 vuelta 6: paro el observador (sin este freno, la página se congela)');
    return;
  }
  buggyPrice.textContent = `$${buggyPrice.textContent}`;
  logLine(`🐛 vuelta ${rounds} → ${buggyPrice.textContent}`);
});
buggyObserver.observe(buggyPrice, watchText);
buggyPrice.textContent = '210'; // llega el precio «del servidor»

// ✅ El callback escribe y después vacía la cola con takeRecords(): sus
//    propios cambios no vuelven a llamarlo.
let fixedRounds = 0;
const fixedObserver = new MutationObserver(() => {
  fixedRounds += 1;
  fixedPrice.textContent = money.format(Number(fixedPrice.textContent));
  const ownRecords = fixedObserver.takeRecords();
  logLine(`✅ vuelta ${fixedRounds} → ${fixedPrice.textContent} · takeRecords() descartó ${ownRecords.length}`);
});
fixedObserver.observe(fixedPrice, watchText);
// Después de que se calme el primero (un setTimeout va detrás de TODAS las
// microtareas), para que las líneas no se mezclen.
setTimeout(() => {
  fixedPrice.textContent = '96.5';
  setTimeout(() => logLine('Listo: pulsa el botón para que llegue otro precio'), 0);
}, 0);

const newPrices = ['104', '99.9', '120'];
document.querySelector('#new-price').addEventListener('click', () => {
  fixedPrice.textContent = newPrices[fixedRounds % newPrices.length];
});

// Otras salidas: disconnect() → escribir → observe() de nuevo, o un callback
// idempotente (si el texto ya tiene formato, no lo toques).
```
