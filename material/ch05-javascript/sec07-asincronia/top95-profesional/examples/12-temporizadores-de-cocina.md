---
example_description: "Un tablero de temporizadores de cocina que no deriva: cada cuenta atrás se calcula con una hora límite, un solo setTimeout despierta al tablero justo cuando algún número cambia (el más próximo de todos los relojes), y el reloj de pared se alinea con el cambio de segundo; todo se detiene solo al terminar"
example_tags: "javascript|profesional|settimeout|deriva|intl|temporizadores|interfaz"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="kitchen">
  <header>
    <h1>Cocina de la fonda</h1>
    <p class="clock">Hora en Ciudad de México: <time id="wall-clock">--:--:--</time></p>
    <p class="note">Cámara rápida: cada segundo de los tickets dura 100 ms.</p>
  </header>
  <ul id="tickets" class="tickets"></ul>
  <p id="announcer" class="announcer" role="status"></p>
  <button id="restart" type="button">Repetir</button>
</main>
```

# CSS

```css
:root {
  --text: #1f2933;
  --muted: #52606d;
  --page: #f5f7fa;
  --surface: #ffffff;
  --border: #c3cad3;
  --accent: #1d4ed8;
  --ok: #166534;
  --ok-bg: #dcfce7;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--page);
}
.kitchen {
  max-width: 36rem;
  margin: 0 auto;
  padding: 1.25rem 1rem 2rem;
}
h1 {
  font-size: 1.3rem;
  margin: 0;
}
.clock,
.note,
.announcer {
  color: var(--muted);
  margin: 0.25rem 0;
}
.tickets {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 0.75rem;
}
.ticket {
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
}
.ticket .dish {
  display: block;
  font-weight: 600;
}
.ticket .remaining {
  font-size: 1.8rem;
  font-variant-numeric: tabular-nums;
}
.ticket.done {
  border-color: var(--ok);
  background: var(--ok-bg);
  color: var(--ok);
}
button {
  font: inherit;
  padding: 0.35rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// TEMPORIZADORES DE COCINA QUE NO SE DESAJUSTAN.
//
// Decisiones:
// - Cada temporizador guarda su HORA LÍMITE; lo que queda se calcula con el
//   reloj en cada repintado (lección «Callbacks y temporizadores»).
// - Un solo setTimeout para todo el tablero: se programa para el momento en
//   que cambie el PRIMER número visible de cualquier reloj (+1 ms, para caer
//   después de la frontera). Nada de un setInterval por reloj.
// - El reloj de pared se alinea con el cambio de segundo de Date.now(), y se
//   formatea con Intl en la zona America/Mexico_City (siempre la misma).
// - Cuando no queda ningún ticket, el tablero se detiene: ningún temporizador
//   sigue vivo en segundo plano.
// - Cámara rápida: un «segundo» de los tickets dura 100 ms (SCALE).
// - Los tickets de una misma tanda comparten la hora de salida: sus números
//   cambian en el mismo instante y el tablero despierta una sola vez.
// - Interfaz con createElement y textContent (capítulo 6); los cambios
//   importantes se anuncian en un role="status".
//
// Alcance: módulos 1-7 (+ un mínimo de DOM, capítulo 6).

const SCALE = 100; // ms reales por «segundo» de ticket
const timeFormat = new Intl.DateTimeFormat('es-MX', {
  timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});
const mmss = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

class Countdown {
  constructor({ label, seconds, startAt, element, onDone }) {
    Object.assign(this, { label, element, onDone });
    this.deadline = startAt + seconds * SCALE;
    this.shown = [];
    this.finished = false;
  }
  remaining() {
    return Math.max(0, Math.ceil((this.deadline - performance.now()) / SCALE));
  }
  msUntilNextChange() {
    const msLeft = this.deadline - performance.now();
    return msLeft - (this.remaining() - 1) * SCALE;
  }
  render() {
    const remaining = this.remaining();
    if (this.shown.at(-1) !== remaining) this.shown.push(remaining);
    this.element.textContent = mmss(remaining);
    if (remaining === 0 && !this.finished) {
      this.finished = true;
      this.lateBy = performance.now() - this.deadline;
      this.onDone(this);
    }
  }
}

class WallClock {
  finished = false;
  constructor(element) {
    this.element = element;
  }
  msUntilNextChange() {
    return 1000 - (Date.now() % 1000);
  }
  render() {
    this.element.textContent = timeFormat.format(Date.now());
  }
}

// Un solo temporizador para todos los relojes del tablero.
class Board {
  #clocks = new Set();
  #timerId = null;
  wakeUps = 0;
  constructor({ onIdle }) {
    this.onIdle = onIdle;
  }
  add(clock) {
    this.#clocks.add(clock);
    clock.render();
    this.#schedule();
  }
  stop() {
    clearTimeout(this.#timerId);
    this.#timerId = null;
    this.#clocks.clear();
  }
  #schedule() {
    clearTimeout(this.#timerId);
    const delays = [...this.#clocks].map((clock) => clock.msUntilNextChange());
    this.#timerId = setTimeout(this.#tick, Math.max(0, Math.min(...delays)) + 1);
  }
  #tick = () => {
    this.wakeUps += 1;
    for (const clock of this.#clocks) {
      clock.render();
      if (clock.finished) this.#clocks.delete(clock);
    }
    const ticketsLeft = [...this.#clocks].some((clock) => clock instanceof Countdown);
    if (ticketsLeft) this.#schedule();
    else {
      this.stop(); // sin tickets, el reloj de pared también se para
      this.onIdle();
    }
  };
}

// ── La interfaz ──────────────────────────────────────────────────────────
const list = document.querySelector('#tickets');
const announcer = document.querySelector('#announcer');
const wallClockElement = document.querySelector('#wall-clock');
const restartButton = document.querySelector('#restart');

function createTicketElement(label) {
  const item = document.createElement('li');
  item.className = 'ticket';
  const dish = document.createElement('span');
  dish.className = 'dish';
  dish.textContent = label;
  const remaining = document.createElement('span');
  remaining.className = 'remaining';
  remaining.setAttribute('role', 'timer');
  remaining.setAttribute('aria-label', `Tiempo restante de ${label}`);
  item.append(dish, remaining);
  list.append(item);
  return { item, remaining };
}

function start() {
  restartButton.disabled = true;
  list.replaceChildren();
  const finished = [];
  const tickets = [];
  const board = new Board({
    onIdle: () => {
      restartButton.disabled = false;
      announcer.textContent = 'Todos los platos listos. El tablero se detuvo.';
      console.log('orden en que terminaron →', finished.join(', '));
      console.log('ninguno terminó antes de su hora →', tickets.every((ticket) => ticket.lateBy >= 0));
      console.log('ninguno terminó más de 50 ms tarde →', tickets.every((ticket) => ticket.lateBy < 50));
      console.log('los números nunca subieron →', tickets.every((ticket) => ticket.shown.every((value, i) => i === 0 || value < ticket.shown[i - 1])));
      console.log('despertares del tablero ≤ 25 (y no 3 relojes × 20 ticks) →', board.wakeUps <= 25);
    },
  });
  board.add(new WallClock(wallClockElement));
  const startAt = performance.now(); // la misma salida para todos: sus números cambian a la vez
  for (const [label, seconds] of [['Mesa 4 · enchiladas', 12], ['Mesa 7 · pozole', 20], ['Para llevar · tamales', 7]]) {
    const { item, remaining } = createTicketElement(label);
    const ticket = new Countdown({
      label, seconds, startAt, element: remaining,
      onDone: (done) => {
        item.classList.add('done');
        finished.push(done.label);
        announcer.textContent = `${done.label}: ¡listo!`;
      },
    });
    tickets.push(ticket);
    board.add(ticket);
  }
}

restartButton.addEventListener('click', start);
start();
```
