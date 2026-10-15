---
example_description: "Cada <script> se ejecuta en cuanto el parser lo lee: solo ve el HTML que está por encima"
example_tags: "javascript|script|parser|orden-de-ejecucion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Dónde se ejecuta un script</title>
  <script>
    // 1) Script en el <head>: el navegador lo ejecuta en cuanto lo lee,
    //    ANTES de haber leído el <body>. Por eso document.body todavía es null.
    console.log('1. head → document.body es', document.body);
  </script>
</head>
<body>
  <h1>Orden de ejecución</h1>

  <script>
    // 2) Script en medio del body: el <h1> de arriba ya existe,
    //    el párrafo de abajo todavía no.
    //    (querySelector busca un elemento; el DOM se estudia en el capítulo 6.)
    console.log('2. medio → h1:', document.querySelector('h1'));
    console.log('2. medio → p:', document.querySelector('p'));
  </script>

  <p>Abre la consola: los mensajes salen en el orden en que el parser encuentra cada script.</p>

  <script>
    // 3) Script al final del body: todo el HTML ya está leído.
    //    Aquí es donde LearnWeb coloca tu bloque «JavaScript».
    console.log('3. final → p:', document.querySelector('p'));
  </script>
</body>
</html>
```
