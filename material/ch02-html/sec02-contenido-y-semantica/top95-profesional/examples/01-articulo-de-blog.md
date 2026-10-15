---
example_description: "Una entrada de blog completa: ruta de navegación, artículo con cabecera y pie, índice, figura, tabla de gastos, notas al pie, caja de autora y artículos relacionados"
example_tags: "profesional|articulo|blog|landmarks|tablas|figure|notas"
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
  <title>Un año yendo al trabajo en bici: lo que aprendí · Pedales</title>
  <meta name="description" content="Doce meses, 3200 kilómetros y unas cuentas que no esperaba: lo que aprendí al cambiar el coche por la bicicleta para ir a trabajar.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <style>
    /* Solo legibilidad; el CSS se estudia en el capítulo 3 */
    .byline { color: #4b5563; }
    .tags { display: flex; flex-wrap: wrap; gap: 0.5rem; padding: 0; list-style: none; } /* en fila: flex (CSS) */
    .tags a { padding: 0.1rem 0.6rem; border: 1px solid #1d4ed8; border-radius: 999px; text-decoration: none; }
    .author { margin-top: 2rem; padding: 1rem; background: #f3f4f6; }
    .author img { float: left; margin-right: 1rem; border-radius: 50%; } /* foto a la izquierda: float (CSS) */
    .author::after { content: ""; display: block; clear: both; } /* la caja envuelve a la foto (CSS) */
  </style>
  <!-- Herramienta del curso: revisa el documento y escribe el resultado en la consola -->
  <script defer src="js/audit.js"></script>
</head>
<body>
  <!-- 1. Lo primero que alcanza el teclado: saltar el menú -->
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <!-- 2. Cabecera de la página (banner) con el menú principal: una lista de enlaces en un nav con nombre -->
  <header class="site-header">
    <p class="brand"><a href="https://pedales.example/">Pedales</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://pedales.example/">Inicio</a></li>
        <li><a href="https://pedales.example/articulos/">Artículos</a></li>
        <li><a href="https://pedales.example/rutas/">Rutas</a></li>
        <li><a href="https://pedales.example/sobre-el-blog/">Sobre el blog</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <!-- 3. Ruta de navegación: una jerarquía, así que es una ol; la página actual lleva aria-current -->
    <nav class="breadcrumbs" aria-label="Ruta de navegación">
      <ol class="menu">
        <li><a href="https://pedales.example/">Inicio</a> <span aria-hidden="true">›</span></li>
        <li><a href="https://pedales.example/articulos/">Artículos</a> <span aria-hidden="true">›</span></li>
        <li><a href="https://pedales.example/articulos/un-ano-en-bici/" aria-current="page">Un año yendo al trabajo en bici</a></li>
      </ol>
    </nav>

    <!-- 4. El artículo: contenido autónomo, con su propio header y su propio footer -->
    <article class="prose">
      <header>
        <h1>Un año yendo al trabajo en bici: lo que aprendí</h1>
        <p class="lead">Doce meses, 3200 kilómetros y unas cuentas que no esperaba.</p>
        <!-- Fechas para personas en el texto y para máquinas en datetime; la duración en ISO 8601 -->
        <p class="byline">Por <a href="#author">Inés Robles</a> · Publicado el <time datetime="2026-09-28">28 de septiembre de 2026</time> · Actualizado el <time datetime="2026-10-02">2 de octubre</time> · Lectura: <time datetime="PT8M">8&nbsp;min</time></p>
      </header>

      <!-- La ilustración aporta ambiente, no datos: el alt la describe en una frase; el pie da la autoría -->
      <figure>
        <img src="img/bike-commute.svg" alt="Una ciclista con casco rojo pedalea por un carril bici verde entre edificios, con el sol de la mañana." width="960" height="540">
        <figcaption>Ilustración: Pablo Gil.</figcaption>
      </figure>

      <!-- 5. Índice del artículo: navegación importante dentro de un documento largo -->
      <nav aria-labelledby="toc-title">
        <h2 id="toc-title">En este artículo</h2>
        <ol>
          <li><a href="#why">Por qué empecé</a></li>
          <li><a href="#numbers">Las cuentas de un año</a></li>
          <li><a href="#lessons">Lo que aprendí</a></li>
          <li><a href="#gear">Mi equipo</a></li>
        </ol>
      </nav>

      <h2 id="why">Por qué empecé</h2>
      <p>Mi trabajo está a 7&nbsp;km de casa. En coche tardaba entre 15 y 40&nbsp;minutos, según el tráfico; en bici, <em>siempre</em> 25. Esa regularidad fue lo que me convenció, más que el ejercicio o el medio ambiente.</p>
      <p>El primer día llegué empapada de sudor y con la sensación de haber cometido un error. El segundo, un poco menos. A la tercera semana ya no quería volver al coche.</p>

      <h2 id="numbers">Las cuentas de un año</h2>
      <p>Apunté cada gasto durante doce meses y lo comparé con lo que me costaba el coche el año anterior:</p>

      <!-- 6. Una tabla de datos de verdad: caption, grupos de filas, scope y totales en tfoot.
           El contenedor con scroll tiene nombre y foco por si la tabla no cabe en un móvil -->
      <div class="table-scroll" role="region" aria-labelledby="costs-caption" tabindex="0">
        <table>
          <caption id="costs-caption">Gastos de un año para ir al trabajo, en euros</caption>
          <thead>
            <tr>
              <th scope="col">Concepto</th>
              <th scope="col" class="num">Coche (año anterior)</th>
              <th scope="col" class="num">Bici (este año)</th>
            </tr>
          </thead>
          <tbody>
            <tr><th scope="row">Combustible</th><td class="num">1140</td><td class="num">0</td></tr>
            <tr><th scope="row">Seguro</th><td class="num">420</td><td class="num">60</td></tr>
            <tr><th scope="row">Aparcamiento</th><td class="num">600</td><td class="num">0</td></tr>
            <tr><th scope="row">Mantenimiento</th><td class="num">380</td><td class="num">95</td></tr>
            <tr><th scope="row">Equipamiento</th><td class="num">0</td><td class="num">310</td></tr>
          </tbody>
          <tfoot>
            <tr><th scope="row">Total</th><td class="num">2540</td><td class="num">465</td></tr>
          </tfoot>
        </table>
      </div>
      <!-- Llamadas a notas: un sup con un enlace a la nota (y la nota enlaza de vuelta) -->
      <p>La bici me costó <strong>2075&nbsp;€ menos</strong> en un año, contando la ropa de lluvia y unas luces nuevas<sup><a href="#note-1" id="ref-1" aria-label="Nota 1">1</a></sup>. Hasta el seguro sale más barato: es uno de responsabilidad civil para ciclistas<sup><a href="#note-2" id="ref-2" aria-label="Nota 2">2</a></sup>.</p>

      <h2 id="lessons">Lo que aprendí</h2>
      <!-- El orden es el de la experiencia: ol -->
      <ol>
        <li><p><strong>La lluvia no es para tanto.</strong> Llovió de verdad 19 días. Con un chubasquero y unas polainas llegué seca 17 de ellos.</p></li>
        <li><p><strong>La ruta corta no es la buena.</strong> Por el parque tardo 3&nbsp;minutos más, pero no cruzo ninguna avenida.</p></li>
        <li><p><strong>El mantenimiento es poco y frecuente.</strong> Como me dijo Ramón, el mecánico del barrio, <q>una cadena limpia dura el doble</q>. Ahora la limpio cada dos semanas.</p></li>
        <li><p><strong>Llegar despierta cambia el día.</strong> Las mañanas de reuniones ya no empiezan con un atasco.</p></li>
      </ol>

      <h2 id="gear">Mi equipo</h2>
      <!-- Parejas «qué → cuál»: una lista de descripción -->
      <dl class="facts">
        <dt>Bicicleta</dt>
        <dd>Una urbana de segunda mano, con guardabarros y portabultos.</dd>
        <dt>Luces</dt>
        <dd>Delantera blanca y trasera roja, recargables por <abbr title="Universal Serial Bus">USB</abbr>.</dd>
        <dt>Candado</dt>
        <dd>En U, el más pesado que encontré. Es lo único en lo que no ahorraría.</dd>
        <dt>Ropa</dt>
        <dd>Chubasquero, polainas y unos guantes finos para el invierno.</dd>
      </dl>

      <!-- 7. El pie del artículo: etiquetas y notas, cada nota con su enlace de vuelta -->
      <footer>
        <h2>Notas</h2>
        <ol>
          <li id="note-1">Todos los precios incluyen el impuesto sobre el valor añadido (<abbr>IVA</abbr>). <a href="#ref-1" aria-label="Volver a la llamada 1">↩</a></li>
          <li id="note-2">Cubre los daños que pueda causar a otras personas; el del coche era un seguro a terceros. <a href="#ref-2" aria-label="Volver a la llamada 2">↩</a></li>
        </ol>
        <p id="tags-title">Etiquetas:</p>
        <ul class="tags" aria-labelledby="tags-title">
          <li><a href="https://pedales.example/etiquetas/movilidad/">movilidad</a></li>
          <li><a href="https://pedales.example/etiquetas/presupuesto/">presupuesto</a></li>
          <li><a href="https://pedales.example/etiquetas/principiantes/">principiantes</a></li>
        </ul>
      </footer>

      <!-- 8. Información relacionada pero secundaria: un aside con nombre.
           El retrato tiene alt vacío porque el nombre ya está en el título de la caja -->
      <aside id="author" class="author" aria-labelledby="author-title">
        <img src="img/portrait-a.svg" alt="" width="96" height="96">
        <h2 id="author-title">Sobre la autora</h2>
        <p>Inés Robles es ingeniera de caminos y lleva diez años escribiendo sobre movilidad urbana.</p>
        <!-- address: el contacto de la autora de ESTE artículo -->
        <address>Escríbele a <a href="mailto:ines@pedales.example">ines@pedales.example</a></address>
      </aside>
    </article>

    <!-- 9. Más artículos: una sección con nombre y una lista de tarjetas -->
    <section aria-labelledby="related-title">
      <h2 id="related-title">Sigue leyendo</h2>
      <ul class="card-list">
        <li class="card">
          <article>
            <h3><a href="https://pedales.example/articulos/candados/">Cómo elegir un candado que de verdad proteja</a></h3>
            <p><time datetime="2026-09-14">14 de septiembre de 2026</time></p>
          </article>
        </li>
        <li class="card">
          <article>
            <h3><a href="https://pedales.example/articulos/lluvia/">Pedalear bajo la lluvia sin llegar empapada</a></h3>
            <p><time datetime="2026-08-30">30 de agosto de 2026</time></p>
          </article>
        </li>
        <li class="card">
          <article>
            <h3><a href="https://pedales.example/rutas/parque-del-rio/">Ruta: el parque del río, de punta a punta</a></h3>
            <p><time datetime="2026-08-12">12 de agosto de 2026</time></p>
          </article>
        </li>
      </ul>
    </section>
  </main>

  <!-- 10. Pie de la página (contentinfo) -->
  <footer class="site-footer">
    <p>© 2026 Pedales. Textos con licencia <abbr title="Creative Commons Reconocimiento">CC BY</abbr> 4.0.</p>
    <p>¿Una corrección? Escríbenos a <a href="mailto:hola@pedales.example">hola@pedales.example</a>.</p>
  </footer>
</body>
</html>
```
