---
example_description: "Un div con estilo de botón no recibe el foco con Tab, no se activa con Enter ni Espacio y no se anuncia como botón; button lo trae todo de serie"
example_tags: "html|accesibilidad|button|teclado|aria|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<p>Pulsa Tab varias veces: el foco se salta el falso botón. Prueba Enter y Espacio en cada uno.</p>

<!-- 🐛 Parece un botón, pero para el teclado y los lectores de pantalla es texto. -->
<div class="fake-button" onclick="console.log('div: clic')">Añadir al carrito (div)</div>

<!-- ✅ Foco, Enter, Espacio, rol «botón» y estado disabled, sin escribir nada más.
     (onclick en el HTML es la forma rápida de reaccionar a un clic; los eventos se estudian en el capítulo de JavaScript.) -->
<button type="button" class="real-button" onclick="console.log('button: clic (también con Enter o Espacio)')">Añadir al carrito (button)</button>

<!-- Primera regla de ARIA: si existe un elemento nativo con ese comportamiento, úsalo.
     Imitarlo con role="button" obliga a añadir tabindex y el manejo de teclado a mano. -->
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.fake-button,
.real-button {
  display: inline-block;
  margin: 8px 8px 0 0;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #1d4ed8;
  color: white;
  font: inherit;
  cursor: pointer;
}

.real-button:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 2px;
}
```
