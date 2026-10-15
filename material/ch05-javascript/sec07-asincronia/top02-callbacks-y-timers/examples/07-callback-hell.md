---
example_description: "El «callback hell»: un pago en cinco pasos asíncronos que dependen unos de otros se convierte en una pirámide de callbacks anidados, con la misma comprobación de error repetida en cada nivel"
example_tags: "javascript|callbacks|callback-hell|asincronia|error-first"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Una API de tienda SIMULADA con callbacks «error primero»: cada operación
// tarda 30 ms y responde con callback(error) o callback(null, resultado).
const later = (callback, ...args) => setTimeout(callback, 30, ...args);
const money = (cents) => `$${(cents / 100).toFixed(2)}`;
const STOCK = { 'café de olla': 12, 'mole poblano': 0, 'cajeta': 5 };
const CARTS = {
  'C-1': [{ name: 'café de olla', cents: 21000 }, { name: 'cajeta', cents: 9500 }],
  'C-2': [{ name: 'mole poblano', cents: 18000 }],
};

const api = {
  getCart: (customerId, callback) => later(callback, null, CARTS[customerId]),
  reserveStock: (items, callback) => {
    const missing = items.find((item) => STOCK[item.name] === 0);
    if (missing) later(callback, new Error(`sin stock de «${missing.name}»`));
    else later(callback, null, `R-${items.length}0${items.length}`);
  },
  chargeCard: (customerId, cents, callback) => later(callback, null, `PAY-${customerId}-${cents}`),
  createShipment: (customerId, callback) => later(callback, null, `MX-${customerId}-77`),
  sendEmail: (customerId, text, callback) => later(callback, null, true),
};

// 🔺 Cada paso necesita el resultado del anterior, así que cada uno va DENTRO
//    del callback del anterior. El código se desplaza a la derecha, y la
//    comprobación de error se repite en cada nivel (si olvidas una, el error
//    se pierde en silencio).
function checkout(customerId, done) {
  api.getCart(customerId, (error, cart) => {
    if (error) return done(error);
    const total = cart.reduce((sum, item) => sum + item.cents, 0);
    console.log(`  1. carrito → ${cart.length} producto(s), ${money(total)}`);
    api.reserveStock(cart, (error, reservation) => {
      if (error) return done(error);
      console.log(`  2. stock reservado → ${reservation}`);
      api.chargeCard(customerId, total, (error, payment) => {
        if (error) return done(error);
        console.log(`  3. cobrado → ${payment}`);
        api.createShipment(customerId, (error, tracking) => {
          if (error) return done(error);
          console.log(`  4. envío creado → ${tracking}`);
          api.sendEmail(customerId, `Tu pedido va en camino: ${tracking}`, (error) => {
            if (error) return done(error);
            console.log('  5. email enviado');
            done(null, { payment, tracking });
          });
        });
      });
    });
  });
}

// Y para hacer dos pagos SEGUIDOS… otro nivel más.
console.log('▶ cliente C-1');
checkout('C-1', (error, result) => {
  if (error) console.log('  ⛔ pago fallido:', error.message);
  else console.log(`  ✅ pedido completado (${result.tracking})`);

  console.log('▶ cliente C-2');
  checkout('C-2', (error) => {
    if (error) console.log('  ⛔ pago fallido:', error.message);
  });
});

// La pirámide es solo el síntoma visible. Los problemas de fondo: el flujo
// se lee de fuera hacia dentro, los errores hay que propagarlos a mano en
// cada nivel, y ejecutar pasos en PARALELO (reservar stock y validar la
// tarjeta a la vez) obliga a llevar contadores a mano.
// En la lección «Promesas» este mismo checkout se vuelve una cadena plana; en
// «async/await», código que se lee como si fuera síncrono.
```
