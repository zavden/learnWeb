---
example_description: "Un escaparate de plantas: columnas con auto-fill y min(), tarjetas con subgrid para que nombres, precios y botones queden alineados entre columnas, y una insignia de descuento superpuesta a la foto"
example_tags: "css|grid|auto-fill|minmax|min|subgrid|capas|productos"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<p class="label">↔ Estrecha o ensancha la vista previa (o ábrela con ↗): cambian las columnas, pero en cada fila los nombres, los precios y los botones siguen alineados.</p>

<section aria-labelledby="shelf-title">
  <h2 id="shelf-title" class="shelf-title">Plantas de interior</h2>
  <ul class="products">
    <li class="product">
      <div class="media">
        <img src="plant-monstera.svg" alt="" width="240" height="240">
        <p class="badge">−20 %</p>
      </div>
      <h3>Monstera deliciosa</h3>
      <p class="price"><strong>336 MXN</strong> <s>420 MXN</s></p>
      <a class="button" href="/plantas/monstera-deliciosa" aria-label="Ver planta: Monstera deliciosa">Ver planta</a>
    </li>
    <li class="product">
      <div class="media">
        <img src="plant-cactus.svg" alt="" width="240" height="240">
      </div>
      <h3>Cactus candelabro con maceta de Tonalá pintada a mano</h3>
      <p class="price"><strong>290 MXN</strong></p>
      <a class="button" href="/plantas/cactus-candelabro" aria-label="Ver planta: Cactus candelabro">Ver planta</a>
    </li>
    <li class="product">
      <div class="media">
        <img src="plant-pothos.svg" alt="" width="240" height="240">
      </div>
      <h3>Pothos dorado</h3>
      <p class="price"><strong>160 MXN</strong></p>
      <a class="button" href="/plantas/pothos-dorado" aria-label="Ver planta: Pothos dorado">Ver planta</a>
    </li>
    <li class="product">
      <div class="media">
        <img src="plant-sansevieria.svg" alt="" width="240" height="240">
        <p class="badge">−15 %</p>
      </div>
      <h3>Sansevieria</h3>
      <p class="price"><strong>238 MXN</strong> <s>280 MXN</s></p>
      <a class="button" href="/plantas/sansevieria" aria-label="Ver planta: Sansevieria">Ver planta</a>
    </li>
    <li class="product">
      <div class="media">
        <img src="plant-calathea.svg" alt="" width="240" height="240">
      </div>
      <h3>Calathea medallón</h3>
      <p class="price"><strong>310 MXN</strong></p>
      <a class="button" href="/plantas/calathea-medallon" aria-label="Ver planta: Calathea medallón">Ver planta</a>
    </li>
  </ul>
</section>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Escaparate
   - Columnas: auto-fill con un mínimo de 9rem protegido con min(100%, …).
     auto-fill (no auto-fit): con dos resultados, las tarjetas no se estiran.
   - Tarjetas: cada una ocupa 4 filas de la rejilla (foto, nombre, precio y
     botón) y las usa con subgrid. Un nombre de tres líneas agranda su fila
     para todas las tarjetas de esa fila.
   - Foto: la insignia de descuento comparte celda con la imagen y se coloca en
     la esquina con justify-self y align-self.
   ────────────────────────────────────────────────────────────────────────── */
* {
  box-sizing: border-box;
}

body {
  margin: 8px;
  color: #1e293b;
  font-family: system-ui, sans-serif;
}

.label {
  margin: 0 0 8px;
  font-size: 0.8rem;
}

.shelf-title {
  margin: 0 0 8px;
  font-size: 1.15rem;
}

.products {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 9rem), 1fr));
  gap: 16px 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Dentro de la tarjeta, 6px entre filas: la subrejilla declara su propio gap. */
.product {
  display: grid;
  grid-row: span 4;
  grid-template-rows: subgrid;
  row-gap: 6px;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
}

.product > * {
  margin: 0;
}

/* Foto e insignia en la misma celda. */
.media {
  display: grid;
}

.media > * {
  grid-area: 1 / 1;
}

.media img {
  width: 100%;
  height: auto;
  border-radius: 6px;
}

.badge {
  justify-self: end;
  align-self: start;
  margin: 6px;
  padding: 1px 8px;
  border-radius: 999px;
  background: #9d174d;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: bold;
}

.product h3 {
  font-size: 0.95rem;
  line-height: 1.25;
}

/* Precio actual y anterior: dos tamaños, alineados por la línea base. */
.price {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 2px 8px;
}

.price strong {
  font-size: 1.1rem;
}

.price s {
  color: #475569;
  font-size: 0.8rem;
}

/* El botón, del ancho de su texto y al fondo de su fila. */
.button {
  justify-self: start;
  align-self: end;
  padding: 4px 12px;
  border-radius: 999px;
  background: #166534;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: bold;
  text-decoration: none;
}

.button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```
