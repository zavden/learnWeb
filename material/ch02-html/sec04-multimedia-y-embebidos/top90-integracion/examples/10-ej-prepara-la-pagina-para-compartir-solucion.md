---
example_description: "Solución: description y canonical, og:image absoluta, JSON-LD válido y una copia del template por taller"
example_tags: "ejercicio|solucion|meta|open-graph|canonical|json-ld|template"
example_stage: final-solution
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
  <title>Talleres de otoño · Huerto comunitario de Lavapiés</title>
  <!-- El resumen que suele aparecer bajo el título en los resultados de búsqueda -->
  <meta name="description" content="Compostaje, semilleros y poda de frutales: tres talleres gratuitos en el huerto comunitario de Lavapiés, los sábados de noviembre.">
  <!-- La dirección oficial: siempre absoluta -->
  <link rel="canonical" href="https://huertolavapies.example/talleres/">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Talleres de otoño en el huerto">
  <meta property="og:description" content="Compostaje, semilleros y poda: tres talleres gratuitos en noviembre.">
  <!-- Absoluta: quien lee la etiqueta (una red social) no sabe en qué sitio está la página -->
  <meta property="og:image" content="https://huertolavapies.example/img/talleres.jpg">
  <!-- JSON válido: sin coma después del último elemento -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Taller de compostaje",
    "startDate": "2026-11-07T10:00:00+01:00",
    "location": { "@type": "Place", "name": "Huerto comunitario de Lavapiés" }
  }
  </script>
  <!-- Comprobación del ejercicio (no la toques) -->
  <script defer src="js/check-share.js"></script>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 42rem; padding: 0 1rem; }
  </style>
</head>
<body>
  <h1>Talleres de otoño</h1>
  <p>Gratuitos, en el huerto, los sábados de noviembre a las 10:00. Plazas limitadas.</p>

  <template id="workshop">
    <li><strong class="name"></strong> · <time class="date"></time></li>
  </template>
  <ul id="workshops"></ul>

  <script>
    // Adelanto: JavaScript se explica en su capítulo.
    const workshops = [
      { name: 'Compostaje', date: '2026-11-07', label: 'sábado 7 de noviembre' },
      { name: 'Semilleros', date: '2026-11-14', label: 'sábado 14 de noviembre' },
      { name: 'Poda de frutales', date: '2026-11-21', label: 'sábado 21 de noviembre' },
    ];
    const template = document.getElementById('workshop');
    const list = document.getElementById('workshops');
    for (const workshop of workshops) {
      // Una COPIA por taller: el template se queda intacto para la vuelta siguiente
      list.append(template.content.cloneNode(true));
      const item = list.lastElementChild;
      item.querySelector('.name').textContent = workshop.name;
      item.querySelector('.date').textContent = workshop.label;
      item.querySelector('.date').dateTime = workshop.date;
    }
  </script>
</body>
</html>
```
