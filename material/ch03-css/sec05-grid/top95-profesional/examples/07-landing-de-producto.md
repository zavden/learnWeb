---
example_description: "La página de presentación de un kit de riego: portada en dos columnas que se apilan, una insignia superpuesta a la foto, ventajas y testimonios alineados con subgrid, pasos numerados y un pie con columnas de enlaces"
example_tags: "css|profesional|grid|subgrid|auto-fit|capas|place-items|landing"
example_stage: professional
example_importance: critical
---

# HTML

```html
<header class="site-header">
  <a class="logo" href="/">Riego Listo</a>
  <nav aria-label="Principal">
    <ul class="nav">
      <li><a href="#ventajas">Ventajas</a></li>
      <li><a href="#como-funciona">Cómo funciona</a></li>
      <li><a href="#opiniones">Opiniones</a></li>
    </ul>
  </nav>
  <a class="button is-small" href="/comprar">Comprar</a>
</header>

<main>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-text">
      <h1 id="hero-title">Tus plantas regadas aunque te vayas de vacaciones</h1>
      <p>Un depósito, cuatro goteros y un sensor de humedad. Se instala en diez minutos y gasta menos agua que una regadera.</p>
      <p class="hero-actions">
        <a class="button" href="/comprar">Comprar por 890 MXN</a>
        <a class="link" href="#como-funciona">Ver cómo funciona</a>
      </p>
    </div>
    <div class="hero-media">
      <img src="plant-pothos.svg" alt="Un pothos en su maceta con el gotero del kit clavado en la tierra" width="240" height="240">
      <p class="hero-badge"><strong>−40 %</strong> de agua</p>
    </div>
  </section>

  <section id="ventajas" class="features" aria-labelledby="features-title">
    <h2 id="features-title">Por qué funciona</h2>
    <ul class="feature-list">
      <li class="feature">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 C9 8 6 11 6 15 a6 6 0 0 0 12 0 C18 11 15 8 12 3Z"/></svg>
        <h3>Riega solo cuando hace falta</h3>
        <p>El sensor mide la humedad de la tierra cada hora y abre el gotero cuando baja del 30 %.</p>
      </li>
      <li class="feature">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M4 20l2-2M18 6l2-2"/></svg>
        <h3>Tres semanas de autonomía</h3>
        <p>El depósito de 5 litros alcanza para seis macetas medianas en pleno verano.</p>
      </li>
      <li class="feature">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>
        <h3>Avisos en el teléfono</h3>
        <p>Te escribe cuando queda un 20 % de agua. Sin aplicación: llega por mensaje.</p>
      </li>
    </ul>
  </section>

  <section id="como-funciona" class="steps" aria-labelledby="steps-title">
    <h2 id="steps-title">Cómo funciona</h2>
    <ol class="step-list">
      <li class="step"><span class="step-number" aria-hidden="true">1</span><h3>Llena el depósito</h3><p>Cualquier recipiente con tapa sirve; el kit trae uno de 5 litros.</p></li>
      <li class="step"><span class="step-number" aria-hidden="true">2</span><h3>Clava los goteros</h3><p>Uno por maceta, a medio camino entre el tallo y el borde.</p></li>
      <li class="step"><span class="step-number" aria-hidden="true">3</span><h3>Olvídate</h3><p>El sensor decide cuándo regar. Tú solo rellenas el depósito.</p></li>
    </ol>
  </section>

  <section id="opiniones" class="testimonials" aria-labelledby="testimonials-title">
    <h2 id="testimonials-title">Lo que dicen quienes ya lo usan</h2>
    <ul class="quote-list">
      <li class="quote">
        <blockquote><p>«Me fui un mes a Oaxaca y a la vuelta mis helechos estaban mejor que cuando me fui.»</p></blockquote>
        <p class="author"><img src="avatar-1.svg" alt="" width="40" height="40"> <span>Carla Ibarra<br><small>Guadalajara</small></span></p>
      </li>
      <li class="quote">
        <blockquote><p>«Lo instalé en el balcón en un rato. Lo mejor es que ya no riego de más.»</p></blockquote>
        <p class="author"><img src="avatar-3.svg" alt="" width="40" height="40"> <span>Rubén Ochoa<br><small>Ciudad de México</small></span></p>
      </li>
      <li class="quote">
        <blockquote><p>«Tengo doce macetas en la azotea y con dos kits me alcanza. El aviso de depósito vacío funciona.»</p></blockquote>
        <p class="author"><img src="avatar-2.svg" alt="" width="40" height="40"> <span>Sofía Treviño<br><small>Monterrey</small></span></p>
      </li>
    </ul>
  </section>

  <section class="cta" aria-labelledby="cta-title">
    <h2 id="cta-title">Envío gratis en octubre</h2>
    <p>Devolución sin preguntas durante 30 días.</p>
    <a class="button is-light" href="/comprar">Comprar el kit</a>
  </section>
</main>

<footer class="site-footer">
  <nav class="footer-columns" aria-label="Pie de página">
    <div><h2>Producto</h2><ul><li><a href="/comprar">Comprar</a></li><li><a href="/manual">Manual</a></li></ul></div>
    <div><h2>Ayuda</h2><ul><li><a href="/envios">Envíos</a></li><li><a href="/garantia">Garantía</a></li></ul></div>
    <div><h2>Empresa</h2><ul><li><a href="/nosotros">Nosotros</a></li><li><a href="/contacto">Contacto</a></li></ul></div>
  </nav>
  <p class="legal">© 2026 Riego Listo · Hecho en Querétaro</p>
</footer>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Página de presentación
   - Portada: dos columnas auto-fit (texto e imagen) que se apilan cuando no
     caben; en la columna de la imagen, foto e insignia en la misma celda.
   - Ventajas y testimonios: tarjetas en columnas auto-fit que comparten filas
     con subgrid (icono, título y texto; cita y autor), así todo queda alineado.
   - Pasos: cada paso es una rejilla de dos columnas: el número, a lo alto de
     las dos filas del texto.
   - Llamada final: place-items: center en una rejilla de una columna.
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

  img,
  svg {
    display: block;
    max-width: 100%;
    height: auto;
  }
}

@layer tokens {
  :root {
    --color-text: #0f172a;
    --color-muted: #475569;
    --color-soft: #f0fdfa;
    --color-brand: #0f766e;
    --color-brand-dark: #134e4a;
    --color-line: #ccfbf1;
    --color-focus: #1d4ed8;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2.5rem;
    --radius: 1rem;
    --page: 64rem;
  }
}

@layer base {
  body {
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  a {
    color: inherit;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }

  main > section {
    max-width: var(--page);
    margin-inline: auto;
    padding: var(--space-8) var(--space-4);
  }

  h2 {
    margin-bottom: var(--space-4);
    font-size: clamp(1.3rem, 1rem + 1.5vw, 1.8rem);
    line-height: 1.2;
  }
}

@layer components {
  .button {
    display: inline-block;
    padding: var(--space-2) var(--space-6);
    border-radius: 999px;
    background: var(--color-brand);
    color: #ffffff;
    font-weight: 700;
    text-decoration: none;
  }

  .button.is-small {
    padding: var(--space-1) var(--space-4);
  }

  .button.is-light {
    background: #ffffff;
    color: var(--color-brand-dark);
  }

  /* ─── Cabecera ─── */
  .site-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-6);
    padding: var(--space-3) var(--space-4);
  }

  .logo {
    font-size: 1.2rem;
    font-weight: 800;
    text-decoration: none;
  }

  .nav {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    padding: 0;
    list-style: none;
  }

  .nav a {
    text-decoration: none;
  }

  .site-header .button {
    margin-left: auto;
  }

  /* ─── Portada ─── */
  .hero {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
    align-items: center;
    gap: var(--space-6);
  }

  .hero h1 {
    font-size: clamp(1.8rem, 1.2rem + 3vw, 3rem);
    line-height: 1.1;
  }

  .hero-text {
    display: grid;
    gap: var(--space-4);
  }

  .hero-text > p:first-of-type {
    color: var(--color-muted);
    font-size: 1.05rem;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-6);
  }

  .link {
    color: var(--color-brand-dark);
    font-weight: 700;
  }

  /* Foto e insignia en la misma celda; la insignia, abajo a la izquierda. */
  .hero-media {
    display: grid;
    justify-self: center;
    max-width: 20rem;
  }

  .hero-media > * {
    grid-area: 1 / 1;
  }

  .hero-media img {
    border-radius: var(--radius);
  }

  .hero-badge {
    justify-self: start;
    align-self: end;
    margin: var(--space-3);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius);
    background: #ffffff;
    box-shadow: 0 4px 12px rgb(15 23 42 / 0.15);
    font-size: 0.85rem;
  }

  .hero-badge strong {
    display: block;
    color: var(--color-brand);
    font-size: 1.4rem;
  }

  /* ─── Ventajas: auto-fit + subgrid (icono, título y texto) ─── */
  .feature-list,
  .quote-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
    gap: var(--space-6) var(--space-4);
    padding: 0;
    list-style: none;
  }

  .feature {
    display: grid;
    grid-row: span 3;
    grid-template-rows: subgrid;
    row-gap: var(--space-2);
    padding: var(--space-4);
    border-radius: var(--radius);
    background: var(--color-soft);
  }

  .feature svg {
    width: 2.5rem;
    padding: var(--space-2);
    border-radius: 50%;
    background: var(--color-brand);
    fill: none;
    stroke: #ffffff;
    stroke-width: 2;
    stroke-linecap: round;
  }

  .feature h3 {
    font-size: 1.05rem;
  }

  .feature p {
    color: var(--color-muted);
  }

  /* ─── Pasos: número a lo alto de título y texto ─── */
  .step-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
    gap: var(--space-6);
    padding: 0;
    list-style: none;
  }

  .step {
    display: grid;
    grid-template-columns: 2.5rem minmax(0, 1fr);
    column-gap: var(--space-3);
  }

  .step-number {
    display: grid;
    place-items: center;
    grid-row: span 2;
    width: 2.5rem;
    height: 2.5rem;
    border: 2px solid var(--color-brand);
    border-radius: 50%;
    color: var(--color-brand);
    font-size: 1.2rem;
    font-weight: 800;
  }

  .step h3 {
    font-size: 1.05rem;
  }

  .step p {
    color: var(--color-muted);
  }

  /* ─── Testimonios: auto-fit + subgrid (cita y autor) ─── */
  .quote {
    display: grid;
    grid-row: span 2;
    grid-template-rows: subgrid;
    row-gap: var(--space-4);
    padding: var(--space-4);
    border: 1px solid var(--color-line);
    border-radius: var(--radius);
  }

  .quote blockquote {
    font-size: 1.05rem;
  }

  .author {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-weight: 700;
  }

  .author img {
    border-radius: 50%;
  }

  .author small {
    color: var(--color-muted);
    font-weight: 400;
  }

  /* ─── Llamada final: todo centrado ─── */
  main > .cta {
    display: grid;
    place-items: center;
    gap: var(--space-3);
    max-width: none;
    background: var(--color-brand-dark);
    color: #ffffff;
    text-align: center;
  }

  .cta h2 {
    margin: 0;
  }

  .cta :focus-visible {
    outline-color: #fde68a;
  }

  /* ─── Pie ─── */
  .site-footer {
    padding: var(--space-6) var(--space-4);
    background: var(--color-soft);
  }

  .footer-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr));
    gap: var(--space-4);
    max-width: var(--page);
    margin-inline: auto;
  }

  .footer-columns h2 {
    margin-bottom: var(--space-2);
    font-size: 0.9rem;
  }

  .footer-columns ul {
    display: grid;
    gap: var(--space-1);
    padding: 0;
    list-style: none;
    font-size: 0.9rem;
  }

  .legal {
    margin-top: var(--space-6);
    color: var(--color-muted);
    font-size: 0.8rem;
    text-align: center;
  }
}
```
