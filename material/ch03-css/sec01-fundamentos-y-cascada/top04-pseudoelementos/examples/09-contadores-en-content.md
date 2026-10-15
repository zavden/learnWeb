---
example_description: "Numerar secciones solo con CSS: counter-reset, counter-increment y counter() dentro de content"
example_tags: "css|pseudoelementos|before|contadores"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<article class="doc">
  <h2>Introducción</h2>
  <p>Ningún número de los títulos está escrito en el HTML.</p>
  <h2>Instalación</h2>
  <p>Añade otro h2 en medio y verás cómo se renumeran todos.</p>
  <h2>Primeros pasos</h2>
  <p>Los números los calcula el CSS con un contador.</p>
</article>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* 1) counter-reset crea un contador (el nombre lo eliges tú) y lo pone a 0 */
.doc {
  counter-reset: section;
}

/* 2) counter-increment le suma 1 cada vez que el navegador encuentra un h2 */
.doc h2 {
  counter-increment: section;
}

/* 3) counter() escribe el valor actual dentro de content, concatenado con texto */
.doc h2::before {
  content: "Sección " counter(section) ". ";
  color: #64748b;
}
```
