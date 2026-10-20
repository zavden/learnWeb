---
example_description: "Ejercicio: el panel de una cafetería con cinco bugs del módulo (flecha que devuelve un objeto, this perdido, var en un bucle con closures, opciones sin = {} y un let olvidado)"
example_tags: "javascript|ejercicio|depuracion|this|closures|parametros"
exercise: true
exercise_title: "Caza los cinco bugs de la cafetería"
exercise_instructions: "Ejecuta el ejemplo y lee qué comprobaciones salen con ✗ || Bug 1: haz que toOption devuelva el objeto { value: id } || Bug 2: que stats.record cuente los pedidos servidos || Bug 3: que cada recordatorio nombre a su cliente || Bug 4: que formatTicket funcione sin el objeto de opciones || Bug 5: que la caja del día sume 14,00 € || Termina cuando todas las comprobaciones salgan con ✓"
exercise_hints: "Bug 1: tras =>, una llave abre un bloque; ¿cómo se obliga a leer un objeto? («Formas de función») || Bug 2: forEach llama al método como función simple; ¿qué vale this entonces? («La palabra clave this») || Bug 3: ¿cuántas variables i hay con var? ¿Y con let? («Closures») || Bug 4: el patrón de las opciones necesita un valor por defecto para cuando falta el objeto («Parámetros») || Bug 5: sin let, total = 0 no crea una variable local («Ámbito y hoisting»)"
exercise_solution_example: 11-ej-caza-los-bugs-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: el panel de pedidos de una cafetería tiene CINCO bugs de este módulo.
// Arregla cada TODO hasta que todas las comprobaciones del final salgan ✓.
const orders = [
  { id: 101, customer: 'Ana', items: [{ name: 'Café con leche', cents: 180 }, { name: 'Tostada', cents: 250 }] },
  { id: 102, customer: 'Luis', items: [{ name: 'Té chai', cents: 260 }] },
  { id: 103, customer: 'Marta', items: [{ name: 'Capuchino', cents: 220 }, { name: 'Cruasán', cents: 190 }, { name: 'Zumo', cents: 300 }] },
];

// Bug 1 — opciones para la lista desplegable de pedidos.
// TODO 1: toOption devuelve undefined en lugar de un objeto.
const toOption = (order) => { value: order.id };

// Bug 2 — estadísticas del turno.
const stats = {
  served: 0,
  record(order) {
    this.served += 1;
  },
};
// TODO 2: después de esta línea, stats.served sigue en 0.
orders.forEach(stats.record);

// Bug 3 — recordatorios para avisar a cada cliente cuando su pedido esté listo.
const reminders = [];
// TODO 3: al llamarlos, ningún recordatorio funciona.
for (var i = 0; i < orders.length; i++) {
  reminders.push(() => `Avisar a ${orders[i].customer}`);
}

// Bug 4 — ticket con formato de moneda; las opciones deberían ser opcionales.
// TODO 4: formatTicket(order) sin opciones lanza un error.
function formatTicket(order, { locale = 'es-ES', currency = 'EUR' }) {
  const cents = order.items.reduce((sum, item) => sum + item.cents, 0);
  return `#${order.id}: ${new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100)}`;
}

// Bug 5 — la caja del día.
let total = 0;
function orderTotal(order) {
  // TODO 5: esta función «local» estropea la caja del día.
  total = 0;
  for (const item of order.items) {
    total += item.cents;
  }
  return total;
}
for (const order of orders) {
  const amount = orderTotal(order);
  total += amount;
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, actual, expected) {
  if (actual === expected) {
    console.log('✓', description);
  } else {
    console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
  }
}
// Ejecuta fn y devuelve su resultado, o el error como texto (así nada detiene el script).
function attempt(fn) {
  try {
    return fn();
  } catch (error) {
    return `${error.name}: ${error.message}`;
  }
}
const plain = (text) => text.replaceAll(' ', ' '); // Intl usa un espacio de no separación

check('Bug 1: toOption(pedido 101)', JSON.stringify(toOption(orders[0])), '{"value":101}');
check('Bug 2: pedidos servidos', stats.served, 3);
check('Bug 3: primer recordatorio', attempt(() => reminders[0]()), 'Avisar a Ana');
check('Bug 3: último recordatorio', attempt(() => reminders[2]()), 'Avisar a Marta');
check('Bug 4: ticket sin opciones', attempt(() => plain(formatTicket(orders[1]))), '#102: 2,60 €');
check('Bug 4: ticket con opciones', attempt(() => formatTicket(orders[1], { locale: 'en-US', currency: 'USD' })), '#102: $2.60');
check('Bug 5: caja del día (céntimos)', total, 1400);
```
