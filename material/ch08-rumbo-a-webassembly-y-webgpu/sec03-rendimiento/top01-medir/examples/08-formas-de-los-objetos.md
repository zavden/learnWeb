---
example_description: "Formas de objeto (hidden classes) y cachés en línea: la misma función que suma price × qty suele ir más lenta cuando las líneas de pedido llegan con 8 formas distintas (acceso megamórfico) que cuando todas tienen la misma. Se mide en rondas intercaladas para que el estado del procesador afecte a las dos por igual. Crear los objetos siempre con los mismos campos, en el mismo orden, lo evita"
example_tags: "javascript|rendimiento|v8|hidden-classes|inline-cache|polimorfismo|objetos"
example_stage: intermediate
example_importance: useful
console: true
loop_protect: false
---

# HTML

```html
<main>
  <h1>Pedidos de ocho canales</h1>
  <p>2000 líneas de pedido por lista. Mismos datos; cambia cuántas «formas» de objeto llegan a la función: 1 u 8.</p>
  <button id="run" type="button">Medir</button>
  <output id="state" for="run">Sin medir todavía</output>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:disabled { cursor: progress; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
output { margin-inline-start: 0.5rem; color: #475569; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
// loop_protect: false (en la cabecera): la guarda de bucles falsearía la medida.

// Cada canal de venta tiene su adaptador, y cada uno añade un campo propio. Para V8, un
// objeto con otros campos (u otro orden) tiene otra FORMA (hidden class, «mapa» en V8).
const CHANNEL_FIELDS = [null, 'appVersion', 'kioskId', 'phoneAgent', 'storeId', 'chatId', 'marketplaceFee', 'wholesaleTier'];
function lineFromChannel(i, channel) {
  const line = { sku: `SKU-${1000 + i}`, price: 10 + (i % 50), qty: 1 + (i % 3) };
  if (CHANNEL_FIELDS[channel]) line[CHANNEL_FIELDS[channel]] = i; // 🐛 un campo más → otra forma
  return line;
}
const LINES = 2000;
const oneShape = Array.from({ length: LINES }, (_, i) => lineFromChannel(i, 0));
const eightShapes = Array.from({ length: LINES }, (_, i) => lineFromChannel(i, i % 8));
// Nuestro propio recuento de formas: campos y orden de cada objeto.
const countShapes = (lines) => new Set(lines.map((line) => Object.keys(line).join())).size;

// Dos copias IDÉNTICAS de la misma función: cada `lines[i].price` tiene una caché en línea
// que recuerda las formas que ha visto. Con una sola forma es monomórfica; con hasta 4,
// polimórfica; con más, se rinde y busca cada vez en una tabla global (megamórfica).
function totalOneShape(lines) {
  let total = 0;
  for (let i = 0; i < lines.length; i++) total += lines[i].price * lines[i].qty;
  return total;
}
function totalEightShapes(lines) {
  let total = 0;
  for (let i = 0; i < lines.length; i++) total += lines[i].price * lines[i].qty;
  return total;
}
console.log('formas distintas (nuestro recuento) →', countShapes(oneShape), '·', countShapes(eightShapes));
const totals = [totalOneShape(oneShape), totalEightShapes(eightShapes)];
console.log('¿el mismo total en las dos listas? →', totals[0] === totals[1], `($${totals[0]})`);

// El procesador acelera cuando lleva un rato trabajando (ejemplo 05): se le despierta antes,
// y las medidas se INTERCALAN (una de cada variante por ronda) para que le afecte igual a las dos.
function wakeCpu(ms) {
  const end = performance.now() + ms;
  let mix = 0;
  while (performance.now() < end) {
    for (let k = 0; k < 1000; k++) mix = (mix * 31 + k) | 0;
  }
  return mix;
}
const REPEAT = 100; // 2000 líneas × 100 vueltas por medida
const variants = [
  { label: '1 forma', total: totalOneShape, lines: oneShape },
  { label: '8 formas', total: totalEightShapes, lines: eightShapes },
];
let sink = 0; // el resultado se usa: nada de código muerto (ejemplo 06)
function measureInterleaved(rounds) {
  const times = variants.map(() => []);
  for (let round = -2; round < rounds; round++) { // las dos primeras rondas solo calientan
    variants.forEach((variant, v) => {
      const start = performance.now();
      for (let r = 0; r < REPEAT; r++) sink += variant.total(variant.lines);
      if (round >= 0) times[v].push(performance.now() - start);
    });
  }
  return times.map((list) => list.toSorted((a, b) => a - b)[Math.floor(list.length / 2)]);
}

const runButton = document.querySelector('#run');
const state = document.querySelector('#state');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
runButton.addEventListener('click', () => {
  runButton.disabled = true;
  state.textContent = 'midiendo…';
  requestAnimationFrame(() => setTimeout(() => { // deja pintar «midiendo…» (~150 ms de trabajo)
    wakeCpu(100);
    const medians = measureInterleaved(9);
    logLine(variants.map((variant, v) => `${variant.label}: mediana ≈ ${medians[v].toFixed(1)} ms`).join(' · '));
    state.textContent = 'Listo: pulsa otra vez para repetir';
    runButton.disabled = false;
  }, 0));
});
console.log('Listo: pulsa «Medir»');

// ✅ La solución: una sola fábrica (o una clase) que crea SIEMPRE los mismos campos, en el
// mismo orden, con null en los que no apliquen a un canal. Una forma, una caché rápida.
// La diferencia cambia con el motor, la versión y el procesador: no es una regla fija, y solo
// importa en funciones muy calientes. Mídelo antes de reescribir nada.
```
