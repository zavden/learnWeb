---
example_description: "La misma petición al mismo servidor, desde el mismo origen (localhost:3001) y desde otro (127.0.0.1:3001): las dos funcionan porque el servidor responde con Access-Control-Allow-Origin: *, pero response.type cambia de 'basic' a 'cors'"
example_tags: "javascript|cors|origen|fetch|response-type|access-control-allow-origin"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// La vista previa del editor vive en http://localhost:3001. El servidor de
// prueba contesta en ese mismo origen… y también en http://127.0.0.1:3001,
// que para el navegador es OTRO origen (ejemplo anterior).
const sameOrigin = await fetch('/api/demo/echo?pedido=P-1001');
const sameEcho = await sameOrigin.json();
console.log('mismo origen →', sameOrigin.status, '| type:', sameOrigin.type, '| pedido:', sameEcho.query.pedido);

const crossOrigin = await fetch('http://127.0.0.1:3001/api/demo/echo?pedido=P-1001');
const crossEcho = await crossOrigin.json();
console.log('otro origen →', crossOrigin.status, '| type:', crossOrigin.type, '| pedido:', crossEcho.query.pedido);

// Las dos funcionan porque este servidor añade a cada respuesta
//   Access-Control-Allow-Origin: *
// («cualquier origen puede leer esto»). La petición a otro origen lleva la
// cabecera Origin: http://localhost:3001, el servidor contesta con su permiso
// y el navegador comprueba que encaja ANTES de darle la respuesta al script.
//
// response.type lo dice: 'basic' = mismo origen (lo ves todo); 'cors' = otro
// origen con permiso (ves el cuerpo y solo algunas cabeceras, ejemplo 6).
// En una tarjeta de la teoría (origen null) las dos son de otro origen.
```
