---
example_description: "performance.now() es el reloj para medir duraciones: milisegundos con decimales desde que se abrió la página, y nunca retrocede; Date.now() es la hora del calendario y puede saltar; console.time hace la resta por ti"
example_tags: "javascript|python|performance-now|date|tiempo|medir"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Dos relojes con propósitos distintos:
//   Date.now()        → ms desde el 1-1-1970 (hora del calendario, en UTC)
//   performance.now() → ms desde que se abrió ESTA página (un cronómetro)
console.log('Date.now() es una fecha (> 1 700 000 000 000) →', Date.now() > 1.7e12);
console.log('performance.now() empieza cerca de 0 (< 1 hora) →', performance.now() < 3_600_000);

// performance.now() es MONÓTONO: nunca retrocede, aunque alguien cambie la
// hora del ordenador o el sistema la sincronice (Date.now() sí puede saltar).
let previous = performance.now();
let alwaysForward = true;
for (let i = 0; i < 10_000; i++) {
  const now = performance.now();
  if (now < previous) alwaysForward = false;
  previous = now;
}
console.log('10 000 lecturas seguidas, ninguna retrocede →', alwaysForward);

// Medir cuánto tarda algo: dos lecturas y una resta.
const prices = Array.from({ length: 200_000 }, (_, i) => (i * 7919) % 100_000);
const start = performance.now();
const sorted = prices.toSorted((a, b) => a - b);
const elapsed = performance.now() - start;
console.log('el más barato y el más caro →', sorted[0], sorted.at(-1));
console.log(`ordenar 200 000 precios tardó ≈ ${elapsed.toFixed(1)} ms (varía con el ordenador)`);

// console.time / console.timeEnd hacen lo mismo con una etiqueta.
console.time('sumar con reduce');
const total = prices.reduce((sum, price) => sum + price, 0);
console.timeEnd('sumar con reduce'); // imprime «sumar con reduce: X ms» (varía)
console.log('total →', total);

// La precisión de performance.now() está recortada a propósito (en Chrome,
// a unos 0,1 ms) para que no sirva para ataques de temporización.
// > Desde Python: performance.now() es time.perf_counter() (en ms, no en s) y
//   Date.now() es time.time() * 1000.
```
