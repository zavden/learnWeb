---
example_description: "La receta del pan de muerto de una panadería: logotipo en Pacifico sin negrita falsa, título en Literata, cantidades con fracciones tipográficas alineadas en su columna, unidades que no se separan de su cifra y pasos numerados con marcadores a medida"
example_tags: "css|profesional|tipografia|font-variant-numeric|fracciones|nbsp|font-synthesis|receta"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="site-header">
  <a class="logo" href="/">La Espiga</a>
  <nav aria-label="Principal">
    <a href="/recetas" aria-current="page">Recetas</a>
    <a href="/tienda">Tienda</a>
  </nav>
</header>

<main class="recipe">
  <header class="recipe-header">
    <p class="kicker">Temporada de muertos</p>
    <h1>Pan de muerto con azahar</h1>
    <p class="lead">La receta de la casa: miga suave, aroma de naranja y los «huesitos» dorados por encima.</p>
  </header>

  <dl class="facts">
    <div><dt>Preparación</dt><dd>40&nbsp;min</dd></div>
    <div><dt>Reposo</dt><dd>3&nbsp;h</dd></div>
    <div><dt>Horno</dt><dd>180&nbsp;°C</dd></div>
    <div><dt>Rinde</dt><dd>8&nbsp;piezas</dd></div>
  </dl>

  <section aria-labelledby="ingredients-title">
    <h2 id="ingredients-title">Ingredientes</h2>
    <ul class="ingredients">
      <li><span class="qty">3 1/2</span> <span>tazas de harina de trigo</span></li>
      <li><span class="qty">1/2</span> <span>taza de leche tibia</span></li>
      <li><span class="qty">1/2</span> <span>taza de azúcar</span></li>
      <li><span class="qty">10</span> <span>g de levadura seca</span></li>
      <li><span class="qty">3</span> <span>huevos y 2 yemas</span></li>
      <li><span class="qty">125</span> <span>g de mantequilla a temperatura ambiente</span></li>
      <li><span class="qty">1</span> <span>cucharada de agua de azahar y la ralladura de una naranja</span></li>
      <li><span class="qty">1/4</span> <span>de cucharadita de sal</span></li>
    </ul>
  </section>

  <section aria-labelledby="steps-title">
    <h2 id="steps-title">Preparación</h2>
    <ol class="steps">
      <li>Disuelve la levadura en la leche tibia con una cucharada de azúcar y espera diez minutos, hasta que haga espuma.</li>
      <li>Mezcla la harina, el resto del azúcar y la sal. Añade los huevos, las yemas, el azahar, la ralladura y la levadura, y amasa diez minutos.</li>
      <li>Incorpora la mantequilla poco a poco y amasa hasta que la masa esté lisa y no se pegue a las manos.</li>
      <li>Deja reposar dos horas tapada, forma las piezas con sus huesitos y deja reposar una hora más antes de hornear 25&nbsp;minutos.</li>
    </ol>
  </section>

  <aside class="tip" aria-labelledby="tip-title">
    <h2 id="tip-title">Truco de la casa</h2>
    <p>Pinta las piezas con mantequilla derretida en cuanto salgan del horno y espolvorea el azúcar enseguida: así se queda pegada.</p>
  </aside>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Receta
   - Logotipo en Pacifico, que solo tiene peso 400: font-weight: 400 y
     font-synthesis: none, para que nunca salga una negrita inventada.
   - Títulos en Literata; el texto de la receta, en la fuente del sistema, que
     se lee bien en la cocina, de lejos.
   - Cantidades: una columna fija alineada al final, cifras tabulares y
     fracciones diagonales (la característica «frac» de Literata): «1/2» se
     dibuja como fracción, pero el texto sigue siendo «1/2».
   - Unidades con &nbsp;: «180 °C» o «40 min» nunca se separan.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components;

@font-face {
  font-family: "Literata";
  src: url("fonts/literata-normal.woff2") format("woff2");
  font-weight: 200 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Pacifico";
  src: url("fonts/pacifico-normal.woff2") format("woff2");
  font-weight: 400;
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
    --font-display: Literata, Georgia, serif;
    --font-text: system-ui, sans-serif;
    --font-brand: Pacifico, cursive;
    --color-text: #1c1917;
    --color-muted: #57534e;
    --color-brand: #9a3412;
    --color-soft: #fff7ed;
    --color-line: #fed7aa;
    --color-focus: #1d4ed8;
  }
}

@layer base {
  body {
    color: var(--color-text);
    font-family: var(--font-text);
    line-height: 1.5;
  }

  a:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }

  h1,
  h2 {
    font-family: var(--font-display);
    line-height: 1.2;
    text-wrap: balance;
  }
}

@layer components {
  /* ─── Cabecera ─── */
  .site-header {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    align-items: baseline;
    justify-content: space-between;
    padding: 8px 16px;
    border-block-end: 2px solid var(--color-line);
  }

  .logo {
    color: var(--color-brand);
    font-family: var(--font-brand);
    font-size: 1.75rem;
    font-weight: 400;
    font-synthesis: none;
    text-decoration: none;
  }

  .site-header nav {
    display: flex;
    gap: 16px;
  }

  .site-header nav a {
    color: var(--color-text);
    text-decoration: none;
  }

  .site-header [aria-current="page"] {
    text-decoration: underline;
    text-decoration-color: var(--color-brand);
    text-decoration-thickness: 2px;
    text-underline-offset: 0.35em;
  }

  /* ─── Receta ─── */
  .recipe {
    display: grid;
    gap: 16px;
    max-inline-size: 40rem;
    margin-inline: auto;
    padding: 16px;
  }

  .recipe-header {
    display: grid;
    gap: 4px;
  }

  .kicker {
    color: var(--color-brand);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .recipe h1 {
    font-size: 2rem;
    font-weight: 750;
  }

  .lead {
    color: var(--color-muted);
    font-size: 1.1rem;
    text-wrap: pretty;
  }

  /* Datos rápidos: rótulo pequeño encima y cifra grande debajo. */
  .facts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 6.5rem), 1fr));
    gap: 8px;
  }

  .facts div {
    padding: 8px 10px;
    border-radius: 8px;
    background: var(--color-soft);
  }

  .facts dt {
    color: var(--color-muted);
    font-size: 0.7rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .facts dd {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-variant-numeric: tabular-nums;
    font-weight: 650;
  }

  .recipe h2 {
    margin-block-end: 8px;
    font-size: 1.35rem;
  }

  /* ─── Ingredientes: cantidad en su columna, alineada al final ─── */
  .ingredients {
    padding: 0;
    list-style: none;
  }

  .ingredients li {
    display: grid;
    grid-template-columns: 3.5rem minmax(0, 1fr);
    gap: 12px;
    align-items: baseline;
    padding-block: 4px;
    border-block-end: 1px solid var(--color-line);
  }

  .qty {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-variant-numeric: tabular-nums diagonal-fractions;
    font-weight: 650;
    text-align: end;
  }

  /* ─── Pasos ─── */
  .steps {
    display: grid;
    gap: 10px;
    padding-inline-start: 2em;
  }

  .steps li {
    padding-inline-start: 4px;
    text-wrap: pretty;
  }

  .steps li::marker {
    color: var(--color-brand);
    font-family: var(--font-display);
    font-variant-numeric: tabular-nums;
    font-weight: 750;
  }

  /* ─── Truco ─── */
  .tip {
    padding: 12px 16px;
    border-inline-start: 4px solid var(--color-brand);
    border-start-end-radius: 8px;      /* esquinas lógicas: las del lado final */
    border-end-end-radius: 8px;
    background: var(--color-soft);
  }

  .tip h2 {
    margin-block-end: 4px;
    font-size: 1rem;
  }
}
```
