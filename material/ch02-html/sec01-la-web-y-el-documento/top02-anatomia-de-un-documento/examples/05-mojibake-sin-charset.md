---
example_description: "Mojibake: el mismo texto UTF-8 con y sin charset declarado"
example_tags: "charset|utf-8|mojibake|bug"
example_stage: common-error
example_importance: critical
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Mojibake</title>
  <style>
    iframe { display: block; width: 100%; height: 4.5em; border: 1px solid #888; }
  </style>
</head>
<body>
  <h1>El mismo texto, dos documentos</h1>
  <!-- Un iframe muestra otro documento dentro de esta página (lo verás en el módulo 4).
       Su src es una URL data:, que lleva el documento entero escrito dentro. A diferencia
       de esta vista previa, que el servidor de LearnWeb envía con la cabecera
       «Content-Type: text/html; charset=utf-8», un documento data: no trae cabecera:
       si el HTML no declara su codificación, el navegador tiene que adivinarla. -->

  <h2>❌ Sin charset</h2>
  <!-- 🐛 Los bytes son UTF-8 («ó» = C3 B3), pero el navegador los lee con su codificación
       por defecto (windows-1252 en español): cada byte se vuelve un carácter → «Ã³» -->
  <iframe title="Documento sin charset"
          src="data:text/html,<p>Canción, ñandú y 20 €</p>"></iframe>

  <h2>✅ Con &lt;meta charset="utf-8"&gt;</h2>
  <!-- Mismos bytes; la meta le dice al navegador cómo leerlos -->
  <iframe title="Documento con charset"
          src="data:text/html,<meta charset='utf-8'><p>Canción, ñandú y 20 €</p>"></iframe>
</body>
</html>
```
