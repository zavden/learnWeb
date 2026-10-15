---
example_description: "Una página son muchas peticiones: qué descarga el navegador y en qué orden"
example_tags: "http|recursos|carga|performance"
example_stage: intermediate
example_importance: important
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Qué descarga el navegador</title>
  <!-- El parser encuentra esta hoja de estilos y la pide enseguida -->
  <link rel="stylesheet" href="css/styles.css">
  <!-- Script externo con defer: se pide ya, se ejecuta al terminar de leer el HTML -->
  <script defer src="js/app.js"></script>
</head>
<body>
  <h1>Una página = muchas peticiones</h1>
  <!-- La imagen se pide en cuanto el navegador ve la etiqueta -->
  <img src="img/logo.svg" alt="Logo del curso" width="160" height="60">
  <!-- El fondo de esta caja está escrito DENTRO de styles.css: no se puede pedir
       hasta haber descargado y leído ese archivo -->
  <p class="pattern">Mi fondo de rayas lo pidió el CSS, no el HTML.</p>

  <script>
    // Al terminar de cargarlo todo (evento «load») pedimos al navegador su registro
    // de descargas (Performance API). Todo esto es JavaScript que verás más adelante.
    addEventListener('load', () => {
      console.log('0 ms → el documento HTML (siempre lo primero)');
      for (const entry of performance.getEntriesByType('resource')) {
        const file = entry.name.split('/').slice(-2).join('/');
        console.log(Math.round(entry.startTime), 'ms →', file, '| lo pidió:', entry.initiatorType);
      }
    });
  </script>
</body>
</html>
```
