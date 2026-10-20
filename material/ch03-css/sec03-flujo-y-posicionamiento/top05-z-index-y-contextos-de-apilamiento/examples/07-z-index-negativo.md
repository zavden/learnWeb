---
example_description: "Un número decorativo con z-index: -1 desaparece detrás del fondo de su tarjeta; con isolation: isolate en la tarjeta queda entre el fondo y el texto"
example_tags: "css|z-index|isolation|stacking-context|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<div class="column">
  <p class="caption">❌ El «1» gigante (<code>z-index: -1</code>) se va detrás del fondo de la tarjeta: solo asoma por arriba</p>
  <article class="step">
    <span class="step-number" aria-hidden="true">1</span>
    <h3>Elige la ruta</h3>
    <p>Consulta el desnivel y la previsión del tiempo antes de salir.</p>
  </article>
</div>

<div class="column">
  <p class="caption">✅ Con <code>isolation: isolate</code> en la tarjeta, el número queda detrás del texto, pero delante del fondo</p>
  <article class="step is-isolated">
    <span class="step-number" aria-hidden="true">1</span>
    <h3>Elige la ruta</h3>
    <p>Consulta el desnivel y la previsión del tiempo antes de salir.</p>
  </article>
</div>
```

# CSS

```css
body {
  background: #e2e8f0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  min-height: 3.9em;
  margin: 0 0 20px;
  font-size: 0.75rem;
}

.column {
  display: inline-block;
  vertical-align: top;
  width: calc(50% - 12px);
  margin-right: 8px;
}

.step {
  position: relative;               /* referencia del número */
  padding: 10px 12px;
  border-radius: 8px;
  background: #ffffff;
}

.step h3,
.step p {
  margin: 0 0 4px;
  font-size: 0.9rem;
}

/* El número es decoración: va detrás del texto (z-index: -1). */
.step-number {
  position: absolute;
  z-index: -1;
  top: -28px;
  right: 10px;
  color: #93c5fd;
  font-size: 5.5rem;
  font-weight: 800;
  line-height: 1;
}

/* 🐛 Un z-index negativo se pinta justo encima del fondo de su CONTEXTO DE APILAMIENTO
   y debajo de todo lo demás de ese contexto. La tarjeta no crea ningún contexto
   (relative sin z-index), así que el contexto del número es la página entera: queda
   detrás del fondo blanco de la tarjeta, que es una caja posicionada. Solo se ve la
   parte que sobresale por arriba. */

/* ✅ isolation: isolate crea un contexto de apilamiento sin efectos secundarios.
   Ahora el -1 es «detrás de lo de esta tarjeta, pero delante de su fondo». */
.is-isolated {
  isolation: isolate;
}
```
