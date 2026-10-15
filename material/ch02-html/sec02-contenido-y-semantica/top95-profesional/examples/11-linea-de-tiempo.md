---
example_description: "Una línea de tiempo de la historia de la web: listas ordenadas que continúan su numeración con start, cada hito un artículo con su fecha en time, siglas, citas y una figura"
example_tags: "profesional|linea-de-tiempo|ol|start|time|abbr|q"
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
  <title>Breve historia de la web en dieciséis momentos · Web a fondo</title>
  <meta name="description" content="De la propuesta de Tim Berners-Lee en 1989 a WebGPU y la Ley Europea de Accesibilidad: dieciséis momentos que explican la web de hoy.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <style>
    /* Solo legibilidad; el CSS se estudia en el capítulo 3 */
    .timeline { padding-left: 2.5rem; border-left: 3px solid #1d4ed8; }
    .timeline > li { margin-bottom: 1.25rem; }
    .timeline > li::marker { font-weight: 700; color: #1d4ed8; } /* el número del hito (::marker: CSS) */
    .timeline h3 { margin: 0; font-size: 1.1rem; }
    .timeline h3 time { color: #1d4ed8; }
    .timeline p { margin: 0.25rem 0 0; }
  </style>
  <!-- Herramienta del curso: revisa el documento y escribe el resultado en la consola -->
  <script defer src="js/audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://webafondo.example/">Web a fondo</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://webafondo.example/curso/">Curso</a></li>
        <li><a href="https://webafondo.example/guias/">Guías</a></li>
        <li><a href="https://webafondo.example/historia/" aria-current="page">Historia</a></li>
        <li><a href="https://webafondo.example/glosario/">Glosario</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main prose" tabindex="-1">
    <article>
      <header>
        <h1>Breve historia de la web en dieciséis momentos</h1>
        <p class="lead">Casi todo lo que verás en este curso tiene una fecha de nacimiento. Conocerla explica por qué la web es como es, con sus aciertos y sus rarezas.</p>
        <p class="muted">Revisado el <time datetime="2026-10-01">1 de octubre de 2026</time></p>
      </header>

      <!-- Cada etapa es una section con su título; sus hitos, una ol (el orden es el contenido).
           start hace que la numeración continúe de una lista a la siguiente: 1–5, 6–10… -->
      <section>
        <h2>Los comienzos (1989–1993)</h2>
        <ol class="timeline">
          <li>
            <article>
              <h3><time datetime="1989-03">Marzo de 1989</time> · Una propuesta</h3>
              <!-- abbr desarrollada en el texto · q con lang: las comillas serán las inglesas -->
              <p>Tim Berners-Lee, informático de la Organización Europea para la Investigación Nuclear (<abbr>CERN</abbr>), propone un sistema de documentos enlazados. Su jefe anota en la portada: <q lang="en">Vague but exciting</q> («vago, pero emocionante»).</p>
            </article>
          </li>
          <li>
            <article>
              <h3><time datetime="1990-12">Diciembre de 1990</time> · La primera página</h3>
              <p>Funcionan el primer servidor web y el primer navegador, llamado WorldWideWeb, en un ordenador NeXT del CERN.</p>
              <figure>
                <img src="img/first-web-page.svg" alt="Una ventana de navegador antigua con el título World Wide Web, un párrafo de presentación y cuatro enlaces subrayados." width="640" height="400">
                <figcaption>Recreación de la primera página web. El original <a href="http://info.cern.ch/hypertext/WWW/TheProject.html">sigue publicado en info.cern.ch</a> (en inglés).</figcaption>
              </figure>
            </article>
          </li>
          <li>
            <article>
              <h3><time datetime="1991-08-06">6 de agosto de 1991</time> · La web sale del CERN</h3>
              <p>Berners-Lee anuncia el proyecto en un foro público de Internet e invita a cualquiera a montar su propio servidor.</p>
            </article>
          </li>
          <li>
            <article>
              <h3><time datetime="1993-04">Abril de 1993</time> · Mosaic</h3>
              <p>El navegador Mosaic, del <abbr title="National Center for Supercomputing Applications">NCSA</abbr> estadounidense, muestra las imágenes dentro del texto. La web empieza a parecerse a lo que conocemos.</p>
            </article>
          </li>
          <li>
            <article>
              <h3><time datetime="1993-04-30">30 de abril de 1993</time> · Gratis para siempre</h3>
              <p>El CERN libera el software de la web: <strong>cualquiera puede usarlo sin pagar ni pedir permiso</strong>. Es la decisión que permitió que la web creciera.</p>
            </article>
          </li>
        </ol>
      </section>

      <section>
        <h2>La guerra de los navegadores (1994–1999)</h2>
        <ol class="timeline" start="6">
          <li>
            <article>
              <h3><time datetime="1994-10">Octubre de 1994</time> · Nace el W3C</h3>
              <p>Berners-Lee funda el consorcio que escribirá los estándares de la web, el <abbr title="World Wide Web Consortium">W3C</abbr>.</p>
            </article>
          </li>
          <li>
            <article>
              <h3><time datetime="1994-12">Diciembre de 1994</time> · Netscape Navigator</h3>
              <p>El primer navegador comercial de éxito. Cada empresa añade sus propias etiquetas para ganar a la competencia, y las páginas empiezan a funcionar solo en un navegador.</p>
            </article>
          </li>
          <li>
            <article>
              <h3><time datetime="1995-12">Diciembre de 1995</time> · JavaScript</h3>
              <p>Netscape presenta el lenguaje que Brendan Eich había escrito en diez días. Su nombre era una estrategia comercial: no tiene casi nada que ver con Java.</p>
            </article>
          </li>
          <li>
            <article>
              <h3><time datetime="1996-12">Diciembre de 1996</time> · CSS</h3>
              <p>El W3C publica CSS nivel 1. Por fin el aspecto puede separarse del contenido, aunque los navegadores tardarán años en aplicarlo bien.</p>
            </article>
          </li>
          <li>
            <article>
              <h3><time datetime="1999-05">Mayo de 1999</time> · Las primeras pautas de accesibilidad</h3>
              <p>El W3C publica las <abbr title="Web Content Accessibility Guidelines">WCAG</abbr> 1.0, las primeras pautas para que la web funcione para todo el mundo.</p>
            </article>
          </li>
        </ol>
      </section>

      <section>
        <h2>HTML5 y los estándares vivos (2004–2014)</h2>
        <ol class="timeline" start="11">
          <li>
            <article>
              <h3><time datetime="2004-06">Junio de 2004</time> · El WHATWG</h3>
              <p>Apple, Mozilla y Opera crean su propio grupo de trabajo, el <abbr title="Web Hypertext Application Technology Working Group">WHATWG</abbr>, para hacer evolucionar HTML en lugar de sustituirlo. De ahí saldrá HTML5.</p>
            </article>
          </li>
          <li>
            <article>
              <h3><time datetime="2014-10">Octubre de 2014</time> · HTML5</h3>
              <p>El W3C publica HTML5 como recomendación: elementos como <code>&lt;nav&gt;</code>, <code>&lt;article&gt;</code> o <code>&lt;section&gt;</code>, vídeo y audio sin complementos y unas reglas del parser iguales para todos los navegadores.</p>
            </article>
          </li>
        </ol>
      </section>

      <section>
        <h2>La web como plataforma (2017–hoy)</h2>
        <ol class="timeline" start="13">
          <li>
            <article>
              <h3><time datetime="2017-03">Marzo de 2017</time> · WebAssembly</h3>
              <p>Los navegadores empiezan a ejecutar WebAssembly, un formato binario que permite llevar a la web programas escritos en C, C++ o Rust a una velocidad cercana a la nativa.</p>
            </article>
          </li>
          <li>
            <article>
              <h3><time datetime="2019-05">Mayo de 2019</time> · Un solo HTML</h3>
              <p>El W3C y el WHATWG acuerdan mantener una única versión de HTML: el <em>estándar vivo</em> del WHATWG, que se actualiza continuamente en lugar de publicar versiones numeradas.</p>
            </article>
          </li>
          <li>
            <article>
              <h3><time datetime="2023-05">Mayo de 2023</time> · WebGPU</h3>
              <p>Chrome activa WebGPU, que da a las páginas acceso directo a la tarjeta gráfica para dibujar en 3D y hacer cálculos en paralelo.</p>
            </article>
          </li>
          <li>
            <article>
              <h3><time datetime="2025-06-28">28 de junio de 2025</time> · Accesibilidad obligatoria</h3>
              <p>La Ley Europea de Accesibilidad empieza a aplicarse a muchos productos y servicios privados, como el comercio electrónico y la banca en línea.</p>
            </article>
          </li>
        </ol>
      </section>

      <!-- Un aside dentro del artículo: complementario, con nombre -->
      <aside aria-labelledby="more-title">
        <h2 id="more-title">Para saber más</h2>
        <ul>
          <li><a href="https://home.cern/science/computing/birth-web">El nacimiento de la web, en la web del CERN (en inglés)</a></li>
          <li><a href="https://whatwg.org/faq">Preguntas frecuentes del WHATWG (en inglés)</a></li>
        </ul>
      </aside>
    </article>
  </main>

  <footer class="site-footer">
    <p>¿Falta algún momento clave? Escríbenos a <a href="mailto:hola@webafondo.example">hola@webafondo.example</a>.</p>
    <p><small>© 2026 Web a fondo</small></p>
  </footer>
</body>
</html>
```
