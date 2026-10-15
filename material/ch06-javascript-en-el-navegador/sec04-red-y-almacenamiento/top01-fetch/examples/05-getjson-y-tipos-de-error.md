---
example_description: "Una función getJSON reutilizable que separa los tres fallos de una petición: error de red (fetch rechaza con TypeError: Failed to fetch), error HTTP (el servidor contestó 4xx/5xx; el error lleva el status y el cuerpo) y respuesta que no es JSON; quien llama decide según el tipo"
example_tags: "javascript|fetch|errores|httperror|status|red|reintentos"
example_stage: intermediate
example_importance: critical
console: true
---

# JavaScript

```javascript
// Errores propios (módulo «Clases y POO»): cada uno dice QUÉ falló.
class NetworkError extends Error {
  name = 'NetworkError';
}
class HttpError extends Error {
  name = 'HttpError';
  constructor(response, body) {
    super(`HTTP ${response.status} ${response.statusText}`);
    this.status = response.status; // para decidir: ¿reintento? ¿pido login?
    this.body = body;              // el servidor suele explicar el error aquí
  }
}

async function getJSON(url, options = {}) {
  let response;
  try {
    response = await fetch(url, { ...options, headers: { Accept: 'application/json', ...options.headers } });
  } catch (error) {
    // Una cancelación no es un fallo de red: que siga tal cual (ejemplo 9).
    if (error.name === 'AbortError' || error.name === 'TimeoutError') throw error;
    throw new NetworkError(`no se pudo conectar con ${url}`, { cause: error });
  }
  const type = response.headers.get('content-type') ?? '';
  const body = type.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) throw new HttpError(response, body);
  if (typeof body === 'string') throw new TypeError(`se esperaba JSON y llegó ${type}`);
  return body;
}

// Quien llama decide qué hacer según el TIPO de error.
async function show(label, url) {
  try {
    const data = await getJSON(url);
    console.log(`✅ ${label} →`, Array.isArray(data) ? `${data.length} productos` : data.method);
  } catch (error) {
    if (error instanceof HttpError && error.status >= 500) {
      console.log(`⏳ ${label} → ${error.message}: falla el servidor, reintentar más tarde`);
    } else if (error instanceof HttpError) {
      console.log(`⛔ ${label} → ${error.message}: reintentar no sirve (pedido ${error.body?.query?.pedido})`);
    } else if (error instanceof NetworkError) {
      console.log(`📡 ${label} → ${error.name}: ${error.message} (causa: ${error.cause.message})`);
    } else {
      console.log(`❓ ${label} → ${error.name}: ${error.message}`);
    }
  }
}

await show('catálogo', 'products.json');
await show('pedido inexistente', '/api/demo/echo?status=404&pedido=P-9999');
await show('informe de ventas', '/api/demo/echo?status=503');
await show('sin servidor', 'http://localhost:59999/');
await show('texto plano', '/api/demo/stream?chunks=1');

// Un error de red no dice POR QUÉ falló (servidor apagado, sin Wi-Fi, CORS…):
// el navegador solo entrega «Failed to fetch». El motivo está en DevTools.
```
