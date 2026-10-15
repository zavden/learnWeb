---
example_description: "El catálogo de un vivero en línea: filtros y resultados que se apilan con flexbox, productos en una rejilla auto-fill con subgrid (foto con insignia, nombre, valoración, precio y botón alineados) y opciones de filtro en rejilla"
example_tags: "css|profesional|grid|flexbox|subgrid|auto-fill|capas|catalogo|filtros"
example_stage: professional
example_importance: critical
---

# HTML

```html
<main class="catalog">
  <nav class="breadcrumbs" aria-label="Estás en">
    <ol>
      <li><a href="/">Inicio</a></li>
      <li><a href="/plantas">Plantas</a></li>
      <li><a href="/plantas/interior" aria-current="page">Interior</a></li>
    </ol>
  </nav>
  <h1>Plantas de interior</h1>

  <div class="layout">
    <aside class="filters" aria-labelledby="filters-title">
      <h2 id="filters-title">Filtrar</h2>
      <form action="/plantas/interior" method="get">
        <details open>
          <summary>Luz</summary>
          <ul class="options">
            <li><label><input type="checkbox" name="luz" value="poca"> <span>Poca luz</span> <span class="count">14</span></label></li>
            <li><label><input type="checkbox" name="luz" value="indirecta" checked> <span>Indirecta</span> <span class="count">22</span></label></li>
            <li><label><input type="checkbox" name="luz" value="directa"> <span>Sol directo</span> <span class="count">6</span></label></li>
          </ul>
        </details>
        <details open>
          <summary>Cuidado</summary>
          <ul class="options">
            <li><label><input type="checkbox" name="cuidado" value="facil" checked> <span>Fácil</span> <span class="count">18</span></label></li>
            <li><label><input type="checkbox" name="cuidado" value="mascotas"> <span>Apta para mascotas</span> <span class="count">9</span></label></li>
          </ul>
        </details>
        <details>
          <summary>Precio</summary>
          <div class="price-range">
            <label for="price-min">Desde</label>
            <label for="price-max">Hasta</label>
            <input id="price-min" name="min" type="number" inputmode="numeric" placeholder="100">
            <input id="price-max" name="max" type="number" inputmode="numeric" placeholder="600">
          </div>
        </details>
        <button class="apply">Aplicar filtros</button>
      </form>
    </aside>

    <section class="results" aria-labelledby="results-title">
      <div class="results-bar">
        <h2 id="results-title">6 plantas</h2>
        <label class="sort">Ordenar por
          <select name="orden">
            <option>Más vendidas</option>
            <option>Precio: de menor a mayor</option>
            <option>Novedades</option>
          </select>
        </label>
      </div>

      <ul class="products">
        <li class="product">
          <div class="media"><img src="plant-monstera.svg" alt="" width="240" height="240"><p class="badge">−20 %</p></div>
          <h3><a href="/plantas/monstera-deliciosa">Monstera deliciosa</a></h3>
          <p class="rating"><span aria-hidden="true">★★★★★</span> 4,9 <span class="reviews">(124 reseñas)</span></p>
          <p class="price"><strong>336 MXN</strong> <s>420 MXN</s></p>
          <button class="add" aria-label="Añadir al carrito: Monstera deliciosa">Añadir</button>
        </li>
        <li class="product">
          <div class="media"><img src="plant-pothos.svg" alt="" width="240" height="240"></div>
          <h3><a href="/plantas/pothos-dorado">Pothos dorado colgante con maceta de fibra de coco</a></h3>
          <p class="rating"><span aria-hidden="true">★★★★☆</span> 4,6 <span class="reviews">(87 reseñas)</span></p>
          <p class="price"><strong>220 MXN</strong></p>
          <button class="add" aria-label="Añadir al carrito: Pothos dorado colgante">Añadir</button>
        </li>
        <li class="product">
          <div class="media"><img src="plant-sansevieria.svg" alt="" width="240" height="240"><p class="badge is-new">Nueva</p></div>
          <h3><a href="/plantas/sansevieria">Sansevieria</a></h3>
          <p class="rating"><span aria-hidden="true">★★★★★</span> 4,8 <span class="reviews">(52 reseñas)</span></p>
          <p class="price"><strong>240 MXN</strong></p>
          <button class="add" aria-label="Añadir al carrito: Sansevieria">Añadir</button>
        </li>
        <li class="product">
          <div class="media"><img src="plant-calathea.svg" alt="" width="240" height="240"></div>
          <h3><a href="/plantas/calathea-medallon">Calathea medallón</a></h3>
          <p class="rating"><span aria-hidden="true">★★★★☆</span> 4,1 <span class="reviews">(19 reseñas)</span></p>
          <p class="price"><strong>310 MXN</strong></p>
          <button class="add" aria-label="Añadir al carrito: Calathea medallón">Añadir</button>
        </li>
        <li class="product">
          <div class="media"><img src="plant-peperomia.svg" alt="" width="240" height="240"><p class="badge">−10 %</p></div>
          <h3><a href="/plantas/peperomia">Peperomia obtusifolia</a></h3>
          <p class="rating"><span aria-hidden="true">★★★★☆</span> 4,4 <span class="reviews">(31 reseñas)</span></p>
          <p class="price"><strong>126 MXN</strong> <s>140 MXN</s></p>
          <button class="add" aria-label="Añadir al carrito: Peperomia obtusifolia">Añadir</button>
        </li>
        <li class="product">
          <div class="media"><img src="plant-cactus.svg" alt="" width="240" height="240"></div>
          <h3><a href="/plantas/cactus-candelabro">Cactus candelabro</a></h3>
          <p class="rating"><span aria-hidden="true">★★★★★</span> 5,0 <span class="reviews">(8 reseñas)</span></p>
          <p class="price"><strong>290 MXN</strong></p>
          <button class="add" aria-label="Añadir al carrito: Cactus candelabro">Añadir</button>
        </li>
      </ul>

      <nav class="pagination" aria-label="Páginas de resultados">
        <a href="/plantas/interior?pagina=1" aria-current="page">1</a>
        <a href="/plantas/interior?pagina=2">2</a>
        <a href="/plantas/interior?pagina=3">3</a>
        <a href="/plantas/interior?pagina=2">Siguiente</a>
      </nav>
    </section>
  </div>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Catálogo con filtros
   - Esqueleto: filtros y resultados con el patrón de barra lateral que se apila
     (flexbox: dos bloques que van juntos si caben). No es una rejilla: no hay
     nada que alinear en dos dimensiones.
   - Productos: grid auto-fill (no auto-fit: con dos resultados, las tarjetas no
     se estiran) con el mínimo protegido por min(). Cada tarjeta ocupa 5 filas
     compartidas con subgrid: nombres de una o tres líneas, precios alineados.
   - Foto e insignia en la misma celda.
   - Filtros: cada opción es una rejilla de tres columnas (casilla, nombre y
     recuento a la derecha); el rango de precios, una de dos columnas.
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
  select,
  button {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-text: #1e293b;
    --color-muted: #475569;
    --color-line: #e2e8f0;
    --color-surface: #ffffff;
    --color-soft: #f8fafc;
    --color-brand: #166534;
    --color-brand-soft: #dcfce7;
    --color-sale: #9d174d;
    --color-star: #b45309;
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
    line-height: 1.45;
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
  .catalog {
    max-width: 70rem;
    margin-inline: auto;
    padding: var(--space-4);
  }

  .breadcrumbs ol {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    padding: 0;
    list-style: none;
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .breadcrumbs li + li::before {
    content: "/";
    margin-right: var(--space-1);
  }

  .catalog h1 {
    margin: var(--space-2) 0 var(--space-4);
    font-size: clamp(1.5rem, 1.1rem + 2vw, 2.2rem);
  }

  /* ─── Esqueleto: barra lateral que se apila (flexbox) ─── */
  .layout {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: var(--space-6);
  }

  .filters {
    flex: 1 1 13rem;
    padding: var(--space-3);
    border: 1px solid var(--color-line);
    border-radius: var(--radius);
    background: var(--color-soft);
  }

  .results {
    flex: 999 1 20rem;
    min-width: 0;
  }

  /* ─── Filtros ─── */
  .filters h2 {
    font-size: 1rem;
  }

  .filters details {
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--color-line);
  }

  .filters summary {
    font-weight: 700;
    cursor: pointer;
  }

  .options {
    display: grid;
    gap: var(--space-1);
    margin-top: var(--space-2);
    padding: 0;
    list-style: none;
    font-size: 0.9rem;
  }

  /* Casilla a su medida, nombre con el resto y recuento al final. */
  .options label {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
  }

  .count {
    min-width: 2.2em;
    padding: 0 var(--space-1);
    border-radius: 999px;
    background: var(--color-line);
    color: var(--color-muted);
    font-size: 0.75rem;
    text-align: center;
  }

  /* Dos etiquetas arriba y dos campos debajo: cada etiqueta, sobre su campo. */
  .price-range {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-1) var(--space-2);
    margin-top: var(--space-2);
    font-size: 0.85rem;
  }

  .price-range input {
    width: 100%;
    padding: var(--space-1) var(--space-2);
    border: 1px solid #64748b;
    border-radius: 6px;
  }

  .apply {
    width: 100%;
    margin-top: var(--space-3);
    padding: var(--space-2);
    border: 0;
    border-radius: 999px;
    background: var(--color-brand);
    color: #ffffff;
    font-weight: 700;
    cursor: pointer;
  }

  /* ─── Barra de resultados ─── */
  .results-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2) var(--space-4);
    margin-bottom: var(--space-4);
  }

  .results-bar h2 {
    font-size: 1.1rem;
  }

  .sort {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    font-size: 0.85rem;
  }

  .sort select {
    padding: var(--space-1) var(--space-2);
    border: 1px solid #64748b;
    border-radius: 6px;
  }

  /* ─── Productos: auto-fill + subgrid ─── */
  .products {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 10rem), 1fr));
    gap: var(--space-6) var(--space-4);
    padding: 0;
    list-style: none;
  }

  .product {
    display: grid;
    grid-row: span 5;
    grid-template-rows: subgrid;
    row-gap: var(--space-2);
  }

  .media {
    display: grid;
  }

  .media > * {
    grid-area: 1 / 1;
  }

  .media img {
    width: 100%;
    border-radius: var(--radius);
  }

  .badge {
    justify-self: start;
    align-self: start;
    margin: var(--space-2);
    padding: 0 var(--space-2);
    border-radius: 999px;
    background: var(--color-sale);
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .badge.is-new {
    background: var(--color-brand);
  }

  .product h3 {
    font-size: 0.95rem;
    line-height: 1.3;
  }

  .product h3 a {
    text-decoration: none;
  }

  .product h3 a:hover {
    text-decoration: underline;
  }

  .rating {
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .rating span[aria-hidden] {
    color: var(--color-star);
  }

  .price {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 var(--space-2);
  }

  .price strong {
    font-size: 1.15rem;
  }

  .price s {
    color: var(--color-muted);
    font-size: 0.85rem;
  }

  .add {
    justify-self: start;
    padding: var(--space-1) var(--space-4);
    border: 2px solid var(--color-brand);
    border-radius: 999px;
    background: var(--color-surface);
    color: var(--color-brand);
    font-weight: 700;
    cursor: pointer;
  }

  .add:hover {
    background: var(--color-brand-soft);
  }

  /* ─── Paginación: cada enlace, una casilla del mismo ancho ─── */
  .pagination {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-2);
    margin-top: var(--space-6);
  }

  .pagination a {
    min-width: 2.5rem;
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--color-line);
    border-radius: 999px;
    text-align: center;
    text-decoration: none;
  }

  .pagination [aria-current="page"] {
    border-color: var(--color-brand);
    background: var(--color-brand);
    color: #ffffff;
    font-weight: 700;
  }
}
```
