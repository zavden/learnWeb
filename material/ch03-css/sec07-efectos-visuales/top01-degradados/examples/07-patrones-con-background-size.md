---
example_description: "Un degradado llena la caja, pero background-size lo convierte en una baldosa que se repite: lunares, papel cuadriculado y tablero de ajedrez; varios degradados se apilan como cualquier capa de fondo"
example_tags: "css|degradados|patrones|background-size|fondos-multicapa"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<p class="caption">Ninguna de estas cajas usa una imagen: cada patrón es una baldosa (el recuadro discontinuo marca la primera) que <code>background-repeat</code> repite.</p>
<ul class="tiles">
  <li><div class="tile dots"><span class="cell is-20"></span></div><strong>Lunares</strong>: un <code>radial-gradient</code> en baldosas de 20 × 20</li>
  <li><div class="tile grid-paper"><span class="cell is-20"></span></div><strong>Cuadrícula</strong>: dos <code>linear-gradient</code> (líneas horizontales y verticales) apilados</li>
  <li><div class="tile checker"><span class="cell is-40"></span></div><strong>Ajedrez</strong>: un <code>conic-gradient</code> de cuatro cuartos en baldosas de 40 × 40</li>
  <li><div class="tile layers"></div><strong>Tres capas</strong>: lunares encima, rayas debajo y el color al fondo</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 0 0 8px;
  font-size: 0.75rem;
}

.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, 200px);
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.7rem;
}

.tile {
  position: relative;
  width: 200px;
  height: 100px;
  margin-bottom: 4px;
  outline: 1px solid #cbd5e1;
}

/* El recuadro de la primera baldosa (solo para verla). */
.cell {
  position: absolute;
  top: 0;
  left: 0;
  outline: 2px dashed #dc2626;
}

.cell.is-20 { width: 20px; height: 20px; }
.cell.is-40 { width: 40px; height: 40px; }

/* Sin background-size, un degradado mide lo que la caja. Con 20px 20px, la
   imagen generada es una baldosa de 20 × 20 con un punto en el centro, y
   background-repeat: repeat (el valor inicial) la repite. */
.dots {
  background-color: #dbeafe;
  background-image: radial-gradient(circle, #1d4ed8 0 4px, transparent 4.5px);
  background-size: 20px 20px;
}

/* Dos capas en la misma lista: la primera pinta 1px arriba de cada baldosa
   (una línea horizontal) y la segunda 1px a la izquierda (una vertical). */
.grid-paper {
  background-color: #ffffff;
  background-image:
    linear-gradient(#93c5fd 1px, transparent 1px),
    linear-gradient(to right, #93c5fd 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Cuatro cuartos alternos alrededor del centro de la baldosa: oscuro, claro,
   oscuro, claro. Con baldosas de 40px salen casillas de 20px. */
.checker {
  background-image: repeating-conic-gradient(#334155 0 25%, #f1f5f9 0 50%);
  background-size: 40px 40px;
}

/* Los degradados son imágenes y se apilan como en la lección de fondos
   multicapa: la primera capa queda ENCIMA y el color, siempre al fondo.
   Cada lista (image, size) se empareja por posición. */
.layers {
  background-color: #fef3c7;
  background-image:
    radial-gradient(circle, #9a3412 0 3px, transparent 3.5px),
    repeating-linear-gradient(45deg, #fdba74 0 6px, transparent 6px 18px);
  background-size: 24px 24px, auto;
}
```
