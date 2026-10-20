---
example_description: "Un error de ejecución corta su script en esa línea; un error de sintaxis impide ejecutar el script entero; la página sigue viva"
example_tags: "javascript|errores|syntaxerror|referenceerror"
example_stage: common-error
example_importance: critical
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Errores en rojo</title>
</head>
<body>
  <h1>Tres scripts, tres destinos</h1>
  <p>Abre la consola: cada script se ejecuta por separado. Los dos errores son a propósito.</p>

  <script>
    // Script A: error EN TIEMPO DE EJECUCIÓN.
    // Se ejecuta línea a línea hasta el error; lo que va detrás no se ejecuta.
    console.log('A1: antes del error');
    calculateTotal(); // ❌ ReferenceError: calculateTotal no existe
    console.log('A2: esto no se imprime nunca');
  </script>

  <script>
    // Script B: error DE SINTAXIS (falta el paréntesis de cierre).
    // El motor no puede ni compilarlo: no se ejecuta NI LA PRIMERA línea.
    console.log('B1: tampoco se imprime');
    console.log('B2: falta un paréntesis';
  </script>

  <script>
    // Script C: los errores de A y B no lo afectan. La página sigue viva.
    console.log('C1: el tercer script se ejecuta con normalidad');
  </script>
</body>
</html>
```
