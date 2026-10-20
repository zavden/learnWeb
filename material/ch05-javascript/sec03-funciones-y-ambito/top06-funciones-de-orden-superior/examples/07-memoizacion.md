---
example_description: "Memoización: memoize envuelve una función pura y guarda sus resultados en un Map privado (el @cache de Python); solo para funciones puras"
example_tags: "javascript|python|orden-superior|memoizacion|cache|closures"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// MEMOIZAR: recordar los resultados de una función pura para no recalcularlos.
// memoize recibe una función y devuelve otra con una caché privada (un closure).
function memoize(fn) {
  const cache = new Map();
  return (arg) => {
    if (cache.has(arg)) return cache.get(arg);
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

// Una función costosa: cuenta los primos menores que limit.
let realCalculations = 0;
function countPrimesBelow(limit) {
  realCalculations += 1;
  let count = 0;
  for (let n = 2; n < limit; n++) {
    let isPrime = true;
    for (let divisor = 2; divisor * divisor <= n; divisor++) {
      if (n % divisor === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) count += 1;
  }
  return count;
}

const countPrimesCached = memoize(countPrimesBelow);
console.log('primos < 50 000 →', countPrimesCached(50000)); // 5133 (calcula)
console.log('primos < 50 000 →', countPrimesCached(50000)); // 5133 (de la caché)
console.log('primos < 1000 →', countPrimesCached(1000));    // 168 (calcula)
console.log('primos < 1000 →', countPrimesCached(1000));    // 168 (de la caché)
console.log('cálculos reales →', realCalculations);         // 2 de 4 llamadas

// Con varios argumentos hace falta una CLAVE que los represente:
const memoizeMany = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args); // [2, 10] → '[2,10]'
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
};
const power = memoizeMany((base, exponent) => base ** exponent);
console.log('power(2, 10) →', power(2, 10), '| otra vez →', power(2, 10));

// ⚠️ Solo tiene sentido con funciones PURAS: si el resultado depende de algo
// externo (la hora, una variable global), la caché devolverá datos viejos.
// Y esta caché crece sin límite (en Python, @lru_cache(maxsize=…) lo limita).
// > Desde Python: @functools.cache def count_primes_below(limit): …
```
