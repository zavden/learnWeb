---
example_description: "Ejercicio: escribe con generadores las herramientas de itertools que Iterator no trae: range (con validación en la llamada), cycle (también con iteradores de un solo uso), batched, pairwise, zip (que cierra los demás) y takeWhile"
example_tags: "javascript|ejercicio|generadores|itertools|iterator-helpers|python"
exercise: true
exercise_title: "itertools en JavaScript"
exercise_instructions: "range(start, end, step = 1) es una función NORMAL: si step no es un entero distinto de 0 lanza un RangeError en la llamada, y si no, devuelve un generador que cuenta desde start hasta end (sin incluirlo), también hacia atrás con step negativo || cycle(iterable) repite los valores sin fin; guarda una copia de lo que va recorriendo, porque el iterable puede ser un iterador que se gasta || batched(iterable, size) entrega arrays de size elementos (el último puede ser más corto) || pairwise(iterable) entrega cada par de vecinos [a, b] || zip(...iterables) entrega arrays con un valor de cada iterable, termina con el más corto y cierra con return() los iteradores que no se agotaron || takeWhile(iterable, predicate) entrega valores mientras predicate sea true y para en el primero que no lo cumple || Ejecuta hasta que todas las comprobaciones salgan ✓"
exercise_hints: "La validación de range no puede estar dentro de una función generadora (no se ejecutaría hasta el primer next): valida en range y devuelve otro generador || Para contar hacia atrás, la condición del bucle cambia: step > 0 ? n < end : n > end || En cycle, recorre una vez el iterable guardando cada valor en un array y después repite el array con while (true) yield* saved (comprueba antes que no está vacío) || En zip, crea los iteradores con iterable[Symbol.iterator](), pide un next() a cada uno y, en un finally, llama a it.return?.() en todos || takeWhile puede ser un for…of con break: el break cierra el iterable de origen"
exercise_solution_example: 09-ej-itertools-en-javascript-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: las herramientas de itertools de Python que los helpers de
// Iterator no traen. Completa cada TODO hasta que todo salga ✓.

function* count(start = 0) { // ya hecha: infinita, como itertools.count
  for (let n = start; ; n += 1) yield n;
}

// TODO 1: una función NORMAL que valida step y devuelve un generador.
function range(start, end, step = 1) {
  return [].values(); // provisional: un iterador vacío
}

// TODO 2: repite sin fin (guarda una copia: el iterable puede gastarse).
function* cycle(iterable) {}

// TODO 3: arrays de `size` elementos.
function* batched(iterable, size) {}

// TODO 4: pares de vecinos [a, b].
function* pairwise(iterable) {}

// TODO 5: termina con el más corto y cierra los demás con return().
function* zip(...iterables) {}

// TODO 6: valores mientras se cumpla predicate.
function* takeWhile(iterable, predicate) {}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, compute, expected) {
  let actual;
  try {
    actual = compute();
  } catch (error) {
    actual = `${error.name}: ${error.message}`;
  }
  if (actual === expected) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
// Un iterable que avisa cuando lo cierran (return) o se agota (finally).
function* watched(values, log) {
  try {
    yield* values;
  } finally {
    log.closed = true;
  }
}

check('range(0, 5)', () => [...range(0, 5)].join(','), '0,1,2,3,4');
check('range(10, 0, -3)', () => [...range(10, 0, -3)].join(','), '10,7,4,1');
check('range con step 0 lanza AL LLAMAR', () => {
  try {
    range(0, 5, 0);
    return 'no lanzó';
  } catch (error) {
    return error.name;
  }
}, 'RangeError');
check('range es perezoso', () => range(0, Infinity).take(3).toArray().join(','), '0,1,2');
check("cycle('ab')", () => cycle('ab').take(5).toArray().join(''), 'ababa');
check('cycle de un iterador de un solo uso', () => cycle(range(1, 3)).take(5).toArray().join(','), '1,2,1,2,1');
check("batched('abcdefg', 3)", () => [...batched('abcdefg', 3)].map((batch) => batch.join('')).join('|'), 'abc|def|g');
check('pairwise: diferencias', () => [...pairwise([1, 4, 9, 16])].map(([a, b]) => b - a).join(','), '3,5,7');
check("zip([1, 2, 3], 'ab')", () => JSON.stringify([...zip([1, 2, 3], 'ab')]), '[[1,"a"],[2,"b"]]');
check('zip cierra el iterable más largo', () => {
  const log = { closed: false };
  [...zip(watched([1, 2, 3], log), 'ab')];
  return log.closed;
}, true);
check('takeWhile(n² < 50)', () => [...takeWhile(count(1), (n) => n * n < 50)].join(','), '1,2,3,4,5,6,7');
check('takeWhile cierra el origen', () => {
  const log = { closed: false };
  [...takeWhile(watched([5, 8, 1, 9], log), (n) => n > 2)];
  return log.closed;
}, true);
```
