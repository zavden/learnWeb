---
example_description: "Fibonacci recursivo hace 242 785 llamadas para fib(25); memoizado, 26; iterativo con BigInt, fib(100) sin esfuerzo. Y por qué memoize(fib) no basta"
example_tags: "javascript|python|recursion|fibonacci|memoizacion|bigint"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Fibonacci: fib(n) = fib(n - 1) + fib(n - 2), con fib(0) = 0 y fib(1) = 1.
let calls = 0;
function fib(n) {
  calls += 1;
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}
console.log('fib(25) →', fib(25), `(${calls} llamadas)`); // 75025 (242785 llamadas)
// La pila nunca pasa de 25 marcos; el problema es otro: fib(23) se calcula
// 2 veces, fib(22) 3 veces, fib(21) 5 veces… el trabajo crece exponencialmente.

// memoize de la lección anterior:
function memoize(fn) {
  const cache = new Map();
  return (n) => {
    if (!cache.has(n)) cache.set(n, fn(n));
    return cache.get(n);
  };
}

// 🐛 Envolver fib no basta: DENTRO, fib se sigue llamando a sí misma (la lenta).
calls = 0;
const fibWrapped = memoize(fib);
fibWrapped(25);
console.log('🐛 memoize(fib) →', `${calls} llamadas`); // 242785: solo se cachea la de fuera

// ✅ Las llamadas recursivas deben pasar por la versión memoizada.
calls = 0;
const fibMemo = memoize((n) => {
  calls += 1;
  return n < 2 ? n : fibMemo(n - 1) + fibMemo(n - 2);
});
console.log('✅ fibMemo(25) →', fibMemo(25), `(${calls} llamadas)`); // 26 cálculos reales

// ✅ Iterativa: ni pila ni caché. Con BigInt («Números») no hay pérdida de precisión.
function fibIterative(n) {
  let previous = 0n;
  let current = 1n;
  for (let i = 0; i < n; i++) {
    [previous, current] = [current, previous + current];
  }
  return previous;
}
console.log('fibIterative(100) →', fibIterative(100)); // 354224848179261915075n

// > Desde Python: con @functools.cache sobre def fib, SÍ basta, porque el
//   decorador reemplaza el nombre fib y las llamadas internas usan la versión
//   con caché. En JavaScript, const fibWrapped = memoize(fib) crea un nombre NUEVO.
```
