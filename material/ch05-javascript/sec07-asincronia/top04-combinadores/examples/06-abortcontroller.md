---
example_description: "AbortController y AbortSignal: el controlador cancela (abort con un motivo), la señal se reparte a las operaciones, que miran signal.aborted, escuchan el evento abort o llaman a throwIfAborted(); una subida de archivo por partes que el usuario cancela"
example_tags: "javascript|abortcontroller|abortsignal|cancelar|promesas"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// wait(ms, { signal }): un wait que se puede cancelar.
function wait(ms, { signal } = {}) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted(); // ¿ya cancelada? → lanza signal.reason
    const timerId = setTimeout(resolve, ms);
    // addEventListener se estudia en el capítulo 6; aquí: «al cancelar, haz esto».
    signal?.addEventListener('abort', () => {
      clearTimeout(timerId);
      reject(signal.reason);
    }, { once: true });
  });
}

// Subir factura.pdf en 5 partes de 40 ms. Entre parte y parte, mira la señal.
function uploadFile(name, { signal }) {
  let part = 0;
  const nextPart = () => wait(40, { signal }).then(() => {
    part += 1;
    console.log(`  ⬆️ ${name}: parte ${part} de 5`);
    return part < 5 ? nextPart() : `${name} subido`;
  });
  return nextPart();
}

// El CONTROLADOR cancela; la SEÑAL (controller.signal) se reparte. Quien
// recibe solo la señal puede enterarse de la cancelación, pero no provocarla.
const controller = new AbortController();
console.log('¿cancelada al empezar? →', controller.signal.aborted);

uploadFile('factura.pdf', { signal: controller.signal })
  .then((message) => console.log('✅', message))
  .catch((error) => {
    console.log('⛔ subida detenida →', error.message);
    console.log('   ¿cancelada? →', controller.signal.aborted, '| ¿el motivo es el error? →', controller.signal.reason === error);
  })
  .then(() => {
    // Un abort() sin motivo usa un DOMException llamado AbortError.
    const silent = new AbortController();
    silent.abort();
    console.log('abort() sin motivo →', silent.signal.reason.name);
    // Una señal cancelada lo está para siempre: hace falta un controlador nuevo.
    return wait(10, { signal: silent.signal });
  })
  .catch((error) => console.log('wait con una señal ya cancelada → ni empieza:', error.name));

// 140 ms después, el usuario pulsa «Cancelar» (a mitad de la parte 4).
setTimeout(() => controller.abort(new Error('el usuario canceló la subida')), 140);

// AbortController es la forma estándar de cancelar en la web: fetch,
// addEventListener y muchas APIs aceptan { signal } (capítulo 6).
// > Desde Python: se parece a task.cancel() + CancelledError, pero al revés:
//   en asyncio cancelas la TAREA desde fuera; aquí, cada operación recibe la
//   señal y decide cómo parar.
```
