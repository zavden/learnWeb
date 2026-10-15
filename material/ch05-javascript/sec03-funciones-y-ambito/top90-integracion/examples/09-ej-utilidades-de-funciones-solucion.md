---
example_description: "Solución: once y memoize con closures y fn.apply(this, args), pipe con reduce y partial con rest y spread"
example_tags: "javascript|solucion|orden-superior|closures|memoizacion|pipe"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: cuatro utilidades de orden superior.

function once(fn) {
  let done = false; // estado privado de ESTA función envuelta (closure)
  let result;
  // function, no flecha: así la función envuelta recibe el this de la llamada
  // (shop.open() → this es shop) y se lo pasa a fn con apply.
  return function (...args) {
    if (!done) {
      done = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args); // [2, 10] → '[2,10]'; [10, 2] → '[10,2]'
    if (!cache.has(key)) cache.set(key, fn.apply(this, args));
    return cache.get(key);
  };
}

function pipe(...fns) {
  // Sin funciones, reduce devuelve el valor inicial: la propia entrada.
  return (input) => fns.reduce((value, fn) => fn(value), input);
}

function partial(fn, ...fixed) {
  return (...rest) => fn(...fixed, ...rest);
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, actual, expected) {
  if (actual === expected) {
    console.log('✓', description);
  } else {
    console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
  }
}

// once
let greetingsBuilt = 0;
const buildGreeting = once((name) => {
  greetingsBuilt += 1;
  return `Hola, ${name}`;
});
check('once: la primera llamada', buildGreeting('Ana'), 'Hola, Ana');
check('once: la segunda devuelve lo mismo', buildGreeting('Luis'), 'Hola, Ana');
check('once: fn se ejecuta una sola vez', greetingsBuilt, 1);
const shop = {
  openings: 0,
  open: once(function () {
    this.openings += 1;
    return `abierta (${this.openings})`;
  }),
};
check('once: conserva this en un método', shop.open(), 'abierta (1)');
check('once: el método tampoco se repite', shop.open() + ' · ' + shop.openings, 'abierta (1) · 1');

// memoize
let realCalls = 0;
const square = memoize((n) => {
  realCalls += 1;
  return n * n;
});
check('memoize: el resultado', square(12), 144);
square(12);
square(12);
check('memoize: square(12) se calcula una vez', realCalls, 1);
const power = memoize((base, exponent) => {
  realCalls += 1;
  return base ** exponent;
});
check('memoize: varios argumentos', `${power(2, 10)} ${power(10, 2)} ${power(2, 10)}`, '1024 100 1024');
check('memoize: (2, 10) y (10, 2) son claves distintas', realCalls, 3);

// pipe
const slugify = pipe((text) => text.trim(), (text) => text.toLowerCase(), (text) => text.split(' ').join('-'));
check('pipe: de izquierda a derecha', slugify('  Hola Mundo '), 'hola-mundo');
check('pipe: el orden importa', pipe((n) => n + 1, (n) => n * 10)(2), 30);
check('pipe(): sin funciones devuelve la entrada', pipe()(7), 7);

// partial
const formatLog = (channel, level, message) => `[${channel}] ${level}: ${message}`;
check('partial: fija un argumento', partial(formatLog, 'pagos')('INFO', 'cobro aceptado'), '[pagos] INFO: cobro aceptado');
check('partial: fija dos', partial(formatLog, 'envíos', 'ERROR')('sin dirección'), '[envíos] ERROR: sin dirección');
```
