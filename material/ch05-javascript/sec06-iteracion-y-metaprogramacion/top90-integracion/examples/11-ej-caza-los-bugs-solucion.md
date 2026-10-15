---
example_description: "Solución: Object.entries para el inventario, un array en vez de un iterador gastado, la limpieza en un finally, Symbol.for compartido, un proxy que lee y enlaza sobre el objetivo y una etiqueta html que escapa los valores"
example_tags: "javascript|solucion|depuracion|iteradores|generadores|symbol|proxy|plantillas"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: el panel de la heladería «La Michoacana del Centro», sin sus seis bugs.

// ── Protocolo iterable (1) ──────────────────────────────────────────────
const stock = { fresa: 12, limón: 8, 'nuez de Castilla': 5 }; // litros por sabor

function totalLiters(inventory) {
  let total = 0;
  for (const [, liters] of Object.entries(inventory)) total += liters; // ✅ un objeto no es iterable
  return total;
}

// ── Protocolo iterable (2) ──────────────────────────────────────────────
const salesByFlavor = new Map([['fresa', 42], ['limón', 30], ['nuez de Castilla', 18]]);

function salesStats(iterable) {
  const values = [...iterable]; // ✅ un iterador se gasta en el primer bucle: array, una vez
  let best = 0;
  for (const cups of values) best = Math.max(best, cups);
  let sum = 0;
  let count = 0;
  for (const cups of values) {
    sum += cups;
    count += 1;
  }
  return `${best} ${sum / count}`;
}

// ── Generadores ─────────────────────────────────────────────────────────
const connection = { open: false };
const orders = ['P-501', 'P-502', 'P-503', 'P-504'];

function* fetchOrders() {
  connection.open = true;
  try {
    for (const id of orders) yield id;
  } finally {
    connection.open = false; // ✅ el break llama a return(): solo se ejecuta el finally
  }
}

function firstOrders(n) {
  const result = [];
  for (const id of fetchOrders()) {
    result.push(id);
    if (result.length === n) break;
  }
  return result;
}

// ── Symbol ──────────────────────────────────────────────────────────────
function saveDiscount(product, percent) { // módulo de promociones
  product[Symbol.for('heladeria.descuento')] = percent; // ✅ el mismo símbolo en todo el programa
}
function finalPrice(product) {            // módulo de caja
  const percent = product[Symbol.for('heladeria.descuento')] ?? 0;
  return product.pesos * (1 - percent / 100);
}

// ── Proxy y Reflect ─────────────────────────────────────────────────────
class Freezer {
  #celsius;
  constructor(celsius) {
    this.#celsius = celsius;
  }
  get status() {
    return this.#celsius <= -18 ? `ok (${this.#celsius} °C)` : `⚠️ ${this.#celsius} °C`;
  }
}

const reads = [];
function watched(freezer) {
  return new Proxy(freezer, {
    get(target, key, receiver) {
      reads.push(String(key));
      // ✅ Los #privados viven en el objetivo: el getter y los métodos, con this = target.
      const value = Reflect.get(target, key, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}

// ── Plantillas etiquetadas ──────────────────────────────────────────────
function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
function html(strings, ...values) {
  let result = strings[0]; // ✅ los trozos son tu código; se escapan los VALORES
  for (let i = 0; i < values.length; i++) result += escapeHtml(values[i]) + strings[i + 1];
  return result;
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

check('Protocolo iterable (1): litros en el congelador', () => totalLiters(stock), 25);
check('Protocolo iterable (2): mejor sabor y media', () => salesStats(salesByFlavor.values()), '42 30');
check('Generadores: dos primeros pedidos', () => firstOrders(2).join(' '), 'P-501 P-502');
check('Generadores: la conexión se cierra', () => connection.open, false);
check('Symbol: precio con descuento', () => {
  const cone = { name: 'cono doble', pesos: 60 };
  saveDiscount(cone, 25);
  return finalPrice(cone);
}, 45);
check('Proxy y Reflect: estado del congelador', () => watched(new Freezer(-20)).status, 'ok (-20 °C)');
check('Proxy y Reflect: el proxy registra la lectura', () => reads.join(','), 'status');
check('Plantillas: la reseña no mete marcado', () => {
  const review = { author: 'Iván', text: '<b>¡La mejor!</b>' };
  return html`<p>${review.author}: ${review.text}</p>`;
}, '<p>Iván: &lt;b&gt;¡La mejor!&lt;/b&gt;</p>');
check('el inventario sigue igual', () => JSON.stringify(stock), '{"fresa":12,"limón":8,"nuez de Castilla":5}');
```
