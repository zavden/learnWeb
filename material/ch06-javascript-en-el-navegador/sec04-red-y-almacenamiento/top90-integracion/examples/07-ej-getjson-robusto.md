---
example_description: "Ejercicio: una función getJSON que confía en todo (no mira el status, ni el Content-Type, ni pone plazo). Complétala para que rechace con HttpError en los 4xx/5xx, con TypeError si la respuesta no es JSON y con TimeoutError si el servidor tarda. Las comprobaciones llaman al servidor de prueba"
example_tags: "javascript|fetch|ejercicio|httperror|content-type|abortsignal|timeout"
exercise: true
exercise_title: "Un getJSON que no se fía"
exercise_instructions: "getJSON hace fetch y devuelve response.json() sin comprobar nada: un 404 o un 503 pasan como si fueran datos, una página HTML de error acaba en un SyntaxError incomprensible y un servidor lento la deja esperando sin límite || Añade un plazo: pasa a fetch la señal AbortSignal.timeout(timeoutMs) || Si response.ok es false, lanza new HttpError(response) (ya está escrita y guarda el status) || Si el Content-Type no incluye application/json, lanza un TypeError con un mensaje que diga qué llegó, sin llamar a json() || Ejecuta hasta que las cinco comprobaciones salgan ✓"
exercise_hints: "El orden importa: primero ok (una página de error HTML es un 404, no un problema de formato), después el Content-Type || response.headers.get('content-type') puede ser null: usa ?. o ?? '' antes de includes || Con AbortSignal.timeout, fetch rechaza por sí solo con un DOMException llamado TimeoutError: no hace falta capturarlo"
exercise_solution_example: 07-ej-getjson-robusto-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
class HttpError extends Error {
  name = 'HttpError';
  constructor(response) {
    super(`HTTP ${response.status} ${response.statusText}`);
    this.status = response.status;
  }
}

async function getJSON(url, { timeoutMs = 500 } = {}) {
  // TODO 1: un plazo para la petición entera (AbortSignal.timeout(timeoutMs))
  const response = await fetch(url);
  // TODO 2: si la respuesta no es ok, lanza new HttpError(response)
  // TODO 3: si el Content-Type no es JSON, lanza un TypeError (sin llamar a json())
  return response.json();
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
// Llaman al servidor de prueba de LearnWeb: ?status= fija el código y
// ?delay= el retraso; cualquier otra ruta de /api/demo/ es una página HTML 404.
async function check(description, compute, expected) {
  let actual;
  try {
    actual = await compute();
  } catch (error) {
    actual = `excepción sin capturar: ${error.name}`;
  }
  if (Object.is(actual, expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
async function outcome(url, options) {
  try {
    await getJSON(url, options);
    return 'se cumplió';
  } catch (error) {
    return error.status ? `${error.name} ${error.status}` : error.name;
  }
}

await check('un 404 rechaza con HttpError 404', () => outcome('/api/demo/echo?status=404'), 'HttpError 404');
await check('un 503 rechaza con HttpError 503', () => outcome('/api/demo/echo?status=503'), 'HttpError 503');
await check('la página HTML de un 404 da HttpError, no SyntaxError', () => outcome('/api/demo/catalogo'), 'HttpError 404');
await check('un 200 en texto plano rechaza con TypeError', () => outcome('/api/demo/stream?chunks=1&size=64'), 'TypeError');
await check('un servidor lento (1,5 s) rechaza con TimeoutError a los 300 ms', async () => {
  const start = performance.now();
  const result = await outcome('/api/demo/echo?delay=1500', { timeoutMs: 300 });
  return `${result}${performance.now() - start < 1000 ? ' a tiempo' : ' tarde'}`;
}, 'TimeoutError a tiempo');
```
