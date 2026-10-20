---
example_description: "Un cambio de algoritmo gana a cualquier truco: comprobar 1000 pedidos contra 1000 correos bloqueados con includes dentro de filter es casi un millón de comparaciones (O(n·m)); reescribir el bucle a mano no lo arregla (sigue siendo O(n·m), y en Chrome es aún más lento que includes), y un Set lo deja en 1000 búsquedas y lo hace decenas de veces más rápido"
example_tags: "javascript|rendimiento|algoritmos|big-o|set|includes|benchmark"
example_stage: intermediate
example_importance: critical
console: true
loop_protect: false
---

# HTML

```html
<main>
  <h1>Pedidos retenidos</h1>
  <p>Antes de enviar, se retienen los pedidos cuyo correo está en la lista de bloqueados.</p>
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

// El ayudante del ejemplo 04, tal cual.
let benchSink;
function bench(label, fn, { runs = 15, warmup = 3 } = {}) {
  for (let i = 0; i < warmup; i++) benchSink = fn();
  const times = [];
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    benchSink = fn();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  return { label, median: times[Math.floor(times.length / 2)], min: times[0], max: times.at(-1) };
}

const COUNT = 1000;
const blockedEmails = Array.from({ length: COUNT }, (_, i) => `cliente${(i * 7919) % 10000}@correo.mx`);
const orderEmails = Array.from({ length: COUNT }, (_, i) => `cliente${(i * 104729) % 10000}@correo.mx`);

// 🐛 O(n·m): includes recorre la lista de bloqueados ENTERA por cada pedido que no está.
function heldWithIncludes() {
  return orderEmails.filter((email) => blockedEmails.includes(email));
}
// 🐛 El «truco»: un for a mano con === y la longitud en una variable. En Chrome pierde contra
//    includes (código nativo); y da igual: sigue siendo O(n·m). Además cuenta las comparaciones.
let comparisons = 0;
function heldWithHandLoop() {
  comparisons = 0;
  const held = [];
  for (const email of orderEmails) {
    for (let k = 0, size = blockedEmails.length; k < size; k++) {
      comparisons += 1;
      if (blockedEmails[k] === email) {
        held.push(email);
        break;
      }
    }
  }
  return held;
}
// ✅ O(n + m): un Set se construye una vez y cada has() cuesta lo mismo, sea cual sea su tamaño.
function heldWithSet() {
  const blocked = new Set(blockedEmails);
  return orderEmails.filter((email) => blocked.has(email));
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
  requestAnimationFrame(() => setTimeout(() => { // deja pintar «midiendo…» (~50 ms de trabajo en Chrome)
    const slow = bench('🐛 includes dentro de filter', heldWithIncludes, { runs: 3, warmup: 0 });
    const heldSlow = benchSink.join();
    const hand = bench('🐛 for a mano', heldWithHandLoop, { runs: 3, warmup: 0 });
    const heldHand = benchSink.join();
    const fast = bench('✅ Set', heldWithSet, { runs: 9 });
    const same = heldSlow === heldHand && heldHand === benchSink.join();
    logLine(`pedidos retenidos → ${benchSink.length} · ¿los mismos con los tres métodos? ${same}`);
    logLine(`🐛 comparaciones de texto con la lista → ${comparisons.toLocaleString('es-MX')}`);
    logLine(`✅ con el Set → ${COUNT} inserciones + ${COUNT} búsquedas`);
    logLine(`¿el Set es ≥ 5 veces más rápido que includes? ${slow.median >= 5 * fast.median}`);
    for (const result of [slow, hand, fast]) logLine(`${result.label}: mediana ≈ ${result.median.toFixed(1)} ms`);
    state.textContent = 'Listo: pulsa otra vez para repetir';
    runButton.disabled = false;
  }, 0));
});
console.log(`Listo: ${COUNT} pedidos y ${COUNT} correos bloqueados; pulsa «Medir»`);

// Con el doble de datos, includes tarda unas 4 veces más (n × m) y el Set, unas 2 (n + m).
// Antes de afinar un bucle, pregúntate cuántas veces se ejecuta su cuerpo.
```
