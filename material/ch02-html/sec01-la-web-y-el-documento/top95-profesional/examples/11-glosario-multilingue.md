---
example_description: "Glosario en varios idiomas: lang por fragmento, dir=\"rtl\", translate=\"no\" y versiones alternativas"
example_tags: "profesional|lang|dir|hreflang|translate"
example_stage: professional
example_importance: important
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Glosario de la web: los términos del módulo en cinco idiomas · Web a fondo</title>
  <meta name="description" content="Los términos clave del primer módulo del curso, con su nombre en inglés y su origen en otros idiomas.">
  <link rel="canonical" href="https://webafondo.example/glosario/">
  <!-- Versiones de esta página en otros idiomas, para que el buscador muestre la adecuada.
       hreflang dice el idioma del DESTINO; las URLs son absolutas. -->
  <link rel="alternate" hreflang="es" href="https://webafondo.example/glosario/">
  <link rel="alternate" hreflang="en" href="https://webafondo.example/en/glossary/">
  <link rel="alternate" hreflang="x-default" href="https://webafondo.example/en/glossary/">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <!-- translate="no": el traductor automático no debe traducir el nombre de la marca -->
    <p><strong translate="no">Web a fondo</strong> · Glosario</p>
  </header>

  <main id="content">
    <h1>Glosario de la web</h1>
    <p>El documento está en español (<code>lang="es"</code> en la raíz). Cada término en otro idioma lleva su propio <code>lang</code>, para que un lector de pantalla lo pronuncie bien y el navegador lo trate como corresponde.</p>

    <!-- dl, dt y dd forman una lista de términos y definiciones (módulo 2) -->
    <dl>
      <dt>Analizador sintáctico (<span lang="en">parser</span>)</dt>
      <dd>La parte del navegador que convierte el texto HTML en el árbol del DOM, reparando los errores que encuentra.</dd>

      <dt>Origen (<span lang="en">origin</span>)</dt>
      <dd>Esquema, host y puerto de una URL. El navegador aísla los datos de cada origen.</dd>

      <dt>Mojibake (<span lang="ja">文字化け</span>)</dt>
      <dd>Palabra japonesa para el texto ilegible que aparece al leer unos bytes con la codificación equivocada.</dd>

      <dt>Algoritmo</dt>
      <dd>Viene del nombre del matemático persa al-Juarismi, que en árabe se escribe <span lang="ar" dir="rtl">الخوارزمي</span>. Con <code>dir="rtl"</code> el texto se escribe de derecha a izquierda.</dd>

      <dt>Navegador (<span lang="en">browser</span>)</dt>
      <dd>El programa que pide, interpreta y dibuja las páginas: <span translate="no">Chrome</span>, <span translate="no">Firefox</span> o <span translate="no">Safari</span>, entre otros.</dd>
    </dl>
  </main>

  <footer class="site-footer">
    <p>© 2026 <span translate="no">Web a fondo</span> · <a href="https://webafondo.example/en/glossary/" hreflang="en" lang="en">Read this glossary in English</a></p>
  </footer>
</body>
</html>
```
