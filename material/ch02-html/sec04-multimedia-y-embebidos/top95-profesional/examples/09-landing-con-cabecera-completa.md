---
example_description: "La portada de un tostadero con un <head> de producción comentado línea a línea: iconos, canonical, hreflang, preload de la imagen principal, theme-color, Open Graph, tarjeta de X y JSON-LD Organization"
example_tags: "profesional|head|meta|link|preload|hreflang|open-graph|json-ld"
example_stage: professional
example_importance: critical
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <!-- 1. Lo primero, siempre: la codificación (en los primeros 1024 bytes) y el viewport -->
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- 2. Título y descripción: lo que se ve en la pestaña y en los resultados de búsqueda -->
  <title>Aroma · Café de especialidad tostado cada semana en Madrid</title>
  <meta name="description" content="Tostamos café de especialidad cada martes y te lo enviamos en 48 horas. Orígenes de Etiopía, Colombia y Guatemala, en grano o molido.">

  <!-- 3. La dirección oficial y sus versiones en otros idiomas (x-default: para el resto) -->
  <link rel="canonical" href="https://aroma.example/">
  <link rel="alternate" hreflang="es" href="https://aroma.example/">
  <link rel="alternate" hreflang="en" href="https://aroma.example/en/">
  <link rel="alternate" hreflang="x-default" href="https://aroma.example/en/">

  <!-- 4. Iconos: SVG para las pestañas; PNG de 180 × 180 para la pantalla de inicio del iPhone.
       theme-color tiñe la barra del navegador en el móvil. -->
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="img/apple-touch-icon.png">
  <meta name="theme-color" content="#7c2d12">

  <!-- 5. Rendimiento: la imagen principal se pide YA (as="image" le da su prioridad) porque
       es lo primero que se ve. preconnect solo merece la pena si pronto pedirás algo a ese
       dominio; esta página no usa ninguno externo, así que va comentado:
       <link rel="preconnect" href="https://fuentes.aroma.example" crossorigin> -->
  <link rel="preload" href="img/hero-coffee.svg" as="image" fetchpriority="high">

  <!-- 6. Para compartir: Open Graph y la tarjeta grande de X. URL siempre absolutas. -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Aroma">
  <meta property="og:title" content="Aroma · Café de especialidad recién tostado">
  <meta property="og:description" content="Tostamos cada martes y enviamos en 48 horas.">
  <meta property="og:url" content="https://aroma.example/">
  <meta property="og:image" content="https://aroma.example/img/og-portada-1200x630.jpg">
  <meta property="og:image:alt" content="Un saco de café abierto y granos tostados sobre fondo crema">
  <meta property="og:locale" content="es_ES">
  <meta property="og:locale:alternate" content="en_GB">
  <meta name="twitter:card" content="summary_large_image">

  <!-- 7. Quién está detrás: JSON-LD Organization (logo, redes y contacto) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Aroma, tostadores de café",
    "url": "https://aroma.example/",
    "logo": "https://aroma.example/img/logo-512.png",
    "sameAs": ["https://social.example/@aromacafe", "https://fotos.example/aromacafe"],
    "contactPoint": { "@type": "ContactPoint", "contactType": "customer service", "email": "hola@aroma.example", "availableLanguage": ["es", "en"] }
  }
  </script>

  <!-- 8. Estilos y, con defer, la auditoría del curso -->
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/media-audit.js"></script>
  <style>
    .hero img { display: block; width: 100%; height: auto; border-radius: 12px; }
    .features { list-style: none; padding: 0; display: grid; gap: 1rem; color: #7c2d12; }
    .features p { color: #1f2937; margin: 0.25rem 0 0; }
    .features h3 { margin: 0; }
    blockquote { margin: 0; font-size: 1.1rem; }
  </style>
</head>
<body>
  <svg class="sprite" aria-hidden="true">
    <symbol id="icon-flame" viewBox="0 0 24 24">
      <path d="M12 2 C13 7 18 9 18 15 A6 6 0 0 1 6 15 C6 11 9 10 9 6 C11 8 12 9 12 2 Z" fill="currentColor"/>
    </symbol>
    <symbol id="icon-truck" viewBox="0 0 24 24">
      <path d="M2 6 H14 V16 H2 Z M14 10 H19 L22 13 V16 H14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="6" cy="18" r="2" fill="currentColor"/><circle cx="18" cy="18" r="2" fill="currentColor"/>
    </symbol>
    <symbol id="icon-globe" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M3 12 H21 M12 3 C15 6 15 18 12 21 C9 18 9 6 12 3" fill="none" stroke="currentColor" stroke-width="2"/>
    </symbol>
  </svg>

  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://aroma.example/">Aroma</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://aroma.example/cafes/">Cafés</a></li>
        <li><a href="https://aroma.example/suscripcion/">Suscripción</a></li>
        <li><a href="https://aroma.example/tostadero/">El tostadero</a></li>
        <li><a href="https://aroma.example/en/" hreflang="en" lang="en">English</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <section class="hero">
      <h1>Café recién tostado, en tu casa en 48 horas</h1>
      <!-- La imagen precargada en el head: width y height reservan su hueco -->
      <img src="img/hero-coffee.svg" alt="Un saco de café abierto y granos tostados sobre fondo crema" width="800" height="400">
      <p class="lead">Tostamos cada martes en pequeños lotes y te lo enviamos el miércoles.</p>
      <p><a class="button-link" href="https://aroma.example/suscripcion/">Empieza tu suscripción</a></p>
    </section>

    <h2>Por qué Aroma</h2>
    <!-- Iconos decorativos (aria-hidden): el título de cada ventaja ya lo dice -->
    <ul class="features">
      <li class="card">
        <h3><svg class="icon" aria-hidden="true"><use href="#icon-flame"/></svg> Tostado cada semana</h3>
        <p>Nunca recibirás un café con más de ocho días desde el tueste.</p>
      </li>
      <li class="card">
        <h3><svg class="icon" aria-hidden="true"><use href="#icon-globe"/></svg> Orígenes trazables</h3>
        <p>Sabemos qué finca cultivó cada saco y le pagamos por encima del precio de mercado.</p>
      </li>
      <li class="card">
        <h3><svg class="icon" aria-hidden="true"><use href="#icon-truck"/></svg> Envío en 48 horas</h3>
        <p>Gratis a partir de dos bolsas, a toda la península.</p>
      </li>
    </ul>

    <h2>Lo que dicen nuestros clientes</h2>
    <figure>
      <blockquote>
        <p>«El Etiopía de este mes huele a melocotón nada más abrir la bolsa. Ya no vuelvo al supermercado.»</p>
      </blockquote>
      <figcaption>Carmen, suscriptora desde 2024</figcaption>
    </figure>
  </main>

  <footer class="site-footer">
    <p>Aroma, tostadores de café · Calle de la Fe, 9, Madrid · <a href="mailto:hola@aroma.example">hola@aroma.example</a></p>
  </footer>
</body>
</html>
```
