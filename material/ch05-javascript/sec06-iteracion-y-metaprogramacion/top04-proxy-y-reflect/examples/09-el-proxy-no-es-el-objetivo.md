---
example_description: "Un proxy es otro objeto: proxy !== target, un Set o un Map con uno no encuentra el otro, y quien conserva el objetivo se salta todas las trampas (y la validación); nada distingue un proxy desde el código"
example_tags: "javascript|proxy|identidad|set|map|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Un proxy que valida los invitados de una reserva (como el de la validación).
function validated(target) {
  return new Proxy(target, {
    set(obj, key, value) {
      if (key === 'guests' && !(Number.isInteger(value) && value >= 1 && value <= 12)) {
        throw new RangeError(`Invitados no válidos: ${value}`);
      }
      obj[key] = value;
      return true;
    },
  });
}

const raw = { id: 'R-310', guests: 4 };
const booking = validated(raw);

// 🐛 1. Identidad: el proxy y su objetivo son DOS objetos.
console.log('🐛 booking === raw →', booking === raw);
const confirmed = new Set([raw]);
console.log('🐛 confirmed.has(booking) →', confirmed.has(booking));
const tables = new Map([[booking, 'mesa 7']]);
console.log('🐛 tables.get(raw) →', tables.get(raw));

// …y desde el código no hay forma de saber si un valor es un proxy:
console.log('typeof, instanceof →', typeof booking, booking instanceof Object);

// 🐛 2. Quien conserva el objetivo se salta TODAS las trampas.
raw.guests = 250; // sin pasar por el proxy: nadie valida
console.log('🐛 booking.guests →', booking.guests);

// ✅ No dejes el objetivo a la vista: créalo dentro de la llamada, para que la
//    única referencia sea el proxy…
const safeBooking = validated({ id: 'R-311', guests: 2 });
try {
  safeBooking.guests = 250;
} catch (error) {
  console.warn(`⛔ ${error.name}: ${error.message}`);
}
console.log('✅ safeBooking.guests →', safeBooking.guests);

// ✅ …y usa siempre el mismo objeto (el proxy) en Sets, Maps y comparaciones,
//    o compara por un dato, como el id.
const confirmedIds = new Set([safeBooking.id]);
console.log('✅ por id →', confirmedIds.has(safeBooking.id));
```
