---
example_description: "defer y async: scripts externos que no detienen el parser"
example_tags: "parser|script|defer|async|domcontentloaded"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>defer y async</title>
  <!-- Tres scripts externos (están en la carpeta assets/js/ de este tema).
       Con defer o async, ninguno detiene el parser: se descargan en paralelo. -->

  <!-- defer: se ejecuta al TERMINAR de leer el HTML, en el orden en que aparece -->
  <script defer src="js/defer-1.js"></script>
  <!-- async: se ejecuta EN CUANTO termina de descargarse; su orden es imprevisible -->
  <script async src="js/async.js"></script>
  <script defer src="js/defer-2.js"></script>

  <script>
    // DOMContentLoaded: el HTML está leído entero y los scripts defer ya se ejecutaron.
    // addEventListener se explica en el módulo de eventos; aquí solo avisa.
    document.addEventListener('DOMContentLoaded', () => {
      console.log('— DOMContentLoaded —');
    });
  </script>
</head>
<body>
  <h1>defer y async</h1>
  <p>Primer párrafo</p>
  <p>Segundo párrafo</p>
  <script>
    // Script normal (sin src): se ejecuta en cuanto el parser llega aquí
    console.log('inline     → readyState:', document.readyState,
      '| párrafos:', document.querySelectorAll('p').length);
  </script>
</body>
</html>
```
