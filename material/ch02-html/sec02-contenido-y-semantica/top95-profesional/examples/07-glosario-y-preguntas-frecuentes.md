---
example_description: "Un glosario con índice alfabético: listas de descripción con dfn, siglas, referencias cruzadas entre términos y una sección de preguntas frecuentes con details y summary"
example_tags: "profesional|glosario|dl|dfn|abbr|fragmentos|details"
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
  <title>Glosario de accesibilidad web · Accesible</title>
  <meta name="description" content="Los términos de accesibilidad web explicados en una frase: ARIA, contraste, foco, lector de pantalla, nombre accesible, regiones, WCAG y más.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <style>
    /* Solo legibilidad; el CSS se estudia en el capítulo 3 */
    .letters { font-size: 1.2rem; font-weight: 700; }
    .glossary dt { margin-top: 1rem; font-weight: 700; }
    .glossary dd { margin-left: 1.5rem; }
    .glossary dfn { font-style: normal; } /* dfn se ve en cursiva por defecto */
    details { margin-block: 0.5rem; padding: 0.5rem 1rem; border: 1px solid #d1d5db; border-radius: 6px; }
    summary { font-weight: 700; cursor: pointer; }
  </style>
  <!-- Herramienta del curso: revisa el documento y escribe el resultado en la consola -->
  <script defer src="js/audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://accesible.example/">Accesible</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://accesible.example/guias/">Guías</a></li>
        <li><a href="https://accesible.example/glosario/" aria-current="page">Glosario</a></li>
        <li><a href="https://accesible.example/contacto/">Contacto</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main prose" tabindex="-1">
    <h1>Glosario de accesibilidad web</h1>
    <p class="lead">Los términos que más se repiten al hablar de accesibilidad, explicados en una o dos frases. Cada uno tiene su propia dirección: puedes enlazarlo, por ejemplo, como <code>…/glosario/#accessible-name</code>.</p>

    <!-- Índice alfabético: solo las letras que tienen términos (un enlace sin destino frustra) -->
    <nav aria-label="Índice alfabético">
      <ul class="menu letters">
        <li><a href="#letter-a">A</a></li>
        <li><a href="#letter-c">C</a></li>
        <li><a href="#letter-e">E</a></li>
        <li><a href="#letter-f">F</a></li>
        <li><a href="#letter-l">L</a></li>
        <li><a href="#letter-n">N</a></li>
        <li><a href="#letter-r">R</a></li>
        <li><a href="#letter-t">T</a></li>
        <li><a href="#letter-w">W</a></li>
        <li><a href="#faq">Preguntas frecuentes</a></li>
      </ul>
    </nav>

    <!-- Un glosario es la lista de descripción por excelencia: término → definición.
         dfn marca el término que se define; el id del dt permite enlazarlo desde otras definiciones -->
    <section>
      <h2 id="letter-a">A</h2>
      <dl class="glossary">
        <dt id="accessibility"><dfn>Accesibilidad</dfn></dt>
        <dd>Que una web la pueda usar todo el mundo, incluidas las personas con discapacidad, con cualquier dispositivo y en cualquier situación: con el sol en la pantalla, con una mano ocupada o con una conexión lenta.</dd>

        <dt id="accessibility-tree"><dfn>Árbol de accesibilidad</dfn></dt>
        <dd>La versión del DOM que el navegador entrega a las <a href="#assistive-technology">tecnologías de asistencia</a>: cada nodo con su <a href="#role">rol</a>, su <a href="#accessible-name">nombre accesible</a> y su <a href="#state">estado</a>. Chrome lo muestra en DevTools, pestaña <b>Accessibility</b>.</dd>

        <!-- abbr dentro de dfn: se define una sigla; su forma completa, en inglés, con su lang -->
        <dt id="aria"><dfn><abbr>ARIA</abbr></dfn></dt>
        <dd>Siglas de <i lang="en">Accessible Rich Internet Applications</i>: los atributos <code>role</code> y <code>aria-*</code>, que añaden o cambian roles, nombres y estados. Solo cambian lo que se anuncia, no el comportamiento: si existe un elemento HTML nativo, úsalo.</dd>
      </dl>
    </section>

    <section>
      <h2 id="letter-c">C</h2>
      <dl class="glossary">
        <dt id="contrast"><dfn>Contraste</dfn></dt>
        <dd>La relación de luminosidad entre el color del texto y el de su fondo. Las <a href="#wcag">WCAG</a> piden al menos 4,5:1 para el texto normal y 3:1 para el texto grande y los bordes de los controles.</dd>
      </dl>
    </section>

    <section>
      <h2 id="letter-e">E</h2>
      <dl class="glossary">
        <dt id="state"><dfn>Estado</dfn></dt>
        <dd>Cómo está un elemento en este momento: pulsado, desactivado, expandido, inválido… Algunos los da el HTML (<code>disabled</code>) y otros, ARIA (<code>aria-expanded</code>). Tiene que actualizarse cada vez que cambia la interfaz.</dd>
      </dl>
    </section>

    <section>
      <h2 id="letter-f">F</h2>
      <dl class="glossary">
        <dt id="focus"><dfn>Foco</dfn></dt>
        <dd>El elemento que recibe lo que se teclea. Se mueve con <kbd>Tab</kbd> (y hacia atrás con <kbd>Mayús</kbd>&nbsp;+&nbsp;<kbd>Tab</kbd>) por enlaces, botones y campos, en el orden del HTML. Siempre tiene que verse.</dd>
      </dl>
    </section>

    <section>
      <h2 id="letter-l">L</h2>
      <dl class="glossary">
        <dt id="screen-reader"><dfn>Lector de pantalla</dfn></dt>
        <dd>Programa que lee en voz alta, o en una línea braille, lo que hay en la pantalla, y permite saltar por títulos, regiones, enlaces o tablas. Los más usados son NVDA y JAWS en Windows, VoiceOver en macOS e iOS y TalkBack en Android.</dd>
      </dl>
    </section>

    <section>
      <h2 id="letter-n">N</h2>
      <dl class="glossary">
        <dt id="accessible-name"><dfn>Nombre accesible</dfn></dt>
        <dd>Cómo se llama un elemento para las tecnologías de asistencia. Sale, por este orden, de <code>aria-labelledby</code>, de <code>aria-label</code>, del <code>label</code> o el <code>alt</code>, o del propio contenido. Un botón con solo un icono no tiene nombre.</dd>
      </dl>
    </section>

    <section>
      <h2 id="letter-r">R</h2>
      <dl class="glossary">
        <!-- Dos términos para una misma definición: dos dt seguidos y un dd -->
        <dt id="region"><dfn>Región</dfn></dt>
        <dt id="landmark"><i lang="en">Landmark</i></dt>
        <dd>Una zona de la página a la que se puede saltar directamente: la cabecera, la navegación, el contenido principal, el contenido complementario y el pie. Las crean <code>header</code>, <code>nav</code>, <code>main</code>, <code>aside</code> y <code>footer</code>.</dd>

        <dt id="role"><dfn>Rol</dfn></dt>
        <dd>Qué es un elemento: botón, enlace, título de nivel 2, campo de texto… Los elementos HTML traen el suyo de serie; con <a href="#aria">ARIA</a> se puede cambiar, pero casi nunca hace falta.</dd>
      </dl>
    </section>

    <section>
      <h2 id="letter-t">T</h2>
      <dl class="glossary">
        <dt id="assistive-technology"><dfn>Tecnologías de asistencia</dfn></dt>
        <dd>Programas y aparatos que ayudan a usar el ordenador: <a href="#screen-reader">lectores de pantalla</a>, magnificadores, control por voz, líneas braille o conmutadores.</dd>

        <dt id="alt-text"><dfn>Texto alternativo</dfn></dt>
        <dd>El atributo <code>alt</code> de una imagen: la información o la función que la imagen aporta en ese contexto. Vacío (<code>alt=""</code>) si es decorativa; nunca ausente.</dd>
      </dl>
    </section>

    <section>
      <h2 id="letter-w">W</h2>
      <dl class="glossary">
        <dt id="wcag"><dfn><abbr>WCAG</abbr></dfn></dt>
        <dd>Siglas de <i lang="en">Web Content Accessibility Guidelines</i>, las pautas de accesibilidad del <abbr title="World Wide Web Consortium">W3C</abbr>. La versión actual es la 2.2, de <time datetime="2023-10">octubre de 2023</time>. Las leyes europeas exigen el nivel AA.</dd>
      </dl>
    </section>

    <section>
      <h2 id="faq">Preguntas frecuentes</h2>
      <!-- details y summary: un desplegable nativo, accesible con teclado y que anuncia si está
           abierto o cerrado (lo verás a fondo en el módulo de formularios) -->
      <details>
        <summary>¿La accesibilidad es solo para personas ciegas?</summary>
        <p>No. También ayuda a quien no oye, a quien no puede usar el ratón, a quien amplía el texto, a quien tiene dificultades para concentrarse y, de paso, a cualquiera con prisa o con una pantalla pequeña.</p>
      </details>
      <details>
        <summary>¿Basta con pasar una herramienta automática?</summary>
        <p>No. Herramientas como Lighthouse detectan aproximadamente un tercio de los problemas. El resto exige probar: con el teclado, con el zoom al 200&nbsp;% y con un <a href="#screen-reader">lector de pantalla</a>.</p>
      </details>
      <details>
        <summary>¿Es obligatoria por ley?</summary>
        <p>Para las administraciones públicas de la Unión Europea, sí, desde hace años. Desde el <time datetime="2025-06-28">28 de junio de 2025</time>, la Ley Europea de Accesibilidad se aplica también a muchos servicios privados, como el comercio electrónico o la banca en línea.</p>
      </details>
      <details>
        <summary>¿Con ARIA se puede hacer accesible cualquier cosa?</summary>
        <p>ARIA solo cambia lo que se anuncia. Un <code>div</code> con <code>role="button"</code> se anuncia como botón, pero sigue sin recibir el foco ni responder al teclado. Por eso la primera regla de ARIA es no usarla cuando existe un elemento HTML que ya hace lo que necesitas.</p>
      </details>
    </section>
  </main>

  <footer class="site-footer">
    <p>¿Falta un término? Propónlo en <a href="mailto:glosario@accesible.example">glosario@accesible.example</a>.</p>
    <p><small>© 2026 Accesible · Textos con licencia <abbr title="Creative Commons Reconocimiento">CC BY</abbr> 4.0</small></p>
  </footer>
</body>
</html>
```
