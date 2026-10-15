---
example_description: "Un elemento centrado con flex que no cabe se desborda por los dos lados, y el trozo de arriba queda fuera del alcance del scroll; safe center o margin: auto lo evitan"
example_tags: "css|flexbox|align-items|safe|overflow|centrar|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="label">↕ Desplaza cada recuadro hacia arriba: ¿puedes leer el título?</p>

<div class="column">
  <p class="caption">❌ <code>align-items: center</code></p>
  <div class="viewport is-unsafe" tabindex="0" role="region" aria-label="Aviso centrado sin safe">
    <div class="dialog">
      <h3>¿Borrar la carpeta «Fotos 2025»?</h3>
      <p>Se borrarán 248 fotos y 12 vídeos. Podrás recuperarlos desde la papelera durante 30 días; después se eliminarán para siempre.</p>
      <button type="button">Borrar carpeta</button>
    </div>
  </div>
</div>

<div class="column">
  <p class="caption">✅ <code>align-items: safe center</code></p>
  <div class="viewport is-safe" tabindex="0" role="region" aria-label="Aviso centrado con safe">
    <div class="dialog">
      <h3>¿Borrar la carpeta «Fotos 2025»?</h3>
      <p>Se borrarán 248 fotos y 12 vídeos. Podrás recuperarlos desde la papelera durante 30 días; después se eliminarán para siempre.</p>
      <button type="button">Borrar carpeta</button>
    </div>
  </div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label,
.caption {
  margin: 0 0 4px;
  font-size: 0.8rem;
}

.column {
  display: inline-block;
  vertical-align: top;
  width: 210px;
  margin-right: 8px;
}

/* Un recuadro con scroll que centra su contenido, como el fondo de una ventana modal. */
.viewport {
  display: flex;
  justify-content: center;
  height: 100px;
  overflow: auto;
  border: 2px dashed #7c3aed;
  background: #e2e8f0;
}

.viewport:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.dialog {
  width: 85%;
  padding: 8px;
  border-radius: 8px;
  background: #ffffff;
  font-size: 0.8rem;
}

.dialog h3 {
  margin: 0 0 4px;
  font-size: 0.9rem;
}

.dialog p {
  margin: 0 0 6px;
}

/* 🐛 El aviso mide más que los 100px del recuadro. center lo centra de todas formas:
   sobresale lo MISMO por arriba que por abajo. El scroll solo llega a lo que se sale
   por abajo (o por la derecha); lo que sobresale por arriba queda fuera para siempre,
   y con él, el título. Con una ventana modal en un móvil pasa lo mismo. */
.is-unsafe {
  align-items: center;
}

/* ✅ safe: «centra si cabe; si no cabe, alinea al inicio». El aviso empieza arriba
   y el scroll llega a todo.
   Alternativa clásica: margin: auto en .dialog. Un margen automático nunca es
   negativo: si no sobra espacio vale 0 y el elemento se queda al inicio. */
.is-safe {
  align-items: safe center;
}
```
