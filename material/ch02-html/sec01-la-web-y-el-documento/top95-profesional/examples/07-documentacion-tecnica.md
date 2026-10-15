---
example_description: "Documentación técnica: índice con fragmentos, código escapado, kbd y abreviaturas"
example_tags: "profesional|documentacion|entidades|fragmentos|pre"
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
  <title>Servir tu web en local con Python · Guías de Web a fondo</title>
  <meta name="description" content="Cómo probar tus páginas con un servidor local en un minuto, por qué file:// no basta y qué hacer si el puerto está ocupado.">
  <link rel="canonical" href="https://webafondo.example/guias/servidor-local/">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <img src="img/logo.svg" alt="Web a fondo" width="200" height="48">
  </header>

  <main id="content">
    <h1>Servir tu web en local con Python</h1>
    <p>Actualizado el <time datetime="2026-09-30">30 de septiembre de 2026</time>.</p>

    <!-- Índice: cada enlace #fragmento apunta al id de una sección. El fragmento no viaja
         al servidor: el navegador solo hace scroll hasta el elemento. -->
    <h2 id="toc">En esta guía</h2>
    <ol>
      <li><a href="#why">Por qué no basta con abrir el archivo</a></li>
      <li><a href="#start">Arrancar el servidor</a></li>
      <li><a href="#port-in-use">Si el puerto está ocupado</a></li>
    </ol>

    <h2 id="why">1. Por qué no basta con abrir el archivo</h2>
    <p>Al hacer doble clic en un <code>.html</code>, el navegador lo abre con una URL <code>file://</code>. No hay servidor ni <abbr title="Hypertext Transfer Protocol">HTTP</abbr>: las rutas que empiezan por <code>/</code> apuntan a la raíz de tu disco, y funciones como <code>fetch</code> fallan. Con un servidor local, la página se comporta igual que publicada.</p>

    <h2 id="start">2. Arrancar el servidor</h2>
    <p>Abre una terminal en la carpeta de tu web y ejecuta:</p>
    <pre><code>cd mi-web
python3 -m http.server 8000</code></pre>
    <p>Después abre <code>http://localhost:8000/</code>. Si tu carpeta tiene un <code>index.html</code>, es lo que verás. Para pararlo, pulsa <kbd>Ctrl</kbd>&nbsp;+&nbsp;<kbd>C</kbd> en la terminal.</p>
    <p>Para comprobar que todo carga, este es el esqueleto mínimo de <code>index.html</code>; fíjate en que las etiquetas se escriben con <code>&amp;lt;</code> y <code>&amp;gt;</code> para que se vean como texto:</p>
    <pre><code>&lt;!DOCTYPE html&gt;
&lt;html lang="es"&gt;
  &lt;head&gt;
    &lt;meta charset="utf-8"&gt;
    &lt;title&gt;Mi web&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;¡Funciona!&lt;/h1&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>

    <h2 id="port-in-use">3. Si el puerto está ocupado</h2>
    <p>Si la terminal muestra <code>OSError: [Errno 48] Address already in use</code>, otro programa usa ya el puerto 8000. Elige otro número: <code>python3 -m http.server 8080</code>, y abre <code>http://localhost:8080/</code>.</p>

    <p><a href="#toc">Volver al índice</a></p>
  </main>

  <footer class="site-footer">
    <p>© 2026 Web a fondo · ¿Ves un error en esta guía? <a href="mailto:guias@webafondo.example">Cuéntanoslo</a></p>
  </footer>
</body>
</html>
```
