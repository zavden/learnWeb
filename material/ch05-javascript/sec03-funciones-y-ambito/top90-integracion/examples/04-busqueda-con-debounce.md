---
example_description: "Buscador simulado con un reloj falso: debounce con temporizadores inyectados, consulta normalizada con pipe y resultados memoizados; la salida es exacta en cualquier navegador"
example_tags: "javascript|integracion|debounce|memoizacion|pipe|closures"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// BUSCADOR DE UNA TIENDA DE TÉ, con el tiempo SIMULADO para ver cada paso exacto.
// Integra: debounce y memoize (orden superior), closures (temporizador pendiente,
// caché, reloj), pipe de funciones puras, objeto de opciones con defaults.

// Un reloj falso: guarda las tareas programadas y las ejecuta al «avanzar» el tiempo.
// Imita a setTimeout/clearTimeout (módulo «Asincronía y event loop»).
function createFakeClock() {
  let now = 0;
  let nextId = 1;
  let tasks = [];
  return {
    now: () => now,
    setTimeout: (fn, ms) => {
      tasks = [...tasks, { id: nextId, time: now + ms, fn }];
      return nextId++;
    },
    clearTimeout: (id) => {
      tasks = tasks.filter((task) => task.id !== id);
    },
    advanceTo: (time) => {
      let due = tasks.filter((task) => task.time <= time).toSorted((a, b) => a.time - b.time);
      while (due.length > 0) {
        const [task] = due;
        tasks = tasks.filter((other) => other !== task);
        now = task.time;
        task.fn();
        due = tasks.filter((other) => other.time <= time).toSorted((a, b) => a.time - b.time);
      }
      now = time;
    },
  };
}

// debounce con los temporizadores como OPCIÓN: en la página serían los reales.
function debounce(fn, waitMs, { setTimer = setTimeout, clearTimer = clearTimeout } = {}) {
  let timerId = null;
  return (...args) => {
    clearTimer(timerId);
    timerId = setTimer(() => fn(...args), waitMs);
  };
}
function memoize(fn) {
  const cache = new Map();
  return (key) => {
    if (cache.has(key)) return { ...cache.get(key), fromCache: true };
    const result = fn(key);
    cache.set(key, result);
    return result;
  };
}
const pipe = (...fns) => (input) => fns.reduce((value, fn) => fn(value), input);
const removeAccents = (text) =>
  [...text.normalize('NFD')].filter((char) => char < '̀' || char > 'ͯ').join('');
const normalize = pipe((text) => text.trim(), (text) => text.toLowerCase(), removeAccents);

const products = ['Té verde sencha', 'Té negro Assam', 'Rooibos con vainilla', 'Matcha ceremonial',
  'Café de Etiopía', 'Café de Colombia', 'Tetera de hierro', 'Té blanco Pai Mu Tan'];
const index = products.map((name) => ({ name, key: normalize(name) })); // se normaliza UNA vez

let realSearches = 0;
const searchProducts = memoize((query) => {
  realSearches += 1;
  return { query, results: index.filter((item) => item.key.includes(query)).map((item) => item.name) };
});

const clock = createFakeClock();
const onQueryChange = debounce(
  (text) => {
    const query = normalize(text);
    if (query.length < 2) {
      console.log(`  t=${clock.now()} · «${text}» es muy corto: no se busca`);
      return;
    }
    const { results, fromCache } = searchProducts(query);
    console.log(`  t=${clock.now()} · 🔎 «${query}»${fromCache ? ' (caché)' : ''} → ${results.join(', ') || 'sin resultados'}`);
  },
  300,
  { setTimer: clock.setTimeout, clearTimer: clock.clearTimeout },
);

// Lo que teclea la persona: [milisegundo, texto del campo].
const keystrokes = [
  [0, 't'], [110, 'té'], [230, 'té '], [340, 'té n'], [900, 'té ne'],
  [1600, 'TE NE'], [2500, 'caf'], [2620, 'café'], [3400, 'x'],
];
for (const [time, text] of keystrokes) {
  clock.advanceTo(time);
  onQueryChange(text);
}
clock.advanceTo(5000);
console.log(`pulsaciones: ${keystrokes.length} · búsquedas lanzadas: ${realSearches} (más las respondidas desde la caché)`);
```
