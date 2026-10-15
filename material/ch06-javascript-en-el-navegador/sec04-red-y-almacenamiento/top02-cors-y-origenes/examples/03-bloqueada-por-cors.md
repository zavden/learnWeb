---
example_description: "Una petición a otro origen cuyo servidor no envía Access-Control-Allow-Origin: el script solo recibe «TypeError: Failed to fetch» (el motivo está en la consola de DevTools). La petición SÍ llegó al servidor: el navegador esperó su respuesta y la escondió. El arreglo está en el servidor"
example_tags: "javascript|cors|fetch|failed-to-fetch|devtools|seguridad|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// ?cors=no hace que el servidor de prueba conteste SIN cabeceras CORS.
async function attempt(label, url) {
  const start = performance.now();
  try {
    const response = await fetch(url);
    console.log(`${label} → ${response.status} ${response.statusText}`);
  } catch (error) {
    console.log(`${label} → ${error.name}: ${error.message}`);
    console.log(`   ¿falló tras esperar la respuesta (≥ 800 ms)? → ${performance.now() - start >= 800}`);
  }
}

// Mismo origen: CORS no interviene.
await attempt('mismo origen, sin CORS', '/api/demo/echo?cors=no&delay=800');

// 🐛 Otro origen sin permiso: el script no recibe la respuesta ni sabe por qué.
await attempt('🐛 otro origen, sin CORS', 'http://127.0.0.1:3001/api/demo/echo?cors=no&delay=800');

// ✅ El mismo endpoint cuando el servidor da permiso.
await attempt('✅ otro origen, con CORS', 'http://127.0.0.1:3001/api/demo/echo?delay=800');

// La consola de LearnWeb solo ve lo que ve tu script: «Failed to fetch».
// Abre el ejemplo con ↗ y la consola de DevTools (⌥⌘I): Chrome explica allí
// «…has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header
// is present on the requested resource…».
// Fíjate en los 800 ms: el servidor RECIBIÓ la petición, la procesó y
// contestó. CORS no impide enviar; impide LEER la respuesta.
```
