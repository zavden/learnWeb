---
example_description: "Ejercicio: un documento sin DOCTYPE, sin charset y con un script que falla"
example_tags: "ejercicio|doctype|charset|head|defer"
example_stage: exercise
example_importance: important
exercise: true
exercise_title: "Arregla el documento"
exercise_instructions: "Añade <!DOCTYPE html> como primera línea del documento || Declara el idioma con lang=\"es\" en la etiqueta <html> || Pon <meta charset=\"utf-8\"> como primer elemento del head || Añade el meta viewport y un <title> descriptivo || Haz que js/greeting.js espere a que el HTML esté leído entero || Mueve la meta description a su sitio"
exercise_hints: "Las comprobaciones de la consola te dicen qué falta en cada momento || Sin DOCTYPE, document.compatMode vale BackCompat || defer solo funciona en scripts con src || La meta description no puede ir después del contenido visible"
exercise_solution_example: 08-ej-arregla-el-documento-solucion.md
console: true
---

# HTML-FULL

```html
<!-- TODO 1: falta la primera línea de todo documento (la que activa el modo estándar) -->
<html>
<!-- TODO 2: declara en la etiqueta de arriba que el documento está en español -->
<head>
  <!-- TODO 3: la codificación, como primer elemento del head -->
  <!-- TODO 4: el viewport para móviles y un título descriptivo -->

  <!-- TODO 5: este script falla porque se ejecuta antes de que exista #greeting: haz que espere -->
  <script src="js/greeting.js"></script>
</head>
<body>
  <h1 id="greeting">Cargando…</h1>
  <p>Ficha del módulo «La web y el documento».</p>
  <!-- TODO 6: esta descripción está en el sitio equivocado -->
  <meta name="description" content="Resumen del primer módulo del curso Web a fondo.">

  <script>
    // Comprobaciones automáticas: no hace falta tocarlas. Se ejecutan con el DOM completo
    // (DOMContentLoaded) y escriben ✅ o ❌ en la consola. (JavaScript que verás más adelante.)
    document.addEventListener('DOMContentLoaded', () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      const checks = [
        ['modo estándar (DOCTYPE)', document.compatMode === 'CSS1Compat'],
        ['lang="es" en la raíz', document.documentElement.lang === 'es'],
        ['meta charset como primer elemento del head', document.head.firstElementChild?.matches('meta[charset]') === true],
        ['meta viewport con width=device-width', viewport?.content.includes('width=device-width') === true],
        ['un title con texto', document.title.trim() !== ''],
        ['js/greeting.js ha funcionado', document.querySelector('#greeting').textContent !== 'Cargando…'],
        ['la meta description está en el head', document.head.querySelector('meta[name="description"]') !== null],
      ];
      for (const [label, ok] of checks) console.log(ok ? '✅' : '❌', label);
    });
  </script>
</body>
</html>
```
