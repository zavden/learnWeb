---
example_description: "La portada de una escuela de panadería construida con una escala tipográfica modular de razón 1,25 en custom properties: cada paso con su tamaño, su interlineado sin unidad y su espaciado, título con text-box y tamaño óptico, y cifras tabulares"
example_tags: "css|profesional|tipografia|escala-tipografica|custom-properties|text-box|font-optical-sizing|landing"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="landing">
  <section class="hero" aria-labelledby="hero-title">
    <p class="kicker">Escuela de pan La Espiga</p>
    <h1 id="hero-title">Aprende a hornear pan de verdad en tu propia cocina</h1>
    <p class="lead">Doce clases en directo con panaderas de oficio: masa madre, bollería y pan de temporada, con un horno normal y sin máquinas.</p>
    <div class="actions">
      <a class="button is-primary" href="/inscripcion">Reservar mi lugar</a>
      <a class="button" href="/temario">Ver el temario</a>
    </div>
  </section>

  <ul class="stats" aria-label="La escuela en cifras">
    <li><span class="stat-value">1,200</span> <span class="stat-label">alumnas y alumnos</span></li>
    <li><span class="stat-value">4.9</span> <span class="stat-label">de valoración media, sobre 5</span></li>
    <li><span class="stat-value">18</span> <span class="stat-label">recetas paso a paso</span></li>
  </ul>

  <section class="features" aria-labelledby="features-title">
    <h2 id="features-title">Qué incluye el curso</h2>
    <div class="feature-list">
      <article>
        <h3>Clases en directo</h3>
        <p>Dos sesiones por semana, con tiempo para preguntar mientras amasas.</p>
      </article>
      <article>
        <h3>Recetario impreso</h3>
        <p>Las dieciocho recetas, con las cantidades para una y para tres piezas.</p>
      </article>
      <article>
        <h3>Masa madre de regalo</h3>
        <p>Te enviamos un frasco de la nuestra, con veinte años de historia.</p>
      </article>
    </div>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Portada con escala tipográfica
   - Escala modular de razón 1,25 a partir de 1rem: cada paso multiplica el
     anterior por 1,25. Los tamaños son fijos (en rem, que respetan la
     preferencia de tamaño del usuario); hacerlos fluidos con clamp() y vw es
     tema del módulo de diseño responsive.
   - Cada paso tiene su pareja de interlineado (sin unidad, más apretado
     cuanto más grande) y de espaciado entre letras (negativo en los grandes,
     positivo en el rótulo en mayúsculas).
   - Títulos en Literata: su tamaño óptico (opsz) se ajusta solo a cada paso.
   - El título lleva text-box: su caja empieza en la altura de las mayúsculas,
     así el hueco con el rótulo de encima es el gap, y no el gap más el aire
     que una letra de 49px reserva sobre sus mayúsculas.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components;

@font-face {
  font-family: "Literata";
  src: url("fonts/literata-normal.woff2") format("woff2");
  font-weight: 200 900;
  font-style: normal;
  font-display: swap;
}

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
  }
}

@layer tokens {
  :root {
    /* Escala 1,25 */
    --step--1: 0.8rem;
    --step-0: 1rem;
    --step-1: 1.25rem;
    --step-2: 1.5625rem;
    --step-3: 1.953rem;
    --step-4: 2.441rem;
    --step-5: 3.052rem;

    /* Interlineados: el texto, holgado; los títulos, apretados. */
    --leading-text: 1.55;
    --leading-heading: 1.2;
    --leading-display: 1.05;

    /* Espaciado entre letras, en em. */
    --tracking-display: -0.02em;
    --tracking-caps: 0.1em;

    --font-display: Literata, Georgia, serif;
    --font-text: system-ui, sans-serif;

    --color-text: #1c1917;
    --color-muted: #57534e;
    --color-brand: #9a3412;
    --color-brand-dark: #7c2d12;
    --color-soft: #fff7ed;
    --color-focus: #1d4ed8;
  }
}

@layer base {
  body {
    color: var(--color-text);
    font-family: var(--font-text);
    font-size: var(--step-0);
    line-height: var(--leading-text);
  }

  h1,
  h2,
  h3 {
    font-family: var(--font-display);
    line-height: var(--leading-heading);
    text-wrap: balance;
  }

  p {
    text-wrap: pretty;
  }

  a:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 3px;
  }
}

@layer components {
  .landing {
    display: grid;
    gap: 32px;
    max-inline-size: 60rem;
    margin-inline: auto;
    padding: 24px 16px;
  }

  /* ─── Portada ─── */
  .hero {
    display: grid;
    gap: 16px;
    justify-items: start;
    max-inline-size: 38rem;
  }

  .kicker {
    color: var(--color-brand);
    font-size: var(--step--1);
    font-weight: 700;
    letter-spacing: var(--tracking-caps);
    text-transform: uppercase;
  }

  .hero h1 {
    font-size: var(--step-5);
    font-weight: 700;
    line-height: var(--leading-display);
    letter-spacing: var(--tracking-display);
    text-box: trim-both cap alphabetic;
  }

  .lead {
    color: var(--color-muted);
    font-size: var(--step-1);
    line-height: 1.45;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .button {
    padding: 14px 22px;
    border: 2px solid var(--color-brand-dark);
    border-radius: 999px;
    color: var(--color-brand-dark);
    font-weight: 700;
    text-decoration: none;
    text-box: trim-both cap alphabetic;
  }

  .button.is-primary {
    background: var(--color-brand-dark);
    color: #ffffff;
  }

  /* ─── Cifras ─── */
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
    gap: 12px;
    padding: 0;
    list-style: none;
  }

  .stats li {
    display: grid;
    gap: 6px;
    padding: 16px;
    border-radius: 12px;
    background: var(--color-soft);
  }

  .stat-value {
    font-family: var(--font-display);
    font-size: var(--step-4);
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    line-height: 1;
    letter-spacing: var(--tracking-display);
  }

  .stat-label {
    color: var(--color-muted);
    font-size: var(--step--1);
  }

  /* ─── Qué incluye ─── */
  .features h2 {
    margin-block-end: 12px;
    font-size: var(--step-3);
  }

  .feature-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
    gap: 16px;
  }

  .feature-list article {
    padding-block-start: 12px;
    border-block-start: 3px solid var(--color-brand);
  }

  .feature-list h3 {
    margin-block-end: 4px;
    font-size: var(--step-2);
  }
}
```
