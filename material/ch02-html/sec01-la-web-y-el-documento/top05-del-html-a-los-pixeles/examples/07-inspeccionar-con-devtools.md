---
example_description: "Guía práctica: Elements, Styles, Computed y Layout en DevTools"
example_tags: "devtools|elements|computed|layout"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<h1>Inspecciona esta página</h1>
<ol>
  <li>Abre DevTools (<kbd>⌥</kbd> <kbd>⌘</kbd> <kbd>I</kbd> en Mac, <kbd>F12</kbd> en Windows/Linux).</li>
  <li>Pulsa el selector de elementos (<kbd>⇧</kbd> <kbd>⌘</kbd> <kbd>C</kbd>) y haz clic en la tarjeta azul:
    el panel <b>Elements</b> la selecciona en el DOM.</li>
  <li>En <b>Styles</b> verás sus reglas, incluidas las del navegador
    («user agent stylesheet»), y las tachadas que perdieron.</li>
  <li>En <b>Computed</b> verás el diagrama de cajas: contenido, relleno (padding),
    borde y margen, con sus píxeles reales.</li>
  <li>En Elements, la rejilla de números lleva una etiqueta <code>grid</code>:
    púlsala y la página dibujará sus líneas (opciones en el panel <b>Layout</b>).</li>
</ol>

<article class="card">
  <h2>Tarjeta</h2>
  <p>Tengo margen, borde y relleno: búscalos en Computed.</p>
</article>

<div class="grid">
  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
</div>
```

# CSS

```css
/* Estilos para tener algo que inspeccionar (CSS: capítulo 3) */
.card {
  max-width: 320px;
  margin: 24px;
  padding: 16px;
  border: 4px solid #1d4ed8;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-width: 320px;
}

.grid span {
  padding: 8px;
  background: #dbeafe;
  text-align: center;
}
```
