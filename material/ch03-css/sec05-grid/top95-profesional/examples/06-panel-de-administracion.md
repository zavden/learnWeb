---
example_description: "El panel de administración de una tienda: indicadores alineados con subgrid, una gráfica de barras hecha solo con grid (cada barra abarca tantas filas como su valor), actividad reciente en dos columnas compartidas y una tabla de pedidos"
example_tags: "css|profesional|grid|subgrid|span|custom-properties|auto-fit|panel|grafica"
example_stage: professional
example_importance: important
---

# HTML

```html
<div class="app">
  <header class="topbar">
    <a class="brand" href="/admin">Vivero Xochi · Admin</a>
    <form class="search" role="search" action="/admin/buscar">
      <input type="search" name="q" aria-label="Buscar pedidos o productos" placeholder="Buscar pedidos…">
      <button>Buscar</button>
    </form>
  </header>

  <div class="body">
    <nav class="sidenav" aria-label="Administración">
      <ul>
        <li><a href="/admin" aria-current="page">Resumen</a></li>
        <li><a href="/admin/pedidos">Pedidos</a></li>
        <li><a href="/admin/productos">Productos</a></li>
        <li><a href="/admin/clientes">Clientes</a></li>
        <li><a href="/admin/ajustes">Ajustes</a></li>
      </ul>
    </nav>

    <main class="main">
      <h1>Resumen de octubre</h1>

      <ul class="kpis">
        <li class="kpi"><p class="kpi-label">Ventas del mes</p><p class="kpi-value">80 420 MXN</p><p class="kpi-trend is-up">+11 % frente a septiembre</p></li>
        <li class="kpi"><p class="kpi-label">Pedidos</p><p class="kpi-value">312</p><p class="kpi-trend is-up">+8 %</p></li>
        <li class="kpi"><p class="kpi-label">Ticket medio por pedido</p><p class="kpi-value">258 MXN</p><p class="kpi-trend">sin cambios</p></li>
        <li class="kpi"><p class="kpi-label">Devoluciones</p><p class="kpi-value">4</p><p class="kpi-trend is-down">+2 frente a septiembre</p></li>
      </ul>

      <div class="widgets">
        <section class="card is-full" aria-labelledby="chart-title">
          <h2 id="chart-title">Ventas por mes, en miles de MXN</h2>
          <ol class="chart">
            <li style="--value: 5"><span class="bar">42</span><span class="month">Ene</span></li>
            <li style="--value: 5"><span class="bar">38</span><span class="month">Feb</span></li>
            <li style="--value: 6"><span class="bar">51</span><span class="month">Mar</span></li>
            <li style="--value: 6"><span class="bar">47</span><span class="month">Abr</span></li>
            <li style="--value: 8"><span class="bar">63</span><span class="month">May</span></li>
            <li style="--value: 7"><span class="bar">58</span><span class="month">Jun</span></li>
            <li style="--value: 7"><span class="bar">55</span><span class="month">Jul</span></li>
            <li style="--value: 8"><span class="bar">61</span><span class="month">Ago</span></li>
            <li style="--value: 9"><span class="bar">72</span><span class="month">Sep</span></li>
            <li style="--value: 10"><span class="bar">80</span><span class="month">Oct</span></li>
          </ol>
        </section>

        <section class="card" aria-labelledby="top-title">
          <h2 id="top-title">Más vendidos</h2>
          <ol class="top">
            <li><span class="rank">1</span> <span>Monstera deliciosa</span> <span class="units">48 uds.</span></li>
            <li><span class="rank">2</span> <span>Pothos dorado</span> <span class="units">41 uds.</span></li>
            <li><span class="rank">3</span> <span>Sustrato universal 5 L</span> <span class="units">37 uds.</span></li>
          </ol>
        </section>

        <section class="card" aria-labelledby="activity-title">
          <h2 id="activity-title">Actividad</h2>
          <ol class="feed">
            <li><time datetime="2026-10-13T09:42">9:42</time><p>Pedido 1046 pagado con tarjeta</p></li>
            <li><time datetime="2026-10-13T09:15">9:15</time><p>Reseña de 5 estrellas para la sansevieria</p></li>
            <li><time datetime="2026-10-13T08:03">8:03</time><p>Stock bajo: calathea (2 unidades)</p></li>
          </ol>
        </section>

        <section class="card is-full" aria-labelledby="orders-title">
          <h2 id="orders-title">Últimos pedidos</h2>
          <div class="table-scroll" tabindex="0" role="region" aria-labelledby="orders-title">
            <table class="orders">
              <thead>
                <tr><th scope="col">Pedido</th><th scope="col">Cliente</th><th scope="col">Total</th><th scope="col">Estado</th></tr>
              </thead>
              <tbody>
                <tr><td><a href="/admin/pedidos/1046">1046</a></td><td>Ana Lucía Méndez</td><td>412 MXN</td><td><span class="status is-paid">Pagado</span></td></tr>
                <tr><td><a href="/admin/pedidos/1045">1045</a></td><td>Jorge Treviño</td><td>189 MXN</td><td><span class="status is-sent">Enviado</span></td></tr>
                <tr><td><a href="/admin/pedidos/1044">1044</a></td><td>Paola Ríos</td><td>760 MXN</td><td><span class="status is-pending">Pendiente</span></td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  </div>
</div>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Panel de administración
   - Esqueleto: barra superior y, debajo, menú y contenido con el patrón de barra
     lateral que se apila (flexbox).
   - Indicadores: auto-fit; cada uno ocupa 3 filas compartidas con subgrid, así
     las cifras quedan a la misma altura aunque una etiqueta ocupe dos líneas.
   - Widgets: auto-fit de al menos 16rem; la gráfica y la tabla ocupan toda la
     fila con 1 / -1 (que funciona con cualquier número de columnas).
   - Gráfica: 10 filas iguales para los valores y una para los meses. Cada mes es
     una subrejilla de todas las filas; su barra termina en la penúltima línea
     (-2) y abarca tantas filas como --value (span var(--value)).
   - Actividad: hora y texto en dos columnas compartidas con subgrid.
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
    --color-text: #0f172a;
    --color-muted: #475569;
    --color-bg: #f1f5f9;
    --color-card: #ffffff;
    --color-line: #e2e8f0;
    --color-brand: #0f766e;
    --color-brand-dark: #134e4a;
    --color-up: #15803d;
    --color-down: #b91c1c;
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
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.4;
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
  /* ─── Barra superior ─── */
  .topbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-4);
    padding: var(--space-3) var(--space-4);
    background: var(--color-brand-dark);
    color: #ffffff;
  }

  .brand {
    font-weight: 700;
    text-decoration: none;
  }

  .search {
    display: flex;
    flex: 1 1 14rem;
    gap: var(--space-1);
    max-width: 24rem;
    margin-left: auto;
  }

  .search input {
    flex: 1;
    min-width: 0;
    padding: var(--space-1) var(--space-3);
    border: 0;
    border-radius: 999px;
  }

  .search button {
    padding: var(--space-1) var(--space-3);
    border: 0;
    border-radius: 999px;
    background: #99f6e4;
    color: var(--color-brand-dark);
    font-weight: 700;
    cursor: pointer;
  }

  .topbar :focus-visible {
    outline-color: #fde68a;
  }

  /* ─── Menú y contenido ─── */
  .body {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: var(--space-4);
    padding: var(--space-4);
  }

  .sidenav {
    flex: 1 1 9rem;
  }

  .sidenav ul {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    padding: 0;
    list-style: none;
  }

  .sidenav li {
    flex: 1 1 8rem;
  }

  .sidenav a {
    display: block;
    padding: var(--space-2) var(--space-3);
    border-radius: 8px;
    text-decoration: none;
  }

  .sidenav [aria-current="page"] {
    background: var(--color-brand);
    color: #ffffff;
    font-weight: 700;
  }

  .main {
    display: grid;
    flex: 999 1 22rem;
    gap: var(--space-4);
    min-width: 0;
  }

  .main h1 {
    font-size: 1.4rem;
  }

  /* ─── Indicadores: auto-fit + subgrid ─── */
  .kpis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr));
    gap: var(--space-3);
    padding: 0;
    list-style: none;
  }

  .kpi {
    display: grid;
    grid-row: span 3;
    grid-template-rows: subgrid;
    row-gap: var(--space-1);
    padding: var(--space-3);
    border-radius: var(--radius);
    background: var(--color-card);
  }

  .kpi-label {
    align-self: end;
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .kpi-value {
    font-size: 1.4rem;
    font-weight: 700;
  }

  .kpi-trend {
    color: var(--color-muted);
    font-size: 0.75rem;
  }

  .kpi-trend.is-up {
    color: var(--color-up);
  }

  .kpi-trend.is-down {
    color: var(--color-down);
  }

  /* ─── Widgets ─── */
  .widgets {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
    gap: var(--space-4);
  }

  .card {
    padding: var(--space-4);
    border-radius: var(--radius);
    background: var(--color-card);
  }

  .card.is-full {
    grid-column: 1 / -1;
  }

  .card h2 {
    margin-bottom: var(--space-3);
    font-size: 1rem;
  }

  /* ─── Gráfica de barras con grid ─── */
  .chart {
    display: grid;
    grid-template-columns: repeat(10, minmax(0, 1fr));
    grid-template-rows: repeat(10, 1fr) auto;
    column-gap: var(--space-2);
    height: 13rem;
    padding: 0;
    border-bottom: 1px solid var(--color-line);
    list-style: none;
  }

  .chart li {
    display: grid;
    grid-row: 1 / -1;
    grid-template-rows: subgrid;
  }

  .bar {
    grid-row: span var(--value) / -2;
    padding-top: 2px;
    border-radius: 4px 4px 0 0;
    background: var(--color-brand);
    color: #ffffff;
    font-size: 0.65rem;
    font-weight: 700;
    text-align: center;
  }

  .month {
    grid-row: -2 / -1;
    padding-top: var(--space-1);
    color: var(--color-muted);
    font-size: 0.7rem;
    text-align: center;
  }

  /* ─── Más vendidos y actividad ─── */
  /* Puesto, nombre y unidades: tres columnas por fila. */
  .top {
    display: grid;
    gap: var(--space-2);
    padding: 0;
    list-style: none;
  }

  .top li {
    display: grid;
    grid-template-columns: 1.5rem minmax(0, 1fr) auto;
    align-items: baseline;
    gap: var(--space-2);
  }

  .rank {
    color: var(--color-brand);
    font-weight: 700;
  }

  .units {
    color: var(--color-muted);
    font-weight: 700;
  }

  .feed {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    gap: var(--space-2) var(--space-3);
    padding: 0;
    list-style: none;
    font-size: 0.85rem;
  }

  .feed li {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
  }

  .feed time {
    color: var(--color-muted);
  }

  /* ─── Tabla ─── */
  .table-scroll {
    overflow-x: auto;
  }

  .orders {
    width: 100%;
    min-width: 24rem;
    border-collapse: collapse;
    font-size: 0.85rem;
  }

  .orders th,
  .orders td {
    padding: var(--space-2);
    border-bottom: 1px solid var(--color-line);
    text-align: left;
  }

  .orders th {
    color: var(--color-muted);
    font-size: 0.75rem;
  }

  .status {
    padding: 0 var(--space-2);
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .status.is-paid {
    background: #dcfce7;
    color: #14532d;
  }

  .status.is-sent {
    background: #dbeafe;
    color: #1e3a8a;
  }

  .status.is-pending {
    background: #fef3c7;
    color: #78350f;
  }
}
```
