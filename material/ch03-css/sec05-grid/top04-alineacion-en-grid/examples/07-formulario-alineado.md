---
example_description: "Un formulario en dos columnas con grid: etiquetas alineadas a la derecha con justify-self, campos estirados, la casilla a su tamaño y el botón al final, todo alineado por la línea base"
example_tags: "css|grid|formulario|justify-self|align-items|baseline|max-content"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<form class="contact" action="/contacto" method="post">
  <label for="name">Nombre</label>
  <input id="name" name="name" autocomplete="name">

  <label for="email">Correo electrónico</label>
  <input id="email" name="email" type="email" autocomplete="email">

  <label for="topic">Asunto</label>
  <select id="topic" name="topic">
    <option>Un pedido</option>
    <option>Cuidado de plantas</option>
    <option>Otra cosa</option>
  </select>

  <label for="message">Mensaje</label>
  <textarea id="message" name="message" rows="3"></textarea>

  <label class="check"><input type="checkbox" name="copy"> Enviarme una copia</label>

  <button type="submit">Enviar</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

/* Dos columnas: las etiquetas, tan anchas como la más larga (max-content); los
   campos, el resto. Cada etiqueta y su campo caen solos en la misma fila. */
.contact {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 10px 12px;
  max-width: 400px;
  padding: 12px;
  outline: 2px dashed #0f766e;
  font-size: 0.85rem;
  /* baseline: el texto de cada etiqueta se apoya en la misma línea que el texto de
     su campo (en el textarea, su primera línea). Con center, una etiqueta junto a
     un textarea de 3 filas quedaría a media altura. */
  align-items: baseline;
}

/* Las etiquetas, pegadas a su campo: al final de su celda. */
.contact > label {
  justify-self: end;
  font-weight: bold;
}

/* Los campos se estiran a lo ancho (justify-self: normal = stretch). */
.contact input,
.contact select,
.contact textarea {
  box-sizing: border-box;
  padding: 4px 6px;
  border: 1px solid #0f766e;
  border-radius: 4px;
  font: inherit;
}

.contact :focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 1px;
}

/* La casilla, en la columna de los campos y a su tamaño (no estirada). */
.contact > .check {
  grid-column: 2;
  justify-self: start;
  font-weight: normal;
}

/* El botón, en la columna de los campos y al final de su celda. */
.contact button {
  grid-column: 2;
  justify-self: end;
  padding: 6px 16px;
  border: 0;
  border-radius: 6px;
  background: #0f766e;
  color: #ffffff;
  font: inherit;
  font-weight: bold;
}
```
