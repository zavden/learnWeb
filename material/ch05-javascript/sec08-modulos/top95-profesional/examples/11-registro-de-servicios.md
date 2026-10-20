---
example_description: "Un contenedor de servicios con claves Symbol exportadas desde un módulo: un solo sitio compone la aplicación, las pruebas cambian el reloj y la pasarela de pago, los ciclos entre servicios se detectan, y Symbol.for sobrevive a una copia duplicada del módulo de claves"
example_tags: "javascript|profesional|modulos|symbol|inyeccion-de-dependencias|contenedor|registro"
example_stage: professional
example_importance: useful
console: true
---

# JavaScript

```javascript
// UN REGISTRO DE SERVICIOS CON CLAVES SÍMBOLO.
//
// Archivos (assets/11-servicios/):
//   tokens.js        → LOGGER, CLOCK, ORDERS (Symbol) y PAYMENTS (Symbol.for)
//   container.js     → createContainer(): register(), resolve(), detección de ciclos
//   services/*.js    → fábricas: createLogger, createClock, createPaymentGateway, createOrderService
//   app-container.js → createAppContainer(overrides): la composición de la app
//
// Decisiones:
// - Los servicios no se importan entre sí: reciben sus dependencias. Solo
//   app-container.js sabe qué fábrica hay detrás de cada clave.
// - Las claves son símbolos exportados por un módulo: únicos (no chocan con
//   las de otra librería), compartidos (el módulo se evalúa una vez) y
//   legibles en los mensajes (su description).
// - Symbol.for para la clave que comparten varios paquetes: sobrevive a que
//   tokens.js se cargue dos veces; Symbol() no.
// - Para servicios y aplicaciones medianas, pasar las dependencias a mano
//   (ejemplo 06) suele bastar; un contenedor ayuda cuando hay decenas.
//
// Alcance: módulos 1-8.
import { createAppContainer } from './11-servicios/app-container.js';
import { createContainer } from './11-servicios/container.js';
import { LOGGER, CLOCK, ORDERS, PAYMENTS } from './11-servicios/tokens.js';
import * as tokensCopy from './11-servicios/tokens.js?copia'; // como si llegara en otro paquete

console.group('▶ la aplicación');
const app = createAppContainer();
const order = app.resolve(ORDERS).place('Mariana Gómez', 48720);
console.log('pedido →', order.id, '| cobro →', order.paymentId);
console.log('¿un solo logger para todos? →', app.resolve(LOGGER) === app.resolve(LOGGER), '| mensajes →', app.resolve(LOGGER).count());
console.log('el contenedor →', String(app));
console.groupEnd();

console.group('▶ una prueba: reloj fijo y pagos falsos');
const charges = [];
const testContainer = createAppContainer(new Map([
  [CLOCK, () => () => new Date('2026-10-13T18:30:00Z')],
  [PAYMENTS, () => ({
    charge(customer, cents) {
      charges.push({ customer, cents });
      return 'PAY-TEST';
    },
  })],
]));
const testOrder = testContainer.resolve(ORDERS).place('Iker Salas', 63684);
console.log('pedido →', testOrder.id, '|', testOrder.paymentId, '|', testOrder.createdAt);
console.log('cobros en la pasarela falsa →', charges.length, '| ¿comparte el logger con la app? →', testContainer.resolve(LOGGER) === app.resolve(LOGGER));
console.groupEnd();

console.group('▶ claves símbolo y una copia del módulo de claves');
console.log("¿Symbol('logger') === Symbol('logger')? →", Symbol('logger') === Symbol('logger'));
console.log('la copia de tokens.js → ¿mismo LOGGER?', tokensCopy.LOGGER === LOGGER, '| ¿mismo PAYMENTS (Symbol.for)?', tokensCopy.PAYMENTS === PAYMENTS);
try {
  app.resolve(tokensCopy.LOGGER);
} catch (error) {
  console.log('⛔', error.message, '(otro símbolo con la misma descripción)');
}
console.log('con Symbol.for, la copia encuentra el servicio →', typeof app.resolve(tokensCopy.PAYMENTS).charge);
try {
  app.register('logger', () => ({}));
} catch (error) {
  console.log('⛔', error.name, '|', error.message);
}
console.groupEnd();

console.group('▶ un ciclo entre servicios');
const CART = Symbol('cart');
const PRICING = Symbol('pricing');
const PROMOTIONS = Symbol('promotions');
const cyclic = createContainer()
  .register(CART, (pricing) => ({ pricing }), { deps: [PRICING] })
  .register(PRICING, (promotions) => ({ promotions }), { deps: [PROMOTIONS] })
  .register(PROMOTIONS, (cart) => ({ cart }), { deps: [CART] });
try {
  cyclic.resolve(CART);
} catch (error) {
  console.log('⛔', error.message);
}
console.groupEnd();
// Es el mismo problema que las dependencias circulares entre módulos, un
// nivel más arriba, y con la misma solución: que algo dependa de menos.
```
