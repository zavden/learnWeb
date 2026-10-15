---
example_description: "Una receta con datos estructurados: JSON-LD Recipe con ingredientes, pasos y tiempos en ISO 8601, iconos de un sprite con currentColor, una ilustración SVG accesible y Open Graph para compartirla"
example_tags: "profesional|receta|json-ld|recipe|svg|sprite|currentcolor|time"
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
  <title>Crema de calabaza asada con jengibre · Recetas del huerto</title>
  <meta name="description" content="Crema de calabaza asada con jengibre y comino para cuatro personas: 15 minutos de preparación y 35 de horno. Receta de temporada del huerto.">
  <link rel="canonical" href="https://recetasdelhuerto.example/cremas/calabaza-asada/">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="article">
  <meta property="og:title" content="Crema de calabaza asada con jengibre">
  <meta property="og:url" content="https://recetasdelhuerto.example/cremas/calabaza-asada/">
  <meta property="og:image" content="https://recetasdelhuerto.example/img/crema-calabaza.jpg">
  <!-- 1. JSON-LD Recipe: los tiempos en formato ISO 8601 (PT15M = 15 minutos) y cada paso
       como un HowToStep. Con estos datos, el buscador puede mostrar la receta con su tiempo
       y sus raciones. -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": "Crema de calabaza asada con jengibre",
    "image": "https://recetasdelhuerto.example/img/crema-calabaza.jpg",
    "author": { "@type": "Person", "name": "Lucía Benítez" },
    "datePublished": "2026-10-10",
    "prepTime": "PT15M",
    "cookTime": "PT35M",
    "totalTime": "PT50M",
    "recipeYield": "4 raciones",
    "recipeCategory": "Primer plato",
    "recipeIngredient": ["1 calabaza de 1,2 kg", "1 cebolla", "1 trozo de jengibre de 3 cm", "1 cucharadita de comino", "700 ml de caldo de verduras", "2 cucharadas de aceite de oliva", "Sal y pimienta"],
    "recipeInstructions": [
      { "@type": "HowToStep", "text": "Asa la calabaza en dados con aceite y comino a 200 °C durante 35 minutos." },
      { "@type": "HowToStep", "text": "Sofríe la cebolla y el jengibre picados durante 8 minutos." },
      { "@type": "HowToStep", "text": "Tritura la calabaza con el sofrito y el caldo caliente hasta que quede fina." },
      { "@type": "HowToStep", "text": "Ajusta de sal y pimienta y sirve con unas semillas tostadas." }
    ]
  }
  </script>
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/media-audit.js"></script>
  <style>
    /* Los datos de la receta en fila; cada icono toma el color de su texto (currentColor) */
    .facts { font-weight: 600; color: #9a3412; }
  </style>
</head>
<body>
  <svg class="sprite" aria-hidden="true">
    <symbol id="icon-clock" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M12 7 V12 L15 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </symbol>
    <symbol id="icon-people" viewBox="0 0 24 24">
      <circle cx="9" cy="8" r="3.5" fill="currentColor"/><circle cx="17" cy="9" r="2.5" fill="currentColor"/>
      <path d="M2 20 C2 15 5 13 9 13 C13 13 16 15 16 20 Z M15 14 C19 13 22 15 22 19 H17" fill="currentColor"/>
    </symbol>
    <symbol id="icon-flame" viewBox="0 0 24 24">
      <path d="M12 2 C13 7 18 9 18 15 A6 6 0 0 1 6 15 C6 11 9 10 9 6 C11 8 12 9 12 2 Z" fill="currentColor"/>
    </symbol>
  </svg>

  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://recetasdelhuerto.example/">Recetas del huerto</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://recetasdelhuerto.example/temporada/">De temporada</a></li>
        <li><a href="https://recetasdelhuerto.example/cremas/" aria-current="page">Cremas y sopas</a></li>
        <li><a href="https://recetasdelhuerto.example/conservas/">Conservas</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <article>
      <h1>Crema de calabaza asada con jengibre</h1>
      <p class="lead">Asar la calabaza antes de triturarla le da un sabor tostado que no tiene la cocida. Por <a href="https://recetasdelhuerto.example/autoras/lucia-benitez/">Lucía Benítez</a>, <time datetime="2026-10-10">10 de octubre de 2026</time>.</p>

      <!-- 2. Los iconos son decorativos: el texto de al lado ya lo dice todo -->
      <ul class="row facts">
        <li><svg class="icon" aria-hidden="true"><use href="#icon-clock"/></svg> <time datetime="PT50M">50 minutos</time> en total</li>
        <li><svg class="icon" aria-hidden="true"><use href="#icon-people"/></svg> 4 raciones</li>
        <li><svg class="icon" aria-hidden="true"><use href="#icon-flame"/></svg> Horno a 200 °C</li>
      </ul>

      <!-- 3. Una ilustración informativa: role="img" con su nombre -->
      <figure>
        <svg viewBox="0 0 320 180" width="320" height="180" role="img" aria-label="Un cuenco de crema naranja con semillas por encima y un trozo de calabaza al lado">
          <rect width="320" height="180" rx="12" fill="#fff7ed"/>
          <ellipse cx="140" cy="100" rx="95" ry="30" fill="#ea580c"/>
          <path d="M45 100 C50 150 230 150 235 100 Z" fill="#78716c"/>
          <g fill="#fef3c7"><ellipse cx="120" cy="95" rx="6" ry="3"/><ellipse cx="150" cy="104" rx="6" ry="3"/><ellipse cx="170" cy="92" rx="6" ry="3"/></g>
          <path d="M255 125 C255 95 300 95 300 125 C300 140 255 140 255 125 Z" fill="#f97316"/>
          <path d="M276 97 C276 90 282 86 286 84" stroke="#3f6212" stroke-width="4" fill="none"/>
        </svg>
        <figcaption>Sírvela con pipas de calabaza tostadas y un hilo de aceite.</figcaption>
      </figure>

      <h2>Ingredientes</h2>
      <ul>
        <li>1 calabaza de unos 1,2 kg</li>
        <li>1 cebolla</li>
        <li>1 trozo de jengibre fresco de 3 cm</li>
        <li>1 cucharadita de comino molido</li>
        <li>700 ml de caldo de verduras</li>
        <li>2 cucharadas de aceite de oliva</li>
        <li>Sal y pimienta</li>
      </ul>

      <h2>Preparación</h2>
      <ol>
        <li>Pela la calabaza, córtala en dados y ásala con el aceite y el comino a 200 °C durante <time datetime="PT35M">35 minutos</time>.</li>
        <li>Mientras tanto, sofríe la cebolla y el jengibre picados a fuego medio durante <time datetime="PT8M">8 minutos</time>.</li>
        <li>Tritura la calabaza con el sofrito y el caldo caliente hasta que quede fina.</li>
        <li>Ajusta de sal y pimienta y sirve con unas semillas tostadas.</li>
      </ol>

      <p class="note">Se conserva tres días en la nevera y se puede congelar; añade las semillas al servir.</p>
    </article>
  </main>

  <footer class="site-footer">
    <p>Recetas del huerto · Cocina de temporada con lo que da la tierra · <a href="https://recetasdelhuerto.example/contacto/">Contacto</a></p>
  </footer>
</body>
</html>
```
