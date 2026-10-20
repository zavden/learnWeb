---
example_description: "En una respuesta de otro origen, headers.get() devuelve null para cualquier cabecera que no esté en la lista segura (Content-Type, Content-Length, Cache-Control…) aunque el servidor la haya enviado; el servidor tiene que exponerla con Access-Control-Expose-Headers"
example_tags: "javascript|cors|cabeceras|access-control-expose-headers|headers|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// El servidor de prueba envía en TODAS sus respuestas X-Demo-Server: LearnWeb.
const own = await fetch('/api/demo/echo');
console.log('mismo origen → X-Demo-Server:', own.headers.get('x-demo-server'));

// 🐛 Otro origen con permiso CORS (*): la cabecera viaja, pero el script no la ve.
const cross = await fetch('http://127.0.0.1:3001/api/demo/echo');
console.log('🐛 otro origen → X-Demo-Server:', cross.headers.get('x-demo-server'));
console.log('   has(\'x-demo-server\') →', cross.headers.has('x-demo-server'));
console.log('   cabeceras que sí ves →', [...cross.headers.keys()]);

// ✅ El servidor la expone: Access-Control-Expose-Headers: X-Demo-Server
//    (aquí, con ?expose=1).
const exposed = await fetch('http://127.0.0.1:3001/api/demo/echo?expose=1');
console.log('✅ expuesta → X-Demo-Server:', exposed.headers.get('x-demo-server'));

// Por defecto, una respuesta CORS solo deja leer las cabeceras «seguras»:
// Cache-Control, Content-Language, Content-Length, Content-Type, Expires,
// Last-Modified y Pragma. Las demás (X-Total-Count de una API paginada,
// ETag, Link, Retry-After…) leen null hasta que el servidor las expone.
// En DevTools → Network sí las verás: el navegador las recibe, no las comparte.
```
