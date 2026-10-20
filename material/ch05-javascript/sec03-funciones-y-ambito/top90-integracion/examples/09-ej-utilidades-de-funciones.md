---
example_description: "Ejercicio: escribir once, memoize, pipe y partial, cuatro utilidades de orden superior con closures, rest/spread y this conservado con apply"
example_tags: "javascript|ejercicio|orden-superior|closures|memoizacion|pipe"
exercise: true
exercise_title: "Escribe tus propias utilidades de funciones"
exercise_instructions: "once(fn): la primera llamada ejecuta fn y guarda su resultado; las siguientes devuelven ese resultado sin volver a llamar a fn || once debe funcionar también con métodos: la función envuelta tiene que recibir el mismo this || memoize(fn): guarda los resultados en un Map cuya clave es JSON.stringify de TODOS los argumentos || pipe(...fns): devuelve una función que aplica fns de izquierda a derecha; sin funciones, devuelve la entrada tal cual || partial(fn, ...fixed): devuelve una función que recibe el resto de argumentos y llama a fn con los fijos delante || Ejecuta hasta que todas las comprobaciones salgan con ✓"
exercise_hints: "Las variables del closure (done, result, cache) se declaran DENTRO de la utilidad, antes del return || Para conservar this, devuelve una function (no una flecha) y llama a fn.apply(this, args) || Con (...args) recoges todos los argumentos en un array, que es justo lo que necesita JSON.stringify || pipe es un reduce: el valor inicial es la entrada y cada paso aplica una función al valor acumulado || partial: (...rest) => fn(...fixed, ...rest)"
exercise_solution_example: 09-ej-utilidades-de-funciones-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: completa las cuatro utilidades hasta que todas las comprobaciones salgan ✓.
// Cada una recibe una función y devuelve OTRA función (orden superior).

function once(fn) {
  // TODO 1: guarda en un closure si ya se ha llamado y el resultado de esa vez.
  // TODO 2: que funcione también como método (mismo this): function + fn.apply.
  return fn; // ← provisional: llama a fn siempre
}

function memoize(fn) {
  // TODO 3: caché en un Map; clave = JSON.stringify(args) con TODOS los argumentos.
  return fn; // ← provisional: no recuerda nada
}

function pipe(...fns) {
  // TODO 4: aplica fns de izquierda a derecha (un reduce sobre fns).
  return (input) => input; // ← provisional: no aplica ninguna
}

function partial(fn, ...fixed) {
  // TODO 5: devuelve una función que reciba el resto y llame a fn(...fixed, ...resto).
  return fn; // ← provisional: no fija nada
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
