---
example_description: "Un <script> detiene el parser: desde el head, el body todavía no existe"
example_tags: "parser|script|readystate|null|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>El script detiene el parser</title>
  <script>
    // Mientras este script se ejecuta, el parser está PARADO aquí, en el head:
    // todavía no ha leído nada de lo que hay debajo.
    console.log('1. en el head → readyState:', document.readyState, '| body:', document.body);
    console.log('1. en el head → #greeting:', document.querySelector('#greeting'));

    // ❌ El error clásico: usar un elemento que aún no existe. querySelector devuelve
    // null, y null no tiene textContent → TypeError (provocado a propósito).
    document.querySelector('#greeting').textContent = 'Hola desde el head';
  </script>
</head>
<body>
  <h1 id="greeting">Hola</h1>
  <p>Primer párrafo</p>
  <script>
    // Un script ve todo lo que hay ENCIMA de él… y nada de lo que hay debajo
    console.log('2. a mitad del body → párrafos:', document.querySelectorAll('p').length);
  </script>
  <p>Segundo párrafo</p>
  <script>
    console.log('3. al final del body → párrafos:', document.querySelectorAll('p').length,
      '| #greeting:', document.querySelector('#greeting'));
  </script>
</body>
</html>
```
