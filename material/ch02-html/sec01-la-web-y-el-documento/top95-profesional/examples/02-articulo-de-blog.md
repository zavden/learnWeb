---
example_description: "Un artículo de blog completo: metadatos de artículo, autoría, fecha, figura y código escapado"
example_tags: "profesional|articulo|open-graph|entidades|time"
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
  <title>Qué pasa entre que pulsas Intro y ves la página · Blog de Web a fondo</title>
  <meta name="description" content="Un recorrido por los cuatro pasos que da el navegador: resolver la URL, pedir el documento por HTTP, construir el DOM y pintar los píxeles.">
  <meta name="author" content="Marta Ibáñez">
  <link rel="canonical" href="https://webafondo.example/blog/de-la-url-a-los-pixeles/">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">

  <!-- Open Graph de tipo artículo, con su fecha de publicación (módulo 4) -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="Qué pasa entre que pulsas Intro y ves la página">
  <meta property="og:description" content="Los cuatro pasos del navegador, explicados sin magia.">
  <meta property="og:url" content="https://webafondo.example/blog/de-la-url-a-los-pixeles/">
  <meta property="og:image" content="https://webafondo.example/blog/de-la-url-a-los-pixeles/portada.png">
  <meta property="article:published_time" content="2026-10-05T09:00:00+02:00">

  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <img src="img/logo.svg" alt="Web a fondo" width="200" height="48">
  </header>

  <main id="content">
    <article>
      <h1>Qué pasa entre que pulsas Intro y ves la página</h1>
      <!-- time: una fecha legible para personas y una exacta (datetime) para las máquinas -->
      <p>Por Marta Ibáñez · <time datetime="2026-10-05">5 de octubre de 2026</time> · 6&nbsp;min de lectura</p>

      <p>Escribes una dirección, pulsas Intro y, en unos 200&nbsp;ms, aparece una página. En ese tiempo el navegador ha dado cuatro pasos que conviene conocer, porque cada uno tiene sus propios errores.</p>

      <figure>
        <img src="img/pipeline.svg" alt="Esquema: URL, luego HTTP, luego el parser construye el DOM y por último el render pinta los píxeles" width="640" height="160">
        <figcaption>Los cuatro pasos, de izquierda a derecha.</figcaption>
      </figure>

      <h2 id="url">1. La URL</h2>
      <p>Primero separa la dirección en esquema, host, puerto y ruta, y pregunta al DNS la IP del host. Las rutas relativas de la página se resolverán después contra esta misma URL.</p>

      <h2 id="http">2. La petición HTTP</h2>
      <p>Con la conexión abierta, envía un <code>GET</code> y espera la respuesta: un código de estado, unas cabeceras y el cuerpo. La cabecera <code>Content-Type</code> le dice qué ha recibido y con qué codificación leerlo.</p>

      <h2 id="dom">3. El parser</h2>
      <p>El HTML llega como texto y el parser lo convierte en un árbol. Si encuentra <code>&lt;div&gt;</code> dentro de <code>&lt;p&gt;</code>, no se queja: cierra el párrafo y sigue. Por eso el DOM no siempre se parece a tu archivo.</p>

      <h2 id="render">4. Los píxeles</h2>
      <p>Con el DOM y el CSS calcula los estilos, coloca cada caja (layout), la pinta y monta las capas. Cambiar un color solo obliga a repintar; cambiar un ancho obliga a recolocar.</p>

      <p>¿Quieres probarlo? Abre DevTools, pestaña <strong>Network</strong>, y recarga cualquier web: verás los cuatro pasos en directo.</p>
    </article>
  </main>

  <footer class="site-footer">
    <p>© 2026 Web a fondo · <a href="#content">Volver arriba</a></p>
  </footer>
</body>
</html>
```
