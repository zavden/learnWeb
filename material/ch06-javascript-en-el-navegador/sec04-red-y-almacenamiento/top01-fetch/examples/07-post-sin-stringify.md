---
example_description: "Pasar un objeto como body sin JSON.stringify: fetch lo convierte en el texto «[object Object]» y el servidor recibe eso (aquí contesta 400 «Invalid JSON body»). El objeto viaja solo si lo conviertes tú a JSON"
example_tags: "javascript|fetch|post|json|stringify|object-object|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const order = { customer: 'C-1042', sku: 'CAF-500', quantity: 2 };

// 🐛 body: order. El cuerpo de una petición es texto o bytes; fetch convierte
//    cualquier otro valor en texto, con String(order).
const response = await fetch('/api/demo/echo', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: order,
});
const echo = await response.json();
console.log('🐛 status →', response.status, response.statusText);
console.log('🐛 el servidor recibió →', echo.body);
console.log('🐛 y contestó →', echo.error);
console.log('String(order) →', String(order));

// ✅ JSON.stringify convierte el objeto en el texto JSON que espera el servidor.
const fixed = await fetch('/api/demo/echo', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(order),
});
const fixedEcho = await fixed.json();
console.log('✅ status →', fixed.status, fixed.statusText);
console.log('✅ el servidor recibió →', fixedEcho.body);

// fetch no avisa: «[object Object]» es un texto válido para él. Lo descubre el
// servidor (un 400 si tienes suerte; si guarda el texto sin mirar, un registro
// corrupto). Un helper como postJSON(url, datos) que haga el stringify y ponga
// la cabecera evita repetir el olvido en cada llamada.
```
