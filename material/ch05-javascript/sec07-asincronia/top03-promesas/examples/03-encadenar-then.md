---
example_description: "Encadenar promesas: then devuelve una promesa NUEVA que se cumple con lo que devuelva su callback (y, si devuelve otra promesa, espera a que se asiente); el pago en cinco pasos de la pirámide de callbacks se vuelve una cadena plana con un solo catch"
example_tags: "javascript|promesas|then|encadenar|callback-hell"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// La misma API de tienda que en «Callbacks y temporizadores», pero cada
// operación DEVUELVE una promesa en vez de recibir un callback.
const later = (value) => new Promise((resolve) => setTimeout(resolve, 30, value));
const fail = (message) => new Promise((_, reject) => setTimeout(reject, 30, new Error(message)));
const money = (cents) => `$${(cents / 100).toFixed(2)}`;
const STOCK = { 'café de olla': 12, 'mole poblano': 0, 'cajeta': 5 };
const CARTS = {
  'C-1': [{ name: 'café de olla', cents: 21000 }, { name: 'cajeta', cents: 9500 }],
  'C-2': [{ name: 'mole poblano', cents: 18000 }],
};
const api = {
  getCart: (customerId) => later(CARTS[customerId]),
  reserveStock: (items) => {
    const missing = items.find((item) => STOCK[item.name] === 0);
    return missing ? fail(`sin stock de «${missing.name}»`) : later(`R-${items.length}0${items.length}`);
  },
  chargeCard: (customerId, cents) => later(`PAY-${customerId}-${cents}`),
  createShipment: (customerId) => later(`MX-${customerId}-77`),
  sendEmail: () => later(true),
};

// then devuelve una promesa NUEVA, no la misma:
const cartPromise = api.getCart('C-1');
const countPromise = cartPromise.then((cart) => cart.length);
console.log('¿then devuelve otra promesa? →', countPromise !== cartPromise);

// ✅ La pirámide, aplanada. Cada then recibe lo que DEVOLVIÓ el anterior; si
//    devolvió una promesa, la cadena espera a que se cumpla.
function checkout(customerId) {
  const order = { customerId }; // lo que los pasos van averiguando
  return api.getCart(customerId)
    .then((cart) => {
      order.total = cart.reduce((sum, item) => sum + item.cents, 0);
      console.log(`  1. carrito → ${cart.length} producto(s), ${money(order.total)}`);
      return api.reserveStock(cart); // ← devuelve una promesa: la cadena la espera
    })
    .then((reservation) => {
      console.log(`  2. stock reservado → ${reservation}`);
      return api.chargeCard(customerId, order.total);
    })
    .then((payment) => {
      console.log(`  3. cobrado → ${payment}`);
      return api.createShipment(customerId);
    })
    .then((tracking) => {
      order.tracking = tracking;
      console.log(`  4. envío creado → ${tracking}`);
      return api.sendEmail(customerId, `Tu pedido va en camino: ${tracking}`);
    })
    .then(() => {
      console.log('  5. email enviado');
      return order; // el valor final de la cadena
    });
}

// Un solo catch para TODOS los pasos: un rechazo salta los then que quedan.
console.log('▶ cliente C-1');
checkout('C-1')
  .then((order) => console.log(`  ✅ pedido completado (${order.tracking})`))
  .then(() => {
    console.log('▶ cliente C-2');
    return checkout('C-2');
  })
  .catch((error) => console.log('  ⛔ pago fallido:', error.message));
```
