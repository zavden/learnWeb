---
example_description: ":focus se activa con clic y con teclado; :focus-visible solo cuando conviene mostrarlo; :focus-within marca al contenedor"
example_tags: "css|pseudoclases|focus|accesibilidad"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p>1) Haz <strong>clic</strong> en cada botón. 2) Después pulsa <kbd>Tab</kbd> varias veces para moverte con el teclado.</p>
<div class="form-row">
  <label for="name">Nombre</label>
  <input id="name" type="text">
  <button type="button" class="btn-focus">:focus</button>
  <button type="button" class="btn-focus-visible">:focus-visible</button>
</div>
<p class="legend">Contorno rojo ← <code>:focus</code> · Contorno verde ← <code>:focus-visible</code> · Fondo azul del recuadro ← <code>:focus-within</code></p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.form-row {
  padding: 12px;
  border: 2px solid #cbd5e1;
}

/* :focus → el elemento tiene el foco, llegue como llegue (clic, Tab o JavaScript).
   (En Safari para macOS, un clic no da el foco a los botones: prueba con Tab.) */
.btn-focus:focus {
  outline: 3px solid #dc2626;
}

/* :focus-visible → tiene el foco Y el navegador cree que hay que mostrarlo:
   al llegar con el teclado, sí; al hacer clic en un botón, no.
   En un campo de texto se muestra siempre, también con clic: vas a escribir con el teclado. */
.btn-focus-visible:focus-visible,
input:focus-visible {
  outline: 3px solid #16a34a;
}

/* :focus-within → el elemento tiene el foco o lo tiene ALGUNO de sus descendientes */
.form-row:focus-within {
  background: #dbeafe;
}

/* Accesibilidad: no quites nunca el indicador de foco (outline: none) sin poner otro.
   Quien navega con teclado lo necesita para saber dónde está. */
```
