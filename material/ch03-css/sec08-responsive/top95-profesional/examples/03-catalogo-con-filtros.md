---
example_description: "El catálogo de una tienda de láminas: por debajo de 52rem, los filtros son un popover que abre el botón «Filtrar»; desde 52rem, el mismo formulario es una columna lateral pegada. Rejilla auto-fill de productos con fotos 4:3 recortadas por su punto de interés y controles de 44px con any-pointer: coarse"
example_tags: "css|profesional|responsive|popover|media-queries|object-fit|any-pointer|tienda"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="shop-header">
  <h1>Láminas de museo</h1>
  <p class="shop-header__count">6 resultados · 2 filtros activos</p>
  <div class="toolbar">
    <button class="toolbar__filter" type="button" popovertarget="filters">Filtrar <span class="toolbar__badge" aria-hidden="true">2</span></button>
    <label class="toolbar__sort">Ordenar por
      <select name="orden" form="filters">
        <option>Novedades</option>
        <option>Precio: de menor a mayor</option>
        <option>Precio: de mayor a menor</option>
      </select>
    </label>
  </div>
</header>

<div class="catalog">
  <form id="filters" class="filters" popover action="/laminas" aria-label="Filtros">
    <fieldset>
      <legend>Tema</legend>
      <label><input type="checkbox" name="tema" value="paisaje" checked> Paisaje</label>
      <label><input type="checkbox" name="tema" value="espacio" checked> Espacio</label>
      <label><input type="checkbox" name="tema" value="mar"> Mar</label>
    </fieldset>
    <fieldset>
      <legend>Tamaño</legend>
      <label><input type="radio" name="tamano" value="30x40"> 30 × 40 cm</label>
      <label><input type="radio" name="tamano" value="40x50" checked> 40 × 50 cm</label>
      <label><input type="radio" name="tamano" value="50x70"> 50 × 70 cm</label>
    </fieldset>
    <div class="filters__actions">
      <button type="submit">Aplicar</button>
      <button class="filters__close" type="button" popovertarget="filters" popovertargetaction="hide">Cerrar</button>
    </div>
  </form>

  <ul class="products">
    <li class="product"><img src="velasco-valle-de-mexico-480.jpg" alt="Valle de México, de José María Velasco" width="480" height="330" style="--focus: 28% 55%"><h2><a href="/laminas/valle-de-mexico">Valle de México</a></h2><p>Velasco, 1877</p><p class="product__price">520 MXN</p></li>
    <li class="product"><img src="hokusai-gran-ola-480.jpg" alt="La gran ola de Kanagawa, de Hokusai" width="480" height="323" style="--focus: 30% 50%"><h2><a href="/laminas/gran-ola">La gran ola</a></h2><p>Hokusai, c. 1831</p><p class="product__price">450 MXN</p></li>
    <li class="product"><img src="tierra-apolo-17-480.jpg" alt="La Tierra vista desde el Apolo 17" width="480" height="480"><h2><a href="/laminas/canica-azul">La canica azul</a></h2><p>NASA, 1972</p><p class="product__price">390 MXN</p></li>
    <li class="product"><img src="aldrin-apolo-11-480.jpg" alt="Buzz Aldrin en la Luna" width="480" height="483" style="--focus: 50% 15%"><h2><a href="/laminas/aldrin">Paseo lunar</a></h2><p>NASA, 1969</p><p class="product__price">390 MXN</p></li>
    <li class="product"><img src="pilares-de-la-creacion-480.jpg" alt="Los Pilares de la creación, nebulosa del Águila" width="480" height="501" style="--focus: 50% 35%"><h2><a href="/laminas/pilares">Pilares de la creación</a></h2><p>NASA y ESA, 2014</p><p class="product__price">420 MXN</p></li>
    <li class="product"><img src="hokusai-gran-ola-480.jpg" alt="Detalle del monte Fuji en La gran ola" width="480" height="323" style="--focus: 66% 70%"><h2><a href="/laminas/fuji-detalle">El Fuji (detalle)</a></h2><p>Hokusai, c. 1831</p><p class="product__price">380 MXN</p></li>
  </ul>
</div>
<p class="credit">Todas las obras son de dominio público.</p>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Catálogo con filtros
   - Mobile-first: los filtros son un <form popover> que abre «Filtrar»
     (lección de HTML): se cierra al pulsar fuera, con Esc o con «Cerrar».
     El orden de lectura es el del HTML: cabecera, filtros, productos.
   - Desde 52rem (media query): el mismo formulario se muestra siempre, en
     una columna lateral pegada (sticky). Los estilos del popover cerrado son
     del navegador; las reglas del autor les ganan, y aquí se deshacen los
     que sobran (position: fixed, inset, margin, borde).
   - Productos: rejilla auto-fill sin consultas. Cada foto, en una caja 4:3
     con object-fit: cover y su punto de interés en --focus.
   - any-pointer: coarse: casillas, radios y botones de 44px de alto.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components, layout;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  img { display: block; max-width: 100%; height: auto; }
  button, input, select { font: inherit; }
}

@layer tokens {
  :root {
    --color-text: #1e293b;
    --color-muted: #475569;
    --color-accent: #1d4ed8;
    --color-surface: #f8fafc;
    --color-border: #cbd5e1;
    --radius: 10px;
    --space-xs: clamp(0.75rem, 0.6818rem + 0.3409vw, 0.9375rem);
    --space-s: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --space-s-l: clamp(1rem, 0.4545rem + 2.7273vw, 2.5rem);
  }
}

@layer base {
  body {
    padding: var(--space-s-l);
    background: #ffffff;
    color: var(--color-text);
    font-family: system-ui, sans-serif;
    line-height: 1.4;
  }

  a { color: inherit; }
  :focus-visible { outline: 3px solid var(--color-accent); outline-offset: 2px; }
}

@layer components {
  .shop-header { display: grid; gap: 4px; margin-bottom: var(--space-s); }
  .shop-header h1 { font-size: 1.5rem; }
  .shop-header__count { color: var(--color-muted); font-size: 0.85rem; }

  .toolbar { display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: center; justify-content: space-between; margin-top: 8px; }
  .toolbar__sort { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font-size: 0.85rem; }
  .toolbar select { padding: 4px 6px; border: 1px solid #64748b; border-radius: 6px; }

  .toolbar__filter,
  .filters button {
    padding: 6px 14px;
    border: 2px solid var(--color-accent);
    border-radius: 999px;
    background: #ffffff;
    color: var(--color-accent);
    font-weight: 700;
  }

  .filters button[type="submit"] { background: var(--color-accent); color: #ffffff; }
  .toolbar__badge { display: inline-grid; place-items: center; min-width: 1.4em; margin-left: 4px; border-radius: 999px; background: var(--color-accent); color: #ffffff; font-size: 0.8em; }

  /* Los filtros, como panel flotante (popover abierto, en la capa superior). */
  .filters {
    inset: var(--space-s) var(--space-s) auto auto;
    width: min(20rem, 100% - 2 * var(--space-s));
    margin: 0;
    padding: var(--space-s);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: #ffffff;
    color: inherit;
    box-shadow: 0 12px 32px rgb(15 23 42 / 0.3);
  }

  .filters fieldset { display: grid; gap: 2px; margin-bottom: var(--space-xs); padding: 0; border: 0; }
  .filters legend { margin-bottom: 4px; font-weight: 700; }
  .filters label { display: flex; gap: 0.5em; align-items: center; font-size: 0.9rem; }
  .filters input { accent-color: var(--color-accent); }
  .filters__actions { display: flex; flex-wrap: wrap; gap: 8px; }

  @media (any-pointer: coarse) {
    .filters label, .filters button, .toolbar__filter { min-height: 44px; }
    .filters input { width: 1.3em; height: 1.3em; }
  }

  .products {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 10rem), 1fr));
    gap: var(--space-s);
    padding: 0;
    list-style: none;
  }

  .product { display: grid; gap: 2px; align-content: start; font-size: 0.85rem; }
  .product img { width: 100%; aspect-ratio: 4 / 3; margin-bottom: 4px; border-radius: 6px; object-fit: cover; object-position: var(--focus, 50% 50%); }
  .product h2 { font-size: 0.95rem; }
  .product h2 a { text-decoration: none; }
  .product h2 a:hover { text-decoration: underline; }
  .product p { color: var(--color-muted); }
  .product .product__price { color: var(--color-text); font-weight: 700; }

  .credit { margin-top: var(--space-s); color: var(--color-muted); font-size: 0.75rem; }
}

@layer layout {
  .catalog { display: grid; gap: var(--space-s); }

  /* Con sitio: el formulario siempre visible, como columna lateral. */
  @media (width >= 52rem) {
    .catalog { grid-template-columns: 13rem minmax(0, 1fr); align-items: start; }
    .toolbar__filter, .filters__close { display: none; }

    .filters {
      display: block;
      position: sticky;
      inset: var(--space-s) auto auto;   /* top para sticky; los demás, auto */
      width: auto;
      height: auto;
      overflow: visible;
      border: 0;
      border-right: 1px solid var(--color-border);
      border-radius: 0;
      box-shadow: none;
    }
  }
}
```
