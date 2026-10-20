---
example_description: "La página de iconos de un sistema de diseño: un sprite de symbol, una tarjeta por icono generada desde un template con su código, tamaños, currentColor en tema claro y oscuro y los tres usos accesibles (decorativo, informativo y botón de solo icono)"
example_tags: "profesional|svg|sprite|symbol|use|currentcolor|template|accesibilidad"
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
  <title>Iconos · Sistema de diseño Huerta</title>
  <meta name="description" content="Los iconos del sistema de diseño Huerta: cómo se usan desde el sprite, en qué tamaños y cómo hacerlos accesibles en cada situación.">
  <link rel="canonical" href="https://huerta-ds.example/iconos/">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/media-audit.js"></script>
  <style>
    /* La rejilla de tarjetas (grid se estudia en el capítulo de CSS) */
    .icon-grid { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr)); gap: 1rem; }
    .icon-grid .card { color: #1e3a8a; }
    .icon-large { width: 2.5rem; height: 2.5rem; }
    .icon-name { margin: 0.25rem 0; font-weight: 600; color: #1f2937; }
    code { font-size: 0.8rem; color: #1f2937; overflow-wrap: anywhere; }
    /* currentColor: el mismo icono, del color del texto de cada panel */
    .panel { padding: 1rem; border-radius: 8px; }
    .panel-light { background: #f8fafc; color: #1e3a8a; }
    .panel-dark { background: #0f172a; color: #e2e8f0; }
    .size-16 { width: 16px; height: 16px; }
    .size-24 { width: 24px; height: 24px; }
    .size-32 { width: 32px; height: 32px; }
    .alert { color: #b91c1c; font-weight: 600; }
  </style>
</head>
<body>
  <!-- 1. El sprite: cada icono, un symbol con su viewBox de 24 × 24 y currentColor -->
  <svg class="sprite" aria-hidden="true">
    <symbol id="icon-drop" viewBox="0 0 24 24"><path d="M12 2 C12 2 5 10 5 15 A7 7 0 0 0 19 15 C19 10 12 2 12 2 Z" fill="currentColor"/></symbol>
    <symbol id="icon-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><path d="M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M5 5 L7 7 M17 17 L19 19 M5 19 L7 17 M17 7 L19 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
    <symbol id="icon-leaf" viewBox="0 0 24 24"><path d="M4 20 C4 9 11 4 21 3 C20 13 15 20 4 20 Z M4 20 L13 11" fill="none" stroke="currentColor" stroke-width="2"/></symbol>
    <symbol id="icon-calendar" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 10 H21 M8 3 V7 M16 3 V7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
    <symbol id="icon-pin" viewBox="0 0 24 24"><path d="M12 2 C8 2 5 5 5 9 C5 14 12 22 12 22 C12 22 19 14 19 9 C19 5 16 2 12 2 Z M12 6.5 A2.5 2.5 0 1 0 12 11.5 A2.5 2.5 0 1 0 12 6.5 Z" fill="currentColor" fill-rule="evenodd"/></symbol>
    <symbol id="icon-trash" viewBox="0 0 24 24"><path d="M4 7 H20 M9 7 V4 H15 V7 M6 7 L7 21 H17 L18 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></symbol>
    <symbol id="icon-alert" viewBox="0 0 24 24"><path d="M12 3 L22 20 H2 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9 V14 M12 16.5 V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
    <symbol id="icon-search" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15.5 15.5 L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
  </svg>

  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://huerta-ds.example/">Huerta · Sistema de diseño</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://huerta-ds.example/colores/">Colores</a></li>
        <li><a href="https://huerta-ds.example/tipografia/">Tipografía</a></li>
        <li><a href="https://huerta-ds.example/iconos/" aria-current="page">Iconos</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Iconos</h1>
    <p class="lead">Ocho iconos dibujados en una cuadrícula de 24 × 24, con trazos de 2 unidades. Todos usan <code>currentColor</code>: toman el color del texto donde los pongas.</p>

    <h2>Catálogo</h2>
    <!-- 2. Una tarjeta por icono, clonada de esta plantilla; su código se escribe solo -->
    <template id="icon-card">
      <li class="card">
        <svg class="icon-large" aria-hidden="true"><use href=""/></svg>
        <p class="icon-name"></p>
        <code class="icon-snippet"></code>
      </li>
    </template>
    <ul class="icon-grid" id="icon-grid"></ul>

    <h2>Tamaños</h2>
    <p>16 px junto a texto pequeño, 24 px en botones y 32 px en titulares. El dibujo no pierde nitidez: el <code>viewBox</code> lo escala.</p>
    <p class="row">
      <svg class="size-16" aria-hidden="true"><use href="#icon-leaf"/></svg>
      <svg class="size-24" aria-hidden="true"><use href="#icon-leaf"/></svg>
      <svg class="size-32" aria-hidden="true"><use href="#icon-leaf"/></svg>
    </p>

    <h2>Tema claro y oscuro</h2>
    <div class="row">
      <p class="panel panel-light"><svg class="icon" aria-hidden="true"><use href="#icon-sun"/></svg> Tema claro</p>
      <p class="panel panel-dark"><svg class="icon" aria-hidden="true"><use href="#icon-sun"/></svg> Tema oscuro</p>
    </div>

    <h2>Usos accesibles</h2>
    <!-- 3. Los tres casos de la lección de SVG -->
    <h3>Decorativo: el texto ya lo dice</h3>
    <p><svg class="icon" aria-hidden="true"><use href="#icon-drop"/></svg> Riego automático activado</p>

    <h3>Informativo: el icono es el mensaje</h3>
    <p class="alert"><svg class="icon" role="img" aria-label="Aviso"><use href="#icon-alert"/></svg> Helada prevista esta noche</p>

    <h3>Botón de solo icono: el nombre va en el botón</h3>
    <p class="row">
      <button type="button" aria-label="Buscar en el huerto"><svg class="icon" aria-hidden="true"><use href="#icon-search"/></svg></button>
      <button type="button" aria-label="Borrar la tarea «Regar los tomates»"><svg class="icon" aria-hidden="true"><use href="#icon-trash"/></svg></button>
    </p>
  </main>

  <footer class="site-footer">
    <p>Huerta · Sistema de diseño de la Red de Huertos Urbanos · <a href="https://huerta-ds.example/iconos/huerta-iconos.svg" download>Descarga el sprite</a></p>
  </footer>

  <script>
    // Adelanto: JavaScript se explica en su capítulo. Una tarjeta por cada symbol del sprite.
    const template = document.getElementById('icon-card');
    const grid = document.getElementById('icon-grid');
    for (const symbol of document.querySelectorAll('.sprite symbol')) {
      const card = template.content.cloneNode(true);
      card.querySelector('use').setAttribute('href', `#${symbol.id}`);
      card.querySelector('.icon-name').textContent = symbol.id.replace('icon-', '');
      card.querySelector('.icon-snippet').textContent = `<svg class="icon" aria-hidden="true"><use href="#${symbol.id}"/></svg>`;
      grid.append(card);
    }
    console.log('iconos en el catálogo →', grid.children.length);
  </script>
</body>
</html>
```
