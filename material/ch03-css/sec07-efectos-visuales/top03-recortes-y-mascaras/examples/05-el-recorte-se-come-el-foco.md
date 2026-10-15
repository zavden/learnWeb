---
example_description: "clip-path recorta todo lo que se pinta fuera de la forma, también la box-shadow y el outline del foco: con el teclado ya no se ve qué botón está activo. La sombra y el anillo de foco van en un envoltorio sin recortar"
example_tags: "css|recortes|clip-path|focus-visible|outline|drop-shadow|accesibilidad|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">Botones con forma de flecha. Pulsa <kbd>Tab</kbd> para recorrerlos con el teclado. A la derecha de cada fila, una copia fija del estado <code>:focus-visible</code>.</p>

<p class="label">❌ <code>box-shadow</code> y <code>outline</code> en el botón recortado: no se ve ni la sombra ni el foco</p>
<div class="row">
  <button class="next is-broken" type="button">Siguiente</button>
  <button class="next is-broken is-focused" type="button" tabindex="-1">Siguiente</button>
</div>

<p class="label">✅ Sombra con <code>drop-shadow()</code> y anillo de foco en un envoltorio sin <code>clip-path</code></p>
<div class="row">
  <span class="next-wrap"><button class="next" type="button">Siguiente</button></span>
  <span class="next-wrap is-focused"><button class="next" type="button" tabindex="-1">Siguiente</button></span>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.label {
  margin: 8px 0 8px;
  font-size: 0.72rem;
}

.row {
  display: flex;
  gap: 32px;
  padding: 6px;
}

.next {
  display: block;
  width: 150px;
  height: 48px;
  padding: 0 32px 0 16px;
  border: 0;
  background: #1d4ed8;
  color: #ffffff;
  font: inherit;
  font-weight: 700;
  text-align: start;
  cursor: pointer;
  clip-path: polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%);
}

/* 🐛 clip-path recorta TODO lo que se pinta fuera de la forma: la sombra y el
   outline se dibujan fuera de la caja, así que desaparecen enteros. Con el
   teclado, el foco es invisible (un fallo de accesibilidad grave). */
.is-broken {
  box-shadow: 0 4px 8px rgb(15 23 42 / 0.4);
}

.is-broken:focus-visible,
.is-broken.is-focused {
  outline: 3px solid #b45309;
  outline-offset: 3px;
}

/* ✅ El envoltorio no tiene recorte. drop-shadow() hace la sombra de lo que
   pinta su contenido (la flecha), y el anillo de foco se dibuja en él cuando
   el botón de dentro tiene el foco del teclado (:has, del primer módulo).
   El anillo es rectangular, pero se ve, que es lo que importa. */
.next-wrap {
  display: block;
  filter: drop-shadow(0 4px 4px rgb(15 23 42 / 0.4));
}

.next-wrap:has(:focus-visible),
.next-wrap.is-focused {
  outline: 3px solid #b45309;
  outline-offset: 3px;
}

/* Y un segundo indicador, dentro de la forma: el texto subrayado. */
.next-wrap :focus-visible,
.next-wrap.is-focused .next {
  text-decoration: underline 2px;
  text-underline-offset: 4px;
}
```
