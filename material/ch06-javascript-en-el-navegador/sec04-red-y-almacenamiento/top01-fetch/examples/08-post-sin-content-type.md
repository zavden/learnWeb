---
example_description: "JSON.stringify sin la cabecera Content-Type: con un body de texto, fetch pone «text/plain;charset=UTF-8» y el servidor no analiza el JSON; recibe un string y body.quantity es undefined. Con Content-Type: application/json llega un objeto"
example_tags: "javascript|fetch|post|json|content-type|text-plain|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const order = { customer: 'C-1042', sku: 'CAF-500', quantity: 2 };

// Antes de enviar nada: una Request (lo que fetch construye por dentro)
// muestra la cabecera que pone el navegador cuando el body es un string.
const preview = new Request('/api/demo/echo', { method: 'POST', body: JSON.stringify(order) });
console.log('Content-Type automático →', preview.headers.get('content-type'));

// 🐛 Sin Content-Type: el servidor ve texto plano y no lo analiza como JSON.
const response = await fetch('/api/demo/echo', {
  method: 'POST',
  body: JSON.stringify(order),
});
const echo = await response.json();
console.log('🐛 status →', response.status, '(sin error)');
console.log('🐛 Content-Type recibido →', echo.headers['content-type']);
console.log('🐛 typeof del cuerpo en el servidor →', typeof echo.body);
console.log('🐛 body.quantity →', echo.body.quantity);

// ✅ Dile al servidor qué le mandas.
const fixed = await fetch('/api/demo/echo', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(order),
});
const fixedEcho = await fixed.json();
console.log('✅ Content-Type recibido →', fixedEcho.headers['content-type']);
console.log('✅ typeof del cuerpo →', typeof fixedEcho.body, '| quantity →', fixedEcho.body.quantity);

// Este fallo es silencioso: status 200 y ningún error. Muchos servidores
// (Express con express.json(), Django, Flask con request.get_json()) solo
// analizan el cuerpo si el Content-Type dice JSON; si no, tu pedido llega
// vacío o como texto.
// > Desde Python: requests.post(url, json=order) hace las dos cosas a la vez
//   (stringify + cabecera); requests.post(url, data=json.dumps(order)) tiene
//   este mismo fallo.
```
