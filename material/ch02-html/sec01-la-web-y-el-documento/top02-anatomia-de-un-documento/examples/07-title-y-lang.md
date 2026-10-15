---
example_description: "title va a la pestaña; lang cambia cómo el navegador trata el texto"
example_tags: "title|lang|idioma|head"
example_stage: minimal
example_importance: important
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Título de la pestaña · Curso web</title>
  <style>
    /* Un poco de CSS solo para hacer visible el efecto de lang (el CSS llega en el capítulo 3) */
    .narrow { width: 7em; padding: 4px; border: 1px solid #888; hyphens: auto; }
    .upper { text-transform: uppercase; }
  </style>
</head>
<body>
  <!-- El title no se dibuja en la página: va a la pestaña, al historial, a los
       marcadores y a los resultados del buscador. Aquí lo verás en la consola. -->
  <h1>Lo que hace lang</h1>

  <h2>1. Partir palabras con guion</h2>
  <!-- Hereda lang="es" de la raíz: el navegador sabe dónde partir en español -->
  <p class="narrow">Otorrinolaringología electroencefalográfica</p>
  <!-- lang="" = idioma desconocido: no sabe partir y la palabra se sale de la caja -->
  <p class="narrow" lang="">Otorrinolaringología electroencefalográfica</p>

  <h2>2. Pasar a mayúsculas</h2>
  <!-- En turco, la «i» con punto tiene su propia mayúscula, «İ» -->
  <p class="upper" lang="tr">istanbul, iyi günler</p>
  <p class="upper" lang="en">istanbul, iyi günler</p>

  <script>
    console.log('document.title       →', document.title);
    console.log('idioma del documento →', document.documentElement.lang);
  </script>
</body>
</html>
```
