---
example_description: "En un contenedor grid con altura, las filas auto se estiran para llenarlo (align-content: normal se comporta como stretch): la cabecera crece; grid-template-rows: auto auto 1fr o align-content: start lo arreglan"
example_tags: "css|grid|align-content|stretch|grid-template-rows|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<div class="cases">
  <div class="case">
    <p class="caption">❌ Sin filas definidas: las tres se estiran</p>
    <section class="panel" aria-label="Mis listas, versión con el error">
      <h3>Mis listas</h3>
      <input type="search" aria-label="Buscar lista" placeholder="Buscar…">
      <ul>
        <li>Compra semanal</li>
        <li>Plantas por regar</li>
        <li>Regalos</li>
      </ul>
    </section>
  </div>

  <div class="case">
    <p class="caption">✅ <code>grid-template-rows: auto auto 1fr</code></p>
    <section class="panel is-fixed" aria-label="Mis listas, versión corregida">
      <h3>Mis listas</h3>
      <input type="search" aria-label="Buscar lista" placeholder="Buscar…">
      <ul>
        <li>Compra semanal</li>
        <li>Plantas por regar</li>
        <li>Regalos</li>
      </ul>
    </section>
  </div>
</div>
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

.cases {
  display: flex;
  gap: 12px;
  max-width: 440px;
}

.case {
  flex: 1;
  min-width: 0;
}

/* Un panel lateral de alto fijo: cabecera, buscador y lista. */
.panel {
  display: grid;
  gap: 6px;
  height: 260px;
  padding: 6px;
  outline: 2px dashed #0f766e;
  background: url(hatch.svg);
  font-size: 0.8rem;
}

.panel > * {
  margin: 0;
  border: 1px solid #0f766e;
  background: #ccfbf1;
}

.panel h3 {
  padding: 4px 6px;
  font-size: 0.9rem;
}

.panel input {
  box-sizing: border-box;
  padding: 4px;
  background: #ffffff;
  font: inherit;
}

.panel ul {
  padding: 4px 6px 4px 1.5em;
  background: #ffffff;
}

/* 🐛 No hay grid-template-rows: las tres filas son implícitas y miden auto. Juntas
   no llegan a la mitad de los 260px. align-content reparte el sobrante entre las
   filas, y su valor inicial, normal, se comporta como stretch: cada fila auto crece
   lo mismo, y como los elementos también se estiran, la cabecera y el buscador se
   hacen altos. (Por lo mismo, dos hijos con place-items: center quedan separados:
   cada uno, centrado en su fila estirada.) */

/* ✅ Di qué fila se queda con el espacio: la de la lista. Con una pista fr, las auto
   ya no se estiran. (align-content: start también vale: las filas a su medida,
   arriba, y el sobrante abajo.) */
.is-fixed {
  grid-template-rows: auto auto 1fr;
}
```
