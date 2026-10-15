---
example_description: "setTimeout(fn, 0) no significa «ahora»: el callback espera a que termine el código síncrono y a que se vacíen las microtareas, y el retraso es un mínimo, no una cita: tras 150 ms de cálculo síncrono, el temporizador de 0 ms se ejecuta con 150 ms de retraso"
example_tags: "javascript|event-loop|settimeout|microtareas|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Una tienda quiere registrar la visita «ya mismo» y lo programa con
// setTimeout(…, 0), creyendo que 0 ms es «inmediatamente».
const scheduledAt = performance.now(); // milisegundos desde que se abrió la página

setTimeout(() => {
  const waited = performance.now() - scheduledAt;
  console.log('🐛 setTimeout(…, 0) esperó ≥ 150 ms →', waited >= 150);
  console.log(`   (esperó ≈ ${Math.round(waited)} ms; el número varía en cada ejecución)`);
}, 0);

// Una microtarea programada DESPUÉS adelanta al temporizador:
Promise.resolve().then(() => {
  console.log('🐛 la microtarea, programada después, se ejecuta antes');
});

// Y el script sigue con 150 ms de cálculo síncrono (simulado con una espera
// activa: un bucle que solo mira el reloj). El temporizador «vence» enseguida,
// pero su callback no puede entrar: la pila está ocupada.
const busyUntil = performance.now() + 150;
while (performance.now() < busyUntil) {
  // calcula el resumen de ventas del día…
}
console.log('fin del script (150 ms de cálculo)');

// ✅ Lo que de verdad significa setTimeout(fn, ms): «encola fn como TAREA
//    cuando hayan pasado AL MENOS ms milisegundos». Si necesitas ejecutar algo
//    justo después del código actual y antes que nada más, eso es una
//    microtarea: queueMicrotask(fn).
queueMicrotask(() => console.log('✅ queueMicrotask → justo al terminar el script'));
```
