---
example_description: "Con callbacks, el control lo tiene quien los llama: una pasarela de pago con un bug llama a onSuccess dos veces (y otra, nunca); el pedido se crea dos veces si no te proteges con un envoltorio once y un plazo"
example_tags: "javascript|callbacks|inversion-de-control|once|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Una pasarela de pago de un tercero (simulada). Tiene un bug: cuando la red
// reintenta, avisa del éxito DOS veces. Y con ciertas tarjetas no avisa nunca.
const paymentGateway = {
  pay(cardNumber, cents, onSuccess) {
    if (cardNumber.endsWith('0000')) return; // 🐛 se queda colgada: no llama a nada
    setTimeout(() => onSuccess({ paymentId: `PAY-${cardNumber.slice(-4)}` }), 40);
    setTimeout(() => onSuccess({ paymentId: `PAY-${cardNumber.slice(-4)}` }), 90); // 🐛 el duplicado
  },
};

const createdOrders = [];
function createOrder(customer, payment) {
  createdOrders.push(customer);
  console.log(`  🧾 pedido creado para ${customer} (${payment.paymentId})`);
}

// 🐛 Confiamos en la pasarela: si llama dos veces, creamos dos pedidos.
paymentGateway.pay('4111222233334444', 25000, (payment) => createOrder('Ana', payment));

// ✅ Defensa 1: once (lección «Funciones de orden superior»): solo la primera llamada cuenta.
function once(fn) {
  let called = false;
  return (...args) => {
    if (called) return;
    called = true;
    fn(...args);
  };
}
paymentGateway.pay('5555666677778888', 18000, once((payment) => createOrder('Luis', payment)));

// ✅ Defensa 2: un plazo. Si en 150 ms nadie ha respondido, damos el pago por fallido.
function payWithTimeout(card, cents, onDone) {
  const finish = once(onDone);
  const timerId = setTimeout(() => finish(new Error('la pasarela no respondió')), 150);
  paymentGateway.pay(card, cents, (payment) => {
    clearTimeout(timerId);
    finish(null, payment);
  });
}
payWithTimeout('4000111122220000', 9900, (error, payment) => {
  if (error) console.log('  ⏰ Sofía:', error.message);
  else createOrder('Sofía', payment);
});

setTimeout(() => {
  console.log('pedidos creados →', createdOrders.join(', '));
  console.log('🐛 Ana tiene dos pedidos →', createdOrders.filter((name) => name === 'Ana').length === 2);
}, 200);

// Al pasar un callback le das el CONTROL de tu programa a otro código: él
// decide si te llama, cuándo, cuántas veces y con qué argumentos («inversión
// de control»). Las promesas (lección siguiente) devuelven ese control: una
// promesa se cumple o se rechaza UNA sola vez, y lo que hagas con el
// resultado lo decides tú.
```
