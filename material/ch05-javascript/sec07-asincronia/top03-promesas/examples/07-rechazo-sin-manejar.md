---
example_description: "Una promesa rechazada que nadie maneja aparece en la consola como «Uncaught (in promise)»: el try/catch que rodea la llamada no la atrapa, porque el rechazo llega después; hay que terminar cada cadena con un catch"
example_tags: "javascript|promesas|rechazo|uncaught-in-promise|catch|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// La pasarela de pago rechaza la tarjeta 50 ms después.
function chargeCard(card) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (card.endsWith('0002')) reject(new Error(`Tarjeta ${card} rechazada: fondos insuficientes`));
      else resolve(`PAY-${card.slice(-4)}`);
    }, 50);
  });
}

// 🐛 El try/catch rodea la LLAMADA, que solo devuelve una promesa pendiente.
try {
  chargeCard('**** 0002'); // nadie se queda con la promesa ni le pone catch
  console.log('🐛 try: ningún error… todavía');
} catch (error) {
  console.log('(este catch nunca se ejecuta)');
}
// A los 50 ms la promesa se rechaza y nadie la escucha. El navegador lo
// anuncia en la consola: «Uncaught (in promise) Error: Tarjeta **** 0002 …».

// ✅ Cada cadena termina en un catch (o la devuelves a quien la llamó, para
//    que la termine él). El then intermedio no frena el rechazo: lo deja pasar.
//    (Empiezan 100 ms después, para que su salida no se mezcle con la del bug.)
setTimeout(() => {
  chargeCard('**** 0002')
    .then((paymentId) => console.log('cobrado →', paymentId))
    .catch((error) => console.log('✅ catch al final de la cadena →', error.message));

  chargeCard('**** 4242')
    .then((paymentId) => console.log('✅ cobrado →', paymentId))
    .catch((error) => console.log('⛔', error.message));
}, 100);

// Igual que un error sin atrapar, un rechazo sin manejar no tumba la página,
// pero quien esperaba el resultado no se entera, y el usuario se queda
// mirando un «Pagando…» que nunca termina.
// Para registrar los que se escapen (y mandarlos a tu servicio de errores),
// el navegador lanza el evento «unhandledrejection» en window (los eventos se
// estudian en el capítulo 6).
// > Desde Python: asyncio avisa algo parecido al recoger la tarea:
//   «Task exception was never retrieved».
```
