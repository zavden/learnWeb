---
example_description: "La portada de un periódico local: secciones con título, noticias como artículos en listas, última hora con horas exactas, lo más leído en una lista ordenada y el tiempo en una tabla"
example_tags: "profesional|noticias|portada|article|section|aside|time"
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
  <title>El Diario de Ribera · Noticias de Ribera y su comarca</title>
  <meta name="description" content="Última hora, noticias locales, cultura y opinión de Ribera y su comarca.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <style>
    /* Solo legibilidad; el CSS se estudia en el capítulo 3 */
    .masthead h1 { margin: 0; font-family: Georgia, "Times New Roman", serif; font-size: 2.2rem; }
    .masthead h1 a { color: inherit; text-decoration: none; }
    .breaking { padding: 0.5rem 1rem; border-left: 4px solid #b91c1c; background: #fef2f2; }
    .breaking ul { margin: 0; padding-left: 1.2rem; }
    .lead-story h2 { font-size: 1.8rem; line-height: 1.2; }
    .lead-story h2 a,
    .card h3 a { color: #1f2937; }
    .meta { margin: 0; font-size: 0.9rem; color: #4b5563; }
    .weather td, .weather th { white-space: nowrap; }
  </style>
  <!-- Herramienta del curso: revisa el documento y escribe el resultado en la consola -->
  <script defer src="js/audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <!-- En la portada, el título de la página ES el nombre del periódico: es el h1 -->
  <header class="site-header masthead">
    <h1><a href="https://diarioderibera.example/">El Diario de Ribera</a></h1>
    <p class="meta"><time datetime="2026-10-12">Lunes, 12 de octubre de 2026</time></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://diarioderibera.example/" aria-current="page">Portada</a></li>
        <li><a href="https://diarioderibera.example/local/">Local</a></li>
        <li><a href="https://diarioderibera.example/comarca/">Comarca</a></li>
        <li><a href="https://diarioderibera.example/cultura/">Cultura</a></li>
        <li><a href="https://diarioderibera.example/opinion/">Opinión</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <!-- Última hora: una sección con nombre (región) y una lista; cada hora, exacta en datetime -->
    <section class="breaking" aria-labelledby="breaking-title">
      <h2 id="breaking-title">Última hora</h2>
      <ul>
        <li><time datetime="2026-10-12T09:42+02:00">09:42</time> · <a href="https://diarioderibera.example/local/camino-del-molino-cortado/">Cortado al tráfico el camino del Molino por la crecida del río</a></li>
        <li><time datetime="2026-10-12T09:05+02:00">09:05</time> · <a href="https://diarioderibera.example/local/autobus-nocturno/">El autobús nocturno amplía su horario los viernes</a></li>
        <li><time datetime="2026-10-12T08:20+02:00">08:20</time> · <a href="https://diarioderibera.example/deportes/cursillos-de-invierno/">La piscina cubierta abre el plazo de los cursillos de invierno</a></li>
      </ul>
    </section>

    <!-- La noticia principal: un article. El enlace está en el título; la foto no se repite como enlace -->
    <article class="lead-story">
      <h2><a href="https://diarioderibera.example/local/puente-viejo-reabre/">El puente viejo reabre a peatones y bicicletas tras catorce meses de obras</a></h2>
      <figure>
        <img src="img/news-bridge.svg" alt="El puente de piedra sobre el río crecido, con tres personas cruzándolo a pie." width="960" height="540">
        <figcaption>El puente viejo, este domingo por la mañana. Foto: Carmen Vidal.</figcaption>
      </figure>
      <p>La rehabilitación ha reforzado los cimientos y recuperado el pavimento original. Los coches no volverán a cruzarlo: el ayuntamiento lo reserva para quien va a pie o en bici.</p>
      <p class="meta">Por Diego Martín · <time datetime="2026-10-12T07:30+02:00">12 de octubre, 7:30</time></p>
    </article>

    <!-- Cada sección temática de la portada: section con su título; sus noticias, una lista de artículos -->
    <section>
      <h2>Local</h2>
      <ul class="card-list">
        <li class="card">
          <article>
            <img src="img/news-market.svg" alt="Tres puestos de mercado con toldos de colores y cajas de tomates, verduras y pan." width="640" height="360">
            <h3><a href="https://diarioderibera.example/local/mercado-productores/">El mercado de abastos tendrá puestos de productores locales en noviembre</a></h3>
            <p class="meta"><time datetime="2026-10-11T19:10+02:00">11 de octubre</time></p>
          </article>
        </li>
        <li class="card">
          <article>
            <h3><a href="https://diarioderibera.example/local/aparcabicis/">El ayuntamiento instalará 40 aparcabicis nuevos en el centro</a></h3>
            <p>Llegarán antes de Navidad e irán junto a las paradas de autobús.</p>
            <p class="meta"><time datetime="2026-10-11T12:45+02:00">11 de octubre</time></p>
          </article>
        </li>
        <li class="card">
          <article>
            <h3><a href="https://diarioderibera.example/local/sombra-parque-la-vega/">Los vecinos de La Vega piden más sombra en el parque</a></h3>
            <p>Han reunido 600 firmas para plantar árboles junto a los columpios.</p>
            <p class="meta"><time datetime="2026-10-10T18:00+02:00">10 de octubre</time></p>
          </article>
        </li>
      </ul>
    </section>

    <section>
      <h2>Cultura</h2>
      <ul class="card-list">
        <li class="card">
          <article>
            <h3><a href="https://diarioderibera.example/cultura/nocturno-del-molino/">La Banda Municipal estrena el 31 de octubre una obra de Lucía Ferrer</a></h3>
            <!-- cite: el título de una obra -->
            <p><cite>Nocturno del molino</cite> se escuchará al aire libre, en la plaza del Ayuntamiento.</p>
            <p class="meta"><time datetime="2026-10-10T10:30+02:00">10 de octubre</time></p>
          </article>
        </li>
        <li class="card">
          <article>
            <h3><a href="https://diarioderibera.example/cultura/octubre-negro/">La biblioteca dedica octubre a la novela negra</a></h3>
            <p>Club de lectura, una charla con un inspector jubilado y un concurso de relatos.</p>
            <p class="meta"><time datetime="2026-10-09T09:00+02:00">9 de octubre</time></p>
          </article>
        </li>
      </ul>
    </section>

    <section>
      <h2>Opinión</h2>
      <ul class="card-list">
        <li class="card">
          <article>
            <h3><a href="https://diarioderibera.example/opinion/un-puente-para-cruzar/">Un puente para cruzar, no para mirar</a></h3>
            <p class="meta">Por Elena Soto</p>
          </article>
        </li>
        <li class="card">
          <article>
            <h3><a href="https://diarioderibera.example/opinion/lo-que-el-rio-recuerda/">Lo que el río nos recuerda cada otoño</a></h3>
            <p class="meta">Por Andrés Peña</p>
          </article>
        </li>
      </ul>
    </section>
  </main>

  <!-- Complementario: dos aside fuera del main, cada uno con su nombre -->
  <aside class="site-aside" aria-labelledby="most-read-title">
    <h2 id="most-read-title">Lo más leído</h2>
    <!-- Un ranking: el orden es el contenido, así que es una ol.
         Mismo texto, mismo destino que en la portada: así el enlace no es ambiguo -->
    <ol>
      <li><a href="https://diarioderibera.example/local/puente-viejo-reabre/">El puente viejo reabre a peatones y bicicletas tras catorce meses de obras</a></li>
      <li><a href="https://diarioderibera.example/local/camino-del-molino-cortado/">Cortado al tráfico el camino del Molino por la crecida del río</a></li>
      <li><a href="https://diarioderibera.example/cultura/nocturno-del-molino/">La Banda Municipal estrena el 31 de octubre una obra de Lucía Ferrer</a></li>
      <li><a href="https://diarioderibera.example/local/autobus-nocturno/">El autobús nocturno amplía su horario los viernes</a></li>
    </ol>
  </aside>

  <aside class="site-aside weather" aria-labelledby="weather-title">
    <h2 id="weather-title">El tiempo</h2>
    <!-- Datos que se leen cruzando día y dato: una tabla, con sus cabeceras en las dos direcciones -->
    <div class="table-scroll" role="region" aria-labelledby="weather-caption" tabindex="0">
      <table>
        <caption id="weather-caption">Previsión para Ribera</caption>
        <thead>
          <tr>
            <th scope="col">Día</th>
            <th scope="col">Cielo</th>
            <th scope="col" class="num">Máxima</th>
            <th scope="col" class="num">Mínima</th>
          </tr>
        </thead>
        <tbody>
          <tr><th scope="row"><time datetime="2026-10-12">Lunes 12</time></th><td>Lluvia débil</td><td class="num">17&nbsp;°C</td><td class="num">11&nbsp;°C</td></tr>
          <tr><th scope="row"><time datetime="2026-10-13">Martes 13</time></th><td>Nubes y claros</td><td class="num">19&nbsp;°C</td><td class="num">10&nbsp;°C</td></tr>
          <tr><th scope="row"><time datetime="2026-10-14">Miércoles 14</time></th><td>Soleado</td><td class="num">22&nbsp;°C</td><td class="num">9&nbsp;°C</td></tr>
        </tbody>
      </table>
    </div>
    <p class="meta">Fuente: estación meteorológica municipal.</p>
  </aside>

  <footer class="site-footer">
    <!-- Un segundo nav, con su propio nombre: así no se confunde con el principal -->
    <nav aria-label="Secciones">
      <ul class="menu">
        <li><a href="https://diarioderibera.example/local/">Local</a></li>
        <li><a href="https://diarioderibera.example/comarca/">Comarca</a></li>
        <li><a href="https://diarioderibera.example/cultura/">Cultura</a></li>
        <li><a href="https://diarioderibera.example/opinion/">Opinión</a></li>
        <li><a href="https://diarioderibera.example/hemeroteca/">Hemeroteca</a></li>
      </ul>
    </nav>
    <address>Redacción: <a href="mailto:redaccion@diarioderibera.example">redaccion@diarioderibera.example</a> · <a href="tel:+34925000000">925 00 00 00</a></address>
    <p><small>© 2026 El Diario de Ribera · <a href="https://diarioderibera.example/aviso-legal/">Aviso legal</a> · <a href="https://diarioderibera.example/privacidad/">Privacidad</a></small></p>
  </footer>
</body>
</html>
```
