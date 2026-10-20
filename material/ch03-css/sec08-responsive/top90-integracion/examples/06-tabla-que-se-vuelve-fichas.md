---
example_description: "Una tabla de pedidos que, en contenedores de menos de 26rem, se convierte en fichas: cada fila es una rejilla y cada celda muestra su cabecera con attr(data-label). Los roles ARIA conservan la semántica de tabla. En un hueco de 300px y en otro de 460px"
example_tags: "css|responsive|integracion|container-queries|tablas|attr|accesibilidad"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">La misma tabla en un hueco de 300px (fichas) y en uno de 460px (tabla). El cambio es a 26rem (416px) de contenedor.</p>

<div class="orders-slot" style="width: 300px">
  <table class="orders" role="table">
    <caption>Pedidos de hoy</caption>
    <thead role="rowgroup"><tr role="row"><th role="columnheader" scope="col">Pedido</th><th role="columnheader" scope="col">Cliente</th><th role="columnheader" scope="col">Total</th><th role="columnheader" scope="col">Estado</th></tr></thead>
    <tbody role="rowgroup">
      <tr role="row"><td role="cell" data-label="Pedido">#4821</td><td role="cell" data-label="Cliente">Lucía Pérez</td><td role="cell" data-label="Total">760 MXN</td><td role="cell" data-label="Estado">Enviado</td></tr>
      <tr role="row"><td role="cell" data-label="Pedido">#4822</td><td role="cell" data-label="Cliente">Marco Ruiz</td><td role="cell" data-label="Total">420 MXN</td><td role="cell" data-label="Estado">Preparando</td></tr>
    </tbody>
  </table>
</div>

<div class="orders-slot" style="width: 460px">
  <table class="orders" role="table">
    <caption>Pedidos de hoy</caption>
    <thead role="rowgroup"><tr role="row"><th role="columnheader" scope="col">Pedido</th><th role="columnheader" scope="col">Cliente</th><th role="columnheader" scope="col">Total</th><th role="columnheader" scope="col">Estado</th></tr></thead>
    <tbody role="rowgroup">
      <tr role="row"><td role="cell" data-label="Pedido">#4821</td><td role="cell" data-label="Cliente">Lucía Pérez</td><td role="cell" data-label="Total">760 MXN</td><td role="cell" data-label="Estado">Enviado</td></tr>
      <tr role="row"><td role="cell" data-label="Pedido">#4822</td><td role="cell" data-label="Cliente">Marco Ruiz</td><td role="cell" data-label="Total">420 MXN</td><td role="cell" data-label="Estado">Preparando</td></tr>
    </tbody>
  </table>
</div>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption { margin: 0 0 8px; font-size: 0.72rem; }

.orders-slot { container: orders / inline-size; max-width: 100%; margin-bottom: 12px; outline: 2px dashed #7c3aed; }

/* Mobile-first: FICHAS. Cada fila, una tarjeta de dos columnas: la cabecera
   de cada dato (que lee attr(data-label)) y el dato. */
.orders { display: block; width: 100%; border-collapse: collapse; font-size: 0.8rem; }
.orders tbody { display: block; }
.orders caption { display: block; padding: 4px; font-weight: 700; text-align: start; }

/* La cabecera de la tabla, solo para lectores de pantalla en modo fichas
   (el patrón visually-hidden del capítulo de HTML). */
.orders thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.orders tbody tr { display: grid; grid-template-columns: 5rem 1fr; margin: 0 4px 8px; padding: 6px; border: 1px solid #cbd5e1; border-radius: 8px; }
/* Cada celda ocupa las dos columnas de su fila y las comparte (subgrid,
   módulo de grid): su ::before cae en la primera y su texto en la segunda. */
.orders td { display: grid; grid-column: 1 / -1; grid-template-columns: subgrid; }
.orders td::before { content: attr(data-label); color: #475569; font-weight: 700; }

/* ¿Por qué roles ARIA en una tabla? Cambiar el display de las piezas de una
   tabla (block, grid) hace que algunos navegadores dejen de
   anunciarla como tabla. Los roles devuelven esa semántica. */

/* Con 26rem de contenedor: TABLA de verdad. */
@container orders (width >= 26rem) {
  .orders { display: table; }
  .orders caption { display: table-caption; }
  .orders tbody { display: table-row-group; }
  .orders thead { position: static; width: auto; height: auto; overflow: visible; clip-path: none; }
  .orders tbody tr { display: table-row; margin: 0; padding: 0; border: 0; }
  .orders td { display: table-cell; }
  .orders td::before { content: none; }
  .orders th, .orders td { padding: 6px 8px; border-bottom: 1px solid #cbd5e1; text-align: start; }
  .orders thead th { background: #f1f5f9; }
}
```
