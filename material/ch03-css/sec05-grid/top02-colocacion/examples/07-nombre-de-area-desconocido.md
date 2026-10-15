---
example_description: "Un grid-area con un nombre que no existe (tip en lugar de tips) no da error: el elemento sale de la rejilla a una fila y una columna implícitas, y su área se queda vacía"
example_tags: "css|grid|grid-area|areas|grid-implicito|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">❌ <code>grid-area: tip</code>, pero el área se llama <code>tips</code>: el consejo se va abajo a la derecha, fuera de la ficha, y aplasta las columnas</p>
<article class="plant is-typo">
  <img class="photo" src="plant-monstera.svg" alt="Una monstera en una maceta de barro" width="240" height="240">
  <h2 class="title">Monstera deliciosa</h2>
  <p class="meta">Interior · luz indirecta</p>
  <p class="care">Riega cuando la tierra esté seca a 3 cm.</p>
  <p class="tips"><strong>Consejo:</strong> limpia las hojas con un paño húmedo.</p>
</article>

<p class="caption">✅ <code>grid-area: tips</code></p>
<article class="plant">
  <img class="photo" src="plant-monstera.svg" alt="Una monstera en una maceta de barro" width="240" height="240">
  <h2 class="title">Monstera deliciosa</h2>
  <p class="meta">Interior · luz indirecta</p>
  <p class="care">Riega cuando la tierra esté seca a 3 cm.</p>
  <p class="tips"><strong>Consejo:</strong> limpia las hojas con un paño húmedo.</p>
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
  grid-template-areas:
    "photo title"
    "photo meta"
    "care  tips";
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
.tips  { grid-area: tips; }

/* 🐛 No hay ningún área «tip». Para el navegador, grid-area: tip significa «entre
   las líneas llamadas tip-start y tip-end»; como no existen, la regla dice que
   TODAS las líneas implícitas se llaman así. El elemento empieza en la primera
   línea implícita después de la rejilla, en las dos direcciones:
   - columnas: la rejilla tiene las líneas 1-3 → empieza en la 4: se crean dos
     columnas implícitas (la 3, vacía, y la 4, la suya);
   - filas: líneas 1-4 → empieza en la 5: dos filas implícitas (la 4, vacía).
   Las columnas implícitas miden según su contenido y le quitan sitio a la 1fr.
   No hay ningún error en la consola: solo un área «tips» vacía (la celda rayada). */
.is-typo .tips {
  grid-area: tip;
  border-color: #b45309;
  background: #fef3c7;
}
```
