---
example_description: "currentColor reutiliza el color del texto en bordes e iconos SVG: se cambia una propiedad y cambia todo"
example_tags: "css|color|currentcolor|svg"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p>Pasa el ratón por encima: solo cambia <code>color</code>, y le siguen el texto, el borde y el icono.</p>
<button type="button" class="tag">
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <circle cx="8" cy="8" r="6" fill="currentColor" />
  </svg>
  Etiqueta
</button>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* currentColor = «el valor de color de este mismo elemento» */
.tag {
  color: #1d4ed8;
  border: 2px solid currentColor;   /* el borde usa el color del texto */
  background: #ffffff;
  padding: 6px 12px;
}

/* El icono SVG tiene fill="currentColor": también usa el color del texto
   (lo viste en «SVG en HTML»). */

/* Un solo cambio arrastra a los tres */
.tag:hover {
  color: #b91c1c;
}

/* Curiosidad: el valor inicial de border-color ya es currentColor, así que
   border: 2px solid; (sin color) haría lo mismo. */
```
