---
example_description: "Una comparativa de productos: respuesta corta en una lista de descripción, tarjetas con enlaces de nombre único, una tabla de características con cabeceras en las dos direcciones y sí/no que no dependen de un icono"
example_tags: "profesional|comparativa|tablas|scope|tfoot|abbr|tarjetas"
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
  <title>Lumen 6, Folio 7 o Brisa 8: qué lector de libros electrónicos comprar · Leer en pantalla</title>
  <meta name="description" content="Probamos durante tres semanas tres lectores de libros electrónicos. Comparativa completa de pantalla, luz, batería, peso y precio, y nuestra recomendación.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <style>
    /* Solo legibilidad; el CSS se estudia en el capítulo 3 */
    .card img { display: block; margin-inline: auto; }
    .price { font-size: 1.3rem; font-weight: 700; }
    .compare td { text-align: center; }
    .compare .best { background: #eff6ff; }
    .yes { color: #15803d; }
    .no { color: #b91c1c; }
  </style>
  <!-- Herramienta del curso: revisa el documento y escribe el resultado en la consola -->
  <script defer src="js/audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://leerenpantalla.example/">Leer en pantalla</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://leerenpantalla.example/comparativas/">Comparativas</a></li>
        <li><a href="https://leerenpantalla.example/guias/">Guías</a></li>
        <li><a href="https://leerenpantalla.example/libros-gratis/">Libros gratis</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <nav class="breadcrumbs" aria-label="Ruta de navegación">
      <ol class="menu">
        <li><a href="https://leerenpantalla.example/">Inicio</a> <span aria-hidden="true">›</span></li>
        <li><a href="https://leerenpantalla.example/comparativas/">Comparativas</a> <span aria-hidden="true">›</span></li>
        <li><a href="https://leerenpantalla.example/comparativas/lectores/" aria-current="page">Lectores de libros electrónicos</a></li>
      </ol>
    </nav>

    <article>
      <header class="prose">
        <h1>Lumen 6, Folio 7 o Brisa 8: qué lector de libros electrónicos comprar</h1>
        <p class="muted">Por Raúl Benítez · <time datetime="2026-10-06">6 de octubre de 2026</time></p>
        <p class="lead">Hemos leído con los tres durante <time datetime="P21D">tres semanas</time>: en la cama, en el autobús y en la playa. <strong>El Folio 7 es la mejor compra para casi todo el mundo.</strong></p>
      </header>

      <p class="note prose">Compramos los tres lectores con nuestro dinero. Ningún fabricante ha visto este artículo antes de publicarlo.</p>

      <section class="prose">
        <h2>La respuesta corta</h2>
        <!-- Parejas «situación → recomendación»: lista de descripción -->
        <dl class="facts">
          <dt>Si quieres gastar lo mínimo</dt>
          <dd>Lumen 6: ligero y suficiente para leer de día.</dd>
          <dt>Si lees cada noche</dt>
          <dd>Folio 7: tiene luz cálida y botones para pasar página con una mano.</dd>
          <dt>Si lees cómics o libros con ilustraciones</dt>
          <dd>Brisa 8: la pantalla más grande, aunque pesa bastante más.</dd>
        </dl>
      </section>

      <section>
        <h2>Los tres modelos</h2>
        <!-- Tarjetas: una lista de artículos. Cada enlace dice qué ficha abre: tres «Ver ficha»
             iguales serían indistinguibles en la lista de enlaces de un lector de pantalla -->
        <ul class="card-list">
          <li class="card">
            <article>
              <img src="img/ereader-a.svg" alt="Lector de carcasa negra y pantalla gris claro." width="240" height="320">
              <h3>Lumen 6</h3>
              <p class="price">99,99&nbsp;€</p>
              <p><a href="https://leerenpantalla.example/fichas/lumen-6/">Ficha completa del Lumen 6</a></p>
            </article>
          </li>
          <li class="card">
            <article>
              <img src="img/ereader-b.svg" alt="Lector de carcasa granate y pantalla de tono crema." width="240" height="320">
              <h3>Folio 7 <small>(nuestra elección)</small></h3>
              <p class="price">149,99&nbsp;€</p>
              <p><a href="https://leerenpantalla.example/fichas/folio-7/">Ficha completa del Folio 7</a></p>
            </article>
          </li>
          <li class="card">
            <article>
              <img src="img/ereader-c.svg" alt="Lector de carcasa azul marino y pantalla blanca, más grande que los otros dos." width="240" height="320">
              <h3>Brisa 8</h3>
              <p class="price">199,99&nbsp;€</p>
              <p><a href="https://leerenpantalla.example/fichas/brisa-8/">Ficha completa del Brisa 8</a></p>
            </article>
          </li>
        </ul>
      </section>

      <section>
        <h2>Comparativa completa</h2>
        <!-- Cabeceras en las dos direcciones: los modelos (scope="col") y las características
             (scope="row"). Cada celda se anuncia como «Luz cálida, Folio 7: Sí» -->
        <div class="table-scroll" role="region" aria-labelledby="compare-caption" tabindex="0">
          <table class="compare" aria-describedby="prices-note">
            <caption id="compare-caption">Características de los tres lectores</caption>
            <colgroup>
              <col>
              <col>
              <col class="best">
              <col>
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Característica</th>
                <th scope="col">Lumen 6</th>
                <th scope="col">Folio 7</th>
                <th scope="col">Brisa 8</th>
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row">Pantalla</th><td>6&nbsp;pulgadas</td><td>7&nbsp;pulgadas</td><td>8&nbsp;pulgadas</td></tr>
              <tr><th scope="row">Resolución</th><td>300&nbsp;<abbr title="píxeles por pulgada">ppp</abbr></td><td>300&nbsp;<abbr title="píxeles por pulgada">ppp</abbr></td><td>300&nbsp;<abbr title="píxeles por pulgada">ppp</abbr></td></tr>
              <!-- El sí/no se escribe con palabras; el icono es decorativo (aria-hidden) y el color, un extra -->
              <tr><th scope="row">Luz cálida</th><td class="no"><span aria-hidden="true">✗</span> No</td><td class="yes"><span aria-hidden="true">✓</span> Sí</td><td class="yes"><span aria-hidden="true">✓</span> Sí</td></tr>
              <tr><th scope="row">Resistente al agua</th><td class="no"><span aria-hidden="true">✗</span> No</td><td class="yes"><span aria-hidden="true">✓</span> Sí</td><td class="yes"><span aria-hidden="true">✓</span> Sí</td></tr>
              <tr><th scope="row">Botones para pasar página</th><td class="no"><span aria-hidden="true">✗</span> No</td><td class="yes"><span aria-hidden="true">✓</span> Sí</td><td class="no"><span aria-hidden="true">✗</span> No</td></tr>
              <tr><th scope="row">Batería</th><td><time datetime="P28D">4&nbsp;semanas</time></td><td><time datetime="P42D">6&nbsp;semanas</time></td><td><time datetime="P35D">5&nbsp;semanas</time></td></tr>
              <tr><th scope="row">Peso</th><td>158&nbsp;g</td><td>182&nbsp;g</td><td>214&nbsp;g</td></tr>
              <tr><th scope="row">Almacenamiento</th><td>16&nbsp;<abbr title="gigabytes">GB</abbr></td><td>32&nbsp;<abbr title="gigabytes">GB</abbr></td><td>32&nbsp;<abbr title="gigabytes">GB</abbr></td></tr>
            </tbody>
            <tfoot>
              <tr><th scope="row">Precio</th><td>99,99&nbsp;€</td><td>149,99&nbsp;€</td><td>199,99&nbsp;€</td></tr>
            </tfoot>
          </table>
        </div>
        <p id="prices-note" class="muted"><small>Precios con IVA consultados el <time datetime="2026-10-05">5 de octubre de 2026</time>. La batería se midió leyendo media hora al día con la luz al 50&nbsp;%.</small></p>
      </section>

      <section class="prose">
        <h2>Por qué elegimos el Folio 7</h2>
        <ul>
          <li>La luz cálida se nota de verdad por la noche: cansa menos la vista que la luz blanca.</li>
          <li>Los botones físicos permiten pasar página con la mano que sujeta el lector.</li>
          <li>Con seis semanas de batería, el cargador se queda en casa durante las vacaciones.</li>
        </ul>
        <p>Su único defecto serio es el precio: si lees sobre todo de día, el Lumen 6 cuesta 50&nbsp;€ menos y hace lo esencial igual de bien.</p>
      </section>

      <footer class="prose">
        <p><a href="#compare-caption">Volver a la tabla comparativa</a> · <a href="mailto:redaccion@leerenpantalla.example?subject=Comparativa%20de%20lectores">Enviar una corrección</a></p>
      </footer>
    </article>
  </main>

  <footer class="site-footer">
    <p>Leer en pantalla es una web independiente. No vendemos nada y no usamos enlaces de afiliados.</p>
    <p><small>© 2026 Leer en pantalla · <a href="https://leerenpantalla.example/quienes-somos/">Quiénes somos</a></small></p>
  </footer>
</body>
</html>
```
