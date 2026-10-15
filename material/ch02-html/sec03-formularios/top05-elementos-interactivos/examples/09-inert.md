---
example_description: "inert deja una parte de la página a la vista pero fuera de alcance: no se enfoca, no se pulsa, no se selecciona y desaparece del árbol de accesibilidad"
example_tags: "html|interactivos|inert|foco|accesibilidad"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Marca la casilla y luego intenta pulsar los botones del pedido, llegar a ellos con Tab o
     seleccionar su texto. (onchange y onclick: los eventos llegan en el capítulo de JavaScript.) -->
<p>
  <label>
    <input type="checkbox" onchange="document.getElementById('order').inert = this.checked">
    Pedido en revisión: bloquear los cambios
  </label>
</p>

<!-- inert: el contenido se sigue viendo, pero no se puede enfocar, pulsar, seleccionar ni
     encontrar con ⌘F, y desaparece del árbol de accesibilidad. No cambia el aspecto: eso es
     cosa del CSS. -->
<section id="order" aria-labelledby="order-title">
  <h2 id="order-title">Tu pedido</h2>
  <p>
    Semillas de tomate cherry ·
    <label for="quantity">Sobres</label>
    <input id="quantity" name="quantity" type="number" min="1" max="20" value="2">
  </p>
  <button type="button" onclick="console.log('💾 Cambios guardados')">Guardar cambios</button>
  <button type="button" onclick="console.log('✖ Pedido cancelado')">Cancelar el pedido</button>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* El CSS indica lo que inert hace (selector de atributo: capítulo de CSS). Como un botón
   disabled, un contenido inactivo puede perder contraste; la casilla lo dice con palabras. */
[inert] {
  opacity: 0.55;
}

:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```
