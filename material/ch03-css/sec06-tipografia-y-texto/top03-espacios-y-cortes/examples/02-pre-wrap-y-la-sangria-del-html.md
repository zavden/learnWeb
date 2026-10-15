---
example_description: "Para mostrar los saltos de línea que escribió un usuario hace falta white-space: pre-line o pre-wrap, pero entonces los espacios y saltos de la plantilla HTML también se ven: una línea en blanco y sangría"
example_tags: "css|tipografia|white-space|pre-wrap|pre-line|plantillas|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="label">Una reseña escrita en un <code>textarea</code>, con un salto entre las dos frases. La plantilla del HTML la mete en un párrafo con sangría.</p>

<p class="caption">❌ <code>normal</code>: el salto que escribió Mariana desaparece</p>
<article class="review">
  <p class="author">Mariana, Puebla</p>
  <p class="comment is-normal">
    Llegó a tiempo y bien empaquetado.
    El pan sabe como el de mi abuela.
  </p>
</article>

<p class="caption">❌ <code>pre-wrap</code>: aparece el salto… y también las líneas en blanco y la sangría de la plantilla</p>
<article class="review">
  <p class="author">Mariana, Puebla</p>
  <p class="comment is-pre-wrap">
    Llegó a tiempo y bien empaquetado.
    El pan sabe como el de mi abuela.
  </p>
</article>

<p class="caption">✅ <code>pre-line</code> y el texto pegado a las etiquetas: solo los saltos de Mariana</p>
<article class="review">
  <p class="author">Mariana, Puebla</p>
  <p class="comment is-pre-line">Llegó a tiempo y bien empaquetado.
El pan sabe como el de mi abuela.</p>
</article>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label,
.caption {
  margin: 8px 0 4px;
  font-size: 0.75rem;
}

.review {
  max-inline-size: 22rem;
  padding: 6px 10px;
  border-inline-start: 4px solid #4338ca;
  background: #e0e7ff;
}

.author {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
}

.comment {
  margin: 0;
  outline: 1px dashed #4338ca;
}

/* ❌ normal convierte el salto de línea del texto en un espacio: las dos frases
   quedan en el mismo párrafo. */
.is-normal {
  white-space: normal;
}

/* 🐛 pre-wrap conserva TODO el espacio en blanco que hay dentro del párrafo, y no
   distingue el del usuario del de la plantilla: el salto que va justo después de
   <p> se convierte en una línea vacía, los cuatro espacios de sangría de cada
   línea se ven, y el salto y los espacios de antes de </p> forman otra línea
   al final. (Con pre-line y la misma plantilla, la sangría desaparecería,
   pero la línea vacía del principio seguiría ahí.) */
.is-pre-wrap {
  white-space: pre-wrap;
}

/* ✅ pre-line junta los espacios y conserva los saltos. Y en la plantilla, el
   contenido va pegado a <p> y a </p>, sin sangría: <p>{{ texto }}</p>. */
.is-pre-line {
  white-space: pre-line;
}
```
