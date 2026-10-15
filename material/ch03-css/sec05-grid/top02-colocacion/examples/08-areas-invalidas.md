---
example_description: "Si un área de grid-template-areas no es un rectángulo (o las filas tienen distinto número de celdas), la declaración entera se descarta y todos los elementos se amontonan en una celda implícita"
example_tags: "css|grid|grid-template-areas|areas|declaracion-invalida|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">❌ Una errata en la segunda fila (<code>"title meta"</code> en lugar de <code>"photo meta"</code>): <code>title</code> deja de ser un rectángulo y la declaración entera se descarta</p>
<article class="plant is-broken">
  <img class="photo" src="plant-monstera.svg" alt="Una monstera en una maceta de barro" width="240" height="240">
  <h2 class="title">Monstera deliciosa</h2>
  <p class="meta">Interior · luz indirecta</p>
  <p class="care">Riega cuando la tierra esté seca a 3 cm.</p>
</article>
<p class="caption">↑ Las dos columnas rayadas se quedan vacías: los <strong>cuatro</strong> elementos están apilados en la misma celda implícita (columna 4, fila 2). Sin ayuda solo verías el último del HTML, que tapa a los demás; aquí cada capa lleva un desplazamiento y un fondo ámbar para que se vean.</p>

<p class="caption">✅ Las mismas áreas, bien escritas</p>
<article class="plant is-fixed">
  <img class="photo" src="plant-monstera.svg" alt="Una monstera en una maceta de barro" width="240" height="240">
  <h2 class="title">Monstera deliciosa</h2>
  <p class="meta">Interior · luz indirecta</p>
  <p class="care">Riega cuando la tierra esté seca a 3 cm.</p>
</article>
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

.plant {
  display: grid;
  grid-template-columns: 5rem 1fr;
  gap: 6px 12px;
  max-width: 400px;
  padding: 8px;
  outline: 2px dashed #0f766e;
  background: url(hatch.svg);
  font-size: 0.75rem;
}

.plant > * {
  margin: 0;
  padding: 4px 6px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
}

.photo { grid-area: photo; box-sizing: border-box; width: 100%; height: auto; }
.title { grid-area: title; font-size: 0.95rem; }
.meta  { grid-area: meta; }
.care  { grid-area: care; }

/* 🐛 Con la errata, «title» ocupa la celda de arriba a la derecha y la de en medio
   a la izquierda: no es un rectángulo. Eso hace INVÁLIDA toda la declaración (igual
   que si una fila tuviera tres palabras y otra dos). El navegador la descarta como
   cualquier declaración inválida (módulo de cascada), sin avisar: DevTools la
   muestra tachada, con un triángulo de advertencia, en Styles.
   Sin áreas, cada grid-area: photo, title… busca líneas que no existen y cae en la
   primera línea implícita (el ejemplo anterior): TODOS los elementos acaban en la
   misma celda, fuera de las dos columnas, uno encima de otro.
   (Si antes hubiera otra declaración válida de grid-template-areas, ganaría esa:
   el error sería más difícil de ver, pero igual de real.) */
.is-broken {
  grid-template-areas:
    "photo title"
    "title meta"
    "care  care";
}

/* Solo para la demostración: en la versión rota, cada elemento se queda a su
   tamaño (no se estira), la foto mide 4rem y cada capa se desplaza un poco más que
   la anterior. Así se ve que las cuatro están en la misma celda, una encima de otra.
   Quita estas reglas y solo verás el párrafo de los cuidados. */
.is-broken > * {
  align-self: start;
  justify-self: start;
  border-color: #b45309;
  background: rgb(254 243 199 / 0.92);
}

.is-broken .photo {
  width: 4rem;
}

.is-broken > :nth-child(2) { margin: 18px 0 0 18px; }
.is-broken > :nth-child(3) { margin: 36px 0 0 36px; }
.is-broken > :nth-child(4) { margin: 54px 0 0 54px; }

/* ✅ Cada nombre forma un rectángulo y todas las filas tienen dos celdas. */
.is-fixed {
  grid-template-areas:
    "photo title"
    "photo meta"
    "care  care";
}
```
