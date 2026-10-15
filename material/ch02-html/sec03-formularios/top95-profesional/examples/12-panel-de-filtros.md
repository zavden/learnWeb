---
example_description: "El panel de pedidos de una tienda: filtros en un formulario GET dentro de search (texto, estado, fechas, importe con range y output, casillas y orden), resultados en una tabla y un enlace para quitar los filtros"
example_tags: "profesional|formularios|filtros|get|search|range|output|tabla"
example_stage: professional
example_importance: important
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pedidos · Administración de Semillas Ribera</title>
  <meta name="description" content="Panel interno para buscar y filtrar los pedidos de Semillas Ribera.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <style>
    /* Solo legibilidad; el CSS se estudia en el capítulo 3 */
    search { display: block; } /* search aún no tiene estilos en todos los navegadores */
    .table-scroll { overflow-x: auto; }
  </style>
  <script defer src="js/form-audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://admin.semillasribera.example/">Semillas Ribera · Administración</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://admin.semillasribera.example/pedidos" aria-current="page">Pedidos</a></li>
        <li><a href="https://admin.semillasribera.example/productos">Productos</a></li>
        <li><a href="https://admin.semillasribera.example/clientes">Clientes</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Pedidos</h1>

    <!-- 1. Filtrar es consultar: GET. Cada combinación de filtros tiene su URL, que se puede
         guardar en marcadores o enviar a un compañero. search: la región de búsqueda. -->
    <search>
      <form class="form" action="https://admin.semillasribera.example/pedidos" method="get" aria-labelledby="filters-title"
            oninput="document.getElementById('min-amount-value').value = `${this.elements.min_amount.value} €`">
        <h2 id="filters-title">Filtros</h2>
        <p class="hint">Ningún filtro es obligatorio.</p>
        <div class="field">
          <label for="q">Cliente, correo o número de pedido</label>
          <input id="q" name="q" type="search" class="width-full" enterkeyhint="search" value="Zaragoza">
        </div>
        <div class="field">
          <label for="status">Estado</label>
          <select id="status" name="status">
            <option value="">Todos</option>
            <option value="pending" selected>Pendiente de envío</option>
            <option value="shipped">Enviado</option>
            <option value="returned">Devuelto</option>
          </select>
        </div>
        <fieldset>
          <legend>Fecha del pedido</legend>
          <div class="inline-fields">
            <div><label for="from">Desde</label><input id="from" name="from" type="date" min="2024-01-01" max="2026-10-12" value="2026-10-01"></div>
            <div><label for="to">Hasta</label><input id="to" name="to" type="date" min="2024-01-01" max="2026-10-12" value="2026-10-12"></div>
          </div>
        </fieldset>
        <div class="field">
          <label for="min-amount">Importe mínimo</label>
          <!-- 2. El range no muestra su valor: lo enseña un output (que no se envía) -->
          <input id="min-amount" name="min_amount" type="range" min="0" max="200" step="10" value="20">
          <output id="min-amount-value" for="min-amount">20 €</output>
        </div>
        <fieldset>
          <legend>Forma de envío</legend>
          <div class="choice"><input id="ship-standard" type="checkbox" name="shipping" value="standard" checked><label for="ship-standard">Estándar</label></div>
          <div class="choice"><input id="ship-express" type="checkbox" name="shipping" value="express" checked><label for="ship-express">Urgente</label></div>
          <div class="choice"><input id="ship-pickup" type="checkbox" name="shipping" value="pickup"><label for="ship-pickup">Recogida en el vivero</label></div>
        </fieldset>
        <fieldset>
          <legend>Ordenar por</legend>
          <div class="choice"><input id="sort-newest" type="radio" name="sort" value="newest" checked><label for="sort-newest">Más recientes primero</label></div>
          <div class="choice"><input id="sort-amount" type="radio" name="sort" value="amount"><label for="sort-amount">Importe, de mayor a menor</label></div>
        </fieldset>
        <div class="actions">
          <button type="submit" class="button-primary">Aplicar los filtros</button>
          <!-- 3. Quitar los filtros es ir a la URL sin query: un enlace. Un botón reset solo
               volvería a los valores iniciales de esta página, que ya están filtrados. -->
          <a href="https://admin.semillasribera.example/pedidos">Quitar todos los filtros</a>
        </div>
      </form>
    </search>

    <h2>Resultados</h2>
    <!-- 4. Región viva: si los resultados se actualizaran sin recargar, se anunciaría el número -->
    <p role="status">3 pedidos pendientes de envío de clientes de Zaragoza, del 1 al 12 de octubre de 2026.</p>
    <div class="table-scroll" tabindex="0" role="region" aria-labelledby="results-caption">
      <table>
        <caption id="results-caption">Pedidos que cumplen los filtros</caption>
        <thead>
          <tr><th scope="col">Pedido</th><th scope="col">Fecha</th><th scope="col">Cliente</th><th scope="col">Envío</th><th scope="col" class="num">Importe</th></tr>
        </thead>
        <tbody>
          <tr><th scope="row"><a href="https://admin.semillasribera.example/pedidos/SR-204518">SR-204518</a></th><td><time datetime="2026-10-11">11/10/2026</time></td><td>Marta Ruiz Gil</td><td>Urgente</td><td class="num">54,30 €</td></tr>
          <tr><th scope="row"><a href="https://admin.semillasribera.example/pedidos/SR-204502">SR-204502</a></th><td><time datetime="2026-10-08">08/10/2026</time></td><td>Andrés López</td><td>Estándar</td><td class="num">23,85 €</td></tr>
          <tr><th scope="row"><a href="https://admin.semillasribera.example/pedidos/SR-204477">SR-204477</a></th><td><time datetime="2026-10-03">03/10/2026</time></td><td>Huerta Comunitaria Delicias</td><td>Estándar</td><td class="num">186,00 €</td></tr>
        </tbody>
      </table>
    </div>
  </main>

  <footer class="site-footer">
    <p>Panel interno · Solo para el personal de Semillas Ribera</p>
  </footer>
</body>
</html>
```
