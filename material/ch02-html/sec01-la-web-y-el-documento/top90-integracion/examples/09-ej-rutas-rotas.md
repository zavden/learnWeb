---
example_description: "Ejercicio: una página con la hoja de estilos, el logo y un enlace rotos por sus rutas"
example_tags: "ejercicio|rutas|relativas|404|http"
example_stage: exercise
example_importance: important
exercise: true
exercise_title: "Arregla las rutas rotas"
exercise_instructions: "Abre DevTools → Network y pulsa ⟳ en la vista previa: localiza las peticiones que terminan en 404 || Corrige la ruta de la hoja de estilos (css/styles.css está junto a este documento) || Corrige la ruta del logo (está en la carpeta img/) || Corrige el enlace: el archivo se llama guide.html y está en la carpeta docs/"
exercise_hints: "Esta página vive en una subcarpeta del servidor: una ruta que empieza por / sale de ella || Las rutas relativas se resuelven contra la URL del documento || En la consola, la comprobación del enlace muestra su código de estado"
exercise_solution_example: 09-ej-rutas-rotas-solucion.md
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rutas rotas · Web a fondo</title>
  <!-- TODO 1: esta hoja de estilos no carga -->
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <div class="site-header">
    <!-- TODO 2: el logo no aparece -->
    <img src="images/logo.svg" alt="Web a fondo" width="160" height="60">
  </div>
  <h1>Rutas rotas</h1>
  <!-- TODO 3: el enlace lleva a un 404 -->
  <p><a href="docs/guide">Abrir la guía del módulo</a></p>

  <script>
    // Comprobaciones automáticas: no hace falta tocarlas. Se ejecutan cuando todo ha
    // terminado de cargar (evento load). (JavaScript que verás más adelante.)
    addEventListener('load', async () => {
      const logo = document.querySelector('img');
      const header = document.querySelector('.site-header');
      // Una petición HEAD al destino del enlace: solo cabeceras, para saber si existe
      const linkResponse = await fetch(document.querySelector('a').href, { method: 'HEAD' });
      const checks = [
        ['la hoja de estilos se aplica (borde azul bajo el logo)', getComputedStyle(header).borderBottomWidth === '4px'],
        ['el logo se ha descargado', logo.complete && logo.naturalWidth > 0],
        [`el enlace responde ${linkResponse.status}`, linkResponse.ok],
      ];
      for (const [label, ok] of checks) console.log(ok ? '✅' : '❌', label);
    });
  </script>
</body>
</html>
```
