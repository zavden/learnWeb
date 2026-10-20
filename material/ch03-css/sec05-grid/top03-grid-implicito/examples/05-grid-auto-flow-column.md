---
example_description: "grid-auto-flow: column rellena por columnas y crea columnas implícitas: una lista que se lee de arriba abajo en tres filas y un carrusel horizontal con grid-auto-columns y overflow-x"
example_tags: "css|grid|grid-auto-flow|grid-auto-columns|grid-implicito|carrusel"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption"><code>grid-template-rows: repeat(3, auto)</code> + <code>grid-auto-flow: column</code>: se llena de arriba abajo, y cada columna nueva es implícita</p>
<ol class="steps">
  <li>Elige la maceta</li>
  <li>Pon grava al fondo</li>
  <li>Añade tierra</li>
  <li>Saca la planta</li>
  <li>Afloja las raíces</li>
  <li>Colócala centrada</li>
  <li>Rellena los lados</li>
  <li>Riega despacio</li>
</ol>

<p class="caption">Un carrusel: una sola fila, <code>grid-auto-columns: 8rem</code> y scroll horizontal. ↔ Desplázalo.</p>
<ul class="carousel" tabindex="0" aria-label="Categorías">
  <li>Plantas de interior</li>
  <li>Suculentas</li>
  <li>Aromáticas</li>
  <li>Macetas</li>
  <li>Sustratos</li>
  <li>Herramientas</li>
  <li>Riego</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 8px 0 4px;
  font-size: 0.75rem;
}

.steps,
.carousel {
  display: grid;
  gap: 8px;
  max-width: 400px;
  margin: 0;
  padding: 0;
  outline: 2px dashed #0f766e;
  background: url(hatch.svg);
  font-size: 0.75rem;
}

/* Los números de la lista, dentro de cada caja; el carrusel, sin viñetas. */
.steps {
  list-style-position: inside;
}

.carousel {
  list-style: none;
}

.steps li,
.carousel li {
  padding: 6px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
}

/* grid-auto-flow decide en qué dirección coloca el algoritmo automático:
   row (por defecto) llena fila a fila y crea FILAS implícitas;
   column llena columna a columna y crea COLUMNAS implícitas.
   Aquí hay 3 filas explícitas; los 8 pasos necesitan 3 columnas, todas implícitas
   (grid-auto-columns: 1fr las reparte por igual). Se lee de arriba abajo. */
.steps {
  grid-template-rows: repeat(3, auto);
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
}

/* Sin grid-template-rows, una sola fila. Cada elemento abre una columna implícita
   de 8rem; la fila es más ancha que el contenedor y overflow-x la desplaza. */
.carousel {
  grid-auto-flow: column;
  grid-auto-columns: 8rem;
  overflow-x: auto;
}

.carousel:focus-visible {
  outline: 3px solid #1d4ed8;
}
```
