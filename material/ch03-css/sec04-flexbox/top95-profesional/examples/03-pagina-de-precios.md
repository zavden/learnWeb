---
example_description: "Una página de precios: encabezado centrado, selector mensual/anual hecho con radios y :has(), tres planes de igual altura con el botón abajo, lista de ventajas con iconos alineados a la primera línea y preguntas frecuentes plegables"
example_tags: "css|profesional|flexbox|precios|tarjetas|has|details|margin-auto"
example_stage: professional
example_importance: critical
---

# HTML

```html
<main class="pricing-page">
  <header class="hero">
    <p class="eyebrow">Suscripción Xochi</p>
    <h1>Una planta nueva cada mes</h1>
    <p class="hero-text">Elegida según la luz de tu casa, con maceta, guía de cuidados y asesoría por chat. Cancela cuando quieras.</p>
    <div class="billing" role="radiogroup" aria-label="Forma de pago">
      <label class="billing-option"><input type="radio" name="billing" value="mensual" checked> Mensual</label>
      <label class="billing-option"><input type="radio" name="billing" value="anual"> Anual <span class="save">2 meses gratis</span></label>
    </div>
  </header>

  <ul class="plans">
    <li class="plan">
      <div class="plan-top"><h2>Semilla</h2></div>
      <p class="plan-for">Para empezar con una planta fácil.</p>
      <p class="plan-price"><strong><span class="monthly">99</span><span class="annual">990</span></strong> <span class="monthly">MXN al mes</span><span class="annual">MXN al año</span></p>
      <ul class="features">
        <li><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>1 planta pequeña al mes</span></li>
        <li><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Guía de cuidados impresa</span></li>
      </ul>
      <a class="plan-cta" href="/suscripcion/semilla">Elegir Semilla</a>
    </li>
    <li class="plan is-featured">
      <div class="plan-top"><h2>Brote</h2><span class="plan-badge">Más elegido</span></div>
      <p class="plan-for">Para llenar de verde un rincón de la casa.</p>
      <p class="plan-price"><strong><span class="monthly">189</span><span class="annual">1890</span></strong> <span class="monthly">MXN al mes</span><span class="annual">MXN al año</span></p>
      <ul class="features">
        <li><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>2 plantas medianas al mes</span></li>
        <li><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Maceta de barro de Tonalá</span></li>
        <li><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Asesoría por chat en horario de oficina, de lunes a sábado</span></li>
      </ul>
      <a class="plan-cta" href="/suscripcion/brote">Elegir Brote</a>
    </li>
    <li class="plan">
      <div class="plan-top"><h2>Jardín</h2></div>
      <p class="plan-for">Para quien ya no tiene dónde poner más.</p>
      <p class="plan-price"><strong><span class="monthly">349</span><span class="annual">3490</span></strong> <span class="monthly">MXN al mes</span><span class="annual">MXN al año</span></p>
      <ul class="features">
        <li><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>4 plantas, una de colección</span></li>
        <li><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Macetas y abono orgánico</span></li>
        <li><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Asesoría por videollamada</span></li>
        <li><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Envío prioritario</span></li>
      </ul>
      <a class="plan-cta" href="/suscripcion/jardin">Elegir Jardín</a>
    </li>
  </ul>

  <p class="guarantee">
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z" fill="#dcfce7" stroke="#166534" stroke-width="2"/><path d="m8.5 12 2.5 2.5 4.5-5" fill="none" stroke="#166534" stroke-width="2"/></svg>
    <span>Si una planta llega dañada, te enviamos otra sin costo.</span>
  </p>

  <section class="faq" aria-labelledby="faq-title">
    <h2 id="faq-title">Preguntas frecuentes</h2>
    <details>
      <summary>¿Puedo pausar la suscripción en vacaciones?</summary>
      <p>Sí. Desde tu cuenta puedes saltarte hasta dos envíos al año sin cargo.</p>
    </details>
    <details>
      <summary>¿Qué pasa si no tengo luz directa?</summary>
      <p>Al darte de alta nos cuentas cómo es tu casa y solo te enviamos especies que viven bien en sombra o con luz indirecta.</p>
    </details>
    <details>
      <summary>¿Hacen envíos fuera de Jalisco?</summary>
      <p>Enviamos a toda la República. Fuera de la zona metropolitana de Guadalajara, el envío tarda de 3 a 5 días hábiles.</p>
    </details>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Página de precios
   - Encabezado: columna centrada (align-items: center) y text-align para las
     líneas de cada texto.
   - Selector mensual/anual: dos radios de verdad (se manejan con las flechas
     del teclado) dentro de etiquetas con forma de botón. El radio se oculta
     con opacity, sin sacarlo del árbol de accesibilidad, y la etiqueta marca
     el estado con :has(:checked) y el foco con :has(:focus-visible).
   - Precios: los dos importes están en el HTML; :has() en la página decide
     cuál se ve. display: none también los oculta al lector de pantalla.
   - Planes: rejilla sin media queries (base 12rem, techo 22rem, centrados),
     cada plan en columna con el botón al fondo.
   - Ventajas: icono rígido centrado en la PRIMERA línea del texto con lh.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
  }

  svg {
    display: block;
    flex: none;
  }

  input {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-text: #1e293b;
    --color-muted: #475569;
    --color-border: #cbd5e1;
    --color-surface: #ffffff;
    --color-soft: #f0fdf4;
    --color-brand: #166534;
    --color-brand-dark: #14532d;
    --color-brand-soft: #dcfce7;
    --color-focus: #1d4ed8;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --radius: 0.75rem;
  }
}

@layer base {
  body {
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .pricing-page {
    max-width: 62rem;
    margin-inline: auto;
    padding: var(--space-6) var(--space-4);
  }

  /* ─── Encabezado ─── */
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-6);
    text-align: center;
  }

  .eyebrow {
    color: var(--color-brand);
    font-size: 0.85rem;
    font-weight: 700;
  }

  .hero h1 {
    font-size: clamp(1.5rem, 1rem + 2.5vw, 2.25rem);
    line-height: 1.15;
  }

  .hero-text {
    max-width: 34rem;
    color: var(--color-muted);
  }

  /* ─── Selector mensual / anual ─── */
  .billing {
    display: inline-flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-1);
    margin-top: var(--space-2);
    padding: var(--space-1);
    border-radius: 999px;
    background: var(--color-brand-soft);
  }

  .billing-option {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-4);
    border-radius: 999px;
    color: var(--color-brand-dark);
    font-weight: 600;
    cursor: pointer;
  }

  /* El radio sigue ahí (y en el teclado), pero no se ve: lo sustituye la etiqueta. */
  .billing-option input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .billing-option:has(:checked) {
    background: var(--color-brand);
    color: #ffffff;
  }

  .billing-option:has(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }

  .save {
    padding: 0 var(--space-2);
    border-radius: 999px;
    background: #fef3c7;
    color: #92400e;
    font-size: 0.75rem;
  }

  /* Qué importe se ve, según el radio marcado. */
  .annual {
    display: none;
  }

  .pricing-page:has(input[value="anual"]:checked) .annual {
    display: inline;
  }

  .pricing-page:has(input[value="anual"]:checked) .monthly {
    display: none;
  }

  /* ─── Planes ─── */
  .plans {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-4);
    padding: 0;
    list-style: none;
  }

  .plan {
    display: flex;
    flex-direction: column;
    flex: 1 1 12rem;
    max-width: 22rem;
    padding: var(--space-4);
    border: 2px solid var(--color-border);
    border-radius: var(--radius);
  }

  .plan.is-featured {
    border-color: var(--color-brand);
    background: var(--color-soft);
  }

  /* Nombre a la izquierda y etiqueta empujada al final de la línea. */
  .plan-top {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .plan-top h2 {
    font-size: 1.15rem;
  }

  .plan-badge {
    margin-left: auto;
    padding: 0 var(--space-2);
    border-radius: 999px;
    background: var(--color-brand);
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .plan-for {
    color: var(--color-muted);
    font-size: 0.9rem;
  }

  /* El importe grande y «MXN al mes» pequeño, apoyados en la misma línea base. */
  .plan-price {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 var(--space-2);
    margin-block: var(--space-3);
    color: var(--color-muted);
  }

  .plan-price strong {
    color: var(--color-text);
    font-size: 2rem;
    line-height: 1;
  }

  .features {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
    padding: 0;
    font-size: 0.9rem;
    list-style: none;
  }

  /* Icono rígido, alineado arriba y bajado lo justo para quedar centrado en la
     primera línea: (alto de línea − alto del icono) ÷ 2. */
  .features li {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .features svg {
    margin-top: calc((1lh - 16px) / 2);
    color: var(--color-brand);
  }

  /* El botón, al fondo de cada plan, por distintas que sean sus listas. */
  .plan-cta {
    margin-top: auto;
    padding: var(--space-2) var(--space-4);
    border: 2px solid var(--color-brand);
    border-radius: 999px;
    color: var(--color-brand);
    font-weight: 700;
    text-align: center;
    text-decoration: none;
  }

  .is-featured .plan-cta,
  .plan-cta:hover {
    background: var(--color-brand);
    color: #ffffff;
  }

  /* ─── Garantía: icono y texto, centrados como grupo ─── */
  .guarantee {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    margin-block: var(--space-6);
    color: var(--color-muted);
    font-size: 0.9rem;
    text-align: center;
  }

  /* ─── Preguntas frecuentes ─── */
  .faq {
    max-width: 40rem;
    margin-inline: auto;
  }

  .faq h2 {
    margin-bottom: var(--space-2);
    font-size: 1.25rem;
  }

  .faq details {
    border-top: 1px solid var(--color-border);
  }

  /* Un summary flex deja de ser un list-item: pierde el triángulo, y el signo
     «+» propio se va al final con justify-content. */
  .faq summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding-block: var(--space-3);
    font-weight: 600;
    cursor: pointer;
  }

  .faq summary::after {
    content: "+";
    flex: none;
    color: var(--color-brand);
    font-size: 1.25rem;
    line-height: 1;
  }

  .faq details[open] summary::after {
    content: "−";
  }

  .faq details p {
    padding-bottom: var(--space-3);
    color: var(--color-muted);
  }
}
```
