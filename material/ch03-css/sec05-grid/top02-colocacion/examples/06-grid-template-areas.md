---
example_description: "grid-template-areas dibuja el layout con texto (cada cadena, una fila; cada palabra, una celda) y grid-area coloca cada elemento en su área por nombre: una ficha de planta"
example_tags: "css|grid|grid-template-areas|grid-area|areas|colocacion"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label">Cada área es un rectángulo con nombre. Ábrelo con ↗ y, en DevTools, activa <em>Show area names</em> (pestaña Layout) para ver los nombres sobre la ficha.</p>

<article class="plant">
  <img class="photo" src="plant-monstera.svg" alt="Una monstera en una maceta de barro" width="240" height="240">
  <h2 class="title">Monstera deliciosa</h2>
  <p class="meta">Interior · luz indirecta · riego semanal</p>
  <ul class="care">
    <li>Riega cuando la tierra esté seca a 3 cm.</li>
    <li>Gírala cada mes para que crezca recta.</li>
  </ul>
  <p class="tips"><strong>Consejo:</strong> limpia las hojas con un paño húmedo.</p>
</article>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 8px 0;
  font-size: 0.8rem;
}

/* grid-template-areas: cada cadena es una FILA y cada palabra, una CELDA.
   Las celdas con el mismo nombre forman un área, que debe ser un rectángulo.
   El número de columnas sale de las cadenas (aquí, 2); sus tamaños, de
   grid-template-columns. Un punto (.) sería una celda vacía. */
.plant {
  display: grid;
  grid-template-columns: 7rem 1fr;
  grid-template-areas:
    "photo title"
    "photo meta"
    "care  tips";
  gap: 8px 12px;
  max-width: 400px;
  padding: 10px;
  outline: 2px dashed #0f766e;
  background: url(hatch.svg);
  font-size: 0.8rem;
}

.plant > * {
  margin: 0;
  padding: 6px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
}

/* grid-area: <nombre> coloca el elemento en su área. No importa el orden del
   HTML ni hace falta contar líneas. */
.photo {
  grid-area: photo;
  box-sizing: border-box;      /* el 100 % incluye su padding y su borde */
  width: 100%;
  height: auto;
}

.title {
  grid-area: title;
  font-size: 1rem;
}

.meta {
  grid-area: meta;
}

.care {
  grid-area: care;
  padding-left: 1.5em;
}

.tips {
  grid-area: tips;
}
```
