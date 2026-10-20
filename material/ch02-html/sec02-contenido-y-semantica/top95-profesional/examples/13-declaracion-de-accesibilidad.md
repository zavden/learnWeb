---
example_description: "La declaración de accesibilidad de un sitio público: estructura de títulos de un texto legal, listas de incumplimientos con sus criterios, fechas, contacto con address y una tabla de resultados por principio"
example_tags: "profesional|accesibilidad|declaracion|wcag|tablas|address|abbr"
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
  <title>Declaración de accesibilidad · Red de Bibliotecas de Ribera</title>
  <meta name="description" content="Situación de cumplimiento, contenido no accesible, fecha de revisión y cómo comunicarnos un problema de accesibilidad en la web de la Red de Bibliotecas de Ribera.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <style>
    /* Solo legibilidad; el CSS se estudia en el capítulo 3 */
    .status { padding: 0.75rem 1rem; border-left: 4px solid #b45309; background: #fffbeb; }
    .contact-list { padding-left: 1.2rem; }
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
        <li><a href="https://bibliotecasderibera.example/transparencia/">Transparencia</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main prose" tabindex="-1">
    <nav class="breadcrumbs" aria-label="Ruta de navegación">
      <ol class="menu">
        <li><a href="https://bibliotecasderibera.example/">Inicio</a> <span aria-hidden="true">›</span></li>
        <li><a href="https://bibliotecasderibera.example/accesibilidad/" aria-current="page">Declaración de accesibilidad</a></li>
      </ol>
    </nav>

    <article>
      <h1>Declaración de accesibilidad</h1>
      <!-- Un texto legal largo: sus títulos (h2 y h3, sin saltos) son su índice -->
      <p>La Red de Bibliotecas de Ribera se ha comprometido a hacer accesible su sitio web de conformidad con el Real Decreto 1112/2018, de 7 de septiembre, sobre accesibilidad de los sitios web y aplicaciones para dispositivos móviles del sector público.</p>
      <p>Esta declaración se aplica a <code>bibliotecasderibera.example</code> y a su catálogo en línea.</p>

      <h2>Situación de cumplimiento</h2>
      <p class="status">Este sitio web es <strong>parcialmente conforme</strong> con el Real Decreto 1112/2018 debido a las excepciones y a la falta de conformidad de los aspectos que se indican a continuación.</p>

      <h2>Contenido no accesible</h2>
      <p>El contenido que se recoge a continuación no es accesible por lo siguiente:</p>

      <h3>Falta de conformidad con el Real Decreto 1112/2018</h3>
      <!-- Cada problema dice qué falla y qué requisito incumple: el de la norma europea
           UNE-EN 301549:2022 y su equivalente en las pautas WCAG -->
      <ul>
        <li>Algunas imágenes antiguas de la agenda no tienen texto alternativo (requisito 9.1.1.1 de la norma UNE-EN 301549:2022; criterio 1.1.1 de las pautas de accesibilidad para el contenido web, <abbr>WCAG</abbr>).</li>
        <li>Varios botones del catálogo no tienen suficiente contraste con su fondo (requisito 9.1.4.3; criterio 1.4.3 de las WCAG).</li>
        <li>En las fichas del catálogo, el foco del teclado no siempre es visible (requisito 9.2.4.7; criterio 2.4.7 de las WCAG).</li>
      </ul>
      <p>Está previsto corregir los tres problemas antes del <time datetime="2027-03-31">31 de marzo de 2027</time>.</p>

      <h3>Carga desproporcionada</h3>
      <p>No aplica.</p>

      <h3>Contenido que no entra en el ámbito de la legislación aplicable</h3>
      <ul>
        <li>Documentos <abbr title="Portable Document Format">PDF</abbr> publicados antes del <time datetime="2018-09-20">20 de septiembre de 2018</time>: las memorias anuales de 2010 a 2017.</li>
      </ul>

      <h2>Preparación de esta declaración</h2>
      <!-- Las fechas, exactas para las máquinas -->
      <p>Esta declaración se preparó el <time datetime="2026-03-15">15 de marzo de 2026</time>. El método empleado ha sido una autoevaluación llevada a cabo por la propia organización, con herramientas automáticas, navegación con teclado y pruebas con dos lectores de pantalla.</p>
      <p>Última revisión: <time datetime="2026-09-30">30 de septiembre de 2026</time>.</p>

      <h2>Resumen de la última revisión</h2>
      <div class="table-scroll" role="region" aria-labelledby="review-caption" tabindex="0">
        <table>
          <caption id="review-caption">Criterios de nivel A y AA revisados, por principio de las WCAG 2.1</caption>
          <thead>
            <tr>
              <th scope="col">Principio</th>
              <th scope="col" class="num">Criterios</th>
              <th scope="col" class="num">Cumplen</th>
              <th scope="col" class="num">No cumplen</th>
              <th scope="col" class="num">No aplican</th>
            </tr>
          </thead>
          <tbody>
            <tr><th scope="row">Perceptible</th><td class="num">20</td><td class="num">13</td><td class="num">2</td><td class="num">5</td></tr>
            <tr><th scope="row">Operable</th><td class="num">17</td><td class="num">16</td><td class="num">1</td><td class="num">0</td></tr>
            <tr><th scope="row">Comprensible</th><td class="num">10</td><td class="num">10</td><td class="num">0</td><td class="num">0</td></tr>
            <tr><th scope="row">Robusto</th><td class="num">3</td><td class="num">3</td><td class="num">0</td><td class="num">0</td></tr>
          </tbody>
          <tfoot>
            <tr><th scope="row">Total</th><td class="num">50</td><td class="num">42</td><td class="num">3</td><td class="num">5</td></tr>
          </tfoot>
        </table>
      </div>
      <p>Los cinco criterios que no aplican son los de audio y vídeo: la web no publica contenido multimedia.</p>

      <h2>Observaciones y datos de contacto</h2>
      <p>Puedes comunicarnos cualquier problema de accesibilidad que encuentres, o pedirnos un contenido en un formato accesible:</p>
      <!-- address: el contacto de quien es responsable de este contenido -->
      <address>
        <ul class="contact-list">
          <li>Por correo electrónico: <a href="mailto:accesibilidad@bibliotecasderibera.example?subject=Problema%20de%20accesibilidad">accesibilidad@bibliotecasderibera.example</a></li>
          <li>Por teléfono: <a href="tel:+34910000000">910 00 00 00</a>, de lunes a viernes de <time datetime="09:00">9:00</time> a <time datetime="14:00">14:00</time></li>
          <li>En persona: mostrador de la Biblioteca Central, Plaza Mayor, 1, Ribera</li>
        </ul>
      </address>
      <p>Te responderemos en un plazo máximo de <strong>veinte días hábiles</strong>.</p>

      <h2>Procedimiento de reclamación</h2>
      <p>Si no recibes respuesta en ese plazo, o la respuesta no te satisface, puedes presentar una reclamación ante la unidad responsable de accesibilidad del Ayuntamiento de Ribera, a través de su <a href="https://sede.ribera.example/reclamaciones-accesibilidad/">formulario de reclamaciones de accesibilidad</a>.</p>
    </article>
  </main>

  <footer class="site-footer">
    <p><small>© 2026 Ayuntamiento de Ribera · <a href="https://bibliotecasderibera.example/privacidad/">Privacidad</a></small></p>
  </footer>
</body>
</html>
```
