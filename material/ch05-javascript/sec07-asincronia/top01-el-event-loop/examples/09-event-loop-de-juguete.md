---
example_description: "Un event loop de juguete con reloj simulado: una tarea entera, todas las microtareas, rAF cada 16 ms y temporizadores que pasan a la cola al vencer; el mismo esqueleto que el planificador cooperativo del módulo 6 y que el bucle de asyncio"
example_tags: "javascript|python|event-loop|asyncio|simulacion|microtareas|tareas"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// EL ALGORITMO DEL EVENT LOOP, en pequeño y con un reloj SIMULADO (no espera
// de verdad: el reloj salta al siguiente evento). No sustituye al real; sirve
// para verlo por dentro.
class ToyEventLoop {
  #now = 0;
  #seq = 0;
  #lastFrame = 0;   // un frame cada 16 ms simulados (≈ 60 Hz)
  #tasks = [];      // cola de tareas
  #microtasks = []; // cola de microtareas
  #timers = [];     // { at, seq, callback }: aún no han vencido
  #frameCallbacks = [];

  setTimeout(callback, ms = 0) {
    this.#timers.push({ at: this.#now + ms, seq: this.#seq++, callback });
  }
  queueMicrotask(callback) {
    this.#microtasks.push(callback);
  }
  requestAnimationFrame(callback) {
    this.#frameCallbacks.push(callback);
  }
  log(text) {
    console.log(`[t=${String(this.#now).padStart(2)} ms] ${text}`);
  }

  #drainMicrotasks() {
    while (this.#microtasks.length > 0) this.#microtasks.shift()(); // TODAS, también las nuevas
  }

  run(script) {
    this.#tasks.push(script);
    while (this.#tasks.length > 0 || this.#timers.length > 0 || this.#frameCallbacks.length > 0) {
      const frameDue = this.#now % 16 === 0 && this.#now > this.#lastFrame;
      if (this.#tasks.length > 0) {
        this.#tasks.shift()();   // 1. UNA tarea, entera
        this.#drainMicrotasks(); // 2. TODAS las microtareas
      } else if (frameDue && this.#frameCallbacks.length > 0) {
        this.#lastFrame = this.#now; // 3. toca frame: los rAF…
        for (const callback of this.#frameCallbacks.splice(0)) callback(this.#now);
        this.#drainMicrotasks();
        this.log('🎨 estilos, layout y pintado'); // …y pintar
      } else {
        this.#now += 1; // 4. nada listo: pasa un milisegundo
      }
      // Los temporizadores vencidos pasan a la cola de tareas, por hora y llegada.
      const due = this.#timers.filter((timer) => timer.at <= this.#now).sort((a, b) => a.at - b.at || a.seq - b.seq);
      this.#timers = this.#timers.filter((timer) => timer.at > this.#now);
      this.#tasks.push(...due.map((timer) => timer.callback));
    }
  }
}

// El programa: un pago con microtareas, un rAF y dos temporizadores.
const loop = new ToyEventLoop();
loop.run(() => {
  loop.log('1. script: cobro el pedido P-3310');
  loop.setTimeout(() => loop.log('5. tarea: setTimeout 0 → email de confirmación'), 0);
  loop.setTimeout(() => loop.log('7. tarea: setTimeout 20 → aviso al almacén'), 20);
  loop.requestAnimationFrame((time) => loop.log(`6. rAF (frame de t=${time}) → muevo la barra de progreso`));
  loop.queueMicrotask(() => {
    loop.log('3. microtarea → marco el pedido como pagado');
    loop.queueMicrotask(() => loop.log('4. microtarea anidada → actualizo el carrito'));
  });
  loop.log('2. script: fin');
});

// Compáralo con el CoopScheduler del módulo 6 (top95, «planificador
// cooperativo»): una cola de tareas listas, temporizadores ordenados por hora y
// un reloj que salta cuando nadie está listo. El event loop del navegador es
// ese mismo esqueleto, más dos cosas: la cola de microtareas, que tiene
// prioridad, y los pasos de renderizado.
// > Desde Python: el bucle de asyncio también es esto: loop.call_soon (cola de
//   listos), loop.call_later (temporizadores) y el selector de E/S. No tiene
//   microtareas con prioridad: los callbacks de un Future van a la misma cola
//   FIFO que call_soon (lo verás en la teoría).
```
