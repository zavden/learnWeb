---
example_description: "La página de documentación de una herramienta: menú lateral anidado con aria-current, índice, código escapado, salida con samp, teclas con kbd, tabla de opciones, avisos y paginación"
example_tags: "profesional|documentacion|nav|pre|code|kbd|samp|tablas"
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
  <title>Generar imágenes para srcset · Documentación de fotolote</title>
  <meta name="description" content="Cómo usar fotolote para crear las versiones de una foto que necesita un img con srcset y obtener el HTML listo para pegar.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <style>
    /* Solo legibilidad; el CSS se estudia en el capítulo 3 */
    .docs-nav { padding-block: 0.5rem; border-bottom: 1px solid #d1d5db; font-size: 0.95rem; }
    .docs-nav > ul { padding-left: 1.2rem; }
    .pager { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1rem; padding: 0; list-style: none; } /* flex (CSS) */
    td code, th code { white-space: nowrap; }
  </style>
  <!-- Herramienta del curso: revisa el documento y escribe el resultado en la consola -->
  <script defer src="js/audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://fotolote.example/">fotolote</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://fotolote.example/">Inicio</a></li>
        <li><a href="https://fotolote.example/docs/">Documentación</a></li>
        <li><a href="https://fotolote.example/descargas/">Descargas</a></li>
        <li><a href="https://fotolote.example/blog/">Blog</a></li>
      </ul>
    </nav>
  </header>

  <!-- El menú de la documentación: listas anidadas (cada sublista DENTRO de su li).
       Los nombres de grupo son texto, no títulos: así no ensucian el índice de títulos -->
  <nav class="site-aside docs-nav" aria-label="Documentación">
    <ul>
      <li>Primeros pasos
        <ul>
          <li><a href="https://fotolote.example/docs/instalacion/">Instalación</a></li>
          <li><a href="https://fotolote.example/docs/primer-lote/">Tu primer lote</a></li>
        </ul>
      </li>
      <li>Guías
        <ul>
          <li><a href="https://fotolote.example/docs/convertir-formatos/">Convertir formatos</a></li>
          <li><a href="https://fotolote.example/docs/srcset/" aria-current="page">Generar imágenes para srcset</a></li>
          <li><a href="https://fotolote.example/docs/marcas-de-agua/">Añadir marcas de agua</a></li>
        </ul>
      </li>
      <li>Referencia
        <ul>
          <li><a href="https://fotolote.example/docs/opciones/">Todas las opciones</a></li>
          <li><a href="https://fotolote.example/docs/configuracion/">El archivo de configuración</a></li>
        </ul>
      </li>
    </ul>
  </nav>

  <main id="content" class="site-main" tabindex="-1">
    <nav class="breadcrumbs" aria-label="Ruta de navegación">
      <ol class="menu">
        <li><a href="https://fotolote.example/docs/">Documentación</a> <span aria-hidden="true">›</span></li>
        <li><a href="https://fotolote.example/docs/guias/">Guías</a> <span aria-hidden="true">›</span></li>
        <li><a href="https://fotolote.example/docs/srcset/" aria-current="page">Generar imágenes para srcset</a></li>
      </ol>
    </nav>

    <article class="prose">
      <h1>Generar imágenes para <code>srcset</code></h1>
      <p class="lead">A partir de una foto grande, fotolote crea las versiones que necesita un <code>&lt;img srcset&gt;</code> y te escribe el HTML.</p>
      <p class="muted">Versión 2.4 · Actualizado el <time datetime="2026-09-30">30 de septiembre de 2026</time></p>

      <nav aria-labelledby="toc-title">
        <h2 id="toc-title">En esta página</h2>
        <ol>
          <li><a href="#requirements">Requisitos</a></li>
          <li><a href="#usage">Uso básico</a></li>
          <li><a href="#options">Opciones</a></li>
          <li><a href="#output">El HTML generado</a></li>
          <li><a href="#troubleshooting">Problemas frecuentes</a></li>
        </ol>
      </nav>

      <h2 id="requirements">Requisitos</h2>
      <ul>
        <li>Python 3.10 o posterior.</li>
        <li>Una foto en <abbr title="Joint Photographic Experts Group">JPEG</abbr> o <abbr title="Portable Network Graphics">PNG</abbr> de al menos 1920&nbsp;píxeles de ancho.</li>
      </ul>
      <p>Instala fotolote desde la terminal:</p>
      <!-- pre + code: un bloque de código. Su contenido va pegado al margen: la sangría se dibujaría -->
      <pre><code>python3 -m pip install fotolote</code></pre>

      <h2 id="usage">Uso básico</h2>
      <p>Abre una terminal en la carpeta de la foto y escribe el comando con los anchos que quieras:</p>
      <pre><code>fotolote srcset portada.jpg --anchos 480 960 1920</code></pre>
      <p>fotolote responde así:</p>
      <!-- samp: lo que RESPONDE un programa (kbd, en cambio, es lo que tecleas) -->
      <pre><samp>Leyendo portada.jpg (3000 × 2000 px)
✔ portada-480.webp   (38 KB)
✔ portada-960.webp   (112 KB)
✔ portada-1920.webp  (341 KB)
HTML guardado en portada.html</samp></pre>

      <figure>
        <img src="img/srcset-diagram.svg" alt="Esquema: fotolote convierte una foto de 3000 píxeles en tres archivos de 480, 960 y 1920 píxeles y escribe un img con srcset en el HTML." width="720" height="240">
        <figcaption>Figura 1. De una foto grande a tres archivos y una etiqueta.</figcaption>
      </figure>

      <p>Con muchas fotos, el proceso puede tardar. Para pararlo, pulsa <kbd>Ctrl</kbd>&nbsp;+&nbsp;<kbd>C</kbd>: los archivos ya creados se conservan.</p>

      <h2 id="options">Opciones</h2>
      <div class="table-scroll" role="region" aria-labelledby="options-caption" tabindex="0">
        <table>
          <caption id="options-caption">Opciones de <code>fotolote srcset</code></caption>
          <thead>
            <tr>
              <th scope="col">Opción</th>
              <th scope="col">Por defecto</th>
              <th scope="col">Qué hace</th>
            </tr>
          </thead>
          <tbody>
            <tr><th scope="row"><code>--anchos</code></th><td><code>480 960 1920</code></td><td>Los anchos, en píxeles, de cada versión.</td></tr>
            <tr><th scope="row"><code>--formato</code></th><td><code>webp</code></td><td>El formato de salida: <code>webp</code>, <code>avif</code> o <code>jpeg</code>.</td></tr>
            <tr><th scope="row"><code>--calidad</code></th><td><code>80</code></td><td>De 1 a 100. Por encima de 85 apenas se nota la mejora.</td></tr>
            <tr><th scope="row"><code>--sizes</code></th><td><code>100vw</code></td><td>El valor del atributo <code>sizes</code> del HTML.</td></tr>
            <tr><th scope="row"><code>--salida</code></th><td>La carpeta de la foto</td><td>Dónde se guardan los archivos nuevos.</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="output">El HTML generado</h2>
      <p>Este es el contenido de <code>portada.html</code>. Las etiquetas se escriben con <code>&amp;lt;</code> en esta página para que se vean como texto:</p>
      <pre><code>&lt;img src="portada-960.webp"
     srcset="portada-480.webp 480w, portada-960.webp 960w, portada-1920.webp 1920w"
     sizes="100vw"
     width="960" height="640"
     alt=""&gt;</code></pre>
      <p>Las dimensiones <code>width</code> y <code>height</code> son las del archivo de <code>src</code>: con ellas el navegador reserva el hueco de la imagen antes de descargarla.</p>
      <!-- Un aviso: strong marca lo que no hay que pasar por alto -->
      <div class="warning">
        <p><strong>Escribe tú el <code>alt</code>.</strong> fotolote no sabe qué muestra tu foto y lo deja vacío. Un <code>alt=""</code> le dice al lector de pantalla que la imagen es decorativa: cámbialo si la foto aporta información.</p>
      </div>

      <h2 id="troubleshooting">Problemas frecuentes</h2>
      <!-- Pareja problema → solución: una lista de descripción -->
      <dl class="facts">
        <dt><samp>Error: no se encuentra portada.jpg</samp></dt>
        <dd>La terminal no está en la carpeta de la foto. Escribe <kbd>ls</kbd> (<kbd>dir</kbd> en Windows) para ver qué archivos hay donde estás.</dd>
        <dt>El navegador siempre carga la versión grande</dt>
        <dd>Revisa <code>--sizes</code>: si la imagen ocupa media pantalla, usa <code>50vw</code>. Recuerda también que el navegador puede reutilizar una versión mayor que ya tenga en caché.</dd>
        <dt>Los colores salen apagados</dt>
        <dd>Tu foto usa un perfil de color distinto de sRGB. Añade <code>--convertir-srgb</code>.</dd>
      </dl>

      <!-- Anterior y siguiente: una navegación propia, con nombre; rel dice la relación entre páginas -->
      <nav aria-label="Paginación de la guía">
        <ul class="pager">
          <li><a href="https://fotolote.example/docs/convertir-formatos/" rel="prev">← Anterior: Convertir formatos</a></li>
          <li><a href="https://fotolote.example/docs/marcas-de-agua/" rel="next">Siguiente: Añadir marcas de agua →</a></li>
        </ul>
      </nav>
    </article>
  </main>

  <footer class="site-footer">
    <p>¿Falta algo en esta página? Escríbenos a <a href="mailto:docs@fotolote.example">docs@fotolote.example</a>.</p>
    <p><small>© 2026 Proyecto fotolote · Software libre con licencia MIT · <a href="https://git.example/fotolote">Código fuente de fotolote</a></small></p>
  </footer>
</body>
</html>
```
