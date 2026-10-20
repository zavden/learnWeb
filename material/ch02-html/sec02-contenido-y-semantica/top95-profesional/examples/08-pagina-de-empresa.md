---
example_description: "La página «Quiénes somos» de un estudio: foto de equipo con pie que nombra a cada persona, historia en una lista ordenada con fechas, tarjetas del equipo, cifras, clientes y un testimonio"
example_tags: "profesional|empresa|equipo|figure|listas|time|address"
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
  <title>Quiénes somos · Estudio Lince, diseño y desarrollo web accesible</title>
  <meta name="description" content="Estudio Lince es un equipo de cuatro personas que diseña y programa webs accesibles desde 2016. Conoce al equipo y nuestra historia.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <style>
    /* Solo legibilidad; el CSS se estudia en el capítulo 3 */
    .history { padding-left: 0; list-style: none; border-left: 3px solid #1d4ed8; }
    .history li { padding: 0 0 1rem 1rem; }
    .history time { display: block; font-weight: 700; }
    .card img { display: block; border-radius: 50%; }
    .card h3 { margin-bottom: 0; }
    .key-figures { display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); gap: 1rem; } /* rejilla: grid (CSS) */
    .key-figures div { padding: 0.75rem; background: #f3f4f6; }
    .key-figures dd { margin: 0; font-size: 1.6rem; font-weight: 700; }
    .join { margin-top: 2rem; padding: 1rem; border: 2px solid #1d4ed8; border-radius: 8px; }
  </style>
  <!-- Herramienta del curso: revisa el documento y escribe el resultado en la consola -->
  <script defer src="js/audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://estudiolince.example/">Estudio Lince</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://estudiolince.example/servicios/">Servicios</a></li>
        <li><a href="https://estudiolince.example/proyectos/">Proyectos</a></li>
        <li><a href="https://estudiolince.example/quienes-somos/" aria-current="page">Quiénes somos</a></li>
        <li><a href="https://estudiolince.example/contacto/">Contacto</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Quiénes somos</h1>
    <p class="lead prose">Somos un estudio de cuatro personas que diseña y programa webs que funcionan para todo el mundo. Desde 2016, en Ribera.</p>

    <!-- Una foto de grupo: el alt describe la escena; el pie, que leen todos, nombra a cada persona -->
    <figure>
      <img src="img/team-photo.svg" alt="Las cuatro personas del estudio, de pie y sonrientes, delante de una pared lila." width="960" height="480">
      <figcaption>De izquierda a derecha: Nerea Lasa, Óscar Prieto, Carmen Ruiz y Daniel Okafor.</figcaption>
    </figure>

    <section class="prose">
      <h2>Qué hacemos</h2>
      <ul>
        <li>Webs para administraciones, asociaciones y pequeños comercios.</li>
        <li>Auditorías de accesibilidad según las pautas <abbr title="Pautas de Accesibilidad para el Contenido Web">WCAG</abbr> 2.2.</li>
        <li>Formación para equipos de diseño y de desarrollo.</li>
        <li>Mantenimiento: revisamos tus páginas cada trimestre para que sigan siendo accesibles.</li>
      </ul>
    </section>

    <section class="prose">
      <h2>Nuestra historia</h2>
      <!-- Una historia es cronológica: el orden importa, así que es una ol. Cada fecha, en un time -->
      <ol class="history">
        <li><time datetime="2016-03">Marzo de 2016</time> Nerea y Óscar abren el estudio en un bajo de la calle del Horno, con dos ordenadores y una mesa plegable.</li>
        <li><time datetime="2018-09">Septiembre de 2018</time> Primer encargo público: la nueva web de la Red de Bibliotecas de Ribera.</li>
        <li><time datetime="2021-02">Febrero de 2021</time> Carmen se une al equipo y empezamos a dar cursos de accesibilidad.</li>
        <li><time datetime="2024-05">Mayo de 2024</time> Llega Daniel, y con él las primeras auditorías para tiendas en línea.</li>
        <li><time datetime="2026-03">Marzo de 2026</time> Cumplimos diez años con más de ochenta webs publicadas.</li>
      </ol>
    </section>

    <section>
      <h2>El equipo</h2>
      <!-- Cada persona, un article en una lista. alt="" en el retrato: su nombre está al lado, en el h3.
           Los enlaces de contacto llevan el nombre: cuatro «Escríbele» serían indistinguibles -->
      <ul class="card-list">
        <li class="card">
          <article>
            <img src="img/portrait-a.svg" alt="" width="96" height="96">
            <h3>Nerea Lasa</h3>
            <p class="muted">Diseño de interfaces · Cofundadora</p>
            <p>Diseña pensando primero en el teclado y en la letra grande; el ratón viene después.</p>
            <p><a href="mailto:nerea@estudiolince.example">Escribir a Nerea</a></p>
          </article>
        </li>
        <li class="card">
          <article>
            <img src="img/portrait-b.svg" alt="" width="96" height="96">
            <h3>Óscar Prieto</h3>
            <p class="muted">Desarrollo · Cofundador</p>
            <p>Escribe el HTML de cada proyecto antes que una sola línea de CSS.</p>
            <p><a href="mailto:oscar@estudiolince.example">Escribir a Óscar</a></p>
          </article>
        </li>
        <li class="card">
          <article>
            <img src="img/portrait-c.svg" alt="" width="96" height="96">
            <h3>Carmen Ruiz</h3>
            <p class="muted">Formación y auditorías</p>
            <p>Lleva veinte años enseñando; ahora enseña a equipos a probar sus webs con un lector de pantalla.</p>
            <p><a href="mailto:carmen@estudiolince.example">Escribir a Carmen</a></p>
          </article>
        </li>
        <li class="card">
          <article>
            <img src="img/portrait-d.svg" alt="" width="96" height="96">
            <h3>Daniel Okafor</h3>
            <p class="muted">Desarrollo y comercio electrónico</p>
            <p>Convierte procesos de compra de siete pasos en procesos de tres que se pueden hacer sin ratón.</p>
            <p><a href="mailto:daniel@estudiolince.example">Escribir a Daniel</a></p>
          </article>
        </li>
      </ul>
    </section>

    <section>
      <h2>En cifras</h2>
      <!-- Parejas «dato → valor»: una lista de descripción; cada div agrupa una pareja -->
      <dl class="key-figures">
        <div><dt>Webs publicadas</dt><dd>84</dd></div>
        <div><dt>Auditorías</dt><dd>37</dd></div>
        <div><dt>Personas formadas</dt><dd>520</dd></div>
        <div><dt>Años</dt><dd>10</dd></div>
      </dl>
    </section>

    <section class="prose">
      <h2>Algunos clientes</h2>
      <ul>
        <li>Red de Bibliotecas de Ribera</li>
        <li>Ayuntamiento de Ribera</li>
        <li>Cooperativa agrícola La Huerta</li>
        <li>Festival de Cine de La Vega</li>
      </ul>

      <!-- Un testimonio: cita en bloque dentro de una figure; quién lo dice va en el pie -->
      <figure>
        <blockquote>
          <p>Nos explicaron cada decisión. Dos años después, seguimos aplicando lo que aprendimos en cada página nueva que publicamos.</p>
        </blockquote>
        <figcaption>— Laura Gómez, directora de la Red de Bibliotecas de Ribera</figcaption>
      </figure>
    </section>
  </main>

  <!-- Complementario y fuera del main: una oferta que no es parte del «quiénes somos» -->
  <aside class="site-aside" aria-labelledby="join-title">
    <div class="join">
      <h2 id="join-title">Trabaja con nosotros</h2>
      <p>Buscamos una persona para desarrollo web en prácticas a partir de enero. No hace falta experiencia: hacen falta ganas de aprender HTML de verdad.</p>
      <p><a href="mailto:empleo@estudiolince.example?subject=Pr%C3%A1cticas%20de%20desarrollo">Enviar mi candidatura por correo</a></p>
    </div>
  </aside>

  <footer class="site-footer">
    <!-- address: el contacto del estudio, responsable de esta web -->
    <address>Estudio Lince · Calle del Horno, 12, Ribera · <a href="mailto:hola@estudiolince.example">hola@estudiolince.example</a> · <a href="tel:+34925333444">925 33 34 44</a></address>
    <p><small>© 2026 Estudio Lince · <a href="https://estudiolince.example/accesibilidad/">Declaración de accesibilidad</a></small></p>
  </footer>
</body>
</html>
```
