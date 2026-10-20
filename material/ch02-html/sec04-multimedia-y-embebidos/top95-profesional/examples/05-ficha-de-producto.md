---
example_description: "La ficha de un producto: ilustración SVG con nombre, ventajas con iconos de un sprite (currentColor), ficha técnica en una tabla y JSON-LD Product con precio y disponibilidad"
example_tags: "profesional|producto|svg|sprite|currentcolor|json-ld|product|tabla"
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
  <title>Compostador doméstico Kompo 300 · Tienda del huerto</title>
  <meta name="description" content="Compostador de 300 litros de plástico reciclado, con tapa con bisagra y trampilla de recogida. Montaje sin herramientas en 10 minutos. 89 €.">
  <link rel="canonical" href="https://tiendadelhuerto.example/compostadores/kompo-300/">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="product">
  <meta property="og:title" content="Compostador doméstico Kompo 300">
  <meta property="og:url" content="https://tiendadelhuerto.example/compostadores/kompo-300/">
  <meta property="og:image" content="https://tiendadelhuerto.example/img/kompo-300.jpg">
  <!-- 1. JSON-LD Product: con el precio y la disponibilidad, el buscador puede enseñarlos en
       el resultado. El precio se escribe con punto decimal, como un número. -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Compostador doméstico Kompo 300",
    "sku": "KMP-300-VRD",
    "brand": { "@type": "Brand", "name": "Kompo" },
    "description": "Compostador de 300 litros de plástico reciclado con tapa con bisagra y trampilla de recogida.",
    "image": "https://tiendadelhuerto.example/img/kompo-300.jpg",
    "offers": {
      "@type": "Offer",
      "price": "89.00",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "url": "https://tiendadelhuerto.example/compostadores/kompo-300/"
    }
  }
  </script>
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/media-audit.js"></script>
  <style>
    /* Las ventajas: cada icono, del color de su texto (currentColor) */
    .benefits { list-style: none; padding: 0; color: #166534; }
    .benefits li { margin-bottom: 0.4rem; }
    .price { font-size: 1.6rem; font-weight: 700; margin: 0; }
  </style>
</head>
<body>
  <svg class="sprite" aria-hidden="true">
    <symbol id="icon-recycle" viewBox="0 0 24 24">
      <path d="M7 19 H4 L7.5 13 M17 19 H20 L16.5 13 M9 6 L12 2 L15 6 M8 19 H16 M5 11 L9 5 M19 11 L15 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </symbol>
    <symbol id="icon-tool" viewBox="0 0 24 24">
      <path d="M14 6 A4 4 0 0 1 19 11 L21 13 L17 17 L15 15 A4 4 0 0 1 10 10 Z M10 10 L3 17 L6 20 L13 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    </symbol>
    <symbol id="icon-sun" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4.5" fill="currentColor"/>
      <path d="M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M5 5 L7 7 M17 17 L19 19 M5 19 L7 17 M17 7 L19 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </symbol>
    <symbol id="icon-check" viewBox="0 0 24 24">
      <path d="M4 12 L10 18 L20 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </symbol>
  </svg>

  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://tiendadelhuerto.example/">Tienda del huerto</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://tiendadelhuerto.example/semillas/">Semillas</a></li>
        <li><a href="https://tiendadelhuerto.example/compostadores/" aria-current="page">Compostadores</a></li>
        <li><a href="https://tiendadelhuerto.example/riego/">Riego</a></li>
        <li><a href="https://tiendadelhuerto.example/cesta/">Cesta (0)</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Compostador doméstico Kompo 300</h1>

    <!-- 2. La ilustración del producto: informativa, con un nombre que describe lo que se ve -->
    <figure>
      <svg viewBox="0 0 240 240" width="240" height="240" role="img" aria-labelledby="product-title">
        <title id="product-title">Compostador Kompo 300: un cubo verde oscuro con tapa abatible y una trampilla abajo</title>
        <rect width="240" height="240" rx="12" fill="#f0fdf4"/>
        <path d="M60 70 H180 L170 210 H70 Z" fill="#166534"/>
        <path d="M52 58 H188 V72 H52 Z" fill="#14532d"/>
        <rect x="95" y="160" width="50" height="35" rx="4" fill="#15803d" stroke="#bbf7d0" stroke-width="2"/>
        <g stroke="#22c55e" stroke-width="3"><path d="M75 95 H165 M77 120 H163"/></g>
      </svg>
      <figcaption>Vista frontal: la tapa se abre hacia atrás y la trampilla de abajo saca el compost hecho.</figcaption>
    </figure>

    <p class="price">89,00 €</p>
    <p class="muted">IVA incluido · Envío gratis a la península · <strong>En stock</strong></p>
    <p><a class="button-link" href="https://tiendadelhuerto.example/cesta/anadir?sku=KMP-300-VRD">Añadir a la cesta</a></p>

    <h2>Por qué te gustará</h2>
    <ul class="benefits">
      <li><svg class="icon" aria-hidden="true"><use href="#icon-recycle"/></svg> Hecho con un 95 % de plástico reciclado.</li>
      <li><svg class="icon" aria-hidden="true"><use href="#icon-tool"/></svg> Se monta sin herramientas en unos 10 minutos.</li>
      <li><svg class="icon" aria-hidden="true"><use href="#icon-sun"/></svg> Paredes oscuras que guardan el calor: el compost madura antes.</li>
      <li><svg class="icon" aria-hidden="true"><use href="#icon-check"/></svg> Garantía de cinco años.</li>
    </ul>

    <h2>Ficha técnica</h2>
    <table>
      <caption>Kompo 300 · referencia KMP-300-VRD</caption>
      <tbody>
        <tr><th scope="row">Capacidad</th><td class="num">300 l</td></tr>
        <tr><th scope="row">Medidas</th><td class="num">70 × 70 × 85 cm</td></tr>
        <tr><th scope="row">Peso</th><td class="num">9,5 kg</td></tr>
        <tr><th scope="row">Material</th><td>Polipropileno reciclado, con protección UV</td></tr>
      </tbody>
    </table>

    <details>
      <summary>¿Qué puedo echar al compostador?</summary>
      <p>Restos de fruta y verdura, posos de café, cáscaras de huevo, hojas secas y papel sin tinta. Evita la carne, el pescado y los lácteos: atraen animales y huelen.</p>
    </details>
  </main>

  <footer class="site-footer">
    <p>Tienda del huerto · Devoluciones en 30 días · <a href="https://tiendadelhuerto.example/ayuda/">Ayuda</a></p>
  </footer>
</body>
</html>
```
