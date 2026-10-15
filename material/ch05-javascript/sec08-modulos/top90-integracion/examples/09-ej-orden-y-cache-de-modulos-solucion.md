---
example_description: "Solución: evaluationOrder recorre el grafo en profundidad en postorden con un array path para los ciclos, y createRequire guarda cada exports en un Map antes de ejecutar el módulo"
example_tags: "javascript|solucion|modulos|grafo|evaluacion|cache|commonjs"
example_stage: final-solution
example_importance: useful
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: orden de evaluación y require con caché.

function evaluationOrder(graph, entry) {
  const order = [];
  const path = []; // los archivos que se están visitando ahora mismo
  function visit(name) {
    if (order.includes(name)) return; // ya evaluado: no se repite
    if (path.includes(name)) {
      throw new Error(`ciclo: ${[...path.slice(path.indexOf(name)), name].join(' → ')}`);
    }
    if (!Object.hasOwn(graph, name)) throw new Error(`no existe ${name}`);
    path.push(name);
    for (const dependency of graph[name]) visit(dependency);
    path.pop();
    order.push(name); // postorden: después de sus dependencias
  }
  visit(entry);
  return order;
}

function createRequire(definitions) {
  const cache = new Map(); // el «mapa de módulos»: id → exports
  return function require(id) {
    if (!Object.hasOwn(definitions, id)) throw new Error(`No existe el módulo ${id}`);
    if (cache.has(id)) return cache.get(id);
    const exports = {};
    cache.set(id, exports); // ANTES de ejecutar: un ciclo recibiría este objeto a medias
    definitions[id](exports, require);
    return exports;
  };
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

// El grafo de la lección «Organizar el código»: archivo → sus imports, en orden.
const SHOP = {
  'main.js': ['polyfills.js', 'cart.js', 'analytics.js'],
  'polyfills.js': [],
  'cart.js': ['api.js', 'config.js'],
  'api.js': ['config.js'],
  'config.js': [],
  'analytics.js': ['config.js'],
};
const CYCLE = { 'a.js': ['b.js'], 'b.js': ['c.js'], 'c.js': ['a.js'] };
const MISSING = { 'main.js': ['utils.js'] };

// Tres módulos «empaquetados», al estilo CommonJS (lección «Rutas, import
// maps y herramientas»). executions cuenta cuántas veces se ejecuta cada uno.
const executions = {};
const count = (id) => { executions[id] = (executions[id] ?? 0) + 1; };
const DEFINITIONS = {
  './money.js'(exports) {
    count('money.js');
    exports.addVat = (cents) => Math.round(cents * 1.16);
    exports.formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;
  },
  './cart.js'(exports, require) {
    count('cart.js');
    const { addVat } = require('./money.js');
    exports.cartTotal = (prices) => addVat(prices.reduce((sum, cents) => sum + cents, 0));
  },
  './main.js'(exports, require) {
    count('main.js');
    const { formatPrice } = require('./money.js');
    const { cartTotal } = require('./cart.js');
    exports.summary = `Total: ${formatPrice(cartTotal([21000, 54900]))}`;
  },
};

check('orden de evaluación de la tienda', () => evaluationOrder(SHOP, 'main.js').join(', '), 'polyfills.js, config.js, api.js, cart.js, analytics.js, main.js');
check('un módulo compartido aparece una sola vez', () => evaluationOrder(SHOP, 'analytics.js').join(', '), 'config.js, analytics.js');
check('un ciclo lanza un error con el camino', () => evaluationOrder(CYCLE, 'a.js'), 'Error: ciclo: a.js → b.js → c.js → a.js');
check('un módulo que no existe lanza un error', () => evaluationOrder(MISSING, 'main.js'), 'Error: no existe utils.js');
const require = createRequire(DEFINITIONS);
check('require(\'./main.js\') ejecuta el programa', () => require('./main.js')?.summary, 'Total: $880.44');
check('cada módulo se ejecutó una sola vez', () => Object.entries(executions).map(([id, times]) => `${id}:${times}`).join(' '), 'main.js:1 money.js:1 cart.js:1');
check('dos require del mismo módulo dan el mismo objeto', () => require('./money.js') === require('./money.js'), true);
check('require de un módulo que no existe lanza un error', () => require('./nada.js'), 'Error: No existe el módulo ./nada.js');
```
