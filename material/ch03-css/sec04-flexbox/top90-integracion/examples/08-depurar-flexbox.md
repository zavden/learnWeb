---
example_description: "Un panel de pedidos con cinco errores de flexbox (texto suelto pegado, justify-self, flex-grow en pestañas, icono que desaparece y «…» que no sale), la versión arreglada y una tabla con síntoma, causa y arreglo"
example_tags: "css|flexbox|depurar|min-width|flex-shrink|flex|margin-auto"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<p class="label">❌ Cinco errores. Busca: un botón que no se va a la derecha, pestañas desiguales, un icono que ha desaparecido, un nombre que se sale sin «…» y un total con el texto pegado.</p>
<section class="orders is-broken" aria-label="Mis pedidos, versión con errores">
  <header class="orders-header">
    <h2>Mis pedidos</h2>
    <a class="download" href="/cuenta/facturas">Descargar facturas</a>
  </header>
  <nav class="tabs" aria-label="Filtrar pedidos, versión con errores">
    <a href="/cuenta/pedidos" aria-current="page">Todos</a><a href="/cuenta/pedidos?estado=camino">En camino</a><a href="/cuenta/pedidos?estado=entregados">Entregados</a><a href="/cuenta/pedidos?estado=devoluciones">Devoluciones</a>
  </nav>
  <article class="order">
    <span class="icon" aria-hidden="true"></span>
    <div class="order-info">
      <h3>Monstera deliciosa, pothos dorado, cactus candelabro y 2 productos más</h3>
      <p>En camino · llega el jueves 15</p>
    </div>
    <a class="detail" href="/cuenta/pedidos/4821">Ver detalle</a>
  </article>
  <p class="total">Total este año: <strong>3480 MXN</strong> en 7 pedidos</p>
</section>

<p class="label">✅ Los cinco arreglos (cada uno, una o dos declaraciones)</p>
<section class="orders is-fixed" aria-label="Mis pedidos, versión corregida">
  <header class="orders-header">
    <h2>Mis pedidos</h2>
    <a class="download" href="/cuenta/facturas">Descargar facturas</a>
  </header>
  <nav class="tabs" aria-label="Filtrar pedidos, versión corregida">
    <a href="/cuenta/pedidos" aria-current="page">Todos</a><a href="/cuenta/pedidos?estado=camino">En camino</a><a href="/cuenta/pedidos?estado=entregados">Entregados</a><a href="/cuenta/pedidos?estado=devoluciones">Devoluciones</a>
  </nav>
  <article class="order">
    <span class="icon" aria-hidden="true"></span>
    <div class="order-info">
      <h3>Monstera deliciosa, pothos dorado, cactus candelabro y 2 productos más</h3>
      <p>En camino · llega el jueves 15</p>
    </div>
    <a class="detail" href="/cuenta/pedidos/4821">Ver detalle</a>
  </article>
  <p class="total"><span>Total este año:</span> <strong>3480 MXN</strong> <span>en 7 pedidos</span></p>
</section>

<table class="report">
  <caption>Síntoma, causa y arreglo</caption>
  <thead><tr><th scope="col">Síntoma</th><th scope="col">Causa</th><th scope="col">Arreglo</th></tr></thead>
  <tbody>
    <tr><td>«Descargar facturas» no va a la derecha</td><td><code>justify-self</code> no existe en flexbox (lección 2)</td><td><code>margin-left: auto</code></td></tr>
    <tr><td>Pestañas de anchos distintos</td><td><code>flex-grow: 1</code> parte del ancho del texto (lección 3)</td><td><code>flex: 1</code></td></tr>
    <tr><td>El icono del camión desaparece</td><td><code>flex-shrink: 1</code> y un mínimo de 0 (lección 4)</td><td><code>flex-shrink: 0</code></td></tr>
    <tr><td>El nombre se sale sin «…»</td><td><code>min-width: auto</code> en <code>.order-info</code> (lección 4)</td><td><code>min-width: 0</code></td></tr>
    <tr><td>«año:3480 MXNen»</td><td>texto suelto en un contenedor flex (lección 1)</td><td>cada pieza en su elemento</td></tr>
  </tbody>
</table>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  max-width: 26rem;
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

a {
  color: #1d4ed8;
}

a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.orders {
  max-width: 26rem;
  margin-bottom: 12px;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.8rem;
}

.orders-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.orders-header h2 {
  margin: 0;
  font-size: 1rem;
}

.tabs {
  display: flex;
  margin: 8px 0;
  border-bottom: 2px solid #e2e8f0;
}

.tabs a {
  padding: 4px 0;
  color: #475569;
  text-align: center;
  text-decoration: none;
}

.tabs a[aria-current="page"] {
  box-shadow: inset 0 -2px #1d4ed8;
  color: #1e293b;
  font-weight: bold;
}

.order {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #dcfce7 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23166534' stroke-width='2' stroke-linejoin='round'%3E%3Cpath d='M2 6h12v10H2zM14 10h4l3 3v3h-7'/%3E%3C/svg%3E") center / 22px no-repeat;
}

.order-info h3 {
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 0.85rem;
}

.order-info p {
  margin: 0;
  color: #475569;
}

.detail {
  white-space: nowrap;
}

.total {
  margin: 8px 0 0;
}

/* ─── ❌ Los cinco errores ─── */
.is-broken .download {
  justify-self: end;         /* 1. se ignora en flexbox */
}

.is-broken .tabs a {
  flex-grow: 1;              /* 2. reparte el sobrante, pero cada una parte de su texto */
}

/* 3 y 4: .order-info no puede bajar del ancho de su título en una línea (su
   min-width: auto), y «Ver detalle» tampoco (nowrap). El único que puede encoger es
   el icono, que no tiene contenido: se lleva todo el exceso y se queda en 0. */

.is-broken .total {
  display: flex;             /* 5. tres trozos de texto = tres elementos anónimos */
}

/* ─── ✅ Los arreglos ─── */
.is-fixed .download {
  margin-left: auto;         /* 1 */
}

.is-fixed .tabs a {
  flex: 1;                   /* 2. base 0: anchos iguales */
}

.is-fixed .icon {
  flex-shrink: 0;            /* 3 */
}

.is-fixed .order-info {
  min-width: 0;              /* 4. ahora encoge y el h3 muestra su «…» */
}

/* 5. El párrafo vuelve a ser flujo normal (no se declara display: flex). Si de verdad
   hubiera que repartir piezas, cada una iría en su elemento, como en el HTML. */

.report {
  max-width: 26rem;
  border-collapse: collapse;
  font-size: 0.75rem;
}

.report caption {
  margin-bottom: 4px;
  font-weight: bold;
  text-align: left;
}

.report th,
.report td {
  padding: 4px 6px;
  border: 1px solid #cbd5e1;
  text-align: left;
  vertical-align: top;
}
```
