---
example_description: "Un pequeño rastreador: lee del <head> lo mismo que un buscador o una red social (título, descripción, Open Graph y JSON-LD) y lo imprime en la consola"
example_tags: "html|seo|open-graph|json-ld|crawler|head|console"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Café de especialidad Yirgacheffe · Tostadero Aroma</title>
  <meta name="description" content="Café de Etiopía, tueste claro, notas de bergamota y melocotón. Envío en 24 h.">
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="product">
  <meta property="og:title" content="Café Yirgacheffe · Tostadero Aroma">
  <meta property="og:description" content="Tueste claro, notas de bergamota y melocotón.">
  <meta property="og:image" content="https://aroma.example/cafes/yirgacheffe.jpg">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Café Yirgacheffe",
    "offers": { "@type": "Offer", "price": "12.50", "priceCurrency": "EUR" }
  }
  </script>
</head>
<body style="font-family: system-ui, sans-serif; padding: 1rem;">
  <h1>Café de especialidad Yirgacheffe</h1>
  <p>Abre la consola: debajo se imprime lo que un buscador o un chat leerían de esta página
     sin mirar el texto visible, solo su &lt;head&gt;.</p>

  <script>
    // Adelanto: JavaScript se explica en su capítulo. Esto hace, en pequeño, lo que un
    // rastreador: recorre el <head> y se queda con los metadatos.
    const meta = (selector) => document.head.querySelector(selector)?.getAttribute('content') ?? '(no hay)';

    console.log('título →', document.title);
    console.log('description →', meta('meta[name="description"]'));
    console.log('robots →', meta('meta[name="robots"]'));

    console.group('Open Graph');
    document.head.querySelectorAll('meta[property^="og:"]').forEach((tag) => {
      console.log(tag.getAttribute('property'), '→', tag.getAttribute('content'));
    });
    console.groupEnd();

    const ldTag = document.head.querySelector('script[type="application/ld+json"]');
    const ld = JSON.parse(ldTag.textContent);
    console.log('JSON-LD →', ld['@type'] + ':', ld.name, '·', ld.offers.price, ld.offers.priceCurrency);
  </script>
</body>
</html>
```
