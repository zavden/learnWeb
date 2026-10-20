---
example_description: "mode: 'no-cors' no arregla un error de CORS: la promesa se cumple, pero con una respuesta opaca (type 'opaque', status 0, sin cabeceras y con el cuerpo vacío), así que json() falla. El arreglo es que el servidor dé permiso"
example_tags: "javascript|cors|no-cors|opaque|fetch|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// El servidor de 127.0.0.1 no envía cabeceras CORS (?cors=no). El mensaje de
// DevTools sugiere: «If an opaque response serves your needs, set the
// request's mode to 'no-cors'…». Parece la solución. No lo es.
const url = 'http://127.0.0.1:3001/api/demo/echo?cors=no&pedido=P-1001';

// 🐛 La promesa ya no se rechaza…
const response = await fetch(url, { mode: 'no-cors' });
console.log('🐛 ¿se rechazó? → no | type:', response.type);
console.log('🐛 status →', response.status, '| ok →', response.ok);
console.log('🐛 cabeceras visibles →', [...response.headers].length);

// …pero la respuesta es OPACA: el navegador la tiene y no te deja verla.
const text = await response.text();
console.log('🐛 cuerpo →', JSON.stringify(text));
try {
  await (await fetch(url, { mode: 'no-cors' })).json();
} catch (error) {
  console.log('🐛 json() →', `${error.name}: ${error.message}`);
}

// ✅ El único arreglo está en el servidor: que envíe Access-Control-Allow-Origin
// (aquí, quitar ?cors=no). Si el servidor no es tuyo, pide los datos desde TU
// servidor (un «proxy»): entre servidores no hay CORS.
const fixed = await fetch('http://127.0.0.1:3001/api/demo/echo?pedido=P-1001');
console.log('✅ con permiso → type:', fixed.type, '| pedido:', (await fixed.json()).query.pedido);

// ¿Para qué sirve no-cors? Para peticiones que no necesitas leer (un aviso de
// analítica) y para que un service worker guarde en caché imágenes ajenas.
```
