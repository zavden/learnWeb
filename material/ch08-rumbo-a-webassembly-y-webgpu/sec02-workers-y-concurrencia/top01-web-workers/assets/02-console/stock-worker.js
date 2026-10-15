// WORKER DEL EJEMPLO 02: revisa el inventario de una tienda.

// 🐛 Este console.log SÍ se ejecuta, pero no sale en la consola de LearnWeb: el
// worker tiene su propia consola. Chrome DevTools sí la muestra (abre la vista
// previa en una pestaña con ↗, pulsa F12 y busca la línea marcada con el worker).
console.log('worker: revisando el inventario…');

// ✅ Un registro «de vuelta»: cada línea viaja a la página como un mensaje más,
// con un campo type para distinguirla del resultado.
function log(text) {
  self.postMessage({ type: 'log', text });
}

self.addEventListener('message', (event) => {
  const products = event.data;
  log(`${products.length} productos recibidos`);
  const lowStock = products.filter((product) => product.units < 5).map((product) => product.name);
  log(`${lowStock.length} con menos de 5 unidades`);
  self.postMessage({ type: 'result', lowStock });
});
