---
example_description: "Un listado de productos con barra lateral de filtros que se coloca encima de la lista cuando no cabe, cabecera con orden a la derecha, tarjetas de igual altura y paginación; sin media queries"
example_tags: "css|profesional|flexbox|listado|filtros|flex-wrap|sidebar|tarjetas"
example_stage: professional
example_importance: critical
---

# HTML

```html
<main class="catalog">
  <header class="catalog-header">
    <nav aria-label="Migas de pan">
      <ol class="breadcrumbs">
        <li><a href="/">Inicio</a></li>
        <li><a href="/plantas">Plantas</a></li>
        <li><a href="/plantas/interior" aria-current="page">Interior</a></li>
      </ol>
    </nav>
    <div class="catalog-title">
      <h1>Plantas de interior</h1>
      <p class="catalog-count">128 productos</p>
      <label class="sort">Ordenar por
        <select name="orden" form="filters">
          <option>Más vendidas</option>
          <option>Precio: de menor a mayor</option>
          <option>Precio: de mayor a menor</option>
          <option>Novedades</option>
        </select>
      </label>
    </div>
  </header>

  <div class="catalog-body">
    <aside class="filters" aria-labelledby="filters-title">
      <div class="filters-header">
        <h2 id="filters-title">Filtros</h2>
        <a href="/plantas/interior">Borrar todo</a>
      </div>
      <form class="filters-form" id="filters" action="/plantas/interior">
        <details class="filter" open>
          <summary>Luz</summary>
          <label class="option"><input type="checkbox" name="luz" value="sombra" checked> Sombra <span class="option-count">24</span></label>
          <label class="option"><input type="checkbox" name="luz" value="indirecta" checked> Luz indirecta <span class="option-count">71</span></label>
          <label class="option"><input type="checkbox" name="luz" value="sol"> Sol directo <span class="option-count">33</span></label>
        </details>
        <details class="filter" open>
          <summary>Tamaño</summary>
          <label class="option"><input type="checkbox" name="tamano" value="mini"> Mini (hasta 15 cm) <span class="option-count">40</span></label>
          <label class="option"><input type="checkbox" name="tamano" value="mediana"> Mediana <span class="option-count">58</span></label>
          <label class="option"><input type="checkbox" name="tamano" value="grande"> Grande <span class="option-count">30</span></label>
        </details>
        <details class="filter">
          <summary>Precio</summary>
          <div class="price-range">
            <label>Mín. <input type="number" name="min" min="0" step="10" value="100" inputmode="numeric"></label>
            <span aria-hidden="true">–</span>
            <label>Máx. <input type="number" name="max" min="0" step="10" value="500" inputmode="numeric"></label>
          </div>
        </details>
        <button class="filters-apply">Aplicar filtros</button>
      </form>
    </aside>

    <section class="results" aria-label="Resultados">
      <ul class="products">
        <li class="product">
          <img src="plant-monstera.svg" alt="" width="240" height="240">
          <h3 class="product-name"><a href="/plantas/monstera-deliciosa">Monstera deliciosa</a></h3>
          <p class="rating">★ 4,8 <span>(126 opiniones)</span></p>
          <p class="price"><strong>336 MXN</strong> <span class="price-old">antes <s>420 MXN</s></span></p>
          <button class="add" type="button" aria-label="Añadir al carrito: Monstera deliciosa">Añadir</button>
        </li>
        <li class="product">
          <img src="plant-sansevieria.svg" alt="" width="240" height="240">
          <h3 class="product-name"><a href="/plantas/sansevieria">Sansevieria trifasciata «lengua de suegra»</a></h3>
          <p class="rating">★ 4,9 <span>(311 opiniones)</span></p>
          <p class="price"><strong>240 MXN</strong></p>
          <button class="add" type="button" aria-label="Añadir al carrito: Sansevieria">Añadir</button>
        </li>
        <li class="product">
          <img src="plant-pothos.svg" alt="" width="240" height="240">
          <h3 class="product-name"><a href="/plantas/pothos-dorado">Pothos dorado</a></h3>
          <p class="rating">★ 4,7 <span>(89 opiniones)</span></p>
          <p class="price"><strong>160 MXN</strong></p>
          <button class="add" type="button" aria-label="Añadir al carrito: Pothos dorado">Añadir</button>
        </li>
        <li class="product">
          <img src="plant-cactus.svg" alt="" width="240" height="240">
          <h3 class="product-name"><a href="/plantas/cactus-candelabro">Cactus candelabro</a></h3>
          <p class="rating">★ 4,6 <span>(54 opiniones)</span></p>
          <p class="price"><strong>290 MXN</strong></p>
          <button class="add" type="button" aria-label="Añadir al carrito: Cactus candelabro">Añadir</button>
        </li>
        <li class="product">
          <img src="plant-monstera.svg" alt="" width="240" height="240">
          <h3 class="product-name"><a href="/plantas/monstera-variegata">Monstera variegata</a></h3>
          <p class="rating">★ 5,0 <span>(12 opiniones)</span></p>
          <p class="price"><strong>1250 MXN</strong></p>
          <button class="add" type="button" aria-label="Añadir al carrito: Monstera variegata">Añadir</button>
        </li>
      </ul>

      <nav class="pagination" aria-label="Páginas de resultados">
        <a href="/plantas/interior?pagina=1" rel="prev">« Anterior</a>
        <a href="/plantas/interior?pagina=1">1</a>
        <a href="/plantas/interior?pagina=2" aria-current="page">2</a>
        <a href="/plantas/interior?pagina=3">3</a>
        <a href="/plantas/interior?pagina=3" rel="next">Siguiente »</a>
      </nav>
    </section>
  </div>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Listado con filtros
   - El cuerpo es el patrón de barra lateral que se apila: filtros con base de
     13rem y flex-grow 1; resultados con base de 20rem y flex-grow 999. Si caben
     los dos, los filtros se quedan en sus 13rem; si no, flex-wrap pasa los
     resultados debajo. Los filtros van primero en el HTML (y en pantalla): con
     teclado, se llega a ellos sin recorrer todos los productos.
   - Los grupos de filtros son <details>: en una pantalla estrecha, los cerrados
     ocupan una línea.
   - Tarjetas: rejilla sin media queries (flex: 1 1 10rem, máximo 15rem), cada
     una en columna con el botón al fondo.
   - El reset deja las imágenes con height: auto: en columnas se estiran a lo
     ancho conservando la proporción, que es lo que queremos aquí.
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
  button,
  select {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-text: #1e293b;
    --color-muted: #475569;
    --color-border: #cbd5e1;
    --color-surface: #ffffff;
    --color-soft: #f8fafc;
    --color-brand: #166534;
    --color-brand-dark: #14532d;
    --color-brand-soft: #dcfce7;
    --color-sale: #b91c1c;
    --color-star: #a16207;
    --color-focus: #1d4ed8;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --radius: 0.5rem;
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
  .catalog {
    max-width: 64rem;
    margin-inline: auto;
    padding: var(--space-4);
  }

  /* ─── Cabecera del listado ─── */
  .breadcrumbs {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    padding: 0;
    color: var(--color-muted);
    font-size: 0.8rem;
    list-style: none;
  }

  .breadcrumbs li + li::before {
    content: "/";
    margin-right: var(--space-1);
  }

  .breadcrumbs [aria-current="page"] {
    color: var(--color-text);
    text-decoration: none;
  }

  /* Título y contador por la línea base; el orden, al final de la línea. */
  .catalog-title {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-1) var(--space-3);
    margin-block: var(--space-2) var(--space-4);
  }

  .catalog-title h1 {
    font-size: 1.5rem;
    line-height: 1.2;
  }

  .catalog-count {
    color: var(--color-muted);
    font-size: 0.85rem;
  }

  .sort {
    margin-left: auto;
    font-size: 0.85rem;
  }

  .sort select {
    margin-left: var(--space-1);
    padding: var(--space-1) var(--space-2);
    border: 1px solid #64748b;
    border-radius: var(--radius);
  }

  /* ─── Cuerpo: barra lateral que se apila ─── */
  .catalog-body {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;    /* los filtros miden lo suyo, no lo que la lista */
    gap: var(--space-4);
  }

  .filters {
    flex: 1 1 13rem;
    padding: var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-soft);
    font-size: 0.85rem;
  }

  .results {
    flex: 999 1 20rem;
    min-width: 0;
  }

  .filters-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: var(--space-2);
  }

  .filters-header h2 {
    font-size: 1rem;
  }

  .filters-header a {
    color: var(--color-brand);
    font-size: 0.8rem;
  }

  .filter {
    padding-block: var(--space-2);
    border-top: 1px solid var(--color-border);
  }

  .filter summary {
    font-weight: 700;
    cursor: pointer;
  }

  /* Cada opción: casilla, texto y recuento empujado a la derecha. */
  .option {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding-block: 0.15rem;
    cursor: pointer;
  }

  .option input {
    flex: none;
  }

  .option-count {
    margin-left: auto;
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  /* Dos campos que se reparten el ancho; min-width: 0 para que quepan en 13rem. */
  .price-range {
    display: flex;
    align-items: flex-end;
    gap: var(--space-2);
    padding-top: var(--space-1);
  }

  .price-range label {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    font-size: 0.8rem;
  }

  .price-range input {
    min-width: 0;
    padding: var(--space-1) var(--space-2);
    border: 1px solid #64748b;
    border-radius: var(--radius);
  }

  .price-range span {
    padding-bottom: var(--space-1);
  }

  .filters-apply {
    width: 100%;
    margin-top: var(--space-2);
    padding: var(--space-2);
    border: 0;
    border-radius: var(--radius);
    background: var(--color-brand);
    color: #ffffff;
    font-weight: 600;
    cursor: pointer;
  }

  /* ─── Tarjetas ─── */
  .products {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    padding: 0;
    list-style: none;
  }

  .product {
    display: flex;
    flex-direction: column;
    flex: 1 1 10rem;
    max-width: 15rem;
    padding: var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    font-size: 0.85rem;
  }

  .product img {
    width: 100%;
    margin-bottom: var(--space-2);
    border-radius: calc(var(--radius) - 2px);
  }

  .product-name {
    font-size: 0.95rem;
    line-height: 1.3;
  }

  .product-name a {
    text-decoration: none;
  }

  .product-name a:hover {
    text-decoration: underline;
  }

  .rating {
    color: var(--color-star);
    font-weight: 700;
  }

  .rating span {
    color: var(--color-muted);
    font-weight: 400;
  }

  .price {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 var(--space-2);
    margin-bottom: var(--space-2);
  }

  .price strong {
    font-size: 1.1rem;
  }

  .price-old {
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .add {
    margin-top: auto;
    padding: var(--space-2);
    border: 1px solid var(--color-brand);
    border-radius: var(--radius);
    background: var(--color-surface);
    color: var(--color-brand);
    font-weight: 600;
    cursor: pointer;
  }

  .add:hover {
    background: var(--color-brand-soft);
  }

  /* ─── Paginación: centrada y partida en líneas si no cabe ─── */
  .pagination {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-2);
    margin-top: var(--space-4);
    font-size: 0.85rem;
  }

  .pagination a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2.25rem;
    height: 2.25rem;
    padding: 0 var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    text-decoration: none;
  }

  .pagination a[aria-current="page"] {
    border-color: var(--color-brand);
    background: var(--color-brand);
    color: #ffffff;
    font-weight: 700;
  }
}
```
