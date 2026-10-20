---
example_description: "Cuándo una petición a otro origen es «simple» y cuándo el navegador pregunta antes con un preflight (OPTIONS): métodos distintos de GET/HEAD/POST, JSON, Authorization o cabeceras propias. Un PUT con JSON pasa porque el servidor lo permite; una cabecera que el servidor no lista frena la petición antes de enviarla"
example_tags: "javascript|cors|preflight|options|cabeceras|put|json"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Las reglas del navegador, simplificadas (las reales limitan además el
// tamaño y los caracteres de los valores).
const SIMPLE_METHODS = ['GET', 'HEAD', 'POST'];
const SIMPLE_HEADERS = ['accept', 'accept-language', 'content-language', 'content-type'];
const SIMPLE_TYPES = ['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'];

function needsPreflight(method, headers = {}) {
  if (!SIMPLE_METHODS.includes(method)) return true;
  return Object.entries(headers).some(([headerName, value]) => {
    const key = headerName.toLowerCase();
    if (!SIMPLE_HEADERS.includes(key)) return true;
    return key === 'content-type' && !SIMPLE_TYPES.includes(value.split(';')[0].trim());
  });
}
console.log('GET sin cabeceras →', needsPreflight('GET'));
console.log('POST de formulario →', needsPreflight('POST', { 'Content-Type': 'application/x-www-form-urlencoded' }));
console.log('POST con JSON →', needsPreflight('POST', { 'Content-Type': 'application/json' }));
console.log('GET con Authorization →', needsPreflight('GET', { Authorization: 'Bearer t0k3n' }));
console.log('DELETE →', needsPreflight('DELETE'));

// De verdad, a otro origen. Antes del PUT, el navegador envía un OPTIONS que
// pregunta «¿puedo hacer un PUT con Content-Type y X-Cart-Version?», y el
// servidor contesta con Access-Control-Allow-Methods y -Allow-Headers.
const cartUrl = 'http://127.0.0.1:3001/api/demo/echo';
const put = await fetch(cartUrl, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', 'X-Cart-Version': '7' },
  body: JSON.stringify({ sku: 'CAF-500', quantity: 3 }),
});
const echo = await put.json();
console.log('✅ PUT con JSON →', put.status, '| llegó:', echo.method, echo.body, '| X-Cart-Version:', echo.headers['x-cart-version']);

// Este servidor solo permite Content-Type, Authorization y las cabeceras X-….
// Con Idempotency-Key el preflight dice que no y el POST NUNCA se envía.
try {
  await fetch(cartUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': 'pedido-0042' },
    body: JSON.stringify({ sku: 'CAF-500', quantity: 1 }),
  });
} catch (error) {
  console.log('⛔ con Idempotency-Key →', `${error.name}: ${error.message}`);
}

// Abre el ejemplo con ↗ y mira la pestaña Network de DevTools: delante de
// cada petición con preflight verás su OPTIONS (este servidor pide no
// guardarlo en caché, Access-Control-Max-Age: 0, para que lo veas siempre).
```
