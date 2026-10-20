---
example_description: "Un índice con position: sticky dentro de una rejilla no se pega: la celda lo estira hasta el alto de la fila, que mide lo que el artículo; align-self: start lo arregla, igual que en flexbox"
example_tags: "css|grid|position|sticky|align-self|stretch|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">↕ Desplaza las dos guías. Solo en la segunda el índice se queda arriba.</p>

<p class="caption">❌ El índice (fondo verde) se estira hasta el final de la fila: no tiene dónde moverse</p>
<div class="scroller" tabindex="0" role="region" aria-label="Guía de abonado, versión con el error">
  <div class="layout">
    <nav class="toc" aria-label="En esta guía, versión con el error">
      <a href="#a-cuando">Cuándo</a>
      <a href="#a-cuanto">Cuánto</a>
      <a href="#a-errores">Errores</a>
    </nav>
    <article class="text">
      <h3 id="a-cuando">Cuándo abonar</h3>
      <p>En primavera y verano, cuando la planta está creciendo. En invierno casi no absorbe nutrientes y el abono se acumula en la tierra.</p>
      <h3 id="a-cuanto">Cuánto abono</h3>
      <p>La mitad de lo que dice el envase, cada dos o tres riegos. Es mejor quedarse corto: el exceso quema las raíces.</p>
      <h3 id="a-errores">Errores habituales</h3>
      <p>Abonar una planta recién trasplantada, abonar con la tierra seca y usar abono para exterior en plantas de interior.</p>
    </article>
  </div>
</div>

<p class="caption">✅ <code>align-self: start</code>: el índice mide lo suyo y se pega</p>
<div class="scroller is-fixed" tabindex="0" role="region" aria-label="Guía de abonado, versión corregida">
  <div class="layout">
    <nav class="toc" aria-label="En esta guía, versión corregida">
      <a href="#b-cuando">Cuándo</a>
      <a href="#b-cuanto">Cuánto</a>
      <a href="#b-errores">Errores</a>
    </nav>
    <article class="text">
      <h3 id="b-cuando">Cuándo abonar</h3>
      <p>En primavera y verano, cuando la planta está creciendo. En invierno casi no absorbe nutrientes y el abono se acumula en la tierra.</p>
      <h3 id="b-cuanto">Cuánto abono</h3>
      <p>La mitad de lo que dice el envase, cada dos o tres riegos. Es mejor quedarse corto: el exceso quema las raíces.</p>
      <h3 id="b-errores">Errores habituales</h3>
      <p>Abonar una planta recién trasplantada, abonar con la tierra seca y usar abono para exterior en plantas de interior.</p>
    </article>
  </div>
</div>
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
  font-size: 0.8rem;
}

.scroller {
  max-width: 400px;
  height: 130px;
  overflow-y: auto;
  border: 1px solid #94a3b8;
}

.scroller:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.layout {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  padding: 0 8px;
  outline: 2px dashed #0f766e;
  outline-offset: -2px;
  font-size: 0.8rem;
}

.toc {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 8px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
}

.toc a {
  color: #0f5c55;
}

.toc a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 1px;
}

.text h3 {
  margin: 8px 0 2px;
  font-size: 0.9rem;
}

.text p {
  margin: 0 0 6px;
}

/* El índice se queda arriba mientras se lee el artículo. */
.toc {
  position: sticky;
  top: 0;
}

/* 🐛 La promesa de los módulos de position y de flexbox. Un sticky nunca sale de su
   bloque contenedor, que en un elemento grid es su CELDA (su área). La fila mide
   lo que el artículo, y align-self: normal (stretch) estira el índice hasta llenar
   la celda: mide lo mismo que ella y no le queda recorrido. El fondo verde llega
   hasta abajo: se ve que está estirado. */

/* ✅ align-self: start: el índice mide lo que sus enlaces y tiene toda la celda para
   desplazarse dentro de ella. (align-items: start en .layout lo haría con todos.) */
.is-fixed .toc {
  align-self: start;
}
```
