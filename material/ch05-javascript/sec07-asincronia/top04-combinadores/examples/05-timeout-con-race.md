---
example_description: "Un plazo con Promise.race no cancela a la operación perdedora: el usuario ve «tiempo agotado» pero el cobro sigue y se completa después; pasar un AbortSignal.timeout a la operación la detiene de verdad"
example_tags: "javascript|python|promesas|race|timeout|abortsignal|cancelar|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// La pasarela de pago tarda 150 ms en cobrar; la tienda solo espera 80 ms.
function chargeCard(cents, { signal } = {}) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted(); // si ya estaba cancelada, ni empieza
    const timerId = setTimeout(() => {
      console.log(`   💳 la pasarela COBRÓ $${cents / 100}`);
      resolve('PAY-5521');
    }, 150);
    // addEventListener: capítulo 6. «Si me cancelan, no cobres».
    signal?.addEventListener('abort', () => {
      clearTimeout(timerId);
      console.log('   💳 la pasarela canceló el cobro a tiempo');
      reject(signal.reason);
    }, { once: true });
  });
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function timeout(ms) {
  return new Promise((_, reject) => setTimeout(reject, ms, new Error(`sin respuesta en ${ms} ms`)));
}

// 🐛 race decide quién GANA, pero no detiene al que pierde.
console.log('▶ plazo con race');
Promise.race([chargeCard(64000), timeout(80)])
  .then((paymentId) => console.log('  pagado →', paymentId))
  .catch((error) => console.log('  ⛔ al usuario:', error.message, '— «Inténtalo de nuevo»'))
  .then(() => wait(150))
  .then(() => {
    console.log('  🐛 …y la tarjeta se cargó igualmente: si reintenta, paga dos veces');

    // ✅ AbortSignal.timeout(ms): una señal que se cancela sola pasado el plazo.
    //    La operación la recibe y se detiene de verdad.
    console.log('▶ plazo con AbortSignal.timeout');
    return chargeCard(64000, { signal: AbortSignal.timeout(80) });
  })
  .then((paymentId) => console.log('  pagado →', paymentId))
  .catch((error) => console.log('  ✅ al usuario: plazo agotado, no se cobró nada →', error.name))
  .then(() => wait(150))
  .then(() => console.log('fin: no hubo cobros fantasma'));

// Además, en la versión con race, el temporizador de timeout() sigue vivo
// aunque el cobro gane (habría que guardarlo y cancelarlo con clearTimeout).
// > Desde Python: asyncio.wait_for(cobro(), timeout=0.08) y asyncio.timeout()
//   SÍ cancelan la tarea al vencer el plazo: se parecen a la versión con
//   AbortSignal, no a race.
```
