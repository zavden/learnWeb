---
example_description: "Ejercicio: <order-timer> arranca un setInterval y escucha kitchen:pause en document cada vez que se conecta, y nunca los quita: al despachar la comanda sigue contando, y al volver a la página escucha dos veces. Límpialo en disconnectedCallback con un AbortController; las comprobaciones esperan unos milisegundos y cuentan"
example_tags: "javascript|web-components|disconnectedcallback|abortcontroller|setinterval|fugas|ejercicio"
exercise: true
exercise_title: "Un temporizador que se limpia al salir"
exercise_instructions: "<order-timer> cuenta los segundos de una comanda y las pausas de cocina (evento kitchen:pause en document) || Hoy, connectedCallback crea un setInterval y un listener que nadie quita: el elemento quitado sigue trabajando, y si vuelve a la página, escucha dos veces || Crea en connectedCallback un AbortController guardado en un campo privado; pasa su signal al addEventListener || Haz que el abort también pare el intervalo: signal.addEventListener('abort', () => clearInterval(id)) || Escribe disconnectedCallback() y llama ahí a abort() || Ejecuta hasta que las cuatro comprobaciones salgan ✓ (tardan medio segundo)"
exercise_hints: "#controller = null; como campo privado de la clase || document.addEventListener('kitchen:pause', fn, { signal: this.#controller.signal }) || Un AbortController sirve una sola vez: crea uno nuevo en cada connectedCallback"
exercise_solution_example: 10-ej-limpiar-al-desconectar-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Comanda de la mesa 2</h1>
  <p>Pozole rojo · <order-timer tick="1000"></order-timer></p>
  <p class="actions">
    <button id="pause" type="button">Pausar cocina</button>
    <button id="dispatch" type="button">Despachar comanda</button>
  </p>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin: 0 0 0.5rem;
}
order-timer {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}
.actions {
  display: flex;
  gap: 0.5rem;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
class OrderTimer extends HTMLElement {
  ticks = 0;
  pauses = 0;
  // TODO: un campo privado para el AbortController

  connectedCallback() {
    const every = Number(this.getAttribute('tick') ?? 1000);
    // TODO: crea un AbortController; que su abort pare este intervalo…
    setInterval(() => {
      this.ticks += 1;
      this.render();
    }, every);
    // …y quite este listener (opción signal)
    document.addEventListener('kitchen:pause', () => {
      this.pauses += 1;
      this.render();
    });
    this.render();
  }

  // TODO: disconnectedCallback() { … abort() … }

  render() {
    this.textContent = `⏱ ${this.ticks} s · ${this.pauses} pausa(s)`;
  }
}
customElements.define('order-timer', OrderTimer);

document.querySelector('#pause').addEventListener('click', () => {
  document.dispatchEvent(new CustomEvent('kitchen:pause'));
});
document.querySelector('#dispatch').addEventListener('click', (event) => {
  document.querySelector('order-timer')?.remove();
  event.currentTarget.disabled = true;
});

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
// Usan su propio temporizador, que avanza cada 40 ms, y esperan un poco.
function check(description, actual, expected) {
  if (Object.is(actual, expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pauseKitchen = () => document.dispatchEvent(new CustomEvent('kitchen:pause'));
// Apuntamos los intervalos que se crean durante las comprobaciones para
// pararlos al final, también si el componente no los para.
const checkIntervals = [];
const realSetInterval = window.setInterval;
window.setInterval = (...args) => {
  const id = realSetInterval(...args);
  checkIntervals.push(id);
  return id;
};
const timer = document.createElement('order-timer');
timer.setAttribute('tick', '40');
document.querySelector('main').append(timer);

await wait(150);
check('en la página, cuenta (al menos 2 tics en 150 ms)', timer.ticks >= 2, true);
timer.remove();
const ticksAtRemoval = timer.ticks;
await wait(150);
check('fuera de la página, el intervalo se ha parado', timer.ticks, ticksAtRemoval);
const pausesAtRemoval = timer.pauses;
pauseKitchen();
check('fuera de la página, ya no escucha kitchen:pause', timer.pauses, pausesAtRemoval);
document.querySelector('main').append(timer);
pauseKitchen();
check('de vuelta en la página, cada pausa cuenta una sola vez', timer.pauses, pausesAtRemoval + 1);
timer.remove();
window.setInterval = realSetInterval;
checkIntervals.forEach((id) => clearInterval(id));
const pageTimer = document.querySelector('order-timer'); // el de la mesa 2 también oyó las pausas
pageTimer.pauses = 0;
pageTimer.render();
```
