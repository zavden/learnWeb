---
example_description: "Tarjetas en columnas con títulos de distinta longitud: cada tarjeta coloca su contenido por su cuenta y las descripciones no se alinean; con grid-template-rows: subgrid comparten las filas de la rejilla"
example_tags: "css|grid|subgrid|tarjetas|alineacion|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">❌ Cada tarjeta es su propia columna flex: los precios se alinean abajo, pero cada descripción empieza a una altura distinta</p>
<div class="cards">
  <article class="card">
    <h3>Monstera</h3>
    <p>Hojas grandes con cortes. Luz indirecta.</p>
    <p class="price">420 MXN</p>
  </article>
  <article class="card">
    <h3>Pothos dorado colgante</h3>
    <p>Crece rápido y aguanta poca luz.</p>
    <p class="price">160 MXN</p>
  </article>
  <article class="card">
    <h3>Helecho de Boston en cesta de mimbre</h3>
    <p>Le gusta la humedad: rocíalo cada mañana.</p>
    <p class="price">190 MXN</p>
  </article>
</div>

<p class="caption">✅ <code>grid-row: span 3</code> + <code>grid-template-rows: subgrid</code>: título, descripción y precio de todas las tarjetas comparten fila</p>
<div class="cards is-subgrid">
  <article class="card">
    <h3>Monstera</h3>
    <p>Hojas grandes con cortes. Luz indirecta.</p>
    <p class="price">420 MXN</p>
  </article>
  <article class="card">
    <h3>Pothos dorado colgante</h3>
    <p>Crece rápido y aguanta poca luz.</p>
    <p class="price">160 MXN</p>
  </article>
  <article class="card">
    <h3>Helecho de Boston en cesta de mimbre</h3>
    <p>Le gusta la humedad: rocíalo cada mañana.</p>
    <p class="price">190 MXN</p>
  </article>
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

.cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  max-width: 440px;
  outline: 2px dashed #0f766e;
  background: url(hatch.svg);
  font-size: 0.75rem;
}

.card {
  padding: 8px;
  border: 1px solid #0f766e;
  background: #ffffff;
}

.card > * {
  margin: 0;
}

/* Cada parte de la tarjeta, con el color del módulo: así se ven sus filas. */
.card h3 {
  background: #ccfbf1;
  font-size: 0.85rem;
}

.card p {
  background: #f1f5f9;
}

.card .price {
  background: #fef3c7;
  font-weight: bold;
}

/* 🐛 El patrón de flexbox: cada tarjeta, una columna, con el precio empujado abajo.
   Las tarjetas miden lo mismo (la fila de la rejilla las estira) y los precios
   quedan alineados, pero cada tarjeta coloca su título y su descripción por su
   cuenta: un título de tres líneas baja su descripción y las demás no se enteran. */
.card {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card .price {
  margin-top: auto;
}

/* ✅ subgrid. La tarjeta ocupa 3 filas de la rejilla de fuera (span 3) y, en vez
   de crear filas propias, usa ESAS filas para sus hijos. La fila 1 mide lo que el
   título más alto de las tres tarjetas, la 2 lo que la descripción más alta… y todo
   queda alineado. El gap entre filas se hereda de la rejilla de fuera, salvo que la
   subrejilla declare el suyo: aquí manda el gap: 4px de .card. */
.is-subgrid .card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid;
}
```
