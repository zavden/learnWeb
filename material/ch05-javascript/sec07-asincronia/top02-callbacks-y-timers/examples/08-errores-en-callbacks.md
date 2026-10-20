---
example_description: "Un error lanzado dentro de un callback asíncrono escapa del try/catch que rodea la llamada: cuando el callback se ejecuta, el try ya terminó; el error sale como «Uncaught» y hay que atraparlo dentro del callback y entregarlo por el canal de errores"
example_tags: "javascript|callbacks|errores|try-catch|settimeout|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// La respuesta del servidor llega 50 ms después… y viene cortada.
const brokenResponse = '{"orderId": "P-731", "total": 12';

// 🐛 El try/catch rodea la LLAMADA a setTimeout, que solo programa el callback.
try {
  setTimeout(() => {
    const data = JSON.parse(brokenResponse); // lanza SyntaxError… 50 ms después
    console.log('pedido →', data.orderId);
  }, 50);
  console.log('🐛 try: setTimeout programado, ningún error a la vista');
} catch (error) {
  console.log('(este catch nunca se ejecuta)', error.name);
}
console.log('🐛 el try/catch ya terminó; el callback aún no ha empezado');
// A los 50 ms, el callback lanza y nadie lo atrapa: la consola muestra
// «Uncaught SyntaxError: …» y esa tarea se aborta (la página sigue viva).

// ✅ El try/catch tiene que estar DENTRO del callback, en la misma tarea en la
//    que ocurre el error, y el error se entrega por el canal de errores
//    (aquí, el primer argumento del callback).
function loadOrder(text, callback) {
  setTimeout(() => {
    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      callback(error); // ← el error viaja por el callback, no por throw
      return;
    }
    callback(null, data);
  }, 100);
}

loadOrder(brokenResponse, (error, data) => {
  if (error) console.log('✅ error entregado al callback →', error.name);
  else console.log('pedido →', data.orderId);
});
loadOrder('{"orderId": "P-732", "total": 1250}', (error, data) => {
  if (error) console.log('✅ error entregado al callback →', error.name);
  else console.log('✅ pedido →', data.orderId, '| total →', data.total);
});

// Cada callback se ejecuta en su propia TAREA, con la pila vacía (lección
// «El event loop»): no hay ningún try «de fuera» esperándolo. Es lo que la
// lección «Errores y excepciones» anunció: errores que ocurren «más tarde».
// Las promesas (lección siguiente) resuelven esto: un throw dentro de un then
// se convierte en un rechazo que viaja por la cadena hasta un catch.
```
