---
example_description: "Una página completa que se recorre por regiones: skip link, menú en lista con aria-current, ruta de navegación, contenido, barra lateral y pie"
example_tags: "integracion|landmarks|nav|listas|aria-current|skip-link"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<!-- El primer elemento enfocable: aparece al pulsar Tab y salta el menú -->
<a class="skip-link" href="#content">Saltar al contenido</a>

<header>
  <!-- Una imagen con texto: su alt es ese mismo texto -->
  <img src="img/library-logo.svg" alt="Biblioteca Ribera Alta" width="240" height="64">
  <!-- Un menú es una lista de enlaces dentro de un nav con nombre.
       aria-current="page" marca la página en la que estás -->
  <nav aria-label="Principal">
    <ul>
      <li><a href="https://bibliotecaribera.example/">Inicio</a></li>
      <li><a href="https://bibliotecaribera.example/catalogo/">Catálogo</a></li>
      <li><a href="https://bibliotecaribera.example/agenda/" aria-current="page">Agenda</a></li>
      <li><a href="https://bibliotecaribera.example/socios/">Hazte socio</a></li>
    </ul>
  </nav>
</header>

<!-- tabindex="-1": el enlace de salto puede llevar aquí el foco (no entra en el recorrido con Tab) -->
<main id="content" tabindex="-1">
  <!-- La ruta es una jerarquía: el orden importa, así que es una ol.
       El separador › es decoración: aria-hidden evita que se lea -->
  <nav aria-label="Ruta de navegación">
    <ol class="breadcrumbs">
      <li><a href="https://bibliotecaribera.example/">Inicio</a> <span aria-hidden="true">›</span></li>
      <li><a href="https://bibliotecaribera.example/agenda/" aria-current="page">Agenda</a></li>
    </ol>
  </nav>

  <h1>Agenda de octubre</h1>
  <p>Todas las actividades son gratuitas. Las plazas de los talleres se reservan en el mostrador.</p>

  <!-- Las actividades van en orden de fecha: ol. Cada una es un article (tiene sentido sola) -->
  <ol class="events">
    <li>
      <article>
        <h2>Cuentacuentos: historias del río</h2>
        <p><time datetime="2026-10-08T18:00+02:00">Jueves 8, a las 18:00</time> · Sala infantil · De 4 a 8 años</p>
      </article>
    </li>
    <li>
      <article>
        <h2>Taller: dibuja tu árbol genealógico</h2>
        <p><time datetime="2026-10-15T18:30+02:00">Jueves 15, a las 18:30</time> · Aula 2 · Plazas limitadas</p>
      </article>
    </li>
    <li>
      <article>
        <h2>Club de lectura: <cite>Nada</cite>, de Carmen Laforet</h2>
        <p><time datetime="2026-10-22T19:00+02:00">Jueves 22, a las 19:00</time> · Sala de estudio</p>
      </article>
    </li>
    <li>
      <article>
        <h2>Noche de leyendas de Bécquer</h2>
        <!-- El 31 ya es horario de invierno: la zona horaria pasa a +01:00 -->
        <p><time datetime="2026-10-31T20:00+01:00">Sábado 31, a las 20:00</time> · Patio de la biblioteca</p>
      </article>
    </li>
  </ol>
</main>

<!-- aside: complementario. aria-labelledby le da como nombre el texto de su título -->
<aside aria-labelledby="hours-title">
  <h2 id="hours-title">Horario</h2>
  <dl>
    <dt>Lunes a viernes</dt>
    <dd>9:00–20:30</dd>
    <dt>Sábados</dt>
    <dd>10:00–14:00</dd>
    <dt>Domingos y festivos</dt>
    <dd>Cerrado</dd>
  </dl>
</aside>

<footer>
  <address>Biblioteca Ribera Alta · Plaza Mayor, 1 · <a href="tel:+34910000000">910 00 00 00</a></address>
</footer>
```

# CSS

```css
/* Solo para que se lea bien: el CSS se estudia en el capítulo 3 */
body {
  max-width: 44rem;
  margin: 0 auto;
  padding: 0 1rem;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: #1f2937;
}

/* Fuera de la vista hasta que recibe el foco (position: capítulo de CSS) */
.skip-link {
  position: absolute;
  top: -3rem;
  left: 1rem;
  padding: 0.5rem 1rem;
  background: #1d4ed8;
  color: #ffffff;
}

.skip-link:focus {
  top: 1rem;
}

/* flex coloca los elementos de las listas en fila (capítulo de CSS) */
nav ul,
.breadcrumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  padding: 0;
  list-style: none;
}

/* El estilo lee el mismo atributo que el lector de pantalla: nunca se contradicen */
[aria-current="page"] {
  font-weight: 700;
  color: #1f2937;
  text-decoration: none;
}

main:focus {
  outline: none; /* main solo recibe el foco para mover el punto de lectura */
}

:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}

.events h2 {
  margin-bottom: 0;
  font-size: 1.15rem;
}

aside,
footer {
  margin-top: 2rem;
  padding-top: 0.5rem;
  border-top: 1px solid #d1d5db;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Simulamos la lista de regiones que
// ofrece un lector de pantalla: el rol implícito de cada elemento y su nombre.
const ROLES = { header: 'banner', nav: 'navigation', main: 'main', aside: 'complementary', footer: 'contentinfo' };

console.group('Regiones (lo que lista un lector de pantalla)');
for (const region of document.querySelectorAll('header, nav, main, aside, footer')) {
  const labelledby = region.getAttribute('aria-labelledby');
  const name = region.getAttribute('aria-label') ?? (labelledby ? document.getElementById(labelledby).textContent : '');
  console.log(ROLES[region.localName] + (name ? ` «${name}»` : ''));
}
console.groupEnd();

console.log('página actual en el menú →', document.querySelector('header [aria-current="page"]').textContent);
const firstFocusable = document.querySelector('a[href], button');
console.log('primer Tab →', firstFocusable.textContent, '→', firstFocusable.getAttribute('href'));
console.log('actividades →', document.querySelectorAll('.events > li').length);
```
