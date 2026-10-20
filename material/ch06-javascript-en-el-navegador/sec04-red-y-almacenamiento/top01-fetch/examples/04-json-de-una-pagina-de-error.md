---
example_description: "response.json() sobre la página de error HTML de un servidor (un 404 típico) lanza «SyntaxError: Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON»: el problema no es el JSON sino la respuesta. Comprobar ok y Content-Type antes de leer da un error que se entiende"
example_tags: "javascript|fetch|json|syntaxerror|content-type|404|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Esta ruta no existe en el servidor de prueba: contesta 404 con una página
// HTML, como hacen casi todos los servidores web.
const url = '/api/demo/catalogo';

// 🐛 Directo a json(): el error habla de un «<», no de un 404.
try {
  const response = await fetch(url);
  const catalog = await response.json();
  console.log('catálogo →', catalog);
} catch (error) {
  console.log('🐛', `${error.name}: ${error.message}`);
}

// ¿Qué llegó de verdad? El status y el Content-Type lo dicen.
const response = await fetch(url);
console.log('status →', response.status, '| Content-Type →', response.headers.get('content-type'));
const html = await response.text();
console.log('primeros 15 caracteres →', html.slice(0, 15));

// ✅ Comprueba ok y el tipo ANTES de leer como JSON.
async function getCatalog(path) {
  const res = await fetch(path);
  const type = res.headers.get('content-type') ?? '';
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} (llegó ${type.split(';')[0]})`);
  if (!type.includes('application/json')) throw new Error(`se esperaba JSON y llegó ${type}`);
  return res.json();
}

try {
  await getCatalog(url);
} catch (error) {
  console.log('✅', error.message);
}

// «Unexpected token '<'» casi siempre significa: «me pediste JSON y te di
// HTML». Una ruta mal escrita, una sesión caducada que redirige al login o un
// proxy con su página de error. Mira la pestaña Network de DevTools (abre la
// vista previa con ↗) antes de buscar el fallo en tu JSON.
```
