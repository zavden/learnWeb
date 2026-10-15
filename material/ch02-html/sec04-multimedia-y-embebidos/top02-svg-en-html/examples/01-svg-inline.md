---
example_description: "Un svg escrito dentro del HTML es parte del documento: sus formas son elementos que el CSS alcanza, y se ve nítido a cualquier tamaño"
example_tags: "html|svg|inline|vectorial|viewbox"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<!-- Un SVG dentro del HTML: no hace falta xmlns ni un archivo aparte. Sus formas (circle…)
     son elementos del documento, como un p o un button. Pasa el ratón por encima del sol. -->
<h2>Previsión para el huerto: soleado</h2>

<p>
  <!-- viewBox="0 0 100 100": se dibuja en un lienzo de 100 × 100 unidades.
       width y height: lo que ocupa en la página. role="img" + title: su nombre accesible. -->
  <svg width="60" height="60" viewBox="0 0 100 100" role="img" aria-labelledby="sun-small">
    <title id="sun-small">Sol pequeño</title>
    <circle cx="50" cy="50" r="38" fill="none" stroke="#b45309" stroke-width="8" stroke-dasharray="6 9"/>
    <circle class="sun" cx="50" cy="50" r="24" fill="#f59e0b" stroke="#b45309" stroke-width="3"/>
  </svg>

  <!-- El MISMO dibujo, con el triple de width y height: sigue nítido, porque el navegador
       vuelve a dibujar las formas al nuevo tamaño (no son píxeles estirados) -->
  <svg width="180" height="180" viewBox="0 0 100 100" role="img" aria-labelledby="sun-big">
    <title id="sun-big">Sol grande</title>
    <circle cx="50" cy="50" r="38" fill="none" stroke="#b45309" stroke-width="8" stroke-dasharray="6 9"/>
    <circle class="sun" cx="50" cy="50" r="24" fill="#f59e0b" stroke="#b45309" stroke-width="3"/>
  </svg>
</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* El CSS de la página llega a las formas del SVG (selectores y :hover: capítulo de CSS) */
.sun:hover {
  fill: #fcd34d;
}
```
