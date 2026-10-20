---
example_description: "Un pequeño motor de animaciones: un solo bucle de requestAnimationFrame mueve todas las animaciones activas y se detiene solo cuando no queda ninguna; cada animación es una promesa (se encadena con await, se combina con Promise.all y se cancela con una señal), avanza con delta time limitado y termina exactamente en su valor final"
example_tags: "javascript|profesional|requestanimationframe|promesas|animacion|delta-time|abortsignal"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="tracking">
  <article class="card" id="card" aria-labelledby="card-title">
    <h1 id="card-title">Pedido P-2077</h1>
    <p>Repartidor: <strong>Toño</strong> · Faltan <span id="distance">12.0</span> km</p>
    <div class="track" aria-hidden="true"><div class="fill" id="fill"></div></div>
    <p class="badges">
      <span class="badge on-the-way" id="on-the-way">En camino</span>
      <span class="badge delivered" id="delivered">Entregado ✓</span>
    </p>
  </article>
  <p id="status" class="status" role="status"></p>
  <button id="replay" type="button">Repetir</button>
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
  --warn-bg: #fef3c7;
  --warn: #92400e;
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
  overflow-x: hidden;
}
.tracking {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1.25rem 1rem 2rem;
}
.card {
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--surface);
}
h1 {
  font-size: 1.2rem;
  margin: 0;
}
.track {
  height: 0.6rem;
  border-radius: 999px;
  background: #e4e7eb;
  overflow: hidden;
}
.fill {
  height: 100%;
  background: var(--accent);
  transform-origin: left;
  scale: 0 1;
}
.badges {
  display: flex;
  gap: 0.5rem;
}
.badge {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-weight: 600;
}
.on-the-way {
  color: var(--warn);
  background: var(--warn-bg);
}
.delivered {
  color: var(--ok);
  background: var(--ok-bg);
  scale: 0;
}
.status {
  color: var(--muted);
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
// UN MOTOR DE ANIMACIONES MÍNIMO.
//
// Decisiones:
// - Un solo bucle de rAF (el «ticker») para todas las animaciones activas:
//   un callback por frame, aunque haya diez animaciones. Cuando no queda
//   ninguna, el bucle se detiene solo (nada de trabajo en segundo plano).
// - Cada animación acumula el tiempo que le llega del ticker (delta time,
//   limitado a 100 ms: al volver de otra pestaña no da un salto).
// - animate() devuelve una promesa: se encadena con await, varias a la vez
//   con Promise.all, y se cancela con { signal } (AbortController,
//   AbortSignal.timeout).
// - El último frame usa el valor final exacto: nada termina en 11.98 km.
// - Se anima con style.translate, style.scale y textContent (capítulo 6);
//   translate y scale no obligan al navegador a recalcular el layout.
//
// Alcance: módulos 1-7 (+ un mínimo de DOM, capítulo 6).

const easings = {
  linear: (t) => t,
  easeOutCubic: (t) => 1 - (1 - t) ** 3,
  easeOutBack: (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2, // se pasa un poco y vuelve
};

class Ticker {
  #tasks = new Set();
  #frameId = null;
  #last = null;
  stats = { frames: 0, maxTasksInFrame: 0, stops: 0 };

  add(task) {
    this.#tasks.add(task);
    if (this.#frameId === null) {
      this.#last = null;
      this.#frameId = requestAnimationFrame(this.#tick);
    }
  }
  remove(task) {
    this.#tasks.delete(task);
  }
  get running() {
    return this.#frameId !== null;
  }
  #tick = (now) => {
    const dt = this.#last === null ? 0 : Math.min(now - this.#last, 100); // ✅ delta limitado
    this.#last = now;
    this.stats.frames += 1;
    this.stats.maxTasksInFrame = Math.max(this.stats.maxTasksInFrame, this.#tasks.size);
    for (const task of [...this.#tasks]) task.step(dt);
    if (this.#tasks.size > 0) {
      this.#frameId = requestAnimationFrame(this.#tick);
    } else {
      this.#frameId = null; // sin animaciones: el bucle se detiene
      this.stats.stops += 1;
    }
  };
}

const ticker = new Ticker();

function animate({ duration, easing = easings.easeOutCubic, onUpdate, signal }) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    let elapsed = 0;
    const task = {
      step(dt) {
        elapsed += dt;
        const t = Math.min(elapsed / duration, 1);
        onUpdate(t === 1 ? 1 : easing(t)); // el final, exacto
        if (t === 1) {
          ticker.remove(task);
          resolve();
        }
      },
    };
    ticker.add(task);
    signal?.addEventListener('abort', () => { // addEventListener: capítulo 6
      ticker.remove(task);
      reject(signal.reason);
    }, { once: true });
  });
}

// Repite una animación hasta que la señal se cancele.
async function repeat(options) {
  try {
    while (true) await animate(options);
  } catch (error) {
    if (error.name !== 'AbortError' && error.name !== 'TimeoutError') throw error;
  }
}

// ── La escena ────────────────────────────────────────────────────────────
const card = document.querySelector('#card');
const fill = document.querySelector('#fill');
const distance = document.querySelector('#distance');
const onTheWay = document.querySelector('#on-the-way');
const delivered = document.querySelector('#delivered');
const statusLine = document.querySelector('#status');
const replayButton = document.querySelector('#replay');
const lerp = (from, to, t) => from + (to - from) * t;
const say = (text) => {
  statusLine.textContent = text;
  console.log(text);
};

async function play() {
  replayButton.disabled = true;
  delivered.style.scale = '0';
  say('1. la tarjeta entra');
  await animate({ duration: 250, onUpdate: (t) => { card.style.translate = `${lerp(-110, 0, t)}% 0`; } });

  say('2. la barra y la distancia avanzan a la vez');
  let lastKm = 12;
  await Promise.all([
    animate({ duration: 400, easing: easings.linear, onUpdate: (t) => { fill.style.scale = `${t} 1`; } }),
    animate({ duration: 400, easing: easings.linear, onUpdate: (t) => {
      lastKm = lerp(12, 0, t);
      distance.textContent = lastKm.toFixed(1);
    } }),
  ]);

  say('3. «En camino» late hasta que se agota su plazo');
  await repeat({ duration: 150, signal: AbortSignal.timeout(450), onUpdate: (t) => { onTheWay.style.scale = `${1 + 0.15 * Math.sin(t * Math.PI)}`; } });
  onTheWay.style.scale = '1';

  say('4. aparece «Entregado»');
  await animate({ duration: 250, easing: easings.easeOutBack, onUpdate: (t) => { delivered.style.scale = `${t}`; } });

  replayButton.disabled = false;
  console.log('los km terminaron exactamente en 0 →', lastKm === 0);
  console.log('dos animaciones en el mismo frame (un solo bucle de rAF) →', ticker.stats.maxTasksInFrame >= 2);
  console.log('el bucle se detuvo solo al quedarse sin animaciones →', !ticker.running && ticker.stats.stops >= 1);
  console.log(`frames dibujados ≈ ${ticker.stats.frames} (≈ 80 a 60 Hz; varía)`);
}

replayButton.addEventListener('click', play);
play();
```
