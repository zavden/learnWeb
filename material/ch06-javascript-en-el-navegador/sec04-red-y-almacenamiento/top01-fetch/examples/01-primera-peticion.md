---
example_description: "fetch(url) devuelve una promesa que se cumple con un Response en cuanto llegan el código y las cabeceras; el cuerpo se lee después, con otra espera (json(), text()). Las dos esperas, medidas con un servidor que envía el cuerpo poco a poco"
example_tags: "javascript|fetch|response|http|json|status|cabeceras"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// fetch(url) pide un recurso por HTTP y devuelve una PROMESA de Response.
// 'products.json' es una ruta relativa: en LearnWeb apunta a la carpeta
// assets/ de este tema (ábrela con el botón «Assets»).
const response = await fetch('products.json');

// La promesa se cumple en cuanto llegan el código de estado y las cabeceras.
console.log('status →', response.status, response.statusText);
console.log('ok (status entre 200 y 299) →', response.ok);
console.log('Content-Type →', response.headers.get('content-type'));

// El CUERPO se pide aparte, con otra espera: json() lo lee entero y lo analiza.
const products = await response.json();
console.log('productos →', products.length);
for (const product of products) {
  console.log(`  · ${product.name}: $${product.price}`);
}

// Las dos esperas, medidas. Este endpoint de prueba de LearnWeb envía el
// cuerpo en 4 trozos: el primero enseguida y luego uno cada 250 ms.
const start = performance.now();
const slow = await fetch('/api/demo/stream?chunks=4&interval=250&size=64');
const headersMs = performance.now() - start;
console.log('1. Response (cabeceras) en menos de 200 ms →', headersMs < 200);
const text = await slow.text();
const bodyMs = performance.now() - start;
console.log('2. cuerpo completo tras 750 ms o más →', bodyMs >= 750, '|', text.length, 'caracteres');

// await fetch(…) NO espera al cuerpo: el Response llega con las cabeceras y el
// cuerpo sigue en camino. Por eso leerlo es otra promesa (lección «Streams y
// progreso»: se puede leer mientras llega).
// > Desde Python: requests.get(url) descarga TODO antes de volver; se parece
//   más a requests.get(url, stream=True), que vuelve con las cabeceras.
```
