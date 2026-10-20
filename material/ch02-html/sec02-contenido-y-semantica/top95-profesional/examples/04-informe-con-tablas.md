---
example_description: "Un informe de datos accesible: cifras clave en una lista de descripción, un gráfico con alt y su tabla, cabeceras de dos niveles con colgroup, grupos de filas con rowgroup y totales"
example_tags: "profesional|informe|tablas|scope|colgroup|rowgroup|figure"
example_stage: professional
example_importance: critical
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Memoria 2025: los datos · Red de Bibliotecas de Ribera</title>
  <meta name="description" content="Préstamos, socios y actividades de las bibliotecas de Ribera en 2025, con todas las tablas de datos.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <style>
    /* Solo legibilidad; el CSS se estudia en el capítulo 3 */
    .key-figures { display: grid; grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr)); gap: 1rem; } /* rejilla: grid (CSS) */
    .key-figures div { padding: 0.75rem 1rem; border-top: 4px solid #1d4ed8; background: #f3f4f6; }
    .key-figures dd { margin: 0; font-size: 1.6rem; font-weight: 700; }
    th[scope="colgroup"] { text-align: center; border-bottom: 1px solid #1f2937; }
    th[scope="rowgroup"] { background: #f3f4f6; }
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
        <li><a href="https://bibliotecasderibera.example/catalogo/">Catálogo</a></li>
        <li><a href="https://bibliotecasderibera.example/agenda/">Agenda</a></li>
        <li><a href="https://bibliotecasderibera.example/transparencia/" aria-current="page">Transparencia</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <article>
      <header class="prose">
        <h1>Memoria 2025: los datos</h1>
        <p class="lead">Un año de préstamos, socios y actividades en las cuatro bibliotecas de la red y el bibliobús.</p>
        <p class="muted">Publicado el <time datetime="2026-03-02">2 de marzo de 2026</time> · Datos del <time datetime="2025-01-01">1 de enero</time> al <time datetime="2025-12-31">31 de diciembre de 2025</time></p>
      </header>

      <!-- Cifras clave: parejas «dato → valor» = lista de descripción. Cada div agrupa una pareja -->
      <!-- Las secciones no llevan nombre: sus títulos ya bastan para navegar (sin nombre no son regiones) -->
      <section>
        <h2>Resumen</h2>
        <dl class="key-figures">
          <div><dt>Préstamos</dt><dd>29&nbsp;820</dd></div>
          <div><dt>Socios activos</dt><dd>6410</dd></div>
          <div><dt>Actividades</dt><dd>68</dd></div>
          <div><dt>Asistentes</dt><dd>2566</dd></div>
        </dl>
      </section>

      <section>
        <h2>Préstamos</h2>
        <p class="prose">La biblioteca central concentra algo más de la mitad de los préstamos. El bibliobús es el único servicio que crece en verano, cuando recorre las pedanías.</p>

        <!-- Un gráfico es una imagen con información: el alt resume lo que se ve y remite a la
             tabla, que tiene todos los números para quien no ve el gráfico (y para quien sí) -->
        <figure>
          <img src="img/loans-chart.svg" alt="Gráfico de barras con los préstamos de 2025 por biblioteca: Central, 15 860; Barrio del Molino, 7110; La Vega, 4780; Bibliobús, 2070. Los datos completos están en la tabla 1." width="720" height="300">
          <figcaption>Figura 1. Préstamos por biblioteca en 2025.</figcaption>
        </figure>

        <!-- Cabeceras en dos niveles: «Primer semestre» abarca dos columnas (scope="colgroup",
             con sus colgroup); «Biblioteca» y «Total» ocupan las dos filas de cabecera (rowspan) -->
        <div class="table-scroll" role="region" aria-labelledby="loans-caption" tabindex="0">
          <table aria-describedby="loans-note">
            <caption id="loans-caption">Tabla 1. Préstamos por biblioteca y trimestre (2025)</caption>
            <colgroup><col></colgroup>
            <colgroup span="2"></colgroup>
            <colgroup span="2"></colgroup>
            <colgroup><col></colgroup>
            <thead>
              <tr>
                <th scope="col" rowspan="2">Biblioteca</th>
                <th scope="colgroup" colspan="2">Primer semestre</th>
                <th scope="colgroup" colspan="2">Segundo semestre</th>
                <th scope="col" rowspan="2" class="num">Total</th>
              </tr>
              <tr>
                <th scope="col" class="num">Ene–mar</th>
                <th scope="col" class="num">Abr–jun</th>
                <th scope="col" class="num">Jul–sep</th>
                <th scope="col" class="num">Oct–dic</th>
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row">Central</th><td class="num">4120</td><td class="num">3980</td><td class="num">3410</td><td class="num">4350</td><td class="num">15&nbsp;860</td></tr>
              <tr><th scope="row">Barrio del Molino</th><td class="num">1860</td><td class="num">1790</td><td class="num">1520</td><td class="num">1940</td><td class="num">7110</td></tr>
              <tr><th scope="row">La Vega</th><td class="num">1240</td><td class="num">1180</td><td class="num">1050</td><td class="num">1310</td><td class="num">4780</td></tr>
              <tr><th scope="row">Bibliobús</th><td class="num">310</td><td class="num">420</td><td class="num">980</td><td class="num">360</td><td class="num">2070</td></tr>
            </tbody>
            <tfoot>
              <tr><th scope="row">Total</th><td class="num">7530</td><td class="num">7370</td><td class="num">6960</td><td class="num">7960</td><td class="num">29&nbsp;820</td></tr>
            </tfoot>
          </table>
        </div>
        <p id="loans-note" class="muted"><small>Un préstamo es un documento prestado una vez; las renovaciones no cuentan como préstamos nuevos.</small></p>
        <p><a href="files/loans-2025.csv" download="prestamos-2025.csv">Descargar la tabla 1 (CSV, 1 KB)</a></p>
      </section>

      <section>
        <h2>Actividades</h2>
        <p class="prose">Las actividades infantiles y las de adultos tuvieron las mismas sesiones, pero las infantiles reunieron a algo más de la mitad del público.</p>

        <!-- Varios tbody agrupan las filas; la primera fila de cada grupo es su cabecera (scope="rowgroup") -->
        <div class="table-scroll" role="region" aria-labelledby="activities-caption" tabindex="0">
          <table>
            <caption id="activities-caption">Tabla 2. Actividades culturales por público (2025)</caption>
            <thead>
              <tr>
                <th scope="col">Actividad</th>
                <th scope="col" class="num">Sesiones</th>
                <th scope="col" class="num">Asistentes</th>
              </tr>
            </thead>
            <tbody>
              <tr><th scope="rowgroup" colspan="3">Público infantil</th></tr>
              <tr><th scope="row">Cuentacuentos</th><td class="num">24</td><td class="num">1150</td></tr>
              <tr><th scope="row">Talleres de cómic</th><td class="num">10</td><td class="num">180</td></tr>
            </tbody>
            <tbody>
              <tr><th scope="rowgroup" colspan="3">Público adulto</th></tr>
              <tr><th scope="row">Club de lectura</th><td class="num">22</td><td class="num">396</td></tr>
              <tr><th scope="row">Charlas</th><td class="num">12</td><td class="num">840</td></tr>
            </tbody>
            <tfoot>
              <tr><th scope="row">Total</th><td class="num">68</td><td class="num">2566</td></tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section>
        <h2>Metodología</h2>
        <p class="prose">Los datos salen del sistema de gestión de la red y del registro de asistencia de cada actividad. Los socios activos son los que hicieron al menos un préstamo en el año. Las cifras de cinco o más dígitos se separan con un espacio, como recomienda la <abbr title="Real Academia Española">RAE</abbr>; las de cuatro, no.</p>
        <p class="prose">¿Echas en falta algún dato? Pídelo en <a href="mailto:transparencia@bibliotecasderibera.example">transparencia@bibliotecasderibera.example</a>.</p>
      </section>
    </article>
  </main>

  <footer class="site-footer">
    <address>Red de Bibliotecas de Ribera · Plaza Mayor, 1 · <a href="tel:+34910000000">910 00 00 00</a></address>
    <p><small>© 2026 Ayuntamiento de Ribera · <a href="https://bibliotecasderibera.example/accesibilidad/">Accesibilidad</a></small></p>
  </footer>
</body>
</html>
```
