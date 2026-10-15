---
example_description: "Solución: range valida en una función normal y devuelve un generador, cycle guarda una copia, batched, pairwise y takeWhile con for…of, y zip con iteradores a mano que cierra los demás en un finally"
example_tags: "javascript|solucion|generadores|itertools|iterator-helpers|python"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: las herramientas de itertools que los helpers de Iterator no traen.

function* count(start = 0) { // infinita, como itertools.count
  for (let n = start; ; n += 1) yield n;
}

// ✅ 1. Una función normal (valida al llamar) que devuelve el generador interno.
function* stepsBetween(start, end, step) {
  for (let n = start; step > 0 ? n < end : n > end; n += step) yield n;
}
function range(start, end, step = 1) {
  if (!Number.isInteger(step) || step === 0) throw new RangeError(`step no válido: ${step}`);
  return stepsBetween(start, end, step);
}

// ✅ 2. Primera vuelta: entrega y guarda. Después: repite la copia.
function* cycle(iterable) {
  const saved = [];
  for (const item of iterable) {
    yield item;
    saved.push(item);
  }
  if (saved.length === 0) return; // sin esto, un iterable vacío sería un bucle sin fin
  while (true) yield* saved;
}

// ✅ 3.
function* batched(iterable, size) {
  let batch = [];
  for (const item of iterable) {
    batch.push(item);
    if (batch.length === size) {
      yield batch;
      batch = [];
    }
  }
  if (batch.length > 0) yield batch;
}

// ✅ 4.
function* pairwise(iterable) {
  let previous;
  let first = true;
  for (const item of iterable) {
    if (!first) yield [previous, item];
    previous = item;
    first = false;
  }
}

// ✅ 5. Iteradores a mano: hay que cerrarlos nosotros (for…of no está aquí para hacerlo).
function* zip(...iterables) {
  const iterators = iterables.map((iterable) => iterable[Symbol.iterator]());
  try {
    while (true) {
      const results = iterators.map((it) => it.next());
      if (results.some((result) => result.done)) return;
      yield results.map((result) => result.value);
    }
  } finally {
    for (const it of iterators) it.return?.();
  }
}

// ✅ 6. El break cierra el iterable de origen.
function* takeWhile(iterable, predicate) {
  for (const item of iterable) {
    if (!predicate(item)) break;
    yield item;
  }
}

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
