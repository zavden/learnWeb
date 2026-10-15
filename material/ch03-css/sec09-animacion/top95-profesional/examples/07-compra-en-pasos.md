---
example_description: "Un proceso de compra en cuatro pasos con View Transitions con tipo: al avanzar, el paso actual sale por la izquierda y el siguiente entra por la derecha; al retroceder, al revés (startViewTransition con types y :active-view-transition-type). La barra de progreso crece con scale y una transición normal, visible en directo durante la View Transition. El foco va al título de cada paso"
example_tags: "css|profesional|view-transitions|active-view-transition-type|view-transition-name|stepper|scale|javascript|prefers-reduced-motion"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="checkout" data-step="1">
  <ol class="stepper" aria-label="Pasos de la compra">
    <li>Cesta</li>
    <li>Envío</li>
    <li>Pago</li>
    <li>Listo</li>
  </ol>
  <div class="stepper__track" aria-hidden="true"><div class="stepper__fill"></div></div>

  <section class="step" aria-labelledby="step-1-title">
    <h2 id="step-1-title" tabindex="-1">Paso 1 de 4 · Tu cesta</h2>
    <ul class="lines">
      <li><span>Nopal en maceta de barro</span><strong>$185</strong></li>
      <li><span>Echeveria «Perle von Nürnberg»</span><strong>$95</strong></li>
    </ul>
  </section>
  <section class="step" aria-labelledby="step-2-title" hidden>
    <h2 id="step-2-title" tabindex="-1">Paso 2 de 4 · Envío</h2>
    <fieldset class="options">
      <legend>¿Cómo lo recibes?</legend>
      <label><input type="radio" name="shipping" checked> A domicilio, de 2 a 4 días · gratis</label>
      <label><input type="radio" name="shipping"> Recoger en el vivero mañana</label>
    </fieldset>
  </section>
  <section class="step" aria-labelledby="step-3-title" hidden>
    <h2 id="step-3-title" tabindex="-1">Paso 3 de 4 · Pago</h2>
    <p>Tarjeta terminada en 4242 · vence 08/29</p>
    <p class="total">Total: <strong>$280</strong></p>
  </section>
  <section class="step" aria-labelledby="step-4-title" hidden>
    <h2 id="step-4-title" tabindex="-1">Paso 4 de 4 · ¡Pedido confirmado!</h2>
    <p>Te enviamos el número de seguimiento por correo. El pedido 1042 sale mañana del vivero.</p>
  </section>

  <div class="actions">
    <button type="button" class="is-secondary" onclick="goToStep(-1)">← Atrás</button>
    <button type="button" class="is-primary" onclick="goToStep(1)">Continuar →</button>
  </div>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Compra en pasos
   - Cada paso es una sección; solo una está visible (hidden). El cambio
     ocurre dentro de una View Transition con un TIPO: «forward» o «backward»
     (Chrome 125+). :active-view-transition-type() elige la animación.
   - La sección visible se llama «checkout-step» (las ocultas no tienen caja).
   - La raíz no se funde: su foto vieja se oculta y la nueva no se anima. Así,
     lo que no tiene nombre (la barra de progreso, los botones) se ve EN
     DIRECTO durante la transición, y la barra crece con su propia
     transición de scale.
   - El paso actual se marca en el CSS con data-step en <main>; el script solo
     cambia ese atributo y los hidden, y lleva el foco al título del paso.
   - Movimiento reducido: el paso no tiene nombre (sin deslizamiento) y la
     barra no crece: cambia al instante; los colores del indicador se funden.
   ────────────────────────────────────────────────────────────────────────── */

/* ── Tokens ── */
:root {
  --color-text: #1e293b;
  --color-muted: #475569;
  --color-brand: #14532d;
  --color-accent: #15803d;
  --color-track: #e2e8f0;
  --color-surface: #ffffff;
  --color-focus: #1d4ed8;
  --ease-enter: cubic-bezier(0, 0, 0.2, 1);
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
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

:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.checkout {
  max-width: 30rem;
  margin: 1rem auto;
  padding: 1rem 1.25rem 1.25rem;
  overflow: clip;
  border-radius: 16px;
  background: var(--color-surface);
  box-shadow: 0 1px 4px rgb(15 23 42 / 0.15);
}

/* ── Indicador de pasos ── */
.stepper {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--color-muted);
  font-size: 0.8rem;
  text-align: center;
}

.stepper li {
  transition: color 200ms;
}

/* Los pasos hechos y el actual, en verde. */
[data-step="1"] .stepper li:nth-child(-n + 1),
[data-step="2"] .stepper li:nth-child(-n + 2),
[data-step="3"] .stepper li:nth-child(-n + 3),
[data-step="4"] .stepper li:nth-child(-n + 4) {
  color: var(--color-accent);
  font-weight: 700;
}

.stepper__track {
  height: 6px;
  margin: 0.4rem 0 1rem;
  overflow: hidden;
  border-radius: 999px;
  background: var(--color-track);
}

.stepper__fill {
  height: 100%;
  background: var(--color-accent);
  transform-origin: left;
  scale: 0.25 1;
}

[data-step="2"] .stepper__fill { scale: 0.5 1; }
[data-step="3"] .stepper__fill { scale: 0.75 1; }
[data-step="4"] .stepper__fill { scale: 1 1; }

/* ── Pasos ── */
.step {
  min-height: 9rem;
}

.step h2 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
}

.lines {
  margin: 0;
  padding: 0;
  list-style: none;
}

.lines li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--color-track);
}

.options {
  display: grid;
  gap: 0.4rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
}

.total {
  font-size: 1.1rem;
}

/* ── Botones ── */
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.actions button {
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.is-primary {
  border: 0;
  background: var(--color-brand);
  color: #ffffff;
}

.is-secondary {
  border: 1px solid #64748b;
  background: var(--color-surface);
  color: var(--color-text);
}

/* En el primer paso no se puede retroceder, ni avanzar en el último. */
[data-step="1"] .is-secondary,
[data-step="4"] .is-primary {
  visibility: hidden;
}

/* ── Movimiento ── */
@media (prefers-reduced-motion: no-preference) {
  .stepper__fill {
    transition: scale 450ms var(--ease-standard);
  }

  .step {
    view-transition-name: checkout-step;
  }

  /* La raíz: sin fundido, para que lo que no tiene nombre se vea en directo. */
  ::view-transition-old(root) {
    display: none;
  }

  ::view-transition-new(root) {
    animation: none;
  }

  ::view-transition-group(checkout-step) {
    overflow: clip;
    animation-duration: 300ms;
  }

  html:active-view-transition-type(forward)::view-transition-old(checkout-step) {
    animation: step-out-left 220ms var(--ease-exit) both;
  }

  html:active-view-transition-type(forward)::view-transition-new(checkout-step) {
    animation: step-in-right 300ms var(--ease-enter) both;
  }

  html:active-view-transition-type(backward)::view-transition-old(checkout-step) {
    animation: step-out-right 220ms var(--ease-exit) both;
  }

  html:active-view-transition-type(backward)::view-transition-new(checkout-step) {
    animation: step-in-left 300ms var(--ease-enter) both;
  }
}

@keyframes step-out-left  { to   { opacity: 0; translate: -3rem 0; } }
@keyframes step-in-right  { from { opacity: 0; translate: 3rem 0; } }
@keyframes step-out-right { to   { opacity: 0; translate: 3rem 0; } }
@keyframes step-in-left   { from { opacity: 0; translate: -3rem 0; } }
```

# JavaScript

```javascript
// Adelanto: JavaScript del navegador (capítulo 6). goToStep(+1) avanza y goToStep(-1)
// retrocede: cambia data-step y hidden dentro de una View Transition con un tipo
// («forward» o «backward») que el CSS usa para elegir hacia dónde se desliza el paso.
const checkout = document.querySelector('.checkout');
const steps = checkout.querySelectorAll('.step');

function goToStep(delta) {
  const current = Number(checkout.dataset.step);
  const next = Math.min(Math.max(current + delta, 1), steps.length);
  if (next === current) {
    return;
  }

  const update = () => {
    checkout.dataset.step = String(next);
    steps.forEach((step, index) => {
      step.hidden = index !== next - 1;
    });
    steps[next - 1].querySelector('h2').focus();
  };

  if (!document.startViewTransition) {
    update();
    return;
  }
  document.startViewTransition({ update, types: [delta > 0 ? 'forward' : 'backward'] });
}
```
