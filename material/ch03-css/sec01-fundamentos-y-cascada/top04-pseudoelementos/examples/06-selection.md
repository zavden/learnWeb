---
example_description: "::selection cambia los colores del texto que el usuario selecciona con el ratón o el teclado"
example_tags: "css|pseudoelementos|selection"
example_stage: minimal
example_importance: trivial
---

# HTML

```html
<p class="custom">Selecciona este párrafo con el ratón (o haz doble clic en una palabra): se resalta con colores propios.</p>
<p>Selecciona este otro: usa el resaltado por defecto del sistema.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* ::selection → la parte del texto que el usuario tiene seleccionada */
.custom::selection {
  background-color: #fde047;
  color: #1e293b;
}

/* Solo acepta unas pocas propiedades: color, background-color, text-decoration,
   text-shadow… Las demás (font-size, padding…) se ignoran.
   Mantén buen contraste: el texto seleccionado tiene que seguir leyéndose. */
```
