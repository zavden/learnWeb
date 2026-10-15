---
example_description: "Sin DOCTYPE el navegador entra en quirks mode y acepta CSS roto"
example_tags: "doctype|quirks-mode|compatmode|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML-FULL

```html
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Sin DOCTYPE</title>
  <style>
    /* ❌ Dos errores de CSS a propósito (el CSS se estudia en el capítulo 3):
       un ancho sin unidad (300 en vez de 300px) y un color sin # (ffd700 en vez de #ffd700).
       En modo estándar los dos son inválidos y el navegador los ignora. */
    .box {
      width: 300;
      background-color: ffd700;
      border: 3px solid #333;
      padding: 8px;
    }
  </style>
</head>
<body>
  <!-- 🐛 A este documento le falta su primera línea: <!DOCTYPE html>.
       Sin ella, el navegador entra en «quirks mode»: imita a los navegadores de los
       años 90 y ACEPTA ese CSS roto. La página «funciona»… hasta que alguien añade
       el DOCTYPE (ejemplo siguiente). -->
  <h1>Documento sin DOCTYPE</h1>
  <div class="box">Si esta caja es amarilla y mide 300 px de ancho, estás en quirks mode.</div>

  <script>
    // BackCompat = quirks mode · CSS1Compat = modo estándar
    console.log('document.compatMode →', document.compatMode);
  </script>
</body>
</html>
```
