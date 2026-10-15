---
example_description: "Las tarjetas de un recetario con toda la arquitectura del módulo: capas reset, base, components y utilities declaradas en una línea; el componente en BEM, anidado a un nivel (estados, modificador, contexto y una container query); la base con :where(); y dos utilidades que ganan sin !important"
example_tags: "css|integracion|arquitectura|anidamiento|bem|layer|utilidades|container-queries"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<main class="cookbook">
  <h1>Recetario de la abuela Chela</h1>
  <p class="cookbook__intro">Cuatro recetas de la semana. Pasa el ratón o recórrelas con <kbd>Tab</kbd>.</p>
  <ul class="cookbook__grid" role="list">
    <li>
      <article class="recipe-card">
        <p class="recipe-card__time">35 min</p>
        <h2 class="recipe-card__title"><a class="recipe-card__link" href="/recetas/sopa-de-fideo">Sopa de fideo</a></h2>
        <p class="recipe-card__text">Con jitomate asado y un toque de chipotle.</p>
        <ul class="recipe-card__tags cluster" role="list"><li>Caldo</li><li>Para 4</li></ul>
      </article>
    </li>
    <li>
      <article class="recipe-card recipe-card--new">
        <p class="recipe-card__time">1 h 20 min</p>
        <h2 class="recipe-card__title"><a class="recipe-card__link" href="/recetas/enchiladas-verdes">Enchiladas verdes</a></h2>
        <p class="recipe-card__text">Tortillas pasadas por aceite, salsa de tomate verde y crema.</p>
        <ul class="recipe-card__tags cluster" role="list"><li>Nueva</li><li>Para 6</li></ul>
      </article>
    </li>
  </ul>
  <aside class="sidebar" aria-label="Receta del día">
    <article class="recipe-card">
      <p class="recipe-card__time">15 min</p>
      <h2 class="recipe-card__title"><a class="recipe-card__link" href="/recetas/agua-de-jamaica">Agua de jamaica</a></h2>
      <p class="recipe-card__text visually-hidden">Flor de jamaica, agua y azúcar.</p>
    </article>
  </aside>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Recetario
   - Capas en UNA línea: de menos a más prioridad. Las utilidades, al final,
     ganan sin !important.
   - El componente (.recipe-card) en BEM: el bloque anidado a un nivel con
     sus estados, su modificador, su contexto y su container query; los
     elementos, como reglas planas de una clase.
   - La base usa etiquetas y :where(): (0,0,1) o menos.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, base, components, utilities;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  :where(dialog, [popover]) { margin: auto; }
  body { line-height: 1.5; }
  :where(ul, ol)[role="list"] { padding: 0; list-style: none; }
  h1, h2 { text-wrap: balance; }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    color: #0f172a;
    background: #f8fafc;
  }

  h1 { font-size: 1.4rem; }
  :where(a) { color: #0f766e; }

  :focus-visible {
    outline: 3px solid #1d4ed8;
    outline-offset: 2px;
  }
}

@layer components {
  .cookbook {
    display: grid;
    grid-template-columns: 1fr 9rem;
    gap: 12px 16px;
    padding: 16px;

    > h1,
    > .cookbook__intro { grid-column: 1 / -1; }
  }

  .cookbook__intro { color: #475569; font-size: 0.85rem; }

  .cookbook__grid,
  .sidebar {
    container-type: inline-size;
  }

  .cookbook__grid { display: grid; gap: 10px; }

  .recipe-card {
    position: relative;
    display: grid;
    gap: 4px;
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    background: #ffffff;

    @media (prefers-reduced-motion: no-preference) {
      transition: border-color 150ms, box-shadow 150ms;
    }

    &:hover {
      border-color: #0f766e;
      box-shadow: 0 4px 12px rgb(15 23 42 / 0.12);
    }

    &:has(.recipe-card__link:focus-visible) {
      outline: 3px solid #1d4ed8;
      outline-offset: 2px;
    }

    .sidebar & { padding: 8px; }

    @container (width >= 17rem) {
      grid-template-columns: 5.5rem 1fr;

      .recipe-card__time { grid-row: span 3; }
    }
  }

  .recipe-card--new { border-left: 4px solid #c2410c; }

  .recipe-card__time { color: #475569; font-size: 0.8rem; font-weight: 700; }
  .recipe-card__title { font-size: 1rem; }

  .recipe-card__link {
    color: inherit;
    text-decoration: none;

    &::after { content: ""; position: absolute; inset: 0; }
    &:focus-visible { outline: none; }
  }

  .recipe-card__text { font-size: 0.85rem; }

  .recipe-card__tags li {
    padding: 0 8px;
    border-radius: 999px;
    background: #f0fdfa;
    color: #115e59;
    font-size: 0.75rem;
  }
}

@layer utilities {
  .cluster { display: flex; flex-wrap: wrap; gap: 6px; }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
```
