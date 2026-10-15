---
example_description: "Solución: getJSON con plazo (AbortSignal.timeout), HttpError en los 4xx/5xx comprobado antes que el formato, y TypeError si el Content-Type no es JSON, sin llamar a json()"
example_tags: "javascript|fetch|solucion|httperror|content-type|abortsignal|timeout"
example_stage: final-solution
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
  // ✅ 1. El plazo cubre la petición entera, también la lectura del cuerpo.
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  // ✅ 2. Primero el status: una página de error HTML es un 404, no un problema de formato.
  if (!response.ok) throw new HttpError(response);
  // ✅ 3. Después el formato, sin intentar analizar lo que no es JSON.
  const type = response.headers.get('content-type') ?? '';
  if (!type.includes('application/json')) throw new TypeError(`se esperaba JSON y llegó ${type || 'una respuesta sin tipo'}`);
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
