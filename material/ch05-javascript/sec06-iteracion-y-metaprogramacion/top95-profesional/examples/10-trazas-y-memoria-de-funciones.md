---
example_description: "Herramientas para funciones con proxies: traced() dibuja el árbol de llamadas con la trampa apply, memoize() guarda resultados en una caché LRU y cuenta aciertos, countInstances() cuenta construcciones con la trampa construct; todo con recuentos, nunca con tiempos"
example_tags: "javascript|profesional|proxy|reflect|apply|construct|memoizacion|lru"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// UNA CAJA DE HERRAMIENTAS PARA FUNCIONES, hecha con las trampas apply y construct.
//
// Decisiones:
// - traced(fn) devuelve un proxy de la función. La trampa apply apunta cada
//   llamada con su profundidad (una pila) y hace la llamada real con
//   Reflect.apply(target, thisArg, args): el mismo this y los mismos argumentos.
// - La recursión pasa por el proxy solo si la función se llama a sí misma por
//   la variable que ahora apunta al proxy. Por eso las recursivas se declaran
//   con let y se reasignan: fibonacci = memoize(fibonacci).
// - memoize() usa una caché LRU: un Map conserva el orden de inserción, así que
//   un acierto se mueve al final (delete + set) y, si se llena, sale la primera
//   clave, la menos usada. La clave es el JSON de los argumentos (primitivos).
// - Las estadísticas se leen con una clave symbol del propio proxy (fn[STATS]):
//   la trampa get la intercepta; el resto de propiedades (name, length…) pasan.
// - countInstances(Clase) cuenta los new con la trampa construct y
//   Reflect.construct(target, args, newTarget): las subclases y los #privados
//   siguen funcionando, e instanceof también.
// - Solo recuentos, nunca tiempos: la salida es la misma en cualquier equipo.
//
// Alcance: módulos 1-6.

const STATS = Symbol('fn.stats');

function withStats(target, stats, handler) {
  return new Proxy(target, {
    ...handler,
    get(fn, key, receiver) {
      return key === STATS ? { ...stats } : Reflect.get(fn, key, receiver);
    },
  });
}

// ── traced: el árbol de llamadas ───────────────────────────────────────────
function traced(fn, lines) {
  const stats = { calls: 0, maxDepth: 0 };
  let depth = 0;
  return withStats(fn, stats, {
    apply(target, thisArg, args) {
      stats.calls += 1;
      stats.maxDepth = Math.max(stats.maxDepth, depth + 1);
      const line = lines.push(`${'│ '.repeat(depth)}${target.name}(${args.join(', ')})`) - 1;
      depth += 1;
      try {
        const result = Reflect.apply(target, thisArg, args);
        lines[line] += ` = ${result}`;
        return result;
      } finally {
        depth -= 1;
      }
    },
  });
}

// ── memoize: caché LRU con estadísticas ────────────────────────────────────
function memoize(fn, { maxSize = Infinity, onEvict = () => {} } = {}) {
  const cache = new Map();
  const stats = { calls: 0, hits: 0, misses: 0, evictions: 0 };
  return withStats(fn, stats, {
    apply(target, thisArg, args) {
      stats.calls += 1;
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        stats.hits += 1;
        const value = cache.get(key);
        cache.delete(key); // el acierto pasa a ser el más reciente
        cache.set(key, value);
        return value;
      }
      stats.misses += 1;
      const value = Reflect.apply(target, thisArg, args);
      cache.set(key, value);
      if (cache.size > maxSize) {
        const oldest = cache.keys().next().value;
        cache.delete(oldest);
        stats.evictions += 1;
        onEvict(oldest);
      }
      return value;
    },
  });
}

// ── countInstances: la trampa construct ────────────────────────────────────
function countInstances(Class) {
  const stats = { created: 0 };
  return withStats(Class, stats, {
    construct(target, args, newTarget) {
      stats.created += 1;
      return Reflect.construct(target, args, newTarget);
    },
  });
}

// 1. Fibonacci: cuántas llamadas hace cada versión.
let fibonacci = function fib(n) {
  return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
};
const plain = fibonacci;
fibonacci = traced(plain, []);
fibonacci(20);
const naiveCalls = fibonacci[STATS].calls;
fibonacci = memoize(plain);
fibonacci(20);
console.log(`fib(20) sin caché → ${naiveCalls} llamadas | con caché → ${fibonacci[STATS].calls} (${fibonacci[STATS].misses} cálculos)`);
const callsBefore = fibonacci[STATS].calls;
console.log('fib(70) con la caché →', fibonacci(70), '| llamadas nuevas →', fibonacci[STATS].calls - callsBefore);
// (fib(79) ya no cabe en los enteros seguros de un number: lección «Números».)

// 2. El árbol de llamadas de fib(4).
const tree = [];
fibonacci = traced(plain, tree);
fibonacci(4);
console.group(`árbol de fib(4): ${fibonacci[STATS].calls} llamadas, profundidad ${fibonacci[STATS].maxDepth}`);
for (const line of tree) console.log(line);
console.groupEnd();

// 3. Una caché LRU para un cálculo de envíos (como si fuera caro).
const evicted = [];
const shippingCost = memoize(
  function shipping(postalCode, kilos) {
    const zone = postalCode.startsWith('0') || postalCode.startsWith('1') ? 'centro' : 'resto';
    return (zone === 'centro' ? 90 : 160) + kilos * 25;
  },
  { maxSize: 3, onEvict: (key) => evicted.push(key) },
);
const requests = [['06700', 2], ['64000', 5], ['06700', 2], ['97000', 1], ['44100', 3], ['64000', 5]];
for (const [code, kilos] of requests) console.log(`envío a ${code} (${kilos} kg) → $${shippingCost(code, kilos)}`);
const { calls, hits, misses, evictions } = shippingCost[STATS];
console.table({ shippingCost: { llamadas: calls, aciertos: hits, cálculos: misses, expulsiones: evictions } });
console.log('expulsados de la caché →', evicted);

// 4. Contar construcciones sin tocar la clase.
class Order {
  #lines = [];
  constructor(table) {
    this.table = table;
  }
  add(dish) {
    this.#lines.push(dish);
    return this;
  }
  get size() {
    return this.#lines.length;
  }
}
const TrackedOrder = countInstances(Order);
const orders = [new TrackedOrder(4).add('pozole').add('agua de jamaica'), new TrackedOrder(7).add('tamales')];
console.log('creados →', TrackedOrder[STATS].created, '| tamaños →', orders.map((order) => order.size));
console.log('instanceof →', orders[0] instanceof TrackedOrder, orders[0] instanceof Order, '| name →', TrackedOrder.name);

// newTarget: una subclase de la clase vigilada también pasa por la trampa.
class TrackedDelivery extends TrackedOrder {}
const delivery = new TrackedDelivery(0).add('mole para llevar');
console.log('subclase →', delivery.constructor.name, delivery.size, '| creados →', TrackedOrder[STATS].created);
```
