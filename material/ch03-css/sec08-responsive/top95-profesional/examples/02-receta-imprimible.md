---
example_description: "Una receta que se usa en el móvil, en la pantalla de la cocina y en papel: ingredientes con casillas de objetivo grande en pantallas táctiles, columna de ingredientes pegada desde 48rem, y una hoja de impresión completa (@page, una columna, sin menús ni comentarios, sin cortes a mitad de paso y con la dirección de la receta)"
example_tags: "css|profesional|responsive|print|any-pointer|sticky|receta"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="site-header">
  <a class="site-header__logo" href="/">Recetas de la Abuela</a>
  <nav class="site-header__nav" aria-label="Principal"><a href="/recetas">Recetas</a> · <a href="/temporada">De temporada</a> · <a href="/contacto">Contacto</a></nav>
</header>

<main class="recipe">
  <header class="recipe__header">
    <p class="recipe__kicker">Antojitos · Ciudad de México</p>
    <h1>Tamales de rajas con queso</h1>
    <p class="recipe__intro">Los de la merienda de los domingos: masa batida con manteca hasta que flota en agua, rajas de poblano asado y queso Oaxaca.</p>
    <dl class="recipe__facts">
      <div><dt>Preparación</dt><dd>1 h 30 min</dd></div>
      <div><dt>Cocción</dt><dd>1 h</dd></div>
      <div><dt>Rinde</dt><dd>20 tamales</dd></div>
    </dl>
    <p class="recipe__print-hint">Para imprimirla, usa <kbd>⌘</kbd> <kbd>P</kbd>: la versión en papel ocupa dos hojas.</p>
  </header>

  <section class="ingredients" aria-labelledby="ingredients-title">
    <h2 id="ingredients-title">Ingredientes</h2>
    <ul>
      <li><label><input type="checkbox"> 1 kg de masa de maíz para tamales</label></li>
      <li><label><input type="checkbox"> 300 g de manteca de cerdo</label></li>
      <li><label><input type="checkbox"> 1 taza de caldo de pollo tibio</label></li>
      <li><label><input type="checkbox"> 1 cucharada de polvo para hornear</label></li>
      <li><label><input type="checkbox"> 4 chiles poblanos asados, en rajas</label></li>
      <li><label><input type="checkbox"> 400 g de queso Oaxaca deshebrado</label></li>
      <li><label><input type="checkbox"> 25 hojas de maíz remojadas</label></li>
    </ul>
  </section>

  <section class="steps" aria-labelledby="steps-title">
    <h2 id="steps-title">Preparación</h2>
    <ol>
      <li>Bate la manteca 5 minutos, hasta que esté blanca y esponjosa.</li>
      <li>Añade la masa poco a poco, alternando con el caldo y la sal. Sigue batiendo hasta que una bolita de masa flote en un vaso de agua.</li>
      <li>Incorpora el polvo para hornear con movimientos suaves.</li>
      <li>Extiende dos cucharadas de masa sobre cada hoja, pon rajas y queso en el centro y dobla.</li>
      <li>Acomoda los tamales de pie en la vaporera y cuécelos tapados una hora. Están listos cuando la hoja se despega sola.</li>
    </ol>
  </section>

  <aside class="comments" aria-labelledby="comments-title">
    <h2 id="comments-title">Comentarios (12)</h2>
    <p><strong>Rosa M.:</strong> Con queso de hebra quedan igual de ricos. ¡Gracias!</p>
  </aside>

  <footer class="recipe__source">Receta de Recetas de la Abuela · <span class="recipe__url">recetasdelaabuela.mx/tamales-de-rajas</span></footer>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Receta imprimible
   - Pantalla, mobile-first: todo en una columna, en orden de lectura.
     Desde 48rem, ingredientes a la izquierda (pegados al hacer scroll, para
     tenerlos a la vista mientras se cocina) y pasos a la derecha.
   - Con el dedo (any-pointer: coarse), las casillas y sus etiquetas crecen
     hasta 44px de alto: se marcan con las manos llenas de masa.
   - Papel (@media print): una columna, letra en puntos, nada de menús,
     botones ni comentarios; los pasos y la lista de ingredientes no se
     parten entre dos hojas; al pie, la dirección de la receta. @page define
     los márgenes de la hoja (es la caja de la PÁGINA impresa).
   - Tipografía fluida con los tokens de la lección 3.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components, layout, print;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  input { font: inherit; }
}

@layer tokens {
  :root {
    --color-text: #292524;
    --color-muted: #57534e;
    --color-accent: #b45309;
    --color-surface: #fffbeb;
    --color-rule: #e7e5e4;
    --step--1: clamp(0.8333rem, 0.7727rem + 0.303vw, 1rem);
    --step-0: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --step-1: clamp(1.2rem, 1.0682rem + 0.6591vw, 1.5625rem);
    --step-3: clamp(1.728rem, 1.4686rem + 1.2971vw, 2.4414rem);
    --space-xs: clamp(0.75rem, 0.6818rem + 0.3409vw, 0.9375rem);
    --space-s: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --space-m: clamp(1.5rem, 1.3636rem + 0.6818vw, 1.875rem);
    --space-s-l: clamp(1rem, 0.4545rem + 2.7273vw, 2.5rem);
  }
}

@layer base {
  body {
    background: #ffffff;
    color: var(--color-text);
    font-family: system-ui, sans-serif;
    font-size: var(--step-0);
    line-height: 1.5;
  }

  h1, h2 { font-family: Georgia, serif; line-height: 1.15; text-wrap: balance; }
  h1 { font-size: var(--step-3); }
  h2 { margin-bottom: var(--space-xs); font-size: var(--step-1); }
  a { color: var(--color-accent); }
  :focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
}

@layer components {
  .site-header {
    display: flex;
    flex-wrap: wrap;
    gap: 4px var(--space-s);
    justify-content: space-between;
    padding: var(--space-xs) var(--space-s-l);
    border-bottom: 1px solid var(--color-rule);
    font-size: var(--step--1);
  }

  .site-header__logo { color: var(--color-text); font-weight: 700; text-decoration: none; }

  .recipe__header { display: grid; gap: var(--space-xs); }
  .recipe__kicker { color: var(--color-accent); font-size: var(--step--1); font-weight: 700; text-transform: uppercase; }
  .recipe__intro { max-inline-size: 60ch; color: var(--color-muted); }

  .recipe__facts { display: flex; flex-wrap: wrap; gap: var(--space-xs) var(--space-m); }
  .recipe__facts dt { color: var(--color-muted); font-size: var(--step--1); }
  .recipe__facts dd { margin: 0; font-weight: 700; }
  .recipe__print-hint { color: var(--color-muted); font-size: var(--step--1); }

  .ingredients { padding: var(--space-s); border-radius: 12px; background: var(--color-surface); }
  .ingredients ul { display: grid; gap: 4px; padding: 0; list-style: none; }
  .ingredients label { display: flex; gap: 0.5em; align-items: baseline; }
  .ingredients input { accent-color: var(--color-accent); }

  /* Un dedo en la pantalla de la cocina: objetivos de 44px. */
  @media (any-pointer: coarse) {
    .ingredients label { align-items: center; min-height: 44px; }
    .ingredients input { width: 1.4em; height: 1.4em; }
  }

  .steps ol { display: grid; gap: var(--space-s); padding-inline-start: 1.5em; }
  .steps li { max-inline-size: 65ch; }
  .steps li::marker { color: var(--color-accent); font-family: Georgia, serif; font-weight: 700; }

  .comments { padding-top: var(--space-s); border-top: 1px solid var(--color-rule); font-size: var(--step--1); }
  .recipe__source { color: var(--color-muted); font-size: var(--step--1); }
}

@layer layout {
  .recipe {
    display: grid;
    gap: var(--space-m);
    max-width: 64rem;
    padding: var(--space-s-l);
  }

  @media (width >= 48rem) {
    .recipe {
      grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
      grid-template-areas:
        "header header"
        "ingredients steps"
        "ingredients comments"
        "source source";
      align-items: start;
    }

    .recipe__header { grid-area: header; }
    .ingredients { grid-area: ingredients; position: sticky; top: var(--space-s); }
    .steps { grid-area: steps; }
    .comments { grid-area: comments; }
    .recipe__source { grid-area: source; }
  }
}

/* LA HOJA DE PAPEL. Va en su propia capa, la última: gana a todo lo
   anterior sin subir la especificidad. */
@layer print {
  @media print {
    body { color: #000000; font-family: Georgia, serif; font-size: 11pt; line-height: 1.4; }
    .site-header, .recipe__print-hint, .comments { display: none; }

    .recipe { display: block; max-width: none; padding: 0; }
    .recipe > * + * { margin-top: 12pt; }
    .recipe__intro, .recipe__facts dt, .recipe__source { color: #000000; }

    /* El fondo crema no se imprime (y no hace falta): un borde fino. */
    .ingredients { position: static; padding: 8pt; border: 0.5pt solid #000000; background: none; break-inside: avoid; }
    .ingredients ul { grid-template-columns: 1fr 1fr; }
    h2 { break-after: avoid; }
    .steps li { break-inside: avoid; }

    .recipe__source { padding-top: 6pt; border-top: 0.5pt solid #000000; }
  }
}

/* Los márgenes de la hoja: @page va fuera de las capas. */
@page {
  margin: 1.5cm;
}
```
