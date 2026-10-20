---
example_description: "Solución: el documento con DOCTYPE, charset, viewport, title, defer y la meta en el head"
example_tags: "solucion|doctype|charset|head|defer"
example_stage: final-solution
example_importance: important
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<!-- ✅ 1. DOCTYPE: modo estándar -->
<html lang="es">
<!-- ✅ 2. lang="es" en la raíz -->
<head>
  <meta charset="utf-8">
  <!-- ✅ 3. charset lo primero: cae dentro de los primeros 1024 bytes -->
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ficha del módulo · Web a fondo</title>
  <!-- ✅ 4. viewport y title -->
  <meta name="description" content="Resumen del primer módulo del curso Web a fondo.">
  <!-- ✅ 6. la descripción, en el head -->
  <script defer src="js/greeting.js"></script>
  <!-- ✅ 5. defer: se descarga ya y se ejecuta cuando #greeting existe -->
</head>
<body>
  <h1 id="greeting">Cargando…</h1>
  <p>Ficha del módulo «La web y el documento».</p>

  <script>
    // Las mismas comprobaciones del ejercicio: ahora todas salen ✅
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
