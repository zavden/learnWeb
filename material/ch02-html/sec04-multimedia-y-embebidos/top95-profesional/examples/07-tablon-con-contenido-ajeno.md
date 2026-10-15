---
example_description: "Un tablón vecinal que embebe contenido de terceros con los permisos justos: mensajes de usuarios en sandbox vacío, una encuesta externa con allow-scripts allow-forms, un reproductor propio con allow, y una tabla que explica cada decisión"
example_tags: "profesional|iframe|sandbox|allow|srcdoc|seguridad|loading"
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
  <title>Tablón vecinal · Asociación de vecinos de Lavapiés</title>
  <meta name="description" content="Anuncios de los vecinos, la encuesta del mercado de trueque y el vídeo del mes de la Asociación de vecinos de Lavapiés.">
  <link rel="canonical" href="https://vecinoslavapies.example/tablon/">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/media-audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://vecinoslavapies.example/">Asociación de vecinos de Lavapiés</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://vecinoslavapies.example/tablon/" aria-current="page">Tablón</a></li>
        <li><a href="https://vecinoslavapies.example/actividades/">Actividades</a></li>
        <li><a href="https://vecinoslavapies.example/hazte-socia/">Hazte socia</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Tablón vecinal</h1>
    <p class="lead">Lo que publican los vecinos, tal como lo escriben: cada anuncio se muestra aislado del resto de la página.</p>

    <h2>Anuncios</h2>
    <!-- 1. Los anuncios son HTML escrito por cualquiera: pueden traer formato… o un script.
         sandbox="" (vacío) lo prohíbe TODO: ni scripts, ni formularios, ni ventanas, y un
         origen opaco (no ve nuestras cookies). El primero intenta cambiar el título de la
         página y el segundo abrir una ventana: ninguno de los dos lo consigue. -->
    <iframe sandbox="" title="Anuncio de Pilar: clases de bordado" width="560" height="96"
            srcdoc="<div style='font: 15px/1.5 system-ui, sans-serif; margin: .5rem'>
                      <p><strong>Pilar</strong> · Doy clases de bordado los martes por la tarde en el local de la asociación. ¡Trae tu bastidor!</p>
                      <script>parent.document.title = 'Página secuestrada';</script>
                    </div>"></iframe>
    <iframe sandbox="" title="Anuncio de Tomás: bicicleta infantil" width="560" height="96"
            srcdoc="<div style='font: 15px/1.5 system-ui, sans-serif; margin: .5rem'>
                      <p><strong>Tomás</strong> · Regalo una bicicleta infantil de 16 pulgadas. Fotos en <a href='https://tomas.example/fotos' target='_blank'>mi álbum</a>.</p>
                    </div>"></iframe>

    <h2>Encuesta del mes</h2>
    <!-- 2. Un widget de OTRA empresa (assets/embed/poll.html): necesita ejecutar su código y
         enviar su formulario, y nada más → allow-scripts allow-forms. Nunca allow-same-origin
         junto a allow-scripts: sería como no tener sandbox. -->
    <iframe src="embed/poll.html" sandbox="allow-scripts allow-forms"
            title="Encuesta vecinal: día del mercado de trueque" width="560" height="200"></iframe>

    <h2>El vídeo del mes</h2>
    <!-- 3. Nuestro propio reproductor (assets/embed/player.html): del mismo origen y de
         confianza, sin sandbox. Solo le damos los permisos que usa su vídeo, y loading="lazy". -->
    <iframe src="embed/player.html" title="Reproductor: el juego de la vida"
            width="560" height="340" loading="lazy"
            allow="fullscreen; picture-in-picture"></iframe>

    <h2>Qué puede hacer cada marco</h2>
    <table>
      <caption>Permisos de los contenidos embebidos en esta página</caption>
      <thead>
        <tr><th scope="col">Marco</th><th scope="col">Quién lo escribe</th><th scope="col">sandbox</th><th scope="col">allow</th></tr>
      </thead>
      <tbody>
        <tr><td>Anuncios</td><td>Cualquier vecino</td><td><code>""</code> (todo prohibido)</td><td>—</td></tr>
        <tr><td>Encuesta</td><td>Otra empresa</td><td><code>allow-scripts allow-forms</code></td><td>—</td></tr>
        <tr><td>Vídeo</td><td>Nosotros</td><td>sin sandbox</td><td><code>fullscreen; picture-in-picture</code></td></tr>
      </tbody>
    </table>
    <p class="note">Abre esta página en el editor para votar en la encuesta: en las tarjetas de la teoría, la propia tarjeta ya está en un sandbox sin <code>allow-forms</code>, y un marco nunca puede tener más permisos que su padre.</p>
  </main>

  <footer class="site-footer">
    <p>Asociación de vecinos de Lavapiés · <a href="https://vecinoslavapies.example/normas/">Normas del tablón</a></p>
  </footer>

  <script>
    // Adelanto: JavaScript se explica en su capítulo. Cuando todo ha cargado, comprueba que
    // ningún anuncio ha podido tocar la página.
    window.addEventListener('load', () => {
      console.log('título de la página →', document.title);
      console.log(document.title.startsWith('Tablón vecinal') ? '✅ ningún anuncio ha cambiado la página' : '❌ un anuncio ha cambiado la página');
    });
  </script>
</body>
</html>
```
