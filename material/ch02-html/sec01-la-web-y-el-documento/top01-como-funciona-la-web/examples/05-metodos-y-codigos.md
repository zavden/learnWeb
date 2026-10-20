---
example_description: "Métodos GET y HEAD y códigos de estado 200 y 404"
example_tags: "http|metodos|status|404"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Tres peticiones al mismo servidor: mira el método y el código de estado de cada una.

// GET: «dame el recurso». 200 = OK.
const found = await fetch('data.json');
console.log('GET  data.json    →', found.status, found.statusText);

// GET de algo que no existe: 404 = Not Found. El servidor RESPONDE igualmente
// (con un cuerpo de error); fetch no lanza ninguna excepción por un 404.
// La consola de DevTools del navegador, en cambio, marca la petición en rojo.
const missing = await fetch('missing.json');
console.log('GET  missing.json →', missing.status, missing.statusText, '| ok:', missing.ok);

// HEAD: «dame solo las cabeceras». Mismo status y mismas cabeceras, cuerpo vacío.
const head = await fetch('data.json', { method: 'HEAD' });
const headBody = await head.text();
console.log('HEAD data.json    →', head.status, '| Content-Length anunciado:',
  head.headers.get('content-length'), '| bytes recibidos:', headBody.length);
```
