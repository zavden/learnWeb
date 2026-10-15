---
example_description: "inline-block: cajas que se colocan en la línea como texto pero aceptan ancho, alto, márgenes y relleno"
example_tags: "css|display|inline-block"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="product">Zapatillas de montaña Aneto · 89,95 € <span class="badge">Nuevo</span></p>
<p>Elige tu talla:</p>
<p class="sizes">
  <span class="size">38</span>
  <span class="size">39</span>
  <span class="size">40</span>
  <span class="size">41</span>
  <span class="size">42</span>
  <span class="size">43</span>
  <span class="size">44</span>
  <span class="size">45</span>
</p>
<p class="hint">Estrecha la vista previa: las tallas bajan a la línea siguiente como si fueran palabras.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* inline-block = «hacia fuera, en línea; hacia dentro, un bloque».
   - Hacia fuera: va dentro de la línea, junto al texto, y salta de línea como una palabra.
   - Hacia dentro: respeta width, height, margin y padding en las cuatro direcciones. */
.size {
  display: inline-block;
  width: 3em;                 /* todas iguales, aunque el número sea más estrecho */
  padding: 8px 0;
  margin: 0 4px 8px 0;        /* el margen inferior separa las filas al partirse */
  border: 1px solid #64748b;
  border-radius: 6px;
  text-align: center;         /* centra el texto en línea dentro de la caja */
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  margin-left: 8px;
  border-radius: 999px;
  background: #16a34a;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

/* Entre las tallas hay un pequeño hueco además del margen: es el ESPACIO EN BLANCO
   del HTML (el salto de línea entre <span>), que en una línea de texto vale lo que
   un espacio. Lo viste en la lección del parser de HTML. */

.hint {
  color: #475569;
  font-size: 0.85rem;
}
```
