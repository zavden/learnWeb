---
example_description: "AbortSignal.timeout(ms) crea una señal que se cancela sola con un TimeoutError; AbortSignal.any([...]) combina varias (el botón «Cancelar» del usuario y un plazo) y se cancela con la primera; el nombre del motivo dice qué pasó"
example_tags: "javascript|python|abortsignal|timeout|any|cancelar"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
function wait(ms, { signal } = {}) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const timerId = setTimeout(resolve, ms);
    // addEventListener: capítulo 6.
    signal?.addEventListener('abort', () => {
      clearTimeout(timerId);
      reject(signal.reason);
    }, { once: true });
  });
}

// Generar el PDF de un informe tarda `ms`. Se puede cancelar por dos motivos:
// el usuario pulsa «Cancelar», o se agota el plazo de 100 ms.
function generateReport(label, ms, cancelAfterMs) {
  const userCancel = new AbortController();
  if (cancelAfterMs !== undefined) setTimeout(() => userCancel.abort(), cancelAfterMs);

  // La señal combinada se cancela en cuanto se cancele CUALQUIERA de las dos,
  // y su motivo (reason) es el de la que se canceló primero.
  const signal = AbortSignal.any([userCancel.signal, AbortSignal.timeout(100)]);

  return wait(ms, { signal })
    .then(() => console.log(`${label} → ✅ informe listo`))
    .catch((error) => {
      if (error.name === 'TimeoutError') console.log(`${label} → ⏰ plazo agotado`);
      else if (error.name === 'AbortError') console.log(`${label} → 🛑 cancelado por el usuario`);
      else throw error; // cualquier otro error no es nuestro: que siga
    });
}

generateReport('informe corto (40 ms)', 40)
  .then(() => generateReport('informe largo (250 ms)', 250))
  .then(() => generateReport('el usuario cancela a los 30 ms', 250, 30));

// AbortSignal.timeout (Chrome 103) y AbortSignal.any (Chrome 116) ahorran
// el código de crear un controlador y un setTimeout a mano.
// Los motivos son DOMException: name «TimeoutError» o «AbortError». Compara
// por name; el texto de message cambia de un navegador a otro.
// > Desde Python: async with asyncio.timeout(0.1): … cancela lo que haya
//   dentro al vencer el plazo, como AbortSignal.timeout; y TimeoutError
//   también se llama así en Python.
```
