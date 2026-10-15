---
example_description: "Solución: ({ … }) en la flecha, bind para no perder this, let en el bucle, = {} en las opciones y una variable local con su propio nombre"
example_tags: "javascript|solucion|depuracion|this|closures|parametros"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: los cinco bugs del panel de la cafetería, arreglados.
const orders = [
  { id: 101, customer: 'Ana', items: [{ name: 'Café con leche', cents: 180 }, { name: 'Tostada', cents: 250 }] },
  { id: 102, customer: 'Luis', items: [{ name: 'Té chai', cents: 260 }] },
  { id: 103, customer: 'Marta', items: [{ name: 'Capuchino', cents: 220 }, { name: 'Cruasán', cents: 190 }, { name: 'Zumo', cents: 300 }] },
];

// Bug 1 — los paréntesis obligan a leer las llaves como un objeto, no como un bloque.
const toOption = (order) => ({ value: order.id });

// Bug 2 — forEach llamaba al método como función simple (this = window).
// bind fija this; también valdría forEach((order) => stats.record(order)).
const stats = {
  served: 0,
  record(order) {
    this.served += 1;
  },
};
orders.forEach(stats.record.bind(stats));

// Bug 3 — con let, cada vuelta del for tiene su propia i, y cada flecha captura la suya.
const reminders = [];
for (let i = 0; i < orders.length; i++) {
  reminders.push(() => `Avisar a ${orders[i].customer}`);
}

// Bug 4 — = {} hace que, si falta el objeto, se desestructure uno vacío.
function formatTicket(order, { locale = 'es-ES', currency = 'EUR' } = {}) {
  const cents = order.items.reduce((sum, item) => sum + item.cents, 0);
  return `#${order.id}: ${new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100)}`;
}

// Bug 5 — la variable de trabajo es LOCAL y con su propio nombre: ya no pisa la caja.
let total = 0;
function orderTotal(order) {
  let sum = 0;
  for (const item of order.items) {
    sum += item.cents;
  }
  return sum;
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
