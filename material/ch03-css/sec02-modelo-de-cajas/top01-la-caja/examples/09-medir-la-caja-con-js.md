---
example_description: "Las cuatro formas de leer el ancho de una caja desde JavaScript y qué área mide cada una, con content-box y border-box"
example_tags: "css|modelo-de-cajas|javascript|getBoundingClientRect"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<div class="box content-box">content-box</div>
<div class="box border-box">border-box</div>
<p>Las dos tienen <code>width: 200px; padding: 20px; border: 5px; margin: 10px</code>.</p>
<table>
  <thead>
    <tr><th scope="col">Lectura</th><th scope="col">content-box</th><th scope="col">border-box</th><th scope="col">Qué mide</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row"><code>getComputedStyle(el).width</code></th><td id="a-css"></td><td id="b-css"></td><td>la propiedad <code>width</code></td></tr>
    <tr><th scope="row"><code>el.clientWidth</code></th><td id="a-client"></td><td id="b-client"></td><td>contenido + padding</td></tr>
    <tr><th scope="row"><code>el.offsetWidth</code></th><td id="a-offset"></td><td id="b-offset"></td><td>de borde a borde (entero)</td></tr>
    <tr><th scope="row"><code>el.getBoundingClientRect().width</code></th><td id="a-rect"></td><td id="b-rect"></td><td>de borde a borde (con decimales)</td></tr>
  </tbody>
</table>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.box {
  width: 200px;
  padding: 20px;
  border: 5px solid #1d4ed8;
  margin: 10px;
  background: #bfdbfe;
}

.border-box {
  box-sizing: border-box;
}

table {
  border-collapse: collapse;
  font-size: 0.85rem;
}

th, td {
  border: 1px solid #cbd5e1;
  padding: 4px 8px;
  text-align: left;
}

td:not(:last-child) {
  font-weight: bold;
}

/* Ninguna lectura incluye el margen: no es parte de la caja visible.
   Para leerlo: getComputedStyle(el).marginLeft. */
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Aquí solo leemos medidas
// de cada caja y las escribimos en su celda de la tabla.
function measure(box, prefix) {
  document.getElementById(prefix + '-css').textContent = getComputedStyle(box).width;
  document.getElementById(prefix + '-client').textContent = box.clientWidth + 'px';
  document.getElementById(prefix + '-offset').textContent = box.offsetWidth + 'px';
  document.getElementById(prefix + '-rect').textContent = box.getBoundingClientRect().width + 'px';
}

measure(document.querySelector('.content-box'), 'a');
measure(document.querySelector('.border-box'), 'b');
```
