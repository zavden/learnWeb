---
example_description: "El head está en el DOM pero no se dibuja: una regla de CSS del navegador lo oculta"
example_tags: "render-tree|dom|head|user-agent"
example_stage: minimal
example_importance: important
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Soy el title: normalmente solo me ves en la pestaña</title>
  <style>
    /* La hoja de estilos del NAVEGADOR («user agent stylesheet») trae una regla como
         head, title, meta, style, script { display: none; }
       Por eso nada del head se dibuja nunca. Aquí la contradecimos para dos de ellos.
       (El CSS se estudia en el capítulo 3.) */
    head, title, style { display: block; }
    title {
      padding: 8px;
      border: 2px dashed #b45309;
      font: bold 1.25rem system-ui, sans-serif;
    }
    style {
      padding: 8px;
      background: #f3f4f6;
      font: 0.8rem ui-monospace, monospace;
      white-space: pre;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <h1>Aquí empieza el body</h1>
  <p>Todo lo que hay encima de este título vive en el head: el título del documento y el
     propio código CSS de esta página. Siempre estuvo en el DOM; lo que faltaba era una
     regla de CSS que lo dejara entrar en el árbol de render.</p>
</body>
</html>
```
