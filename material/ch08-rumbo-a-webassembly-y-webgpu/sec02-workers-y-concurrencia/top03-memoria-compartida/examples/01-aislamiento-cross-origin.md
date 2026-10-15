---
example_description: "¿Está la página aislada de otros orígenes? crossOriginIsolated es false en la vista previa del curso: no existe el constructor SharedArrayBuffer, performance.now() avanza a saltos de 0,1 ms y la respuesta de la página no trae las cabeceras COOP ni COEP"
example_tags: "javascript|sharedarraybuffer|crossoriginisolated|coop|coep|seguridad|spectre"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// ¿Está esta página «aislada de otros orígenes» (cross-origin isolated)?
console.log('crossOriginIsolated →', crossOriginIsolated);
// Sin aislamiento, el constructor SharedArrayBuffer ni siquiera existe como global.
console.log('typeof SharedArrayBuffer →', typeof SharedArrayBuffer);

// El reloj también lo delata: sin aislamiento, performance.now() avanza a saltos de
// una décima de milisegundo. Este bucle (unos 2 ms) mide 20 saltos seguidos.
const jumps = [];
let last = performance.now();
while (jumps.length < 20) {
  const now = performance.now();
  if (now !== last) {
    jumps.push(now - last);
    last = now;
  }
}
console.log('salto más pequeño de performance.now() →', Math.min(...jumps).toFixed(3), 'ms');

// El aislamiento lo piden dos cabeceras de la RESPUESTA de la página. Las de esta:
try {
  const response = await fetch(location.href); // la propia página (mismo origen)
  for (const header of ['cross-origin-opener-policy', 'cross-origin-embedder-policy']) {
    console.log(`${header} →`, response.headers.get(header));
  }
} catch {
  console.log('(esta copia es un iframe aislado, origen null: ábrela con ▶ o en el editor)');
}
```
