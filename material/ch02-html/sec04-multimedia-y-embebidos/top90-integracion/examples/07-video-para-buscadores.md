---
example_description: "La página de un vídeo preparada para buscadores y redes: description, Open Graph de vídeo, la tarjeta «player» de X (que embebe tu reproductor en un iframe) y JSON-LD VideoObject, revisados por un pequeño rastreador"
example_tags: "integracion|video|meta|open-graph|twitter-card|json-ld|iframe|crawler"
example_stage: intermediate
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
  <title>El juego de la vida en 12 segundos · Lecciones del Club de Ciencia</title>
  <meta name="description" content="Un autómata celular de 1970 explicado en un vídeo de 12 segundos: celdas que nacen y mueren según sus vecinas.">
  <link rel="canonical" href="https://clubdeciencia.example/lecciones/juego-de-la-vida/">

  <!-- Open Graph de un vídeo: la miniatura (og:image) y el archivo (og:video) -->
  <meta property="og:type" content="video.other">
  <meta property="og:title" content="El juego de la vida en 12 segundos">
  <meta property="og:url" content="https://clubdeciencia.example/lecciones/juego-de-la-vida/">
  <meta property="og:image" content="https://clubdeciencia.example/lecciones/juego-de-la-vida/poster.jpg">
  <meta property="og:video" content="https://clubdeciencia.example/lecciones/juego-de-la-vida/life.mp4">

  <!-- La tarjeta «player» de X: la red EMBEBE tu reproductor en un iframe dentro del post.
       Por eso apunta a una página de reproductor (como assets/player.html), no al .mp4. -->
  <meta name="twitter:card" content="player">
  <meta name="twitter:player" content="https://clubdeciencia.example/embed/juego-de-la-vida/">
  <meta name="twitter:player:width" content="640">
  <meta name="twitter:player:height" content="360">

  <!-- JSON-LD VideoObject: datos para los resultados de vídeo. Nunca se ejecuta. -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "El juego de la vida en 12 segundos",
    "description": "Celdas que nacen y mueren según sus vecinas, con música de fondo.",
    "thumbnailUrl": "https://clubdeciencia.example/lecciones/juego-de-la-vida/poster.jpg",
    "uploadDate": "2026-10-01",
    "duration": "PT12S",
    "contentUrl": "https://clubdeciencia.example/lecciones/juego-de-la-vida/life.mp4",
    "embedUrl": "https://clubdeciencia.example/embed/juego-de-la-vida/"
  }
  </script>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 42rem; padding: 0 1rem; }
    video { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <h1>El juego de la vida en 12 segundos</h1>
  <video controls preload="metadata" poster="life-poster.jpg" width="640" height="360" crossorigin="anonymous">
    <source src="life.webm" type="video/webm">
    <source src="life.mp4" type="video/mp4">
    <track kind="captions" src="life-captions-es.vtt" srclang="es" label="Español (CC)" default>
  </video>
  <p>Abre la consola: el script de abajo lee del &lt;head&gt; lo que leerían un buscador y una red social.</p>

  <script>
    // Adelanto: JavaScript se explica en su capítulo. Un rastreador en miniatura.
    const metaContent = (selector) => document.head.querySelector(selector)?.getAttribute('content') ?? '(no hay)';
    console.log('título →', document.title);
    console.log('description →', metaContent('meta[name="description"]'));
    console.log('og:video →', metaContent('meta[property="og:video"]'));
    console.log('tarjeta de X →', metaContent('meta[name="twitter:card"]'), '· reproductor:', metaContent('meta[name="twitter:player"]'));
    const video = JSON.parse(document.head.querySelector('script[type="application/ld+json"]').textContent);
    console.log('JSON-LD →', video['@type'] + ':', video.name, '·', video.duration);
  </script>
</body>
</html>
```
