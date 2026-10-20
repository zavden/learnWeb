---
example_description: "La página de una asignatura universitaria: ficha en una lista de descripción, profesorado, horario y evaluación en tablas, temario en listas anidadas, calendario con fechas exactas y bibliografía con cite"
example_tags: "profesional|universidad|asignatura|tablas|listas-anidadas|cite|time"
example_stage: professional
example_importance: useful
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Desarrollo Web (21407) · Grado en Ingeniería Informática · Universidad de Ribera</title>
  <meta name="description" content="Asignatura obligatoria de segundo curso: profesorado, horario, temario, evaluación, calendario y bibliografía del curso 2026-2027.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <style>
    /* Solo legibilidad; el CSS se estudia en el capítulo 3 */
    .course-facts { display: grid; grid-template-columns: max-content 1fr; gap: 0.25rem 1.5rem; } /* dos columnas: grid (CSS) */
    .course-facts dd { margin: 0; }
    .course-facts dt { font-weight: 700; }
    .teachers h3 { margin-bottom: 0; }
    .teachers p { margin-top: 0.25rem; }
    .syllabus > li { margin-bottom: 0.5rem; font-weight: 700; }
    .syllabus ol { font-weight: 400; }
  </style>
  <!-- Herramienta del curso: revisa el documento y escribe el resultado en la consola -->
  <script defer src="js/audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://uribera.example/">Universidad de Ribera</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://uribera.example/estudios/">Estudios</a></li>
        <li><a href="https://uribera.example/investigacion/">Investigación</a></li>
        <li><a href="https://uribera.example/campus/">Vida en el campus</a></li>
        <li><a href="https://sede.uribera.example/">Sede electrónica</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <nav class="breadcrumbs" aria-label="Ruta de navegación">
      <ol class="menu">
        <li><a href="https://uribera.example/estudios/">Estudios</a> <span aria-hidden="true">›</span></li>
        <li><a href="https://uribera.example/estudios/informatica/">Grado en Ingeniería Informática</a> <span aria-hidden="true">›</span></li>
        <li><a href="https://uribera.example/estudios/informatica/asignaturas/">Asignaturas</a> <span aria-hidden="true">›</span></li>
        <li><a href="https://uribera.example/estudios/informatica/asignaturas/21407/" aria-current="page">Desarrollo Web</a></li>
      </ol>
    </nav>

    <h1>Desarrollo Web</h1>
    <p class="lead prose">Cómo funciona la web por dentro y cómo construir páginas semánticas, accesibles y rápidas con HTML, CSS y JavaScript.</p>

    <!-- La ficha: parejas «dato → valor». Las siglas, desarrolladas en el propio texto -->
    <dl class="course-facts">
      <dt>Código</dt><dd>21407</dd>
      <dt>Créditos</dt><dd>6 créditos del sistema europeo de transferencia (<abbr>ECTS</abbr>)</dd>
      <dt>Curso</dt><dd>2.º · curso académico 2026-2027</dd>
      <dt>Semestre</dt><dd>Segundo: del <time datetime="2027-02-08">8 de febrero</time> al <time datetime="2027-05-28">28 de mayo de 2027</time></dd>
      <dt>Carácter</dt><dd>Obligatoria</dd>
      <dt>Idioma</dt><dd>Español</dd>
      <!-- Un archivo: el texto del enlace dice formato y tamaño -->
      <dt>Guía docente</dt><dd><a href="https://uribera.example/guias/21407-2026.pdf">Guía docente 2026-2027 (PDF, 240 KB)</a></dd>
    </dl>

    <nav aria-labelledby="toc-title">
      <h2 id="toc-title">En esta página</h2>
      <ol>
        <li><a href="#teachers">Profesorado</a></li>
        <li><a href="#schedule">Horario</a></li>
        <li><a href="#syllabus">Temario</a></li>
        <li><a href="#assessment">Evaluación</a></li>
        <li><a href="#calendar">Fechas importantes</a></li>
        <li><a href="#bibliography">Bibliografía</a></li>
      </ol>
    </nav>

    <section>
      <h2 id="teachers">Profesorado</h2>
      <!-- Aquí no va address: address es el contacto del autor de la PÁGINA (está en el pie) -->
      <ul class="teachers">
        <li>
          <h3>Dra. Beatriz Campos <small>(coordinadora)</small></h3>
          <p>Despacho 3.12 · <a href="mailto:beatriz.campos@uribera.example">beatriz.campos@uribera.example</a> · <a href="tel:+34925400112">925 40 01 12</a></p>
          <p>Tutorías: martes y jueves, de <time datetime="11:00">11:00</time> a <time datetime="13:00">13:00</time>.</p>
        </li>
        <li>
          <h3>Dr. Hugo Navarro</h3>
          <p>Despacho 3.07 · <a href="mailto:hugo.navarro@uribera.example">hugo.navarro@uribera.example</a> · <a href="tel:+34925400107">925 40 01 07</a></p>
          <p>Tutorías: miércoles, de <time datetime="16:00">16:00</time> a <time datetime="19:00">19:00</time>.</p>
        </li>
      </ul>
    </section>

    <section>
      <h2 id="schedule">Horario</h2>
      <div class="table-scroll" role="region" aria-labelledby="schedule-caption" tabindex="0">
        <table>
          <caption id="schedule-caption">Horario de clases del segundo semestre</caption>
          <thead>
            <tr>
              <th scope="col">Grupo</th>
              <th scope="col">Teoría (aula 2.04)</th>
              <th scope="col">Prácticas (laboratorio L1)</th>
            </tr>
          </thead>
          <tbody>
            <tr><th scope="row">A, mañana</th><td>Lunes y miércoles, 9:00–10:30</td><td>Jueves, 9:00–11:00</td></tr>
            <tr><th scope="row">B, tarde</th><td>Lunes y miércoles, 16:00–17:30</td><td>Jueves, 16:00–18:00</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="prose">
      <h2 id="syllabus">Temario</h2>
      <!-- El orden de los temas importa: ol. Cada subtema, en una sublista DENTRO de su tema -->
      <ol class="syllabus">
        <li>La web y el documento
          <ol>
            <li>Cliente, servidor, HTTP y URL</li>
            <li>Anatomía de un documento y el parser de HTML</li>
          </ol>
        </li>
        <li>Contenido y semántica
          <ol>
            <li>Texto, listas y enlaces</li>
            <li>Imágenes y tablas</li>
            <li>Estructura semántica y accesibilidad</li>
          </ol>
        </li>
        <li>CSS
          <ol>
            <li>La cascada y la herencia</li>
            <li>El modelo de cajas y el flujo</li>
            <li>Flexbox y Grid</li>
          </ol>
        </li>
        <li>JavaScript en el navegador
          <ol>
            <li>El DOM</li>
            <li>Eventos</li>
            <li>Peticiones con <code>fetch</code></li>
          </ol>
        </li>
      </ol>
    </section>

    <section>
      <h2 id="assessment">Evaluación</h2>
      <div class="table-scroll" role="region" aria-labelledby="assessment-caption" tabindex="0">
        <table>
          <caption id="assessment-caption">Evaluación continua</caption>
          <thead>
            <tr>
              <th scope="col">Actividad</th>
              <th scope="col" class="num">Peso</th>
              <th scope="col">Cuándo</th>
            </tr>
          </thead>
          <tbody>
            <tr><th scope="row">Cinco prácticas de laboratorio</th><td class="num">40&nbsp;%</td><td>Cada dos semanas</td></tr>
            <tr><th scope="row">Proyecto final: una web accesible</th><td class="num">30&nbsp;%</td><td>Entrega el <time datetime="2027-05-21">21 de mayo</time></td></tr>
            <tr><th scope="row">Examen final</th><td class="num">30&nbsp;%</td><td><time datetime="2027-06-02T09:00+02:00">2 de junio, 9:00</time></td></tr>
          </tbody>
          <tfoot>
            <tr><th scope="row">Total</th><td class="num">100&nbsp;%</td><td></td></tr>
          </tfoot>
        </table>
      </div>
      <p class="prose"><strong>Para aprobar hace falta al menos un 4 sobre 10 en el examen final.</strong> Quien no pueda seguir la evaluación continua puede pedir la evaluación única antes del <time datetime="2027-02-26">26 de febrero</time>.</p>
    </section>

    <section class="prose">
      <h2 id="calendar">Fechas importantes</h2>
      <ol>
        <li><time datetime="2027-02-08">Lunes 8 de febrero</time>: primera clase.</li>
        <li><time datetime="2027-02-26">Viernes 26 de febrero</time>: último día para pedir la evaluación única.</li>
        <li>Del <time datetime="2027-03-22">22</time> al <time datetime="2027-03-28">28 de marzo</time>: Semana Santa, sin clases.</li>
        <li><time datetime="2027-05-21">Viernes 21 de mayo</time>: entrega del proyecto final.</li>
        <li><time datetime="2027-06-02">Miércoles 2 de junio</time>: examen final.</li>
      </ol>
    </section>

    <section class="prose">
      <h2 id="bibliography">Bibliografía</h2>
      <!-- cite: el título de cada obra (con su idioma si no es el de la página) -->
      <ul>
        <li>Jon Duckett, <cite lang="en">HTML and CSS: Design and Build Websites</cite>. Wiley, 2011.</li>
        <li>Marijn Haverbeke, <cite lang="en">Eloquent JavaScript</cite>, 4.ª edición. No Starch Press, 2024.</li>
        <li>Heydon Pickering, <cite lang="en">Inclusive Design Patterns</cite>. Smashing Magazine, 2016.</li>
        <li><a href="https://developer.mozilla.org/es/">MDN Web Docs, la documentación de referencia de la web</a>.</li>
      </ul>
    </section>
  </main>

  <footer class="site-footer">
    <!-- address: el contacto de quien publica la página -->
    <address>Escuela Politécnica · Universidad de Ribera · Campus del Río · <a href="mailto:secretaria.politecnica@uribera.example">secretaria.politecnica@uribera.example</a></address>
    <p><small>© 2026 Universidad de Ribera · <a href="https://uribera.example/accesibilidad/">Accesibilidad</a> · <a href="https://uribera.example/privacidad/">Privacidad</a></small></p>
  </footer>
</body>
</html>
```
