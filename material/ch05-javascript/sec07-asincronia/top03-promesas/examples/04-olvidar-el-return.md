---
example_description: "Olvidar el return dentro de un then rompe la cadena: el siguiente then recibe undefined y se ejecuta sin esperar a la operación, que sigue suelta por su cuenta; con llaves hay que escribir return, con una flecha de expresión no"
example_tags: "javascript|promesas|then|return|encadenar|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getCart(customerId) {
  return wait(30).then(() => ['café de olla', 'cajeta']);
}
function reserveStock(items) {
  return wait(60).then(() => {
    console.log(`    📦 (el almacén termina la reserva de ${items.length} productos)`);
    return 'R-202';
  });
}

// 🐛 La flecha tiene LLAVES y no hay return: el callback devuelve undefined.
//    La reserva arranca, pero la cadena no la espera ni recibe su resultado.
function buggyCheckout() {
  return getCart('C-1')
    .then((items) => {
      reserveStock(items); // ← promesa suelta: nadie la espera
    })
    .then((reservation) => {
      console.log('  🐛 reserva →', reservation, '(y el almacén aún no ha terminado)');
    });
}

// ✅ Con return (o con una flecha sin llaves, que devuelve su expresión).
function fixedCheckout() {
  return getCart('C-1')
    .then((items) => reserveStock(items)) // ← flecha de expresión: devuelve la promesa
    .then((reservation) => {
      console.log('  ✅ reserva →', reservation, '(el almacén ya terminó)');
    });
}

console.log('▶ sin return');
buggyCheckout()
  .then(() => wait(100)) // dejamos que la reserva suelta termine antes de seguir
  .then(() => {
    console.log('▶ con return');
    return fixedCheckout();
  });

// Una promesa suelta tiene otro problema: si se rechaza, su error tampoco
// llega al catch de la cadena (sale como «Uncaught (in promise)»; ejemplo 7).
// Regla práctica: dentro de un then con llaves, si llamas a algo que devuelve
// una promesa, escribe return delante. Con flechas de una sola expresión,
// (x) => reserveStock(x), el return va implícito (lección «Formas de función»).
```
