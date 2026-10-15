---
example_description: "Ejercicio: el panel de una heladería tiene seis bugs del módulo: un objeto en un for…of, un iterador usado dos veces, una limpieza fuera del finally, dos Symbol() que deberían ser el mismo, un proxy que rompe los #privados y una etiqueta html que escapa lo que no debe"
example_tags: "javascript|ejercicio|depuracion|iteradores|generadores|symbol|proxy|plantillas"
exercise: true
exercise_title: "Caza los seis bugs de la heladería"
exercise_instructions: "El panel de la heladería tiene seis bugs, uno en cada sección marcada con el nombre de una lección (dos en «Protocolo iterable»). Ninguno detiene el script: las comprobaciones atrapan los errores y los muestran como texto || Protocolo iterable (1): totalLiters no puede recorrer el inventario || Protocolo iterable (2): salesStats devuelve una media NaN || Generadores: cuando el panel solo pide los dos primeros pedidos, la conexión no se cierra || Symbol: el precio con descuento no encuentra el descuento que se guardó || Proxy y Reflect: el congelador vigilado lanza un TypeError al leer su estado || Plantillas etiquetadas: la etiqueta html deja pasar el marcado de los clientes. Tres comprobaciones ya salen ✓ y deben seguir así || Ejecuta hasta que todas las comprobaciones salgan ✓"
exercise_hints: "Un objeto literal no es iterable: recorre Object.entries(objeto) || map.values() es un iterador: el primer bucle lo gasta. Conviértelo en array una vez, o pide uno nuevo para cada recorrido || El break de for…of llama a return() del generador: solo se ejecuta lo que está en un finally || Symbol('x') crea un símbolo nuevo en cada llamada; Symbol.for('x') devuelve siempre el mismo || Los #privados no se ven a través del proxy: lee con Reflect.get(target, key, target) y enlaza las funciones al objetivo con bind || Los trozos de la plantilla (strings) son tu código; lo que hay que escapar son los valores"
exercise_solution_example: 11-ej-caza-los-bugs-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: el panel de la heladería «La Michoacana del Centro». Hay seis bugs.
// Encuéntralos y arréglalos hasta que todas las comprobaciones salgan ✓.

// ── Protocolo iterable (1) ──────────────────────────────────────────────
const stock = { fresa: 12, limón: 8, 'nuez de Castilla': 5 }; // litros por sabor

function totalLiters(inventory) {
  let total = 0;
  for (const [, liters] of inventory) total += liters;
  return total;
}

// ── Protocolo iterable (2) ──────────────────────────────────────────────
const salesByFlavor = new Map([['fresa', 42], ['limón', 30], ['nuez de Castilla', 18]]);

function salesStats(values) {
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
  for (const id of orders) yield id;
  connection.open = false;
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
  product[Symbol('heladeria.descuento')] = percent;
}
function finalPrice(product) {            // módulo de caja
  const percent = product[Symbol('heladeria.descuento')] ?? 0;
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
      return Reflect.get(target, key, receiver);
    },
  });
}

// ── Plantillas etiquetadas ──────────────────────────────────────────────
function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
function html(strings, ...values) {
  let result = escapeHtml(strings[0]);
  for (let i = 0; i < values.length; i++) result += values[i] + escapeHtml(strings[i + 1]);
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
