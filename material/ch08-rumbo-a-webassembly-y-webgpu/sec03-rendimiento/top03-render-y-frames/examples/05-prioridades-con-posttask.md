---
example_description: "scheduler.postTask (Chrome) encola tareas con prioridad: user-blocking antes que user-visible y esta antes que background, aunque se pidan al revés. Con un TaskController se cancela una tarea (AbortError) o se le cambia la prioridad"
example_tags: "javascript|rendimiento|scheduler|posttask|prioridades|taskcontroller|event-loop"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// scheduler es una variable global de Chrome: nunca la declares tú (lección «Frames de animación y tiempo»).
const hasPostTask = typeof globalThis.scheduler?.postTask === 'function';
console.log('scheduler.postTask disponible →', hasPostTask);

async function demo() {
  // 1. Tres tareas pedidas de la MENOS a la MÁS urgente.
  const order = [];
  await Promise.all([
    scheduler.postTask(() => order.push('background: enviar la analítica'), { priority: 'background' }),
    scheduler.postTask(() => order.push('user-visible: pintar los resultados'), { priority: 'user-visible' }),
    scheduler.postTask(() => order.push('user-blocking: responder a la tecla'), { priority: 'user-blocking' }),
  ]);
  console.log('orden de ejecución →');
  for (const step of order) console.log(`  ${step}`);

  // 2. Cancelar: la tarea de precargar la página 2 ya no hace falta (el usuario se fue).
  const prefetch = new TaskController({ priority: 'background' });
  const pending = scheduler.postTask(() => 'página 2 precargada', { signal: prefetch.signal });
  prefetch.abort();
  try {
    await pending;
  } catch (error) {
    console.log('precarga cancelada →', error.name);
  }

  // 3. Cambiar la prioridad: la imagen que acaba de entrar en pantalla pasa delante.
  const image = new TaskController({ priority: 'background' });
  const done = [];
  const tasks = [
    scheduler.postTask(() => done.push('A: comprimir el historial'), { priority: 'background' }),
    scheduler.postTask(() => done.push('B: decodificar la imagen visible'), { signal: image.signal }),
  ];
  image.setPriority('user-blocking');
  await Promise.all(tasks);
  console.log("con setPriority('user-blocking') →", done.join(' · '));
}

if (hasPostTask) {
  demo();
} else {
  console.log('Este navegador no tiene scheduler.postTask: usa setTimeout (sin prioridades) como recambio');
}

// Cada prioridad tiene su cola y el navegador saca siempre de la más urgente que tenga algo.
// background es para lo que puede esperar sin que nadie lo note (como requestIdleCallback,
// pero con fecha); user-blocking, solo para lo que el usuario está esperando ahora mismo.
```
