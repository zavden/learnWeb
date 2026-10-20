---
example_description: "El pago en cinco pasos escrito con async/await: se lee de arriba abajo como código síncrono, los resultados de cada paso quedan en variables normales y los errores se manejan con try/catch/finally"
example_tags: "javascript|async|await|try-catch|finally|callback-hell"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// La misma API de tienda de las dos lecciones anteriores (promesas).
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

// Los cinco pasos, de arriba abajo. Cada resultado es una variable normal:
// ya no hace falta el objeto «order» de fuera que usaba la cadena de then.
async function checkout(customerId) {
  const cart = await api.getCart(customerId);
  const total = cart.reduce((sum, item) => sum + item.cents, 0);
  console.log(`  1. carrito → ${cart.length} producto(s), ${money(total)}`);
  const reservation = await api.reserveStock(cart); // si se rechaza, LANZA aquí
  console.log(`  2. stock reservado → ${reservation}`);
  const payment = await api.chargeCard(customerId, total);
  console.log(`  3. cobrado → ${payment}`);
  const tracking = await api.createShipment(customerId);
  console.log(`  4. envío creado → ${tracking}`);
  await api.sendEmail(customerId, `Tu pedido va en camino: ${tracking}`);
  console.log('  5. email enviado');
  return tracking;
}

// try/catch/finally funcionan con await como con código síncrono.
async function main() {
  for (const customerId of ['C-1', 'C-2']) {
    console.log(`▶ cliente ${customerId}`);
    try {
      const tracking = await checkout(customerId);
      console.log(`  ✅ pedido completado (${tracking})`);
    } catch (error) {
      console.log('  ⛔ pago fallido:', error.message);
    } finally {
      console.log('  🔓 carrito desbloqueado');
    }
  }
}

main(); // main devuelve una promesa; aquí nadie la espera (ver ejemplo 4)

// Compara con la pirámide de «Callbacks y temporizadores» y con la cadena de
// «Promesas»: es el mismo programa, con la misma API.
```
