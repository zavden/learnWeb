---
example_description: "postMessage copia el mensaje con el clonado estructurado (el algoritmo de structuredClone): Date, Map, Set, typed arrays, errores y referencias circulares llegan intactos, los getters llegan como valores fijos, y lo que el worker cambia en su copia no cambia el original"
example_tags: "javascript|workers|postmessage|structuredclone|copias|map|set|date"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// El worker (05-clone/inspect-worker.js, en «Assets») describe lo que recibe.
const booking = {
  code: 'MUSEO-2207',
  visit: new Date('2026-11-02T17:00:00Z'),
  tickets: new Map([['adulto', 2], ['estudiante', 1]]),
  tags: new Set(['Día de Muertos', 'visita guiada']),
  seats: new Uint8Array([12, 13, 14]),
  problem: new RangeError('la sala 3 está llena a las 11:00'),
  get people() {
    return [...this.tickets.values()].reduce((sum, count) => sum + count, 0);
  },
};
booking.self = booking; // una referencia circular (JSON.stringify lanzaría TypeError)

const worker = new Worker('05-clone/inspect-worker.js', { type: 'module' });
worker.onmessage = (event) => {
  const { report, copy } = event.data;
  for (const line of report) console.log('worker:', line);
  console.log('página: adultos en el original →', booking.tickets.get('adulto'));
  console.log('página: adultos en la copia que devolvió →', copy.tickets.get('adulto'));
  console.log('¿la copia es el mismo objeto? →', copy === booking);
  worker.terminate();
};
// postMessage recorre el objeto entero y lo copia: es el mismo algoritmo que
// structuredClone (lección «JSON y copias»). Ida: una copia; vuelta: otra copia.
worker.postMessage(booking);

// Python: multiprocessing envía los objetos serializados con pickle; el proceso
// hijo recibe una copia, igual que aquí. Lo que pickle no puede serializar (una
// lambda) tampoco viaja aquí: el ejemplo siguiente.
```
