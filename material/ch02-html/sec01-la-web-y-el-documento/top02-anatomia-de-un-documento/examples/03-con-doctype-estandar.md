---
example_description: "El mismo documento con DOCTYPE: modo estándar, el CSS roto se ignora"
example_tags: "doctype|modo-estandar|compatmode"
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
  <title>Con DOCTYPE</title>
  <style>
    /* Mismo CSS roto que en el ejemplo anterior: en modo estándar se ignora */
    .box {
      width: 300;
      background-color: ffd700;
      border: 3px solid #333;
      padding: 8px;
    }

    /* ✅ La solución de verdad no es quitar el DOCTYPE: es escribir CSS válido */
    .box-fixed {
      width: 300px;
      background-color: #ffd700;
      border: 3px solid #333;
      padding: 8px;
    }
  </style>
</head>
<body>
  <h1>Documento con DOCTYPE</h1>
  <div class="box">❌ CSS roto: ocupo todo el ancho y no tengo fondo.</div>
  <p>Con las unidades y el # escritos:</p>
  <div class="box-fixed">✅ CSS válido: 300 px y amarillo en cualquier modo.</div>

  <script>
    console.log('document.compatMode →', document.compatMode);  // CSS1Compat
  </script>
</body>
</html>
```
