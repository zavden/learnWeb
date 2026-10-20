---
example_description: "header y footer no son solo de la página: un article puede tener los suyos, con la fecha (time) y el autor (address)"
example_tags: "html|semantica|header|footer|time|address"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<article>
  <header>
    <h1>Diez plantas aromáticas para la cocina</h1>
    <!-- time con datetime: la fecha legible para personas y la fecha exacta para máquinas. -->
    <p>Publicado el <time datetime="2026-04-18">18 de abril de 2026</time></p>
  </header>

  <p>La albahaca, el cilantro y la menta son las más agradecidas en un balcón soleado.</p>

  <footer>
    <!-- address: datos de contacto del AUTOR del artículo (no una dirección postal cualquiera). -->
    <address>Escrito por <a href="mailto:marta@ejemplo.es">Marta Ruiz</a></address>
    <p>Etiquetas: aromáticas, balcón</p>
  </footer>
</article>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 600px;
}

article > header,
article > footer {
  background: #f1f5f9;
  padding: 4px 12px;
}

address {
  font-style: normal;            /* el navegador pone address en cursiva por defecto */
}

/* Dentro de un article (o de un section), header y footer pertenecen a ese bloque:
   ya no son el «banner» ni la «información de contacto» de la página entera. */
```
