---
example_description: "Un índice lateral con position: sticky no se pega dentro de una fila flex: align-items: stretch lo hace tan alto como el artículo y no tiene recorrido; align-self: flex-start lo arregla"
example_tags: "css|flexbox|position|sticky|align-self|stretch|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">↕ Desplaza las dos guías. Solo en la segunda el índice se queda arriba.</p>

<p class="caption">❌ El índice (fondo violeta) se estira hasta el final del artículo: no tiene dónde moverse</p>
<div class="scroller" tabindex="0" role="region" aria-label="Guía de riego, versión con el error">
  <div class="layout">
    <nav class="toc" aria-label="En esta guía, versión con el error">
      <a href="#a-cuando">Cuándo</a>
      <a href="#a-cuanto">Cuánto</a>
      <a href="#a-errores">Errores</a>
    </nav>
    <article class="text">
      <h3 id="a-cuando">Cuándo regar</h3>
      <p>Riega a primera hora de la mañana: la tierra absorbe el agua antes de que el sol la evapore y las hojas se secan durante el día.</p>
      <h3 id="a-cuanto">Cuánto regar</h3>
      <p>Mete un dedo en la tierra hasta la segunda falange. Si sale seco, riega hasta que el agua salga por los agujeros de la maceta.</p>
      <h3 id="a-errores">Errores habituales</h3>
      <p>Regar un poco cada día, dejar agua en el plato y usar macetas sin agujeros. Los tres acaban pudriendo las raíces.</p>
    </article>
  </div>
</div>

<p class="caption">✅ <code>align-self: flex-start</code>: el índice mide lo suyo y se pega</p>
<div class="scroller is-fixed" tabindex="0" role="region" aria-label="Guía de riego, versión corregida">
  <div class="layout">
    <nav class="toc" aria-label="En esta guía, versión corregida">
      <a href="#b-cuando">Cuándo</a>
      <a href="#b-cuanto">Cuánto</a>
      <a href="#b-errores">Errores</a>
    </nav>
    <article class="text">
      <h3 id="b-cuando">Cuándo regar</h3>
      <p>Riega a primera hora de la mañana: la tierra absorbe el agua antes de que el sol la evapore y las hojas se secan durante el día.</p>
      <h3 id="b-cuanto">Cuánto regar</h3>
      <p>Mete un dedo en la tierra hasta la segunda falange. Si sale seco, riega hasta que el agua salga por los agujeros de la maceta.</p>
      <h3 id="b-errores">Errores habituales</h3>
      <p>Regar un poco cada día, dejar agua en el plato y usar macetas sin agujeros. Los tres acaban pudriendo las raíces.</p>
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
  display: flex;
  gap: 12px;
  padding: 0 8px;
  outline: 2px dashed #7c3aed;
  outline-offset: -2px;
  font-size: 0.8rem;
}

.toc {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 4px;
  padding: 6px 8px;
  background: #ede9fe;
}

.toc a {
  color: #1d4ed8;
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

/* 🐛 La cuarta causa de un sticky que no se pega (las otras tres, en la lección de
   position). Un sticky nunca sale de su padre; aquí el padre es la fila .layout, que
   mide lo que el artículo. Pero align-items: stretch (el valor por defecto) estira el
   índice hasta el alto de la fila: mide lo mismo que su padre y no le queda recorrido.
   El fondo violeta llega hasta abajo: se ve que está estirado. */

/* ✅ align-self: flex-start: el índice mide lo que sus enlaces y tiene todo el alto
   del artículo para quedarse pegado arriba. (align-items: flex-start en .layout
   haría lo mismo con todos los hijos de la fila.) */
.is-fixed .toc {
  align-self: flex-start;
}
```
