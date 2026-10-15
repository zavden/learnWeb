---
example_description: "Landing optimizada: precarga de la imagen principal y carga diferida de las demás"
example_tags: "profesional|rendimiento|preload|lazy|recursos"
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
  <title>Café Aroma · Café de especialidad tostado cada semana en Valencia</title>
  <meta name="description" content="Cafés de origen único tostados cada martes en Valencia y enviados en 24 horas. Suscripción sin permanencia.">
  <link rel="canonical" href="https://cafe-aroma.example/">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Café Aroma">
  <meta property="og:url" content="https://cafe-aroma.example/">
  <meta property="og:image" content="https://cafe-aroma.example/img/og-portada.jpg">

  <!-- Pistas de recursos (módulo 4). La imagen principal es lo más importante de la
       página: preload la pide ya, antes de que el parser llegue a su etiqueta. -->
  <link rel="preload" href="img/hero-cup.svg" as="image" fetchpriority="high">
  <!-- Si usaras fuentes de otro dominio, preconnect adelantaría el DNS, TCP y TLS:
       <link rel="preconnect" href="https://fuentes.example" crossorigin> -->
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p><strong>Café Aroma</strong> · Tostadores en Valencia desde 2014</p>
  </header>

  <main id="content">
    <h1>Café recién tostado, en tu casa en 24&nbsp;horas</h1>
    <!-- La imagen visible al cargar: prioridad alta. width y height reservan su hueco
         antes de que llegue, para que el texto no salte (lo verás en el módulo 2). -->
    <img src="img/hero-cup.svg" alt="Taza de café humeante sobre un fondo amarillo" width="960" height="480" fetchpriority="high">
    <p>Tostamos cada martes pequeños lotes de cafés de origen único y te los enviamos ese mismo día. Sin permanencia: pausa o cancela tu suscripción cuando quieras.</p>
    <p><a href="#origins">Descubre los orígenes de esta semana</a></p>

    <h2 id="origins">Orígenes de esta semana</h2>
    <!-- Imágenes fuera de la pantalla inicial: loading="lazy" no las pide hasta que
         te acercas a ellas con el scroll. Mira la consola antes y después de bajar. -->
    <img src="img/origin-1.svg" alt="Montañas de Huila, Colombia" width="480" height="320" loading="lazy" decoding="async">
    <p><strong>Colombia, Huila</strong> · panela, naranja y cacao.</p>
    <img src="img/origin-2.svg" alt="Colinas verdes de Nyeri, Kenia" width="480" height="320" loading="lazy" decoding="async">
    <p><strong>Kenia, Nyeri</strong> · grosella negra y pomelo.</p>
    <img src="img/origin-3.svg" alt="Valle de Cajamarca, Perú, al atardecer" width="480" height="320" loading="lazy" decoding="async">
    <p><strong>Perú, Cajamarca</strong> · caramelo, nuez y ciruela.</p>
  </main>

  <footer class="site-footer">
    <p>© 2026 Café Aroma · Envío gratis a partir de 35&nbsp;€</p>
  </footer>

  <script>
    // Qué imágenes se han descargado al terminar la carga (JavaScript solo para mirar).
    // performance.getEntriesByType('resource') es el registro de descargas de la lección 1.
    addEventListener('load', () => {
      const downloaded = performance.getEntriesByType('resource').map((entry) => entry.name);
      for (const image of document.images) {
        const file = image.getAttribute('src');
        const done = downloaded.some((name) => name.endsWith(file));
        console.log(file.padEnd(20), image.loading.padEnd(6), done ? '→ descargada' : '→ aún no (lazy, fuera de pantalla)');
      }
    });
  </script>
</body>
</html>
```
