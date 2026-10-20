---
example_description: "Un menú de acciones dentro de una tarjeta: overflow lo recorta y la tarjeta siguiente lo tapa; se arregla moviendo el recorte a un elemento interior y subiendo la tarjeta abierta"
example_tags: "css|position|z-index|isolation|overflow|has|desplegable"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<p class="label">❌ La tarjeta recorta su adorno con <code>overflow: hidden</code>: el menú queda cortado y la tarjeta siguiente lo tapa</p>
<ul class="files files--broken">
  <li class="file">
    <span class="file-art" aria-hidden="true"><span class="file-mark">PDF</span></span>
    <h3 class="file-name">Presupuesto-cocina.pdf</h3>
    <p class="file-meta">1,2 MB · ayer</p>
    <details class="actions" open>
      <summary aria-label="Acciones para Presupuesto-cocina.pdf">⋯</summary>
      <ul class="actions-menu"><li><a href="#">Descargar</a></li><li><a href="#">Renombrar</a></li><li><a href="#">Eliminar</a></li></ul>
    </details>
  </li>
  <li class="file">
    <span class="file-art" aria-hidden="true"><span class="file-mark">JPG</span></span>
    <h3 class="file-name">Plano-salon.jpg</h3>
    <p class="file-meta">3,4 MB · 12 de octubre</p>
    <details class="actions">
      <summary aria-label="Acciones para Plano-salon.jpg">⋯</summary>
      <ul class="actions-menu"><li><a href="#">Descargar</a></li><li><a href="#">Renombrar</a></li><li><a href="#">Eliminar</a></li></ul>
    </details>
  </li>
</ul>

<p class="label">✅ El recorte pasa a <code>.file-art</code> y la tarjeta abierta sube con <code>:has(details[open])</code></p>
<ul class="files files--fixed">
  <li class="file">
    <span class="file-art" aria-hidden="true"><span class="file-mark">PDF</span></span>
    <h3 class="file-name">Presupuesto-cocina.pdf</h3>
    <p class="file-meta">1,2 MB · ayer</p>
    <details class="actions" open>
      <summary aria-label="Acciones para Presupuesto-cocina.pdf">⋯</summary>
      <ul class="actions-menu"><li><a href="#">Descargar</a></li><li><a href="#">Renombrar</a></li><li><a href="#">Eliminar</a></li></ul>
    </details>
  </li>
  <li class="file">
    <span class="file-art" aria-hidden="true"><span class="file-mark">JPG</span></span>
    <h3 class="file-name">Plano-salon.jpg</h3>
    <p class="file-meta">3,4 MB · 12 de octubre</p>
    <details class="actions">
      <summary aria-label="Acciones para Plano-salon.jpg">⋯</summary>
      <ul class="actions-menu"><li><a href="#">Descargar</a></li><li><a href="#">Renombrar</a></li><li><a href="#">Eliminar</a></li></ul>
    </details>
  </li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  max-width: 26rem;
  margin: 0.5rem 0;
  font-size: 0.8rem;
}

.files {
  max-width: 26rem;
  margin: 0 0 1rem;
  padding: 0;
  list-style: none;
}

/* Cada tarjeta: referencia de sus piezas absolute (lección 4) y contexto de apilamiento
   propio (lección 5), para que su adorno con z-index: -1 quede detrás del texto
   pero delante de su fondo. */
.file {
  position: relative;
  isolation: isolate;
  margin-bottom: 0.5rem;
  padding: 0.6rem 3rem 0.6rem 0.9rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
}

.file-name {
  margin: 0;
  font-size: 0.95rem;
}

.file-meta {
  margin: 0;
  color: #475569;
  font-size: 0.8rem;
}

/* El adorno: unas letras enormes que sobresalen por la derecha y deben recortarse
   en las esquinas redondeadas de la tarjeta. */
.file-art {
  position: absolute;
  z-index: -1;
  inset: 0;
  border-radius: inherit;
}

.file-mark {
  position: absolute;
  right: -0.5rem;
  bottom: -1.2rem;
  color: #dbeafe;
  font-size: 4rem;
  font-weight: 800;
  line-height: 1;
}

/* El menú: el summary en la esquina y la lista justo debajo, alineada a la derecha. */
.actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.actions summary {
  width: 2rem;
  border-radius: 6px;
  font-size: 1.2rem;
  line-height: 2rem;
  text-align: center;
  list-style: none;                  /* sin el triángulo del marcador */
  cursor: pointer;
}

.actions summary:focus-visible,
.actions-menu a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.actions-menu {
  position: absolute;
  z-index: 1;
  top: 100%;
  right: 0;
  margin: 0.25rem 0 0;
  padding: 0.25rem 0;
  list-style: none;
  border: 1px solid #94a3b8;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgb(15 23 42 / 0.2);
}

.actions-menu a {
  display: block;
  padding: 0.2rem 1rem;
  color: #1d4ed8;
}

/* 🐛 overflow: hidden recorta el adorno… y también el menú, que sale por abajo.
   Además, cada tarjeta es un contexto de apilamiento con capa 0: la segunda va después
   en el HTML y se pinta encima de todo lo que haya en la primera, menú incluido. */
.files--broken .file {
  overflow: hidden;
}

/* ✅ 1. El recorte se mueve al elemento interior que lo necesita: el adorno. */
.files--fixed .file-art {
  overflow: hidden;
}

/* ✅ 2. La tarjeta con el menú abierto (o con el foco dentro) sube a la capa 1. */
.files--fixed .file:has(details[open]),
.files--fixed .file:focus-within {
  z-index: 1;
}
```
