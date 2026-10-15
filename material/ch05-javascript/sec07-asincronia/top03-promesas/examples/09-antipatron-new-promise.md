---
example_description: "El antipatrón de la construcción explícita: envolver en new Promise algo que ya es una promesa; basta olvidar reenviar el rechazo para que la promesa de fuera se quede pendiente para siempre y el error salga como «Uncaught (in promise)»"
example_tags: "javascript|promesas|new-promise|antipatron|rechazo|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const orders = new Map([['P-501', { items: [{ cents: 21000 }, { cents: 9500 }] }]]);

// getOrder YA devuelve una promesa.
function getOrder(id) {
  return wait(40).then(() => {
    if (!orders.has(id)) throw new Error(`Pedido ${id} no encontrado`);
    return orders.get(id);
  });
}

// 🐛 Envolverla en new Promise «para devolver una promesa». Funciona en el
//    camino feliz, pero el rechazo de getOrder no se reenvía a reject.
function getOrderTotalWrapped(id) {
  return new Promise((resolve) => {
    getOrder(id).then((order) => {
      resolve(order.items.reduce((sum, item) => sum + item.cents, 0));
    }); // ← sin catch ni reject: si getOrder falla, el error se pierde aquí
  });
}

// ✅ Devuelve la cadena: then ya crea la promesa nueva, y los errores viajan solos.
function getOrderTotal(id) {
  return getOrder(id).then((order) => order.items.reduce((sum, item) => sum + item.cents, 0));
}

getOrderTotalWrapped('P-501').then((cents) => console.log('🐛 envuelta, camino feliz →', cents));

const stuck = getOrderTotalWrapped('P-999');
stuck.catch((error) => console.log('(este catch nunca se ejecuta)', error.message));
// A los 40 ms: «Uncaught (in promise) Error: Pedido P-999 no encontrado»
// (el rechazo de la promesa INTERIOR, que nadie escucha)…

// (La versión correcta empieza 100 ms después, para no mezclar su salida con la del bug.)
setTimeout(() => {
  getOrderTotal('P-999').catch((error) => console.log('✅ sin envoltorio, el error llega →', error.message));
}, 100);

wait(300).then(() => {
  // …y la promesa EXTERIOR no se asienta nunca: el «Cargando…» sería eterno.
  console.log('🐛 la envuelta, 300 ms después →', stuck);
});

// Señales del antipatrón: un new Promise cuyo ejecutor llama a algo que ya
// devuelve una promesa, y un resolve dentro de un then. Solución: return de
// la cadena. Usa new Promise solo para envolver APIs que no son promesas.
```
