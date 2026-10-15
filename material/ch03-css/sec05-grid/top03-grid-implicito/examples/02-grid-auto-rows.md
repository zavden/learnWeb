---
example_description: "grid-auto-rows: minmax(4rem, auto) da filas de al menos 4rem que crecen con el contenido; grid-auto-rows: 1fr, sin altura en el contenedor, iguala todas las filas a la más alta"
example_tags: "css|grid|grid-auto-rows|minmax|fr|grid-implicito"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption"><code>grid-auto-rows: minmax(4rem, auto)</code>: cada fila mide al menos 4rem y crece si su contenido lo pide</p>
<ul class="notes is-min">
  <li>Comprar tierra para macetas</li>
  <li>Regar el helecho</li>
  <li>Trasplantar la monstera a una maceta de 30 cm con buen drenaje y abonarla dentro de un mes</li>
  <li>Podar el pothos</li>
  <li>Revisar plagas</li>
  <li>Girar el ficus</li>
</ul>

<p class="caption"><code>grid-auto-rows: 1fr</code>: el contenedor no tiene altura, así que una fr vale lo que la fila más alta, y todas miden eso</p>
<ul class="notes is-equal">
  <li>Comprar tierra para macetas</li>
  <li>Regar el helecho</li>
  <li>Trasplantar la monstera a una maceta de 30 cm con buen drenaje y abonarla dentro de un mes</li>
  <li>Podar el pothos</li>
  <li>Revisar plagas</li>
  <li>Girar el ficus</li>
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

.notes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-width: 400px;
  margin: 0;
  padding: 0;
  outline: 2px dashed #0f766e;
  background: url(hatch.svg);
  list-style: none;
  font-size: 0.75rem;
}

.notes li {
  padding: 6px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
}

/* Solo hay columnas: las dos filas son implícitas y las dimensiona grid-auto-rows.
   minmax(4rem, auto): nunca menos de 4rem; si el texto no cabe, la fila crece
   (y solo esa fila: la primera sigue en 4rem). */
.is-min {
  grid-auto-rows: minmax(4rem, auto);
}

/* El truco de la lección 1: sin altura definida, 1fr no reparte nada, pero vale lo
   mismo en todas las pistas. El navegador busca el valor de 1fr que deja caber el
   contenido de TODAS las filas (el de la más alta) y se lo da a cada una. */
.is-equal {
  grid-auto-rows: 1fr;
}
```
