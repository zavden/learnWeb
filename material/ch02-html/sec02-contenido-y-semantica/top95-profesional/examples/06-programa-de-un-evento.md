---
example_description: "La página de unas jornadas: datos clave, programa de dos días en tablas con salas en paralelo (rowspan y colspan), ponentes, cómo llegar e inscripción"
example_tags: "profesional|evento|programa|tablas|rowspan|time|address"
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
  <title>Programa · Jornadas de Accesibilidad Web de Ribera 2026</title>
  <meta name="description" content="Dos días de charlas y talleres sobre accesibilidad web, el 20 y 21 de noviembre de 2026 en Ribera. Gratis, con inscripción.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <style>
    /* Solo legibilidad; el CSS se estudia en el capítulo 3 */
    .schedule td p { margin: 0; }
    .schedule .speaker { font-size: 0.9rem; color: #4b5563; }
    .schedule td[colspan] { background: #f3f4f6; }
    .schedule td[rowspan] { background: #eff6ff; }
    .card img { display: block; border-radius: 50%; }
    .card h3 { margin-bottom: 0; }
    .card p { margin-top: 0.25rem; }
  </style>
  <!-- Herramienta del curso: revisa el documento y escribe el resultado en la consola -->
  <script defer src="js/audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://jornadas.bibliotecasderibera.example/">Jornadas de Accesibilidad Web · Ribera 2026</a></p>
    <!-- Una web de una sola página: el menú lleva a fragmentos de esta misma página -->
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="#programme">Programa</a></li>
        <li><a href="#speakers">Ponentes</a></li>
        <li><a href="#venue">Cómo llegar</a></li>
        <li><a href="#registration">Inscripción</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Jornadas de Accesibilidad Web 2026</h1>
    <p class="lead prose">Dos días para aprender a hacer webs que funcionen para todo el mundo: charlas cortas, talleres prácticos y una mesa redonda sobre la ley europea.</p>

    <!-- Datos clave: parejas «dato → valor». Fechas exactas en datetime -->
    <dl class="facts">
      <dt>Fechas</dt>
      <dd><time datetime="2026-11-20">Viernes 20</time> y <time datetime="2026-11-21">sábado 21 de noviembre de 2026</time></dd>
      <dt>Lugar</dt>
      <dd>Centro Cultural El Molino, Ribera</dd>
      <dt>Precio</dt>
      <dd>Gratis, con <a href="#registration">inscripción previa</a></dd>
      <dt>Organiza</dt>
      <dd>Red de Bibliotecas de Ribera</dd>
    </dl>

    <section>
      <h2 id="programme">Programa</h2>
      <p class="prose">Hay dos salas en paralelo. Los talleres duran dos horas y ocupan dos franjas de la tabla.</p>

      <h3>Viernes 20 de noviembre</h3>
      <!-- Cada sesión se lee cruzando hora y sala: una tabla. rowspan = un taller de dos horas;
           colspan = una sesión para las dos salas. Las horas, exactas y con zona horaria -->
      <div class="table-scroll" role="region" aria-labelledby="friday-caption" tabindex="0">
        <table class="schedule">
          <caption id="friday-caption">Programa del viernes 20</caption>
          <thead>
            <tr>
              <th scope="col">Hora</th>
              <th scope="col">Sala Grande</th>
              <th scope="col">Sala Pequeña</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row"><time datetime="2026-11-20T09:30+01:00">09:30</time></th>
              <td colspan="2"><p>Recepción y café</p></td>
            </tr>
            <tr>
              <th scope="row"><time datetime="2026-11-20T10:00+01:00">10:00</time></th>
              <td colspan="2"><p>Inauguración: la web es para todo el mundo</p><p class="speaker"><a href="#laura-gomez">Laura Gómez</a></p></td>
            </tr>
            <tr>
              <th scope="row"><time datetime="2026-11-20T11:00+01:00">11:00</time></th>
              <td rowspan="2"><p>Taller: prueba tu web con un lector de pantalla</p><p class="speaker"><a href="#ivan-herrera">Iván Herrera</a></p></td>
              <td><p>El texto alternativo, sin miedo</p><p class="speaker"><a href="#nuria-sanz">Nuria Sanz</a></p></td>
            </tr>
            <tr>
              <th scope="row"><time datetime="2026-11-20T12:00+01:00">12:00</time></th>
              <!-- La Sala Grande de las 12:00 ya la ocupa el taller de arriba: no se escribe -->
              <td><p>Tablas que se entienden</p><p class="speaker"><a href="#carlos-mora">Carlos Mora</a></p></td>
            </tr>
            <tr>
              <th scope="row"><time datetime="2026-11-20T13:00+01:00">13:00</time></th>
              <td colspan="2"><p>Comida</p></td>
            </tr>
            <tr>
              <th scope="row"><time datetime="2026-11-20T15:30+01:00">15:30</time></th>
              <td colspan="2"><p>Mesa redonda: la Ley Europea de Accesibilidad en la práctica</p><p class="speaker">Con todos los ponentes</p></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Sábado 21 de noviembre</h3>
      <div class="table-scroll" role="region" aria-labelledby="saturday-caption" tabindex="0">
        <table class="schedule">
          <caption id="saturday-caption">Programa del sábado 21</caption>
          <thead>
            <tr>
              <th scope="col">Hora</th>
              <th scope="col">Sala Grande</th>
              <th scope="col">Sala Pequeña</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row"><time datetime="2026-11-21T10:00+01:00">10:00</time></th>
              <td rowspan="2"><p>Taller: contraste y color en la práctica</p><p class="speaker"><a href="#sofia-lin">Sofía Lin</a></p></td>
              <td><p>Navegar sin ratón</p><p class="speaker"><a href="#pablo-ruiz">Pablo Ruiz</a></p></td>
            </tr>
            <tr>
              <th scope="row"><time datetime="2026-11-21T11:00+01:00">11:00</time></th>
              <td><p>ARIA: la letra pequeña</p><p class="speaker"><a href="#ivan-herrera">Iván Herrera</a></p></td>
            </tr>
            <tr>
              <th scope="row"><time datetime="2026-11-21T12:00+01:00">12:00</time></th>
              <td colspan="2"><p>Clausura y sorteo de libros</p></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h2 id="speakers">Ponentes</h2>
      <!-- Cada ponente, un artículo en una lista. El retrato lleva alt="" porque el nombre
           está justo al lado, en su título: un alt lo repetiría -->
      <ul class="card-list">
        <li class="card">
          <article>
            <img src="img/portrait-c.svg" alt="" width="96" height="96">
            <h3 id="laura-gomez">Laura Gómez</h3>
            <p class="muted">Directora de la Red de Bibliotecas de Ribera</p>
            <p>Lleva quince años llevando el catálogo de la biblioteca a quien no puede ir a la biblioteca.</p>
          </article>
        </li>
        <li class="card">
          <article>
            <img src="img/portrait-b.svg" alt="" width="96" height="96">
            <h3 id="ivan-herrera">Iván Herrera</h3>
            <p class="muted">Consultor de accesibilidad</p>
            <p>Usa un lector de pantalla a diario desde los doce años y enseña a otros a probar sus webs con él.</p>
          </article>
        </li>
        <li class="card">
          <article>
            <img src="img/portrait-e.svg" alt="" width="96" height="96">
            <h3 id="nuria-sanz">Nuria Sanz</h3>
            <p class="muted">Editora de contenidos</p>
            <p>Escribe los textos alternativos de un museo con más de diez mil piezas en línea.</p>
          </article>
        </li>
        <li class="card">
          <article>
            <img src="img/portrait-d.svg" alt="" width="96" height="96">
            <h3 id="carlos-mora">Carlos Mora</h3>
            <p class="muted">Periodista de datos</p>
            <p>Publica cada semana tablas y gráficos que tienen que entenderse sin verlos.</p>
          </article>
        </li>
        <li class="card">
          <article>
            <img src="img/portrait-f.svg" alt="" width="96" height="96">
            <h3 id="sofia-lin">Sofía Lin</h3>
            <p class="muted">Diseñadora de interfaces</p>
            <p>Diseña sistemas de color que pasan las pruebas de contraste a la primera.</p>
          </article>
        </li>
        <li class="card">
          <article>
            <img src="img/portrait-a.svg" alt="" width="96" height="96">
            <h3 id="pablo-ruiz">Pablo Ruiz</h3>
            <p class="muted">Desarrollador web</p>
            <p>Navega solo con el teclado por una lesión en la mano y lo cuenta sin dramatismo.</p>
          </article>
        </li>
      </ul>
    </section>

    <section>
      <h2 id="venue">Cómo llegar</h2>
      <!-- La dirección del LUGAR no va en address: address es el contacto de quien firma la página -->
      <p>Centro Cultural El Molino<br>Paseo del Río, 2, Ribera</p>
      <p>Desde la estación de tren son diez minutos a pie:</p>
      <ol>
        <li>Sal por la puerta principal y gira a la izquierda.</li>
        <li>Sigue la calle principal hasta el puente viejo.</li>
        <li>Cruza el puente: el centro cultural es el edificio de ladrillo de la derecha.</li>
      </ol>
    </section>

    <section>
      <h2 id="registration">Inscripción</h2>
      <p>La entrada es gratuita, pero las plazas están limitadas a 150 personas. <strong>Inscríbete antes del <time datetime="2026-11-13">13 de noviembre</time>.</strong></p>
      <!-- mailto con el asunto ya escrito, codificado en la URL (%C3%B3 = ó, %20 = espacio) -->
      <p><a href="mailto:jornadas@bibliotecasderibera.example?subject=Inscripci%C3%B3n%20Jornadas%202026">Inscribirme por correo</a> (jornadas@bibliotecasderibera.example)</p>
      <h3>Accesibilidad de las jornadas</h3>
      <ul>
        <li>Interpretación en lengua de signos española (<abbr>LSE</abbr>) en la Sala Grande.</li>
        <li>Subtitulado en directo de todas las charlas.</li>
        <li>Bucle magnético para audífonos en las dos salas.</li>
        <li>Acceso sin escalones y aseos adaptados.</li>
      </ul>
      <p>¿Necesitas algo más? Dínoslo al inscribirte.</p>
    </section>
  </main>

  <footer class="site-footer">
    <address>Organiza: Red de Bibliotecas de Ribera · <a href="mailto:jornadas@bibliotecasderibera.example">jornadas@bibliotecasderibera.example</a> · <a href="tel:+34910000000">910 00 00 00</a></address>
    <p><small>© 2026 Red de Bibliotecas de Ribera</small></p>
  </footer>
</body>
</html>
```
