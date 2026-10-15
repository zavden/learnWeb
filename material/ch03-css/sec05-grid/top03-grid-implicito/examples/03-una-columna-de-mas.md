---
example_description: "En una rejilla de 3 columnas, grid-column: 4 no es «la última columna»: empieza en la línea 4 y crea una columna implícita que roba sitio a las demás; la última columna es la que empieza en -2"
example_tags: "css|grid|grid-column|grid-implicito|grid-auto-columns|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">❌ «Ventas» con <code>grid-column: 4</code> para mandarla a la última columna: aparece una <strong>cuarta</strong> columna, del ancho de su contenido, y los demás también la usan</p>
<div class="dashboard">
  <div class="widget">Pedidos <b>128</b></div>
  <div class="widget">Ingresos <b>48 300</b></div>
  <div class="widget">Clientes <b>37</b></div>
  <div class="widget">Reseñas <b>4,8</b></div>
  <div class="widget sales is-wrong">Ventas <b>212</b></div>
</div>

<p class="caption">✅ <code>grid-column: -2</code>: empieza en la penúltima línea, es decir, en la última columna</p>
<div class="dashboard">
  <div class="widget">Pedidos <b>128</b></div>
  <div class="widget">Ingresos <b>48 300</b></div>
  <div class="widget">Clientes <b>37</b></div>
  <div class="widget">Reseñas <b>4,8</b></div>
  <div class="widget sales is-right">Ventas <b>212</b></div>
</div>
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

.dashboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 400px;
  outline: 2px dashed #0f766e;
  background: url(hatch.svg);
  font-size: 0.75rem;
}

.widget {
  padding: 6px 8px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
}

.widget b {
  display: block;
  font-size: 1.1rem;
}

.sales {
  border-color: #b45309;
  background: #fef3c7;
}

/* 🐛 Con 3 columnas hay 4 líneas. grid-column: 4 significa «empieza en la línea 4»,
   y a la derecha de la línea 4 no hay ninguna columna: el navegador crea una
   columna IMPLÍCITA. No da error ni avisa.
   - Su ancho lo da grid-auto-columns (auto): el contenido de lo que caiga en ella.
     Las columnas 1fr se reparten lo que queda, así que encogen.
   - La rejilla tiene ahora 4 columnas para TODOS: los elementos sin posición
     también la llenan («Reseñas» sube a la primera fila).
   - «Ventas» llega la última, encuentra ocupada la columna 4 de la primera fila
     y baja a la segunda. */
.is-wrong {
  grid-column: 4;
}

/* ✅ La última columna empieza en la penúltima línea: -2 (o 3, contando desde el
   principio). Con -2 funciona igual si mañana la rejilla tiene 4 columnas. */
.is-right {
  grid-column: -2;
}
```
