---
example_description: "El console.log de un worker no aparece en la consola de LearnWeb (el worker tiene su propia consola, que solo muestra Chrome DevTools); la solución es enviar las líneas de registro a la página como mensajes con un type y que la página las imprima"
example_tags: "javascript|workers|console|depuracion|devtools|postmessage|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// El worker es 02-console/stock-worker.js (en «Assets»). Su primera línea es un
// console.log('worker: revisando el inventario…') que NO verás aquí abajo.
const worker = new Worker('02-console/stock-worker.js');

worker.addEventListener('message', (event) => {
  const message = event.data;
  if (message.type === 'log') {
    // ✅ Las líneas de registro del worker, impresas por la página
    console.log('📨 del worker:', message.text);
  } else if (message.type === 'result') {
    console.log('poco stock →', message.lowStock.join(', '));
    worker.terminate();
  }
});

worker.postMessage([
  { name: 'Café de Chiapas', units: 3 },
  { name: 'Vainilla de Papantla', units: 2 },
  { name: 'Mole poblano', units: 12 },
  { name: 'Cajeta de Celaya', units: 7 },
  { name: 'Chocolate de Oaxaca', units: 4 },
]);
console.log('página: inventario enviado');

// 🐛 «worker: revisando el inventario…» no sale: la consola de LearnWeb solo recoge
// la de la página. En Chrome DevTools (↗ y F12) aparece, junto a las de la página,
// con el nombre del archivo del worker a la derecha; y en el panel Sources (Fuentes),
// el worker tiene su propio hilo («Threads»), con puntos de ruptura y todo.
// Con mensajes { type, … } la página distingue un registro de un resultado.
```
