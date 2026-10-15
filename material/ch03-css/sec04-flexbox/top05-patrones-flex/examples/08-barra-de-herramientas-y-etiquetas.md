---
example_description: "Barras de herramientas y etiquetas que se reparten en varias líneas con flex-wrap y gap: grupos que bajan enteros y un grupo de acciones que sigue a la derecha"
example_tags: "css|flexbox|flex-wrap|gap|toolbar|etiquetas|patrones"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="label">La barra de un editor de entradas, en 440px y en 240px. Estrecha la vista previa o ábrela con ↗ para ver cómo se reparte.</p>
<div class="editor-bar">
  <div class="group" aria-label="Formato" role="group">
    <button type="button" aria-label="Negrita"><b>B</b></button>
    <button type="button" aria-label="Cursiva"><i>I</i></button>
    <button type="button" aria-label="Enlace">🔗</button>
  </div>
  <div class="group" aria-label="Insertar" role="group">
    <button type="button">Imagen</button>
    <button type="button">Tabla</button>
  </div>
  <div class="group actions" aria-label="Acciones" role="group">
    <button type="button">Borrador</button>
    <button type="button" class="primary">Publicar</button>
  </div>
</div>

<div class="editor-bar is-narrow">
  <div class="group" aria-label="Formato, barra estrecha" role="group">
    <button type="button" aria-label="Negrita"><b>B</b></button>
    <button type="button" aria-label="Cursiva"><i>I</i></button>
    <button type="button" aria-label="Enlace">🔗</button>
  </div>
  <div class="group" aria-label="Insertar, barra estrecha" role="group">
    <button type="button">Imagen</button>
    <button type="button">Tabla</button>
  </div>
  <div class="group actions" aria-label="Acciones, barra estrecha" role="group">
    <button type="button">Borrador</button>
    <button type="button" class="primary">Publicar</button>
  </div>
</div>

<p class="label">Etiquetas: tantas por línea como quepan, con la misma separación en las dos direcciones</p>
<ul class="tags" aria-label="Etiquetas de la entrada">
  <li>suculentas</li><li>riego</li><li>interior</li><li>poca luz</li><li>principiantes</li><li>macetas de barro</li><li>invierno</li><li>plagas</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

/* Dos niveles de flex con wrap: la barra reparte GRUPOS, y cada grupo reparte sus
   botones. Si un grupo no cabe, baja ENTERO a la línea siguiente. */
.editor-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;              /* 8px entre líneas, 16px entre grupos */
  max-width: 440px;
  margin-bottom: 8px;
  padding: 6px;
  outline: 2px dashed #7c3aed;
  background: #f8fafc;
}

.is-narrow {
  max-width: 240px;
}

.group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* El margen automático empuja las acciones al final de la línea en la que caigan.
   En la barra estrecha bajan a su propia línea y siguen a la derecha. */
.actions {
  margin-left: auto;
}

.group button {
  min-width: 30px;
  padding: 4px 8px;
  border: 1px solid #64748b;
  border-radius: 6px;
  background: #ffffff;
  color: #1e293b;
  font: inherit;
  font-size: 0.8rem;
}

.group .primary {
  border-color: #166534;
  background: #166534;
  color: #ffffff;
}

.group button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* gap en las dos direcciones: sin márgenes que sobren al final de cada línea. */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 300px;
  margin: 0;
  padding: 6px;
  outline: 2px dashed #7c3aed;
  list-style: none;
}

.tags li {
  padding: 2px 10px;
  border-radius: 999px;
  background: #dcfce7;
  color: #14532d;
  font-size: 0.8rem;
}
```
