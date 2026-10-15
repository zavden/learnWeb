---
example_description: "Enviar datos con fetch: method POST, cabeceras (Content-Type: application/json, Accept y una propia X-…) y body: JSON.stringify(objeto). Un endpoint eco del servidor de LearnWeb devuelve lo que recibió; con FormData el navegador pone él mismo el Content-Type multipart"
example_tags: "javascript|fetch|post|json|cabeceras|content-type|formdata"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// /api/demo/echo es un endpoint de prueba de LearnWeb: contesta con un JSON
// que describe la petición que le llegó (método, cabeceras, cuerpo…).
// ?status=201 le pide contestar «201 Created», como haría una API al crear.
const order = {
  customer: 'C-1042',
  items: [{ sku: 'CAF-500', quantity: 2 }],
  notes: 'Entregar por la tarde',
};

const response = await fetch('/api/demo/echo?status=201', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json', // «el cuerpo es JSON»
    Accept: 'application/json',         // «quiero la respuesta en JSON»
    'X-Request-Id': 'pedido-0042',      // una cabecera propia
  },
  body: JSON.stringify(order),          // el cuerpo viaja como TEXTO
});
const echo = await response.json();

console.log('status →', response.status, response.statusText);
console.log('el servidor recibió →', echo.method, echo.path);
console.log('Content-Type →', echo.headers['content-type']);
console.log('X-Request-Id →', echo.headers['x-request-id']);
console.log('cuerpo (ya analizado por el servidor) →', echo.body);
console.log('¿el mismo pedido? →', echo.body.items[0].sku === order.items[0].sku);

// Las cabeceras de la respuesta se leen con headers.get(), sin distinguir
// mayúsculas de minúsculas.
console.log('respuesta Content-Type →', response.headers.get('CONTENT-TYPE'));

// Con FormData (módulo «Formularios con JavaScript») NO pongas Content-Type:
// el navegador escribe «multipart/form-data; boundary=…» con su separador.
const form = new FormData();
form.append('name', 'Lucía Ramírez');
form.append('newsletter', 'sí');
const formEcho = await (await fetch('/api/demo/echo', { method: 'POST', body: form })).json();
console.log('FormData →', formEcho.headers['content-type'].split(';')[0], formEcho.body);
```
