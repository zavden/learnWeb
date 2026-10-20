---
example_description: "Un worker de módulo (new Worker(url, { type: 'module' })) que importa el mismo sales.js que la página: medio millón de ventas se agregan en otra hebra mientras la página sigue atendiendo, y un cliente convierte los mensajes en promesas"
example_tags: "javascript|profesional|modulos|workers|import-meta|promesas"
example_stage: professional
example_importance: useful
console: true
---

# JavaScript

```javascript
// UN WORKER DE MÓDULO QUE COMPARTE CÓDIGO CON LA PÁGINA.
//
// Archivos (assets/09-worker/):
//   sales.js         → generateSales(n, semilla), aggregate(ventas), evaluatedIn
//   stats-worker.js  → el worker: import de sales.js, responde a mensajes
//   worker-client.js → createStatsClient(url): request(datos) → promesa
//
// Los workers se estudian en el capítulo 8; aquí basta con saber que un
// Worker ejecuta un archivo en OTRA hebra, sin DOM, y que la página y el
// worker se hablan con postMessage y el evento message.
//
// Decisiones:
// - { type: 'module' }: el worker es un módulo y puede usar import. Así
//   sales.js se escribe una vez y lo usan los dos lados.
// - La URL del worker se calcula con new URL(ruta, import.meta.url): relativa
//   a ESTE archivo, no a la página (y los empaquetadores la reconocen).
// - Cada lado evalúa sales.js por su cuenta: la página y el worker tienen
//   mapas de módulos distintos (y nada de estado compartido).
// - El cliente convierte mensajes en promesas con un id por petición.
//
// Alcance: módulos 1-8 y la nota de arriba.
import { generateSales, aggregate, evaluatedIn } from './09-worker/sales.js';
import { createStatsClient } from './09-worker/worker-client.js';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const client = createStatsClient(new URL('./09-worker/stats-worker.js', import.meta.url));

// Mientras el worker calcula, la página sigue viva: este temporizador avanza.
let ticks = 0;
const ticker = setInterval(() => {
  ticks += 1;
}, 10);

console.group('▶ 500 000 ventas, agregadas en el worker');
const big = await client.request({ count: 500_000, seed: 2026 });
clearInterval(ticker);
console.log('sales.js se evaluó en el worker como →', big.evaluatedIn);
console.log('y en esta página como →', evaluatedIn);
for (const entry of big.totals.slice(0, 3)) {
  console.log(`${entry.state}: ${money.format(entry.cents / 100)} (${entry.count} ventas)`);
}
const grandTotal = big.totals.reduce((sum, entry) => sum + entry.cents, 0);
console.log('total →', money.format(grandTotal / 100), '|', big.totals.reduce((sum, entry) => sum + entry.count, 0), 'ventas');
console.log('¿la página siguió atendiendo temporizadores? →', ticks > 0);
console.groupEnd();

console.group('▶ el mismo código, en los dos lados');
const here = aggregate(generateSales(1000, 7)); // en la página, pocos datos
const there = await client.request({ count: 1000, seed: 7 });
console.log('¿mismo resultado en la página y en el worker? →', JSON.stringify(here) === JSON.stringify(there.totals));
console.groupEnd();

console.group('▶ peticiones a la vez');
const [a, b] = await Promise.all([client.request({ count: 2000, seed: 1 }), client.request({ count: 3000, seed: 2 })]);
console.log('cada respuesta a su petición →', a.totals.reduce((sum, entry) => sum + entry.count, 0), b.totals.reduce((sum, entry) => sum + entry.count, 0));
console.groupEnd();

client.terminate(); // un worker vivo ocupa memoria: se cierra al terminar
// Sin { type: 'module' }, el import de stats-worker.js sería un SyntaxError
// (un worker clásico solo tiene importScripts).
```
