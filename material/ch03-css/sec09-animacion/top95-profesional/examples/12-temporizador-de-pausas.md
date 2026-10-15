---
example_description: "Un temporizador de pausas activas hecho solo con CSS: una custom property registrada como <integer> cuenta hacia atrás con steps() (un salto por segundo), y la leen un anillo con conic-gradient y un contador; la casilla «Pausar» congela todo con animation-play-state, y el aviso de «¡Listo!» es una segunda animación con un retardo igual a la duración. Con reducir movimiento, el aviso aparece sin el pequeño salto"
example_tags: "css|profesional|keyframes|property|integer|steps|animation-play-state|fill-mode|counter|temporizador|prefers-reduced-motion"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="timer">
  <h1>Pausa activa</h1>
  <fieldset class="exercises">
    <legend>Estiramiento</legend>
    <label><input type="radio" name="stretch" id="stretch-neck" checked> Cuello · 30 s</label>
    <label><input type="radio" name="stretch" id="stretch-back"> Espalda · 60 s</label>
  </fieldset>

  <div class="dial" aria-hidden="true">
    <span class="dial__count"></span>
  </div>
  <p class="done" role="status">¡Listo! Vuelve poco a poco a tu postura.</p>

  <div class="controls">
    <label class="control"><input type="checkbox" id="start"> Empezar</label>
    <label class="control"><input type="checkbox" id="pause"> Pausar</label>
  </div>
  <p class="hint">Desmarca «Empezar» para volver al principio.</p>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Temporizador de pausas
   - --remaining (registrada, <integer>, heredable) es el reloj: una
     animación sobre .timer la lleva de --total (30 o 60, según el radio) a
     0 en --total segundos. Al ser heredable, el anillo y el contador la leen.
   - steps(var(--total)): un salto por segundo. Con jump-end (el valor por
     defecto), el contador enseña 30, 29… 1 durante cada segundo y el 0 al
     terminar (fill-mode forwards): justo lo que se espera de un temporizador.
   - El número del centro es un contador de CSS (counter-reset con la
     variable); el anillo, un conic-gradient con --remaining / --total.
   - «¡Listo!» es otra animación con un retardo de --total segundos: aparece
     cuando termina la cuenta. «Pausar» pone animation-play-state: paused en
     las dos, así que siguen sincronizadas.
   - Accesibilidad: el anillo es aria-hidden (una cuenta leída cada segundo
     sería insoportable); el aviso final es un role="status".
   - Movimiento: el anillo cambia de color, no se mueve. El aviso da un
     pequeño salto solo con no-preference.
   ────────────────────────────────────────────────────────────────────────── */
@property --remaining {
  syntax: "<integer>";
  inherits: true;
  initial-value: 30;
}

/* ── Tokens ── */
:root {
  --color-text: #1e293b;
  --color-muted: #475569;
  --color-ring: #15803d;
  --color-track: #e2e8f0;
  --color-surface: #ffffff;
  --color-focus: #1d4ed8;
}

/* ── Base ── */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #f8fafc;
  color: var(--color-text);
  font-family: system-ui, sans-serif;
  line-height: 1.45;
}

.timer {
  --total: 30;
  --remaining: var(--total);
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  max-width: 22rem;
  margin: 1rem auto;
  padding: 1.25rem;
  border-radius: 18px;
  background: var(--color-surface);
  box-shadow: 0 1px 4px rgb(15 23 42 / 0.15);
  text-align: center;
}

.timer:has(#stretch-back:checked) {
  --total: 60;
}

.timer h1 {
  margin: 0;
  font-size: 1.3rem;
}

.exercises {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25rem 1rem;
  margin: 0;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.9rem;
}

/* ── El reloj ── */
@keyframes countdown {
  from { --remaining: var(--total); }
  to   { --remaining: 0; }
}

.timer:has(#start:checked) {
  animation: countdown calc(var(--total) * 1s) steps(var(--total)) forwards;
}

.timer:has(#pause:checked) {
  animation-play-state: paused;
}

/* ── Anillo y número ── */
.dial {
  display: grid;
  place-items: center;
  width: 9rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    radial-gradient(circle, var(--color-surface) 0 66%, transparent 67%),
    conic-gradient(var(--color-ring) calc(var(--remaining) / var(--total) * 100%), var(--color-track) 0);
}

.dial__count {
  counter-reset: seconds var(--remaining);
  font-size: 2rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.dial__count::after {
  content: counter(seconds) " s";
}

/* ── ¡Listo! ── */
.done {
  margin: 0;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  background: #dcfce7;
  color: #14532d;
  font-weight: 700;
  opacity: 0;
  visibility: hidden;
}

@keyframes done-in {
  to {
    opacity: 1;
    visibility: visible;
  }
}

@keyframes done-bump {
  40% { scale: 1.08; }
}

/* Espera lo mismo que dura la cuenta y aparece; se pausa con ella. */
.timer:has(#start:checked) .done {
  animation: done-in 300ms ease-out calc(var(--total) * 1s) forwards;
}

@media (prefers-reduced-motion: no-preference) {
  .timer:has(#start:checked) .done {
    animation:
      done-in 300ms ease-out calc(var(--total) * 1s) forwards,
      done-bump 400ms cubic-bezier(0.34, 1.56, 0.64, 1) calc(var(--total) * 1s);
  }
}

/* Después de los atajos (que reinician animation-play-state a running). */
.timer:has(#pause:checked) .done {
  animation-play-state: paused;
}

/* ── Controles ── */
.controls {
  display: flex;
  gap: 0.5rem;
}

.control {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  padding: 0.45rem 0.9rem;
  border: 1px solid #64748b;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

.control:has(:checked) {
  border-color: #14532d;
  background: #14532d;
  color: #ffffff;
}

.control:has(:focus-visible) {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.hint {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.8rem;
}
```
