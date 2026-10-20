---
example_description: "fetch(url, { signal }) se cancela con la señal de un AbortController (AbortError), con un plazo AbortSignal.timeout(ms) (TimeoutError) o con las dos a la vez con AbortSignal.any; la señal también corta la lectura del cuerpo"
example_tags: "javascript|fetch|abortcontroller|abortsignal|timeout|cancelar"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// ?delay=ms le pide al servidor de prueba que tarde en contestar.

// 1. El usuario cancela: AbortController (módulo «Asincronía y event loop»).
const controller = new AbortController();
setTimeout(() => controller.abort(), 100); // «Cancelar» a los 100 ms
try {
  await fetch('/api/demo/echo?delay=2000', { signal: controller.signal });
} catch (error) {
  console.log('1. cancelada →', `${error.name}: ${error.message}`);
}

// 2. Un plazo: AbortSignal.timeout(ms) se cancela sola.
try {
  await fetch('/api/demo/echo?delay=2000', { signal: AbortSignal.timeout(150) });
} catch (error) {
  console.log('2. plazo →', `${error.name}: ${error.message}`);
}

// 3. Las dos a la vez: AbortSignal.any se cancela con la PRIMERA señal.
async function loadReport(delayMs, userCancelsAfterMs) {
  const user = new AbortController();
  if (userCancelsAfterMs) setTimeout(() => user.abort(), userCancelsAfterMs);
  const signal = AbortSignal.any([user.signal, AbortSignal.timeout(300)]);
  try {
    const response = await fetch(`/api/demo/echo?delay=${delayMs}`, { signal });
    return `✅ ${response.status} ${response.statusText}`;
  } catch (error) {
    if (error.name === 'TimeoutError') return '⏰ plazo de 300 ms agotado';
    if (error.name === 'AbortError') return '🛑 cancelado por el usuario';
    throw error; // un error de red sigue su camino
  }
}
console.log('3. informe rápido (50 ms) →', await loadReport(50));
console.log('   informe lento (1000 ms) →', await loadReport(1000));
console.log('   el usuario cancela a los 100 ms →', await loadReport(1000, 100));

// 4. La señal vale hasta el final del CUERPO: cancelar a mitad de la descarga
//    corta también text(). (10 trozos, uno cada 100 ms.)
const download = new AbortController();
const response = await fetch('/api/demo/stream?chunks=10&interval=100&size=64', { signal: download.signal });
setTimeout(() => download.abort(), 250);
try {
  await response.text();
} catch (error) {
  console.log('4. status', response.status, 'pero el cuerpo →', error.name);
}

// Cancelar no es solo dejar de esperar: el navegador cierra la conexión y el
// servidor deja de trabajar (este servidor de prueba cancela su respuesta).
// Compara los motivos por name; el message cambia entre navegadores.
```
