---
example_description: "La pila de llamadas y la cola de tareas: el script se ejecuta entero antes que cualquier callback, y el callback del temporizador empieza con la pila vacía, cuando el script ya terminó"
example_tags: "javascript|event-loop|pila|tareas|settimeout"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Una pila de llamadas «a mano»: cada función se apunta al entrar y se borra al
// salir, para ver en cada momento quién está en la pila (el motor lleva la suya).
const stack = ['script'];
function enter(name) {
  stack.push(name);
  console.log('pila →', stack.join(' › '));
}
function leave() {
  stack.pop();
}

function chargeCard(order) {
  enter('chargeCard');
  console.log(`  💳 cobro $${order.total} a ${order.customer}`);
  leave();
}

function scheduleReminder(order) {
  enter('scheduleReminder');
  // setTimeout(callback, ms) le pide al NAVEGADOR que encole el callback dentro
  // de ms milisegundos. No espera: vuelve al instante y el script sigue.
  setTimeout(() => {
    enter('recordatorio');
    console.log(`  ⏰ ${order.customer}, tu pedido ${order.id} sale mañana`);
    leave();
  }, 50);
  console.log('  ⏲️ recordatorio programado… y seguimos');
  leave();
}

function checkout(order) {
  enter('checkout');
  chargeCard(order);
  scheduleReminder(order);
  leave();
}

checkout({ id: 'P-1042', customer: 'Lucía', total: 640 });
stack.pop(); // el script termina: la pila queda vacía
console.log('fin del script → pila vacía:', stack.length === 0);

// El callback del temporizador NO interrumpe a nadie: espera en la cola de
// tareas hasta que la pila está vacía, y entonces empieza desde cero (su pila
// solo contiene «recordatorio»; checkout terminó hace rato).
// > Desde Python: igual que un callback de asyncio con loop.call_later: corre
//   en la misma hebra, cuando el código actual ha terminado.
```
