---
example_description: "Las tres formas de dar estilos a un documento: hoja externa con link, elemento style y atributo style"
example_tags: "css|link|style|inline"
example_stage: minimal
example_importance: critical
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tres formas de incluir CSS</title>

  <!-- 1) HOJA EXTERNA: el navegador descarga site.css (está en la carpeta assets/ del tema).
       Es la forma habitual: un archivo para todas las páginas, que se guarda en caché. -->
  <link rel="stylesheet" href="site.css">

  <!-- 2) HOJA INTERNA: CSS dentro de un elemento <style>; solo afecta a esta página. -->
  <style>
    .from-style {
      background: #dcfce7;
      border-left: 6px solid #16a34a;
    }
  </style>
</head>
<body>
  <p class="from-link">1 · Me pinta <code>site.css</code>, enlazado con <code>&lt;link&gt;</code>.
    Si no tengo fondo azul, el archivo no se ha cargado.</p>

  <p class="from-style">2 · Me pinta el elemento <code>&lt;style&gt;</code> del <code>&lt;head&gt;</code>.</p>

  <!-- 3) EN LÍNEA: atributo style. No tiene selector: solo afecta a ESTE elemento,
       no admite :hover ni @media, y gana a casi cualquier regla de una hoja. -->
  <p style="background: #fee2e2; border-left: 6px solid #dc2626;">3 · Me pinta mi propio atributo <code>style</code>.</p>
</body>
</html>
```
