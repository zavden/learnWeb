---
example_description: "Una receta: cantidades con &nbsp;, fracciones y duraciones legibles por máquinas"
example_tags: "profesional|receta|entidades|nbsp|time"
example_stage: professional
example_importance: useful
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tortilla de patatas jugosa, paso a paso · Cocina sin prisa</title>
  <meta name="description" content="Receta de tortilla de patatas jugosa para 4 personas: ingredientes, tiempos y el truco para darle la vuelta sin miedo.">
  <link rel="canonical" href="https://cocinasinprisa.example/recetas/tortilla-de-patatas/">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="article">
  <meta property="og:title" content="Tortilla de patatas jugosa, paso a paso">
  <meta property="og:url" content="https://cocinasinprisa.example/recetas/tortilla-de-patatas/">
  <meta property="og:image" content="https://cocinasinprisa.example/recetas/tortilla-de-patatas/foto.jpg">
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p><strong>Cocina sin prisa</strong> · Recetas de siempre, explicadas</p>
  </header>

  <main id="content">
    <article>
      <h1>Tortilla de patatas jugosa</h1>
      <img src="img/tortilla.svg" alt="Tortilla de patatas dorada en un plato, con una porción cortada" width="640" height="400">

      <!-- time con duraciones ISO 8601 (PT15M = 15 minutos): legibles para buscadores
           y asistentes de voz. &nbsp; mantiene cada número junto a su unidad. -->
      <p>Para 4&nbsp;personas · Preparación: <time datetime="PT15M">15&nbsp;min</time> · Cocción: <time datetime="PT35M">35&nbsp;min</time></p>

      <h2 id="ingredients">Ingredientes</h2>
      <ul>
        <li>600&nbsp;g de patatas (mejor de la variedad Monalisa o Agria)</li>
        <li>6&nbsp;huevos camperos</li>
        <li>1&nbsp;cebolla mediana (opcional, pero recomendada)</li>
        <li>250&nbsp;ml de aceite de oliva virgen extra</li>
        <li>&frac12;&nbsp;cucharadita de sal</li>
      </ul>

      <h2 id="steps">Elaboración</h2>
      <ol>
        <li>Pela las patatas y córtalas en láminas finas, de unos 3&nbsp;mm. Pica la cebolla.</li>
        <li>Pocha patata y cebolla en el aceite a fuego medio durante 25&nbsp;min, sin que lleguen a dorarse.</li>
        <li>Escúrrelas bien y mézclalas con los huevos batidos y la sal. Deja reposar 5&nbsp;min.</li>
        <li>Cuaja la mezcla en una sartén de 24&nbsp;cm con una cucharada de aceite, 3&nbsp;min por cada lado.</li>
      </ol>

      <h2 id="tip">El truco de la vuelta</h2>
      <p>Usa un plato plano algo más grande que la sartén y gíralo con decisión, en un solo movimiento. Si se rompe un poco, vuelve a darle forma con la espátula: nadie lo notará.</p>
    </article>
  </main>

  <footer class="site-footer">
    <p>© 2026 Cocina sin prisa · <a href="#ingredients">Ingredientes</a> · <a href="#steps">Elaboración</a></p>
  </footer>
</body>
</html>
```
