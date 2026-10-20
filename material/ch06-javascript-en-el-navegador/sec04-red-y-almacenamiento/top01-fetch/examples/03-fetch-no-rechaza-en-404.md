---
example_description: "fetch no rechaza cuando el servidor contesta 404 o 500: para fetch, cualquier respuesta es un éxito. Sin mirar response.ok, el programa trata la página de error como si fueran datos; con ok, el error llega al catch"
example_tags: "javascript|fetch|response|ok|status|404|500|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// 🐛 Carga el catálogo sin mirar el código de estado.
async function loadCatalog(url) {
  const response = await fetch(url);
  return response.json();
}

try {
  // El archivo se llama products.json; aquí alguien escribió mal el nombre.
  const products = await loadCatalog('productos.json');
  console.log('🐛 ningún error; «products» →', products);
  console.log('🐛 ¿es la lista de productos? →', Array.isArray(products));
} catch (error) {
  console.log('(este catch no se ejecuta)', error.message);
}

// Lo mismo con un error del servidor: este endpoint contesta con el código
// que le pidas en ?status=.
const failing = await fetch('/api/demo/echo?status=500');
console.log('🐛 500 → la promesa se CUMPLIÓ | ok:', failing.ok, '| status:', failing.status, failing.statusText);

// ✅ Mira response.ok (true solo con 200-299) y lanza tú el error.
async function loadCatalogSafely(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText} al pedir ${url}`);
  }
  return response.json();
}

try {
  await loadCatalogSafely('productos.json');
} catch (error) {
  console.log('✅ catch →', error.message);
}
const products = await loadCatalogSafely('products.json');
console.log('✅ con el nombre bien →', products.length, 'productos');

// fetch solo RECHAZA cuando no hay respuesta HTTP: sin conexión, servidor
// apagado, CORS, petición cancelada. Un 404 o un 500 son respuestas: el
// servidor contestó, solo que con malas noticias.
// > Desde Python: requests tampoco lanza con un 404; hay que llamar a
//   r.raise_for_status(). response.ok es la comprobación equivalente.
```
