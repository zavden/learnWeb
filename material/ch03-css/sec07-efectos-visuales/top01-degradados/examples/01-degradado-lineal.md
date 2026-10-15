---
example_description: "linear-gradient() es una imagen que va de un color a otro a lo largo de una línea: sin dirección baja de arriba abajo, to right y los ángulos la giran (0deg hacia arriba, en sentido horario); en background-color no vale"
example_tags: "css|degradados|linear-gradient|background-image|angulos"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">Seis cajas de 140 × 70 con el mismo par de colores. Debajo de cada una, su <code>background-image</code>.</p>
<ul class="tiles">
  <li><div class="tile g-default"></div><code>(azul, ámbar)</code><br>sin dirección: hacia abajo</li>
  <li><div class="tile g-right"></div><code>(to right, …)</code><br>hacia la derecha</li>
  <li><div class="tile g-corner"></div><code>(to bottom left, …)</code><br>hacia una esquina</li>
  <li><div class="tile g-90"></div><code>(90deg, …)</code><br>= <code>to right</code></li>
  <li><div class="tile g-200"></div><code>(200deg, …)</code><br>abajo y un poco a la izquierda</li>
  <li><div class="tile g-three"></div><code>(to right, 3 colores)</code><br>repartidos a partes iguales</li>
</ul>

<p class="caption">Los ángulos se miden desde arriba y en el sentido de las agujas del reloj:
  <code>0deg</code> ↑ · <code>90deg</code> → · <code>180deg</code> ↓ · <code>270deg</code> ←</p>

<p class="caption">❌ <code>background-color: linear-gradient(…)</code>: un degradado es una <strong>imagen</strong>, no un color. La declaración es inválida y se ignora en silencio</p>
<div class="tile is-invalid"></div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 10px 0 6px;
  font-size: 0.75rem;
}

.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, 140px);
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.7rem;
}

.tile {
  width: 140px;
  height: 70px;
  margin-bottom: 4px;
  border-radius: 6px;
  outline: 1px solid #cbd5e1;
}

/* Un degradado no es un color: es una IMAGEN que el navegador genera al tamaño
   de la caja. Va en background-image (o en el atajo background), como url(). */
.g-default { background-image: linear-gradient(#1d4ed8, #f59e0b); }      /* to bottom */
.g-right   { background-image: linear-gradient(to right, #1d4ed8, #f59e0b); }
.g-corner  { background-image: linear-gradient(to bottom left, #1d4ed8, #f59e0b); }

/* Un ángulo indica hacia dónde va el degradado: 0deg es hacia arriba y los
   grados crecen en el sentido de las agujas del reloj (como una brújula). */
.g-90      { background-image: linear-gradient(90deg, #1d4ed8, #f59e0b); }
.g-200     { background-image: linear-gradient(200deg, #1d4ed8, #f59e0b); }

/* Sin posiciones, los colores se reparten a la misma distancia: 0 %, 50 %, 100 %. */
.g-three   { background-image: linear-gradient(to right, #1d4ed8, #f59e0b, #dc2626); }

/* ❌ background-color solo acepta un color. Con una imagen dentro, la
   declaración es inválida: DevTools la muestra tachada con un aviso. */
.is-invalid {
  background-color: linear-gradient(#1d4ed8, #f59e0b);
}
```
