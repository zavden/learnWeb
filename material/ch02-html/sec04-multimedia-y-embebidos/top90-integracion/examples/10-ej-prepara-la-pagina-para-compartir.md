---
example_description: "Ejercicio: la página de unos talleres no está lista para buscadores ni redes (sin description ni canonical, og:image relativa, JSON-LD roto) y su lista, hecha con un template, solo enseña un taller"
example_tags: "ejercicio|meta|open-graph|canonical|json-ld|template|seo"
example_stage: exercise
example_importance: important
exercise: true
exercise_title: "Prepara la página para compartir"
exercise_instructions: "Abre la consola: el script js/check-share.js (en «Assets») revisa la página; no toques su línea del <head> || Añade una meta description de 50 a 160 caracteres || Añade un link rel=\"canonical\" con la URL https://huertolavapies.example/talleres/ || Cambia og:image por una URL absoluta: https://huertolavapies.example/img/talleres.jpg || Arregla el JSON-LD: tiene un error de sintaxis que el navegador nunca te señalará || Haz que se vean los tres talleres: el script inserta template.content en lugar de una copia || Comprueba que la consola sale toda ✅"
exercise_hints: "Las redes y los buscadores no resuelven rutas relativas: leen la URL tal cual || JSON no admite una coma después del último elemento de un objeto || Al insertarlo, template.content se queda vacío: usa template.content.cloneNode(true)"
exercise_solution_example: 10-ej-prepara-la-pagina-para-compartir-solucion.md
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
  <!-- TODO 1: falta la descripción para los buscadores -->
  <!-- TODO 2: falta la dirección oficial de la página -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Talleres de otoño en el huerto">
  <meta property="og:description" content="Compostaje, semilleros y poda: tres talleres gratuitos en noviembre.">
  <!-- TODO 3: ninguna red sabrá de qué sitio es esta ruta relativa -->
  <meta property="og:image" content="img/talleres.jpg">
  <!-- TODO 4: este JSON-LD tiene un error de sintaxis -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Taller de compostaje",
    "startDate": "2026-11-07T10:00:00+01:00",
    "location": { "@type": "Place", "name": "Huerto comunitario de Lavapiés" },
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
      list.append(template.content); // TODO 5: solo aparece un taller (el último)
      const item = list.lastElementChild;
      item.querySelector('.name').textContent = workshop.name;
      item.querySelector('.date').textContent = workshop.label;
      item.querySelector('.date').dateTime = workshop.date;
    }
  </script>
</body>
</html>
```
