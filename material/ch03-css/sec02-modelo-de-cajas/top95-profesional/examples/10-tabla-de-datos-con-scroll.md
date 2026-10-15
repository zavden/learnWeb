---
example_description: "Una tabla de pedidos de administración: contenedor con scroll horizontal accesible y esquinas recortadas, celdas con texto recortado mediante un bloque interior (max-width no funciona en celdas), insignias de estado y paginación inline-block"
example_tags: "css|profesional|tablas|overflow|text-overflow|accesibilidad"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="admin">
  <header class="admin-header">
    <h1>Pedidos</h1>
    <p class="admin-summary">128 pedidos en noviembre · 9.482,30 € facturados</p>
  </header>

  <form class="toolbar" role="search" action="#">
    <label class="toolbar-label" for="order-filter">Buscar</label>
    <input class="toolbar-input" id="order-filter" type="search" placeholder="Cliente, producto o número de pedido">
    <button class="toolbar-button" type="submit">Buscar</button>
  </form>

  <div class="table-scroll" role="region" aria-labelledby="orders-caption" tabindex="0">
    <table class="data-table">
      <caption id="orders-caption">Pedidos de noviembre, del más reciente al más antiguo</caption>
      <thead>
        <tr>
          <th scope="col">Pedido</th>
          <th scope="col">Fecha</th>
          <th scope="col">Cliente</th>
          <th scope="col">Productos</th>
          <th scope="col">Estado</th>
          <th scope="col" class="numeric">Importe</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row"><a href="#">2026-1184</a></th>
          <td>14/11/2026</td>
          <td>Paula Navarro</td>
          <td><span class="truncate" title="Taza de gres esmaltada a mano ×2, Mantel de lino lavado 140 × 200 cm">Taza de gres esmaltada a mano ×2, Mantel de lino lavado 140 × 200 cm</span></td>
          <td><span class="status status--success">Entregado</span></td>
          <td class="numeric">64,80 €</td>
        </tr>
        <tr>
          <th scope="row"><a href="#">2026-1183</a></th>
          <td>14/11/2026</td>
          <td>Andrés Molina Sáez</td>
          <td><span class="truncate" title="Mochila de lona encerada">Mochila de lona encerada</span></td>
          <td><span class="status status--info">En camino</span></td>
          <td class="numeric">64,00 €</td>
        </tr>
        <tr>
          <th scope="row"><a href="#">2026-1182</a></th>
          <td>13/11/2026</td>
          <td>Fundación Cultural Hermanos Álvarez de la Ribera</td>
          <td><span class="truncate" title="Flexo de escritorio ×12, Bombilla LED cálida ×12, Regleta con interruptor ×4">Flexo de escritorio ×12, Bombilla LED cálida ×12, Regleta con interruptor ×4</span></td>
          <td><span class="status status--warning">Pago pendiente</span></td>
          <td class="numeric">612,40 €</td>
        </tr>
        <tr>
          <th scope="row"><a href="#">2026-1181</a></th>
          <td>12/11/2026</td>
          <td>Hugo Castillo</td>
          <td><span class="truncate" title="Maceta de barro con planta aromática">Maceta de barro con planta aromática</span></td>
          <td><span class="status status--danger">Devuelto</span></td>
          <td class="numeric">−12,50 €</td>
        </tr>
        <tr>
          <th scope="row"><a href="#">2026-1180</a></th>
          <td>12/11/2026</td>
          <td>Elena Prieto</td>
          <td><span class="truncate" title="Cuaderno de tapa dura ×3">Cuaderno de tapa dura ×3</span></td>
          <td><span class="status status--success">Entregado</span></td>
          <td class="numeric">27,00 €</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" colspan="5">Total de la página</th>
          <td class="numeric">755,70 €</td>
        </tr>
      </tfoot>
    </table>
  </div>
  <p class="scroll-hint">En pantallas estrechas, desliza la tabla en horizontal o enfócala con <kbd>Tab</kbd> y usa las flechas.</p>

  <nav class="pagination" aria-label="Páginas de pedidos">
    <a class="page-link" href="#" aria-label="Página anterior">‹</a>
    <a class="page-link" href="#" aria-current="page">1</a>
    <a class="page-link" href="#">2</a>
    <a class="page-link" href="#">3</a>
    <span class="page-gap">…</span>
    <a class="page-link" href="#">26</a>
    <a class="page-link" href="#" aria-label="Página siguiente">›</a>
  </nav>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Tabla de datos con scroll
   - La tabla nunca ensancha la página: vive en un contenedor con overflow-x: auto,
     enfocable (tabindex="0") y con nombre (role="region" + aria-labelledby).
   - El contenedor redondea sus esquinas y, como es un contenedor de scroll, recorta
     la tabla con esa misma forma.
   - 🐛 max-width en una celda no tiene un efecto definido y los navegadores lo
     ignoran: el ancho de las columnas lo reparte el algoritmo de la tabla. Para
     recortar con «…», el límite va en un bloque DENTRO de la celda (.truncate).
   - Estados sin saltos: la fila resaltada cambia el fondo, nunca un borde.
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

  input,
  button {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-bg: #f8fafc;
    --color-surface: #ffffff;
    --color-surface-muted: #f1f5f9;
    --color-text: #0f172a;
    --color-text-muted: #475569;
    --color-border: #e2e8f0;
    --color-border-strong: #64748b;
    --color-brand: #1d4ed8;
    --color-brand-strong: #1e40af;
    --color-row-hover: #eff6ff;
    --color-focus: #1d4ed8;

    --tone-info-bg: #dbeafe;     --tone-info-fg: #1e40af;
    --tone-success-bg: #dcfce7;  --tone-success-fg: #166534;
    --tone-warning-bg: #fef3c7;  --tone-warning-fg: #92400e;
    --tone-danger-bg: #fee2e2;   --tone-danger-fg: #991b1b;

    --radius: 12px;
    --control-height: 2.5rem;
  }
}

@layer base {
  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  :where(a) {
    color: var(--color-brand);
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }

  :where(kbd) {
    padding: 0 0.3em;
    border: 1px solid var(--color-border-strong);
    border-radius: 4px;
    font-size: 0.875em;
  }
}

@layer components {
  .admin {
    width: min(100% - 2rem, 64rem);
    margin: 2rem auto;
  }

  .admin-header {
    margin-bottom: 1rem;
  }

  .admin-summary {
    color: var(--color-text-muted);
  }

  /* ─── Barra de búsqueda ─── */
  .toolbar {
    margin-bottom: 1rem;
  }

  .toolbar-label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 600;
  }

  /* El campo mide como mucho 24rem; el botón se queda a su lado si cabe y salta debajo
     si no. (Que el campo ocupe «todo lo que deje el botón» es trabajo de flexbox.) */
  .toolbar-input {
    width: min(100%, 24rem);
    height: var(--control-height);
    margin: 0 0.5rem 0.5rem 0;
    padding: 0 0.75rem 0 2.25rem;
    border: 1px solid var(--color-border-strong);
    border-radius: 8px;
    background: var(--color-surface) url("icon-search.svg") left 0.625rem center / 1.125rem no-repeat;
    vertical-align: top;                /* vertical-align llega en el módulo de flujo */
  }

  .toolbar-button {
    height: var(--control-height);
    padding: 0 1rem;
    border: 1px solid var(--color-brand);
    border-radius: 8px;
    background: var(--color-brand);
    color: #ffffff;
    font-weight: 600;
    cursor: pointer;
    vertical-align: top;
  }

  .toolbar-button:hover {
    border-color: var(--color-brand-strong);
    background: var(--color-brand-strong);
  }

  /* ─── Contenedor con scroll ─── */
  .table-scroll {
    overflow-x: auto;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-surface);
    box-shadow: 0 1px 2px rgb(15 23 42 / 0.05);
  }

  .data-table {
    width: 100%;
    min-width: 52rem;                   /* más ancha que un móvil, a propósito */
    border-collapse: collapse;
    font-size: 0.9375rem;
  }

  .data-table caption {
    padding: 0.875rem 1rem 0.5rem;
    color: var(--color-text-muted);
    font-size: 0.875rem;
    text-align: start;
  }

  .data-table th,
  .data-table td {
    padding: 0.625rem 1rem;
    border-top: 1px solid var(--color-border);
    text-align: start;
    white-space: nowrap;                /* fechas e importes no se parten */
  }

  .data-table thead th {
    background: var(--color-surface-muted);
    color: var(--color-text-muted);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .data-table tbody th {
    font-weight: 600;
  }

  /* El nombre largo del cliente sí puede partirse en dos líneas */
  .data-table td:nth-child(3) {
    white-space: normal;
  }

  .data-table .numeric {
    text-align: end;
  }

  .data-table tbody tr:hover {
    background: var(--color-row-hover);
  }

  .data-table tfoot th,
  .data-table tfoot td {
    border-top: 2px solid var(--color-border-strong);
    font-weight: 700;
  }

  /* 🐛 Un max-width en el <td> se ignoraría. El bloque interior sí lo respeta,
     y con él la receta de tres propiedades del «…» funciona. */
  .truncate {
    display: block;
    max-width: 16rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .status {
    --tone-bg: var(--tone-info-bg);
    --tone-fg: var(--tone-info-fg);

    display: inline-block;
    padding: 0.0625rem 0.625rem;
    border-radius: 999px;
    background: var(--tone-bg);
    color: var(--tone-fg);
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .status--success { --tone-bg: var(--tone-success-bg); --tone-fg: var(--tone-success-fg); }
  .status--warning { --tone-bg: var(--tone-warning-bg); --tone-fg: var(--tone-warning-fg); }
  .status--danger  { --tone-bg: var(--tone-danger-bg);  --tone-fg: var(--tone-danger-fg); }

  .scroll-hint {
    margin-top: 0.5rem;
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  /* ─── Paginación ─── */
  /* Cajas inline-block cuadradas que crecen si el número es largo (min-width) */
  .pagination {
    margin-top: 1.5rem;
    text-align: center;
  }

  .page-link,
  .page-gap {
    display: inline-block;
    min-width: 2.5rem;
    margin: 0 0.125rem 0.5rem;
    padding: 0.375rem 0.5rem;
    border: 1px solid transparent;      /* reservado: el estado actual solo le da color */
    border-radius: 8px;
    text-align: center;
    text-decoration: none;
  }

  .page-link:hover {
    background: var(--color-surface-muted);
  }

  .page-link[aria-current="page"] {
    border-color: var(--color-brand);
    background: var(--color-brand);
    color: #ffffff;
    font-weight: 700;
  }

  .page-gap {
    color: var(--color-text-muted);
  }
}
```
