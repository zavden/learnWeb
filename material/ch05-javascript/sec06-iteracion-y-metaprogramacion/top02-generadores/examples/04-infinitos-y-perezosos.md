---
example_description: "Un generador puede no terminar nunca: con while (true) y yield produce valores solo cuando se piden; se consume con next(), break o una desestructuración que toma lo que necesita"
example_tags: "javascript|python|generadores|infinitos|perezoso|itertools"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Números de pedido sin fin: el while (true) no cuelga nada, porque el yield
// pausa la función en cada vuelta hasta que alguien pide el siguiente.
function* orderNumbers(prefix) {
  let n = 1;
  while (true) yield `${prefix}-${String(n++).padStart(4, '0')}`;
}

const tickets = orderNumbers('PED');
console.log('pedidos →', tickets.next().value, tickets.next().value, tickets.next().value);

// Fibonacci, con un contador de cuántos valores se llegan a CALCULAR.
let computed = 0;
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    computed += 1;
    yield a;
    [a, b] = [b, a + b];
  }
}

// Desestructurar pide exactamente los valores que necesita (y luego lo cierra).
const [f0, f1, f2, f3, f4, f5] = fibonacci();
console.log('primeros seis →', f0, f1, f2, f3, f4, f5, '| calculados →', computed);

// for…of con break: el generador no calcula nada más allá del último pedido.
computed = 0;
const under100 = [];
for (const f of fibonacci()) {
  if (f >= 100) break;
  under100.push(f);
}
console.log('menores que 100 →', under100.join(' '), '| calculados →', computed);

// Turnos rotativos: el itertools.cycle de Python en tres líneas.
function* cycle(items) {
  while (true) for (const item of items) yield item;
}
const shifts = cycle(['Ana', 'Luis', 'Sofía']);
const week = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb'].map((day) => `${day}: ${shifts.next().value}`);
console.log('turnos →', week.join(' · '));

// 🛑 Nunca pidas TODOS los valores de un generador infinito: [...fibonacci()],
//    Array.from(fibonacci()) o un for…of sin break no terminarían. (LearnWeb
//    cortaría el bucle a los 1,2 s; una página normal se quedaría colgada.)

// > Desde Python: itertools.count(), cycle() y un while True con yield son lo
//   mismo. Para tomar «los n primeros» Python usa islice; aquí, take(n) de la
//   lección (ejemplo siguiente) o la desestructuración.
```
