---
example_description: "La portada de un blog: artículo destacado con imagen que se apila, tarjetas de artículos con la línea de autor y las etiquetas al fondo, paginación y un cuadro de suscripción con campo y botón"
example_tags: "css|profesional|flexbox|blog|media-object|tarjetas|flex-wrap|formularios"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="blog">
  <header class="blog-header">
    <h1>El blog de Xochi</h1>
    <p>Guías, errores comunes y entrevistas para que tus plantas vivan más que tus series favoritas.</p>
  </header>

  <article class="featured">
    <img class="featured-image" src="plant-monstera.svg" alt="" width="240" height="240">
    <div class="featured-text">
      <p class="kicker">Destacado</p>
      <h2><a href="/blog/monstera-hojas-amarillas">Hojas amarillas en la monstera: las cinco causas y cómo distinguirlas</a></h2>
      <p>No siempre es exceso de riego. Te enseñamos a leer la hoja: dónde empieza el amarillo, cómo es el borde y qué pasa con las raíces.</p>
      <div class="byline">
        <img src="avatar-1.svg" alt="" width="32" height="32">
        <p><a href="/blog/autoras/marta-garcia">Marta García</a> <span class="meta"><time datetime="2026-10-12">12 oct. 2026</time> · 8 min de lectura</span></p>
      </div>
    </div>
  </article>

  <section aria-labelledby="latest-title">
    <h2 id="latest-title" class="section-title">Lo último</h2>
    <ul class="posts">
      <li class="post">
        <img src="plant-cactus.svg" alt="" width="240" height="240">
        <h3><a href="/blog/cactus-en-invierno">Cactus en invierno: riega menos de lo que crees</a></h3>
        <p class="post-excerpt">Con menos luz, el cactus casi no crece. Si el riego sigue igual, las raíces se pudren.</p>
        <ul class="tags" aria-label="Etiquetas">
          <li><a href="/blog/etiquetas/cactus">cactus</a></li>
          <li><a href="/blog/etiquetas/riego">riego</a></li>
        </ul>
        <div class="byline">
          <img src="avatar-3.svg" alt="" width="28" height="28">
          <p><a href="/blog/autores/luis-gomez">Luis Gómez</a> <span class="meta"><time datetime="2026-10-08">8 oct.</time> · 5 min</span></p>
        </div>
      </li>
      <li class="post">
        <img src="plant-pothos.svg" alt="" width="240" height="240">
        <h3><a href="/blog/esquejes-de-pothos">Esquejes de pothos en agua, paso a paso</a></h3>
        <p class="post-excerpt">Un nudo, un frasco y luz indirecta. En tres semanas tendrás raíces de cinco centímetros.</p>
        <ul class="tags" aria-label="Etiquetas">
          <li><a href="/blog/etiquetas/esquejes">esquejes</a></li>
          <li><a href="/blog/etiquetas/principiantes">principiantes</a></li>
          <li><a href="/blog/etiquetas/interior">interior</a></li>
        </ul>
        <div class="byline">
          <img src="avatar-2.svg" alt="" width="28" height="28">
          <p><a href="/blog/autoras/laura-mendez">Laura Méndez</a> <span class="meta"><time datetime="2026-10-03">3 oct.</time> · 4 min</span></p>
        </div>
      </li>
      <li class="post">
        <img src="plant-sansevieria.svg" alt="" width="240" height="240">
        <h3><a href="/blog/plantas-para-oficina">Seis plantas que aguantan una oficina sin ventanas y el aire acondicionado todo el día</a></h3>
        <p class="post-excerpt">Probamos durante un año en nuestra propia oficina. Estas sobrevivieron.</p>
        <ul class="tags" aria-label="Etiquetas">
          <li><a href="/blog/etiquetas/oficina">oficina</a></li>
        </ul>
        <div class="byline">
          <img src="avatar-1.svg" alt="" width="28" height="28">
          <p><a href="/blog/autoras/marta-garcia">Marta García</a> <span class="meta"><time datetime="2026-09-28">28 sep.</time> · 6 min</span></p>
        </div>
      </li>
    </ul>
  </section>

  <nav class="pagination" aria-label="Más artículos">
    <a href="/blog?pagina=2">Artículos anteriores →</a>
  </nav>

  <aside class="newsletter" aria-labelledby="newsletter-title">
    <div class="newsletter-text">
      <h2 id="newsletter-title">Una guía cada martes</h2>
      <p>Sin publicidad. Te puedes dar de baja con un clic.</p>
    </div>
    <form class="newsletter-form" action="/boletin" method="post">
      <label class="newsletter-label" for="newsletter-email">Correo electrónico</label>
      <div class="field-row">
        <input id="newsletter-email" type="email" name="email" autocomplete="email" placeholder="tu@correo.mx" required>
        <button>Suscribirme</button>
      </div>
    </form>
  </aside>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Portada de un blog
   - Destacado: media object que se apila (imagen con base 12rem, texto con
     base 18rem y flex-grow 999). La imagen va primero en el HTML porque es
     decorativa (alt=""): el título sigue siendo lo primero que se lee.
   - Tarjetas: rejilla sin media queries; cada tarjeta es una columna y las
     etiquetas se van al fondo con margin-top: auto, así las líneas de autor
     quedan alineadas entre tarjetas.
   - Línea de autor: avatar rígido, nombre y metadatos que se parten en líneas.
   - Suscripción: dos piezas que se apilan (texto y formulario) y dentro del
     formulario, el patrón de campo y botón.
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

  img {
    display: block;
    max-width: 100%;
    height: auto;
  }

  input,
  button {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-text: #1e293b;
    --color-muted: #475569;
    --color-border: #e2e8f0;
    --color-surface: #ffffff;
    --color-soft: #f0fdf4;
    --color-brand: #166534;
    --color-brand-dark: #14532d;
    --color-tag: #dcfce7;
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

  a {
    color: inherit;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .blog {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    max-width: 60rem;
    margin-inline: auto;
    padding: var(--space-6) var(--space-4);
  }

  .blog-header h1 {
    font-size: clamp(1.6rem, 1.2rem + 2vw, 2.2rem);
    line-height: 1.15;
  }

  .blog-header p {
    max-width: 36rem;
    color: var(--color-muted);
  }

  /* ─── Destacado ─── */
  .featured {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-4) var(--space-6);
    padding: var(--space-4);
    border-radius: var(--radius);
    background: var(--color-soft);
  }

  .featured-image {
    flex: 1 1 12rem;
    max-width: 20rem;
    border-radius: calc(var(--radius) - 4px);
  }

  .featured-text {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    flex: 999 1 18rem;
  }

  .kicker {
    color: var(--color-brand);
    font-size: 0.85rem;
    font-weight: 700;
  }

  .featured h2 {
    font-size: 1.4rem;
    line-height: 1.25;
  }

  .featured h2 a,
  .post h3 a {
    text-decoration: none;
  }

  .featured h2 a:hover,
  .post h3 a:hover {
    text-decoration: underline;
  }

  /* ─── Línea de autor: avatar rígido y texto que se parte si hace falta ─── */
  .byline {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 0.85rem;
  }

  .byline img {
    flex: none;
    border-radius: 50%;
  }

  .byline a {
    font-weight: 700;
    text-decoration: none;
  }

  .meta {
    display: block;
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  /* ─── Tarjetas ─── */
  .section-title {
    margin-bottom: var(--space-3);
    font-size: 1.3rem;
  }

  .posts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    padding: 0;
    list-style: none;
  }

  .post {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    flex: 1 1 13rem;
    max-width: 20rem;
  }

  .post > img {
    width: 100%;
    border-radius: var(--radius);
  }

  .post h3 {
    font-size: 1.05rem;
    line-height: 1.3;
  }

  .post-excerpt {
    color: var(--color-muted);
    font-size: 0.9rem;
  }

  /* Las etiquetas se van al fondo: las líneas de autor quedan alineadas. */
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    margin-top: auto;
    padding: 0;
    list-style: none;
  }

  .tags a {
    display: block;
    padding: 0 var(--space-2);
    border-radius: 999px;
    background: var(--color-tag);
    color: var(--color-brand-dark);
    font-size: 0.8rem;
    text-decoration: none;
  }

  /* ─── Paginación ─── */
  .pagination {
    display: flex;
    justify-content: center;
  }

  .pagination a {
    padding: var(--space-2) var(--space-4);
    border: 2px solid var(--color-brand);
    border-radius: 999px;
    color: var(--color-brand);
    font-weight: 700;
    text-decoration: none;
  }

  /* ─── Suscripción ─── */
  .newsletter {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: var(--space-4);
    padding: var(--space-4);
    border-radius: var(--radius);
    background: var(--color-brand-dark);
    color: #ffffff;
  }

  .newsletter-text {
    flex: 1 1 14rem;
  }

  .newsletter-text h2 {
    font-size: 1.2rem;
  }

  .newsletter-text p {
    color: #dcfce7;
  }

  .newsletter-form {
    flex: 1 1 18rem;
  }

  .newsletter-label {
    display: block;
    margin-bottom: var(--space-1);
    font-size: 0.85rem;
  }

  .field-row {
    display: flex;
    gap: var(--space-2);
  }

  .field-row input {
    flex: 1;
    min-width: 0;
    padding: var(--space-2) var(--space-3);
    border: 0;
    border-radius: 999px;
  }

  .field-row button {
    flex: none;
    padding: var(--space-2) var(--space-4);
    border: 0;
    border-radius: 999px;
    background: #bbf7d0;
    color: var(--color-brand-dark);
    font-weight: 700;
    cursor: pointer;
  }

  .newsletter :focus-visible {
    outline-color: #fef08a;
  }
}
```
