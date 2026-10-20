---
example_description: "display: flex en un párrafo con texto y etiquetas mezclados: cada trozo de texto se convierte en un elemento anónimo y se pierden los espacios"
example_tags: "css|flexbox|elementos-anonimos|texto|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="label">❌ <code>display: flex</code> en un párrafo con texto suelto</p>
<p class="total">Total: <strong>59,90 €</strong> IVA incluido</p>

<p class="label">El mismo párrafo con <code>gap: 16px</code>: se ve que son tres elementos</p>
<p class="total is-spaced">Total: <strong>59,90 €</strong> IVA incluido</p>

<p class="label">✅ Cada pieza en su elemento; la separación la pone el layout</p>
<p class="total is-fixed"><span>Total <small>(IVA incluido)</small></span> <strong>59,90 €</strong></p>
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

.total {
  max-width: 320px;
  margin: 0;
  padding: 6px 10px;
  border: 2px dashed #7c3aed;
  background: #f8fafc;
}

/* 🐛 En un contenedor flex, cada trozo de texto suelto entre etiquetas se envuelve en
   un ELEMENTO FLEX ANÓNIMO. Aquí hay tres elementos: «Total: », el strong y
   « IVA incluido». Cada uno es una caja aparte, y los espacios del borde de cada
   trozo desaparecen (como los del principio y el final de una línea).
   Resultado: «Total:59,90 €IVA incluido». No se pueden seleccionar con CSS: no son
   elementos del HTML, solo cajas que crea el navegador. */
.total {
  display: flex;
}

.is-spaced {
  gap: 16px;
}

/* ✅ No conviertas en flex un párrafo de texto corrido. Si quieres repartir piezas,
   ponlas cada una en su elemento. El espacio en blanco entre dos elementos flex se
   ignora: la separación la decide el layout (aquí, cada pieza en un extremo con
   justify-content: space-between, de la próxima lección). */
.is-fixed {
  justify-content: space-between;
}

.is-fixed small {
  color: #475569;
}
```
