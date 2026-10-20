---
example_description: "Ejercicio: escribe las dos piezas de un sistema de módulos: el orden de evaluación de un grafo (en profundidad, hojas primero, sin repetir y detectando ciclos) y un require con caché que ejecuta cada módulo una sola vez"
example_tags: "javascript|ejercicio|modulos|grafo|evaluacion|cache|commonjs"
exercise: true
exercise_title: "Orden y caché de módulos"
exercise_instructions: "evaluationOrder(graph, entry) recibe un objeto { archivo: [sus imports, en orden] } y devuelve el array del orden de evaluación: antes de cada archivo, sus dependencias en el orden de sus imports, bajando en profundidad, y cada archivo una sola vez || Si un archivo no está en graph, lanza new Error('no existe ' + nombre) || Si encuentra un ciclo, lanza new Error('ciclo: ' + el camino unido con ' → '), por ejemplo «ciclo: a.js → b.js → c.js → a.js» || createRequire(definitions) devuelve una función require(id): si id no está en definitions, lanza new Error('No existe el módulo ' + id); si ya se ejecutó, devuelve su objeto exports; si no, crea exports = {}, lo guarda en la caché ANTES de ejecutar, llama a definitions[id](exports, require) y devuelve exports || Ejecuta hasta que las ocho comprobaciones salgan ✓"
exercise_hints: "Una función interna visit(nombre) recursiva: primero visita las dependencias, después añade el nombre al resultado (postorden) || Para no repetir, comprueba si el nombre ya está en el resultado antes de visitar || Para los ciclos, lleva un array path con los archivos que estás visitando ahora: si visit llega a uno que ya está en path, hay ciclo; path.slice(path.indexOf(nombre)) es el ciclo || Haz path.push(nombre) antes de visitar las dependencias y path.pop() después || La caché de require puede ser un Map de id → exports, creado fuera de la función require (un closure)"
exercise_solution_example: 09-ej-orden-y-cache-de-modulos-solucion.md
example_stage: exercise
example_importance: useful
console: true
---

# JavaScript

```javascript
// EJERCICIO: lo que hace el navegador (y un empaquetador) con un grafo de
// módulos. Este script no usa import: los «módulos» son datos y funciones.

// TODO 1-3: orden de evaluación (postorden), sin repetir, con errores para
// los archivos que faltan y para los ciclos.
function evaluationOrder(graph, entry) {
  return [];
}

// TODO 4: require con caché (cada módulo se ejecuta una sola vez).
function createRequire(definitions) {
  return function require(id) {
    return {};
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
