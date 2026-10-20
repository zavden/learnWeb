---
example_description: "Tres planes de precios en cajas inline-block centradas: el destacado con sombra y una cinta que sobresale con margen negativo, listas con iconos de fondo y un selector mensual/anual hecho con :has() y display: none"
example_tags: "css|profesional|precios|inline-block|margin|display"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="pricing">
  <header class="pricing-header">
    <h1>Elige tu plan</h1>
    <p>Todos los planes incluyen certificado HTTPS y copias de seguridad. Sin permanencia.</p>
  </header>

  <div class="billing" role="radiogroup" aria-label="Facturación">
    <label class="billing-option"><input type="radio" name="billing" id="billing-monthly" checked> Mensual</label>
    <label class="billing-option"><input type="radio" name="billing" id="billing-yearly"> Anual <span class="save">2 meses gratis</span></label>
  </div>

  <div class="plans">
    <section class="plan" aria-labelledby="plan-basic">
      <h2 class="plan-name" id="plan-basic">Básico</h2>
      <p class="plan-summary">Para tu primera web o un portfolio.</p>
      <p class="plan-price price-monthly"><span class="amount">5 €</span> al mes</p>
      <p class="plan-price price-yearly"><span class="amount">50 €</span> al año</p>
      <ul class="features">
        <li class="yes">1 sitio web</li>
        <li class="yes">10 GB de almacenamiento</li>
        <li class="yes">Certificado HTTPS</li>
        <li class="no">Dominio propio no incluido</li>
        <li class="no">Soporte por correo no incluido</li>
      </ul>
      <a class="plan-cta" href="#">Empezar con Básico</a>
    </section>

    <section class="plan plan--featured" aria-labelledby="plan-pro">
      <p class="plan-ribbon">El más elegido</p>
      <h2 class="plan-name" id="plan-pro">Profesional</h2>
      <p class="plan-summary">Para negocios pequeños y tiendas en línea.</p>
      <p class="plan-price price-monthly"><span class="amount">12 €</span> al mes</p>
      <p class="plan-price price-yearly"><span class="amount">120 €</span> al año</p>
      <ul class="features">
        <li class="yes">5 sitios web</li>
        <li class="yes">50 GB de almacenamiento</li>
        <li class="yes">Certificado HTTPS</li>
        <li class="yes">Dominio propio gratis el primer año</li>
        <li class="yes">Soporte por correo en 24 horas</li>
      </ul>
      <a class="plan-cta plan-cta--primary" href="#">Empezar con Profesional</a>
    </section>

    <section class="plan" aria-labelledby="plan-team">
      <h2 class="plan-name" id="plan-team">Equipo</h2>
      <p class="plan-summary">Para agencias que gestionan las webs de sus clientes.</p>
      <p class="plan-price price-monthly"><span class="amount">29 €</span> al mes</p>
      <p class="plan-price price-yearly"><span class="amount">290 €</span> al año</p>
      <ul class="features">
        <li class="yes">Sitios web ilimitados</li>
        <li class="yes">200 GB de almacenamiento</li>
        <li class="yes">Certificado HTTPS</li>
        <li class="yes">Dominios propios ilimitados</li>
        <li class="yes">Soporte prioritario por teléfono</li>
      </ul>
      <a class="plan-cta" href="#">Hablar con ventas</a>
    </section>
  </div>

  <p class="pricing-note">Precios sin IVA. ¿Eres una asociación sin ánimo de lucro? <a href="#">Pide tu descuento</a>.</p>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Cajas de precios
   - Tres planes inline-block de min(100%, 18rem). text-align: center en .plans
     centra cada fila; dentro de cada plan se vuelve a alinear al inicio. Con poco
     ancho, saltan de línea y quedan uno debajo de otro, sin media queries.
   - Todas las cajas tienen el mismo borde de 2px: el plan destacado solo cambia el
     color, añade una sombra (no ocupa espacio) y una cinta que sobresale por arriba
     con un margen negativo. .plans reserva arriba el sitio de la cinta.
   - Selector mensual/anual sin JavaScript: :has(:checked) y display: none. Un precio
     con display: none tampoco existe para los lectores de pantalla.
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

  input {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-bg: #f8fafc;
    --color-surface: #ffffff;
    --color-text: #1e293b;
    --color-text-muted: #475569;
    --color-border: #e2e8f0;
    --color-brand: #4338ca;
    --color-brand-strong: #3730a3;
    --color-brand-soft: #eef2ff;
    --color-save: #166534;
    --color-save-soft: #dcfce7;
    --color-focus: #4338ca;

    --plan-pad: 1.5rem;
    --plan-radius: 18px;
    --ribbon-height: 1.75rem;
    --shadow-plan: 0 1px 2px rgb(15 23 42 / 0.05);
    --shadow-featured: 0 4px 8px rgb(67 56 202 / 0.1), 0 24px 48px rgb(67 56 202 / 0.18);
  }
}

@layer base {
  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  :where(a) {
    color: var(--color-brand);
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .pricing {
    width: min(100% - 2rem, 62rem);
    margin: 2rem auto;
  }

  .pricing-header {
    max-width: 40rem;
    margin: 0 auto 1.5rem;
    text-align: center;
  }

  .pricing-header h1 {
    margin-bottom: 0.5rem;
    font-size: clamp(1.75rem, 5vw, 2.5rem);
    line-height: 1.15;
  }

  .pricing-header p {
    color: var(--color-text-muted);
  }

  /* ─── Selector mensual / anual ─── */
  /* fit-content + margin-inline: auto: una caja de bloque del ancho de su contenido,
     centrada (lecciones de tamaños y márgenes). */
  .billing {
    width: fit-content;
    max-width: 100%;
    margin: 0 auto 2rem;
    padding: 0.25rem;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-surface);
  }

  .billing-option {
    display: inline-block;
    padding: 0.375rem 1rem;
    border: 2px solid transparent;
    border-radius: 999px;
    cursor: pointer;
  }

  .billing-option:has(:checked) {
    border-color: var(--color-brand);
    background: var(--color-brand-soft);
    color: var(--color-brand-strong);
    font-weight: 600;
  }

  .billing-option:has(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }

  .billing-option input {
    margin: 0 0.25rem 0 0;
  }

  .save {
    display: inline-block;
    margin-left: 0.25rem;
    padding: 0 0.5rem;
    border-radius: 999px;
    background: var(--color-save-soft);
    color: var(--color-save);
    font-size: 0.75rem;
    font-weight: 700;
  }

  /* Solo un precio existe a la vez */
  .pricing:has(#billing-monthly:checked) .price-yearly,
  .pricing:has(#billing-yearly:checked) .price-monthly {
    display: none;
  }

  /* ─── Los planes ─── */
  .plans {
    padding-top: var(--ribbon-height);  /* sitio para la cinta, que sobresale hacia arriba */
    text-align: center;
  }

  .plan {
    display: inline-block;
    vertical-align: top;                /* vertical-align llega en el módulo de flujo */
    width: min(100%, 18rem);
    margin: 0 0.5rem calc(var(--ribbon-height) + 1rem);
    padding: var(--plan-pad);
    border: 2px solid var(--color-border);
    border-radius: var(--plan-radius);
    background: var(--color-surface);
    box-shadow: var(--shadow-plan);
    text-align: start;
  }

  .plan--featured {
    border-color: var(--color-brand);
    box-shadow: var(--shadow-featured);
  }

  /* La cinta: un bloque del ancho de su texto, centrado, y subido con un margen
     negativo igual al relleno superior del plan + la mitad de su alto: queda montada
     sobre el borde. Un inline-block es un BFC: el margen no se escapa del plan. */
  .plan-ribbon {
    width: fit-content;
    height: var(--ribbon-height);
    margin: calc((var(--plan-pad) + var(--ribbon-height) / 2) * -1) auto calc(var(--plan-pad) - var(--ribbon-height) / 2);
    padding: 0 0.875rem;
    border-radius: 999px;
    background: var(--color-brand);
    color: #ffffff;
    font-size: 0.8125rem;
    font-weight: 700;
    line-height: var(--ribbon-height);
  }

  .plan-name {
    font-size: 1.25rem;
  }

  .plan-summary {
    min-height: 3lh;                    /* tres líneas reservadas: los precios quedan a la misma altura */
    margin-top: 0.25rem;
    color: var(--color-text-muted);
    font-size: 0.9375rem;
  }

  .plan-price {
    margin-block: 1rem;
    color: var(--color-text-muted);
  }

  .amount {
    color: var(--color-text);
    font-size: 2.25rem;
    font-weight: 800;
    line-height: 1;
  }

  /* Lista con iconos de fondo: el relleno izquierdo reserva el hueco del icono */
  .features {
    margin-bottom: 1.5rem;
    padding: 1rem 0 0;
    border-top: 1px solid var(--color-border);
    list-style: none;
  }

  .features li {
    padding: 0.25rem 0 0.25rem 1.75rem;
    background-repeat: no-repeat;
    background-position: left 0.3rem;
    background-size: 1.125rem;
    font-size: 0.9375rem;
  }

  .features .yes {
    background-image: url("icon-check.svg");
  }

  .features .no {
    background-image: url("icon-x.svg");
    color: var(--color-text-muted);
  }

  /* Botón de bloque: llena el ancho del plan sin width: 100% */
  .plan-cta {
    display: block;
    padding: 0.7rem 1rem;
    border: 2px solid var(--color-brand);
    border-radius: 12px;
    color: var(--color-brand);
    font-weight: 700;
    text-align: center;
    text-decoration: none;
  }

  .plan-cta:hover {
    background: var(--color-brand-soft);
  }

  .plan-cta--primary {
    background: var(--color-brand);
    color: #ffffff;
  }

  .plan-cta--primary:hover {
    border-color: var(--color-brand-strong);
    background: var(--color-brand-strong);
  }

  .pricing-note {
    color: var(--color-text-muted);
    font-size: 0.9375rem;
    text-align: center;
  }
}
```
