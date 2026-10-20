---
example_description: "Una receta de enchiladas verdes: título sobre la foto con capas grid, datos rápidos en auto-fit, ingredientes con cantidad e ingrediente alineados por subgrid y pasos numerados, en dos columnas que se apilan solas"
example_tags: "css|profesional|grid|subgrid|capas|auto-fit|receta"
example_stage: professional
example_importance: important
---

# HTML

```html
<article class="recipe">
  <header class="recipe-hero">
    <div class="recipe-photo" role="img" aria-label="Enchiladas verdes en un plato blanco, con crema, queso fresco y cebolla morada"></div>
    <div class="recipe-title">
      <p class="kicker">Cocina mexicana · Plato fuerte</p>
      <h1>Enchiladas verdes de pollo</h1>
      <p>La salsa de tomate verde se hace en diez minutos y aguanta tres días en el refrigerador.</p>
    </div>
  </header>

  <dl class="facts">
    <div><dt>Preparación</dt><dd>20 min</dd></div>
    <div><dt>Cocción</dt><dd>25 min</dd></div>
    <div><dt>Porciones</dt><dd>4</dd></div>
    <div><dt>Dificultad</dt><dd>Fácil</dd></div>
  </dl>

  <div class="recipe-body">
    <section class="ingredients" aria-labelledby="ingredients-title">
      <h2 id="ingredients-title">Ingredientes</h2>
      <ul>
        <li><span class="qty">500 g</span> <span>tomate verde, sin cáscara</span></li>
        <li><span class="qty">2</span> <span>chiles serranos</span></li>
        <li><span class="qty">¼</span> <span>de cebolla blanca</span></li>
        <li><span class="qty">1 diente</span> <span>de ajo</span></li>
        <li><span class="qty">12</span> <span>tortillas de maíz</span></li>
        <li><span class="qty">2 tazas</span> <span>de pollo cocido y deshebrado</span></li>
        <li><span class="qty">½ taza</span> <span>de crema y queso fresco al gusto</span></li>
      </ul>
    </section>

    <section class="steps" aria-labelledby="steps-title">
      <h2 id="steps-title">Preparación</h2>
      <ol>
        <li><span class="step-n" aria-hidden="true">1</span><p>Hierve los tomates, los chiles, la cebolla y el ajo durante 8 minutos, hasta que los tomates cambien de color.</p></li>
        <li><span class="step-n" aria-hidden="true">2</span><p>Licúa todo con media taza del agua de cocción y una pizca de sal.</p></li>
        <li><span class="step-n" aria-hidden="true">3</span><p>Fríe la salsa en una cucharada de aceite, a fuego medio, 5 minutos.</p></li>
        <li><span class="step-n" aria-hidden="true">4</span><p>Pasa cada tortilla por aceite caliente unos segundos, rellénala de pollo y enróllala.</p></li>
        <li><span class="step-n" aria-hidden="true">5</span><p>Báñalas con la salsa y sirve con crema, queso y cebolla.</p></li>
      </ol>
    </section>
  </div>

  <aside class="tip" aria-labelledby="tip-title">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.7 1 1.5 1 2.5h6c0-1 .2-1.8 1-2.5A6 6 0 0 0 12 3Z"/></svg>
    <h2 id="tip-title">Truco</h2>
    <p>Si la salsa queda ácida, añade una pizca de azúcar mientras se fríe.</p>
  </aside>
</article>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Receta
   - Portada: foto y título en la misma celda; el título, abajo a la izquierda
     sobre una caja clara. La celda crece si el título ocupa más.
   - Datos rápidos: auto-fit; cada dato es una tarjeta con la etiqueta encima.
   - Cuerpo: ingredientes y pasos en columnas auto-fit de al menos 15rem: lado
     a lado en pantallas anchas, uno debajo de otro en el móvil.
   - Ingredientes: dos columnas (cantidad e ingrediente) compartidas con subgrid
     por todos los li, así las cantidades forman una columna alineada.
   - Pasos y truco: el número o el icono, a lo alto de lo que tienen al lado.
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
}

@layer tokens {
  :root {
    --color-text: #1c1917;
    --color-muted: #57534e;
    --color-paper: #ffffff;
    --color-soft: #f0fdf4;
    --color-accent: #15803d;
    --color-accent-dark: #14532d;
    --color-warm: #fef3c7;
    --color-line: #e7e5e4;
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
    background: var(--color-paper);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.55;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .recipe {
    display: grid;
    gap: var(--space-6);
    max-width: 56rem;
    margin-inline: auto;
    padding: var(--space-4);
  }

  /* ─── Portada: capas ─── */
  .recipe-hero {
    display: grid;
    min-height: 16rem;
    overflow: hidden;
    border-radius: var(--radius);
  }

  .recipe-hero > * {
    grid-area: 1 / 1;
  }

  .recipe-photo {
    background: #7c2d12 url(dish-enchiladas.svg) center / cover;
  }

  .recipe-title {
    display: grid;
    gap: var(--space-1);
    justify-self: start;
    align-self: end;
    max-width: 30rem;
    margin: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius);
    background: rgb(255 255 255 / 0.95);
  }

  .kicker {
    color: var(--color-accent);
    font-size: 0.8rem;
    font-weight: 700;
  }

  .recipe-title h1 {
    font-size: clamp(1.5rem, 1.1rem + 2vw, 2.2rem);
    line-height: 1.15;
  }

  .recipe-title p:last-child {
    color: var(--color-muted);
  }

  /* ─── Datos rápidos ─── */
  .facts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 7rem), 1fr));
    gap: var(--space-2);
  }

  .facts div {
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius);
    background: var(--color-soft);
  }

  .facts dt {
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .facts dd {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
  }

  /* ─── Cuerpo ─── */
  .recipe-body {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
    align-items: start;
    gap: var(--space-6);
  }

  .recipe-body h2,
  .tip h2 {
    margin-bottom: var(--space-3);
    font-size: 1.2rem;
  }

  /* Ingredientes: cantidad (a la medida de la más ancha) e ingrediente. */
  .ingredients ul {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    column-gap: var(--space-3);
    padding: 0;
    list-style: none;
  }

  .ingredients li {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--color-line);
  }

  .qty {
    justify-self: end;
    color: var(--color-accent-dark);
    font-weight: 700;
  }

  /* Pasos: número en su columna, texto en la otra. */
  .steps ol {
    display: grid;
    gap: var(--space-4);
    padding: 0;
    list-style: none;
  }

  .steps li {
    display: grid;
    grid-template-columns: 2rem minmax(0, 1fr);
    align-items: start;
    gap: var(--space-3);
  }

  .step-n {
    display: grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var(--color-accent);
    color: #ffffff;
    font-weight: 700;
  }

  /* ─── Truco: icono a lo alto del título y el texto ─── */
  .tip {
    display: grid;
    grid-template-columns: 2rem minmax(0, 1fr);
    column-gap: var(--space-3);
    padding: var(--space-4);
    border-radius: var(--radius);
    background: var(--color-warm);
  }

  .tip svg {
    grid-row: span 2;
    width: 2rem;
    fill: none;
    stroke: #78350f;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .tip h2 {
    margin-bottom: 0;
    font-size: 1rem;
  }
}
```
