---
example_description: "La segunda página de resultados de un catálogo: buscador con su etiqueta, número de resultados en una región viva, filtros, una ol que empieza en 11, coincidencias con mark y paginación accesible"
example_tags: "profesional|busqueda|ol|start|mark|aria-current|paginacion"
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
  <title>«huerto»: resultados 11 a 20 · Catálogo de la Red de Bibliotecas de Ribera</title>
  <meta name="description" content="Resultados de la búsqueda «huerto» en el catálogo de las bibliotecas de Ribera.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <style>
    /* Solo legibilidad; el CSS se estudia en el capítulo 3 */
    search { display: block; margin-block: 1rem; } /* search aún no tiene estilos en todos los navegadores */
    search input { font: inherit; padding: 0.3rem 0.5rem; }
    .results > li { padding-block: 0.75rem; border-bottom: 1px solid #d1d5db; }
    .results h3 { margin: 0; font-size: 1.1rem; }
    .results p { margin: 0.25rem 0 0; }
    .meta { font-size: 0.9rem; color: #4b5563; }
    .pagination { justify-content: center; margin-top: 1.5rem; }
    .pagination a { display: inline-block; padding: 0.25rem 0.6rem; }
  </style>
  <!-- Herramienta del curso: revisa el documento y escribe el resultado en la consola -->
  <script defer src="js/audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://bibliotecasderibera.example/">Red de Bibliotecas de Ribera</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://bibliotecasderibera.example/catalogo/" aria-current="page">Catálogo</a></li>
        <li><a href="https://bibliotecasderibera.example/agenda/">Agenda</a></li>
        <li><a href="https://bibliotecasderibera.example/transparencia/">Transparencia</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main prose" tabindex="-1">
    <h1>Resultados de búsqueda</h1>

    <!-- search: la región de búsqueda (rol «search»). El campo tiene su label: el placeholder no
         sirve de etiqueta. (Los formularios se estudian en el módulo siguiente.) -->
    <search>
      <form action="https://bibliotecasderibera.example/catalogo/buscar" method="get">
        <label for="query">Buscar en el catálogo</label>
        <input id="query" name="q" type="search" value="huerto">
        <button type="submit">Buscar</button>
      </form>
    </search>

    <!-- Región viva: si la búsqueda se actualizara sin recargar la página (con JavaScript),
         un lector de pantalla anunciaría el nuevo número de resultados -->
    <p role="status">24 resultados para <q>huerto</q> · página 2 de 3</p>

    <!-- Filtros: una navegación con nombre; el filtro activo, con aria-current -->
    <nav aria-label="Filtrar por tipo">
      <ul class="menu">
        <li><a href="https://bibliotecasderibera.example/catalogo/buscar?q=huerto" aria-current="page">Todo (24)</a></li>
        <li><a href="https://bibliotecasderibera.example/catalogo/buscar?q=huerto&amp;tipo=libro">Libros (17)</a></li>
        <li><a href="https://bibliotecasderibera.example/catalogo/buscar?q=huerto&amp;tipo=revista">Revistas (4)</a></li>
        <li><a href="https://bibliotecasderibera.example/catalogo/buscar?q=huerto&amp;tipo=pelicula">Películas (3)</a></li>
      </ul>
    </nav>

    <h2>Resultados 11 a 20</h2>
    <!-- Ordenados por relevancia: ol. start="11" porque es la segunda página: un lector de pantalla
         anuncia «11», y la numeración coincide con la de la página anterior.
         mark: las coincidencias con lo que se buscó (relevancia en ESTE contexto) -->
    <ol class="results" start="11">
      <li>
        <article>
          <h3><a href="https://bibliotecasderibera.example/catalogo/registro/48213"><mark>Huerto</mark> en casa: guía para balcones y terrazas</a></h3>
          <p class="meta">Clara Ibarra · <time datetime="2021">2021</time> · Libro</p>
          <p>Cómo cultivar en macetas, qué plantar según la orientación y cómo regar sin encharcar.</p>
          <p>Disponible en Central y Barrio del Molino.</p>
        </article>
      </li>
      <li>
        <article>
          <h3><a href="https://bibliotecasderibera.example/catalogo/registro/39120">Mi primer <mark>huerto</mark></a></h3>
          <p class="meta">Tomás Gil, con ilustraciones de Ana Ríos · <time datetime="2018">2018</time> · Libro infantil</p>
          <p>Un <mark>huerto</mark> en una caja de fruta, explicado para lectores de 6 a 9 años.</p>
          <p><strong>Prestado</strong> hasta el <time datetime="2026-10-20">20 de octubre</time>.</p>
        </article>
      </li>
      <li>
        <article>
          <h3><a href="https://bibliotecasderibera.example/catalogo/registro/30554"><mark>Huerto</mark> ecológico paso a paso</a></h3>
          <p class="meta">Lucía Martín · <time datetime="2016">2016</time> · Libro</p>
          <p>Del análisis de la tierra a la primera cosecha, sin productos químicos.</p>
          <p>Disponible en La Vega.</p>
        </article>
      </li>
      <li>
        <article>
          <h3><a href="https://bibliotecasderibera.example/catalogo/registro/51007"><cite>Tierra Viva</cite>, número 84: especial <mark>huertos</mark> urbanos</a></h3>
          <p class="meta"><time datetime="2025-05">Mayo de 2025</time> · Revista</p>
          <p>Reportajes sobre los <mark>huertos</mark> comunitarios de cinco ciudades.</p>
          <p>Solo para consulta en sala.</p>
        </article>
      </li>
      <li>
        <article>
          <h3><a href="https://bibliotecasderibera.example/catalogo/registro/44871">Cocina de <mark>huerto</mark>: cien recetas de temporada</a></h3>
          <p class="meta">Pedro Lasa · <time datetime="2020">2020</time> · Libro</p>
          <p>Recetas ordenadas por meses, con lo que da el <mark>huerto</mark> en cada estación.</p>
          <p>Disponible en Central.</p>
        </article>
      </li>
      <li>
        <article>
          <h3><a href="https://bibliotecasderibera.example/catalogo/registro/36220">El <mark>huerto</mark> del abuelo</a></h3>
          <p class="meta">Dirigida por Marta Solís · <time datetime="2017">2017</time> · Película documental</p>
          <p>Un año en la vida de un <mark>huerto</mark> familiar que pasa de una generación a otra.</p>
          <p>Disponible en Central.</p>
        </article>
      </li>
      <li>
        <article>
          <h3><a href="https://bibliotecasderibera.example/catalogo/registro/49932">Plagas del <mark>huerto</mark> sin química</a></h3>
          <p class="meta">Juan Ortega · <time datetime="2022">2022</time> · Libro</p>
          <p>Cómo reconocer pulgones, orugas y hongos, y cómo combatirlos con remedios naturales.</p>
          <p><strong>Prestado</strong> hasta el <time datetime="2026-10-27">27 de octubre</time>.</p>
        </article>
      </li>
      <li>
        <article>
          <h3><a href="https://bibliotecasderibera.example/catalogo/registro/40418">Calendario de siembra del <mark>huerto</mark> familiar</a></h3>
          <p class="meta">Rosa Vidal · <time datetime="2019">2019</time> · Libro</p>
          <p>Qué sembrar y qué cosechar cada mes, con tablas para climas fríos y templados.</p>
          <p>Disponible en Barrio del Molino.</p>
        </article>
      </li>
      <li>
        <article>
          <h3><a href="https://bibliotecasderibera.example/catalogo/registro/28761"><mark>Huertos</mark> escolares: proyectos para primaria</a></h3>
          <p class="meta"><abbr title="varios autores">VV.&nbsp;AA.</abbr> · <time datetime="2015">2015</time> · Libro</p>
          <p>Doce proyectos para trabajar las ciencias con un <mark>huerto</mark> en el colegio.</p>
          <p>Disponible en La Vega.</p>
        </article>
      </li>
      <li>
        <article>
          <h3><a href="https://bibliotecasderibera.example/catalogo/registro/52390">Semillas: cómo guardar y compartir las de tu propio <mark>huerto</mark></a></h3>
          <p class="meta">Ignacio Pardo · <time datetime="2023">2023</time> · Libro</p>
          <p>Técnicas para conservar variedades locales y montar un banco de semillas en tu barrio.</p>
          <p>Disponible en Central.</p>
        </article>
      </li>
    </ol>

    <!-- Paginación: navegación con nombre. Un «2» suelto no dice nada fuera de contexto:
         aria-label lo convierte en «Página 2». La página actual, con aria-current.
         En el href, el & se escribe &amp; -->
    <nav aria-label="Paginación">
      <ul class="menu pagination">
        <li><a href="https://bibliotecasderibera.example/catalogo/buscar?q=huerto&amp;pagina=1" rel="prev">Página anterior</a></li>
        <li><a href="https://bibliotecasderibera.example/catalogo/buscar?q=huerto&amp;pagina=1" aria-label="Página 1">1</a></li>
        <li><a href="https://bibliotecasderibera.example/catalogo/buscar?q=huerto&amp;pagina=2" aria-label="Página 2" aria-current="page">2</a></li>
        <li><a href="https://bibliotecasderibera.example/catalogo/buscar?q=huerto&amp;pagina=3" aria-label="Página 3">3</a></li>
        <li><a href="https://bibliotecasderibera.example/catalogo/buscar?q=huerto&amp;pagina=3" rel="next">Página siguiente</a></li>
      </ul>
    </nav>
  </main>

  <aside class="site-aside" aria-labelledby="not-found-title">
    <h2 id="not-found-title">¿No encuentras lo que buscas?</h2>
    <p>Podemos pedirlo prestado a otra biblioteca o comprarlo. <a href="mailto:catalogo@bibliotecasderibera.example?subject=Sugerencia%20de%20compra">Sugerir una compra por correo</a>.</p>
  </aside>

  <footer class="site-footer">
    <address>Red de Bibliotecas de Ribera · Plaza Mayor, 1 · <a href="tel:+34910000000">910 00 00 00</a></address>
    <p><small>© 2026 Ayuntamiento de Ribera · <a href="https://bibliotecasderibera.example/accesibilidad/">Accesibilidad</a></small></p>
  </footer>
</body>
</html>
```
