---
example_description: "El panel de administración de una tienda: menú lateral que se apila arriba en pantallas estrechas, cabecera con acciones, tarjetas de indicadores que se reparten solas, pedidos recientes y un gráfico de barras hecho con flexbox"
example_tags: "css|profesional|flexbox|dashboard|kpi|flex-wrap|sidebar|margin-auto"
example_stage: professional
example_importance: important
---

# HTML

```html
<div class="dashboard">
  <aside class="sidebar">
    <a class="brand" href="/admin">Xochi <span>Admin</span></a>
    <nav aria-label="Secciones">
      <ul class="nav-list">
        <li><a href="/admin" aria-current="page">Resumen</a></li>
        <li><a href="/admin/pedidos">Pedidos</a></li>
        <li><a href="/admin/productos">Productos</a></li>
        <li><a href="/admin/clientes">Clientes</a></li>
        <li><a href="/admin/talleres">Talleres</a></li>
        <li><a href="/admin/ajustes">Ajustes</a></li>
      </ul>
    </nav>
    <a class="sidebar-user" href="/admin/perfil">
      <img src="avatar-4.svg" alt="" width="32" height="32">
      <span><strong>Ana Torres</strong> Administradora</span>
    </a>
  </aside>

  <main class="main">
    <header class="main-header">
      <div>
        <h1>Resumen de octubre</h1>
        <p class="period">Del 1 al 13 de octubre de 2026</p>
      </div>
      <div class="actions">
        <a class="button" href="/admin/informes/octubre.csv">Exportar</a>
        <a class="button is-primary" href="/admin/productos/nuevo">Nuevo producto</a>
      </div>
    </header>

    <ul class="kpis">
      <li class="kpi">
        <p class="kpi-label">Ventas</p>
        <p class="kpi-value">84 320 MXN</p>
        <p class="trend is-up">↑ 12 % <span>frente a septiembre</span></p>
        <svg class="spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points="0,24 15,20 30,22 45,14 60,16 75,9 100,5" fill="none" stroke="#166534" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>
      </li>
      <li class="kpi">
        <p class="kpi-label">Pedidos</p>
        <p class="kpi-value">318</p>
        <p class="trend is-up">↑ 8 % <span>frente a septiembre</span></p>
        <svg class="spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points="0,22 15,24 30,18 45,19 60,12 75,14 100,9" fill="none" stroke="#166534" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>
      </li>
      <li class="kpi">
        <p class="kpi-label">Ticket medio</p>
        <p class="kpi-value">265 MXN</p>
        <p class="trend is-down">↓ 3 % <span>frente a septiembre</span></p>
        <svg class="spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points="0,10 15,12 30,9 45,15 60,14 75,18 100,17" fill="none" stroke="#b91c1c" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>
      </li>
      <li class="kpi">
        <p class="kpi-label">Devoluciones</p>
        <p class="kpi-value">1,9 %</p>
        <p class="trend">= <span>igual que septiembre</span></p>
        <svg class="spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points="0,16 15,15 30,17 45,15 60,16 75,15 100,16" fill="none" stroke="#475569" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>
      </li>
    </ul>

    <div class="panels">
      <section class="panel is-wide" aria-labelledby="orders-title">
        <div class="panel-header">
          <h2 id="orders-title">Pedidos recientes</h2>
          <a href="/admin/pedidos">Ver todos</a>
        </div>
        <ul class="orders">
          <li><span class="order-id">#4821</span><span class="order-customer">Ana Lucía Méndez Villaseñor</span><span class="status is-sent">Enviado</span><span class="order-total">1360 MXN</span></li>
          <li><span class="order-id">#4820</span><span class="order-customer">Jorge Pérez</span><span class="status is-paid">Pagado</span><span class="order-total">290 MXN</span></li>
          <li><span class="order-id">#4819</span><span class="order-customer">Carmen Ortiz</span><span class="status is-pending">Pendiente</span><span class="order-total">548 MXN</span></li>
          <li><span class="order-id">#4818</span><span class="order-customer">Luis Gómez</span><span class="status is-sent">Enviado</span><span class="order-total">160 MXN</span></li>
        </ul>
      </section>

      <section class="panel" aria-labelledby="top-title">
        <div class="panel-header">
          <h2 id="top-title">Más vendidos</h2>
        </div>
        <ul class="bars">
          <li style="--value: 100%"><span class="bar-label">Pothos dorado</span><span class="bar-value">96</span></li>
          <li style="--value: 74%"><span class="bar-label">Monstera</span><span class="bar-value">71</span></li>
          <li style="--value: 52%"><span class="bar-label">Sansevieria</span><span class="bar-value">50</span></li>
          <li style="--value: 31%"><span class="bar-label">Cactus</span><span class="bar-value">30</span></li>
        </ul>
      </section>
    </div>
  </main>
</div>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Panel de control
   - Esqueleto: barra lateral que se apila (menú: base 12rem; contenido: base
     24rem y flex-grow 999). En una pantalla ancha, el menú ocupa todo el alto
     (el estiramiento de la línea) y el usuario se va al fondo con
     margin-top: auto; en una estrecha, el menú pasa arriba.
   - La lista del menú usa el truco de las bases: cada enlace quiere 9rem, así
     que en la columna de 12rem va uno por línea y arriba, varios.
   - Indicadores: rejilla sin media queries (base 9rem). Paneles: dos columnas
     que se reparten 2 a 1 (flex-grow 2 y 1) y se apilan si no caben.
   - Gráfico de barras: cada fila tiene la etiqueta y el valor en los extremos;
     la barra es un ::after cuyo ancho viene de la custom property --value,
     escrita en el atributo style de cada fila.
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

  img,
  svg {
    display: block;
    flex: none;
  }
}

@layer tokens {
  :root {
    --color-text: #1e293b;
    --color-muted: #475569;
    --color-border: #e2e8f0;
    --color-surface: #ffffff;
    --color-bg: #f8fafc;
    --color-side: #14532d;
    --color-side-text: #dcfce7;
    --color-brand: #166534;
    --color-up: #166534;
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
  /* ─── Esqueleto ─── */
  .dashboard {
    display: flex;
    flex-wrap: wrap;
    min-height: 100dvh;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    flex: 1 1 12rem;
    padding: var(--space-4);
    background: var(--color-side);
    color: var(--color-side-text);
  }

  .main {
    flex: 999 1 24rem;
    min-width: 0;
    padding: var(--space-6) var(--space-4);
  }

  /* ─── Menú lateral ─── */
  .brand {
    color: #ffffff;
    font-size: 1.2rem;
    font-weight: 800;
    text-decoration: none;
  }

  .brand span {
    font-weight: 400;
  }

  .nav-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    padding: 0;
    list-style: none;
  }

  .nav-list li {
    flex: 1 1 9rem;
  }

  .nav-list a {
    display: block;
    padding: var(--space-2) var(--space-3);
    border-radius: 0.5rem;
    text-decoration: none;
  }

  .nav-list a:hover {
    background: rgb(255 255 255 / 0.1);
  }

  .nav-list a[aria-current="page"] {
    background: #ffffff;
    color: var(--color-side);
    font-weight: 700;
  }

  .sidebar :focus-visible {
    outline-color: #fef08a;
  }

  /* El usuario, al fondo del menú cuando el menú es una columna alta. */
  .sidebar-user {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: auto;
    font-size: 0.85rem;
    text-decoration: none;
  }

  .sidebar-user img {
    border-radius: 50%;
  }

  .sidebar-user strong {
    display: block;
    color: #ffffff;
  }

  /* ─── Cabecera del contenido ─── */
  .main-header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: var(--space-3) var(--space-4);
    margin-bottom: var(--space-4);
  }

  .main-header h1 {
    font-size: 1.5rem;
    line-height: 1.2;
  }

  .period {
    color: var(--color-muted);
    font-size: 0.85rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-left: auto;
  }

  .button {
    padding: var(--space-1) var(--space-4);
    border: 1px solid #64748b;
    border-radius: 999px;
    background: var(--color-surface);
    font-size: 0.85rem;
    font-weight: 600;
    text-decoration: none;
  }

  .button.is-primary {
    border-color: var(--color-brand);
    background: var(--color-brand);
    color: #ffffff;
  }

  /* ─── Indicadores ─── */
  .kpis {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
    padding: 0;
    list-style: none;
  }

  .kpi {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    flex: 1 1 9rem;
    padding: var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-surface);
  }

  .kpi-label {
    color: var(--color-muted);
    font-size: 0.8rem;
    font-weight: 600;
  }

  .kpi-value {
    font-size: 1.4rem;
    font-weight: 800;
    line-height: 1.1;
  }

  .trend {
    color: var(--color-muted);
    font-size: 0.75rem;
    font-weight: 700;
  }

  .trend span {
    font-weight: 400;
  }

  .trend.is-up {
    color: var(--color-up);
  }

  .trend.is-down {
    color: var(--color-down);
  }

  /* La línea de tendencia se estira a lo ancho de la tarjeta y la empuja al fondo. */
  .spark {
    width: 100%;
    height: 30px;
    margin-top: auto;
  }

  /* ─── Paneles: 2 a 1, o apilados ─── */
  .panels {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .panel {
    flex: 1 1 14rem;
    min-width: 0;
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-surface);
  }

  .panel.is-wide {
    flex: 2 1 18rem;
  }

  .panel-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }

  .panel-header h2 {
    font-size: 1rem;
  }

  .panel-header a {
    color: var(--color-brand);
    font-size: 0.85rem;
  }

  /* Cada pedido: número y estado rígidos, cliente recortado, total a la derecha. */
  .orders {
    padding: 0;
    font-size: 0.85rem;
    list-style: none;
  }

  .orders li {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding-block: var(--space-2);
    border-top: 1px solid var(--color-border);
  }

  .order-id {
    flex: none;
    color: var(--color-muted);
  }

  .order-customer {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .status {
    flex: none;
    padding: 0 var(--space-2);
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .status.is-sent {
    background: #dcfce7;
    color: #14532d;
  }

  .status.is-paid {
    background: #dbeafe;
    color: #1e3a8a;
  }

  .status.is-pending {
    background: #fef3c7;
    color: #92400e;
  }

  .order-total {
    flex: none;
    font-weight: 700;
  }

  /* ─── Gráfico de barras ─── */
  .bars {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: 0;
    font-size: 0.85rem;
    list-style: none;
  }

  /* Etiqueta y valor en los extremos; el ::after es la barra. Mide --value, y su
     margen derecho completa el 100 %: así su tamaño exterior es la línea entera
     y flex-wrap la manda siempre a una línea propia, sea cual sea su valor. */
  .bars li {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--space-1);
  }

  .bars li::after {
    content: "";
    flex: 0 0 var(--value);
    height: 0.5rem;
    margin-right: calc(100% - var(--value));
    border-radius: 999px;
    background: var(--color-brand);
  }

  .bar-value {
    font-weight: 700;
  }
}
```
