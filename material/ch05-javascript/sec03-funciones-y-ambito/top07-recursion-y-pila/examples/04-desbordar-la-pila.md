---
example_description: "RangeError: Maximum call stack size exceeded por un caso base que nunca se alcanza y por un envoltorio que se llama a sí mismo sin querer"
example_tags: "javascript|python|recursion|stack-overflow|rangeerror|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// 🐛 1. Un caso base que NUNCA se alcanza.
function countdown(n) {
  if (n === 0) return '🚀 despegue';
  return countdown(n - 1);
}
console.log('countdown(3) →', countdown(3)); // funciona con enteros…

try {
  countdown(2.5); // 2.5 → 1.5 → 0.5 → -0.5 → … nunca vale exactamente 0
} catch (error) {
  console.log('🐛 countdown(2.5) →', error.name, '|', error.message);
}
// Cada llamada añade un marco a la pila; la pila tiene un tamaño fijo y,
// al llenarse, el motor lanza RangeError: Maximum call stack size exceeded.

// ✅ Un caso base que cubra TODO lo que «ya terminó», no solo un valor exacto.
function countdownSafe(n) {
  if (n <= 0) return '🚀 despegue';
  return countdownSafe(n - 1);
}
console.log('✅ countdownSafe(2.5) →', countdownSafe(2.5));

// 🐛 2. Recursión SIN QUERER: un envoltorio que se llama a sí mismo.
function log(...args) {
  log('[tienda]', ...args); // quería escribir console.log(…)
}
try {
  log('pedido creado');
} catch (error) {
  console.log('🐛 log() →', error.name, '|', error.message);
}

// La guarda de bucles de LearnWeb NO interviene aquí (no hay ningún bucle):
// quien detiene la recursión infinita es el propio motor, y además en
// milisegundos, porque la pila se llena mucho antes de que pase el tiempo.

// > Desde Python: RecursionError: maximum recursion depth exceeded. Python corta
//   en 1000 llamadas (sys.setrecursionlimit lo cambia); JavaScript no tiene un
//   límite configurable: depende del motor y de cuánto ocupa cada llamada.
```
