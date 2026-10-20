---
example_description: "Romper un ciclo entre pedidos y avisos con inyección de dependencias: ningún módulo importa al otro, el script de entrada los conecta, y la misma inyección permite probar los pedidos con un canal de avisos falso"
example_tags: "javascript|modulos|dependencias-circulares|inyeccion-de-dependencias|pruebas"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Archivos que usa (assets/05-avisos/):
//   orders.js        → createOrderService({ notify }): no importa a nadie
//   notifications.js → createNotifier({ send }): no importa a nadie
//   email.js         → sendEmail(): el canal «de verdad» (aquí, la consola)
//
//   ANTES (un ciclo):  orders.js ──notify()──→ notifications.js
//                          ▲                        │
//                          └───────getOrder()───────┘
//
//   AHORA: este script crea las piezas y le PASA a cada una lo que necesita.
//          orders.js ←─ notify ─ este script ─ send ─→ notifications.js
import { createOrderService } from './05-avisos/orders.js';
import { createNotifier } from './05-avisos/notifications.js';
import { sendEmail } from './05-avisos/email.js';

console.group('▶ la aplicación');
const notifier = createNotifier({ send: sendEmail });
const orders = createOrderService({ notify: notifier.notify }); // sin this que perder
orders.ship('P-1042', 'MX-77812');
console.log('estado →', orders.getOrder('P-1042').status, '| avisos enviados →', notifier.sentCount());
console.groupEnd();

// Una prueba automática: la misma fábrica con un canal FALSO, que guarda
// los mensajes en un array en vez de enviarlos.
console.group('▶ una prueba, con un canal falso');
const outbox = [];
const testNotifier = createNotifier({ send: (to, message) => outbox.push({ to, message }) });
const testOrders = createOrderService({ notify: testNotifier.notify });
testOrders.ship('P-1043', 'TEST-1');
console.log(outbox.length === 1 ? '✓' : '✗', 'se envió un aviso');
console.log(outbox[0]?.to === 'iker@example.com' ? '✓' : '✗', 'al cliente del pedido');
console.log(outbox[0]?.message.includes('TEST-1') ? '✓' : '✗', 'con la guía de envío');
console.log(notifier.sentCount() === 1 ? '✓' : '✗', 'la aplicación no se enteró de la prueba');
console.groupEnd();

// Si orders.js hiciera «import { sendEmail } from './email.js'», la prueba
// no podría cambiar ese canal: los imports son de solo lectura. Las
// fábricas que RECIBEN sus dependencias cuestan una línea más en el script
// de entrada, y a cambio no hay ciclos y todo se puede probar por separado.
```
