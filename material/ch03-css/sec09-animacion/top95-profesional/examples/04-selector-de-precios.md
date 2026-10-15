---
example_description: "Una página de precios con selector mensual/anual hecho con dos radios: una píldora se desliza bajo la opción elegida (translate), cada precio cambia con un fundido cruzado y un pequeño desplazamiento vertical, y el ahorro anual aparece con @starting-style. Las tarjetas se levantan al pasar el ratón o con el foco. Sin JavaScript"
example_tags: "css|profesional|precios|radio|has|transiciones|starting-style|translate|grid|prefers-reduced-motion"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="pricing">
  <header class="pricing__head">
    <h1>Planes para tu huerto</h1>
    <p>Todas las funciones de riego y cosecha en cada plan. Cambia o cancela cuando quieras.</p>
    <fieldset class="billing">
      <legend class="visually-hidden">Forma de pago</legend>
      <input type="radio" name="billing" id="monthly" checked>
      <label for="monthly">Mensual</label>
      <input type="radio" name="billing" id="yearly">
      <label for="yearly">Anual <span class="billing__save">−20 %</span></label>
    </fieldset>
  </header>

  <div class="plans">
    <article class="plan">
      <h2>Semilla</h2>
      <p class="plan__price"><span class="is-monthly"><strong>$0</strong></span><span class="is-yearly"><strong>$0</strong></span></p>
      <p class="plan__period">para siempre</p>
      <ul>
        <li>1 bancal</li>
        <li>Recordatorios de riego</li>
      </ul>
      <a class="plan__cta" href="/registro?plan=semilla">Empezar gratis</a>
    </article>
    <article class="plan is-featured">
      <p class="plan__tag">El más elegido</p>
      <h2>Huerto</h2>
      <p class="plan__price"><span class="is-monthly"><strong>$99</strong> al mes</span><span class="is-yearly"><strong>$79</strong> al mes</span></p>
      <p class="plan__period"><span class="is-monthly">facturado cada mes</span><span class="is-yearly">$948 al año</span></p>
      <p class="plan__saving">Ahorras $240 al año</p>
      <ul>
        <li>Bancales ilimitados</li>
        <li>Calendario de siembra</li>
        <li>Alertas de heladas</li>
      </ul>
      <a class="plan__cta" href="/registro?plan=huerto">Elegir Huerto</a>
    </article>
    <article class="plan">
      <h2>Comunidad</h2>
      <p class="plan__price"><span class="is-monthly"><strong>$249</strong> al mes</span><span class="is-yearly"><strong>$199</strong> al mes</span></p>
      <p class="plan__period"><span class="is-monthly">facturado cada mes</span><span class="is-yearly">$2,388 al año</span></p>
      <p class="plan__saving">Ahorras $600 al año</p>
      <ul>
        <li>Hasta 40 personas</li>
        <li>Turnos de riego compartidos</li>
        <li>Inventario de herramientas</li>
      </ul>
      <a class="plan__cta" href="/registro?plan=comunidad">Elegir Comunidad</a>
    </article>
  </div>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Selector de precios
   - El selector son dos radios con sus etiquetas (se maneja con las flechas
     del teclado). Una píldora (::before del fieldset) mide la mitad y se
     desliza a la derecha cuando el radio «anual» está marcado.
   - Cada precio tiene sus dos versiones en la misma celda de grid; se
     cruzan con opacity + visibility (la oculta no se lee) y un pequeño
     desplazamiento vertical: la que entra sube, la que sale también.
   - El ahorro (.plan__saving) no existe en mensual (display: none) y entra
     en anual con @starting-style.
   - --motion (0 o 1) multiplica todas las distancias: con «reducir
     movimiento», la píldora y los precios cambian con fundidos en su sitio.
   ────────────────────────────────────────────────────────────────────────── */

/* ── Tokens ── */
:root {
  --color-text: #1e293b;
  --color-muted: #475569;
  --color-brand: #14532d;
  --color-accent: #15803d;
  --color-surface: #ffffff;
  --color-tint: #f0fdf4;
  --color-focus: #1d4ed8;
  --duration: 250ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
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
  line-height: 1.45;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.pricing {
  max-width: 60rem;
  margin-inline: auto;
  padding: 1.25rem 1rem;
}

.pricing__head {
  display: grid;
  justify-items: center;
  text-align: center;
}

.pricing__head h1 {
  margin: 0;
  font-size: 1.5rem;
}

.pricing__head p {
  margin: 0.25rem 0 1rem;
  color: var(--color-muted);
}

/* ── Selector ── */
.billing {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 15rem;
  margin: 0;
  padding: 4px;
  border: 0;
  border-radius: 999px;
  background: #e2e8f0;
}

/* La píldora: media anchura (menos el relleno), se desliza su propio ancho. */
.billing::before {
  content: "";
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc(50% - 4px);
  border-radius: 999px;
  background: var(--color-brand);
  transition: translate 300ms var(--ease-standard);
}

.billing:has(#yearly:checked)::before {
  translate: 100% 0;
}

.billing:has(:focus-visible) {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
}

.billing input {
  position: absolute;
  opacity: 0;
}

.billing label {
  position: relative;
  z-index: 1;                 /* por encima de las píldoras */
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
  transition: color 200ms;
}

.billing input:checked + label {
  color: #ffffff;
}

.billing__save {
  font-size: 0.75rem;
  font-weight: 600;
}

/* Sin movimiento, la píldora no se desliza: aparece en su sitio con un fundido.
   Para eso hay dos píldoras: la de la izquierda (::before) y la de la
   derecha (::after); cada una se funde. */
@media (prefers-reduced-motion: reduce) {
  .billing::before {
    transition: opacity 200ms;
  }

  .billing:has(#yearly:checked)::before {
    translate: none;
    opacity: 0;
  }

  .billing::after {
    content: "";
    position: absolute;
    top: 4px;
    right: 4px;
    bottom: 4px;
    width: calc(50% - 4px);
    border-radius: 999px;
    background: var(--color-brand);
    opacity: 0;
    transition: opacity 200ms;
  }

  .billing:has(#yearly:checked)::after {
    opacity: 1;
  }
}

/* ── Planes ── */
.plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 1rem;
  margin-top: 1.25rem;
}

.plan {
  display: flex;
  flex-direction: column;
  padding: 1rem 1.25rem 1.25rem;
  border: 1px solid #cbd5e1;
  border-radius: 16px;
  background: var(--color-surface);
  transition:
    translate var(--duration) var(--ease-standard),
    box-shadow var(--duration) var(--ease-standard);
}

.plan:hover,
.plan:focus-within {
  translate: 0 calc(var(--motion) * -4px);
  box-shadow: 0 14px 30px rgb(15 23 42 / 0.12);
}

.plan.is-featured {
  border: 2px solid var(--color-accent);
}

.plan__tag {
  align-self: start;
  margin: 0 0 0.5rem;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: var(--color-tint);
  color: var(--color-brand);
  font-size: 0.75rem;
  font-weight: 700;
}

.plan h2 {
  margin: 0;
  font-size: 1.1rem;
}

/* Las dos versiones de cada precio, en la misma celda. */
.plan__price,
.plan__period {
  display: grid;
  margin: 0.25rem 0 0;
}

.plan__price {
  font-size: 1rem;
}

.plan__price strong {
  font-size: 1.8rem;
}

.plan__period {
  color: var(--color-muted);
  font-size: 0.85rem;
}

.is-monthly,
.is-yearly {
  grid-area: 1 / 1;
  transition:
    opacity var(--duration),
    visibility var(--duration),
    translate var(--duration) var(--ease-standard);
}

.is-yearly {
  opacity: 0;
  visibility: hidden;
  translate: 0 calc(var(--motion) * 0.5rem);
}

.pricing:has(#yearly:checked) .is-monthly {
  opacity: 0;
  visibility: hidden;
  translate: 0 calc(var(--motion) * -0.5rem);
}

.pricing:has(#yearly:checked) .is-yearly {
  opacity: 1;
  visibility: visible;
  translate: 0 0;
}

/* El ahorro: solo en anual. */
.plan__saving {
  display: none;
  align-self: start;
  margin: 0.5rem 0 0;
  padding: 0.15rem 0.6rem;
  border-radius: 6px;
  background: #fef9c3;
  color: #713f12;
  font-size: 0.8rem;
  font-weight: 700;
  opacity: 0;
  transition:
    opacity var(--duration),
    display var(--duration) allow-discrete;
}

.pricing:has(#yearly:checked) .plan__saving {
  display: block;
  opacity: 1;
}

@starting-style {
  .pricing:has(#yearly:checked) .plan__saving {
    opacity: 0;
  }
}

.plan ul {
  flex: 1;
  margin: 0.75rem 0 1rem;
  padding-left: 1.1rem;
  font-size: 0.9rem;
}

.plan__cta {
  display: block;
  padding: 0.55rem 1rem;
  border-radius: 999px;
  background: var(--color-brand);
  color: #ffffff;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  transition: background-color 150ms;
}

.plan__cta:hover {
  background: var(--color-accent);
}
```
