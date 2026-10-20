---
example_description: "Un sistema de temas con dos niveles de tokens (paleta y significado) escritos con light-dark(), un selector Sistema/Claro/Oscuro/Más contraste con :has() que solo cambia color-scheme o unos pocos tokens, prefers-contrast: more y forced-colors: active resueltos, y una muestra de componentes que los usa"
example_tags: "css|profesional|responsive|light-dark|color-scheme|prefers-contrast|forced-colors|tokens|has"
example_stage: professional
example_importance: critical
---

# HTML

```html
<header class="topbar">
  <p class="topbar__brand">Biblioteca Vasconcelos · Préstamos</p>
  <fieldset class="theme-picker">
    <legend>Tema</legend>
    <label><input type="radio" name="theme" value="system" checked> Sistema</label>
    <label><input type="radio" name="theme" value="light"> Claro</label>
    <label><input type="radio" name="theme" value="dark"> Oscuro</label>
    <label><input type="radio" name="theme" value="contrast"> Más contraste</label>
  </fieldset>
</header>

<main class="page">
  <h1>Tus préstamos</h1>

  <p class="alert is-warning" role="status"><strong>Atención:</strong> <cite>Pedro Páramo</cite> vence mañana, 15 de octubre.</p>

  <ul class="loans">
    <li class="loan">
      <h2><cite>Pedro Páramo</cite></h2>
      <p class="loan__meta">Juan Rulfo · vence el 15 de octubre</p>
      <span class="badge is-late">Vence mañana</span>
      <a class="button is-primary" href="/prestamos/pedro-paramo/renovar">Renovar</a>
    </li>
    <li class="loan">
      <h2><cite>Balún Canán</cite></h2>
      <p class="loan__meta">Rosario Castellanos · vence el 28 de octubre</p>
      <span class="badge">A tiempo</span>
      <a class="button" href="/prestamos/balun-canan">Ver ficha</a>
    </li>
  </ul>

  <form class="search" role="search" action="/catalogo">
    <label for="q">Buscar en el catálogo</label>
    <div class="search__row"><input id="q" name="q" type="search" placeholder="Título, autor o tema"><button class="button is-primary" type="submit">Buscar</button></div>
  </form>

  <section class="labels" aria-labelledby="labels-title">
    <h2 id="labels-title">Etiquetas de color de las estanterías</h2>
    <ul>
      <li><span class="swatch" style="--swatch: #b91c1c"></span> Novela</li>
      <li><span class="swatch" style="--swatch: #1d4ed8"></span> Ciencia</li>
      <li><span class="swatch" style="--swatch: #15803d"></span> Infantil</li>
    </ul>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Sistema de temas
   - Dos niveles de tokens: la PALETA (colores con nombre de color) y los
     tokens de SIGNIFICADO (superficie, texto, acento…), que eligen de la
     paleta con light-dark(). Los componentes solo usan los segundos.
   - Cambiar de tema es cambiar color-scheme en la raíz: «light dark» sigue
     al sistema; «light» y «dark» lo fuerzan. Sin repetir un solo color.
   - «Más contraste» y prefers-contrast: more cambian tres tokens de
     significado. El bloque se repite (CSS no puede juntar una media query y
     un selector en una regla); con un mixin de Sass se escribiría una vez.
   - forced-colors: active (temas de contraste de Windows): bordes
     transparentes que reaparecen y forced-color-adjust: none en las
     muestras, cuyo color es información (y además tienen su nombre).
   - La elección no se guarda al recargar: eso es JavaScript (capítulo 6).
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, themes, base, components;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  input, button { font: inherit; }
}

@layer tokens {
  :root {
    /* Paleta */
    --stone-50: #fafaf9;
    --stone-100: #f5f5f4;
    --stone-300: #d6d3d1;
    --stone-600: #57534e;
    --stone-700: #44403c;
    --stone-800: #292524;
    --stone-900: #1c1917;
    --stone-950: #0c0a09;
    --amber-200: #fde68a;
    --amber-800: #92400e;
    --teal-300: #5eead4;
    --teal-800: #115e59;
    --rose-300: #fda4af;
    --rose-800: #9f1239;

    /* Significado */
    color-scheme: light dark;
    --color-page: light-dark(var(--stone-50), var(--stone-950));
    --color-surface: light-dark(#ffffff, var(--stone-900));
    --color-text: light-dark(var(--stone-900), var(--stone-100));
    --color-muted: light-dark(var(--stone-600), var(--stone-300));
    --color-border: light-dark(var(--stone-300), var(--stone-700));
    --color-accent: light-dark(var(--teal-800), var(--teal-300));
    --color-on-accent: light-dark(#ffffff, var(--stone-950));
    --color-warning-bg: light-dark(#fef3c7, #3b2a06);
    --color-warning-text: light-dark(var(--amber-800), var(--amber-200));
    --color-late: light-dark(var(--rose-800), var(--rose-300));
  }
}

@layer themes {
  /* El selector: solo cambia color-scheme. */
  :root:has(input[name="theme"][value="light"]:checked) { color-scheme: light; }
  :root:has(input[name="theme"][value="dark"]:checked) { color-scheme: dark; }

  /* Más contraste (elegido, o pedido por el sistema): texto secundario y
     bordes iguales al texto, acento más oscuro (o más claro). */
  :root:has(input[name="theme"][value="contrast"]:checked) {
    --color-muted: var(--color-text);
    --color-border: var(--color-text);
    --color-accent: light-dark(#0b3b38, #99f6e4);
  }

  @media (prefers-contrast: more) {
    :root {
      --color-muted: var(--color-text);
      --color-border: var(--color-text);
      --color-accent: light-dark(#0b3b38, #99f6e4);
    }
  }
}

@layer base {
  body { background: var(--color-page); color: var(--color-text); font-family: system-ui, sans-serif; line-height: 1.45; }
  h1 { font-size: 1.4rem; }
  h2 { font-size: 1rem; }
  a { color: var(--color-accent); }
  :focus-visible { outline: 3px solid var(--color-accent); outline-offset: 2px; }
}

@layer components {
  .topbar { display: flex; flex-wrap: wrap; gap: 8px 24px; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--color-border); background: var(--color-surface); }
  .topbar__brand { font-weight: 700; }
  .theme-picker { display: flex; flex-wrap: wrap; gap: 4px 12px; padding: 4px 10px; border: 1px solid var(--color-border); border-radius: 8px; font-size: 0.85rem; }
  .theme-picker input { accent-color: var(--color-accent); }

  .page { display: grid; gap: 16px; max-width: 44rem; padding: 16px; }

  .alert { padding: 10px 12px; border: 2px solid transparent; border-radius: 8px; background: var(--color-warning-bg); color: var(--color-warning-text); }

  .loans { display: grid; gap: 10px; padding: 0; list-style: none; }

  .loan {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 4px 12px;
    align-items: center;
    padding: 12px;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    background: var(--color-surface);
  }

  .loan h2, .loan__meta { grid-column: 1; }
  .loan__meta { color: var(--color-muted); font-size: 0.85rem; }
  .loan .badge { grid-column: 2; grid-row: 1; justify-self: end; }
  .loan .button { grid-column: 2; grid-row: 2; }

  .badge { padding: 1px 8px; border: 1px solid var(--color-border); border-radius: 999px; font-size: 0.75rem; }
  .badge.is-late { border-color: currentColor; color: var(--color-late); font-weight: 700; }

  /* Botones con un borde siempre: transparente en los primarios, que en
     forced-colors pasa a ser del color del sistema y dibuja el botón. */
  .button {
    display: inline-block;
    padding: 6px 14px;
    border: 2px solid var(--color-accent);
    border-radius: 999px;
    background: transparent;
    color: var(--color-accent);
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
  }

  .button.is-primary { border-color: transparent; background: var(--color-accent); color: var(--color-on-accent); }

  .search { display: grid; gap: 4px; }
  .search__row { display: flex; flex-wrap: wrap; gap: 8px; }
  .search input { flex: 1 1 12rem; padding: 6px 10px; border: 1px solid var(--color-muted); border-radius: 8px; background: var(--color-surface); color: var(--color-text); }

  .labels ul { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-top: 6px; padding: 0; list-style: none; }
  .swatch { display: inline-block; width: 1em; height: 1em; border: 1px solid var(--color-border); border-radius: 3px; background: var(--swatch); vertical-align: -2px; }

  @media (any-pointer: coarse) {
    .button, .theme-picker label { min-height: 44px; display: inline-flex; align-items: center; }
  }

  @media (forced-colors: active) {
    .swatch { forced-color-adjust: none; border-color: CanvasText; }
  }
}
```
