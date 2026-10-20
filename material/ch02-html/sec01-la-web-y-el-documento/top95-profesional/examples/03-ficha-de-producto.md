---
example_description: "Ficha de producto: precio con &nbsp;, atributos data-*, booleanos y datos estructurados JSON-LD"
example_tags: "profesional|producto|data-atributos|json-ld|booleanos"
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
  <title>Café de Etiopía Yirgacheffe, 250 g · Café Aroma</title>
  <meta name="description" content="Café de especialidad de Etiopía, tueste claro, notas de bergamota y melocotón. Bolsa de 250 g recién tostada en Valencia.">
  <link rel="canonical" href="https://cafe-aroma.example/cafes/etiopia-yirgacheffe/">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">

  <meta property="og:type" content="product">
  <meta property="og:title" content="Café de Etiopía Yirgacheffe · Café Aroma">
  <meta property="og:description" content="Tueste claro, notas de bergamota y melocotón.">
  <meta property="og:url" content="https://cafe-aroma.example/cafes/etiopia-yirgacheffe/">
  <meta property="og:image" content="https://cafe-aroma.example/img/etiopia-yirgacheffe.jpg">

  <!-- Datos estructurados para los buscadores (módulo 4). Un script con un type que no es
       JavaScript NO se ejecuta: el navegador lo guarda como un bloque de datos. -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Café de Etiopía Yirgacheffe, 250 g",
      "sku": "CA-ETH-250",
      "offers": { "@type": "Offer", "price": "14.90", "priceCurrency": "EUR", "availability": "https://schema.org/InStock" }
    }
  </script>

  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p><strong>Café Aroma</strong> · Tostadores en Valencia desde 2014</p>
  </header>

  <!-- data-*: datos para el código de la tienda (carrito, analítica); el navegador no los usa -->
  <main id="content" data-sku="CA-ETH-250" data-category="single-origin">
    <h1>Café de Etiopía Yirgacheffe</h1>
    <img src="img/coffee-bag.svg" alt="Bolsa de café marrón con una etiqueta amarilla y un grano de café dibujado" width="480" height="360">

    <!-- &nbsp; une la cifra con su unidad: «14,90 €» nunca se parte al final de una línea -->
    <p><strong>14,90&nbsp;€</strong> · bolsa de 250&nbsp;g · tostado el <time datetime="2026-10-08">8 de octubre</time></p>

    <h2 id="notes">Notas de cata</h2>
    <p>Bergamota, melocotón y té negro. Acidez brillante y cuerpo ligero: perfecto en filtro o en V60.</p>

    <h2 id="buy">Comprar</h2>
    <!-- La variante agotada lleva disabled SIN valor: el atributo funciona por presencia
         (disabled="false" también la desactivaría). Para reactivarla, se borra. -->
    <p>
      <button type="button">Añadir al carrito: en grano</button>
      <button type="button">Añadir al carrito: molido para filtro</button>
      <button type="button" disabled>Molido para espresso: agotado</button>
    </p>

    <h2 id="origin">Origen</h2>
    <p>Cooperativa de Kochere, región de Gedeo (Etiopía), a 1900&nbsp;m de altitud. Lavado y secado en camas africanas.</p>
  </main>

  <footer class="site-footer">
    <p>© 2026 Café Aroma · Envío gratis a partir de 35&nbsp;€ · <a href="#notes">Notas de cata</a></p>
  </footer>
</body>
</html>
```
