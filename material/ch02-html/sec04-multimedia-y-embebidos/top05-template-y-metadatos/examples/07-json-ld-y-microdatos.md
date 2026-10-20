---
example_description: "Datos estructurados: JSON-LD en un <script type=\"application/ld+json\"> (que el navegador NUNCA ejecuta, solo guarda) y microdatos con itemscope/itemprop sobre el contenido visible"
example_tags: "html|json-ld|microdatos|itemprop|datos-estructurados|seo"
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
  <title>Taller de compostaje · Huerto comunitario</title>

  <!-- JSON-LD: datos "para máquinas" que describen la página (un evento, una receta, un
       producto) con el vocabulario de schema.org. El tipo application/ld+json NO es un tipo
       de script ejecutable: el navegador NUNCA corre este código, solo lo guarda como texto;
       lo leen los buscadores para los "resultados enriquecidos". -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Taller de compostaje",
    "startDate": "2026-11-21T10:00:00-06:00",
    "location": { "@type": "Place", "name": "Huerto comunitario de Lavapiés" },
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" }
  }
  </script>
</head>
<body style="font-family: system-ui, sans-serif; padding: 1rem;">
  <h1>Taller de compostaje</h1>

  <!-- Microdatos: los MISMOS datos, pero incrustados en el HTML que ya se ve, con atributos.
       itemscope abre un objeto, itemtype dice de qué tipo es e itemprop etiqueta cada dato. -->
  <section itemscope itemtype="https://schema.org/Event">
    <p>
      <span itemprop="name">Taller de compostaje</span>, el
      <time itemprop="startDate" datetime="2026-11-21T10:00:00-06:00">21 de noviembre a las 10:00</time>,
      en <span itemprop="location" itemscope itemtype="https://schema.org/Place">
        <span itemprop="name">el Huerto comunitario de Lavapiés</span></span>.
    </p>
  </section>

  <script>
    // Adelanto: JavaScript se explica en su capítulo.
    // 1) El JSON-LD está inerte: el navegador lo guardó como texto, no lo ejecutó.
    const ld = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
    console.log('JSON-LD (dato, no código ejecutado) → tipo:', ld['@type'], '· nombre:', ld.name);
    // 2) Los microdatos están sobre el contenido visible; se leen con itemprop
    console.log('microdato itemprop="name" →', document.querySelector('[itemprop="name"]').textContent);
    console.log('microdato itemprop="startDate" →', document.querySelector('[itemprop="startDate"]').getAttribute('datetime'));
  </script>
</body>
</html>
```
