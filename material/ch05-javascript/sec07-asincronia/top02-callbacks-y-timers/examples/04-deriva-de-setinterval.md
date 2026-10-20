---
example_description: "La deriva de setInterval: una cuenta atrás que resta 100 ms en cada tick se retrasa cuando la página se ocupa (los ticks perdidos no se recuperan); calcular lo que queda con el reloj, a partir de una hora límite, da siempre el valor correcto"
example_tags: "javascript|setinterval|temporizadores|deriva|performance-now|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// La sesión de pago caduca en 1 segundo (en una tienda real, 10 minutos).
// Dos formas de llevar la cuenta, con el MISMO setInterval de 100 ms:
//   🐛 contar ticks: «cada tick son 100 ms menos»
//   ✅ preguntar al reloj: «quedan deadline − ahora»
const DURATION_MS = 1000;
const TICK_MS = 100;
const deadline = performance.now() + DURATION_MS;
let remainingByTicks = DURATION_MS;
let ticks = 0;

function busyFor(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end) {}
}

const sessionTimer = setInterval(() => {
  ticks += 1;
  remainingByTicks -= TICK_MS;                                    // 🐛 supone ticks exactos
  const remainingByClock = Math.max(0, deadline - performance.now()); // ✅ mira el reloj
  if (remainingByClock > 0 && ticks < 20) return;

  clearInterval(sessionTimer);
  console.log('⌛ el reloj dice que la sesión ha caducado');
  console.log('✅ por reloj quedan →', Math.round(remainingByClock), 'ms');
  console.log('🐛 por ticks aún quedan > 0 ms →', remainingByTicks > 0);
  console.log(`   (quedan ${remainingByTicks} ms según los ticks; ticks recibidos: ${ticks} de 10; varía)`);
}, TICK_MS);

// A los 250 ms, la página se ocupa 300 ms (genera el PDF de la factura).
setTimeout(() => {
  console.log('📄 300 ms generando el PDF… (los ticks no pueden entrar)');
  busyFor(300);
}, 250);

// Mientras la pila está ocupada, los ticks no se acumulan: cuando la tarea
// termina, entra UNO atrasado y los demás se pierden. Contar ticks mide
// «cuántas veces me llamaron», no «cuánto tiempo ha pasado».
// Lo mismo pasa, a lo grande, en una pestaña en segundo plano: Chrome espacia
// los temporizadores a 1 s o más, y una cuenta por ticks se desfasa minutos.
// ✅ Regla: el temporizador solo decide CUÁNDO refrescar; el valor se calcula
//    siempre con el reloj (performance.now() o Date.now()) y una hora límite.
```
