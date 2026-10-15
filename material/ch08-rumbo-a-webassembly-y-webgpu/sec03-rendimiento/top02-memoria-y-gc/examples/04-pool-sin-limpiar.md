---
example_description: "Un objeto reutilizado sin limpiar arrastra los datos de su uso anterior: la comanda de la mesa 7 sale de la cocina con la alergia al cacahuate y las notas de la mesa 3. Limpiar cada campo al devolverlo al pool (y vaciar los arrays con length = 0) lo evita"
example_tags: "javascript|rendimiento|memoria|object-pooling|estado|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Las comandas de una cocina se reutilizan: el sistema de pantallas crea unas pocas y las recicla.
function createTicket() {
  return { table: 0, dishes: [], allergy: null, notes: '' };
}
function describe(ticket) {
  return `mesa ${ticket.table} · ${ticket.dishes.join(', ')} · alergia: ${ticket.allergy ?? 'ninguna'} · notas: ${ticket.notes || '—'}`;
}

// 🐛 Un pool mínimo que devuelve las comandas tal como llegan.
const buggyFree = [];
const buggyAcquire = () => buggyFree.pop() ?? createTicket();
const buggyRelease = (ticket) => buggyFree.push(ticket);

const forTable3 = buggyAcquire();
forTable3.table = 3;
forTable3.dishes.push('tacos al pastor', 'agua de jamaica');
forTable3.allergy = 'cacahuate';
forTable3.notes = 'sin cebolla';
console.log('🐛 comanda 1 →', describe(forTable3));
buggyRelease(forTable3); // la mesa 3 ya comió

// La mesa 7 solo rellena lo que le toca… y lo demás sigue ahí.
const forTable7 = buggyAcquire();
forTable7.table = 7;
forTable7.dishes.push('pozole');
console.log('🐛 comanda 2 →', describe(forTable7));
console.log('🐛 ¿es el mismo objeto que la comanda de la mesa 3? →', forTable7 === forTable3);

// ✅ El pool limpia CADA campo al recibir la comanda. Los arrays se vacían con length = 0:
//    se reutiliza el mismo array (= [] crearía otro, justo lo que el pool quiere evitar).
function resetTicket(ticket) {
  ticket.table = 0;
  ticket.dishes.length = 0;
  ticket.allergy = null;
  ticket.notes = '';
}
const free = [];
const acquire = () => free.pop() ?? createTicket();
const release = (ticket) => {
  resetTicket(ticket);
  free.push(ticket);
};

const ticketA = acquire();
Object.assign(ticketA, { table: 3, allergy: 'cacahuate', notes: 'sin cebolla' });
ticketA.dishes.push('tacos al pastor', 'agua de jamaica');
release(ticketA);
const ticketB = acquire();
ticketB.table = 7;
ticketB.dishes.push('pozole');
console.log('✅ comanda 2 →', describe(ticketB));
console.log('✅ ¿mismo objeto y mismo array de platos, reutilizados? →', ticketB === ticketA && ticketB.dishes === ticketA.dishes);

// La limpieza es parte del contrato del pool: cuando añadas un campo a la comanda, añádelo
// también a resetTicket. Una prueba así (una comanda usada y limpiada = una nueva) lo vigila:
const used = createTicket();
Object.assign(used, { table: 12, allergy: 'gluten', notes: 'para llevar' });
used.dishes.push('chilaquiles');
resetTicket(used);
console.log('✅ ¿una comanda usada y limpiada es igual a una nueva? →', JSON.stringify(used) === JSON.stringify(createTicket()));
```
