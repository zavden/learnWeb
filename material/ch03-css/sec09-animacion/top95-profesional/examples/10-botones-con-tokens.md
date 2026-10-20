---
example_description: "Un juego de botones con un sistema de tokens de movimiento: duraciones (instant, fast, base), curvas (standard, spring) y --motion, que multiplica distancias y escalas y vale 0 salvo con no-preference. Botones que se levantan y se hunden al pulsar, un anillo de foco que se separa, un «favorito» que late y lanza una onda, un interruptor con rebote y un botón de pago con spinner tras 300 ms"
example_tags: "css|profesional|botones|tokens|micro-interacciones|keyframes|transiciones|focus-visible|prefers-reduced-motion"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="kit">
  <h1>Botones de la tienda</h1>
  <p class="kit__lead">Pasa el ratón, pulsa y recórrelos con <kbd>Tab</kbd>. Todo el movimiento sale de los tokens de <code>:root</code>.</p>

  <section class="row" aria-label="Acciones">
    <a class="button is-primary" href="/cesta">Ir a la cesta</a>
    <a class="button is-secondary" href="/plantas">Seguir comprando</a>
    <a class="button is-ghost" href="/ayuda/envios">¿Cómo son los envíos?</a>
  </section>

  <section class="row" aria-label="Preferencias">
    <label class="favorite">
      <input type="checkbox">
      <span class="favorite__heart" aria-hidden="true"></span>
      Guardar en favoritas
    </label>
    <label class="switch">
      <input type="checkbox" role="switch">
      <span class="switch__track" aria-hidden="true"><span class="switch__knob"></span></span>
      Avisarme del riego
    </label>
  </section>

  <section class="row" aria-label="Pago">
    <label class="pay">
      <input type="checkbox">
      <span class="pay__spinner" aria-hidden="true"></span>
      <span class="pay__text is-idle">Pagar $280</span>
      <span class="pay__text is-busy">Procesando el pago…</span>
    </label>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Botones con tokens de movimiento
   Tokens (:root):
     --duration-instant  80ms   respuesta a pulsar (hundirse)
     --duration-fast    150ms   color, sombra
     --duration-base    250ms   desplazamientos pequeños
     --ease-standard            entrar y moverse
     --ease-spring              con un 10 % de rebote (interruptor, latido)
     --motion           0 | 1   multiplica distancias y escalas
   Reglas del kit:
   - Ningún componente escribe un tiempo o una curva: usa tokens.
   - Lo que se desplaza o escala va multiplicado por --motion. Con «reducir
     movimiento» (--motion: 0), los botones cambian de color y de sombra
     pero no se mueven, el corazón se rellena sin latir y el spinner late.
   - El foco se ve siempre (y con movimiento, el anillo se separa).
   - El spinner del pago aparece a los 300 ms: si el pago es rápido, no
     parpadea. Es la única animación infinita, y solo mientras se «paga».
   ────────────────────────────────────────────────────────────────────────── */

/* ── Tokens ── */
:root {
  --color-text: #1e293b;
  --color-muted: #475569;
  --color-brand: #14532d;
  --color-accent: #15803d;
  --color-love: #be123c;
  --color-surface: #ffffff;
  --color-focus: #1d4ed8;
  --duration-instant: 80ms;
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --motion: 0;
}

@media (prefers-reduced-motion: no-preference) {
  :root {
    --motion: 1;
  }
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
  line-height: 1.4;
}

.kit {
  max-width: 40rem;
  margin-inline: auto;
  padding: 1rem;
}

.kit h1 {
  margin: 0;
  font-size: 1.3rem;
}

.kit__lead {
  margin: 0.25rem 0 1rem;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.25rem;
  margin-bottom: 1.25rem;
}

/* El anillo de foco, común a todo: con movimiento, se separa hasta 4px al
   aparecer (cada componente pone outline-offset en su lista de transiciones). */
:focus-visible,
label:has(:focus-visible) {
  outline: 3px solid var(--color-focus);
  outline-offset: calc(1px + var(--motion) * 3px);
}

/* ── Botones ── */
.button {
  display: inline-block;
  padding: 0.6rem 1.1rem;
  border: 2px solid transparent;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
  transition:
    translate var(--duration-base) var(--ease-standard),
    scale var(--duration-instant) var(--ease-standard),
    box-shadow var(--duration-fast),
    background-color var(--duration-fast),
    color var(--duration-fast),
    outline-offset var(--duration-fast) var(--ease-standard);
}

.button:hover {
  translate: 0 calc(var(--motion) * -2px);
  box-shadow: 0 6px 14px rgb(15 23 42 / 0.18);
}

/* Al pulsar: se hunde rápido (instant), sin esperar a la subida. */
.button:active {
  translate: 0 0;
  scale: calc(1 - var(--motion) * 0.03);
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.2);
}

.is-primary {
  background: var(--color-brand);
  color: #ffffff;
}

.is-primary:hover {
  background: var(--color-accent);
}

.is-secondary {
  border-color: var(--color-brand);
  background: var(--color-surface);
  color: var(--color-brand);
}

.is-ghost {
  color: var(--color-brand);
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.is-ghost:hover {
  box-shadow: none;
  background: #f0fdf4;
}

/* ── Favorito ── */
.favorite,
.switch,
.pay {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  transition: outline-offset var(--duration-fast) var(--ease-standard);
}

/* Las casillas, invisibles encima de su etiqueta: siguen siendo casillas
   para el teclado y los lectores de pantalla. */
.favorite input,
.switch input,
.pay input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.favorite__heart {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 2.2rem;
  height: 2.2rem;
  border: 2px solid var(--color-love);
  border-radius: 50%;
  color: var(--color-love);
  font-size: 1.2rem;
  transition: background-color var(--duration-fast);
}

/* Vacío o lleno: content es discreta, cambia al instante; el fondo se funde. */
.favorite__heart::before {
  content: "♡";
}

.favorite:has(:checked) .favorite__heart {
  background: #ffe4e6;
}

.favorite:has(:checked) .favorite__heart::before {
  content: "♥";
}

/* La onda: un anillo que crece y se desvanece una vez al marcar. */
.favorite__heart::after {
  content: "";
  position: absolute;
  inset: -2px;
  border: 2px solid var(--color-love);
  border-radius: 50%;
  opacity: 0;
}

@keyframes beat {
  40% { scale: calc(1 + var(--motion) * 0.25); }
}

@keyframes ripple {
  from { opacity: 0.8; scale: 1; }
  to   { opacity: 0; scale: 1.8; }
}

.favorite:has(:checked) .favorite__heart {
  animation: beat 400ms var(--ease-spring);
}

@media (prefers-reduced-motion: no-preference) {
  .favorite:has(:checked) .favorite__heart::after {
    animation: ripple 500ms var(--ease-standard);
  }
}

/* ── Interruptor ── */
.switch__track {
  display: inline-block;
  width: 2.6rem;
  height: 1.5rem;
  padding: 2px;
  border-radius: 999px;
  background: #94a3b8;
  transition: background-color var(--duration-fast);
}

.switch__knob {
  display: block;
  width: calc(1.5rem - 4px);
  height: calc(1.5rem - 4px);
  border-radius: 50%;
  background: var(--color-surface);
  box-shadow: 0 1px 3px rgb(15 23 42 / 0.3);
  transition: translate var(--duration-base) var(--ease-spring);
}

.switch:has(:checked) .switch__track {
  background: var(--color-accent);
}

/* Sin movimiento, la bola también cambia de lado (es el estado), pero sin
   viajar: la transición de translate se queda en 0 s. */
.switch:has(:checked) .switch__knob {
  translate: 1.1rem 0;
}

@media (prefers-reduced-motion: reduce) {
  .switch__knob {
    transition: none;
  }
}

/* ── Pagar ── */
.pay {
  display: inline-grid;
  grid-template-columns: auto 1fr;
  padding: 0.65rem 1.25rem;
  border-radius: 999px;
  background: var(--color-brand);
  color: #ffffff;
}

.pay__text {
  grid-area: 1 / 2;
  transition: opacity var(--duration-fast), visibility var(--duration-fast);
}

.pay__text.is-busy,
.pay:has(:checked) .pay__text.is-idle {
  opacity: 0;
  visibility: hidden;
}

.pay:has(:checked) .pay__text.is-busy {
  opacity: 1;
  visibility: visible;
}

.pay__spinner {
  grid-area: 1 / 1;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgb(255 255 255 / 0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  opacity: 0;
}

@keyframes appear {
  to { opacity: 1; }
}

@keyframes spin {
  to { rotate: 1turn; }
}

@keyframes pulse {
  50% { opacity: 0.4; }
}

@media (prefers-reduced-motion: no-preference) {
  .pay:has(:checked) .pay__spinner {
    animation:
      appear var(--duration-fast) linear 300ms forwards,
      spin 0.9s linear infinite;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pay:has(:checked) .pay__spinner {
    border-color: #ffffff;
    animation:
      appear var(--duration-fast) linear 300ms forwards,
      pulse 2s ease-in-out infinite;
  }
}
```
